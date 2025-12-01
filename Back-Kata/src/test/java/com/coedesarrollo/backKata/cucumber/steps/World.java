package com.coedesarrollo.backKata.cucumber.steps;

import io.cucumber.spring.ScenarioScope;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@ScenarioScope
public class World {
    public String email;
    public String password;
    public String role;
    public String jwtToken;
    public ResponseEntity<?> lastResponse;
    public UUID lastRequestId;
}
