// package com.edutech.service;

// import java.io.ByteArrayOutputStream;
// import java.time.LocalDateTime;
// import java.util.List;
// import java.util.UUID;

// import javax.persistence.EntityNotFoundException;
// import javax.transaction.Transactional;

// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.stereotype.Service;

// import com.edutech.entity.Bookings;
// import com.edutech.entity.Flights;
// import com.edutech.entity.Seat;
// import com.edutech.entity.User;
// import com.edutech.repository.BookingRepository;
// import com.edutech.repository.FlightsRepository;
// import com.edutech.repository.SeatRepository;
// import com.edutech.repository.UserRepository;
// import com.lowagie.text.Document;
// import com.lowagie.text.Paragraph;
// import com.lowagie.text.pdf.PdfWriter;

// @Service
// public class BookingService {

//     @Autowired
//     private BookingRepository bookingRepository;

//     @Autowired
//     private FlightsRepository flightsRepository;

//     @Autowired
//     private UserRepository userRepository;

//     @Autowired
//     private SeatRepository seatRepository;

//     public Bookings bookFlight(Long userId, Long flightId, String seatNumbers) {
//         User user = userRepository.findById(userId)
//                 .orElseThrow(() -> new EntityNotFoundException("User not found"));
//         Flights flight = flightsRepository.findById(flightId)
//                 .orElseThrow(() -> new EntityNotFoundException("Flight not found"));

//         Bookings booking = new Bookings();
//         booking.setUser(user);
//         booking.setFlight(flight);
//         booking.setSeatNumbers(seatNumbers);
//         booking.setBookingDate(LocalDateTime.now());
//         booking.setStatus("CONFIRMED");
//         booking.setPaymentStatus(Bookings.PaymentStatus.SUCCESS);
//         booking.setPnr(UUID.randomUUID().toString());

//         int seatCount = seatNumbers != null && !seatNumbers.isEmpty()
//                 ? seatNumbers.split(",").length
//                 : 1;
//         flight.setAvailable_seats(flight.getAvailable_seats() - seatCount);
//         flightsRepository.save(flight);

//         return bookingRepository.save(booking);
//     }

//     @Transactional
//     public void bookSeats(Long flightId, List<String> seatNumbers, Long userId) {
//         List<Seat> seats = seatRepository.findByFlightIdAndSeatNumberIn(flightId, seatNumbers);

//         if (seats.size() != seatNumbers.size()) {
//             throw new RuntimeException("One or more selected seats were not found for this flight.");
//         }

//         for (Seat seat : seats) {
//             if (!seat.isAvailable()) {
//                 throw new RuntimeException("One or more selected seats are already booked.");
//             }
//         }

//         for (Seat seat : seats) {
//             seat.setAvailable(false);
//         }
//         seatRepository.saveAll(seats);

//         Flights flight = flightsRepository.findById(flightId)
//                 .orElseThrow(() -> new EntityNotFoundException("Flight not found"));
//         User user = userRepository.findById(userId)
//                 .orElseThrow(() -> new EntityNotFoundException("User not found"));

//         flight.setAvailable_seats(flight.getAvailable_seats() - seatNumbers.size());
//         flightsRepository.save(flight);

//         Bookings booking = new Bookings();
//         booking.setFlight(flight);
//         booking.setUser(user);
//         booking.setSeatNumbers(String.join(",", seatNumbers));
//         booking.setBookingDate(LocalDateTime.now());
//         booking.setStatus("CONFIRMED");
//         booking.setPaymentStatus(Bookings.PaymentStatus.SUCCESS);
//         booking.setPnr(UUID.randomUUID().toString());

//         bookingRepository.save(booking);
//     }

//     public List<Bookings> getBookingsByUser(Long userId) {
//         return bookingRepository.findByUserId(userId);
//     }

//     public List<Bookings> getBookingListUser() {
//         return bookingRepository.findAll();
//     }

//     @Transactional
//     public void updateBookingStatus(Long id, String status) {
//         Bookings booking = bookingRepository.findById(id)
//                 .orElseThrow(() -> new RuntimeException("Booking not found with id: " + id));
//         booking.setStatus(status);
//         bookingRepository.save(booking);

//         if ("CANCELLED".equals(status) && booking.getSeatNumbers() != null && !booking.getSeatNumbers().isEmpty()) {
//             List<String> seatNums = java.util.Arrays.asList(booking.getSeatNumbers().split(","));
//             List<Seat> seats = seatRepository.findByFlightIdAndSeatNumberIn(
//                     booking.getFlight().getId(), seatNums);
//             for (Seat seat : seats) {
//                 seat.setAvailable(true);
//             }
//             seatRepository.saveAll(seats);

//             Flights flight = booking.getFlight();
//             flight.setAvailable_seats(flight.getAvailable_seats() + seatNums.size());
//             flightsRepository.save(flight);
//         }
//     }

//     @Transactional
//     public void cancelBooking(Long id) {
//         Bookings booking = bookingRepository.findById(id)
//                 .orElseThrow(() -> new RuntimeException("Booking not found with id: " + id));

//         if (booking.getSeatNumbers() != null && !booking.getSeatNumbers().isEmpty()) {
//             List<String> seatNums = java.util.Arrays.asList(booking.getSeatNumbers().split(","));
//             List<Seat> seats = seatRepository.findByFlightIdAndSeatNumberIn(
//                     booking.getFlight().getId(), seatNums);
//             for (Seat seat : seats) {
//                 seat.setAvailable(true);
//             }
//             seatRepository.saveAll(seats);

//             Flights flight = booking.getFlight();
//             flight.setAvailable_seats(flight.getAvailable_seats() + seatNums.size());
//             flightsRepository.save(flight);
//         }

//         bookingRepository.deleteById(id);
//     }

//     public byte[] generateTicketPdf(Long bookingId) {
//         Bookings booking = bookingRepository.findById(bookingId)
//                 .orElseThrow(() -> new EntityNotFoundException("Booking not found"));

//         ByteArrayOutputStream out = new ByteArrayOutputStream();
//         Document document = new Document();
//         try {
//             PdfWriter.getInstance(document, out);
//             document.open();
//             Flights flight = booking.getFlight();

//             String seatNumbersStr = booking.getSeatNumbers();
//             int seatCount = (seatNumbersStr != null && !seatNumbersStr.trim().isEmpty())
//                     ? seatNumbersStr.split(",").length
//                     : 1;

//             double totalPrice = flight.getPrice() * seatCount;

//             document.add(new Paragraph("Bharat Airlines - Boarding Pass"));
//             document.add(new Paragraph("Flight: " + flight.getFlight_name()));
//             document.add(new Paragraph("PNR: " + booking.getPnr()));
//             document.add(new Paragraph("Passenger: " + booking.getUser().getUsername()));
//             document.add(new Paragraph("Flight Number: " + flight.getFlight_number()));
//             document.add(new Paragraph("Seat(s): " + booking.getSeatNumbers()));
//             document.add(new Paragraph("From: " + flight.getSource()));
//             document.add(new Paragraph("To: " + flight.getDestination()));
//             document.add(new Paragraph("Date: " + flight.getDepartureDate()));
//             document.add(new Paragraph("Departure: " + flight.getDepartureTime()));
//             document.add(new Paragraph("Arrival: " + flight.getArrivalTime()));
//             document.add(new Paragraph("Price per Seat: ₹" + flight.getPrice()));
//             document.add(new Paragraph("Seats Booked: " + seatCount));
//             document.add(new Paragraph("Total Price: ₹" + totalPrice));
//             document.add(new Paragraph("Booking Status: " + booking.getStatus()));
//             document.add(new Paragraph("Payment Status: " + booking.getPaymentStatus()));
//             document.close();
//         } catch (Exception e) {
//             throw new RuntimeException("Failed to generate PDF", e);
//         }
//         return out.toByteArray();
//     }
// }

// package com.edutech.service;

// import java.io.ByteArrayOutputStream;
// import java.time.LocalDateTime;
// import java.util.List;
// import java.util.UUID;
// import java.util.stream.Collectors;

// import javax.persistence.EntityNotFoundException;
// import javax.transaction.Transactional;

// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.security.access.AccessDeniedException;
// import org.springframework.stereotype.Service;

// import com.edutech.entity.Bookings;
// import com.edutech.entity.Flights;
// import com.edutech.entity.Seat;
// import com.edutech.entity.User;
// import com.edutech.repository.BookingRepository;
// import com.edutech.repository.FlightsRepository;
// import com.edutech.repository.SeatRepository;
// import com.edutech.repository.UserRepository;
// import com.lowagie.text.Document;
// import com.lowagie.text.Paragraph;
// import com.lowagie.text.pdf.PdfWriter;

// @Service
// public class BookingService {

//     @Autowired
//     private BookingRepository bookingRepository;

//     @Autowired
//     private FlightsRepository flightsRepository;

//     @Autowired
//     private UserRepository userRepository;

//     @Autowired
//     private SeatRepository seatRepository;

//     @Autowired
//     private FlightScheduleService flightScheduleService;

//     @Transactional
//     public void bookSeats(Long flightId, List<String> seatNumbers, Long userId) {
//         if (seatNumbers == null || seatNumbers.isEmpty()) {
//             throw new IllegalStateException("At least one seat must be selected.");
//         }

//         List<String> normalizedSeats = seatNumbers.stream()
//                 .map(s -> s.trim().toUpperCase())
//                 .distinct()
//                 .collect(Collectors.toList());

//         if (normalizedSeats.size() != seatNumbers.size()) {
//             throw new IllegalStateException("Duplicate seat numbers are not allowed.");
//         }

//         Flights flight = flightsRepository.findById(flightId)
//                 .orElseThrow(() -> new EntityNotFoundException("Flight not found"));

//         if ("CANCELLED".equalsIgnoreCase(flight.getStatus())) {
//             throw new IllegalStateException("This flight has been cancelled and cannot be booked.");
//         }

//         if (!flightScheduleService.isFlightBookableForPassengers(flightId, flight.getDepartureDate())) {
//             throw new IllegalStateException(
//                     "This flight is not yet confirmed. Booking opens after a pilot accepts the schedule.");
//         }

//         List<Seat> seats = seatRepository.findByFlightIdAndSeatNumberInForUpdate(flightId, normalizedSeats);

//         if (seats.size() != normalizedSeats.size()) {
//             throw new IllegalStateException("One or more selected seats were not found for this flight.");
//         }

//         for (Seat seat : seats) {
//             if (!seat.isAvailable() || seat.isBlocked()) {
//                 throw new IllegalStateException("One or more selected seats are no longer available.");
//             }
//         }

//         for (Seat seat : seats) {
//             seat.setAvailable(false);
//         }
//         seatRepository.saveAll(seats);

//         User user = userRepository.findById(userId)
//                 .orElseThrow(() -> new EntityNotFoundException("User not found"));

//         int seatCount = normalizedSeats.size();
//         if (flight.getAvailable_seats() < seatCount) {
//             throw new IllegalStateException("Not enough seats available on this flight.");
//         }

//         flight.setAvailable_seats(flight.getAvailable_seats() - seatCount);
//         flightsRepository.save(flight);

//         Bookings booking = new Bookings();
//         booking.setFlight(flight);
//         booking.setUser(user);
//         booking.setSeatNumbers(String.join(",", normalizedSeats));
//         booking.setBookingDate(LocalDateTime.now());
//         booking.setStatus("CONFIRMED");
//         booking.setPaymentStatus(Bookings.PaymentStatus.SUCCESS);
//         booking.setPnr(UUID.randomUUID().toString().substring(0, 8).toUpperCase());

//         bookingRepository.save(booking);
//     }

//     public List<Bookings> getBookingsByUser(Long userId) {
//         return bookingRepository.findByUserId(userId);
//     }

//     public List<Bookings> getBookingListUser() {
//         return bookingRepository.findAll();
//     }

//     @Transactional
//     public void updateBookingStatus(Long id, String status) {
//         Bookings booking = bookingRepository.findById(id)
//                 .orElseThrow(() -> new RuntimeException("Booking not found with id: " + id));
//         booking.setStatus(status);
//         bookingRepository.save(booking);

//         if ("CANCELLED".equals(status) && booking.getSeatNumbers() != null && !booking.getSeatNumbers().isEmpty()) {
//             releaseSeats(booking);
//         }
//     }

//     @Transactional
//     public void cancelBooking(Long id, Long requestingUserId, boolean isAdmin) {
//         Bookings booking = bookingRepository.findById(id)
//                 .orElseThrow(() -> new RuntimeException("Booking not found with id: " + id));

//         if (!isAdmin && !booking.getUser().getId().equals(requestingUserId)) {
//             throw new AccessDeniedException("You are not authorized to cancel this booking.");
//         }

//         if (booking.getSeatNumbers() != null && !booking.getSeatNumbers().isEmpty()) {
//             releaseSeats(booking);
//         }

//         bookingRepository.deleteById(id);
//     }

//     private void releaseSeats(Bookings booking) {
//         List<String> seatNums = java.util.Arrays.stream(booking.getSeatNumbers().split(","))
//                 .map(String::trim)
//                 .filter(s -> !s.isEmpty())
//                 .map(String::toUpperCase)
//                 .collect(Collectors.toList());

//         List<Seat> seats = seatRepository.findByFlightIdAndSeatNumberIn(
//                 booking.getFlight().getId(), seatNums);
//         for (Seat seat : seats) {
//             seat.setAvailable(true);
//         }
//         seatRepository.saveAll(seats);

//         Flights flight = booking.getFlight();
//         flight.setAvailable_seats(flight.getAvailable_seats() + seatNums.size());
//         flightsRepository.save(flight);
//     }

//     public byte[] generateTicketPdf(Long bookingId, Long requestingUserId, boolean isAdmin) {
//         Bookings booking = bookingRepository.findById(bookingId)
//                 .orElseThrow(() -> new EntityNotFoundException("Booking not found"));

//         if (!isAdmin && !booking.getUser().getId().equals(requestingUserId)) {
//             throw new AccessDeniedException("You are not authorized to download this ticket.");
//         }

//         ByteArrayOutputStream out = new ByteArrayOutputStream();
//         Document document = new Document();
//         try {
//             PdfWriter.getInstance(document, out);
//             document.open();
//             Flights flight = booking.getFlight();

//             String seatNumbersStr = booking.getSeatNumbers();
//             int seatCount = (seatNumbersStr != null && !seatNumbersStr.trim().isEmpty())
//                     ? seatNumbersStr.split(",").length
//                     : 1;

//             double totalPrice = flight.getPrice() * seatCount;

//             document.add(new Paragraph("Bharat Airlines - Boarding Pass"));
//             document.add(new Paragraph("Flight: " + flight.getFlight_name()));
//             document.add(new Paragraph("PNR: " + booking.getPnr()));
//             document.add(new Paragraph("Passenger: " + booking.getUser().getUsername()));
//             document.add(new Paragraph("Flight Number: " + flight.getFlight_number()));
//             document.add(new Paragraph("Seat(s): " + booking.getSeatNumbers()));
//             document.add(new Paragraph("From: " + flight.getSource()));
//             document.add(new Paragraph("To: " + flight.getDestination()));
//             document.add(new Paragraph("Date: " + flight.getDepartureDate()));
//             document.add(new Paragraph("Departure: " + flight.getDepartureTime()));
//             document.add(new Paragraph("Arrival: " + flight.getArrivalTime()));
//             document.add(new Paragraph("Price per Seat: ₹" + flight.getPrice()));
//             document.add(new Paragraph("Seats Booked: " + seatCount));
//             document.add(new Paragraph("Total Price: ₹" + totalPrice));
//             document.add(new Paragraph("Booking Status: " + booking.getStatus()));
//             document.add(new Paragraph("Payment Status: " + booking.getPaymentStatus()));
//             document.close();
//         } catch (Exception e) {
//             throw new RuntimeException("Failed to generate PDF", e);
//         }
//         return out.toByteArray();
//     }
// }
package com.edutech.service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
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
import com.lowagie.text.Paragraph;
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

        bookingRepository.save(booking);
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

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document();
        try {
            PdfWriter.getInstance(document, out);
            document.open();
            Flights flight = booking.getFlight();

            String seatNumbersStr = booking.getSeatNumbers();
            int seatCount = (seatNumbersStr != null && !seatNumbersStr.trim().isEmpty())
                    ? seatNumbersStr.split(",").length
                    : 1;

            double totalPrice = flight.getPrice() * seatCount;

            document.add(new Paragraph("Bharat Airlines - Boarding Pass"));
            document.add(new Paragraph("Flight: " + flight.getFlight_name()));
            document.add(new Paragraph("PNR: " + booking.getPnr()));
            document.add(new Paragraph("Passenger: " + booking.getUser().getUsername()));
            document.add(new Paragraph("Flight Number: " + flight.getFlight_number()));
            document.add(new Paragraph("Seat(s): " + booking.getSeatNumbers()));
            document.add(new Paragraph("From: " + flight.getSource()));
            document.add(new Paragraph("To: " + flight.getDestination()));
            document.add(new Paragraph("Date: " + flight.getDepartureDate()));
            document.add(new Paragraph("Departure: " + flight.getDepartureTime()));
            document.add(new Paragraph("Arrival: " + flight.getArrivalTime()));
            document.add(new Paragraph("Price per Seat: ₹" + flight.getPrice()));
            document.add(new Paragraph("Seats Booked: " + seatCount));
            document.add(new Paragraph("Total Price: ₹" + totalPrice));
            document.add(new Paragraph("Booking Status: " + booking.getStatus()));
            document.add(new Paragraph("Payment Status: " + booking.getPaymentStatus()));
            document.close();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF", e);
        }
        return out.toByteArray();
    }
}