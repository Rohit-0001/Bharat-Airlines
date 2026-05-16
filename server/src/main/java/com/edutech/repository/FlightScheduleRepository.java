// package com.edutech.repository;

// import java.time.LocalDate;
// import java.util.List;
// import java.util.Optional;

// import org.springframework.data.jpa.repository.JpaRepository;
// import org.springframework.data.jpa.repository.Query;
// import org.springframework.data.repository.query.Param;

// import com.edutech.entity.FlightSchedule;
// import com.edutech.entity.User;

// public interface FlightScheduleRepository extends JpaRepository<FlightSchedule, Long> {

//     @Query("SELECT fs FROM FlightSchedule fs WHERE fs.flight.id = :flightId AND fs.scheduledDate = :scheduledDate")
//     Optional<FlightSchedule> findByFlightIdAndScheduledDate(
//             @Param("flightId") Long flightId,
//             @Param("scheduledDate") LocalDate scheduledDate);

//     @Query("SELECT fs FROM FlightSchedule fs WHERE fs.pilot.id = :pilotId")
//     List<FlightSchedule> findByPilotId(@Param("pilotId") Long pilotId);

//     @Query("SELECT fs FROM FlightSchedule fs WHERE fs.pilot.id = :pilotId AND fs.scheduledDate = :scheduledDate")
//     List<FlightSchedule> findByPilotIdAndScheduledDate(
//             @Param("pilotId") Long pilotId,
//             @Param("scheduledDate") LocalDate scheduledDate);

//     List<FlightSchedule> findByPilot(User pilot);
// }

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

    @Query("SELECT fs FROM FlightSchedule fs WHERE fs.pilot.id = :pilotId AND fs.scheduledDate = :scheduledDate")
    List<FlightSchedule> findByPilotIdAndScheduledDate(
            @Param("pilotId") Long pilotId,
            @Param("scheduledDate") LocalDate scheduledDate);

    List<FlightSchedule> findByPilot(User pilot);

    @Query("SELECT fs FROM FlightSchedule fs WHERE fs.flight.id = :flightId "
            + "AND fs.scheduledDate = :scheduledDate AND fs.status = :status "
            + "AND fs.assignStatus = :assignStatus")
    Optional<FlightSchedule> findBookableSchedule(
            @Param("flightId") Long flightId,
            @Param("scheduledDate") LocalDate scheduledDate,
            @Param("status") String status,
            @Param("assignStatus") String assignStatus);
}