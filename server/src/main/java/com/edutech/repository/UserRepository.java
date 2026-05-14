package com.edutech.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.edutech.entity.Role;
import com.edutech.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {

    User findByUsername(String username);

    List<User> findByRole(Role role);
}