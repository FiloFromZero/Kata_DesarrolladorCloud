package com.coedesarrollo.backKata.service;

import com.coedesarrollo.backKata.model.RequestEntity;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class EmailServiceTest {

    @Test
    void sendApprovalPending_simulaEnvioCuandoEmailValido() {
        EmailService svc = new EmailService();
        ReflectionTestUtils.setField(svc, "from", "no-reply@kata.local");

        RequestEntity req = RequestEntity.builder()
                .id(java.util.UUID.randomUUID())
                .title("Prueba")
                .requesterName("alice@local")
                .type("deployment")
                .build();
        
        assertDoesNotThrow(() -> svc.sendApprovalPending("bob@local", req));
    }

    @Test
    void sendApprovalPending_noSimulaSiEmailVacio() {
        EmailService svc = new EmailService();
        ReflectionTestUtils.setField(svc, "from", "no-reply@kata.local");

        RequestEntity req = RequestEntity.builder()
                .id(java.util.UUID.randomUUID())
                .title("Prueba")
                .build();
        
        assertDoesNotThrow(() -> svc.sendApprovalPending("", req));
    }

    @Test
    void sendApprovalPending_noSimulaSiEmailInvalido() {
        EmailService svc = new EmailService();
        ReflectionTestUtils.setField(svc, "from", "no-reply@kata.local");

        RequestEntity req = RequestEntity.builder()
                .id(java.util.UUID.randomUUID())
                .title("Prueba")
                .requesterName("alice@local")
                .type("deployment")
                .build();
        
        assertDoesNotThrow(() -> svc.sendApprovalPending("email-invalido", req));
    }

    @Test
    void sendApprovalPending_noSimulaSiEmailNull() {
        EmailService svc = new EmailService();
        ReflectionTestUtils.setField(svc, "from", "no-reply@kata.local");

        RequestEntity req = RequestEntity.builder()
                .id(java.util.UUID.randomUUID())
                .title("Prueba")
                .build();
        
        assertDoesNotThrow(() -> svc.sendApprovalPending(null, req));
    }
}
