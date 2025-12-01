# 🚀 Despliegue del Frontend en AWS

Esta guía explica cómo desplegar el frontend de **Front-Kata** en AWS usando S3 y CloudFront.

## 📋 Prerrequisitos

1. **AWS CLI** instalado y configurado (`aws configure`)
2. **Terraform** instalado (v1.0+)
3. Una cuenta de AWS con permisos de Administrador
4. El backend ya desplegado y funcionando

## 🚀 Pasos de Despliegue

### 1. Construir el Frontend

Primero, construye el frontend para producción:

```bash
cd Front-Kata
npm install
npm run build -- --configuration=production
```

O en Windows:
```bash
build-aws.bat
```

Esto generará los archivos en `dist/Front-Kata/browser/`

### 2. Inicializar Terraform

```bash
cd terraform
terraform init
```

### 3. Revisar el Plan

```bash
terraform plan
```

### 4. Aplicar la Infraestructura

```bash
terraform apply
```

Escribe `yes` cuando se te solicite confirmación.

### 5. Subir los Archivos a S3

Después de crear el bucket, sube los archivos:

```bash
# Obtén el nombre del bucket del output
terraform output s3_bucket_name

# Sube los archivos (reemplaza BUCKET_NAME con el valor del output)
aws s3 sync ../dist/Front-Kata/browser/ s3://BUCKET_NAME --delete
```

### 6. Invalidar Cache de CloudFront (Opcional)

Para asegurar que los cambios se reflejen inmediatamente:

```bash
# Obtén el ID de la distribución
terraform output cloudfront_distribution_id

# Invalida el cache
aws cloudfront create-invalidation --distribution-id DISTRIBUTION_ID --paths "/*"
```

## 📦 Recursos Creados

| Recurso | Descripción |
|---------|-------------|
| **S3 Bucket** | Almacena los archivos estáticos del frontend |
| **CloudFront** | CDN para servir el frontend con HTTPS |
| **S3 Website** | Configuración de sitio web estático |

## 🌐 URLs Generadas

Después del despliegue, obtendrás:

- **S3 Website URL**: `http://BUCKET_NAME.s3-website-us-east-1.amazonaws.com`
- **CloudFront URL**: `https://DISTRIBUTION_ID.cloudfront.net` (recomendado)

## 🔄 Actualizar el Frontend

Para actualizar el frontend después de cambios:

1. Reconstruir: `npm run build -- --configuration=production`
2. Subir a S3: `aws s3 sync dist/Front-Kata/browser/ s3://BUCKET_NAME --delete`
3. Invalidar CloudFront: `aws cloudfront create-invalidation --distribution-id DISTRIBUTION_ID --paths "/*"`

## 🧹 Limpieza

Para eliminar todos los recursos:

```bash
terraform destroy
```

## ⚠️ Notas Importantes

- El frontend está configurado para usar el backend en: `http://back-kata-alb-2058729206.us-east-1.elb.amazonaws.com`
- Si cambias la URL del backend, actualiza `src/app/interceptors/api-url.interceptor.ts`
- CloudFront puede tardar 15-20 minutos en propagar cambios globalmente

