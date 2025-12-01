package com.coedesarrollo.backKata.dto;

import jakarta.validation.constraints.NotNull;
import com.coedesarrollo.backKata.model.RequestStatus;

public record RequestUpdateRecord(
        @NotNull(message = "El estado es obligatorio") RequestStatus status,
        String comments 
) {}