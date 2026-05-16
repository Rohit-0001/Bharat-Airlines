package com.edutech.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import javax.persistence.EntityNotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.edutech.entity.FlightSchedule;
import com.edutech.entity.Flights;
import com.edutech.entity.User;
import com.edutech.repository.FlightScheduleRepository;
import com.edutech.repository.FlightsRepository;
import com.edutech.repository.UserRepository;

@Service
public class FlightScheduleService {

    @Autowired
    private FlightScheduleRepository flightScheduleRepository;

    @Autowired
    private FlightsRepository flightsRepository;

    @Autowired
    private UserRepository userRepository;

    public List<FlightSchedule> getAllSchedules() {
        return flightScheduleRepository.findAll();
    }

    public FlightSchedule updateStatus(Long id, String status) {
        FlightSchedule schedule = flightScheduleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Schedule not found with id: " + id));
        schedule.setStatus(status);
        schedule.setAssignStatus(status);
        return flightScheduleRepository.save(schedule);
    }

    public FlightSchedule assignPilot(Long flightId, Long pilotId, String assignStatus, LocalDate scheduledDate) {
        Flights flight = flightsRepository.findById(flightId)
                .orElseThrow(() -> new EntityNotFoundException("Flight not found with id: " + flightId));

        User pilot = userRepository.findById(pilotId)
                .orElseThrow(() -> new EntityNotFoundException("Pilot not found with id: " + pilotId));

        // Validate that the scheduled date matches the flight's actual departure date
        if (!scheduledDate.equals(flight.getDepartureDate())) {
            throw new IllegalStateException(
                    "Scheduled date does not match the flight's departure date: " + flight.getDepartureDate());
        }

        // Check for duplicate assignment: same flight, same date
        flightScheduleRepository.findByFlightIdAndScheduledDate(flightId, scheduledDate)
                .ifPresent(existing -> {
                    throw new IllegalStateException(
                            "A pilot is already assigned to this flight on the selected date.");
                });

        // Check pilot time conflict: pilot cannot fly two flights at the same time on the same date
        List<FlightSchedule> pilotSchedulesOnDate =
                flightScheduleRepository.findByPilotIdAndScheduledDate(pilotId, scheduledDate);

        LocalTime newDep = flight.getDepartureTime();
        LocalTime newArr = flight.getArrivalTime();

        for (FlightSchedule existing : pilotSchedulesOnDate) {
            Flights existingFlight = existing.getFlight();
            LocalTime existDep = existingFlight.getDepartureTime();
            LocalTime existArr = existingFlight.getArrivalTime();

            // Two flights overlap if one starts before the other ends
            boolean overlap = newDep.isBefore(existArr) && existDep.isBefore(newArr);
            if (overlap) {
                throw new IllegalStateException(
                        "Pilot " + pilot.getUsername() +
                        " is already assigned to flight " + existingFlight.getFlight_number() +
                        " from " + existDep + " to " + existArr +
                        " on " + scheduledDate + ". Cannot assign overlapping flights.");
            }
        }

        FlightSchedule schedule = new FlightSchedule();
        schedule.setFlight(flight);
        schedule.setPilot(pilot);
        schedule.setScheduledDate(scheduledDate);
        schedule.setAssignStatus(assignStatus);
        schedule.setStatus(assignStatus);

        return flightScheduleRepository.save(schedule);
    }

    public List<FlightSchedule> getAssignmentsForPilot(Long pilotId) {
        return flightScheduleRepository.findByPilotId(pilotId);
    }

    public List<FlightSchedule> findByPilot(User pilot) {
        return flightScheduleRepository.findByPilot(pilot);
    }
}