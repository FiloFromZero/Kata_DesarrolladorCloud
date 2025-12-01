# Instrucciones para ejecutar el Frontend con el Backend desplegado

## Desarrollo Local (con Backend en localhost:8080)

1. **Asegúrate de que el Backend esté corriendo**:
   ```bash
   cd Back-Kata
   ./gradlew bootRun
   ```

2. **Inicia el Frontend**:
   ```bash
   cd Front-Kata
   # En Windows:
   start-dev.bat
   # En Linux/Mac:
   ./start-dev.sh
   ```

3. **Abre el navegador**:
   - Frontend: http://localhost:4200
   - Backend: http://localhost:8080
   - Swagger: http://localhost:8080/swagger-ui.html

## Producción (con Backend desplegado en AWS)

El Frontend está configurado para usar el backend desplegado en:
`http://back-kata-alb-2058729206.us-east-1.elb.amazonaws.com`

Para cambiar la URL del backend, modifica el archivo:
- `src/environments/environment.prod.ts` para producción
- `src/environments/environment.ts` para desarrollo

## Scripts disponibles

- `npm run start` - Inicia el servidor de desarrollo
- `npm run build` - Construye para producción
- `npm run build-prod.bat` - Script de construcción para Windows
- `npm run build-prod.sh` - Script de construcción para Linux/Mac