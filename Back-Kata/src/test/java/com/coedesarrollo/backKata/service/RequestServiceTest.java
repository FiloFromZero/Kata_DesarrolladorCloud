package com.coedesarrollo.backKata.service;

import com.coedesarrollo.backKata.dto.RequestRecord;
import com.coedesarrollo.backKata.dto.RequestUpdateRecord;
import com.coedesarrollo.backKata.exception.ResourceConflictException;
import com.coedesarrollo.backKata.exception.ResourceNotFoundException;
import com.coedesarrollo.backKata.model.RequestEntity;
import com.coedesarrollo.backKata.model.RequestHistory;
import com.coedesarrollo.backKata.model.RequestStatus;
import com.coedesarrollo.backKata.repository.RequestHistoryRepository;
import com.coedesarrollo.backKata.repository.RequestRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RequestServiceTest {

    @Mock RequestRepository repository;
    @Mock RequestHistoryRepository historyRepository;
    @Mock EmailService emailService;

    RequestService service;
    Clock fixedClock;

    @BeforeEach
    void setup() {
        fixedClock = Clock.fixed(Instant.parse("2025-01-01T12:00:00Z"), ZoneOffset.UTC);
        service = new RequestService(repository, historyRepository, emailService, fixedClock);
        SecurityContextHolder.getContext().setAuthentication(new TestingAuthenticationToken("tester@local", "pwd"));
    }

    @Test
    void create_guardaSolicitud_historial_y_enviaCorreo() {
        RequestRecord dto = new RequestRecord("Titulo", "Desc", "alice@local", "bob@local", "deployment");
        when(repository.save(any(RequestEntity.class))).thenAnswer(inv -> inv.getArgument(0));

        RequestEntity res = service.create(dto);

        assertNotNull(res);
        assertEquals(LocalDateTime.ofInstant(Instant.parse("2025-01-01T12:00:00Z"), ZoneOffset.UTC), res.getUpdatedAt());
        assertEquals("tester@local", res.getUpdatedBy());
        verify(historyRepository).save(any(RequestHistory.class));
        verify(emailService).sendApprovalPending(eq("bob@local"), any(RequestEntity.class));
    }

    @Test
    void create_lanzaConflict_siAprobadorEsMismoSolicitante() {
        RequestRecord dto = new RequestRecord("Titulo", "Desc", "alice@local", "tester@local", "deployment");
        assertThrows(ResourceConflictException.class, () -> service.create(dto));
        verify(repository, never()).save(any());
    }

    @Test
    void updateStatus_lanzaNotFound_siNoExiste() {
        UUID id = UUID.randomUUID();
        when(repository.findById(id)).thenReturn(Optional.empty());
        RequestUpdateRecord dto = new RequestUpdateRecord(RequestStatus.APPROVED, "ok");
        assertThrows(ResourceNotFoundException.class, () -> service.updateStatus(id, dto));
    }

    @Test
    void updateStatus_lanzaConflict_siNoPendiente() {
        UUID id = UUID.randomUUID();
        RequestEntity entity = RequestEntity.builder().id(id).status(RequestStatus.APPROVED).build();
        when(repository.findById(id)).thenReturn(Optional.of(entity));
        RequestUpdateRecord dto = new RequestUpdateRecord(RequestStatus.REJECTED, "no");
        assertThrows(ResourceConflictException.class, () -> service.updateStatus(id, dto));
    }

    @Test
    void updateStatus_actualiza_y_guardaHistorial() {
        UUID id = UUID.randomUUID();
        RequestEntity entity = RequestEntity.builder().id(id).status(RequestStatus.PENDING).build();
        when(repository.findById(id)).thenReturn(Optional.of(entity));
        when(repository.save(any(RequestEntity.class))).thenAnswer(inv -> inv.getArgument(0));
        RequestUpdateRecord dto = new RequestUpdateRecord(RequestStatus.APPROVED, "ok");

        RequestEntity res = service.updateStatus(id, dto);

        assertEquals(RequestStatus.APPROVED, res.getStatus());
        assertEquals(LocalDateTime.ofInstant(Instant.parse("2025-01-01T12:00:00Z"), ZoneOffset.UTC), res.getUpdatedAt());
        assertEquals("tester@local", res.getUpdatedBy());
        verify(historyRepository).save(any(RequestHistory.class));
    }

    @Test
    void create_noEnviaCorreo_siApproverVacio() {
        RequestRecord dto = new RequestRecord("Titulo", "Desc", "alice@local", "", "deployment");
        when(repository.save(any(RequestEntity.class))).thenAnswer(inv -> inv.getArgument(0));
        RequestEntity res = service.create(dto);
        verify(emailService, never()).sendApprovalPending(anyString(), any(RequestEntity.class));
    }

    @Test
    void history_lanzaNotFound_siNoExiste() {
        UUID id = UUID.randomUUID();
        when(repository.findById(id)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> service.history(id));
    }
}
