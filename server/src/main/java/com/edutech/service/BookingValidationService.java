package com.edutech.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.edutech.repository.SeatRepository;

@Service
public class BookingValidationService {

    @Autowired
    private SeatRepository seatRepository;

    // Returns true if there are at least 'requiredCount' available seats on this flight
    public boolean hasEnoughAvailableSeats(Long flightId, int requiredCount) {
        int available = seatRepository.countAvailableSeatsByFlightId(flightId);
        return available >= requiredCount;
    }

    // Returns true if ALL the given seat numbers are still available
    public boolean areSeatsAvailable(Long flightId, List<String> seatNumbers) {
        int unavailable = seatRepository.countUnavailableSeats(flightId, seatNumbers);
        return unavailable == 0;
    }
}