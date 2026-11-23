# Proposal

## Why

La aplicación heredada contiene pantallas de negocio, autenticación y accesos a datos que ya no forman parte del producto deseado. Se necesita una base nueva y mínima en el mismo repositorio, conservando la separación frontend/backend y preparando su ejecución con versiones actuales compatibles con Vercel.

## What Changes

- **BREAKING**: reemplazar todas las pantallas existentes por una única pantalla pública en `/`, con el encabezado `General Dashboard`, sin navegación, formularios ni contenido adicional.
- **BREAKING**: retirar las 13 rutas API, todos los modelos y conexiones del backend, y toda la lógica, estilos y componentes heredados; conservar las carpetas de organización vacías mediante `.gitkeep` cuando corresponda.
- **BREAKING**: retirar Firebase, MySQL y sus variables de configuración, así como las implementaciones antiguas de MongoDB. MongoDB será la base futura; esta etapa no incluye conexión, driver, modelos ni endpoints.
- Renovar el manifiesto y el lockfile: Next.js estable actual (16.4.6 al preparar esta propuesta), React/React DOM compatibles y Node.js 26.x, admitido por Vercel. Mantener solo dependencias necesarias y OpenSpec 2.1.1.
- Sustituir la configuración de entorno heredada por un ejemplo sin secretos y excluir archivos de entorno reales del seguimiento de Git.
- Conservar el historial y remoto de GitHub, OpenSpec y sus skills para Claude Code/Codex; actualizar las instrucciones del proyecto al nuevo estado durante la implementación.

## Capabilities

### New Capabilities

- `general-dashboard`: única pantalla pública, mínima y accesible; ausencia de las pantallas y APIs heredadas.
- `application-runtime`: base ejecutable y reproducible para desarrollo y producción en Node.js/Next.js compatibles con Vercel, sin servicios externos obligatorios.

### Modified Capabilities

Ninguna: no hay capacidades documentadas actualmente en `openspec/specs/`.

## Impact

- Afecta `pages/`, `backend/`, `components/`, `config/`, `constants/`, `content/`, `context/`, `lib/`, `initAuth.js`, `install.sh`, configuración de lint, manifiesto, lockfile e instrucciones del proyecto.
- Criterios de aceptación: `/` responde 200 y muestra únicamente `General Dashboard`; las rutas heredadas devuelven 404; cero endpoints propios; instalación limpia, validación estática y build correctos en Node.js 26.x sin credenciales ni red hacia bases de datos.
- La vinculación GitHub está comprobada localmente. La integración remota existente con Vercel es declarada por el usuario, pero no se ha verificado desde esta máquina; debe revisarse su preset, raíz y comandos antes de publicar.
- Fuera de alcance: desplegar, hacer push, crear otro repositorio/proyecto Vercel, conectar MongoDB, migrar o borrar datos externos, modificar cuentas o reescribir el historial para purgar secretos antiguos.
