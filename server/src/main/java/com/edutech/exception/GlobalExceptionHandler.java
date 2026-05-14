package com.edutech.exception;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import javax.persistence.EntityNotFoundException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

     // Helper: build the standard error response body
     private Map<String, Object> buildError(int status, String error, String message, Map<String, String> details) {
          Map<String, Object> body = new HashMap<>();
          body.put("timestamp", LocalDateTime.now().toString());
          body.put("status", status);
          body.put("error", error);
          body.put("message", message);
          body.put("details", details != null ? details : new HashMap<>());
          return body;
     }

     // 400 — Bean Validation failed (@Valid on @RequestBody)
     @ExceptionHandler(MethodArgumentNotValidException.class)
     public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
          Map<String, String> fieldErrors = new HashMap<>();
          for (FieldError fe : ex.getBindingResult().getFieldErrors()) {
               fieldErrors.put(fe.getField(), fe.getDefaultMessage());
          }
          return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(buildError(400, "Bad Request", "Validation failed", fieldErrors));
     }

     // 401 — Wrong username or password
     @ExceptionHandler(BadCredentialsException.class)
     public ResponseEntity<Map<String, Object>> handleBadCredentials(BadCredentialsException ex) {
          return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(buildError(401, "Unauthorized", ex.getMessage(), null));
     }

     // 403 — Authenticated but wrong role
     @ExceptionHandler(AccessDeniedException.class)
     public ResponseEntity<Map<String, Object>> handleAccessDenied(AccessDeniedException ex) {
          return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(buildError(403, "Forbidden", ex.getMessage(), null));
     }

     // 404 — Entity not found
     @ExceptionHandler(EntityNotFoundException.class)
     public ResponseEntity<Map<String, Object>> handleEntityNotFound(EntityNotFoundException ex) {
          return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(buildError(404, "Not Found", ex.getMessage(), null));
     }

     // 409 — Conflict (pilot already assigned)
     @ExceptionHandler(IllegalStateException.class)
     public ResponseEntity<Map<String, Object>> handleIllegalState(IllegalStateException ex) {
          return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(buildError(409, "Conflict", ex.getMessage(), null));
     }

     // 500 — Any other unhandled exception
     @ExceptionHandler(Exception.class)
     public ResponseEntity<Map<String, Object>> handleGeneric(Exception ex) {
          return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(buildError(500, "Internal Server Error", ex.getMessage(), null));
     }
}