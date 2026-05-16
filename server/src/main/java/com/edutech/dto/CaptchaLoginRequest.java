package com.edutech.dto;
public class CaptchaLoginRequest {
    private String username;
    private String password;
    private String captchaToken; // hCaptcha/reCAPTCHA token (optional)
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getCaptchaToken() { return captchaToken; }
    public void setCaptchaToken(String captchaToken) { this.captchaToken = captchaToken; }
}
