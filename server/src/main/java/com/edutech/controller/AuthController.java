package com.edutech.controller;

import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import com.edutech.dto.LoginRequest;
import com.edutech.dto.LoginResponse;
import com.edutech.entity.User;
import com.edutech.service.UserService;
import com.edutech.util.JwtUtil;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    // Register a new user (ADMIN / PASSENGER / PILOT)
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody User user) {
        try {
            User saved = userService.registerUser(user);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);

        } catch (Exception e) {
            e.printStackTrace(); // 🔥 prints actual error in console

            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(java.util.Collections.singletonMap("message", e.getMessage()));
        }
    }

    // Authenticate and return a JWT token
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(), request.getPassword()));

                            //CHECKINH  PAS ABOVE
            User user = userService.findByUsername(request.getUsername());
            String token = jwtUtil.generateToken(
                    request.getUsername(), user.getRole().name());

            LoginResponse response = new LoginResponse(
                    token, user.getUsername(), user.getEmail(),
                    user.getRole(), user.getId());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
    e.printStackTrace();

    java.util.Map<String, Object> error = new java.util.HashMap<>();
    error.put("status", 401);  // ✅ ADD THIS
    error.put("message", "Invalid username or password");

    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
}
    }

    // Return the currently authenticated user's profile
    @GetMapping("/user")
    public ResponseEntity<User> getLoggedInUser(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.findByUsername(userDetails.getUsername());
        return ResponseEntity.ok(user);
    }
}