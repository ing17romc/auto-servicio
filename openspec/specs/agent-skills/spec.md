# agent-skills Specification

## Purpose

Proporcionar guías oficiales reutilizables de frontend, despliegue y MongoDB con la misma disponibilidad al clonar el proyecto para Claude Code y Codex.

## Requirements

### Requirement: Catálogo oficial portable
El repositorio SHALL incluir las siete skills solicitadas de Vercel y MongoDB, con sus instrucciones, recursos y licencias, disponibles para Claude Code y Codex tras clonar el proyecto.

#### Scenario: Nueva máquina
- **WHEN** una persona clona el proyecto y abre un asistente compatible desde su raíz
- **THEN** encuentra las seis skills OpenSpec y las siete oficiales nuevas sin depender de directorios personales de otra máquina

### Requirement: Trazabilidad y equivalencia
Cada skill nueva SHALL tener registrado repositorio, commit y ruta de origen; las copias para ambos asistentes SHALL tener contenido equivalente.

#### Scenario: Auditoría de instalación
- **WHEN** se compara el inventario de procedencias con los archivos de ambos asistentes
- **THEN** las siete skills tienen origen oficial identificable y no hay archivos divergentes entre sus dos copias

### Requirement: Guías y herramientas separadas
Las skills SHALL conservar OpenSpec y los MCP Context7, Playwright y MongoDB existentes. Instalar una skill SHALL NOT desplegar ni escribir en una base por sí mismo.

#### Scenario: Skills instaladas sin credenciales
- **WHEN** se prepara el repositorio sin una URI de MongoDB ni sesión de Vercel
- **THEN** las guías quedan disponibles sin ejecutar operaciones externas y la aplicación sigue funcionando
