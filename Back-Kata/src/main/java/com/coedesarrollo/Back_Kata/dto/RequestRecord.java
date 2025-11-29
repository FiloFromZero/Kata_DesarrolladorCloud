package com.coedesarrollo.Back_Kata.dto;

import jakarta.validation.constraints.NotBlank;

public record RequestRecord(
        @NotBlank(message = "El título es requerido") String title,
        String description,
        @NotBlank(message = "El solicitante es requerido") String requesterName,
        @NotBlank(message = "El aprobador es requerido") String approverName,
        @NotBlank(message = "El tipo es requerido") String type
) {}