package com.edutech.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.edutech.entity.Bookings;

public interface BookingRepository extends JpaRepository<Bookings, Long> {

    @Query("SELECT b FROM Bookings b WHERE b.user.id = :userId")
    List<Bookings> findByUserId(@Param("userId") Long userId);
}