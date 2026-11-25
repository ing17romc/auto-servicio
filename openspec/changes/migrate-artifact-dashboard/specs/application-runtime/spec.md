# Spec Delta

## MODIFIED Requirements

### Requirement: Independencia de las integraciones retiradas
La aplicación SHALL funcionar sin Firebase, MySQL ni interfaz heredada. La autenticación y los datos persistentes SHALL ejecutarse en servidor mediante App Router y MongoDB, sin iniciar un servidor Express separado ni enviar dependencias de backend al navegador. Los datos del dashboard de venta e inventario SHALL provenir de archivos JSON del servidor, sin usar MongoDB.

#### Scenario: Operación con servicios externos ausentes
- **WHEN** MongoDB o Google no están disponibles
- **THEN** las operaciones dependientes fallan de forma controlada sin conceder permisos ni intentar integraciones retiradas

#### Scenario: Dependencias de backend disponibles
- **WHEN** se importan Express y Mongoose después de una instalación limpia
- **THEN** ambas dependencias se resuelven sin iniciar servidores y permanecen inactivas salvo necesidad explícita de otra funcionalidad

#### Scenario: Datos del dashboard sin base de datos
- **WHEN** una cuenta autorizada solicita los datos del dashboard
- **THEN** el servidor los lee de sus archivos JSON sin consultar MongoDB

### Requirement: Renderizado inicial desde servidor
La pantalla autorizada SHALL entregar en el HTML inicial el encabezado de nivel uno con el título del dashboard y la estructura de filtros y pestañas, sin enviar Express, Mongoose, el driver MongoDB ni secretos al navegador, y sin incluir los datos de venta en el HTML ni en recursos estáticos. El documento SHALL declarar idioma español y metadatos apropiados por página.

#### Scenario: Solicitud sin JavaScript
- **WHEN** un usuario autorizado solicita `/dashboard` con JavaScript deshabilitado
- **THEN** puede leer el encabezado con el título del dashboard, el documento tiene idioma español y título `General Dashboard`, y no hay dependencias de backend ni datos de venta en el HTML ni en los recursos estáticos
