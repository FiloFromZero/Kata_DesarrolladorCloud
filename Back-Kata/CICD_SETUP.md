# 🔐 Configuración de Secretos para CI/CD

Para que el pipeline de GitHub Actions funcione, necesitas configurar los siguientes secretos en tu repositorio de GitHub.

## Pasos

1. Ve a tu repositorio en GitHub.
2. Haz clic en **Settings** (Configuración).
3. En el menú lateral izquierdo, busca **Secrets and variables** > **Actions**.
4. Haz clic en el botón verde **New repository secret**.

## Secretos Requeridos

Agrega los siguientes secretos uno por uno:

| Nombre | Valor (Ejemplo/Descripción) |
|--------|-----------------------------|
| `AWS_ACCESS_KEY_ID` | Tu ID de clave de acceso de AWS (ej: `AKIA...`) |
| `AWS_SECRET_ACCESS_KEY` | Tu clave secreta de AWS (ej: `wJalr...`) |
| `DB_PASSWORD` | Una contraseña segura para tu base de datos (ej: `SuperSecurePass123!`) |
| `JWT_SECRET` | Una cadena larga y aleatoria para firmar tokens (ej: `base64_encoded_string...`) |

> **Nota:** Asegúrate de que el usuario de AWS asociado a las credenciales tenga permisos de Administrador (o al menos permisos completos para EC2, ECS, RDS, IAM, S3 y VPC).
