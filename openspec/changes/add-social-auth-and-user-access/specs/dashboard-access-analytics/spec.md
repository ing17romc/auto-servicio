# Spec Delta

## Purpose

Medir las entradas autorizadas al dashboard y ofrecer a los administradores estadísticas y evidencia temporal de uso.

## ADDED Requirements

### Requirement: Eventos de autenticación y acceso separados
El sistema SHALL registrar por separado inicios de sesión exitosos y entradas autorizadas a `/dashboard`, asociados al usuario interno y una fecha UTC. La renovación o consulta de sesión no SHALL contar como inicio de sesión.

#### Scenario: Inicio sin entrada al dashboard
- **WHEN** una cuenta Pendiente completa Google
- **THEN** se registra un inicio de sesión y ningún acceso al dashboard

### Requirement: Conteo de entradas al dashboard
El sistema SHALL contar una entrada por navegación autorizada a `/dashboard`, incluida cada recarga. Precargas, recursos, solicitudes internas de renderizado y accesos denegados no SHALL agregar entradas; los reintentos técnicos de una misma entrada no SHALL duplicarla.

#### Scenario: Navegación y recarga
- **WHEN** un usuario autorizado entra al dashboard y luego recarga una vez
- **THEN** se registran dos entradas y el contador acumulado aumenta en dos

#### Scenario: Precarga y reintento
- **WHEN** Next.js precarga la ruta y luego reintenta el registro técnico de una única navegación real
- **THEN** la precarga no registra acceso y la navegación registra exactamente uno

#### Scenario: Fallo de persistencia
- **WHEN** no puede confirmarse el evento de entrada
- **THEN** no se confirma el acceso al dashboard y se ofrece reintentar sin duplicar eventos ya confirmados

### Requirement: Estadísticas administrativas
Solo Administrador SHALL consultar una gráfica diaria, total de accesos, usuarios únicos y tabla paginada de usuario y fecha, por rango de fechas y por usuario opcional. Las fechas y agrupaciones SHALL utilizar America/Mexico_City; los días sin eventos muestran cero.

#### Scenario: Consulta agregada o individual
- **WHEN** un administrador selecciona un período y opcionalmente un usuario
- **THEN** gráfica, totales y tabla usan el mismo filtro con inicio inclusivo y final exclusivo del día siguiente
- **AND** se incluyen solo entradas al dashboard, no eventos de inicio de sesión

#### Scenario: Fechas inválidas
- **WHEN** el período es inválido o excede el historial disponible
- **THEN** se informa el límite y no se presentan cifras parciales como si cubrieran todo el período

### Requirement: Conservación y privacidad
El sistema SHALL conservar detalle de eventos durante 365 días y auditoría de roles durante 730 días, excluir registros vencidos de las consultas y conservar contadores acumulados por usuario mientras exista la cuenta. Los eventos no SHALL contener tokens, cookies, IP ni agentes de navegador.

#### Scenario: Caducidad del detalle
- **WHEN** una entrada supera 365 días
- **THEN** deja de aparecer en estadísticas y detalle, sin reducir el contador acumulado ni borrar la última fecha de acceso
- **AND** la interfaz distingue el total histórico del total del período disponible
