package com.edutech.service;

import java.time.LocalDate;
import java.util.List;

import javax.persistence.EntityNotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.edutech.entity.Flights;
import com.edutech.repository.FlightsRepository;

@Service
public class FlightsService {

    @Autowired
    private FlightsRepository flightsRepository;

    public List<Flights> getAllFlights() {
        return flightsRepository.findAll();
    }

    public Flights getFlightById(Long id) {
        return flightsRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Flight not found with id: " + id));
    }

    // FIX: Past-date validation restored (was commented out)
    public Flights saveFlight(Flights flight) {
        if (flight.getDepartureDate() != null) {
            LocalDate today = LocalDate.now();
            if (flight.getDepartureDate().isBefore(today)) {
                throw new IllegalStateException("Departure date cannot be in the past.");
            }
        }
        return flightsRepository.save(flight);
    }

    public Flights updateFlight(Long id, Flights updated) {
        Flights existing = getFlightById(id);
        existing.setFlight_number(updated.getFlight_number());
        existing.setFlight_name(updated.getFlight_name());
        existing.setSource(updated.getSource());
        existing.setDestination(updated.getDestination());
        existing.setDepartureDate(updated.getDepartureDate());
        existing.setDepartureTime(updated.getDepartureTime());
        existing.setArrivalTime(updated.getArrivalTime());
        existing.setTotalSeats(updated.getTotalSeats());
        existing.setAvailable_seats(updated.getAvailable_seats());
        existing.setPrice(updated.getPrice());
        existing.setStatus(updated.getStatus());
        return flightsRepository.save(existing);
    }

    public void updateFlightStatus(Long id, String status) {
        Flights flight = getFlightById(id);
        flight.setStatus(status);
        flightsRepository.save(flight);
    }

    public void deleteFlight(Long id) {
        flightsRepository.deleteById(id);
    }

    public List<Flights> searchFlights(String source, String destination, LocalDate date) {
        return flightsRepository.findBySourceAndDestinationAndDepartureDate(source, destination, date);
    }

    public List<Flights> getSuggestionsForSource() {
        return flightsRepository.findAll();
    }

    public List<Flights> getSuggestionsForDestionation() {
        return flightsRepository.findAll();
    }

    public boolean isSeatsAvailable(Long flightId, int travelerCount) {
        Flights flight = getFlightById(flightId);
        return flight.getAvailable_seats() >= travelerCount;
    }
}