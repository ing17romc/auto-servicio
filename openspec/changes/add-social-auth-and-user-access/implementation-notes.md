# Registro de implementación

## Alcance y estado

Cambio `add-social-auth-and-user-access`, implementado directamente en `master`. Login Google, Pendiente/Usuario/Administrador, dashboard protegido, usuarios, cambios auditados de rol y actividad con gráfica accesible. No se crearon ramas, commits, push, recursos externos ni despliegues. El cambio no se sincroniza ni archiva automáticamente.

La única verificación pendiente es Google real con configuración privada (tarea 5.2). Se comprobó únicamente la presencia de las seis variables requeridas: ninguna está definida en el entorno y no existe .env.local. No se imprimieron valores ni se utilizó la conexión MongoDB del asistente. La interfaz sin configuración permanece cerrada y muestra login deshabilitado.

## Decisiones de implementación

- Better Auth 1.7.27, driver directo mongodb 6.21.0, Next 16.4.6, React 19.3.1 y Node 26.13.1. Se descartaron drivers 7.9.1 y 6.22.0 porque sus implementaciones ignoran timeoutMS; 6.21.0 mantiene los límites requeridos y satisface el rango del adaptador. Auditoría npm sin vulnerabilidades de producción.
- Verificación explícita de firma, emisor, audiencia, vigencia y correo verificado de Google también durante intercambio del código OAuth, usando el verificador de Better Auth. Las pruebas incluyen un emisor inválido. No hay OAuth casero ni un modo simulado habilitable en la aplicación.
- Identificadores UUID de texto mediante generador personalizado del adaptador; no usar correo para determinar identidad o permisos.
- Las transacciones del singleton serializan roles, bootstrap y conteo administrativo. Permisos reconsultados desde base en cada operación; un cambio concurrente del actor no le conserva privilegios.
- Registro de navegación en proxy.js antes del render, con autorización repetida en cada página/acción. Se conservan cargas de documento y se desactiva expresamente la regla ESLint de enlaces SPA para este propósito. No se usa un efecto cliente para medir entradas.
- Sin loading boundary global: la comprobación de navegador mostró que el contenido transmitido mediante esa frontera no satisfacía el dashboard visible sin JavaScript. La página entrega el HTML autorizado completo; botones y formularios muestran sus estados pendientes.
- Contención relativa en la tabla desplazable para que etiquetas accesibles posicionadas no amplíen el documento en móvil. Se verificaron capturas de login, Usuarios y Actividad a 320 px.
- La paginación de usuarios se ordena por userId con cursor estable; el detalle de eventos por orden de inserción. Las estadísticas se agrupan por fecha de evento en America/Mexico_City.
- Scripts de preparación y bootstrap son privados y explícitos; no se ejecutaron contra una base real. MongoDB MCP sigue de solo lectura.

## Verificaciones

Todas las validaciones finales usan Node 26.13.1 y npm-cli.js explícitos. El wrapper npm.ps1 de Windows seleccionó inicialmente su Node 24 adyacente durante la primera instalación; se corrigió ejecutando npm ci y las validaciones con el binario Node 26. No se cambió el Node global.

- Instalación reproducible con npm ci y versiones fijadas.
- npm run lint y npm run build correctos sin credenciales externas. Rutas: /, /pending, /dashboard, /users, /users/activity, /api/auth/[...all], más infraestructura interna Next.
- npm test: 17 pruebas correctas. OAuth Google sintético con claves RSA, cookies y estados de la librería real; identidad estable; cancelación y conflictos; concurrencia de registro; bootstrap; último administrador; actor degradado; rollback de auditoría; paginación; idempotencia; fechas y permisos.
- npm run test:e2e: 2 escenarios completos en Google Chrome headless sobre build de producción, con replica set temporal aislado y cuentas sintéticas. Login, pendiente, dashboard sin JavaScript, recarga y precarga, edición efectiva de rol desde UI, gráfica y tabla equivalente, filtro inválido, móvil/teclado, 401/403, logout y revocación, MongoDB detenido y estado sin configuración.
- Inventario retirado: 21 rutas de interfaz con GET y 13 APIs con GET/POST/PUT/DELETE/PATCH, 86 respuestas HTTP 404.
- npm run openspec -- validate --all --strict: 4 elementos correctos.
- git diff --check sin errores de whitespace; Git avisa únicamente de normalización LF/CRLF de Windows.
- Solo .env.example está versionado; las variables se documentan vacías. La configuración y las credenciales de autenticación no se serializan al cliente.

Los replica sets de prueba se crearon en directorios temporales, se detuvieron y eliminaron al finalizar. La descarga de MongoDB para pruebas permanece en caché local, no en el repositorio. Las capturas solo contienen cuentas sintéticas y se guardaron en TEMP.

## Revisión contra el playbook

Estructura App Router y backend separados; cambios limitados a autenticación, permisos, actividad y documentación. Validación de entradas y errores controlados. Tests necesarios para contratos de autorización y transacciones. Interfaz española con estados de vacío/error/carga y controles accesibles. Dependencias justificadas y fijadas; Express/Mongoose inactivos. No se cambió el playbook global, el catálogo de skills, el remoto GitHub ni Vercel.

Para habilitar el portal real: completar .env.local en privado, configurar cliente Google y base nueva con transacciones, ejecutar npm run db:setup, registrar la cuenta del operador y ejecutar npm run admin:bootstrap -- ID_INTERNO_REGISTRADO. Completar después la tarea 5.2 con cuentas reales de cada rol. No considerar los mocks evidencia de validación contra Google real.

## Configuración real completada el 23 de noviembre de 2026

Esta sección sustituye la condición inicial de ausencia de credenciales descrita arriba. Se configuró en privado .env.local, ignorado por Git, con una base nueva auto_servicio en el clúster Atlas existente y un cliente OAuth del proyecto Google Cloud separado Auto-Servicio. No se guardaron valores de secretos en este registro.

- Conexión Atlas real confirmada; npm run db:setup creó colecciones, validadores e índices correctamente con el usuario limitado del portal.
- Se importó el JSON OAuth elegido por el usuario desde su Escritorio, validando el proyecto y el callback http://localhost:3000/api/auth/callback/google. El archivo original no se copió al repositorio.
- Inicio de OAuth real: HTTP 200, destino accounts.google.com, callback correcto y estado presente.
- El usuario completó personalmente el consentimiento Google. Se confirmó una identidad Google, un perfil Pendiente, una sesión y un evento sign_in en la base real.
- Se ejecutó una vez el bootstrap privado para la identidad recién registrada: promoción a Administrador con auditoría transaccional.
- En el navegador real, la sesión existente pasó de Pendiente al dashboard sin reiniciar sesión. Usuarios mostró Administrador, una entrada acumulada y último inicio de sesión; Actividad mostró un acceso, un usuario único y su detalle y gráfica.
- Portal local activo en http://localhost:3000 con Node 26.13.1. No se hizo push ni despliegue ni configuración de producción en Vercel.
- La entrada de red Atlas autorizada por el usuario es temporal de seis horas. El acceso de producción requerirá configuración de red y callbacks propios.

La tarea 5.2 sigue pendiente de completar para una segunda cuenta Google real y comprobaciones de Usuario/Pendiente independientes. No se degrada al único administrador para intentar esa prueba. Los tres roles y las transacciones ya cuentan con las pruebas aisladas registradas arriba; esta evidencia real confirma registro Pendiente y posterior acceso Administrador.

## Preparación de Vercel autorizada el 24 de noviembre de 2026

- Proyecto Vercel existente confirmado: auto-servicio-ybs8, dominio auto-servicio.vercel.app y repositorio GitHub existente. No se creó otro proyecto.
- El usuario autorizó explícitamente el callback compartido de Google, la transferencia privada de las credenciales a Vercel, un secreto de sesión exclusivo y Node 26, sin publicación.
- Google confirmó guardados el origen https://auto-servicio.vercel.app y callback https://auto-servicio.vercel.app/api/auth/callback/google, conservando localhost en el mismo cliente OAuth.
- Vercel confirmó seis variables tipo Secret, únicamente en Production: MONGODB_URI, MONGODB_DB, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, BETTER_AUTH_URL y BETTER_AUTH_SECRET. No se imprimieron valores; el secreto de sesión se generó aleatoriamente y es independiente del local.
- Runtime remoto actualizado de Node 18 a 26.x; confirmación visual de éxito. Preset Next.js, raíz del repositorio y overrides de comandos desactivados, sin cambios adicionales.
- Plan Hobby confirmado. Networking muestra Advanced Networking (Static IPs) como función Pro. No se contrató ningún plan ni se habilitó una función de pago.
- La regla Atlas para la IP local se guardó por una semana, hasta el 1 de diciembre de 2026 a las 09:09 (America/Mexico_City). Esta regla no autoriza las conexiones salientes de Vercel.
- Pendiente decidir y autorizar el acceso de red de Vercel a Atlas antes de publicar o validar autenticación desde Vercel. No se agregó 0.0.0.0/0 ni se debilitó la lista de acceso.
- No hubo commit, push, redeploy ni publicación. Las variables y el runtime se aplicarán en un futuro despliegue solicitado por el usuario.
