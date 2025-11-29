package com.coedesarrollo.Back_Kata.dto;

import jakarta.validation.constraints.NotNull;
import com.coedesarrollo.Back_Kata.model.RequestStatus;

public record RequestUpdateRecord(
        @NotNull(message = "El estado es obligatorio") RequestStatus status,
        String comments // Opcional (aunque el PDF sugiere que es vital para rechazos)
) {}