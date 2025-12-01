package com.coedesarrollo.backKata.service;

import com.coedesarrollo.backKata.dto.AuthenticationRequest;
import com.coedesarrollo.backKata.dto.AuthenticationResponse;
import com.coedesarrollo.backKata.dto.RegisterRequest;
import com.coedesarrollo.backKata.exception.ResourceConflictException;
import com.coedesarrollo.backKata.repository.UserRepository;
import com.coedesarrollo.backKata.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthenticationServiceTest {

    @Mock UserRepository repository;
    @Mock PasswordEncoder passwordEncoder;
    @Mock JwtService jwtService;
    @Mock AuthenticationManager authenticationManager;

    AuthenticationService service;

    @BeforeEach
    void setup() {
        service = new AuthenticationService(repository, passwordEncoder, jwtService, authenticationManager);
        
        
        org.springframework.test.util.ReflectionTestUtils.setField(service, "allowedEmailDomain", "");
    }

    @Test
    void register_creaUsuario_yDevuelveToken() {
        RegisterRequest req = new RegisterRequest("user@example.com", "pass", "USER");
        when(repository.existsByUsername("user@example.com")).thenReturn(false);
        when(passwordEncoder.encode("pass")).thenReturn("ENCODED");
        when(jwtService.generateToken("user@example.com")).thenReturn("JWT");

        AuthenticationResponse res = service.register(req);

        assertEquals("JWT", res.token());
        verify(repository).save(argThat(u -> u.getUsername().equals("user@example.com") && u.getPassword().equals("ENCODED")));
    }

    @Test
    void register_rechazaFormatoInvalido() {
        RegisterRequest req = new RegisterRequest("invalid", "pass", "USER");
        assertThrows(IllegalArgumentException.class, () -> service.register(req));
    }

    @Test
    void register_rechazaDominioPermitido() {
        org.springframework.test.util.ReflectionTestUtils.setField(service, "allowedEmailDomain", "corp.local");
        RegisterRequest req = new RegisterRequest("user@example.com", "pass", "USER");
        assertThrows(IllegalArgumentException.class, () -> service.register(req));
    }

    @Test
    void register_conflictoSiExisteUsuario() {
        RegisterRequest req = new RegisterRequest("user@example.com", "pass", "USER");
        when(repository.existsByUsername("user@example.com")).thenReturn(true);
        assertThrows(ResourceConflictException.class, () -> service.register(req));
    }

    @Test
    void authenticate_fallaSiUsuarioNoExiste() {
        when(repository.existsByUsername("user@example.com")).thenReturn(false);
        AuthenticationRequest req = new AuthenticationRequest("user@example.com", "pass");
        assertThrows(org.springframework.security.authentication.BadCredentialsException.class, () -> service.authenticate(req));
    }

    @Test
    void authenticate_okDevuelveToken() {
        when(repository.existsByUsername("user@example.com")).thenReturn(true);
        when(jwtService.generateToken("user@example.com")).thenReturn("JWT");
        AuthenticationRequest req = new AuthenticationRequest("user@example.com", "pass");

        AuthenticationResponse res = service.authenticate(req);

        assertEquals("JWT", res.token());
        verify(authenticationManager).authenticate(any());
    }

    @Test
    void authenticate_normalizaUsuario_trim_y_lowercase() {
        when(repository.existsByUsername("user@example.com")).thenReturn(true);
        when(jwtService.generateToken("user@example.com")).thenReturn("JWT");
        AuthenticationRequest req = new AuthenticationRequest("  User@Example.com  ", "pass");
        AuthenticationResponse res = service.authenticate(req);
        assertEquals("JWT", res.token());
        verify(repository).existsByUsername("user@example.com");
        verify(authenticationManager).authenticate(argThat(auth -> ((org.springframework.security.authentication.UsernamePasswordAuthenticationToken) auth).getPrincipal().equals("user@example.com")));
    }

    @Test
    void authenticate_lanzaBadCredentials_siPasswordIncorrecta() {
        when(repository.existsByUsername("user@example.com")).thenReturn(true);
        doThrow(new org.springframework.security.authentication.BadCredentialsException("bad"))
                .when(authenticationManager).authenticate(any());
        AuthenticationRequest req = new AuthenticationRequest("user@example.com", "wrong");
        assertThrows(org.springframework.security.authentication.BadCredentialsException.class, () -> service.authenticate(req));
    }

    @Test
    void register_normalizaUsuario_trim_y_lowercase() {
        RegisterRequest req = new RegisterRequest("  USER@EXAMPLE.COM  ", "pass", "USER");
        when(repository.existsByUsername("user@example.com")).thenReturn(false);
        when(passwordEncoder.encode("pass")).thenReturn("ENC");
        when(jwtService.generateToken("user@example.com")).thenReturn("JWT");
        AuthenticationResponse res = service.register(req);
        assertEquals("JWT", res.token());
        verify(repository).save(argThat(u -> u.getUsername().equals("user@example.com")));
    }
}
