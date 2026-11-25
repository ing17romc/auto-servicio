import assert from 'node:assert/strict'
import test from 'node:test'
import { geoArea, geoMercator, geoPath } from 'd3'
import { CADENAS } from '../backend/dashboard/config.mjs'
import { cargarDatos, validarConjunto } from '../backend/dashboard/datasets.mjs'
import {
  PARAMS_VACIOS,
  SEM,
  SEMANAS,
  aFilas,
  calcularTodo,
  fmt,
  opcionesFiltro,
  preparar,
} from '../backend/dashboard/calc.mjs'

const payload = cargarDatos()
const base = preparar(payload)
const todo = calcularTodo(base, PARAMS_VACIOS, CADENAS)
const suma = (rows, campo) => rows.reduce((s, r) => s + (+r[campo] || 0), 0)
const cerca = (real, esperado, mensaje) =>
  assert.ok(
    Math.abs(real - esperado) <= Math.max(0.05, Math.abs(esperado) * 1e-9),
    `${mensaje}: ${real} vs ${esperado}`
  )

test('los archivos de datos conservan el formato esperado', () => {
  assert.equal(base.tiendas.length, payload.tiendas.rows.length)
  assert.ok(base.semanal.length > 0 && base.puntos.length > 0)
  assert.throws(
    () =>
      validarConjunto('semanal', { columns: ['cadena'], rows: [] }),
    /le falta la columna "rac"/
  )
  assert.throws(() => validarConjunto('puntos', { rows: [] }), /columns y rows/)
})

test('los límites de estados se pueden proyectar sin anillos degenerados', () => {
  const { estados } = payload
  assert.equal(estados.features.length, 32)
  for (const f of estados.features)
    for (const poligono of f.geometry.coordinates)
      for (const anillo of poligono) assert.ok(anillo.length >= 4, f.properties.estado)
  const proyeccion = geoMercator().fitExtent(
    [[6, 6], [1192, 780]],
    { type: 'FeatureCollection', features: estados.features }
  )
  const camino = geoPath(proyeccion)
  for (const f of estados.features) {
    assert.ok(camino(f)?.length > 0 && camino.centroid(f).every(Number.isFinite), f.properties.estado)
    // Un estado es una porción pequeña de la esfera; un área mayor indica orientación invertida.
    assert.ok(geoArea(f) < 0.01, `${f.properties.estado} con orientación invertida`)
  }
  const [[x0, y0], [x1, y1]] = camino.bounds({
    type: 'FeatureCollection',
    features: estados.features,
  })
  assert.ok(x1 - x0 > (y1 - y0) * 1.2, 'México es más ancho que alto')
})

test('indicadores sin filtros coinciden con la suma directa de los datos', () => {
  const k = todo.kpi[0]
  cerca(k.ytd26_p, suma(base.tiendas, 'ytd26_p'), 'venta acumulada 2026')
  cerca(k.ytd25_p, suma(base.tiendas, 'ytd25_p'), 'venta acumulada 2025')
  cerca(k.ytd26_u, suma(base.tiendas, 'ytd26_u'), 'unidades 2026')
  cerca(k.s46_p, suma(base.tiendas, 's46_p'), 'venta de la semana')
  cerca(k.var_p, k.ytd26_p / k.ytd25_p - 1, 'variación en pesos')
  cerca(k.prom_p, k.ytd26_p / SEM, 'promedio semanal')
  const pisos = new Set(
    base.tiendas
      .filter((r) => +r.l4_u > 0 || +r.inv_u > 0)
      .map((r) => r.cadena + '|' + r.det)
  )
  const pisosVenta = new Set()
  for (const id of pisos) {
    const filas = base.tiendas.filter((r) => r.cadena + '|' + r.det === id)
    if (suma(filas, 'l4_u') > 0 || suma(filas, 'inv_u') > 0) pisosVenta.add(id)
  }
  assert.equal(k.pisos, pisosVenta.size)
})

test('resultados por cadena suman el total y la participación es 100%', () => {
  const k = todo.kpi[0]
  cerca(suma(todo.por_cadena, 'ytd26_p'), k.ytd26_p, 'suma por cadena')
  cerca(suma(todo.por_cadena, 'part'), 1, 'participación')
  assert.deepEqual(
    todo.por_cadena.map((r) => r.clave).sort(),
    [...CADENAS].sort()
  )
})

test('el consolidado usa plan operativo igual a la venta 2025 más 10%', () => {
  const k = todo.kpi[0]
  const [, semanaP, , acumP] = todo.ocho
  cerca(semanaP.plan, +((k.s46aa_p / 1e3) * 1.1).toFixed(1), 'plan semana')
  cerca(acumP.real, +(k.ytd26_p / 1e3).toFixed(1), 'real acumulado')
  cerca(acumP.aa, +(k.ytd25_p / 1e3).toFixed(1), 'año anterior acumulado')
  cerca(acumP.v_plan, +(acumP.real - acumP.plan).toFixed(1), 'diferencia vs plan')
})

test('el filtro de cadena restringe todas las cifras a esa cadena', () => {
  const w = calcularTodo(base, { ...PARAMS_VACIOS, cadena: 'Walmart' }, CADENAS)
  const filas = base.tiendas.filter((r) => r.cadena === 'Walmart')
  cerca(w.kpi[0].ytd26_p, suma(filas, 'ytd26_p'), 'venta Walmart')
  assert.deepEqual(w.por_cadena.map((r) => r.clave), ['Walmart'])
  assert.ok(w.puntos_m.every((p) => ['Walmart', "Sam's Club"].includes(p.cadena)))
})

test('el filtro de estado no cambia la tendencia semanal', () => {
  const e = calcularTodo(
    base,
    { ...PARAMS_VACIOS, estado: 'Jalisco' },
    CADENAS
  )
  assert.deepEqual(e.serie, todo.serie)
  assert.ok(e.kpi[0].ytd26_p < todo.kpi[0].ytd26_p)
  assert.ok(e.por_estado.length > 1, 'el ranking por estado ignora su propio filtro')
})

test('la tendencia real cubre hasta la semana del corte y la proyectada desde ella', () => {
  assert.equal(todo.serie.length, SEMANAS)
  for (const r of todo.serie) {
    assert.equal(r.p2026 == null, r.semana > SEM)
    assert.equal(r.p_tend == null, r.semana < SEM)
  }
  const corte = todo.serie.find((r) => r.semana === SEM)
  assert.equal(corte.p_tend, corte.p2026)
})

test('Sam’s solo se muestra como presencia con Walmart o sin cadena', () => {
  const sin = calcularTodo(base, { ...PARAMS_VACIOS, cadena: 'Chedraui' }, CADENAS)
  assert.ok(sin.por_estado.every((r) => r.sams === 0))
  assert.ok(todo.por_estado.some((r) => r.sams > 0))
})

test('alertas, accionables y destacados se construyen con los mismos datos', () => {
  const [a] = todo.alertas
  assert.equal(todo.top_bodega.length, Math.min(15, a.bodega))
  assert.ok(todo.top_sobre.every((r) => r.cob > 26))
  assert.ok(todo.top_faltante.every((r) => r.l4_u > 0 && r.cob < 2))
  assert.ok(todo.pedido.length <= 25)
  assert.ok(todo.pedido.every((r, i, l) => !i || l[i - 1].sug_u >= r.sug_u))
  assert.ok(todo.destacados.length >= 4)
  assert.match(todo.destacados[0].texto, new RegExp(`^Semana ${SEM}:`))
  assert.ok(todo.acciones.every((x) => ['Alta', 'Media', 'Baja'].includes(x.prioridad)))
})

test('los selectores ofrecen los valores disponibles bajo los demás filtros', () => {
  const estados = opcionesFiltro(base.tiendas, PARAMS_VACIOS, 'estado')
  assert.ok(estados.length > 20)
  const deChedraui = opcionesFiltro(
    base.tiendas,
    { ...PARAMS_VACIOS, cadena: 'Chedraui', estado: 'Jalisco' },
    'estado'
  )
  const esperados = new Set(
    base.tiendas.filter((r) => r.cadena === 'Chedraui').map((r) => r.estado)
  )
  assert.deepEqual(deChedraui, [...esperados].sort((a, b) => a.localeCompare(b, 'es')))
})

test('los formatos reproducen los del artefacto', () => {
  assert.equal(fmt.m(1234567), '$1.2 M')
  assert.equal(fmt.m(45600), '$46 mil')
  assert.equal(fmt.m(null), '—')
  assert.equal(fmt.vari(0.0234), '+2.3%')
  assert.equal(fmt.vari(-0.05), '−5.0%')
  assert.equal(fmt.paren(-1234), '(1,234)')
  assert.equal(fmt.parenP(-0.07), '(7%)%')
  assert.equal(fmt.cls(-0.05), 'warn')
  assert.equal(fmt.cls(-0.2), 'bad')
  assert.deepEqual(aFilas({ columns: ['a', 'b'], rows: [[1, 2]] }), [{ a: 1, b: 2 }])
})
