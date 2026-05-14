package com.edutech.entity;

import javax.persistence.*;
import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Table(name = "app_user")
public class User {

     @Id
     @GeneratedValue(strategy = GenerationType.IDENTITY)
     private Long id;

     @NotBlank(message = "Username is required")
     @Column(unique = true)
     private String username;

     @NotBlank(message = "Password is required")
     @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
     private String password;

     @NotBlank(message = "Email is required")
     @Email(message = "Email must be valid")
     @Column(unique = true)
     private String email;

     private Long contactNumber;

     @NotNull(message = "Role is required")
     @Enumerated(EnumType.STRING)
     private Role role;

     public Long getId() {
          return id;
     }

     public void setId(Long id) {
          this.id = id;
     }

     public String getUsername() {
          return username;
     }

     public void setUsername(String username) {
          this.username = username;
     }

     public String getPassword() {
          return password;
     }

     public void setPassword(String password) {
          this.password = password;
     }

     public String getEmail() {
          return email;
     }

     public void setEmail(String email) {
          this.email = email;
     }

     public Long getContactNumber() {
          return contactNumber;
     }

     public void setContactNumber(Long contactNumber) {
          this.contactNumber = contactNumber;
     }

     public Role getRole() {
          return role;
     }

     public void setRole(Role role) {
          this.role = role;
     }
}