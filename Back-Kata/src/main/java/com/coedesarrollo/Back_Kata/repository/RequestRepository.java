package com.coedesarrollo.Back_Kata.repository;

import com.coedesarrollo.Back_Kata.model.RequestEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface RequestRepository extends JpaRepository<RequestEntity, UUID> {
    // ¡Listo! Spring Boot implementa todo lo básico (guardar, buscar, borrar) automáticamente.
}