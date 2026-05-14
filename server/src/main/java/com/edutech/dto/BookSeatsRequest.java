package com.edutech.dto;

import java.util.List;

public class BookSeatsRequest {

    private Long flightId;
    private List<String> seatNumbers;
    private Long userId;

    public Long getFlightId() { return flightId; }
    public void setFlightId(Long flightId) { this.flightId = flightId; }

    public List<String> getSeatNumbers() { return seatNumbers; }
    public void setSeatNumbers(List<String> seatNumbers) { this.seatNumbers = seatNumbers; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
}