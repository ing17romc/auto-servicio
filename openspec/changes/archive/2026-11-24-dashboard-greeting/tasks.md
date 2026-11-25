# Tasks

## 1. Implementación

- [ ] 1.1 Confirmar que `add-social-auth-and-user-access` está archivado; si no, detenerse y pedir el orden.
- [x] 1.2 En `app/dashboard/page.js`, sustituir el `<h1>General Dashboard</h1>` por el saludo `Hola, {nombre}` usando `identity.name`, con `Hola` como alternativa si no hay nombre.
- [x] 1.3 En `tests/browser.test.mjs` (línea ~195), actualizar la comprobación del encabezado al saludo con el nombre de la cuenta de prueba.

## 2. Verificación

- [x] 2.1 Ejecutar `npm run lint` con Node.js 26.x.
- [x] 2.2 Ejecutar `npm run build` (sin credenciales).
- [x] 2.3 Ejecutar `npm test`.
- [x] 2.4 Ejecutar `npm run test:e2e` (requiere build y Chrome) y comprobar el saludo con nombre y el caso sin nombre.
- [x] 2.5 Revisar en viewport de 320 px que el saludo no provoca desplazamiento horizontal.
- [x] 2.6 Ejecutar `npm run openspec -- validate dashboard-greeting`.
