// Cálculos del dashboard de venta e inventario. Funciones puras portadas del
// artefacto de origen (calc.js): sin acceso a datos externos ni al runtime `dash`.
import { formatLocale, sum } from 'd3'
import { CORTE } from './config.mjs'

export const SEM = CORTE.semana
export const SEMANAS = CORTE.semanasAnio
export const PARAMS_VACIOS = Object.freeze({
  cadena: null,
  estado: null,
  rac: null,
})

const F = [
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
]
const EXCLUIDAS = /CEDIS|DARK STORE|BODEGA DE/i

// Formatos (es-MX, sin IVA).
const es = formatLocale({
  decimal: '.',
  thousands: ',',
  grouping: [3],
  currency: ['$', ''],
})
export const fmt = {
  m: (v) =>
    v == null
      ? '—'
      : Math.abs(v) >= 1e6
        ? '$' + es.format(',.1f')(v / 1e6) + ' M'
        : Math.abs(v) >= 1e3
          ? '$' + es.format(',.0f')(v / 1e3) + ' mil'
          : '$' + es.format(',.0f')(v),
  p: (v) => (v == null ? '—' : es.format('$,.0f')(v)),
  n: (v) => (v == null ? '—' : es.format(',.0f')(v)),
  n1: (v) => (v == null ? '—' : es.format(',.1f')(v)),
  pct: (v) => (v == null ? '—' : es.format('.1%')(v)),
  vari: (v) =>
    v == null ? '—' : (v >= 0 ? '+' : '') + es.format('.1%')(v),
  cls: (v) => (v == null ? '' : v >= 0 ? 'ok' : v >= -0.1 ? 'warn' : 'bad'),
  paren: (v) =>
    v == null
      ? '—'
      : v < 0
        ? '(' + es.format(',.0f')(-v) + ')'
        : es.format(',.0f')(v),
  parenP: (v) =>
    v == null
      ? '—'
      : v < 0
        ? '(' + es.format('.0%')(-v) + ')%'
        : es.format('.0%')(v),
  miles: (v) => '$' + es.format(',.0f')(v / 1e3) + 'k',
}

// Convierte {columns, rows} en una lista de objetos.
export function aFilas({ columns, rows }) {
  return rows.map((r) => Object.fromEntries(columns.map((c, i) => [c, r[i]])))
}

export function preparar(payload) {
  return {
    tiendas: aFilas(payload.tiendas),
    semanal: aFilas(payload.semanal),
    puntos: aFilas(payload.puntos),
    sams: payload.sams,
  }
}

const pasa = (r, P, omitir) =>
  (omitir === 'cadena' || !P.cadena || r.cadena === P.cadena) &&
  (omitir === 'estado' || !P.estado || r.estado === P.estado) &&
  (omitir === 'rac' || !P.rac || r.rac === P.rac)

function resumir(rows, claveFn, extra) {
  const m = new Map()
  for (const r of rows) {
    const k = claveFn(r)
    let a = m.get(k)
    if (!a) {
      a = { clave: k, st: new Map() }
      for (const f of F) a[f] = 0
      if (extra) Object.assign(a, extra(r))
      m.set(k, a)
    }
    for (const f of F) a[f] += +r[f] || 0
    const id = r.cadena + '|' + r.det
    let s = a.st.get(id)
    if (!s) {
      s = { l4: 0, inv: 0 }
      a.st.set(id, s)
    }
    s.l4 += +r.l4_u || 0
    s.inv += +r.inv_u || 0
  }
  const out = [...m.values()].map((a) => {
    let p = 0
    let ti = 0
    let tsi = 0
    for (const s of a.st.values()) {
      if (s.l4 > 0 || s.inv > 0) p++
      if (s.inv > 0) ti++
      if (s.l4 > 0 && s.inv <= 0) tsi++
    }
    const o = {}
    for (const k in a)
      if (k !== 'st') o[k] = typeof a[k] === 'number' ? +a[k].toFixed(2) : a[k]
    return Object.assign(o, {
      pisos: p,
      t_inv: ti,
      t_sin_inv: tsi,
      var_p: a.ytd25_p > 0 ? a.ytd26_p / a.ytd25_p - 1 : null,
      var_u: a.ytd25_u > 0 ? a.ytd26_u / a.ytd25_u - 1 : null,
      var_s46_p: a.s46aa_p > 0 ? a.s46_p / a.s46aa_p - 1 : null,
      var_s46_u: a.s46aa_u > 0 ? a.s46_u / a.s46aa_u - 1 : null,
      prom_p: a.ytd26_p / SEM,
      prom_u: a.ytd26_u / SEM,
      prom_t_p: p ? a.ytd26_p / SEM / p : null,
      prom_t_u: p ? a.ytd26_u / SEM / p : null,
      cob: a.l4_u > 0 ? a.inv_u / (a.l4_u / 4) : null,
      vpp: p ? a.ytd26_p / p : null,
    })
  })
  const tot = sum(out, (o) => o.ytd26_p)
  out.forEach((o) => (o.part = tot ? o.ytd26_p / tot : null))
  return out.sort((x, y) => y.ytd26_p - x.ytd26_p)
}

function porTienda(rows) {
  const m = new Map()
  for (const r of rows) {
    if (EXCLUIDAS.test(r.tienda)) continue
    const k = r.cadena + '|' + r.det
    let a = m.get(k)
    if (!a) {
      a = {
        clave: r.det + ' · ' + r.tienda,
        cadena: r.cadena,
        estado: r.estado,
        ytd26_p: 0,
        ytd25_p: 0,
        l4_u: 0,
        l4aa_p: 0,
        l4_p: 0,
        inv_u: 0,
      }
      m.set(k, a)
    }
    for (const f of ['ytd26_p', 'ytd25_p', 'l4_u', 'l4aa_p', 'l4_p', 'inv_u'])
      a[f] += +r[f] || 0
  }
  return [...m.values()].map((a) =>
    Object.assign(a, {
      cob: a.l4_u > 0 ? a.inv_u / (a.l4_u / 4) : null,
      ytd26_p: +a.ytd26_p.toFixed(2),
      ytd25_p: +a.ytd25_p.toFixed(2),
      dif: +(a.ytd26_p - a.ytd25_p).toFixed(2),
    })
  )
}

const esBodega = (r) =>
  +r.emp > 0 &&
  +r.inv_u > 0 &&
  +r.inv_u % +r.emp === 0 &&
  +r.l4_u <= 0

export function kpi(tiendas, P) {
  return resumir(
    tiendas.filter((x) => pasa(x, P)),
    () => 'Total'
  ).slice(0, 1)
}

export function ocho(tiendas, P) {
  const s = {}
  for (const f of F) s[f] = 0
  for (const r of tiendas) if (pasa(r, P)) for (const f of F) s[f] += +r[f] || 0
  const fila = (clave, aa, ant, real) => {
    const plan = aa * 1.1
    return {
      clave,
      aa: +aa.toFixed(1),
      ant: +ant.toFixed(1),
      plan: +plan.toFixed(1),
      real: +real.toFixed(1),
      v_plan: +(real - plan).toFixed(1),
      p_plan: plan ? real / plan - 1 : null,
      v_ant: +(real - ant).toFixed(1),
      p_ant: ant ? real / ant - 1 : null,
      v_aa: +(real - aa).toFixed(1),
      p_aa: aa ? real / aa - 1 : null,
    }
  }
  return [
    fila('Semana · Unidades', s.s46aa_u, s.s45_u, s.s46_u),
    fila('Semana · Miles $', s.s46aa_p / 1e3, s.s45_p / 1e3, s.s46_p / 1e3),
    fila('Acumulado · Unidades', s.ytd25_u, s.ytd26_u - s.s46_u, s.ytd26_u),
    fila(
      'Acumulado · Miles $',
      s.ytd25_p / 1e3,
      (s.ytd26_p - s.s46_p) / 1e3,
      s.ytd26_p / 1e3
    ),
  ]
}

export function porCadena(tiendas, P) {
  return resumir(
    tiendas.filter((x) => pasa(x, P)),
    (r) => r.cadena
  )
}

export function porEstado(tiendas, sams, P) {
  const rows = resumir(
    tiendas.filter((x) => pasa(x, P, 'estado')),
    (r) => r.estado
  )
  const s = new Map(sams.map((r) => [r.estado, +r.tiendas_sams]))
  const mostrar = !P.cadena || P.cadena === 'Walmart'
  rows.forEach((r) => (r.sams = mostrar ? s.get(r.clave) || 0 : 0))
  return rows
}

export function porArticulo(tiendas, P) {
  return resumir(
    tiendas.filter((x) => pasa(x, P)),
    (r) => r.cadena + ' · ' + r.rac,
    (r) => ({ cadena: r.cadena, rac: r.rac, emp: +r.emp || null })
  )
}

export function heat(tiendas, P, cadenas) {
  const m = new Map()
  for (const r of tiendas) {
    if (!pasa(r, P, 'cadena')) continue
    let a = m.get(r.rac)
    if (!a) {
      a = { rac: r.rac, tot26: 0, tot25: 0 }
      m.set(r.rac, a)
    }
    const c = r.cadena
    a[c + '26'] = (a[c + '26'] || 0) + (+r.ytd26_p || 0)
    a[c + '25'] = (a[c + '25'] || 0) + (+r.ytd25_p || 0)
    a.tot26 += +r.ytd26_p || 0
    a.tot25 += +r.ytd25_p || 0
  }
  return [...m.values()]
    .map((a) => {
      const o = {
        rac: a.rac,
        tot_p: +a.tot26.toFixed(2),
        tot_v: a.tot25 > 0 ? a.tot26 / a.tot25 - 1 : null,
      }
      for (const c of cadenas) {
        const x = a[c + '26']
        const y = a[c + '25']
        o[c + '_p'] = x == null ? null : +x.toFixed(2)
        o[c + '_v'] = y > 0 ? x / y - 1 : null
      }
      return o
    })
    .sort((x, y) => y.tot_p - x.tot_p)
}

export function serie(semanal, P) {
  const m = new Map()
  for (let w = 1; w <= SEMANAS; w++)
    m.set(w, { semana: w, p25: 0, u25: 0, p26: 0, u26: 0 })
  for (const r of semanal) {
    if (!pasa(r, P, 'estado')) continue
    const a = m.get(+r.semana)
    if (!a) continue
    if (+r.anio === CORTE.anio - 1) {
      a.p25 += +r.pesos || 0
      a.u25 += +r.uds || 0
    } else {
      a.p26 += +r.pesos || 0
      a.u26 += +r.uds || 0
    }
  }
  const rows = [...m.values()]
  const w8 = rows.filter((r) => r.semana >= SEM - 7 && r.semana <= SEM)
  const kp = sum(w8, (r) => r.p26) / (sum(w8, (r) => r.p25) || 1)
  const ku = sum(w8, (r) => r.u26) / (sum(w8, (r) => r.u25) || 1)
  return rows.map((r) => ({
    semana: r.semana,
    p2025: +r.p25.toFixed(2),
    u2025: r.u25,
    p2026: r.semana <= SEM ? +r.p26.toFixed(2) : null,
    u2026: r.semana <= SEM ? r.u26 : null,
    p_tend:
      r.semana >= SEM
        ? +(r.semana === SEM ? r.p26 : r.p25 * kp).toFixed(2)
        : null,
    u_tend:
      r.semana >= SEM
        ? Math.round(r.semana === SEM ? r.u26 : r.u25 * ku)
        : null,
  }))
}

export function invSerie(semanal, P) {
  const m = new Map()
  for (const r of semanal) {
    if (+r.anio !== CORTE.anio || r.inv == null || !pasa(r, P, 'estado'))
      continue
    const k = r.cadena + '|' + r.semana
    let a = m.get(k)
    if (!a) {
      a = { cadena: r.cadena, semana: +r.semana, inv: 0 }
      m.set(k, a)
    }
    a.inv += +r.inv
  }
  return [...m.values()].sort((a, b) => a.semana - b.semana)
}

export function puntosMapa(puntos, tiendas, P) {
  const m = new Map()
  for (const r of tiendas) {
    if (P.rac && r.rac !== P.rac) continue
    const k = r.cadena + '|' + r.num
    let a = m.get(k)
    if (!a) {
      a = { v: 0, i: 0, l4: 0 }
      m.set(k, a)
    }
    a.v += +r.ytd26_p || 0
    a.i += +r.inv_u || 0
    a.l4 += +r.l4_u || 0
  }
  return puntos
    .filter(
      (p) =>
        (!P.cadena ||
          p.cadena === P.cadena ||
          (P.cadena === 'Walmart' && p.cadena === "Sam's Club")) &&
        (!P.estado || p.estado === P.estado)
    )
    .map((p) => {
      const a = m.get(p.cadena + '|' + p.num) || { v: 0, i: 0, l4: 0 }
      return {
        clave: p.cadena + '|' + p.num,
        cadena: p.cadena,
        tienda: p.tienda,
        estado: p.estado,
        lat: +p.lat,
        lon: +p.lon,
        ytd26_p: +a.v.toFixed(2),
        inv_u: a.i,
        l4_u: a.l4,
      }
    })
}

export function alertas(tiendas, P) {
  const f = tiendas.filter((x) => pasa(x, P) && !EXCLUIDAS.test(x.tienda))
  const b = f.filter(esBodega)
  const t = porTienda(f)
  const a = t.filter((x) => x.l4_u <= 0 && x.inv_u > 0)
  const c = t.filter((x) => x.l4_u > 0 && x.cob < 2)
  const d = t.filter((x) => x.cob > 26)
  const e = t.filter((x) => x.l4aa_p > 0 && x.l4_p <= 0)
  return [
    {
      bodega: b.length,
      bodega_u: sum(b, (r) => +r.inv_u),
      sin_venta: a.length,
      sin_venta_u: sum(a, (x) => x.inv_u),
      faltante: c.length,
      sobre: d.length,
      sobre_u: sum(d, (x) => x.inv_u),
      perdidas: e.length,
    },
  ]
}

export function topBodega(tiendas, P) {
  return tiendas
    .filter((r) => pasa(r, P) && !EXCLUIDAS.test(r.tienda) && esBodega(r))
    .map((r) => ({
      clave: r.cadena + '|' + r.det + '|' + r.rac,
      cadena: r.cadena,
      estado: r.estado,
      tienda: r.det + ' · ' + r.tienda,
      rac: r.rac,
      inv_u: +r.inv_u,
      emp: +r.emp,
      cajas: +r.inv_u / +r.emp,
    }))
    .sort((a, b) => b.inv_u - a.inv_u)
    .slice(0, 15)
}

export function topSinInventario(tiendas, P) {
  return porTienda(tiendas.filter((x) => pasa(x, P)))
    .filter((x) => x.l4_u <= 0 && x.inv_u > 0)
    .sort((a, b) => b.inv_u - a.inv_u)
    .slice(0, 15)
}

export function topFaltante(tiendas, P) {
  return porTienda(tiendas.filter((x) => pasa(x, P)))
    .filter((x) => x.l4_u > 0 && x.cob < 2)
    .sort((a, b) => b.l4_u - a.l4_u)
    .slice(0, 15)
}

export function topSobre(tiendas, P) {
  return porTienda(tiendas.filter((x) => pasa(x, P)))
    .filter((x) => x.cob > 26)
    .sort((a, b) => b.inv_u - a.inv_u)
    .slice(0, 15)
}

export function topCaida(tiendas, P) {
  return porTienda(tiendas.filter((x) => pasa(x, P)))
    .filter((x) => x.dif < 0)
    .sort((a, b) => a.dif - b.dif)
    .slice(0, 15)
}

export function pedido(tiendas, P) {
  return porTienda(tiendas.filter((x) => pasa(x, P)))
    .filter((x) => x.l4_u > 0 && x.cob < 2)
    .map((x) => ({
      ...x,
      prom_u: x.l4_u / 4,
      sug_u: Math.max(0, Math.ceil(x.l4_u - x.inv_u)),
    }))
    .sort((a, b) => b.sug_u - a.sug_u)
    .slice(0, 25)
}

export function acciones(al, porEst, porArt, ochoRows, tiendas, P) {
  const a = al[0] || {}
  const out = []
  const f = tiendas.filter((x) => pasa(x, P) && !EXCLUIDAS.test(x.tienda))
  const falt = porTienda(f).filter((x) => x.l4_u > 0 && x.cob < 2)
  const sug = sum(falt, (x) => Math.max(0, Math.ceil(x.l4_u - x.inv_u)))
  if (a.bodega)
    out.push({
      prioridad: 'Alta',
      clave: 'Mercancía sin exhibir',
      accion: `Verificar en piso ${fmt.n(a.bodega)} casos tienda-artículo con cajas completas y sin venta en 4 semanas; sacar a exhibición o reportar a la cadena (ver 5.2).`,
      responsable: 'Ejecutivo de cuenta / tienda',
      tiendas: new Set(f.filter(esBodega).map((r) => r.cadena + r.det)).size,
      uds: a.bodega_u,
    })
  if (falt.length)
    out.push({
      prioridad: 'Alta',
      clave: 'Reabasto',
      accion: `Colocar pedido para ${fmt.n(falt.length)} tiendas con menos de 2 semanas de inventario (pedido sugerido en 6.2).`,
      responsable: 'Comercial / logística',
      tiendas: falt.length,
      uds: sug,
    })
  const ac = ochoRows.find((r) => r.clave === 'Acumulado · Miles $')
  if (ac && ac.v_plan < 0)
    out.push({
      prioridad: 'Alta',
      clave: 'Brecha vs plan',
      accion: `El acumulado va ${fmt.p(-ac.v_plan * 1e3)} abajo del plan (${fmt.vari(ac.p_plan)}). Para cerrar la brecha en las ${SEMANAS - SEM} semanas restantes se necesitan ${fmt.p((-ac.v_plan * 1e3) / (SEMANAS - SEM))} adicionales por semana.`,
      responsable: 'Dirección comercial',
      tiendas: null,
      uds: null,
    })
  if (a.perdidas)
    out.push({
      prioridad: 'Media',
      clave: 'Tiendas que dejaron de vender',
      accion: `Revisar ${fmt.n(a.perdidas)} tiendas que vendían en estas semanas de 2025 y hoy no: confirmar surtido, catálogo activo y exhibición.`,
      responsable: 'Ejecutivo de cuenta',
      tiendas: a.perdidas,
      uds: null,
    })
  if (a.sin_venta)
    out.push({
      prioridad: 'Media',
      clave: 'Inventario detenido',
      accion: `${fmt.n(a.sin_venta)} tiendas tienen inventario sin venta en 4 semanas: revisar ubicación en anaquel y precio (ver 5.3).`,
      responsable: 'Ejecutivo de cuenta / tienda',
      tiendas: a.sin_venta,
      uds: a.sin_venta_u,
    })
  if (a.sobre)
    out.push({
      prioridad: 'Media',
      clave: 'Sobre-stock',
      accion: `Frenar el resurtido en ${fmt.n(a.sobre)} tiendas con más de 26 semanas de inventario y evaluar traspaso o activación (ver 5.5).`,
      responsable: 'Comercial / logística',
      tiendas: a.sobre,
      uds: a.sobre_u,
    })
  const ce = porEst
    .filter((r) => r.ytd25_p > 50000 && r.var_p != null)
    .sort((x, y) => x.var_p - y.var_p)[0]
  if (ce && ce.var_p < 0)
    out.push({
      prioridad: 'Media',
      clave: 'Estado con mayor caída',
      accion: `${ce.clave} baja ${fmt.vari(ce.var_p)} vs 2025 (${fmt.p(ce.ytd26_p - ce.ytd25_p)}): revisar sus tiendas en el ranking 2.2.`,
      responsable: 'Gerente regional',
      tiendas: ce.pisos,
      uds: null,
    })
  const ca = porArt
    .filter((r) => r.ytd25_p > 20000 && r.var_p != null)
    .sort((x, y) => x.var_p - y.var_p)[0]
  if (ca && ca.var_p < 0)
    out.push({
      prioridad: 'Baja',
      clave: 'Artículo con mayor caída',
      accion: `${ca.rac} en ${ca.cadena} baja ${fmt.vari(ca.var_p)} vs 2025: revisar precio, surtido y competencia.`,
      responsable: 'Marketing / comercial',
      tiendas: ca.pisos,
      uds: null,
    })
  return out
}

export function destacados(ochoRows, cad, art, al) {
  const o = []
  const s = ochoRows.find((r) => r.clave === 'Semana · Miles $')
  const a = ochoRows.find((r) => r.clave === 'Acumulado · Miles $')
  const au = ochoRows.find((r) => r.clave === 'Acumulado · Unidades')
  const x = al[0] || {}
  if (s)
    o.push({
      clave: 'semana',
      texto: `Semana ${SEM}: ${fmt.m(s.real * 1e3)}, ${fmt.vari(s.p_aa)} vs 2025 y ${fmt.vari(s.p_plan)} vs plan; ${fmt.vari(s.p_ant)} vs la semana ${SEM - 1}.`,
    })
  if (a)
    o.push({
      clave: 'acumulado',
      texto: `Acumulado ${CORTE.anio}: ${fmt.m(a.real * 1e3)}, ${fmt.vari(a.p_aa)} vs 2025 en pesos${au ? ' y ' + fmt.vari(au.p_aa) + ' en unidades' : ''}; contra el plan va ${fmt.vari(a.p_plan)} (${fmt.m(a.v_plan * 1e3)}).`,
    })
  const c = cad.filter((r) => r.var_p != null)
  if (c.length > 1) {
    const up = c.reduce((p, q) => (q.var_p > p.var_p ? q : p))
    const dn = c.reduce((p, q) => (q.var_p < p.var_p ? q : p))
    o.push({
      clave: 'cadenas',
      texto: `${up.clave} es la cadena que más crece (${fmt.vari(up.var_p)}); ${dn.clave} ${dn.var_p < 0 ? 'es la que más baja' : 'es la que menos crece'} (${fmt.vari(dn.var_p)}). Walmart concentra ${fmt.pct((cad.find((r) => r.clave === 'Walmart') || {}).part)} de la venta.`,
    })
  }
  const ar = art.filter((r) => r.ytd25_p > 20000 && r.var_p != null)
  if (art.length) {
    const top = art[0]
    const dn = ar.length
      ? ar.reduce((p, q) => (q.var_p < p.var_p ? q : p))
      : null
    o.push({
      clave: 'articulos',
      texto: `Artículo líder: ${top.rac} en ${top.cadena} (${fmt.m(top.ytd26_p)}, ${fmt.vari(top.var_p)}).${dn && dn.var_p < 0 ? ' Mayor caída: ' + dn.rac + ' en ' + dn.cadena + ' (' + fmt.vari(dn.var_p) + ').' : ''}`,
    })
  }
  o.push({
    clave: 'alertas',
    texto: `Alertas: ${fmt.n(x.bodega)} casos de posible mercancía en bodega (${fmt.n(x.bodega_u)} uds), ${fmt.n(x.faltante)} tiendas con faltante y ${fmt.n(x.sobre)} con sobre-stock. Ver pestañas 5 y 6.`,
  })
  return o
}

// Calcula todo lo que muestra el dashboard para unos filtros dados.
export function calcularTodo(base, P, cadenas) {
  const { tiendas, semanal, puntos, sams } = base
  const ochoRows = ocho(tiendas, P)
  const cad = porCadena(tiendas, P)
  const est = porEstado(tiendas, sams, P)
  const art = porArticulo(tiendas, P)
  const al = alertas(tiendas, P)
  return {
    kpi: kpi(tiendas, P),
    ocho: ochoRows,
    por_cadena: cad,
    por_estado: est,
    por_articulo: art,
    heat: heat(tiendas, P, cadenas),
    serie: serie(semanal, P),
    inv_serie: invSerie(semanal, P),
    puntos_m: puntosMapa(puntos, tiendas, P),
    alertas: al,
    top_bodega: topBodega(tiendas, P),
    top_sinventa: topSinInventario(tiendas, P),
    top_faltante: topFaltante(tiendas, P),
    top_sobre: topSobre(tiendas, P),
    top_caida: topCaida(tiendas, P),
    pedido: pedido(tiendas, P),
    acciones: acciones(al, est, art, ochoRows, tiendas, P),
    destacados: destacados(ochoRows, cad, art, al),
  }
}

// Valores de los selectores; cada uno ignora su propio filtro.
export function opcionesFiltro(tiendas, P, campo) {
  return [
    ...new Set(tiendas.filter((r) => pasa(r, P, campo)).map((r) => r[campo])),
  ].sort((a, b) => String(a).localeCompare(String(b), 'es'))
}
