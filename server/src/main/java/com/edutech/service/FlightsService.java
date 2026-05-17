// package com.edutech.service;

// import java.time.LocalDate;
// import java.util.List;

// import javax.persistence.EntityNotFoundException;

// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.stereotype.Service;

// import com.edutech.entity.Flights;
// import com.edutech.repository.FlightsRepository;

// @Service
// public class FlightsService {

//     @Autowired
//     private FlightsRepository flightsRepository;

//     public List<Flights> getAllFlights() {
//         return flightsRepository.findAll();
//     }

//     public Flights getFlightById(Long id) {
//         return flightsRepository.findById(id)
//                 .orElseThrow(() -> new EntityNotFoundException("Flight not found with id: " + id));
//     }

//     // FIX: Past-date validation restored (was commented out)
//     public Flights saveFlight(Flights flight) {
//         if (flight.getDepartureDate() != null) {
//             LocalDate today = LocalDate.now();
//             if (flight.getDepartureDate().isBefore(today)) {
//                 throw new IllegalStateException("Departure date cannot be in the past.");
//             }
//         }
//         return flightsRepository.save(flight);
//     }

//     public Flights updateFlight(Long id, Flights updated) {
//         Flights existing = getFlightById(id);
//         existing.setFlight_number(updated.getFlight_number());
//         existing.setFlight_name(updated.getFlight_name());
//         existing.setSource(updated.getSource());
//         existing.setDestination(updated.getDestination());
//         existing.setDepartureDate(updated.getDepartureDate());
//         existing.setDepartureTime(updated.getDepartureTime());
//         existing.setArrivalTime(updated.getArrivalTime());
//         existing.setTotalSeats(updated.getTotalSeats());
//         existing.setAvailable_seats(updated.getAvailable_seats());
//         existing.setPrice(updated.getPrice());
//         existing.setStatus(updated.getStatus());
//         return flightsRepository.save(existing);
//     }

//     public void updateFlightStatus(Long id, String status) {
//         Flights flight = getFlightById(id);
//         flight.setStatus(status);
//         flightsRepository.save(flight);
//     }

//     public void deleteFlight(Long id) {
//         flightsRepository.deleteById(id);
//     }

//     public List<Flights> searchFlights(String source, String destination, LocalDate date) {
//         return flightsRepository.findBySourceAndDestinationAndDepartureDate(source, destination, date);
//     }

//     public List<Flights> getSuggestionsForSource() {
//         return flightsRepository.findAll();
//     }

//     public List<Flights> getSuggestionsForDestionation() {
//         return flightsRepository.findAll();
//     }

//     public boolean isSeatsAvailable(Long flightId, int travelerCount) {
//         Flights flight = getFlightById(flightId);
//         return flight.getAvailable_seats() >= travelerCount;
//     }
// }

package com.edutech.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import javax.persistence.EntityNotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.edutech.entity.Flights;
import com.edutech.repository.FlightsRepository;
import com.edutech.util.ScheduleStatusConstants;

@Service
public class FlightsService {

    @Autowired
    private FlightsRepository flightsRepository;

    @Autowired
    private FlightScheduleService flightScheduleService;

    public List<Flights> getAllFlights() {
        return flightsRepository.findAll();
    }

    public Flights getFlightById(Long id) {
        return flightsRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Flight not found with id: " + id));
    }

    public Flights saveFlight(Flights flight) {
        if (flight.getDepartureDate() != null) {
            LocalDate today = LocalDate.now();
            if (flight.getDepartureDate().isBefore(today)) {
                throw new IllegalStateException("Departure date cannot be in the past.");
            }
        }
        if (flight.getStatus() == null || flight.getStatus().trim().isEmpty()) {
            flight.setStatus(ScheduleStatusConstants.PENDING_PILOT_ASSIGNMENT);
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

    /**
     * Passenger search: only flights that are confirmed (pilot accepted), not cancelled,
     * with available seats, and not in the past.
     */
    public List<Flights> searchFlights(String source, String destination, LocalDate date) {
        if (source == null || destination == null || date == null) {
            return List.of();
        }
        String trimmedSource = source.trim();
        String trimmedDest = destination.trim();
        if (trimmedSource.isEmpty() || trimmedDest.isEmpty()) {
            return List.of();
        }
        if (date.isBefore(LocalDate.now())) {
            return List.of();
        }

        List<Flights> candidates = flightsRepository.findBySourceAndDestinationAndDepartureDateIgnoreCase(
                trimmedSource, trimmedDest, date);

        List<Flights> bookable = new ArrayList<>();
        for (Flights flight : candidates) {
            if (flight.getAvailable_seats() <= 0) {
                continue;
            }
            if ("CANCELLED".equalsIgnoreCase(flight.getStatus())) {
                continue;
            }
            if (flightScheduleService.isFlightBookableForPassengers(flight.getId(), date)) {
                bookable.add(flight);
            }
        }
        return bookable;
    }

    public List<String> getSuggestionsForSource() {
        return flightsRepository.findDistinctSources();
    }

    public List<String> getSuggestionsForDestionation() {
        return flightsRepository.findDistinctDestinations();
    }

    public boolean isSeatsAvailable(Long flightId, int travelerCount) {
        Flights flight = getFlightById(flightId);
        return flight.getAvailable_seats() >= travelerCount;
    }
}
