package com.coedesarrollo.backKata.cucumber.steps;

import com.coedesarrollo.backKata.dto.AuthenticationRequest;
import com.coedesarrollo.backKata.dto.AuthenticationResponse;
import com.coedesarrollo.backKata.dto.RegisterRequest;
import io.cucumber.java.es.Cuando;
import io.cucumber.java.es.Dado;
import io.cucumber.java.es.Entonces;
import org.assertj.core.api.Assertions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.http.ResponseEntity;

import org.springframework.web.client.RestTemplate;

public class AuthenticationSteps {

    @Autowired
    private Environment environment;

    @Autowired
    private World world;

    private String baseUrl() {
        String port = environment.getProperty("local.server.port");
        return "http://localhost:" + port;
    }

    private final RestTemplate rest = new RestTemplate();

    @Dado("un usuario con email {string} y password {string}")
    public void un_usuario_con_email_y_password(String email, String password) {
        world.email = email;
        world.password = password;
    }

    @Cuando("registro ese usuario con rol {string}")
    public void registro_ese_usuario_con_rol(String role) {
        world.role = role;
        RegisterRequest body = new RegisterRequest(world.email, world.password, world.role);
        ResponseEntity<AuthenticationResponse> resp = rest.postForEntity(baseUrl() + "/api/auth/register", body, AuthenticationResponse.class);
        world.lastResponse = resp;
        if (resp.getStatusCode().is2xxSuccessful() && resp.getBody() != null) {
            world.jwtToken = resp.getBody().token();
        }
    }

    @Entonces("la respuesta de registro es 200 y contiene un token")
    public void la_respuesta_de_registro_es_200_y_contiene_un_token() {
        ResponseEntity<?> resp = world.lastResponse;
        Assertions.assertThat(resp.getStatusCode().value()).isEqualTo(200);
        @SuppressWarnings("unchecked")
        ResponseEntity<AuthenticationResponse> typed = (ResponseEntity<AuthenticationResponse>) resp;
        Assertions.assertThat(typed.getBody()).isNotNull();
        Assertions.assertThat(typed.getBody().token()).isNotBlank();
    }

    @Cuando("inicio sesión con ese usuario")
    public void inicio_sesion_con_ese_usuario() {
        AuthenticationRequest body = new AuthenticationRequest(world.email, world.password);
        ResponseEntity<AuthenticationResponse> resp = rest.postForEntity(baseUrl() + "/api/auth/login", body, AuthenticationResponse.class);
        world.lastResponse = resp;
        if (resp.getStatusCode().is2xxSuccessful() && resp.getBody() != null) {
            world.jwtToken = resp.getBody().token();
        }
    }

    @Cuando("inicia sesión con correo {string} y contraseña {string}")
    public void inicio_sesion_con_correo_y_contraseña(String email, String password) {
        world.email = email;
        world.password = password;
        inicio_sesion_con_ese_usuario();
    }

    @Entonces("obtengo un token válido")
    public void obtengo_un_token_valido() {
        ResponseEntity<?> resp = world.lastResponse;
        Assertions.assertThat(resp.getStatusCode().is2xxSuccessful()).isTrue();
        @SuppressWarnings("unchecked")
        ResponseEntity<AuthenticationResponse> typed = (ResponseEntity<AuthenticationResponse>) resp;
        Assertions.assertThat(typed.getBody()).isNotNull();
        Assertions.assertThat(typed.getBody().token()).isNotBlank();
    }
}
