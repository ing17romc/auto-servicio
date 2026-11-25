# Spec Delta

## Purpose

Definir el dashboard de venta e inventario por cadena, estado y artículo RAC que se muestra en `/dashboard`, sus filtros, pestañas, datos y la protección de acceso a esos datos.

## ADDED Requirements

### Requirement: Contenido del dashboard por pestañas
El dashboard SHALL mostrar el encabezado con la frase de resumen del corte y seis pestañas: Resumen ejecutivo, Mapa y estados, Productos, Inventarios, Alertas y Accionables, con el contenido y el orden de secciones del artefacto de origen. Solo una pestaña SHALL estar visible a la vez y la inicial SHALL ser Resumen ejecutivo.

#### Scenario: Primera visita
- **WHEN** una cuenta Usuario o Administrador abre `/dashboard`
- **THEN** ve el encabezado con el logotipo, el título y la frase de resumen con la venta acumulada 2026
- **AND** ve la pestaña Resumen ejecutivo seleccionada con sus indicadores principales, el consolidado de la semana 46, la tendencia semanal y los resultados por cadena

#### Scenario: Cambio de pestaña
- **WHEN** la persona selecciona la pestaña Inventarios
- **THEN** se muestra únicamente el contenido de Inventarios y la pestaña queda marcada como seleccionada

### Requirement: Filtros de cadena, estado y artículo
El dashboard SHALL ofrecer filtros de Cadena, Estado y Artículo RAC, chips con el logotipo de cada cadena y la acción "Quitar filtros". Al cambiar un filtro, todas las cifras, tablas, gráficas y mapas que lo admiten SHALL recalcularse sin recargar la página.

#### Scenario: Filtrar por cadena
- **WHEN** la persona activa el chip de una cadena
- **THEN** el filtro de Cadena toma ese valor y las cifras y tablas se recalculan solo con esa cadena

#### Scenario: Quitar filtros
- **WHEN** la persona pulsa "Quitar filtros"
- **THEN** los tres filtros vuelven a su valor inicial y las cifras coinciden con las del estado sin filtros

#### Scenario: Tendencia y filtro de estado
- **WHEN** la persona filtra por Estado
- **THEN** la tendencia semanal sigue respondiendo a los filtros de cadena y artículo, no al de estado

### Requirement: Fidelidad de las cifras
El dashboard SHALL calcular indicadores, variaciones, participación, cobertura, semáforos, alertas, accionables y pedido sugerido con las mismas fórmulas que el artefacto de origen, de modo que con los mismos datos y filtros muestre las mismas cifras.

#### Scenario: Cifras sin filtros
- **WHEN** se abre el dashboard sin filtros con los datos de la semana 46 del artefacto
- **THEN** la venta acumulada 2026, su variación contra 2025, las unidades, la venta de la semana 46 y los pisos de venta coinciden con los mostrados por el artefacto

#### Scenario: Plan operativo
- **WHEN** se muestra el consolidado de la semana 46
- **THEN** el plan operativo es la venta 2025 de la misma semana más 10 por ciento

### Requirement: Gráficas y mapa
El dashboard SHALL mostrar la tendencia semanal 2026 contra 2025 en pesos y en unidades, con tendencia proyectada de la S47 a la S52, un mapa de México con las tiendas por estado y mapas de calor por producto y cadena. Los valores SHALL poder consultarse con un indicador al señalar cada elemento.

#### Scenario: Tendencia proyectada
- **WHEN** se muestra la tendencia semanal
- **THEN** la serie 2026 real cubre de la S1 a la S46 y la tendencia 2026 cubre de la S47 a la S52 con trazo distinto

#### Scenario: Valor de un elemento
- **WHEN** la persona señala un punto de una gráfica o un estado del mapa
- **THEN** se muestra el valor correspondiente dentro del área del dashboard

### Requirement: Datos privados servidos con autorización
Los datos del dashboard SHALL almacenarse como archivos JSON en el servidor y entregarse solo mediante un endpoint que, en cada petición, verifique una sesión válida y el rol Usuario o Administrador. Los archivos de datos SHALL NOT ser accesibles como recursos estáticos públicos ni incluirse en el código entregado al navegador. No se SHALL usar la base de datos para estos datos.

#### Scenario: Sin sesión
- **WHEN** se solicita el endpoint de datos sin sesión
- **THEN** se responde 401 sin entregar datos

#### Scenario: Cuenta pendiente
- **WHEN** una cuenta con rol Pendiente solicita el endpoint de datos
- **THEN** se responde 403 sin entregar datos

#### Scenario: Cuenta autorizada
- **WHEN** una cuenta Usuario o Administrador solicita el endpoint de datos
- **THEN** recibe los datos con la cabecera `cache-control: private, no-store`

#### Scenario: Archivos no públicos
- **WHEN** se solicita directamente la ruta de un archivo de datos fuera del endpoint
- **THEN** se responde 404 sin entregar contenido

### Requirement: Estados de carga y error
El dashboard SHALL indicar el estado de carga y, si los datos no pueden obtenerse, SHALL mostrar un mensaje de error controlado sin cifras en cero ni datos parciales.

#### Scenario: Falla del endpoint de datos
- **WHEN** el endpoint de datos responde con error
- **THEN** el dashboard muestra un mensaje de servicio no disponible y no muestra indicadores

#### Scenario: Datos cargando
- **WHEN** los datos todavía no han llegado
- **THEN** el dashboard muestra un indicador de carga y no muestra cifras

### Requirement: Actualización de datos fuera de la aplicación
Los archivos JSON SHALL conservar el formato del artefacto de origen y poder reemplazarse sin cambiar el código de cálculo. La etiqueta del corte (semana, fechas y año) SHALL derivarse de los datos o de una sola configuración, y no estar repetida en el código de las vistas.

#### Scenario: Reemplazo de archivos
- **WHEN** se sustituyen los JSON de venta por los de una semana posterior con el mismo formato
- **THEN** el dashboard muestra las cifras de la nueva semana sin modificar el código de cálculo
