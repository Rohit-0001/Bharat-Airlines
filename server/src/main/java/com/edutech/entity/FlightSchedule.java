package com.edutech.entity;

import java.time.LocalDate;

import javax.persistence.*;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "flight_schedule")
public class FlightSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "flight_id")
    @JsonIgnoreProperties({"seats", "bookings"})
    private Flights flight;

    @ManyToOne
    @JoinColumn(name = "pilot_id")
    @JsonIgnoreProperties({"password", "bookings"})
    private User pilot;

    private LocalDate scheduledDate;

    private String status;

    private String assignStatus;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Flights getFlight() { return flight; }
    public void setFlight(Flights flight) { this.flight = flight; }

    public User getPilot() { return pilot; }
    public void setPilot(User pilot) { this.pilot = pilot; }

    public LocalDate getScheduledDate() { return scheduledDate; }
    public void setScheduledDate(LocalDate scheduledDate) { this.scheduledDate = scheduledDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getAssignStatus() { return assignStatus; }
    public void setAssignStatus(String assignStatus) { this.assignStatus = assignStatus; }
}