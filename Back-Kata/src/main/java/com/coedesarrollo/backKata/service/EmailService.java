package com.coedesarrollo.backKata.service;

import com.coedesarrollo.backKata.model.RequestEntity;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.regex.Pattern;

@Service
@Slf4j
public class EmailService {

    @Value("${app.mail.from:no-reply@kata.local}")
    private String from;

    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@(.+)$");

    public void sendApprovalPending(String approverEmail, RequestEntity request) {
        if (approverEmail == null || approverEmail.isBlank()) {
            log.warn("⚠️ Intento de envío de correo a dirección vacía o nula. ID Solicitud: {}", request.getId());
            return;
        }

        if (!EMAIL_PATTERN.matcher(approverEmail).matches()) {
            log.error("❌ Formato de correo inválido: '{}'. No se enviará notificación.", approverEmail);
            return;
        }

        String subject = "Nueva Solicitud Pendiente: " + nullSafe(request.getTitle());
        String body = buildHtmlBody(request);
        
        log.info("═══════════════════════════════════════════════════════════════");
        log.info("📧 SIMULACIÓN DE ENVÍO DE EMAIL");
        log.info("═══════════════════════════════════════════════════════════════");
        log.info("De: {}", from);
        log.info("Para: {}", approverEmail);
        log.info("Asunto: {}", subject);
        log.info("───────────────────────────────────────────────────────────────");
        log.info("Contenido del email:");
        log.info("{}", body);
        log.info("───────────────────────────────────────────────────────────────");
        log.info("✅ Email simulado enviado exitosamente a [{}] para solicitud ID: {}", approverEmail, request.getId());
        log.info("═══════════════════════════════════════════════════════════════");
    }

    

    private String buildHtmlBody(RequestEntity request) {
        return """
            <html>
              <body>
                <p><strong>Título:</strong> %s</p>
                <p><strong>Solicitante:</strong> %s</p>
                <p><strong>Tipo:</strong> %s</p>
              </body>
            </html>
            """.formatted(
                escapeHtml(nullSafe(request.getTitle())),
                escapeHtml(nullSafe(request.getRequesterName())),
                escapeHtml(nullSafe(request.getType()))
        );
    }

    
    private String nullSafe(String s) {
        return s == null ? "N/A" : s;
    }

    
    private String escapeHtml(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;");
    }
}