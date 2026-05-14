package com.edutech.entity;

import javax.persistence.*;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Table(name = "seat")
public class Seat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "flight_id")
    @JsonBackReference
    private Flights flight;

    private String seatNumber;
    private String rowLabel;
    private int columnNumber;
    private double price;

    private boolean available;
    private boolean xl;
    private boolean blocked;
    private boolean emergencyExist;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Flights getFlight() { return flight; }
    public void setFlight(Flights flight) { this.flight = flight; }

    public String getSeatNumber() { return seatNumber; }
    public void setSeatNumber(String seatNumber) { this.seatNumber = seatNumber; }

    public String getRowLabel() { return rowLabel; }
    public void setRowLabel(String rowLabel) { this.rowLabel = rowLabel; }

    public int getColumnNumber() { return columnNumber; }
    public void setColumnNumber(int columnNumber) { this.columnNumber = columnNumber; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }

    @JsonProperty("isAvailable")
    public boolean isAvailable() { return available; }
    public void setAvailable(boolean available) { this.available = available; }

    @JsonProperty("isXL")
    public boolean isXl() { return xl; }
    public void setXl(boolean xl) { this.xl = xl; }

    @JsonProperty("isBlocked")
    public boolean isBlocked() { return blocked; }
    public void setBlocked(boolean blocked) { this.blocked = blocked; }

    @JsonProperty("isEmergencyExist")
    public boolean isEmergencyExist() { return emergencyExist; }
    public void setEmergencyExist(boolean emergencyExist) { this.emergencyExist = emergencyExist; }
}