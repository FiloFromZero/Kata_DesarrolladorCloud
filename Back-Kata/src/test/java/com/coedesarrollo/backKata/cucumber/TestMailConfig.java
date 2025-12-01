package com.coedesarrollo.backKata.cucumber;

import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

@TestConfiguration
public class TestMailConfig {

    @Bean
    public JavaMailSender javaMailSender() {
        
        return new JavaMailSender() {
            @Override
            public MimeMessage createMimeMessage() {
                return new MimeMessage((Session) null);
            }

            @Override
            public MimeMessage createMimeMessage(java.io.InputStream contentStream) {
                try {
                    return new MimeMessage(null, contentStream);
                } catch (Exception e) {
                    return new MimeMessage((Session) null);
                }
            }

            @Override
            public void send(MimeMessage mimeMessage) {
                
            }

            @Override
            public void send(MimeMessage... mimeMessages) {
                
            }

            @Override
            public void send(SimpleMailMessage simpleMessage) {
                
            }

            @Override
            public void send(SimpleMailMessage... simpleMessages) {
                
            }
        };
    }
}
