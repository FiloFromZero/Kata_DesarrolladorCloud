package com.coedesarrollo.backKata.controller;

import com.coedesarrollo.backKata.dto.RequestRecord;
import com.coedesarrollo.backKata.dto.RequestUpdateRecord;
import com.coedesarrollo.backKata.model.RequestEntity;
import com.coedesarrollo.backKata.model.RequestHistory;
import com.coedesarrollo.backKata.service.RequestService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "Requests", description = "Gestión de solicitudes")
@RestController
@RequestMapping("/api/requests")
@RequiredArgsConstructor
public class RequestController {

    private final RequestService service;

    
    @Operation(summary = "Listar todas las solicitudes")
    @GetMapping
    public List<RequestEntity> getAll() {
        return service.getAll();
    }

    
    @Operation(summary = "Crear una nueva solicitud")
    @PostMapping
    public ResponseEntity<RequestEntity> create(@Valid @RequestBody RequestRecord dto) {
        return ResponseEntity.ok(service.create(dto));
    }

    
    @Operation(summary = "Actualizar estado de una solicitud (aprobar/rechazar)")
    @PatchMapping("/{id}")
    public ResponseEntity<RequestEntity> updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody RequestUpdateRecord dto) {
        return ResponseEntity.ok(service.updateStatus(id, dto));
    }

    @Operation(summary = "Historial de cambios de una solicitud")
    @GetMapping("/{id}/history")
    public ResponseEntity<List<RequestHistory>> history(@PathVariable UUID id) {
        return ResponseEntity.ok(service.history(id));
    }

  @Operation(summary = "Historial paginado de una solicitud")
  @GetMapping("/{id}/history/paged")
  public ResponseEntity<Page<RequestHistory>> historyPaged(
            @PathVariable UUID id,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "50") int size
    ) {
    return ResponseEntity.ok(service.history(id, page, size));
  }

  @Operation(summary = "Solicitudes asignadas a mí (paginado)")
  @GetMapping("/assigned")
  public ResponseEntity<Page<RequestEntity>> assigned(
          @RequestParam(name = "page", defaultValue = "0") int page,
          @RequestParam(name = "size", defaultValue = "50") int size
  ) {
      return ResponseEntity.ok(service.getAssignedToMe(page, size));
  }

  @Operation(summary = "Solicitudes creadas por mí (paginado)")
  @GetMapping("/created")
  public ResponseEntity<Page<RequestEntity>> created(
          @RequestParam(name = "page", defaultValue = "0") int page,
          @RequestParam(name = "size", defaultValue = "50") int size
  ) {
      return ResponseEntity.ok(service.getCreatedByMe(page, size));
  }

  @Operation(summary = "KPIs de mis solicitudes")
  @GetMapping("/kpis")
  public ResponseEntity<java.util.Map<String, Long>> kpis() {
      return ResponseEntity.ok(service.getKpisForMe());
  }
}
