package com.edutech.service;

import java.time.LocalDate;
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

    // Update schedule status (both status and assignStatus fields)
    public FlightSchedule updateStatus(Long id, String status) {
        FlightSchedule schedule = flightScheduleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Schedule not found with id: " + id));
        schedule.setStatus(status);
        schedule.setAssignStatus(status);
        return flightScheduleRepository.save(schedule);
    }

    // Assign a pilot to a flight on a specific date
    public FlightSchedule assignPilot(Long flightId, Long pilotId, String assignStatus, LocalDate scheduledDate) {
        Flights flight = flightsRepository.findById(flightId)
                .orElseThrow(() -> new EntityNotFoundException("Flight not found with id: " + flightId));

        User pilot = userRepository.findById(pilotId)
                .orElseThrow(() -> new EntityNotFoundException("Pilot not found with id: " + pilotId));

        // Check for duplicate assignment on the same date for this flight
        flightScheduleRepository.findByFlightIdAndScheduledDate(flightId, scheduledDate)
                .ifPresent(existing -> {
                    throw new IllegalStateException(
                            "Pilot already assigned to this flight on the selected date.");
                });

        FlightSchedule schedule = new FlightSchedule();
        schedule.setFlight(flight);
        schedule.setPilot(pilot);
        schedule.setScheduledDate(scheduledDate);
        schedule.setAssignStatus(assignStatus);
        schedule.setStatus(assignStatus);

        return flightScheduleRepository.save(schedule);
    }

    // Get all schedules assigned to a specific pilot (by pilot id)
    public List<FlightSchedule> getAssignmentsForPilot(Long pilotId) {
        return flightScheduleRepository.findByPilotId(pilotId);
    }

    // Get all schedules assigned to a specific pilot (by User object)
    public List<FlightSchedule> findByPilot(User pilot) {
        return flightScheduleRepository.findByPilot(pilot);
    }
}