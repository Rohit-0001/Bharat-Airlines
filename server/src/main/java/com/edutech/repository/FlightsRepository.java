// package com.edutech.repository;

// import java.time.LocalDate;
// import java.util.List;

// import org.springframework.data.jpa.repository.JpaRepository;

// import com.edutech.entity.Flights;

// public interface FlightsRepository extends JpaRepository<Flights, Long> {

//     List<Flights> findBySourceAndDestinationAndDepartureDate(
//             String source, String destination, LocalDate departureDate);
// }

package com.edutech.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.edutech.entity.Flights;

public interface FlightsRepository extends JpaRepository<Flights, Long> {

    List<Flights> findBySourceAndDestinationAndDepartureDate(
            String source, String destination, LocalDate departureDate);

    @Query("SELECT f FROM Flights f WHERE LOWER(TRIM(f.source)) = LOWER(TRIM(:source)) "
            + "AND LOWER(TRIM(f.destination)) = LOWER(TRIM(:destination)) "
            + "AND f.departureDate = :departureDate")
    List<Flights> findBySourceAndDestinationAndDepartureDateIgnoreCase(
            @Param("source") String source,
            @Param("destination") String destination,
            @Param("departureDate") LocalDate departureDate);

    @Query("SELECT DISTINCT f.source FROM Flights f ORDER BY f.source")
    List<String> findDistinctSources();

    @Query("SELECT DISTINCT f.destination FROM Flights f ORDER BY f.destination")
    List<String> findDistinctDestinations();
}