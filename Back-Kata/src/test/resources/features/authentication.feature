Feature: Autenticación

  Scenario: Registro y login devuelve token
    Given un usuario con email "user@example.com" y password "pass123"
    When registro ese usuario con rol "USER"
    Then la respuesta de registro es 200 y contiene un token
    When inicio sesión con ese usuario
    Then obtengo un token válido
