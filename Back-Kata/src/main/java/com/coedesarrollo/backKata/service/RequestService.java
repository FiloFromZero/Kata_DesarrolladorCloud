package com.coedesarrollo.backKata.service;

import com.coedesarrollo.backKata.dto.RequestRecord;
import com.coedesarrollo.backKata.dto.RequestUpdateRecord;
import com.coedesarrollo.backKata.exception.ResourceNotFoundException; // <--- Importar
import com.coedesarrollo.backKata.exception.ResourceConflictException;
import com.coedesarrollo.backKata.model.RequestEntity;
import com.coedesarrollo.backKata.model.RequestHistory;
import com.coedesarrollo.backKata.model.RequestStatus;
import com.coedesarrollo.backKata.repository.RequestRepository;
import com.coedesarrollo.backKata.repository.RequestHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.security.core.context.SecurityContextHolder;
import java.time.LocalDateTime;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RequestService {

    private final RequestRepository repository;
    private final RequestHistoryRepository historyRepository;
    private final EmailService emailService;

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
        RequestEntity saved = repository.save(entity);
        String actor = SecurityContextHolder.getContext().getAuthentication() != null ? SecurityContextHolder.getContext().getAuthentication().getName() : null;
        saved.setUpdatedAt(LocalDateTime.now());
        saved.setUpdatedBy(actor);
        saved = repository.save(saved);
        RequestHistory history = RequestHistory.builder()
                .request(saved)
                .status(RequestStatus.PENDING)
                .comments(null)
                .actor(actor)
                .timestamp(LocalDateTime.now())
                .build();
        historyRepository.save(history);
        emailService.sendApprovalPending(saved.getApproverName(), saved);
        return saved;
    }

    public RequestEntity updateStatus(UUID id, RequestUpdateRecord dto) {
        // AQUÍ ESTÁ EL CAMBIO 👇
        RequestEntity request = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró la solicitud con ID: " + id));

        if (request.getStatus() != RequestStatus.PENDING) {
            throw new ResourceConflictException("La solicitud ya fue procesada y no puede modificarse");
        }

        request.setStatus(dto.status());
        if (dto.comments() != null && !dto.comments().isBlank()) {
            request.setComments(dto.comments());
        }
        String actor = SecurityContextHolder.getContext().getAuthentication() != null ? SecurityContextHolder.getContext().getAuthentication().getName() : null;
        request.setUpdatedAt(LocalDateTime.now());
        request.setUpdatedBy(actor);
        RequestEntity saved = repository.save(request);
        RequestHistory history = RequestHistory.builder()
                .request(saved)
                .status(dto.status())
                .comments(dto.comments())
                .actor(actor)
                .timestamp(LocalDateTime.now())
                .build();
        historyRepository.save(history);
        return saved;
    }

    public List<RequestHistory> history(UUID id) {
        repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró la solicitud con ID: " + id));
        return historyRepository.findByRequest_IdOrderByTimestampDesc(id);
    }
}
