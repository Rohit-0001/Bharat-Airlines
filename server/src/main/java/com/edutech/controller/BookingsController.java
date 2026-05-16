// package com.edutech.controller;

// import java.util.HashMap;
// import java.util.List;
// import java.util.Map;

// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.http.*;
// import org.springframework.security.core.Authentication;
// import org.springframework.web.bind.annotation.*;

// import com.edutech.dto.BookSeatsRequest;
// import com.edutech.entity.Bookings;
// import com.edutech.entity.User;
// import com.edutech.repository.UserRepository;
// import com.edutech.service.BookingService;

// @RestController
// @RequestMapping("/api/booking")
// @CrossOrigin(origins = "*")
// public class BookingsController {

//     @Autowired
//     private BookingService bookingService;

//     @Autowired
//     private UserRepository userRepository;

//     @PostMapping("/book-seats")
//     public ResponseEntity<Map<String, String>> bookSeats(@RequestBody BookSeatsRequest request) {
//         bookingService.bookSeats(
//             request.getFlightId(),
//             request.getSeatNumbers(),
//             request.getUserId()
//         );
//         Map<String, String> response = new HashMap<>();
//         response.put("message", "Booking Successful");
//         return ResponseEntity.ok(response);
//     }

//     @GetMapping("/bookings")
//     public ResponseEntity<List<Bookings>> getMyBookings(Authentication auth) {
//         User user = userRepository.findByUsername(auth.getName());
//         return ResponseEntity.ok(bookingService.getBookingsByUser(user.getId()));
//     }

//     @GetMapping("/bookingList")
//     public ResponseEntity<List<Bookings>> getAllBookings() {
//         return ResponseEntity.ok(bookingService.getBookingListUser());
//     }

//     @PutMapping("/{id}/status")
//     public ResponseEntity<Map<String, String>> updateBookingStatus(@PathVariable Long id,
//                                                                     @RequestBody Map<String, String> body) {
//         String status = body.get("status");
//         bookingService.updateBookingStatus(id, status);
//         Map<String, String> response = new HashMap<>();
//         response.put("message", "Booking status updated to " + status);
//         return ResponseEntity.ok(response);
//     }

//     @DeleteMapping("/bookings/{id}")
//     public ResponseEntity<Void> cancelBooking(@PathVariable Long id) {
//         bookingService.cancelBooking(id);
//         return ResponseEntity.ok().build();
//     }

//     @GetMapping("/ticket/{id}")
//     public ResponseEntity<byte[]> downloadTicket(@PathVariable Long id) {
//         byte[] pdf = bookingService.generateTicketPdf(id);
//         HttpHeaders headers = new HttpHeaders();
//         headers.setContentType(MediaType.APPLICATION_PDF);
//         headers.setContentDispositionFormData("attachment", "ticket.pdf");
//         return new ResponseEntity<>(pdf, headers, HttpStatus.OK);
//     }
// }

package com.edutech.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import com.edutech.dto.BookSeatsRequest;
import com.edutech.entity.Bookings;
import com.edutech.entity.User;
import com.edutech.repository.UserRepository;
import com.edutech.service.BookingService;

@RestController
@RequestMapping("/api/booking")
@CrossOrigin(origins = "*")
public class BookingsController {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/book-seats")
    public ResponseEntity<Map<String, String>> bookSeats(
            @RequestBody BookSeatsRequest request,
            Authentication auth) {
        User user = userRepository.findByUsername(auth.getName());
        bookingService.bookSeats(
            request.getFlightId(),
            request.getSeatNumbers(),
            user.getId()
        );
        Map<String, String> response = new HashMap<>();
        response.put("message", "Booking Successful");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/bookings")
    public ResponseEntity<List<Bookings>> getMyBookings(Authentication auth) {
        User user = userRepository.findByUsername(auth.getName());
        return ResponseEntity.ok(bookingService.getBookingsByUser(user.getId()));
    }

    @GetMapping("/bookingList")
    public ResponseEntity<List<Bookings>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getBookingListUser());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Map<String, String>> updateBookingStatus(@PathVariable Long id,
                                                                    @RequestBody Map<String, String> body) {
        String status = body.get("status");
        bookingService.updateBookingStatus(id, status);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Booking status updated to " + status);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/bookings/{id}")
    public ResponseEntity<Void> cancelBooking(@PathVariable Long id, Authentication auth) {
        User user = userRepository.findByUsername(auth.getName());
        boolean isAdmin = hasRole(auth, "ADMIN");
        bookingService.cancelBooking(id, user.getId(), isAdmin);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/ticket/{id}")
    public ResponseEntity<byte[]> downloadTicket(@PathVariable Long id, Authentication auth) {
        User user = userRepository.findByUsername(auth.getName());
        boolean isAdmin = hasRole(auth, "ADMIN");
        byte[] pdf = bookingService.generateTicketPdf(id, user.getId(), isAdmin);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "ticket.pdf");
        return new ResponseEntity<>(pdf, headers, HttpStatus.OK);
    }

    private boolean hasRole(Authentication auth, String role) {
        if (auth == null) {
            return false;
        }
        for (GrantedAuthority authority : auth.getAuthorities()) {
            if (role.equals(authority.getAuthority())) {
                return true;
            }
        }
        return false;
    }
}
