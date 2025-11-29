package com.coedesarrollo.backKata.service;

import com.coedesarrollo.backKata.dto.RequestRecord;
import com.coedesarrollo.backKata.dto.RequestUpdateRecord;
import com.coedesarrollo.backKata.model.RequestEntity;
import com.coedesarrollo.backKata.model.RequestStatus;
import com.coedesarrollo.backKata.repository.RequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RequestService {

    private final RequestRepository repository;

    // Obtener todas
    public List<RequestEntity> getAll() {
        return repository.findAll();
    }

    // Crear solicitud
    public RequestEntity create(RequestRecord dto) {
        RequestEntity entity = RequestEntity.builder()
                .title(dto.title())
                .description(dto.description())
                .requesterName(dto.requesterName())
                .approverName(dto.approverName())
                .type(dto.type())
                .status(RequestStatus.PENDING) // Siempre inicia Pendiente
                .build();
        return repository.save(entity);
    }

    // Actualizar estado (Aprobar/Rechazar)
    public RequestEntity updateStatus(UUID id, RequestUpdateRecord dto) {
        RequestEntity request = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada"));

        request.setStatus(dto.status());
        // Solo actualizamos comentario si viene algo escrito
        if (dto.comments() != null && !dto.comments().isBlank()) {
            request.setComments(dto.comments());
        }

        return repository.save(request);
    }
}