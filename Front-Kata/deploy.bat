@echo off
setlocal enabledelayedexpansion

echo 🚀 Iniciando despliegue del frontend...

REM 1. Construir el frontend
echo 📦 Construyendo el frontend para producción...
cd /d "%~dp0"
call npm install
if errorlevel 1 (
    echo ❌ Error al instalar dependencias
    exit /b 1
)

call npm run build -- --configuration=production
if errorlevel 1 (
    echo ❌ Error al construir el frontend
    exit /b 1
)

if not exist "dist\Front-Kata\browser" (
    echo ❌ Error: No se encontró el directorio de build
    exit /b 1
)

echo ✅ Build completado

REM 2. Desplegar infraestructura con Terraform
echo 🏗️  Desplegando infraestructura con Terraform...
cd terraform

if not exist "terraform.tfstate" if not exist ".terraform" (
    echo 🔧 Inicializando Terraform...
    call terraform init
    if errorlevel 1 (
        echo ❌ Error al inicializar Terraform
        exit /b 1
    )
)

echo 📋 Revisando plan de Terraform...
call terraform plan -out=tfplan
if errorlevel 1 (
    echo ❌ Error al crear el plan
    exit /b 1
)

echo ⚠️  ¿Aplicar los cambios? (yes/no)
set /p response=
if /i not "!response!"=="yes" (
    echo ❌ Despliegue cancelado
    del tfplan 2>nul
    exit /b 1
)

call terraform apply tfplan
if errorlevel 1 (
    echo ❌ Error al aplicar Terraform
    del tfplan 2>nul
    exit /b 1
)

del tfplan 2>nul
echo ✅ Infraestructura desplegada

REM 3. Obtener el nombre del bucket
for /f "tokens=*" %%i in ('terraform output -raw s3_bucket_name') do set BUCKET_NAME=%%i
for /f "tokens=*" %%i in ('terraform output -raw cloudfront_distribution_id') do set DISTRIBUTION_ID=%%i

if "!BUCKET_NAME!"=="" (
    echo ❌ Error: No se pudo obtener el nombre del bucket
    exit /b 1
)

echo 📦 Bucket S3: !BUCKET_NAME!

REM 4. Subir archivos a S3
echo 📤 Subiendo archivos a S3...
cd ..
call aws s3 sync dist\Front-Kata\browser\ s3://!BUCKET_NAME! --delete
if errorlevel 1 (
    echo ❌ Error al subir archivos a S3
    exit /b 1
)

echo ✅ Archivos subidos a S3

REM 5. Invalidar cache de CloudFront
if not "!DISTRIBUTION_ID!"=="" (
    echo 🔄 Invalidando cache de CloudFront...
    call aws cloudfront create-invalidation --distribution-id !DISTRIBUTION_ID! --paths "/*" >nul 2>&1
    echo ✅ Cache invalidado
)

REM 6. Mostrar URLs
for /f "tokens=*" %%i in ('terraform output -raw cloudfront_url -state=terraform\terraform.tfstate 2^>nul') do set CLOUDFRONT_URL=%%i

echo.
echo ═══════════════════════════════════════════════════════════════
echo ✅ ¡Despliegue completado exitosamente!
echo ═══════════════════════════════════════════════════════════════
echo 🌐 CloudFront URL: !CLOUDFRONT_URL!
echo 📦 S3 Bucket: !BUCKET_NAME!
echo ⏳ Nota: CloudFront puede tardar 15-20 minutos en propagar cambios
echo ═══════════════════════════════════════════════════════════════
echo.

pause

