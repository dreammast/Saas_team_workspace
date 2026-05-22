package com.projectflow.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.projectflow.dto.GoogleRegisterRequest;
import com.projectflow.dto.LoginRequest;
import com.projectflow.dto.LoginResponse;
import com.projectflow.dto.RegisterRequest;
import com.projectflow.entity.User;
import com.projectflow.service.AuthService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register")
    public ResponseEntity<User> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/register/google")
    public ResponseEntity<LoginResponse> registerGoogle(@Valid @RequestBody GoogleRegisterRequest request) {
        return ResponseEntity.ok(authService.loginOrRegisterGoogleUser(request));
    }
}
