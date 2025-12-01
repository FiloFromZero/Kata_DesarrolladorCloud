# ☁️ Guía de Configuración Inicial AWS

Como no tienes cuenta de AWS, este es el paso a paso para crearla y conectarla con tu proyecto.

## Paso 1: Crear Cuenta AWS (Manual)
1.  Ve a [aws.amazon.com](https://aws.amazon.com/es/).
2.  Haz clic en **"Crear una cuenta de AWS"**.
3.  Sigue los pasos (te pedirán un correo, contraseña y una tarjeta de crédito/débito para verificar identidad).
    > **Nota:** AWS tiene una "Capa Gratuita" (Free Tier) por 12 meses, pero algunos recursos que definimos (como el NAT Gateway o el Load Balancer) podrían generar costos pequeños si los dejas encendidos mucho tiempo.

## Paso 2: Crear Credenciales para GitHub
Una vez tengas tu cuenta y entres a la consola:

1.  En el buscador de arriba, escribe **IAM** y entra.
2.  En el menú izquierdo, clic en **Users** (Usuarios) -> **Create user**.
3.  Nombre: `github-deployer`.
4.  **Permisos:** Selecciona "Attach policies directly" y busca/marca `AdministratorAccess`.
    *   *Nota: En un entorno real seríamos más restrictivos, pero para empezar esto evita errores de permisos.*
5.  Crea el usuario.
6.  Haz clic en el usuario creado -> Pestaña **Security credentials**.
7.  Baja a "Access keys" -> **Create access key**.
8.  Selecciona "Command Line Interface (CLI)" -> Next -> Create.
9.  **¡IMPORTANTE!** Copia el `Access key ID` y el `Secret access key`. No los podrás ver de nuevo.

## Paso 3: Conectar con GitHub
Ahora que tienes las llaves:

1.  Ve a tu repositorio en GitHub.
2.  **Settings** > **Secrets and variables** > **Actions**.
3.  Crea los siguientes secretos con los valores que copiaste:
    *   `AWS_ACCESS_KEY_ID`: (Tu ID, ej: AKIA...)
    *   `AWS_SECRET_ACCESS_KEY`: (Tu Secreto, ej: wJalr...)
    *   `DB_PASSWORD`: (Inventa una contraseña segura para la base de datos)
    *   `JWT_SECRET`: (Inventa una cadena larga para los tokens)

## Paso 4: ¡Desplegar!
Una vez configurados los secretos:
1.  Haz un `git push` de tu código a la rama `main`.
2.  Ve a la pestaña **Actions** en GitHub.
3.  Verás que el workflow `Deploy Back-Kata to AWS` se inicia automáticamente.
4.  Espera unos minutos y... ¡listo! Tu infraestructura se creará sola.
