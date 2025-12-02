# 🚀 Kata Desarrollador Cloud

Sistema de gestión de aprobaciones desarrollado como kata técnica, implementando una arquitectura full-stack con backend en Spring Boot y frontend en Angular, desplegado en AWS.

## 📋 Tabla de Contenidos

- [Descripción](#-descripción)
- [Tecnologías](#-tecnologías)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Prerrequisitos](#-prerrequisitos)
- [Instalación y Configuración](#-instalación-y-configuración)
- [Ejecución Local](#-ejecución-local)
- [Despliegue](#-despliegue)
- [API Endpoints](#-api-endpoints)
- [Testing](#-testing)
- [Estructura de Base de Datos](#-estructura-de-base-de-datos)

---

## 📖 Descripción

Sistema web para la gestión de solicitudes y aprobaciones que permite:

- ✅ **Autenticación y Autorización**: Login y registro de usuarios con JWT
- ✅ **Gestión de Solicitudes**: Crear, aprobar, rechazar y consultar solicitudes
- ✅ **Dashboard Interactivo**: Visualización de KPIs y solicitudes pendientes
- ✅ **Notificaciones**: Sistema de notificaciones en tiempo real
- ✅ **Historial**: Seguimiento completo del historial de solicitudes
- ✅ **Búsqueda y Filtrado**: Búsqueda de usuarios y solicitudes con paginación

## 🛠️ Tecnologías

### Backend (`Back-Kata/`)

- **Java 21** - Lenguaje de programación
- **Spring Boot 4.0.0** - Framework principal
- **Spring Security** - Autenticación y autorización
- **JWT** - Tokens de autenticación
- **Spring Data JPA** - Acceso a datos
- **PostgreSQL** - Base de datos
- **Flyway** - Migraciones de base de datos
- **SpringDoc OpenAPI** - Documentación API (Swagger)
- **Docker** - Contenedorización
- **Terraform** - Infraestructura como código
- **AWS** - Despliegue en la nube (ECS, RDS, ALB, VPC)
- **Cucumber** - Testing BDD
- **Gradle** - Gestión de dependencias

### Frontend (`Front-Kata/`)

- **Angular 21.0.0** - Framework principal
- **TypeScript** - Lenguaje de programación
- **Tailwind CSS 4.1.12** - Estilos
- **Angular CDK** - Componentes y utilidades
- **RxJS** - Programación reactiva
- **Server-Side Rendering (SSR)** - Con Express
- **Virtual Scrolling** - Optimización de listas grandes

### DevOps

- **GitHub Actions** - CI/CD
- **Docker** - Contenedorización
- **Terraform** - Infraestructura como código
- **AWS ECS Fargate** - Contenedores serverless
- **AWS RDS** - Base de datos gestionada
- **AWS ALB** - Balanceador de carga
- **AWS VPC** - Red privada virtual

---

## 📁 Estructura del Proyecto

```
Kata_DesarrolladorCloud/
│
├── Back-Kata/                    # Backend Spring Boot
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/coedesarrollo/backKata/
│   │   │   │       ├── controller/      # Controladores REST
│   │   │   │       ├── service/         # Lógica de negocio
│   │   │   │       ├── repository/      # Acceso a datos
│   │   │   │       ├── model/           # Entidades JPA
│   │   │   │       ├── dto/             # Data Transfer Objects
│   │   │   │       ├── config/          # Configuración
│   │   │   │       ├── security/        # Seguridad
│   │   │   │       └── exception/       # Manejo de excepciones
│   │   │   └── resources/
│   │   │       ├── application.properties
│   │   │       └── db/migration/        # Migraciones Flyway
│   │   └── test/                        # Tests
│   ├── terraform/                       # Infraestructura AWS
│   │   ├── alb.tf                       # Application Load Balancer
│   │   ├── ecs.tf                       # ECS Fargate
│   │   ├── rds.tf                       # Base de datos
│   │   ├── vpc.tf                       # Red virtual
│   │   ├── security.tf                  # Security Groups
│   │   └── variables.tf                 # Variables
│   ├── Dockerfile                       # Imagen Docker
│   └── build.gradle                     # Dependencias
│
├── Front-Kata/                    # Frontend Angular
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/            # Componentes
│   │   │   │   ├── login/
│   │   │   │   ├── register/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── history/
│   │   │   │   ├── create-request/
│   │   │   │   ├── approval-detail/
│   │   │   │   └── layout/
│   │   │   ├── services/               # Servicios
│   │   │   ├── guards/                 # Guards de ruta
│   │   │   ├── interceptors/            # Interceptores HTTP
│   │   │   └── types/                   # Tipos TypeScript
│   │   └── environments/               # Variables de entorno
│   ├── public/                         # Archivos estáticos
│   └── angular.json                    # Configuración Angular
│
└── .github/
    └── workflows/
        └── deploy.yml                  # CI/CD para backend
```

---

## 📋 Prerrequisitos

### Para Desarrollo Local

- **Java 21** o superior
- **Node.js 20** o superior
- **npm** 11.6.4 o superior
- **PostgreSQL 15** o superior
- **Docker** (opcional, para base de datos)

### Para Despliegue

- **AWS CLI** configurado
- **Terraform** 1.9.0 o superior
- **Docker** (para construir imágenes)
- **Cuenta de AWS** con permisos adecuados

---

## 🚀 Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone <repository-url>
cd Kata_DesarrolladorCloud
```

### 2. Configurar Base de Datos (PostgreSQL)

#### Opción A: Docker Compose (Recomendado)

```bash
cd Back-Kata
docker-compose up -d
```

Esto iniciará PostgreSQL en `localhost:5432` con:
- Usuario: `postgres`
- Contraseña: `postgres`
- Base de datos: `kata_db`

#### Opción B: PostgreSQL Local

1. Instala PostgreSQL
2. Crea una base de datos:
   ```sql
   CREATE DATABASE kata_db;
   ```

### 3. Configurar Variables de Entorno (Backend)

Crea un archivo `.env` en `Back-Kata/` o configura variables de entorno:

```bash
export POSTGRES_HOST_PORT=5432
export POSTGRES_DB=kata_db
export POSTGRES_USER=postgres
export POSTGRES_PASSWORD=postgres
export JWT_SECRET=tu-secret-jwt-muy-seguro-y-largo
```

### 4. Instalar Dependencias

#### Backend

```bash
cd Back-Kata
./gradlew build
```

#### Frontend

```bash
cd Front-Kata
npm install
```

---

## 🏃 Ejecución Local

### Backend

```bash
cd Back-Kata

# Asegúrate de que PostgreSQL esté corriendo
# Si usas Docker Compose:
docker-compose up -d

# Ejecutar la aplicación
./gradlew bootRun
```

El backend estará disponible en:
- **API**: `http://localhost:8080`
- **Swagger UI**: `http://localhost:8080/swagger-ui.html`
- **Health Check**: `http://localhost:8080/actuator/health`

### Frontend

```bash
cd Front-Kata

# Windows
start-dev.bat

# Linux/Mac
./start-dev.sh

# O manualmente
npm run start
```

El frontend estará disponible en:
- **Aplicación**: `http://localhost:4200`

---

## 🌐 Despliegue

### Backend en AWS

El backend está configurado para desplegarse automáticamente en AWS usando GitHub Actions.

#### Infraestructura (Terraform)

```bash
cd Back-Kata/terraform

# Inicializar Terraform
terraform init

# Revisar plan
terraform plan \
  -var="db_password=TU_PASSWORD" \
  -var="jwt_secret=TU_SECRET"

# Aplicar cambios
terraform apply \
  -var="db_password=TU_PASSWORD" \
  -var="jwt_secret=TU_SECRET"
```

#### CI/CD Automático

El despliegue se ejecuta automáticamente cuando haces push a `main`:
- Construye la imagen Docker
- La sube a ECR
- Despliega en ECS Fargate

#### URL del Backend Desplegado

```
http://back-kata-alb-2058729206.us-east-1.elb.amazonaws.com
```

### Frontend

El frontend está configurado para ejecutarse localmente y conectarse al backend desplegado en AWS.

**Nota**: El frontend no está desplegado, solo se ejecuta localmente.

---

## 📡 API Endpoints

### Autenticación

- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión

### Solicitudes

- `GET /api/requests` - Listar todas las solicitudes
- `POST /api/requests` - Crear nueva solicitud
- `PATCH /api/requests/{id}` - Actualizar estado (aprobar/rechazar)
- `GET /api/requests/{id}` - Obtener solicitud por ID
- `GET /api/requests/{id}/history` - Historial de una solicitud
- `GET /api/requests/assigned` - Solicitudes asignadas a mí (paginado)
- `GET /api/requests/created` - Solicitudes creadas por mí (paginado)

### Usuarios

- `GET /api/users` - Listar todos los usuarios
- `GET /api/users/search?q={query}` - Buscar usuarios (paginado)

### Documentación API

- **Swagger UI**: `http://localhost:8080/swagger-ui.html`
- **OpenAPI JSON**: `http://localhost:8080/v3/api-docs`

---

## 🧪 Testing

### Backend

```bash
cd Back-Kata

# Ejecutar todos los tests
./gradlew test

# Ejecutar tests de Cucumber (BDD)
./gradlew cucumber
```

### Frontend

```bash
cd Front-Kata

# Ejecutar tests unitarios
npm run test
```

---

## 🗄️ Estructura de Base de Datos

### Tabla: `users`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador único |
| `username` | VARCHAR(255) | Nombre de usuario (único) |
| `password` | VARCHAR(255) | Contraseña encriptada (BCrypt) |
| `role` | VARCHAR(255) | Rol del usuario |

### Tabla: `requests`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador único |
| `title` | VARCHAR(255) | Título de la solicitud |
| `description` | TEXT | Descripción |
| `requester_name` | VARCHAR(255) | Nombre del solicitante |
| `approver_name` | VARCHAR(255) | Nombre del aprobador |
| `type` | VARCHAR(255) | Tipo de solicitud |
| `status` | VARCHAR(255) | Estado (PENDING, APPROVED, REJECTED) |
| `created_at` | TIMESTAMP | Fecha de creación |
| `updated_at` | TIMESTAMP | Fecha de actualización |
| `updated_by` | VARCHAR(255) | Usuario que actualizó |
| `comments` | VARCHAR(255) | Comentarios |

### Tabla: `request_history`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador único |
| `request_id` | UUID | FK a requests |
| `status` | VARCHAR(255) | Estado en ese momento |
| `comments` | VARCHAR(255) | Comentarios |
| `actor` | VARCHAR(255) | Usuario que realizó el cambio |
| `timestamp` | TIMESTAMP | Fecha del cambio |

---

## 🔐 Seguridad

- **Autenticación**: JWT tokens
- **Autorización**: Spring Security con roles
- **CORS**: Configurado para permitir orígenes específicos
- **Encriptación**: BCrypt para contraseñas
- **HTTPS**: Disponible en producción (requiere configuración)

---

## 📝 Características Principales

### Backend

- ✅ Autenticación JWT
- ✅ Gestión de solicitudes con estados
- ✅ Historial de cambios
- ✅ Paginación en endpoints
- ✅ Búsqueda de usuarios
- ✅ Simulación de envío de emails (consola)
- ✅ Documentación Swagger
- ✅ Health checks
- ✅ Observabilidad (CloudWatch)

### Frontend

- ✅ Login y registro
- ✅ Dashboard con KPIs
- ✅ Creación de solicitudes
- ✅ Aprobación/rechazo de solicitudes
- ✅ Historial de solicitudes
- ✅ Notificaciones en tiempo real
- ✅ Búsqueda de usuarios
- ✅ Virtual scrolling para listas grandes
- ✅ Diseño responsive con Tailwind CSS

---

## 🐛 Solución de Problemas

### Backend no inicia

- Verifica que PostgreSQL esté corriendo
- Verifica las variables de entorno
- Revisa los logs: `./gradlew bootRun`

### Frontend no se conecta al backend

- Verifica que el backend esté corriendo en `localhost:8080`
- Revisa la consola del navegador (F12)
- Verifica CORS en el backend

### Errores de CORS

- El backend permite `localhost:4200` por defecto
- Verifica `Back-Kata/src/main/resources/application.properties`

---

## 📚 Documentación Adicional

- **Backend**: Ver `Back-Kata/terraform/README.md` para despliegue

---

## 👥 Contribución

Este es un proyecto de kata técnica. Para contribuir:

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto es parte de una kata técnica de desarrollo.

---

## 🎯 Estado del Proyecto

- ✅ Backend desplegado en AWS
- ✅ Frontend configurado para desarrollo local
- ✅ CI/CD configurado para backend
- ✅ Base de datos en AWS RDS
- ✅ Documentación API con Swagger

---

**Desarrollado como parte de la Kata COEDesarrollo por Daniel Mateo Montoya González ;D** 🚀

