package com.coedesarrollo.backKata.service;

import com.coedesarrollo.backKata.model.RequestEntity;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import jakarta.mail.Session;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import jakarta.mail.internet.MimeMultipart;
import jakarta.mail.BodyPart;
import java.util.Properties;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class EmailServiceTest {

    @Test
    void sendApprovalPending_enviaCorreoCuandoEmailValido() throws Exception {
        JavaMailSender mailSender = mock(JavaMailSender.class);
        Session session = Session.getDefaultInstance(new Properties());
        MimeMessage mimeMessage = new MimeMessage(session);
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
        EmailService svc = new EmailService(mailSender);
        ReflectionTestUtils.setField(svc, "from", "no-reply@kata.local");

        RequestEntity req = RequestEntity.builder().id(java.util.UUID.randomUUID()).title("Prueba").requesterName("alice@local").type("deployment").build();
        svc.sendApprovalPending("bob@local", req);

        ArgumentCaptor<MimeMessage> captor = ArgumentCaptor.forClass(MimeMessage.class);
        verify(mailSender).send(captor.capture());
        MimeMessage sent = captor.getValue();
        assertNotNull(sent);
        assertEquals("Nueva solicitud pendiente: Prueba".toLowerCase(), sent.getSubject().toLowerCase());
        assertEquals("no-reply@kata.local", ((InternetAddress) sent.getFrom()[0]).getAddress());
        assertEquals("bob@local", ((InternetAddress) sent.getAllRecipients()[0]).getAddress());

        Object content = sent.getContent();
        MimeMultipart mp = (MimeMultipart) content;
        BodyPart bp = mp.getBodyPart(0);
        String body = (String) bp.getContent();
        assertTrue(body.contains("<strong>Título:</strong> Prueba"));
        assertTrue(body.contains("<strong>Solicitante:</strong> alice@local"));
        assertTrue(body.contains("<strong>Tipo:</strong> deployment"));
    }

    @Test
    void sendApprovalPending_noEnviaSiEmailVacio() {
        JavaMailSender mailSender = mock(JavaMailSender.class);
        EmailService svc = new EmailService(mailSender);
        ReflectionTestUtils.setField(svc, "from", "no-reply@kata.local");

        RequestEntity req = RequestEntity.builder().id(java.util.UUID.randomUUID()).title("Prueba").build();
        svc.sendApprovalPending("", req);

        verify(mailSender, never()).send(any(MimeMessage.class));
    }
    @Test
    void sendApprovalPending_capturaExcepcionMessagingSinPropagar() throws Exception {
        JavaMailSender mailSender = mock(JavaMailSender.class);
        Session session = Session.getDefaultInstance(new Properties());
        MimeMessage mimeMessage = new MimeMessage(session);
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
        doThrow(new org.springframework.mail.MailSendException("smtp error")).when(mailSender).send(any(MimeMessage.class));
        EmailService svc = new EmailService(mailSender);
        ReflectionTestUtils.setField(svc, "from", "no-reply@kata.local");

        RequestEntity req = RequestEntity.builder().id(java.util.UUID.randomUUID()).title("Prueba").requesterName("alice@local").type("deployment").build();
        assertDoesNotThrow(() -> svc.sendApprovalPending("bob@local", req));
        verify(mailSender).send(any(MimeMessage.class));
    }
}
