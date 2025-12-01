package com.coedesarrollo.backKata.service;

import com.coedesarrollo.backKata.dto.RequestRecord;
import com.coedesarrollo.backKata.dto.RequestUpdateRecord;
import com.coedesarrollo.backKata.exception.ResourceNotFoundException; 
import com.coedesarrollo.backKata.exception.ResourceConflictException;
import com.coedesarrollo.backKata.model.RequestEntity;
import com.coedesarrollo.backKata.model.RequestHistory;
import com.coedesarrollo.backKata.model.RequestStatus;
import com.coedesarrollo.backKata.repository.RequestRepository;
import com.coedesarrollo.backKata.repository.RequestHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import java.time.Clock;
import java.time.LocalDateTime;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RequestService {

    private final RequestRepository repository;
    private final RequestHistoryRepository historyRepository;
    private final EmailService emailService;
    private final Clock clock;

    public List<RequestEntity> getAll() {
        return repository.findAll();
    }

    public RequestEntity create(RequestRecord dto) {
        String actor = SecurityContextHolder.getContext().getAuthentication() != null ? SecurityContextHolder.getContext().getAuthentication().getName() : null;
        if (dto.approverName() != null && actor != null && dto.approverName().trim().equalsIgnoreCase(actor.trim())) {
            throw new ResourceConflictException("El aprobador no puede ser el mismo solicitante");
        }
        RequestEntity entity = RequestEntity.builder()
                .title(dto.title())
                .description(dto.description())
                .requesterName(actor != null ? actor : dto.requesterName())
                .approverName(dto.approverName())
                .type(dto.type())
                .status(RequestStatus.PENDING)
                .build();
        RequestEntity saved = repository.save(entity);
        saved.setUpdatedAt(LocalDateTime.now(clock));
        saved.setUpdatedBy(actor);
        saved = repository.save(saved);
        RequestHistory history = RequestHistory.builder()
                .request(saved)
                .status(RequestStatus.PENDING)
                .comments(null)
                .actor(actor)
                .timestamp(LocalDateTime.now(clock))
                .build();
        historyRepository.save(history);
        
        String approver = saved.getApproverName();
        if (approver != null && !approver.isBlank()) {
            emailService.sendApprovalPending(approver, saved);
        }
        return saved;
    }

    public RequestEntity updateStatus(UUID id, RequestUpdateRecord dto) {
        
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
        request.setUpdatedAt(LocalDateTime.now(clock));
        request.setUpdatedBy(actor);
        RequestEntity saved = repository.save(request);
        RequestHistory history = RequestHistory.builder()
                .request(saved)
                .status(dto.status())
                .comments(dto.comments())
                .actor(actor)
                .timestamp(LocalDateTime.now(clock))
                .build();
        historyRepository.save(history);
        return saved;
    }

  public List<RequestHistory> history(UUID id) {
        repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró la solicitud con ID: " + id));
        return historyRepository.findByRequest_IdOrderByTimestampDesc(id);
    }

  public Page<RequestHistory> history(UUID id, int page, int size) {
        repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró la solicitud con ID: " + id));
        PageRequest pr = PageRequest.of(Math.max(0, page), Math.max(1, size), Sort.by(Sort.Direction.DESC, "timestamp"));
    return historyRepository.findByRequest_Id(id, pr);
  }

  public Page<RequestEntity> getAssignedToMe(int page, int size) {
    String actor = SecurityContextHolder.getContext().getAuthentication() != null ? SecurityContextHolder.getContext().getAuthentication().getName() : null;
    PageRequest pr = PageRequest.of(Math.max(0, page), Math.max(1, size), Sort.by(Sort.Direction.DESC, "updatedAt"));
    return repository.findByApproverNameOrderByUpdatedAtDesc(actor, pr);
  }

  public Page<RequestEntity> getCreatedByMe(int page, int size) {
    String actor = SecurityContextHolder.getContext().getAuthentication() != null ? SecurityContextHolder.getContext().getAuthentication().getName() : null;
    PageRequest pr = PageRequest.of(Math.max(0, page), Math.max(1, size), Sort.by(Sort.Direction.DESC, "updatedAt"));
    return repository.findByRequesterNameOrderByUpdatedAtDesc(actor, pr);
  }

  public java.util.Map<String, Long> getKpisForMe() {
    String actor = SecurityContextHolder.getContext().getAuthentication() != null ? SecurityContextHolder.getContext().getAuthentication().getName() : null;
    long pending = repository.countByApproverNameAndStatus(actor, RequestStatus.PENDING);
    long processed = repository.countByApproverNameAndStatusNot(actor, RequestStatus.PENDING);
    java.util.Map<String, Long> map = new java.util.HashMap<>();
    map.put("pending", pending);
    map.put("processed", processed);
    return map;
  }
}
