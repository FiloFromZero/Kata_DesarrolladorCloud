package com.coedesarrollo.Back_Kata.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "users", uniqueConstraints = {@UniqueConstraint(columnNames = "username")})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String username; // El "usuario de red"

    @Column(nullable = false)
    private String password; // La contraseña encriptada

    @Column(nullable = false)
    private String role; // "USER" o "ADMIN"
}