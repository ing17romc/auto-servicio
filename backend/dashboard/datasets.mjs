import { CORTE } from './config.mjs'
import semanal from './data/semanal.json' with { type: 'json' }
import tiendas from './data/tiendas.json' with { type: 'json' }
import puntos from './data/puntos.json' with { type: 'json' }
import sams from './data/presencia-sams.json' with { type: 'json' }
import estados from './data/estados.json' with { type: 'json' }

const COLUMNAS = {
  semanal: ['cadena', 'rac', 'anio', 'semana', 'uds', 'pesos', 'inv'],
  tiendas: [
    'cadena',
    'estado',
    'det',
    'num',
    'tienda',
    'rac',
    'ytd26_p',
    'ytd25_p',
    'ytd26_u',
    'ytd25_u',
    's46_p',
    's46_u',
    's46aa_p',
    's46aa_u',
    's45_p',
    's45_u',
    'l4_u',
    'l4_p',
    'l4aa_p',
    'inv_u',
    'emp',
  ],
  puntos: ['cadena', 'num', 'det', 'tienda', 'estado', 'lat', 'lon'],
}

// Falla con un mensaje claro si un archivo no conserva el formato esperado.
export function validarConjunto(nombre, conjunto) {
  const esperadas = COLUMNAS[nombre]
  if (
    !conjunto ||
    !Array.isArray(conjunto.columns) ||
    !Array.isArray(conjunto.rows)
  )
    throw new Error(`Datos del dashboard: "${nombre}" no tiene columns y rows.`)
  for (const columna of esperadas)
    if (!conjunto.columns.includes(columna))
      throw new Error(
        `Datos del dashboard: a "${nombre}" le falta la columna "${columna}".`
      )
  return conjunto
}

// Área firmada del anillo en el plano (x = longitud, y = latitud).
const areaFirmada = (anillo) => {
  let s = 0
  for (let i = 0; i < anillo.length - 1; i++)
    s += anillo[i][0] * anillo[i + 1][1] - anillo[i + 1][0] * anillo[i][1]
  return s / 2
}

// El archivo de límites necesita tres correcciones para d3-geo:
// 1. Anillos sin cerrar (el último punto no repite el primero): se cierran.
// 2. Islotes de 1 a 3 puntos (anillos sin área) que 3.1 no admite al proyectar;
//    un anillo válido tiene al menos 4 posiciones una vez cerrado.
// 3. Orientación mezclada en varios estados: d3 espera el anillo exterior en
//    sentido horario y los huecos en antihorario; si no, interpreta el polígono
//    como "todo el planeta menos el estado" y el mapa se rellena por completo.
export function limpiarEstados(geo) {
  const cerrar = (anillo) => {
    if (!Array.isArray(anillo) || anillo.length === 0) return []
    const [x0, y0] = anillo[0]
    const [x1, y1] = anillo[anillo.length - 1]
    return x0 === x1 && y0 === y1 ? anillo : [...anillo, anillo[0]]
  }
  // Sin área (puntos repetidos o alineados) tampoco forma un polígono.
  const valido = (anillo) =>
    anillo.length >= 4 && Math.abs(areaFirmada(anillo)) > 1e-9
  const orientar = (anillo, horario) =>
    areaFirmada(anillo) < 0 === horario ? anillo : [...anillo].reverse()
  const poligonos = (g) =>
    (g.type === 'Polygon' ? [g.coordinates] : g.coordinates)
      .map((p) => p.map(cerrar))
      .filter((p) => p.length && valido(p[0]))
      .map((p) =>
        p.filter(valido).map((anillo, i) => orientar(anillo, i === 0))
      )
  return {
    ...geo,
    features: geo.features.map((f) => {
      // Todos los estados salen como MultiPolygon para tratarlos igual.
      return {
        ...f,
        geometry: { type: 'MultiPolygon', coordinates: poligonos(f.geometry) },
      }
    }),
  }
}

export function cargarDatos() {
  if (!Array.isArray(sams) || !estados?.features)
    throw new Error('Datos del dashboard: formato de apoyo no válido.')
  return {
    corte: CORTE,
    semanal: validarConjunto('semanal', semanal),
    tiendas: validarConjunto('tiendas', tiendas),
    puntos: validarConjunto('puntos', puntos),
    sams,
    estados: limpiarEstados(estados),
  }
}
