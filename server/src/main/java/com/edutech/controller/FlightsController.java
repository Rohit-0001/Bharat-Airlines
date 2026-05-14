package com.edutech.controller;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.edutech.entity.Flights;
import com.edutech.service.FlightsService;

@RestController
@RequestMapping("/api/flights")
@CrossOrigin(origins = "*")
public class FlightsController {

    //Injecting service 
    @Autowired
    private FlightsService flightsService;


    // Admin: Create a new flight
    @PostMapping
    public ResponseEntity<Flights> createFlight(@Valid @RequestBody Flights flight) {
        // Link each seat back to this flight before saving
        if (flight.getSeats() != null) {
            flight.getSeats().forEach(seat -> seat.setFlight(flight));
        }
        Flights saved = flightsService.saveFlight(flight);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // All roles: Get all flights
    @GetMapping
    public ResponseEntity<List<Flights>> getAllFlights() {
        return ResponseEntity.ok(flightsService.getAllFlights());
    }

    // Admin: Update an existing flight
    @PutMapping("/{id}")
    public ResponseEntity<Flights> updateFlight(@PathVariable Long id,
                                                @Valid @RequestBody Flights flight) {
        return ResponseEntity.ok(flightsService.updateFlight(id, flight));
    }

    // Admin: Update flight status (SCHEDULED / DELAYED / CANCELLED)
    @PutMapping("/{id}/status")
    public ResponseEntity<String> updateFlightStatus(@PathVariable Long id,
                                                     @RequestBody Map<String, String> body) {
        flightsService.updateFlightStatus(id, body.get("status"));
        return ResponseEntity.ok("Flight status updated");
    }

    // Passenger: Search flights by source, destination, and date
    @GetMapping("/search")
    public ResponseEntity<List<Flights>> searchFlights(
            @RequestParam String source,
            @RequestParam String destination,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(flightsService.searchFlights(source, destination, date));
    }

    // Passenger: Get source city suggestions for autocomplete
    @GetMapping("/source/suggest")
    public ResponseEntity<List<Flights>> suggestSource() {
        return ResponseEntity.ok(flightsService.getSuggestionsForSource());
    }

    // Passenger: Get destination city suggestions for autocomplete
    @GetMapping("/destination/suggest")
    public ResponseEntity<List<Flights>> suggestDestination() {
        return ResponseEntity.ok(flightsService.getSuggestionsForDestionation());
    }

    // Passenger: Check if enough seats are available for a given traveler count
    @GetMapping("/{flightId}/check-availability")
    public ResponseEntity<Map<String, Boolean>> checkAvailability(
            @PathVariable Long flightId,
            @RequestParam int travelerCount) {
        boolean available = flightsService.isSeatsAvailable(flightId, travelerCount);
        return ResponseEntity.ok(Collections.singletonMap("available", available));
    }
}