# Spec Delta

## MODIFIED Requirements

### Requirement: Renderizado inicial desde servidor
La pantalla autorizada SHALL entregar el saludo `Hola, {nombre}` (o `Hola` cuando no haya nombre disponible) en el HTML inicial, sin enviar Express, Mongoose, el driver MongoDB ni secretos al navegador. El documento SHALL declarar idioma español y metadatos apropiados por página.

#### Scenario: Solicitud sin JavaScript
- **WHEN** una cuenta autorizada solicita `/dashboard` con JavaScript desactivado
- **THEN** puede leer el encabezado con el saludo, el documento tiene idioma español y título `General Dashboard`, y no hay dependencias de backend en los recursos cliente
