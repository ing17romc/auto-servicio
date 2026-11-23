# Registro de implementación

## Punto de partida

- Rama: `codex/reset-to-general-dashboard`.
- Commit base: `af890d59be7ac18f1adaf0272562e9dcccc49d08`.
- Remoto conservado: `https://github.com/ing17romc/auto-servicio.git`.
- Al iniciar solo estaba sin versionar la propuesta de este cambio; no había modificaciones ajenas.

## Entorno

- Node.js 26.13.1 aislado en un directorio temporal; no se cambió el Node global.
- npm se ejecuta mediante el binario Node 26 y `npm-cli.js` explícitos: en Windows el wrapper global `npm.ps1` usa su Node 24 adyacente incluso al anteponer otro runtime al PATH. Las verificaciones finales se ejecutan con Node 26.
- Next.js 16.4.6, React/React DOM 19.3.1.
- ESLint 9.39.5 y eslint-config-next 16.4.6. npm marca ESLint 9 como fuera de soporte; los plugins React, import y accesibilidad actuales declaran compatibilidad hasta ESLint 9. Se conserva la última 9 compatible, sin forzar ESLint 10 fuera de los rangos de sus plugins.
- El lockfile antiguo se regeneró desde cero: conservaba referencias a Firebase incompatibles con la actualización de Next.js.

## Vercel

No hay metadatos `.vercel/`, CLI disponible ni autenticación local detectada en las ubicaciones habituales, y no hay una herramienta Vercel conectada en esta sesión. La revisión remota de preset, raíz y comandos queda pendiente antes de publicar. README contiene los valores esperados. No se creó ningún proyecto ni se desplegó.

## Alcance

Se retiró el archivo de entorno real y su seguimiento actual sin imprimir su contenido. El historial no se reescribió. No se modificaron bases, credenciales, cuentas ni recursos externos.

## Verificaciones finales

- `npm ci` con Node.js 26.13.1: correcto; lockfile regenerado sin dependencias heredadas.
- `npm run lint`: correcto con ESLint 9.39.5 y eslint-config-next 16.4.6.
- `npm run build`: correcto, Next.js 16.4.6; solo `/` y `/404` generados, aparte de infraestructura interna del framework.
- `npm run dev`: `/` responde 200 sin archivos de entorno; servidor ejecutado con Node.js 26.13.1.
- `npm start`: `/` responde 200 sin archivos de entorno; servidor ejecutado con Node.js 26.13.1.
- 34 patrones retirados: 21 de interfaz/auxiliares y 13 API. Se verificaron 86 respuestas 404: GET para las 21 primeras y GET/POST/PUT/DELETE/PATCH para cada API.
- Chrome headless con Playwright temporal (sin dependencia agregada al proyecto): viewport 320x640 y 1440x900; texto visible exacto, un solo h1 y sin desbordamiento horizontal. Inspección visual de captura móvil correcta.
- Navegador de producción: cero errores de consola y cero peticiones externas; HTML y recursos solicitados no contienen los valores sensibles heredados comprobados en memoria, sin imprimirlos.
- Se añadió título de pestaña y favicon vacío de datos para evitar la petición automática a un favicon inexistente, sin agregar otra ruta.
- `next dev` añade su bloque estándar de documentación de agentes a `AGENTS.md`; se conservó junto a las instrucciones compartidas.
- Se retiró `jsconfig.json`: solo contenía un alias base que ya no usa la pantalla mínima.
- OpenSpec: validación estricta correcta. Se conservaron skills e historial de planificación.
- Revisión contra el playbook: cambios dentro del reinicio autorizado, sin dependencias de datos ni código de negocio reutilizado. `git diff --check` y comprobación del remoto correctos.

Las verificaciones se ejecutaron mediante herramientas temporales fuera del proyecto; no se añadió un framework de tests para una pantalla estática. No se hizo commit, push, archivo de OpenSpec ni deploy. La eliminación de `.env.local` está preparada en el índice para retirarlo del seguimiento; el resto queda para revisión local.

## Publicación solicitada posteriormente

El usuario solicitó trabajar siempre directamente en `main`, sin crear ramas nuevas, y subir todos estos cambios a esa rama. Se actualizaron AGENTS.md, CLAUDE.md y el contexto OpenSpec con esta preferencia para el proyecto. El remoto solo tenía `master`; se creó `main` desde el estado validado sin reescribir ni borrar el historial o la rama anterior. La restricción de no publicar de la etapa de implementación queda sustituida por esta solicitud explícita de push; no se ejecuta un despliegue manual ni se modifica Vercel.
