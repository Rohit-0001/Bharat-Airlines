package com.edutech.controller;

import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import com.edutech.dto.*;
import com.edutech.entity.User;
import com.edutech.service.LoginAttemptService;
import com.edutech.service.UserService;
import com.edutech.util.JwtUtil;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired private AuthenticationManager authenticationManager;
    @Autowired private UserService userService;
    @Autowired private JwtUtil jwtUtil;
    @Autowired private LoginAttemptService loginAttemptService;


    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody User user) {
        try {
            userService.registerUser(user);

            Map<String, Object> res = new HashMap<>();
            res.put("message", "OTP sent. Verify to activate account");
            res.put("email", user.getEmail());

            return ResponseEntity.ok(res);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody OtpVerifyRequest req) {

        boolean ok = userService.verifyEmail(req.getEmail(), req.getOtp());

        if (ok) {
            return ResponseEntity.ok(Map.of("message", "Email verified successfully"));
        }

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", "Invalid or expired OTP"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody CaptchaLoginRequest request) {

        String username = request.getUsername();

    
        if (loginAttemptService.isLocked(username)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of(
                            "message", "Account temporarily locked. Try after some time.",
                            "locked", true,
                            "failCount", loginAttemptService.getFailureCount(username),
                            "captchaRequired", false
                    ));
        }

        boolean captchaRequired = loginAttemptService.requiresCaptcha(username);

        if (captchaRequired) {
            if (request.getCaptchaToken() == null || request.getCaptchaToken().isBlank()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of(
                                "message", "CAPTCHA required",
                                "captchaRequired", true,
                                "failCount", loginAttemptService.getFailureCount(username),
                                "locked", false
                        ));
            }

        
            // if (!captchaService.verify(request.getCaptchaToken())) { return fail }
        }

        try {
          
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            username,
                            request.getPassword()
                    )
            );

            User user = userService.findByUsername(username);

                   
            if (!user.isEmailVerified()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of(
                                "message", "Please verify email before login"
                        ));
            }

            loginAttemptService.resetAttempts(username);

            String token = jwtUtil.generateToken(
                    username,
                    user.getRole().name()
            );

            return ResponseEntity.ok(new LoginResponse(
                    token,
                    user.getUsername(),
                    user.getEmail(),
                    user.getRole(),
                    user.getId()
            ));

        } catch (Exception e) {

            loginAttemptService.recordFailure(username);

            int failures = loginAttemptService.getFailureCount(username);
            boolean locked = loginAttemptService.isLocked(username);
            boolean captchaNow = loginAttemptService.requiresCaptcha(username);

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "message", "Invalid username or password",
                            "failCount", failures,
                            "captchaRequired", captchaNow,
                            "locked", locked
                    ));
        }
    }

   
    @GetMapping("/captcha-status")
    public ResponseEntity<?> captchaStatus(@RequestParam String username) {
        return ResponseEntity.ok(Map.of(
                "captchaRequired", loginAttemptService.requiresCaptcha(username),
                "locked", loginAttemptService.isLocked(username),
                "failCount", loginAttemptService.getFailureCount(username)
        ));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest req) {

        userService.forgotPassword(req.getEmail());

        return ResponseEntity.ok(Map.of("message", "OTP sent to email"));
    }

    @PostMapping("/verify-reset-otp")
    public ResponseEntity<?> verifyResetOtp(@RequestBody ResetPasswordRequest req) {

        boolean ok = userService.verifyResetOtp(
                req.getEmail(),
                req.getOtp(),
                req.getNewPassword()
        );

        if (ok) {
            return ResponseEntity.ok(Map.of("message", "Password reset successful"));
        }

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", "Invalid or expired OTP"));
    }

    @GetMapping("/user")
    public ResponseEntity<User> getLoggedInUser(
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = userService.findByUsername(userDetails.getUsername());
        return ResponseEntity.ok(user);
    }
}