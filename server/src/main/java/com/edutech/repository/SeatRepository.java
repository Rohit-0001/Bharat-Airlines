package com.edutech.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.edutech.entity.Seat;

public interface SeatRepository extends JpaRepository<Seat, Long> {

    @Query("SELECT s FROM Seat s WHERE s.flight.id = :flightId AND s.seatNumber IN :seatNumbers")
    List<Seat> findByFlightIdAndSeatNumberIn(
            @Param("flightId") Long flightId,
            @Param("seatNumbers") List<String> seatNumbers);

    @Query("SELECT COUNT(s) FROM Seat s WHERE s.flight.id = :flightId AND s.available = true AND s.blocked = false")
    int countAvailableSeatsByFlightId(@Param("flightId") Long flightId);

    @Query("SELECT COUNT(s) FROM Seat s WHERE s.flight.id = :flightId AND s.seatNumber IN :seatNumbers AND s.available = false")
    int countUnavailableSeats(@Param("flightId") Long flightId, @Param("seatNumbers") List<String> seatNumbers);

    @Query("SELECT s FROM Seat s WHERE s.flight.id = :flightId")
    List<Seat> findByFlightId(@Param("flightId") Long flightId);
}