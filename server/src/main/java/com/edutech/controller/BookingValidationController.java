package com.edutech.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.edutech.service.BookingValidationService;

@RestController
@RequestMapping("/api/booking")
@CrossOrigin(origins = "*")
public class BookingValidationController {

    // Injecting service
    @Autowired
    private BookingValidationService bookingValidationService;

    // Check if a specific list of seats is available for a flight
    @PostMapping("/check-seat-availability")
    public ResponseEntity<Boolean> checkSeatAvailability(
            @RequestParam Long flightId,
            @RequestBody List<String> seatNumbers) {
        return ResponseEntity.ok(bookingValidationService.areSeatsAvailable(flightId, seatNumbers));
    }

    // Check if there are enough seats available for a given traveler count
    @GetMapping("/validate-seats")
    public ResponseEntity<Boolean> validateSeats(
            @RequestParam Long flightId,
            @RequestParam int travelerCount) {
        return ResponseEntity.ok(bookingValidationService.hasEnoughAvailableSeats(flightId, travelerCount));
    }
}