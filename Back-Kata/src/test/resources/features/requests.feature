Feature: Solicitudes

  Background:
    Given un usuario con email "tester@local" y password "pwd123"
    When registro ese usuario con rol "USER"
    And inicio sesión con ese usuario
    Then obtengo un token válido

  Scenario: Crear y aprobar solicitud
    When creo una solicitud con titulo "Publicar microservicio" y aprobador "approver@local"
    Then la solicitud queda pendiente y obtengo su id
    When apruebo la solicitud con comentario "ok"
    Then la solicitud queda aprobada
    And el historial tiene 2 entradas
