package com.coedesarrollo.backKata.service;

import com.coedesarrollo.backKata.dto.RequestRecord;
import com.coedesarrollo.backKata.dto.RequestUpdateRecord;
import com.coedesarrollo.backKata.exception.ResourceNotFoundException; // <--- Importar
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

    public List<RequestEntity> getAll() {
        return repository.findAll();
    }

    public RequestEntity create(RequestRecord dto) {
        RequestEntity entity = RequestEntity.builder()
                .title(dto.title())
                .description(dto.description())
                .requesterName(dto.requesterName())
                .approverName(dto.approverName())
                .type(dto.type())
                .status(RequestStatus.PENDING)
                .build();
        return repository.save(entity);
    }

    public RequestEntity updateStatus(UUID id, RequestUpdateRecord dto) {
        // AQUÍ ESTÁ EL CAMBIO 👇
        RequestEntity request = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró la solicitud con ID: " + id));

        request.setStatus(dto.status());
        if (dto.comments() != null && !dto.comments().isBlank()) {
            request.setComments(dto.comments());
        }

        return repository.save(request);
    }
}