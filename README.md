# Auto-Servicio

Base mínima con Next.js App Router. La única pantalla de producto está en `/`
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

- `app/page.js`: pantalla General Dashboard como Server Component.
- `app/layout.js`: documento raiz, idioma y metadata.
- `backend/`: reservado, sin modelos, conexiones ni endpoints.
- `components/`, `config/`, `constants/`, `content/`, `context/`, `lib/`:
  carpetas reservadas, sin código heredado.
- `openspec/`: especificaciones y cambios; skills en `.agents/skills/` y `.claude/skills/`.

No hay variables de entorno obligatorias ni servicios externos necesarios para
arrancar o compilar. `.env.example` contiene únicamente instrucciones sin secretos.
Express 5.3.0 y Mongoose 9.13.0 estan instalados para uso futuro. No hay servidor
Express, endpoints, modelos ni conexion activa a MongoDB. Firebase y MySQL no forman parte de la aplicacion.

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
npm run openspec -- validate --all --strict
```

El comando usa OpenSpec 2.1.1 independientemente del ejecutable global.

## Herramientas de IA compartidas (Claude Code y Codex)

Configuración versionada:

| Herramienta | Uso | Configuración |
| --- | --- | --- |
| OpenSpec 2.1.1 | Explorar, proponer, actualizar, aplicar, sincronizar y archivar cambios | `.agents/skills/`, `.claude/skills/`, `openspec/` |
| Context7 MCP 4.7.3 | Documentación de librerías | `.mcp.json` y `.codex/config.toml` |
| Playwright MCP 0.0.86 | Navegador de pruebas aislado y sin ventana | `.mcp.json` y `.codex/config.toml` |
| MongoDB MCP 3.3.0 | Consultas e inspección de datos en solo lectura | `.mcp.json` y `.codex/config.toml` |

Los MCP se instalan por separado en `tools/mcp/node_modules/`; no son dependencias
de producción ni añaden conexiones al backend. Sus versiones y dependencias se
fijan en `tools/mcp/package-lock.json`. No hace falta instalar plugins duplicados.

### Preparación en otra máquina

1. Instalar Git, Node.js 26.x con npm y Claude Code o Codex; iniciar sesión en el asistente.
2. Clonar `master`, abrir una terminal en la raíz del repositorio y ejecutar:

```powershell
npm ci
npm run mcp:setup
npm run openspec -- list
```

3. Instalar Google Chrome si no está disponible: Playwright MCP usa `chrome`
   en modo headless con un perfil aislado, sin usar tus sesiones personales.
4. Abrir el asistente desde la raíz. En Claude Code, aceptar los MCP del proyecto
   y revisar `/mcp`; en Codex, confiar en el proyecto, abrir una sesión nueva y
   revisar sus MCP. Los archivos no transfieren sesiones, permisos ni credenciales.

Las rutas de los ejecutables MCP son relativas a la raíz del repositorio. Ambos
clientes ejecutan `node` desde PATH; debe apuntar a Node.js 26.x. El playbook
personal externo se debe copiar por separado si se quiere usar en esa máquina.

### Credenciales opcionales de las herramientas

No son necesarias para compilar la aplicación. No se guardan en archivos del repositorio.

- Context7 puede funcionar sin clave con límites del servicio; para una cuenta propia,
  definir `CONTEXT7_API_KEY` en el entorno del proceso que inicia el asistente.
- MongoDB necesita `MDB_MCP_CONNECTION_STRING` con una URI válida para consultar
  datos. Sin ella, el MCP puede iniciar y exponer sus herramientas, pero no hay
  conexión a ninguna base. Utilizar un usuario de base de datos con permisos de lectura.
- La configuración pasa `--readOnly` al servidor MongoDB y desactiva su telemetría.
  No recupera la URI antigua ni configura el backend de la aplicación.
- Las variables en `.env.local` de Next.js no se cargan automáticamente en el
  asistente. Exportarlas de forma privada antes de iniciarlo; reiniciar el asistente
  después de cambiarlas. No pegar claves o URI en prompts, commits o argumentos CLI.

### Skills incluidas

Las seis skills OpenSpec y siete skills oficiales adicionales estan versionadas para ambos asistentes:

- `openspec-explore`: investigar y aclarar antes de implementar.
- `openspec-propose`: crear propuesta, diseño, specs y tareas.
- `openspec-update-change`: actualizar un plan existente.
- `openspec-apply-change`: implementar las tareas.
- `openspec-sync-specs`: sincronizar especificaciones.
- `openspec-archive-change`: archivar un cambio terminado.

En Claude Code se invocan con `/nombre-de-skill`; en Codex se seleccionan desde
Skills o se usan por nombre. No es necesario volver a inicializar OpenSpec al clonar.

Fuentes: [Context7](https://github.com/upstash/context7),
[Playwright MCP](https://github.com/microsoft/playwright-mcp),
[MongoDB MCP](https://github.com/mongodb-js/mongodb-mcp-server),
[MCP Claude Code](https://code.claude.com/docs/en/mcp) y
[MCP Codex](https://developers.openai.com/codex/mcp).

### Skills oficiales adicionales

| Skill | Fuente | Uso |
| --- | --- | --- |
| `vercel-react-best-practices` | Vercel | Rendimiento React/Next.js, datos y bundles |
| `web-design-guidelines` | Vercel | Interfaz, accesibilidad y UX |
| `deploy-to-vercel` | Vercel | Despliegue cuando se solicite |
| `mongodb-schema-design` | MongoDB | Modelado y validacion de esquemas |
| `mongodb-query-optimizer` | MongoDB | Indices y rendimiento de consultas |
| `mongodb-natural-language-querying` | MongoDB | Consultas de lectura y agregaciones |
| `mongodb-connection` | MongoDB | Conexiones, pools y diagnostico |

Son 13 skills por asistente, incluidas las seis OpenSpec. Los directorios completos
estan copiados en `.agents/skills/` y `.claude/skills/`, sin symlinks ni necesidad
de instalacion global. Estaran disponibles al iniciar una nueva sesion del asistente.

Procedencia, commits y hashes: `tools/skills-sources.json`. Verificar integridad y paridad:

```powershell
npm run skills:check
```

Vercel declara MIT en el README de origen (se conserva ese aviso, pues no publica
un LICENSE independiente en la raiz de ese commit). Las skills MongoDB incluyen
su licencia Apache-2.0. No se ejecutan acciones al instalar estas guias: algunas
operaciones requieren conexion MCP o una cuenta autorizada. El despliegue siempre
debe respetar el proyecto Vercel existente y la solicitud explicita del usuario.

### Dependencias futuras del backend

Express y Mongoose son dependencias de ejecucion fijadas en `package.json` y el
lockfile por solicitud del usuario. No estan importadas por `app/`, no se envian
al navegador y no cambian `npm run dev` ni `npm start`: ambos ejecutan Next.js.
`backend/` permanece reservado. Una etapa posterior definira la API, los modelos,
la conexion y como integrar Express con el despliegue existente, sin asumir que
instalarlo ya crea un servidor compatible con Vercel.
