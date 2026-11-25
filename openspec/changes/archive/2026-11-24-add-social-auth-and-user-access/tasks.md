# Tasks

## 1. Base de autenticación y persistencia

- [x] 1.1 Leer las guías locales vigentes de Next.js y aplicar las skills React, MongoDB schema y conexión; fijar Better Auth y driver oficial compatibles con Node 26.13.1, verificando instalación reproducible y ausencia de paquetes beta.
- [x] 1.2 Crear módulos server-only con conexión diferida, pool reutilizado y errores controlados; verificar que build sin credenciales no conecta a MongoDB y que la caída de base no concede acceso.
- [x] 1.3 Preparar scripts explícitos de índices/validadores y entorno de integración aislado con replica set; verificar unicidad de identidad/perfil/evento y transacciones, documentando cómo ejecutarlos sin MCP de escritura.
- [x] 1.4 Configurar Better Auth, Google y sesiones persistentes sin contraseña ni vinculación automática; probar callbacks válidos, cancelación, identidad inválida, correo en conflicto, registro concurrente y cierre/expiración con proveedor simulado exclusivo de pruebas.
- [x] 1.5 Implementar creación consistente de perfil pending y registro idempotente de inicio de sesión; verificar que reingreso preserva id y rol y que consultas o renovaciones de sesión no aumentan inicios.
- [x] 1.6 Documentar configuración OAuth, scopes mínimos, callbacks, sesión de 7 días y placeholders en .env.example/README; verificar que no se versionan secretos ni se persisten tokens de proveedor innecesarios.

## 2. Permisos y administración segura

- [x] 2.1 Implementar autorización central por sesión y rol actual, con DTO mínimos y sin caché privada compartida; probar matriz completa, 401/403, rol desconocido y degradación con sesiones existentes.
- [x] 2.2 Implementar singleton de control y script privado de primer administrador por id registrado; probar bootstrap concurrente, identidad inexistente, segunda ejecución rechazada y ausencia de endpoint público; documentar procedimiento del operador.
- [x] 2.3 Implementar asignación de rol transaccional, roleVersion y auditoría; probar inputs inválidos, actor degradado concurrentemente, reversión por fallo y degradaciones paralelas del último administrador.
- [x] 2.4 Implementar búsqueda escapada por nombre/correo, filtro por rol, paginación y DTO del listado; probar límites, orden estable, entradas maliciosas, sin coincidencias y métricas históricas independientes de TTL.
- [x] 2.5 Documentar matriz y contratos administrativos; verificar que cada Server Action revalida permisos y origen y que ningún dato de autenticación se serializa al cliente.

## 3. Navegación e interfaz

- [x] 3.1 Convertir / en login Google y crear /pending y /dashboard con redirecciones por rol y logout; verificar rutas directas, expiración y render del h1 General Dashboard sin JavaScript.
- [x] 3.2 Crear /users con campos, filtros y controles de rol, versiones obsoletas y errores recuperables; verificar con Playwright que solo admin accede y que actualizar un rol cambia el siguiente acceso de la cuenta afectada.
- [x] 3.3 Incorporar idioma español, metadatos por página, navegación y estados de carga/error/vacío; comprobar teclado, foco, etiquetas y viewport 320 px sin desbordamiento.
- [x] 3.4 Actualizar AGENTS.md, README y contexto OpenSpec al comportamiento ampliado sin editar playbook ni skills oficiales; revisar que las rutas de negocio y 13 APIs heredadas siguen retiradas y documentar las excepciones nuevas.

## 4. Eventos y estadísticas

- [x] 4.1 Implementar entrada al dashboard desde navegación de documento autorizada, id por petición y escritura transaccional evento/contador; probar recarga, precarga, solicitudes RSC, rerender, reintentos, sin JavaScript y fallo de persistencia con Next.js real.
- [x] 4.2 Implementar TTL 365 días para eventos y 730 para auditoría, excluyendo vencidos en lectura; probar caducidad con reloj controlado y comprobar que contador y última fecha se conservan; documentar retención y datos excluidos.
- [x] 4.3 Implementar agregación por día America/Mexico_City, total del período, usuarios únicos y filtro opcional; probar bordes UTC/local, días vacíos, período inválido, límite de retención y concordancia con eventos de referencia.
- [x] 4.4 Crear /users/activity con gráfica SVG accesible, tabla paginada y filtros compartidos, predeterminado 30 días; verificar que gráfica, totales y tabla coinciden y que errores de consulta no muestran ceros falsos.
- [x] 4.5 Documentar la definición de entrada, coste de navegación completa y diferencia entre acumulado histórico y detalle retenido; verificar la UI contra esos contratos con pruebas de roles y rango.

## 5. Integración y cierre de implementación

- [x] 5.1 Ejecutar npm run lint, npm run build, pruebas unitarias, integración y Playwright con Node 26.13.1; registrar resultados y corregir fallos del alcance, incluyendo build sin credenciales y operación con base aislada.
- [ ] 5.2 Validar Google real cuando estén disponibles las credenciales privadas, con cuentas Pendiente/Usuario/Administrador y bootstrap del operador; registrar evidencia sin secretos y distinguirla de los mocks. Si faltan credenciales, informar esta verificación pendiente sin afirmar éxito real.
- [x] 5.3 Ejecutar npm run openspec -- validate --all --strict y revisar diff contra playbook; verificar permisos, ausencia de secretos, continuidad GitHub/Vercel y que no hubo despliegue.

## Workflow follow-up

- Sincronizar y archivar las especificaciones cuando se solicite cerrar la implementación completada.
- Publicar únicamente ante una solicitud posterior explícita, conservando el destino Vercel existente.
