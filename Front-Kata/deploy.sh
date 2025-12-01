#!/bin/bash

# Script para desplegar el frontend a AWS
# Uso: ./deploy.sh

set -e

echo "🚀 Iniciando despliegue del frontend..."

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Construir el frontend
echo -e "${BLUE}📦 Construyendo el frontend para producción...${NC}"
cd "$(dirname "$0")"
npm install
npm run build -- --configuration=production

if [ ! -d "dist/Front-Kata/browser" ]; then
    echo -e "${YELLOW}❌ Error: No se encontró el directorio de build${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build completado${NC}"

# 2. Desplegar infraestructura con Terraform
echo -e "${BLUE}🏗️  Desplegando infraestructura con Terraform...${NC}"
cd terraform

if [ ! -f "terraform.tfstate" ] && [ ! -d ".terraform" ]; then
    echo -e "${BLUE}🔧 Inicializando Terraform...${NC}"
    terraform init
fi

echo -e "${BLUE}📋 Revisando plan de Terraform...${NC}"
terraform plan -out=tfplan

echo -e "${YELLOW}⚠️  ¿Aplicar los cambios? (yes/no)${NC}"
read -r response
if [ "$response" = "yes" ]; then
    terraform apply tfplan
    rm -f tfplan
else
    echo -e "${YELLOW}❌ Despliegue cancelado${NC}"
    rm -f tfplan
    exit 1
fi

# 3. Obtener el nombre del bucket
BUCKET_NAME=$(terraform output -raw s3_bucket_name)
DISTRIBUTION_ID=$(terraform output -raw cloudfront_distribution_id)

if [ -z "$BUCKET_NAME" ]; then
    echo -e "${YELLOW}❌ Error: No se pudo obtener el nombre del bucket${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Infraestructura desplegada${NC}"
echo -e "${BLUE}📦 Bucket S3: ${BUCKET_NAME}${NC}"

# 4. Subir archivos a S3
echo -e "${BLUE}📤 Subiendo archivos a S3...${NC}"
cd ..
aws s3 sync dist/Front-Kata/browser/ "s3://${BUCKET_NAME}" --delete

echo -e "${GREEN}✅ Archivos subidos a S3${NC}"

# 5. Invalidar cache de CloudFront
if [ -n "$DISTRIBUTION_ID" ]; then
    echo -e "${BLUE}🔄 Invalidando cache de CloudFront...${NC}"
    aws cloudfront create-invalidation --distribution-id "$DISTRIBUTION_ID" --paths "/*" > /dev/null
    echo -e "${GREEN}✅ Cache invalidado${NC}"
fi

# 6. Mostrar URLs
CLOUDFRONT_URL=$(terraform output -raw cloudfront_url -state=terraform/terraform.tfstate 2>/dev/null || echo "N/A")

echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ ¡Despliegue completado exitosamente!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}🌐 CloudFront URL: ${CLOUDFRONT_URL}${NC}"
echo -e "${BLUE}📦 S3 Bucket: ${BUCKET_NAME}${NC}"
echo -e "${YELLOW}⏳ Nota: CloudFront puede tardar 15-20 minutos en propagar cambios${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"

