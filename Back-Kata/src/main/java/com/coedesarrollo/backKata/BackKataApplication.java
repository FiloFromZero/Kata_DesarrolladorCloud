package com.coedesarrollo.backKata;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.boot.actuate.autoconfigure.mail.MailHealthContributorAutoConfiguration;

@SpringBootApplication(exclude = {MailHealthContributorAutoConfiguration.class})
public class BackKataApplication {

    public static void main(String[] args) {
        SpringApplication.run(BackKataApplication.class, args);
    }
}