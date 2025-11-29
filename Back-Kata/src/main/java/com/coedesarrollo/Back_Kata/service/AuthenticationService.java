package com.coedesarrollo.Back_Kata.service;

import com.coedesarrollo.Back_Kata.dto.AuthenticationRequest;
import com.coedesarrollo.Back_Kata.dto.AuthenticationResponse;
import com.coedesarrollo.Back_Kata.dto.RegisterRequest;
import com.coedesarrollo.Back_Kata.model.UserEntity;
import com.coedesarrollo.Back_Kata.repository.UserRepository;
import com.coedesarrollo.Back_Kata.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthenticationResponse register(RegisterRequest request) {
        var user = UserEntity.builder()
                .username(request.username())
                .password(passwordEncoder.encode(request.password()))
                .role(request.role() != null ? request.role() : "USER")
                .build();
        repository.save(user);
        var jwtToken = jwtService.generateToken(user.getUsername());
        return new AuthenticationResponse(jwtToken);
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.username(),
                        request.password()
                )
        );
        var user = repository.findByUsername(request.username())
                .orElseThrow();
        var jwtToken = jwtService.generateToken(user.getUsername());
        return new AuthenticationResponse(jwtToken);
    }
}