# Spec Delta

## Purpose

Garantizar que la base nueva pueda instalarse, ejecutarse y compilarse de forma reproducible para Vercel sin depender de los servicios retirados.

## ADDED Requirements

### Requirement: Runtime compatible con Vercel
El proyecto SHALL declarar y usar Node.js 26.x, soportado por Vercel, y una versión estable de Next.js compatible. Las versiones elegidas SHALL quedar registradas para reproducir el entorno.

#### Scenario: Preparación del entorno
- **WHEN** se configura el proyecto para desarrollo o construcción
- **THEN** se utiliza Node.js 26.x y la versión estable de Next.js fijada en el proyecto
- **AND** no se seleccionan versiones canary ni experimentales

### Requirement: Instalación y ejecución reproducibles
El proyecto SHALL permitir instalar con `npm ci`, iniciar desarrollo con `npm run dev`, compilar con `npm run build` y servir producción con `npm start`, sin variables de entorno obligatorias ni servicios de datos disponibles.

#### Scenario: Arranque desde una instalación limpia
- **WHEN** se instala y compila el proyecto con Node.js 26.x sin credenciales externas
- **THEN** la instalación y compilación terminan correctamente y el servidor de producción atiende `/`

### Requirement: Independencia de las integraciones retiradas
La instalación y ejecución SHALL funcionar sin Firebase, MySQL, drivers de MongoDB ni librerías de interfaz heredadas. Esta etapa SHALL mantener cero APIs y cero conexiones a bases de datos.

#### Scenario: Operación con servicios externos ausentes
- **WHEN** se inicia el dashboard sin acceso a Firebase, MySQL o MongoDB
- **THEN** el arranque no requiere autenticación ni acceso a esos servicios y la pantalla permanece disponible

### Requirement: Configuración sin secretos versionados
La base resultante SHALL excluir archivos de entorno reales del seguimiento de Git y ofrecer un ejemplo sin credenciales. Los secretos SHALL estar ausentes del HTML y de los recursos enviados al navegador.

#### Scenario: Inspección del estado resultante
- **WHEN** se revisan el árbol versionado y la salida del build después de la limpieza
- **THEN** no se incluye `.env.local` en el árbol vigente ni valores de credenciales en el ejemplo o en los recursos públicos
- **AND** este requisito no implica reescribir commits anteriores

### Requirement: Continuidad del repositorio y del destino de despliegue
El cambio SHALL conservar el historial y remoto existentes de GitHub y permitir construir en el proyecto Vercel existente sin crear otro repositorio ni otro proyecto de alojamiento.

#### Scenario: Preparación de una futura publicación
- **WHEN** se prepara el build con el preset de Next.js, la raíz del repositorio y Node.js 26.x
- **THEN** se usa el mismo repositorio y destino Vercel existente
- **AND** la limpieza local no publica automáticamente ni modifica recursos externos
