
package com.edutech.service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Collections;
import java.util.UUID;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.edutech.entity.User;
import com.edutech.repository.UserRepository;

@Service
public class UserService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private OtpService otpService;

    @Autowired
    private EmailService emailService;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username);
        if (user == null)
            throw new UsernameNotFoundException("User not found: " + username);
        return new org.springframework.security.core.userdetails.User(
                user.getUsername(), user.getPassword(),
                Collections.singletonList(new SimpleGrantedAuthority(user.getRole().name())));
    }

    /** Step 1 of registration: persist user (unverified) and send OTP */
    public User registerUser(User user) {
        if (userRepository.findByUsername(user.getUsername()) != null)
            throw new RuntimeException("Username already exists");
        if (userRepository.findByEmail(user.getEmail()) != null)
            throw new RuntimeException("Email already registered");

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setEmailVerified(false);
        User saved = userRepository.save(user);

        // Generate OTP and send
        String otp = otpService.generateOtp(user.getEmail());
        emailService.sendOtpEmail(user.getEmail(), user.getUsername(), otp);
        return saved;
    }

    /** Step 2: verify OTP, mark verified, send welcome email */
    public boolean verifyEmail(String email, String otp) {
        if (!otpService.verifyOtp(email, otp))
            return false;
        User user = userRepository.findByEmail(email);
        if (user == null)
            return false;
        user.setEmailVerified(true);
        userRepository.save(user);
        emailService.sendWelcomeEmail(user.getEmail(), user.getUsername());
        return true;
    }

    /** Resend OTP */
    public void resendOtp(String email) {
        User user = userRepository.findByEmail(email);
        if (user == null)
            throw new RuntimeException("No account found for this email");
        if (user.isEmailVerified())
            throw new RuntimeException("Email already verified");
        String otp = otpService.generateOtp(email);
        emailService.sendOtpEmail(email, user.getUsername(), otp);
    }

    /** Forgot password: generate token, send reset email */
    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email);
        if (user == null)
            return;

        String otp = String.valueOf((int) (Math.random() * 900000) + 100000);

        user.setResetOtp(otp);
        // user.setOtpExpiry(LocalDateTime.now().plusMinutes(10));

        user.setOtpExpiry(
                ZonedDateTime.now(ZoneId.of("Asia/Kolkata"))
                        .plusMinutes(10)
                        .toLocalDateTime());
        userRepository.save(user);

        System.out.println("✅ OTP GENERATED: " + otp);
        System.out.println("✅ EXPIRY SET: " + user.getOtpExpiry());

        emailService.sendOtpEmail(user.getEmail(), user.getUsername(), otp);

        // emailService.sendEmail(
        // user.getEmail(),
        // "Password Reset OTP",
        // "Hello " + user.getUsername() + ",\n\nYour OTP is: " + otp + "\n\nValid for
        // 10 minutes."
        // );
    }



   public boolean verifyResetOtp(String email, String otp, String newPassword) {

    User user = userRepository.findByEmail(email);
    if (user == null) return false;

    System.out.println("--------- DEBUG OTP ---------");
    System.out.println("Stored OTP  : [" + user.getResetOtp() + "]");
    System.out.println("Entered OTP : [" + otp + "]");
    System.out.println("Equal match : " + user.getResetOtp().equals(otp));
    System.out.println("Trim match  : " + user.getResetOtp().trim().equals(otp.trim()));
    System.out.println("Expiry Time : " + user.getOtpExpiry());
    System.out.println("Now Time    : " + LocalDateTime.now());
    System.out.println("-----------------------------");

    if (user.getResetOtp() == null ||
        !user.getResetOtp().trim().equals(otp.trim()) ||
        user.getOtpExpiry() == null ||
        LocalDateTime.now().isAfter(user.getOtpExpiry())) {

        return false;
    }


    user.setPassword(passwordEncoder.encode(newPassword));

    user.setResetOtp(null);
    user.setOtpExpiry(null);

    userRepository.save(user);

    return true;
}


    /** Reset password using token */
    public boolean resetPassword(String token, String newPassword) {
        User user = userRepository.findByPasswordResetToken(token);
        if (user == null)
            return false;
        if (user.getResetTokenExpiry() == null || LocalDateTime.now().isAfter(user.getResetTokenExpiry()))
            return false;
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setPasswordResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);
        return true;
    }

    public User findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public java.util.List<User> findByRole(com.edutech.entity.Role role) {
        return userRepository.findByRole(role);
    }
}
