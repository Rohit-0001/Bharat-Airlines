package com.edutech.service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import javax.persistence.EntityNotFoundException;
import javax.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
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

    // Book a single flight — simple version used internally
    public Bookings bookFlight(Long userId, Long flightId, String seatNumbers) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        Flights flight = flightsRepository.findById(flightId)
                .orElseThrow(() -> new EntityNotFoundException("Flight not found"));

        Bookings booking = new Bookings();
        booking.setUser(user);
        booking.setFlight(flight);
        booking.setSeatNumbers(seatNumbers);
        booking.setBookingDate(LocalDateTime.now());
        booking.setStatus("CONFIRMED");
        booking.setPaymentStatus(Bookings.PaymentStatus.SUCCESS);
        booking.setPnr(UUID.randomUUID().toString());

        // Decrement available seats
        flight.setAvailable_seats(flight.getAvailable_seats() - 1);
        flightsRepository.save(flight);

        return bookingRepository.save(booking);
    }

    // Book multiple seats — marks each seat as unavailable and saves the booking
    @Transactional
    public void bookSeats(Long flightId, List<String> seatNumbers, Long userId) {
        // Find the actual seat entities for this flight
        List<Seat> seats = seatRepository.findByFlightIdAndSeatNumberIn(flightId, seatNumbers);

        // Check if any found seat is already booked
        for (Seat seat : seats) {
            if (!seat.isAvailable()) {
                throw new RuntimeException("One or more selected seats are already booked.");
            }
        }

        // Mark found seats as unavailable
        for (Seat seat : seats) {
            seat.setAvailable(false);
        }
        seatRepository.saveAll(seats);

        // Fetch flight and user
        Flights flight = flightsRepository.findById(flightId)
                .orElseThrow(() -> new EntityNotFoundException("Flight not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        // Save the booking record
        Bookings booking = new Bookings();
        booking.setFlight(flight);
        booking.setUser(user);
        booking.setSeatNumbers(String.join(",", seatNumbers));
        booking.setBookingDate(LocalDateTime.now());
        booking.setStatus("CONFIRMED");
        booking.setPaymentStatus(Bookings.PaymentStatus.SUCCESS);
        booking.setPnr(UUID.randomUUID().toString());

        bookingRepository.save(booking);
    }

    // Get all bookings for a specific passenger
    public List<Bookings> getBookingsByUser(Long userId) {
        return bookingRepository.findByUserId(userId);
    }

    // Get all bookings across all passengers (Admin)
    public List<Bookings> getBookingListUser() {
        return bookingRepository.findAll();
    }

    // Update the status of a specific booking
    public void updateBookingStatus(Long id, String status) {
        Bookings booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + id));
        booking.setStatus(status);
        bookingRepository.save(booking);
    }

    // Delete a booking
    public void cancelBooking(Long id) {
        bookingRepository.deleteById(id);
    }

    // Generate a simple PDF ticket for a booking
    public byte[] generateTicketPdf(Long bookingId) {
        Bookings booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new EntityNotFoundException("Booking not found"));

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document();
        try {
            PdfWriter.getInstance(document, out);
            document.open();
            document.add(new Paragraph("Air India - Flight Ticket"));
            document.add(new Paragraph("PNR: " + booking.getPnr()));
            document.add(new Paragraph("Flight Number: " + booking.getFlight().getFlight_number()));
            document.add(new Paragraph("Seat Numbers: " + booking.getSeatNumbers()));
            document.add(new Paragraph("Source: " + booking.getFlight().getSource()));
            document.add(new Paragraph("Destination: " + booking.getFlight().getDestination()));
            document.add(new Paragraph("Departure Time: " + booking.getFlight().getDepartureTime()));
            document.add(new Paragraph("Arrival Time: " + booking.getFlight().getArrivalTime()));
            document.add(new Paragraph("Departure Date: " + booking.getFlight().getDepartureDate()));
            document.add(new Paragraph("Price: " + booking.getFlight().getPrice()));
            document.add(new Paragraph("Booking Status: " + booking.getStatus()));
            document.add(new Paragraph("Payment Status: " + booking.getPaymentStatus()));
            document.close();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF", e);
        }
        return out.toByteArray();
    }
}