# Instrucciones del proyecto

- Antes de analizar o modificar codigo, leer el playbook personal si existe:
  `C:\Users\ing_r\iCloudDrive\AI-Coding-Standards\PLAYBOOK.md`.
  En otra maquina donde no exista, aplicar las convenciones del repositorio e informar la limitacion.
- Mantener cambios acotados, proteger secretos y validar segun el alcance.
- Frontend y backend conviven en Next.js Pages Router. Las rutas API estan en
  `pages/api/`; el acceso a datos esta en `backend/mysql/` y `backend/mongodb/`.
- Usar OpenSpec para cambios de funcionalidad solicitados mediante este flujo.
  Consultar `openspec/config.yaml` y las skills `openspec-*`.
- Ejecutar las instrucciones CLI de las skills como
  `npm run openspec -- <argumentos>` (version fijada 2.1.1), en lugar del
  ejecutable global, que puede tener otra version.
- No copiar valores de `.env.local` en documentos, mensajes, specs ni ejemplos.
- Al finalizar, revisar contra el playbook y resumir cambios, validaciones y limitaciones.
