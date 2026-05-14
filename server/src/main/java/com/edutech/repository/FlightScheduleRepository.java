package com.edutech.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.edutech.entity.FlightSchedule;
import com.edutech.entity.User;

public interface FlightScheduleRepository extends JpaRepository<FlightSchedule, Long> {

    @Query("SELECT fs FROM FlightSchedule fs WHERE fs.flight.id = :flightId AND fs.scheduledDate = :scheduledDate")
    Optional<FlightSchedule> findByFlightIdAndScheduledDate(
            @Param("flightId") Long flightId,
            @Param("scheduledDate") LocalDate scheduledDate);

    @Query("SELECT fs FROM FlightSchedule fs WHERE fs.pilot.id = :pilotId")
    List<FlightSchedule> findByPilotId(@Param("pilotId") Long pilotId);

    List<FlightSchedule> findByPilot(User pilot);
}