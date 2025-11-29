package com.coedesarrollo.Back_Kata.repository;

import com.coedesarrollo.Back_Kata.model.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<UserEntity, UUID> {
    // Método mágico para buscar por nombre de usuario
    Optional<UserEntity> findByUsername(String username);
}