package com.edutech.dto;

import com.edutech.entity.Role;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

public class LoginResponse {

    private String token;
    private String username;
    private String email;
    private Role role;
    private Long userId;

    @JsonCreator
    public LoginResponse(
            @JsonProperty("token") String token,
            @JsonProperty("username") String username,
            @JsonProperty("email") String email,
            @JsonProperty("role") Role role,
            @JsonProperty("userId") Long userId) {
        this.token = token;
        this.username = username;
        this.email = email;
        this.role = role;
        this.userId = userId;
    }

    public String getToken() { return token; }
    public String getUsername() { return username; }
    public String getEmail() { return email; }
    public Role getRole() { return role; }
    public Long getUserId() { return userId; }
}