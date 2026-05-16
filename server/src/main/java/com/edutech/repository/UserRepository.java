package com.edutech.repository;

import com.edutech.entity.Role;
import com.edutech.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {
    User findByUsername(String username);
    User findByEmail(String email);
    User findByPasswordResetToken(String token);
    List<User> findByRole(Role role);
}
