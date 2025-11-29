package com.coedesarrollo.Back_Kata.controller;

import com.coedesarrollo.Back_Kata.dto.RequestRecord;
import com.coedesarrollo.Back_Kata.dto.RequestUpdateRecord;
import com.coedesarrollo.Back_Kata.model.RequestEntity;
import com.coedesarrollo.Back_Kata.service.RequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/requests")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class RequestController {

    private final RequestService service;

    // GET: Ver todas las solicitudes
    @GetMapping
    public List<RequestEntity> getAll() {
        return service.getAll();
    }

    // POST: Crear una nueva solicitud
    @PostMapping
    public ResponseEntity<RequestEntity> create(@Valid @RequestBody RequestRecord dto) {
        return ResponseEntity.ok(service.create(dto));
    }

    // PATCH: Aprobar o Rechazar (cambiar estado)
    @PatchMapping("/{id}")
    public ResponseEntity<RequestEntity> updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody RequestUpdateRecord dto) { // Ojo: Asegúrate de que coincida con el nombre de tu Record
        return ResponseEntity.ok(service.updateStatus(id, dto));
    }
}