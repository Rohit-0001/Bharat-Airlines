package com.edutech.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.edutech.entity.Flights;

public interface FlightsRepository extends JpaRepository<Flights, Long> {

    List<Flights> findBySourceAndDestinationAndDepartureDate(
            String source, String destination, LocalDate departureDate);
}