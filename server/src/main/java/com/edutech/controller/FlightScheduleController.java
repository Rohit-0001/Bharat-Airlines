package com.edutech.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.edutech.entity.FlightSchedule;
import com.edutech.entity.Role;
import com.edutech.entity.User;
import com.edutech.service.FlightScheduleService;
import com.edutech.service.UserService;

@RestController
@RequestMapping("/api/pilot/schedule")
@CrossOrigin(origins = "*")
public class FlightScheduleController {    
    
    //Injecting service 
    @Autowired
    private FlightScheduleService flightScheduleService;

    @Autowired
    private UserService userService;

    // Admin: Assign a pilot to a flight on a specific date
    @PostMapping("/admin/assign-pilot")
    public ResponseEntity<FlightSchedule> assignPilot(
            @RequestParam Long flightId,
            @RequestParam Long pilotId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate scheduledDate,
            @RequestParam String assignStatus) {
        FlightSchedule schedule = flightScheduleService.assignPilot(
                flightId, pilotId, assignStatus, scheduledDate);
        return ResponseEntity.ok(schedule);
    }

    // Admin: Get all flight schedules
    @GetMapping
    public ResponseEntity<List<FlightSchedule>> getAllSchedules() {
        return ResponseEntity.ok(flightScheduleService.getAllSchedules());
    }

    // Admin: Get all registered users with role PILOT
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllPilots() {
        return ResponseEntity.ok(userService.findByRole(Role.PILOT));
    }

    // Pilot: Get my assigned schedules
    @GetMapping("/scheduleUser")
    public ResponseEntity<List<FlightSchedule>> getMySchedule(Authentication auth) {
        User user = userService.findByUsername(auth.getName());
        return ResponseEntity.ok(flightScheduleService.getAssignmentsForPilot(user.getId()));
    }

    // Admin and Pilot: Update status of a specific schedule
    @PutMapping("/{id}/status")
    public ResponseEntity<FlightSchedule> updateStatus(@PathVariable Long id,
                                                        @RequestBody Map<String, String> body) {
        FlightSchedule updated = flightScheduleService.updateStatus(id, body.get("status"));
        return ResponseEntity.ok(updated);
    }
}