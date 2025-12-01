package com.coedesarrollo.backKata.service;

import com.coedesarrollo.backKata.model.RequestEntity;
import jakarta.mail.Message;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeBodyPart;
import jakarta.mail.internet.MimeMessage;
import jakarta.mail.internet.MimeMultipart;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    
    @Value("${app.mail.from}")
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

        try {
            
            MimeMessage message = mailSender.createMimeMessage();

            
            message.setFrom(new InternetAddress(from));
            message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(approverEmail));
            message.setSubject("Nueva Solicitud Pendiente: " + nullSafe(request.getTitle()), "UTF-8");

            
            String body = buildHtmlBody(request);
            MimeBodyPart htmlPart = new MimeBodyPart();
            htmlPart.setContent(body, "text/html; charset=UTF-8");

            MimeMultipart multipart = new MimeMultipart();
            multipart.addBodyPart(htmlPart);
            message.setContent(multipart);
            message.saveChanges();

            
            mailSender.send(message);
            log.info("✅ Correo enviado exitosamente a [{}] para solicitud ID: {}", approverEmail, request.getId());

        } catch (Exception ex) {
            
            
            log.error("🔥 Error crítico enviando correo a [{}]: {}", approverEmail, ex.getMessage());
        }
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