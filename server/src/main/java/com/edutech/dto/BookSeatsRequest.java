package com.edutech.dto;

import java.util.List;

public class BookSeatsRequest {

    private Long flightId;
    private List<String> seatNumbers;
    private Long userId;
    private Double totalPrice;
    private Integer infantCount;

    public Long getFlightId() { return flightId; }
    public void setFlightId(Long flightId) { this.flightId = flightId; }

    public List<String> getSeatNumbers() { return seatNumbers; }
    public void setSeatNumbers(List<String> seatNumbers) { this.seatNumbers = seatNumbers; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Double getTotalPrice() { return totalPrice; }
    public void setTotalPrice(Double totalPrice) { this.totalPrice = totalPrice; }

    public Integer getInfantCount() { return infantCount; }
    public void setInfantCount(Integer infantCount) { this.infantCount = infantCount; }
}