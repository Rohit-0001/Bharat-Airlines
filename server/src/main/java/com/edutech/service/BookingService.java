package com.edutech.service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import javax.persistence.EntityNotFoundException;
import javax.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import com.edutech.entity.Bookings;
import com.edutech.entity.Flights;
import com.edutech.entity.Seat;
import com.edutech.entity.User;
import com.edutech.repository.BookingRepository;
import com.edutech.repository.FlightsRepository;
import com.edutech.repository.SeatRepository;
import com.edutech.repository.UserRepository;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.Rectangle;
import com.lowagie.text.FontFactory;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private FlightsRepository flightsRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SeatRepository seatRepository;

    @Autowired
    private FlightScheduleService flightScheduleService;

    @Transactional
    public void bookSeats(Long flightId, List<String> seatNumbers, Long userId) {
        bookSeats(flightId, seatNumbers, userId, null, null);
    }

    @Transactional
    public void bookSeats(Long flightId, List<String> seatNumbers, Long userId,
                          Double totalPrice, Integer infantCount) {
        if (seatNumbers == null || seatNumbers.isEmpty()) {
            throw new IllegalStateException("At least one seat must be selected.");
        }

        List<String> normalizedSeats = seatNumbers.stream()
                .map(s -> s.trim().toUpperCase())
                .distinct()
                .collect(Collectors.toList());

        if (normalizedSeats.size() != seatNumbers.size()) {
            throw new IllegalStateException("Duplicate seat numbers are not allowed.");
        }

        Flights flight = flightsRepository.findById(flightId)
                .orElseThrow(() -> new EntityNotFoundException("Flight not found"));

        if ("CANCELLED".equalsIgnoreCase(flight.getStatus())) {
            throw new IllegalStateException("This flight has been cancelled and cannot be booked.");
        }

        if (!flightScheduleService.isFlightBookableForPassengers(flightId, flight.getDepartureDate())) {
            throw new IllegalStateException(
                    "This flight is not yet confirmed. Booking opens after a pilot accepts the schedule.");
        }

        List<Seat> seats = seatRepository.findByFlightIdAndSeatNumberInForUpdate(flightId, normalizedSeats);

        if (seats.size() != normalizedSeats.size()) {
            throw new IllegalStateException("One or more selected seats were not found for this flight.");
        }

        for (Seat seat : seats) {
            if (!seat.isAvailable() || seat.isBlocked()) {
                throw new IllegalStateException("One or more selected seats are no longer available.");
            }
        }

        for (Seat seat : seats) {
            seat.setAvailable(false);
        }
        seatRepository.saveAll(seats);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        int seatCount = normalizedSeats.size();
        if (flight.getAvailable_seats() < seatCount) {
            throw new IllegalStateException("Not enough seats available on this flight.");
        }

        flight.setAvailable_seats(flight.getAvailable_seats() - seatCount);
        flightsRepository.save(flight);

        Bookings booking = new Bookings();
        booking.setFlight(flight);
        booking.setUser(user);
        booking.setSeatNumbers(String.join(",", normalizedSeats));
        booking.setBookingDate(LocalDateTime.now());
        booking.setStatus("CONFIRMED");
        booking.setPaymentStatus(Bookings.PaymentStatus.SUCCESS);
        booking.setPnr(UUID.randomUUID().toString().substring(0, 8).toUpperCase());

        int infants = infantCount != null ? Math.max(0, infantCount) : 0;
        booking.setInfantCount(infants);

        double resolvedTotal;
        if (totalPrice != null && totalPrice > 0) {
            resolvedTotal = totalPrice;
        } else {
            resolvedTotal = calculateBookingTotal(flight, seats, infants);
        }
        booking.setTotalPrice(resolvedTotal);

        bookingRepository.save(booking);
    }

    private double calculateBookingTotal(Flights flight, List<Seat> seats, int infantCount) {
        double flightPrice = flight.getPrice();
        double total = 0;
        for (Seat seat : seats) {
            total += seat.getPrice() > 0 ? seat.getPrice() : flightPrice;
        }
        total += infantCount * flightPrice * 0.5;
        return total;
    }

    public List<Bookings> getBookingsByUser(Long userId) {
        return bookingRepository.findByUserId(userId);
    }

    public List<Bookings> getBookingListUser() {
        return bookingRepository.findAll();
    }

    @Transactional
    public void updateBookingStatus(Long id, String status) {
        Bookings booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + id));

        if ("CANCELLED".equalsIgnoreCase(status)) {
            markCancelled(booking);
            return;
        }

        booking.setStatus(status);
        bookingRepository.save(booking);
    }

    @Transactional
    public void cancelBooking(Long id, Long requestingUserId, boolean isAdmin) {
        Bookings booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + id));

        if (!isAdmin && !booking.getUser().getId().equals(requestingUserId)) {
            throw new AccessDeniedException("You are not authorized to cancel this booking.");
        }

        markCancelled(booking);
    }

    private void markCancelled(Bookings booking) {
        if ("CANCELLED".equalsIgnoreCase(booking.getStatus())) {
            throw new IllegalStateException("This booking has already been cancelled.");
        }

        if (booking.getSeatNumbers() != null && !booking.getSeatNumbers().isEmpty()) {
            releaseSeats(booking);
        }

        booking.setStatus("CANCELLED");
        bookingRepository.save(booking);
    }

    private void releaseSeats(Bookings booking) {
        List<String> seatNums = java.util.Arrays.stream(booking.getSeatNumbers().split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(String::toUpperCase)
                .collect(Collectors.toList());

        List<Seat> seats = seatRepository.findByFlightIdAndSeatNumberIn(
                booking.getFlight().getId(), seatNums);
        for (Seat seat : seats) {
            seat.setAvailable(true);
        }
        seatRepository.saveAll(seats);

        Flights flight = booking.getFlight();
        flight.setAvailable_seats(flight.getAvailable_seats() + seatNums.size());
        flightsRepository.save(flight);
    }

    public byte[] generateTicketPdf(Long bookingId, Long requestingUserId, boolean isAdmin) {
        Bookings booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new EntityNotFoundException("Booking not found"));

        if (!isAdmin && !booking.getUser().getId().equals(requestingUserId)) {
            throw new AccessDeniedException("You are not authorized to download this ticket.");
        }

        if ("CANCELLED".equalsIgnoreCase(booking.getStatus())) {
            throw new IllegalStateException("Ticket download is not available for cancelled bookings.");
        }

        Flights flight = booking.getFlight();
        String seatNumbersStr = booking.getSeatNumbers();
        int seatCount = (seatNumbersStr != null && !seatNumbersStr.trim().isEmpty())
                ? seatNumbersStr.split(",").length
                : 1;
        int infants = booking.getInfantCount() != null ? booking.getInfantCount() : 0;
        double totalPrice;
        if (booking.getTotalPrice() != null && booking.getTotalPrice() > 0) {
            totalPrice = booking.getTotalPrice();
        } else {
            totalPrice = flight.getPrice() * seatCount + infants * flight.getPrice() * 0.5;
        }

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 36, 36, 36, 36);
        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Brand palette
            Color navy = new Color(10, 22, 40);
            Color navyLight = new Color(18, 34, 68);
            Color gold = new Color(201, 162, 39);
            Color goldBright = new Color(240, 208, 112);
            Color surface = new Color(248, 249, 252);
            Color borderColor = new Color(208, 216, 232);
            Color successGreen = new Color(26, 122, 78);
            Color successBg = new Color(230, 245, 237);
            Color muted = new Color(107, 127, 153);
            Color footerGrey = new Color(130, 138, 150);
            Color white = Color.WHITE;
            float cellPad = 10f;
            float sectionGap = 12f;

            // Consistent type scale (Helvetica only)
            Font fontBrand = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, Font.NORMAL, white);
            Font fontTagline = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, Font.NORMAL, goldBright);
            Font fontPnrLabel = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, Font.NORMAL, gold);
            Font fontPnr = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20, Font.NORMAL, goldBright);
            Font fontBookedOn = FontFactory.getFont(FontFactory.HELVETICA, 9, Font.NORMAL, white);
            Font fontSectionBar = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Font.NORMAL, white);
            Font fontCaps = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, Font.NORMAL, muted);
            Font fontMeta = FontFactory.getFont(FontFactory.HELVETICA, 9, Font.NORMAL, muted);
            Font fontBody = FontFactory.getFont(FontFactory.HELVETICA, 10, Font.NORMAL, navy);
            Font fontValue = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, Font.NORMAL, navy);
            Font fontCity = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 15, Font.NORMAL, navy);
            Font fontArrow = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, Font.NORMAL, gold);
            Font fontTableHead = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Font.NORMAL, white);
            Font fontTableBody = FontFactory.getFont(FontFactory.HELVETICA, 10, Font.NORMAL, navy);
            Font fontTableBold = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Font.NORMAL, navy);
            Font fontTotalLabel = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Font.NORMAL, successGreen);
            Font fontTotalAmt = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, Font.NORMAL, successGreen);
            Font fontStatus = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Font.NORMAL, successGreen);
            Font fontFooter = FontFactory.getFont(FontFactory.HELVETICA, 8, Font.NORMAL, footerGrey);
            Font fontTear = FontFactory.getFont(FontFactory.HELVETICA, 9, Font.NORMAL, gold);

            DateTimeFormatter dateFmt = DateTimeFormatter.ofPattern("EEE, dd MMM yyyy");
            DateTimeFormatter timeFmt = DateTimeFormatter.ofPattern("HH:mm");
            DateTimeFormatter bookingDateFmt = DateTimeFormatter.ofPattern("dd MMM yyyy");

            String bookingDateText = booking.getBookingDate() != null
                    ? booking.getBookingDate().format(bookingDateFmt)
                    : "\u2014";
            String departureDateText = flight.getDepartureDate() != null
                    ? flight.getDepartureDate().format(dateFmt)
                    : "\u2014";
            String departureTimeText = flight.getDepartureTime() != null
                    ? flight.getDepartureTime().format(timeFmt)
                    : "\u2014";
            String arrivalTimeText = flight.getArrivalTime() != null
                    ? flight.getArrivalTime().format(timeFmt)
                    : "\u2014";
            String seatNumbersDisplay = seatNumbersStr != null && !seatNumbersStr.trim().isEmpty()
                    ? seatNumbersStr.replace(" ", "").toUpperCase()
                    : "\u2014";
            String bookingStatusText = booking.getStatus() != null ? booking.getStatus() : "\u2014";
            String paymentStatusText = booking.getPaymentStatus() != null
                    ? booking.getPaymentStatus().name()
                    : "\u2014";

            // Fare split from stored total (no per-seat price multiplication)
            double seatChargesAmount = totalPrice;
            double infantChargesAmount = 0;
            if (seatNumbersStr != null && !seatNumbersStr.trim().isEmpty()) {
                List<String> seatNums = java.util.Arrays.stream(seatNumbersStr.split(","))
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .map(String::toUpperCase)
                        .collect(Collectors.toList());
                List<Seat> bookedSeats = seatRepository.findByFlightIdAndSeatNumberIn(
                        flight.getId(), seatNums);
                if (!bookedSeats.isEmpty()) {
                    seatChargesAmount = bookedSeats.stream()
                            .mapToDouble(s -> s.getPrice() > 0 ? s.getPrice() : flight.getPrice())
                            .sum();
                }
            }
            if (infants > 0) {
                infantChargesAmount = Math.max(0, totalPrice - seatChargesAmount);
                if (infantChargesAmount <= 0) {
                    infantChargesAmount = totalPrice;
                    seatChargesAmount = 0;
                }
            } else {
                seatChargesAmount = totalPrice;
            }

            String seatDetailText = seatCount + (seatCount == 1 ? " seat" : " seats")
                    + " \u00b7 variable pricing";
            String infantDetailText = infants > 0
                    ? infants + (infants == 1 ? " infant" : " infants")
                    : "\u2014";

            // 1 — Header banner
            PdfPTable headerBanner = new PdfPTable(new float[] { 62f, 38f });
            headerBanner.setWidthPercentage(100);
            headerBanner.setSpacingAfter(0);

            PdfPCell brandCell = new PdfPCell();
            brandCell.setBackgroundColor(navy);
            brandCell.setBorder(Rectangle.NO_BORDER);
            brandCell.setPadding(18);
            brandCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            Paragraph brandLine = new Paragraph("\u2708  Bharat Airlines", fontBrand);
            brandLine.setSpacingAfter(5);
            Paragraph tagline = new Paragraph("BOARDING PASS / E-TICKET", fontTagline);
            brandCell.addElement(brandLine);
            brandCell.addElement(tagline);
            headerBanner.addCell(brandCell);

            PdfPCell pnrCell = new PdfPCell();
            pnrCell.setBackgroundColor(navyLight);
            pnrCell.setBorder(Rectangle.NO_BORDER);
            pnrCell.setPadding(18);
            pnrCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            pnrCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            Paragraph pnrLabel = new Paragraph("PNR", fontPnrLabel);
            pnrLabel.setAlignment(Element.ALIGN_RIGHT);
            pnrLabel.setSpacingAfter(2);
            Paragraph pnrValue = new Paragraph(
                    booking.getPnr() != null ? booking.getPnr() : "\u2014", fontPnr);
            pnrValue.setAlignment(Element.ALIGN_RIGHT);
            pnrValue.setSpacingAfter(4);
            Paragraph bookedOn = new Paragraph("Booked " + bookingDateText, fontBookedOn);
            bookedOn.setAlignment(Element.ALIGN_RIGHT);
            pnrCell.addElement(pnrLabel);
            pnrCell.addElement(pnrValue);
            pnrCell.addElement(bookedOn);
            headerBanner.addCell(pnrCell);
            document.add(headerBanner);

            // 2 — Gold divider
            PdfPTable goldDivider = new PdfPTable(1);
            goldDivider.setWidthPercentage(100);
            goldDivider.setSpacingAfter(sectionGap);
            PdfPCell goldBar = new PdfPCell(new Phrase(" "));
            goldBar.setFixedHeight(4f);
            goldBar.setBackgroundColor(gold);
            goldBar.setBorder(Rectangle.NO_BORDER);
            goldDivider.addCell(goldBar);
            document.add(goldDivider);

            // 3 — Route panel
            PdfPTable routePanel = new PdfPTable(new float[] { 38f, 24f, 38f });
            routePanel.setWidthPercentage(100);
            routePanel.setSpacingAfter(sectionGap);

            PdfPCell depCell = new PdfPCell();
            depCell.setBackgroundColor(surface);
            depCell.setBorderColor(borderColor);
            depCell.setBorderWidth(0.75f);
            depCell.setPadding(cellPad + 2);
            Paragraph depLbl = new Paragraph("DEPARTURE", fontCaps);
            depLbl.setSpacingAfter(4);
            Paragraph depCity = new Paragraph(
                    flight.getSource() != null ? flight.getSource() : "\u2014", fontCity);
            depCity.setSpacingAfter(6);
            Paragraph depMeta = new Paragraph(departureTimeText + "\n" + departureDateText, fontMeta);
            depCell.addElement(depLbl);
            depCell.addElement(depCity);
            depCell.addElement(depMeta);
            routePanel.addCell(depCell);

            PdfPCell midCell = new PdfPCell();
            midCell.setBackgroundColor(surface);
            midCell.setBorderColor(borderColor);
            midCell.setBorderWidth(0.75f);
            midCell.setPadding(cellPad);
            midCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            midCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            Paragraph arrow = new Paragraph("\u2192", fontArrow);
            arrow.setAlignment(Element.ALIGN_CENTER);
            arrow.setSpacingAfter(4);
            Paragraph flightNum = new Paragraph(
                    flight.getFlight_number() != null ? flight.getFlight_number() : "\u2014", fontValue);
            flightNum.setAlignment(Element.ALIGN_CENTER);
            flightNum.setSpacingAfter(2);
            Paragraph flightName = new Paragraph(
                    flight.getFlight_name() != null ? flight.getFlight_name() : "\u2014", fontMeta);
            flightName.setAlignment(Element.ALIGN_CENTER);
            midCell.addElement(arrow);
            midCell.addElement(flightNum);
            midCell.addElement(flightName);
            routePanel.addCell(midCell);

            PdfPCell arrCell = new PdfPCell();
            arrCell.setBackgroundColor(surface);
            arrCell.setBorderColor(borderColor);
            arrCell.setBorderWidth(0.75f);
            arrCell.setPadding(cellPad + 2);
            arrCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            Paragraph arrLbl = new Paragraph("ARRIVAL", fontCaps);
            arrLbl.setAlignment(Element.ALIGN_RIGHT);
            arrLbl.setSpacingAfter(4);
            Paragraph arrCity = new Paragraph(
                    flight.getDestination() != null ? flight.getDestination() : "\u2014", fontCity);
            arrCity.setAlignment(Element.ALIGN_RIGHT);
            arrCity.setSpacingAfter(6);
            Paragraph arrMeta = new Paragraph("Arrives " + arrivalTimeText, fontMeta);
            arrMeta.setAlignment(Element.ALIGN_RIGHT);
            arrCell.addElement(arrLbl);
            arrCell.addElement(arrCity);
            arrCell.addElement(arrMeta);
            routePanel.addCell(arrCell);
            document.add(routePanel);

            // 4 — Passenger details
            PdfPTable passengerSection = new PdfPTable(1);
            passengerSection.setWidthPercentage(100);
            passengerSection.setSpacingAfter(0);
            PdfPCell passengerHeader = new PdfPCell(
                    new Phrase("PASSENGER AND BOOKING DETAILS", fontSectionBar));
            passengerHeader.setBackgroundColor(navy);
            passengerHeader.setBorder(Rectangle.NO_BORDER);
            passengerHeader.setPadding(cellPad);
            passengerHeader.setPaddingLeft(12);
            passengerSection.addCell(passengerHeader);

            PdfPTable passengerGrid = new PdfPTable(new float[] { 25f, 25f, 25f, 25f });
            passengerGrid.setWidthPercentage(100);
            String[][] passengerFields = {
                    { "PASSENGER NAME", booking.getUser().getUsername() },
                    { "SEAT NUMBERS", seatNumbersDisplay },
                    { "SEATS BOOKED", String.valueOf(seatCount) },
                    { "INFANT COUNT", String.valueOf(infants) }
            };
            for (String[] field : passengerFields) {
                PdfPCell detailCell = new PdfPCell();
                detailCell.setBackgroundColor(surface);
                detailCell.setBorderColor(borderColor);
                detailCell.setBorderWidth(0.75f);
                detailCell.setPadding(cellPad);
                Paragraph lbl = new Paragraph(field[0], fontCaps);
                lbl.setSpacingAfter(4);
                Paragraph val = new Paragraph(field[1] != null ? field[1] : "\u2014", fontValue);
                detailCell.addElement(lbl);
                detailCell.addElement(val);
                passengerGrid.addCell(detailCell);
            }
            PdfPCell gridWrapper = new PdfPCell(passengerGrid);
            gridWrapper.setBorder(Rectangle.NO_BORDER);
            gridWrapper.setPadding(0);
            passengerSection.addCell(gridWrapper);
            passengerSection.setSpacingAfter(sectionGap);
            document.add(passengerSection);

            // 5 — Fare summary (amounts from booking total, not seat price × count)
            PdfPTable fareTable = new PdfPTable(new float[] { 34f, 41f, 25f });
            fareTable.setWidthPercentage(100);
            fareTable.setSpacingAfter(sectionGap);

            String[] fareHeaders = { "DESCRIPTION", "DETAILS", "AMOUNT" };
            for (String header : fareHeaders) {
                PdfPCell headerCell = new PdfPCell(new Phrase(header, fontTableHead));
                headerCell.setBackgroundColor(navy);
                headerCell.setBorder(Rectangle.NO_BORDER);
                headerCell.setPadding(cellPad);
                headerCell.setHorizontalAlignment(
                        "AMOUNT".equals(header) ? Element.ALIGN_RIGHT : Element.ALIGN_LEFT);
                fareTable.addCell(headerCell);
            }

            PdfPCell seatDescCell = new PdfPCell(new Phrase("Seat charges", fontTableBody));
            seatDescCell.setBackgroundColor(surface);
            seatDescCell.setBorderColor(borderColor);
            seatDescCell.setBorderWidth(0.75f);
            seatDescCell.setPadding(cellPad);
            PdfPCell seatDetailCell = new PdfPCell(new Phrase(seatDetailText, fontTableBody));
            seatDetailCell.setBackgroundColor(surface);
            seatDetailCell.setBorderColor(borderColor);
            seatDetailCell.setBorderWidth(0.75f);
            seatDetailCell.setPadding(cellPad);
            PdfPCell seatAmtCell = new PdfPCell(
                    new Phrase(String.format("\u20b9%,.2f", seatChargesAmount), fontTableBold));
            seatAmtCell.setBackgroundColor(surface);
            seatAmtCell.setBorderColor(borderColor);
            seatAmtCell.setBorderWidth(0.75f);
            seatAmtCell.setPadding(cellPad);
            seatAmtCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            fareTable.addCell(seatDescCell);
            fareTable.addCell(seatDetailCell);
            fareTable.addCell(seatAmtCell);

            PdfPCell infantDescCell = new PdfPCell(new Phrase("Infant charges", fontTableBody));
            infantDescCell.setBackgroundColor(surface);
            infantDescCell.setBorderColor(borderColor);
            infantDescCell.setBorderWidth(0.75f);
            infantDescCell.setPadding(cellPad);
            PdfPCell infantDetailCell = new PdfPCell(new Phrase(
                    infants > 0 ? infantDetailText : "\u2014", fontTableBody));
            infantDetailCell.setBackgroundColor(surface);
            infantDetailCell.setBorderColor(borderColor);
            infantDetailCell.setBorderWidth(0.75f);
            infantDetailCell.setPadding(cellPad);
            PdfPCell infantAmtCell = new PdfPCell(new Phrase(
                    infants > 0
                            ? String.format("\u20b9%,.2f", infantChargesAmount)
                            : "\u20b90.00",
                    fontTableBold));
            infantAmtCell.setBackgroundColor(surface);
            infantAmtCell.setBorderColor(borderColor);
            infantAmtCell.setBorderWidth(0.75f);
            infantAmtCell.setPadding(cellPad);
            infantAmtCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            fareTable.addCell(infantDescCell);
            fareTable.addCell(infantDetailCell);
            fareTable.addCell(infantAmtCell);

            PdfPCell totalLabel = new PdfPCell(new Phrase("TOTAL CHARGED", fontTotalLabel));
            totalLabel.setColspan(2);
            totalLabel.setBackgroundColor(successBg);
            totalLabel.setBorderColor(borderColor);
            totalLabel.setBorderWidth(0.75f);
            totalLabel.setPadding(cellPad + 2);
            PdfPCell totalValue = new PdfPCell(
                    new Phrase(String.format("\u20b9%,.2f", totalPrice), fontTotalAmt));
            totalValue.setBackgroundColor(successBg);
            totalValue.setBorderColor(borderColor);
            totalValue.setBorderWidth(0.75f);
            totalValue.setPadding(cellPad + 2);
            totalValue.setHorizontalAlignment(Element.ALIGN_RIGHT);
            fareTable.addCell(totalLabel);
            fareTable.addCell(totalValue);
            document.add(fareTable);

            // 6 — Status row
            PdfPTable statusRow = new PdfPTable(new float[] { 50f, 50f });
            statusRow.setWidthPercentage(100);
            statusRow.setSpacingAfter(sectionGap + 2);

            PdfPCell bookingStatusCell = new PdfPCell();
            bookingStatusCell.setBackgroundColor(successBg);
            bookingStatusCell.setBorderColor(borderColor);
            bookingStatusCell.setBorderWidth(0.75f);
            bookingStatusCell.setPadding(cellPad);
            bookingStatusCell.addElement(new Paragraph("BOOKING STATUS", fontCaps));
            bookingStatusCell.addElement(new Paragraph(
                    "\u2713  " + bookingStatusText, fontStatus));
            statusRow.addCell(bookingStatusCell);

            PdfPCell paymentStatusCell = new PdfPCell();
            paymentStatusCell.setBackgroundColor(successBg);
            paymentStatusCell.setBorderColor(borderColor);
            paymentStatusCell.setBorderWidth(0.75f);
            paymentStatusCell.setPadding(cellPad);
            paymentStatusCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            paymentStatusCell.addElement(new Paragraph("PAYMENT STATUS", fontCaps));
            Paragraph payVal = new Paragraph("\u2713  " + paymentStatusText, fontStatus);
            payVal.setAlignment(Element.ALIGN_RIGHT);
            paymentStatusCell.addElement(payVal);
            statusRow.addCell(paymentStatusCell);
            document.add(statusRow);

            // 7 — Tear line and footer
            Paragraph tearLine = new Paragraph(
                    " - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - ",
                    fontTear);
            tearLine.setAlignment(Element.ALIGN_CENTER);
            tearLine.setSpacingAfter(8);
            document.add(tearLine);

            Paragraph footer = new Paragraph(
                    "This is an electronically generated ticket. No signature required.\n"
                            + "Bharat Airlines \u2014 Fly with Pride, Fly with Trust.",
                    fontFooter);
            footer.setAlignment(Element.ALIGN_CENTER);
            document.add(footer);

            document.close();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF", e);
        }
        return out.toByteArray();
    }
}