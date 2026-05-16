package com.edutech.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import javax.mail.internet.MimeMessage;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${app.base-url}")
    private String baseUrl;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendOtpEmail(String toEmail, String username, String otp) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("✈ Bharat Airlines – Email Verification OTP");
            String html = buildOtpEmailHtml(username, otp);
            helper.setText(html, true);
            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send OTP email: " + e.getMessage());
        }
    }

    public void sendWelcomeEmail(String toEmail, String username) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("✈ Welcome to Bharat Airlines, " + username + "!");
            String html = buildWelcomeEmailHtml(username);
            helper.setText(html, true);
            mailSender.send(message);
        } catch (Exception e) {
            // Don't fail registration if welcome email fails
        }
    }

    public void sendPasswordResetEmail(String toEmail, String username, String resetToken) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("✈ Bharat Airlines – Password Reset Request");
            String resetLink = baseUrl + "/reset-password?token=" + resetToken;
            String html = buildResetEmailHtml(username, resetLink);
            helper.setText(html, true);
            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send reset email: " + e.getMessage());
        }
    }

    private String buildOtpEmailHtml(String username, String otp) {
        return "<!DOCTYPE html><html><body style='font-family:Arial,sans-serif;background:#f5f5f5;margin:0;padding:20px'>" +
            "<div style='max-width:500px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1)'>" +
            "<div style='background:linear-gradient(135deg,#8c1d18,#c9a84c);padding:30px;text-align:center'>" +
            "<h1 style='color:#fff;margin:0;font-size:24px'>✈ Bharat Airlines</h1></div>" +
            "<div style='padding:30px'>" +
            "<h2 style='color:#8c1d18;margin-top:0'>Email Verification</h2>" +
            "<p style='color:#555'>Hello <strong>" + username + "</strong>,</p>" +
            "<p style='color:#555'>Your One-Time Password (OTP) for account verification is:</p>" +
            "<div style='background:#f8f4e8;border:2px dashed #c9a84c;border-radius:8px;padding:20px;text-align:center;margin:20px 0'>" +
            "<span style='font-size:36px;font-weight:bold;letter-spacing:12px;color:#8c1d18'>" + otp + "</span></div>" +
            "<p style='color:#888;font-size:13px'>This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.</p>" +
            "</div><div style='background:#f5f5f5;padding:15px;text-align:center'>" +
            "<p style='color:#aaa;font-size:12px;margin:0'>© 2024 Bharat Airlines. All rights reserved.</p></div></div></body></html>";
    }

    private String buildWelcomeEmailHtml(String username) {
        String loginLink = baseUrl + "/login";
        return "<!DOCTYPE html><html><body style='font-family:Arial,sans-serif;background:#f5f5f5;margin:0;padding:20px'>" +
            "<div style='max-width:500px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1)'>" +
            "<div style='background:linear-gradient(135deg,#8c1d18,#c9a84c);padding:30px;text-align:center'>" +
            "<h1 style='color:#fff;margin:0;font-size:24px'>✈ Bharat Airlines</h1></div>" +
            "<div style='padding:30px'>" +
            "<h2 style='color:#8c1d18;margin-top:0'>Welcome Aboard, " + username + "! 🎉</h2>" +
            "<p style='color:#555'>Your account has been successfully created and verified.</p>" +
            "<p style='color:#555'>You can now login and start booking your flights with Bharat Airlines.</p>" +
            "<div style='text-align:center;margin:25px 0'>" +
            "<a href='" + loginLink + "' style='background:linear-gradient(135deg,#8c1d18,#c9a84c);color:#fff;padding:12px 30px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px'>Login to Your Account</a></div>" +
            "<p style='color:#888;font-size:13px'>If you did not create this account, please ignore this email.</p>" +
            "</div><div style='background:#f5f5f5;padding:15px;text-align:center'>" +
            "<p style='color:#aaa;font-size:12px;margin:0'>© 2024 Bharat Airlines. All rights reserved.</p></div></div></body></html>";
    }

    private String buildResetEmailHtml(String username, String resetLink) {
        return "<!DOCTYPE html><html><body style='font-family:Arial,sans-serif;background:#f5f5f5;margin:0;padding:20px'>" +
            "<div style='max-width:500px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1)'>" +
            "<div style='background:linear-gradient(135deg,#8c1d18,#c9a84c);padding:30px;text-align:center'>" +
            "<h1 style='color:#fff;margin:0;font-size:24px'>✈ Bharat Airlines</h1></div>" +
            "<div style='padding:30px'>" +
            "<h2 style='color:#8c1d18;margin-top:0'>Password Reset Request</h2>" +
            "<p style='color:#555'>Hello <strong>" + username + "</strong>,</p>" +
            "<p style='color:#555'>We received a request to reset your password. Click the button below to set a new password:</p>" +
            "<div style='text-align:center;margin:25px 0'>" +
            "<a href='" + resetLink + "' style='background:linear-gradient(135deg,#8c1d18,#c9a84c);color:#fff;padding:12px 30px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px'>Reset Password</a></div>" +
            "<p style='color:#888;font-size:13px'>This link expires in <strong>30 minutes</strong>. If you did not request this, please ignore this email.</p>" +
            "</div><div style='background:#f5f5f5;padding:15px;text-align:center'>" +
            "<p style='color:#aaa;font-size:12px;margin:0'>© 2024 Bharat Airlines. All rights reserved.</p></div></div></body></html>";
    }
}
