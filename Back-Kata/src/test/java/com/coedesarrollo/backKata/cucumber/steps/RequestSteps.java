package com.coedesarrollo.backKata.cucumber.steps;

import com.coedesarrollo.backKata.dto.RequestRecord;
import com.coedesarrollo.backKata.dto.RequestUpdateRecord;
import com.coedesarrollo.backKata.model.RequestStatus;
import io.cucumber.java.es.Cuando;
import io.cucumber.java.es.Entonces;
import org.assertj.core.api.Assertions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;

import java.net.URI;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public class RequestSteps {

    @Autowired
    private Environment environment;

    @Autowired
    private World world;

    private final RestTemplate rest = new RestTemplate(new HttpComponentsClientHttpRequestFactory());

    private String baseUrl() {
        String port = environment.getProperty("local.server.port");
        return "http://localhost:" + port;
    }

    private HttpHeaders authHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        if (world.jwtToken != null) {
            headers.setBearerAuth(world.jwtToken);
        }
        return headers;
    }

    @Cuando("creo una solicitud con titulo {string} y aprobador {string}")
    public void creo_una_solicitud_con_titulo_y_aprobador(String titulo, String aprobador) {
        
        String requester = (world.email != null) ? world.email : "requester@example.com";
        RequestRecord body = new RequestRecord(
                titulo,
                "descripcion opcional",
                requester,
                aprobador,
                "GENERAL"
        );

        HttpEntity<RequestRecord> entity = new HttpEntity<>(body, authHeaders());
        ResponseEntity<Map> resp = rest.postForEntity(baseUrl() + "/api/requests", entity, Map.class);
        world.lastResponse = resp;
        if (resp.getStatusCode().is2xxSuccessful() && resp.getBody() != null) {
            Object idObj = resp.getBody().get("id");
            if (idObj != null) {
                world.lastRequestId = UUID.fromString(idObj.toString());
            }
        }
    }

    @Entonces("la solicitud queda pendiente y obtengo su id")
    public void la_solicitud_queda_pendiente_y_obtengo_su_id() {
        Assertions.assertThat(world.lastResponse.getStatusCode().value()).isEqualTo(200);
        @SuppressWarnings("unchecked")
        Map<String, Object> body = (Map<String, Object>) world.lastResponse.getBody();
        Assertions.assertThat(body).isNotNull();
        Assertions.assertThat(world.lastRequestId).isNotNull();
        Assertions.assertThat(body.get("status")).isEqualTo("PENDING");
    }

    @Cuando("apruebo la solicitud con comentario {string}")
    public void apruebo_la_solicitud_con_comentario(String comentario) {
        Assertions.assertThat(world.lastRequestId).as("Se requiere el id de la solicitud").isNotNull();
        RequestUpdateRecord upd = new RequestUpdateRecord(RequestStatus.APPROVED, comentario);
        HttpEntity<RequestUpdateRecord> entity = new HttpEntity<>(upd, authHeaders());
        ResponseEntity<Map> resp = rest.exchange(
                URI.create(baseUrl() + "/api/requests/" + world.lastRequestId),
                HttpMethod.PATCH,
                entity,
                Map.class
        );
        world.lastResponse = resp;
    }

    @Entonces("la solicitud queda aprobada")
    public void la_solicitud_queda_aprobada() {
        Assertions.assertThat(world.lastResponse.getStatusCode().is2xxSuccessful()).isTrue();
        @SuppressWarnings("unchecked")
        Map<String, Object> body = (Map<String, Object>) world.lastResponse.getBody();
        Assertions.assertThat(body).isNotNull();
        Assertions.assertThat(body.get("status")).isEqualTo("APPROVED");
    }

    @Entonces("el historial tiene 2 entradas")
    public void el_historial_tiene_dos_entradas() {
        Assertions.assertThat(world.lastRequestId).isNotNull();
        HttpEntity<Void> entity = new HttpEntity<>(authHeaders());
        ResponseEntity<List> resp = rest.exchange(
                URI.create(baseUrl() + "/api/requests/" + world.lastRequestId + "/history"),
                HttpMethod.GET,
                entity,
                List.class
        );
        Assertions.assertThat(resp.getStatusCode().is2xxSuccessful()).isTrue();
        List<?> history = resp.getBody();
        Assertions.assertThat(history).isNotNull();
        Assertions.assertThat(history.size()).isGreaterThanOrEqualTo(2);
    }
}
