# ☁️ Guía de Despliegue AWS con Terraform

Esta guía detalla cómo desplegar la infraestructura de **Back-Kata** en AWS utilizando los scripts de Terraform creados.

## 📋 Prerrequisitos

1.  **AWS CLI** instalado y configurado (`aws configure`).
2.  **Terraform** instalado (v1.0+).
3.  Una cuenta de AWS con permisos de Administrador.

## 🚀 Pasos de Despliegue

### 1. Inicializar Terraform

Descarga los proveedores necesarios (AWS) e inicializa el backend.

```bash
cd terraform
terraform init
```

### 2. Revisar el Plan

Genera un plan de ejecución para ver qué recursos se crearán. Te pedirá las contraseñas sensibles.

```bash
terraform plan \
  -var="db_password=TU_PASSWORD_SEGURO" \
  -var="jwt_secret=TU_SECRET_JWT_LARGO"
```

### 3. Aplicar Cambios

Crea la infraestructura real en AWS.

```bash
terraform apply \
  -var="db_password=TU_PASSWORD_SEGURO" \
  -var="jwt_secret=TU_SECRET_JWT_LARGO"
```

Escribe `yes` cuando se te solicite confirmación.

## 📦 Recursos Creados

| Recurso | Descripción |
|---------|-------------|
| **VPC** | Red aislada `10.0.0.0/16` con subredes públicas y privadas. |
| **RDS** | Base de datos PostgreSQL 15 (`db.t3.micro`). |
| **ALB** | Balanceador de carga público para recibir tráfico HTTP. |
| **ECS** | Cluster Fargate para ejecutar los contenedores. |
| **ECR** | Repositorio para almacenar las imágenes Docker. |

## 🧹 Limpieza (Destruir Infraestructura)

Para evitar costos cuando termines las pruebas:

```bash
terraform destroy \
  -var="db_password=..." \
  -var="jwt_secret=..."
```
