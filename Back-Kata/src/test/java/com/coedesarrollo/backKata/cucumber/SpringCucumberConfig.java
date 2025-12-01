package com.coedesarrollo.backKata.cucumber;

import com.coedesarrollo.backKata.BackKataApplication;
import io.cucumber.spring.CucumberContextConfiguration;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.context.annotation.Import;

@CucumberContextConfiguration
@SpringBootTest(classes = BackKataApplication.class, webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@Import(TestMailConfig.class)
public class SpringCucumberConfig {

    @LocalServerPort
    int port;

    
    public int getPort() {
        return port;
    }
}
