# Spec Delta

## MODIFIED Requirements

### Requirement: Independencia de las integraciones retiradas
La instalación y ejecución SHALL funcionar sin Firebase, MySQL ni librerías de interfaz heredadas. Express y Mongoose SHALL estar instalados para uso futuro sin iniciar servidores, crear APIs o conectar bases de datos durante el arranque del dashboard.

#### Scenario: Operación con servicios externos ausentes
- **WHEN** se inicia el dashboard sin acceso a Firebase, MySQL o MongoDB
- **THEN** el arranque no requiere autenticación ni acceso a esos servicios y la pantalla permanece disponible

#### Scenario: Dependencias de backend disponibles
- **WHEN** se importan Express y Mongoose después de una instalación limpia
- **THEN** ambas dependencias se resuelven localmente y Mongoose permanece desconectado sin abrir puertos ni requerir credenciales

## ADDED Requirements

### Requirement: Renderizado inicial desde servidor
La pantalla SHALL entregar el encabezado `General Dashboard` en el HTML inicial, sin enviar Express, Mongoose ni sus credenciales al navegador.

#### Scenario: Solicitud sin JavaScript
- **WHEN** se solicita `/` con JavaScript deshabilitado
- **THEN** se puede leer el encabezado, el documento tiene idioma inglés y título `General Dashboard`, y no hay dependencias de backend en los recursos cliente
