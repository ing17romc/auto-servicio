# Auto-Servicio

Base mínima con Next.js Pages Router. La única pantalla de producto está en `/`
y muestra **General Dashboard**. Las pantallas y APIs de negocio anteriores fueron retiradas.

## Requisitos

- Node.js **26.x** (validado con **26.13.1**, fijado en `.nvmrc`).
- npm. Las versiones exactas de dependencias están en `package-lock.json`.

Con nvm-windows instalado, selecciona la versión antes de usar npm:

```powershell
nvm install 26.13.1
nvm use 26.13.1
node --version
npm ci
npm run dev
```

También puedes utilizar una instalación aislada de Node.js 26; su directorio debe
estar primero en `PATH` durante todos los comandos. No se instala Node como dependencia.

Abre [http://localhost:3000](http://localhost:3000).

## Validación y producción local

```powershell
npm run lint
npm run build
npm start
```

## Estructura

- `pages/index.js`: pantalla nueva, escrita desde cero.
- `backend/`: reservado, sin modelos, conexiones ni endpoints.
- `components/`, `config/`, `constants/`, `content/`, `context/`, `lib/`:
  carpetas reservadas, sin código heredado.
- `openspec/`: especificaciones y cambios; skills en `.agents/skills/` y `.claude/skills/`.

No hay variables de entorno obligatorias ni servicios externos necesarios para
arrancar o compilar. `.env.example` contiene únicamente instrucciones sin secretos.
MongoDB es la tecnología de datos elegida para una etapa posterior; todavía no
hay driver ni conexión. Firebase y MySQL ya no forman parte de la aplicación.

Los archivos de entorno reales están ignorados por Git. Esto no borra secretos
que ya existan en commits anteriores ni revoca sus credenciales.

## Vercel

Conservar el repositorio GitHub y el proyecto Vercel existentes. Antes de publicar,
verificar en ese proyecto: preset **Next.js**, raíz del repositorio, Node.js **26.x**,
build `npm run build` e instalación `npm ci`; revisar cualquier override antiguo.
La configuración remota no está verificada localmente. La limpieza no publica ni
crea otro proyecto. Las rutas anteriores deben responder 404.

## OpenSpec

```powershell
npm run openspec -- list
npm run openspec -- validate reset-to-general-dashboard --strict
```

El comando usa OpenSpec 2.1.1 independientemente del ejecutable global.
