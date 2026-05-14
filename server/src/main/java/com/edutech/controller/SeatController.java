package com.edutech.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.edutech.entity.Seat;
import com.edutech.service.SeatService;

@RestController
@RequestMapping("/api/seats")
@CrossOrigin(origins = "*")
public class SeatController {

    // Injecting service
    @Autowired
    private SeatService seatService;

    // Get all seats for a specific flight (used by the seat map UI)
    @GetMapping("/flights/{flightId}/seats")
    public List<Seat> getSeatsByFlight(@PathVariable Long flightId) {
        return seatService.getSeatsByFlight(flightId);
    }
}