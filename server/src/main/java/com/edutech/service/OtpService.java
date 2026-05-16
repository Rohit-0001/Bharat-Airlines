package com.edutech.service;

import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;


@Service
public class OtpService {

    private final Map<String, OtpData> otpStore = new ConcurrentHashMap<>();

    public String generateOtp(String email) {
        String otp = String.valueOf((int)(Math.random() * 900000) + 100000);

        otpStore.put(email, new OtpData(
            otp,
            LocalDateTime.now().plusMinutes(10)
        ));

        System.out.println("Generated OTP: " + otp);

        return otp;
    }

    public boolean verifyOtp(String email, String inputOtp) {

        OtpData data = otpStore.get(email);

        System.out.println("Stored OTP: " + (data != null ? data.otp : null));
        System.out.println("Entered OTP: " + inputOtp);

        if (data == null) return false;

        if (!data.otp.equals(inputOtp)) return false;

        if (LocalDateTime.now().isAfter(data.expiry)) return false;

        otpStore.remove(email); // ✅ clear after success

        return true;
    }

    private static class OtpData {
        String otp;
        LocalDateTime expiry;

        OtpData(String otp, LocalDateTime expiry) {
            this.otp = otp;
            this.expiry = expiry;
        }
    }
}
