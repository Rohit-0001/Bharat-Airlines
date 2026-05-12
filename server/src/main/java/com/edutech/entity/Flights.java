package com.edutech.entity;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import javax.persistence.*;
import javax.validation.constraints.*;

import com.fasterxml.jackson.annotation.JsonManagedReference;

@Entity
public class Flights {
     @Id
     @GeneratedValue(strategy = GenerationType.IDENTITY)
     Long id;
     @NotBlank
     @Column(unique = true)
     String flight_number;
     @NotBlank
     String flight_name;
     @NotBlank
     String source;
     @NotBlank
     String destination;
     @NotNull
     LocalDate departureDate;
     @NotNull
     LocalTime departureTime;
     @NotNull
     LocalTime arrivalTime;
     @Min(value = 1)
     int totalSeats;
     @Min(value = 0)
     int available_seats;
     boolean isAvailable;
     @DecimalMin(value = "0")
     double price;
     String status;
     @OneToMany(mappedBy = "flight", cascade = CascadeType.ALL, orphanRemoval = true)
     @JsonManagedReference
     List<Seat> seats;
}
