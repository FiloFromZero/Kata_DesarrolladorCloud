package com.coedesarrollo.backKata.service;

import com.coedesarrollo.backKata.dto.AuthenticationRequest;
import com.coedesarrollo.backKata.dto.AuthenticationResponse;
import com.coedesarrollo.backKata.dto.RegisterRequest;
import com.coedesarrollo.backKata.model.UserEntity;
import com.coedesarrollo.backKata.repository.UserRepository;
import com.coedesarrollo.backKata.security.JwtService;
import com.coedesarrollo.backKata.exception.ResourceConflictException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import javax.naming.directory.DirContext;
import javax.naming.directory.InitialDirContext;
import javax.naming.directory.Attributes;
import javax.naming.NamingException;
import javax.naming.directory.Attribute;
import java.util.Hashtable;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    @Value("${app.allowed-email-domain:}")
    private String allowedEmailDomain;

    public AuthenticationResponse register(RegisterRequest request) {
        String email = request.username().trim().toLowerCase();
        if (allowedEmailDomain != null && !allowedEmailDomain.isBlank() && !email.endsWith("@" + allowedEmailDomain)) {
            throw new IllegalArgumentException("El correo debe pertenecer al dominio permitido");
        }
        int at = email.lastIndexOf('@');
        if (at <= 0 || at == email.length() - 1) {
            throw new IllegalArgumentException("Formato de correo inválido");
        }
        String domain = email.substring(at + 1);
        if (!hasMxRecord(domain)) {
            throw new IllegalArgumentException("El dominio de correo no tiene registros MX válidos");
        }
        if (repository.existsByUsername(email)) {
            throw new ResourceConflictException("El correo ya está registrado");
        }
        var user = UserEntity.builder()
                .username(email)
                .password(passwordEncoder.encode(request.password()))
                .role(request.role() != null ? request.role() : "USER")
                .build();
        repository.save(user);
        var jwtToken = jwtService.generateToken(user.getUsername());
        return new AuthenticationResponse(jwtToken);
    }

    private boolean hasMxRecord(String domain) {
        try {
            Hashtable<String, String> env = new Hashtable<>();
            env.put("java.naming.factory.initial", "com.sun.jndi.dns.DnsContextFactory");
            DirContext ictx = new InitialDirContext(env);
            Attributes attrs = ictx.getAttributes(domain, new String[]{"MX"});
            Attribute attr = attrs.get("MX");
            return attr != null && attr.size() > 0;
        } catch (NamingException ex) {
            return false;
        }
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        String username = request.username().trim().toLowerCase();
        if (!repository.existsByUsername(username)) {
            throw new org.springframework.security.authentication.BadCredentialsException("Usuario o contraseña inválidos");
        }
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(username, request.password()));
        var jwtToken = jwtService.generateToken(username);
        return new AuthenticationResponse(jwtToken);
    }
}
