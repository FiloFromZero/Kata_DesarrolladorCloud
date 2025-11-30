package com.coedesarrollo.backKata.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * Configuración centralizada de CORS para la aplicación.
 * Permite controlar qué orígenes pueden acceder a la API de forma segura.
 */
@Configuration
public class CorsConfig {

    @Value("${app.cors.allowed-origins}")
    private String[] allowedOrigins;

    @Value("${app.cors.allowed-methods:GET,POST,PUT,PATCH,DELETE,OPTIONS}")
    private String[] allowedMethods;

    @Value("${app.cors.allowed-headers:*}")
    private String allowedHeaders;

    @Value("${app.cors.exposed-headers:}")
    private String[] exposedHeaders;

    @Value("${app.cors.allow-credentials:true}")
    private boolean allowCredentials;

    @Value("${app.cors.max-age:3600}")
    private long maxAge;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Orígenes permitidos (nunca usar "*" en producción con credentials=true)
        configuration.setAllowedOrigins(Arrays.asList(allowedOrigins));

        // Métodos HTTP permitidos
        configuration.setAllowedMethods(Arrays.asList(allowedMethods));

        // Headers permitidos
        if ("*".equals(allowedHeaders)) {
            configuration.addAllowedHeader("*");
        } else {
            configuration.setAllowedHeaders(Arrays.asList(allowedHeaders.split(",")));
        }

        // Headers expuestos al cliente
        if (exposedHeaders.length > 0 && !exposedHeaders[0].isEmpty()) {
            configuration.setExposedHeaders(Arrays.asList(exposedHeaders));
        }

        // Permitir envío de credenciales (cookies, authorization headers)
        configuration.setAllowCredentials(allowCredentials);

        // Tiempo de cache de la respuesta preflight (OPTIONS)
        configuration.setMaxAge(maxAge);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Aplicar configuración a todos los endpoints /api/**
        source.registerCorsConfiguration("/api/**", configuration);

        return source;
    }
}
