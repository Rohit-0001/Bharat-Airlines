package com.edutech.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class LoginAttemptService {

    @Value("${app.login.max-attempts:3}")
    private int captchaThreshold; // show captcha after 3 failures

    @Value("${app.login.lock-attempts:6}")
    private int lockThreshold; // lock after 6 failures

    @Value("${app.login.lockout-minutes:15}")
    private long lockoutMinutes;

    private static class AttemptInfo {
        int count = 0;
        LocalDateTime lockUntil = null;
    }

    private final Map<String, AttemptInfo> attempts = new ConcurrentHashMap<>();

    // ✅ RECORD FAILURE
    public void recordFailure(String username) {
        AttemptInfo info = attempts.computeIfAbsent(username, k -> new AttemptInfo());
        info.count++;

        System.out.println("Login failure for " + username + " count: " + info.count);

        // ✅ LOCK after threshold
        if (info.count >= lockThreshold) {
            info.lockUntil = LocalDateTime.now().plusMinutes(lockoutMinutes);
            System.out.println("User LOCKED until: " + info.lockUntil);
        }
    }

    // ✅ RESET ON SUCCESS
    public void resetAttempts(String username) {
        attempts.remove(username);
        System.out.println("Login attempts reset for: " + username);
    }

    // ✅ CHECK LOCK
    public boolean isLocked(String username) {
        AttemptInfo info = attempts.get(username);

        if (info == null || info.lockUntil == null) return false;

        if (LocalDateTime.now().isAfter(info.lockUntil)) {
            attempts.remove(username); // unlock automatically
            return false;
        }

        return true;
    }

    // ✅ GET FAILURE COUNT
    public int getFailureCount(String username) {
        AttemptInfo info = attempts.get(username);
        return info == null ? 0 : info.count;
    }

    // ✅ CAPTCHA BETWEEN 3–5
    public boolean requiresCaptcha(String username) {
        int count = getFailureCount(username);
        return count >= captchaThreshold && count < lockThreshold;
    }
}



// package com.edutech.service;

// import org.springframework.beans.factory.annotation.Value;
// import org.springframework.stereotype.Service;
// import java.time.LocalDateTime;
// import java.util.Map;
// import java.util.concurrent.ConcurrentHashMap;

// @Service
// public class LoginAttemptService {

//     @Value("${app.login.max-attempts:3}")
//     private int captchaThreshold; // show captcha after 3

//     @Value("${app.login.lock-attempts:6}")
//     private int lockThreshold; // lock after 6

//     @Value("${app.login.lockout-minutes:15}")
//     private long lockoutMinutes;

//     private static class AttemptInfo {
//         int count = 0;
//         LocalDateTime lockUntil = null;
//     }

//     private final Map<String, AttemptInfo> attempts = new ConcurrentHashMap<>();

//     public void recordFailure(String username) {
//         AttemptInfo info = attempts.computeIfAbsent(username, k -> new AttemptInfo());
//         info.count++;

//         // ✅ LOCK only after 6 attempts
//         if (info.count >= lockThreshold) {
//             info.lockUntil = LocalDateTime.now().plusMinutes(lockoutMinutes);
//         }
//     }

//     public void resetAttempts(String username) {
//         attempts.remove(username);
//     }

//     public boolean isLocked(String username) {
//         AttemptInfo info = attempts.get(username);
//         if (info == null || info.lockUntil == null) return false;

//         if (LocalDateTime.now().isAfter(info.lockUntil)) {
//             attempts.remove(username);
//             return false;
//         }
//         return true;
//     }

//     public int getFailureCount(String username) {
//         AttemptInfo info = attempts.get(username);
//         return info == null ? 0 : info.count;
//     }

//     // ✅ CAPTCHA only between 3–5 (before lock)
//     public boolean requiresCaptcha(String username) {
//         int count = getFailureCount(username);
//         return count >= captchaThreshold && count < lockThreshold;
//     }
// }


