package com.coedesarrollo.backKata.service;

import com.coedesarrollo.backKata.model.RequestEntity;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EmailService {

    public void sendApprovalPending(String approverEmail, RequestEntity request) {
        if (approverEmail == null || approverEmail.isBlank()) return;
        log.info("Notificación de aprobación pendiente enviada a {} para solicitud {} - {}", approverEmail, request.getId(), request.getTitle());
    }
}
