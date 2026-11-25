'use client'

import { useEffect, useRef } from 'react'
import {
  axisBottom,
  axisLeft,
  geoMercator,
  geoPath,
  line,
  max,
  min,
  pointer,
  scaleLinear,
  scaleQuantile,
  scaleSqrt,
  select,
} from 'd3'
import { COLORES } from '../../backend/dashboard/config.mjs'
import { SEM, SEMANAS, fmt } from '../../backend/dashboard/calc.mjs'

const AB = {
  'Baja California': 'BC',
  Sonora: 'SON',
  Chihuahua: 'CHIH',
  Coahuila: 'COAH',
  'Nuevo León': 'NL',
  'Baja California Sur': 'BCS',
  Sinaloa: 'SIN',
  Durango: 'DGO',
  Zacatecas: 'ZAC',
  'San Luis Potosí': 'SLP',
  Tamaulipas: 'TAMS',
  Nayarit: 'NAY',
  Aguascalientes: 'AGS',
  Guanajuato: 'GTO',
  Querétaro: 'QRO',
  Hidalgo: 'HGO',
  Jalisco: 'JAL',
  Michoacán: 'MICH',
  'Estado de México': 'MEX',
  'Ciudad de México': 'CDMX',
  Tlaxcala: 'TLAX',
  Veracruz: 'VER',
  Colima: 'COL',
  Guerrero: 'GRO',
  Morelos: 'MOR',
  Puebla: 'PUE',
  Tabasco: 'TAB',
  Campeche: 'CAMP',
  Yucatán: 'YUC',
  Oaxaca: 'OAX',
  Chiapas: 'CHIS',
  'Quintana Roo': 'QROO',
}

// d3 dibuja dentro de un contenedor que React no puebla; se redibuja al
// cambiar los datos o el ancho del contenedor (p. ej. al mostrarse su pestaña).
function useDibujo(dibujar, deps) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    let ancho = -1
    const observador = new ResizeObserver(() => {
      if (el.clientWidth === ancho) return
      ancho = el.clientWidth
      if (ancho > 0) dibujar(el)
    })
    observador.observe(el)
    return () => {
      observador.disconnect()
      el.replaceChildren()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  return ref
}

function colocarTip(tip, el, ev, W, ancla) {
  const [px, py] = pointer(ev, el)
  const tw = tip.node().offsetWidth
  tip
    .style('left', Math.max(0, Math.min(W - tw, px - tw / 2)) + 'px')
    .style('top', (ancla ?? Math.max(0, py - 36)) + 'px')
}

function lineChart(el, rows, keys, formato, alto) {
  el.replaceChildren()
  const W = el.clientWidth || 520
  const m = { t: 10, r: 12, b: 26, l: 10 }
  const H = alto || 250
  const ymax = max(rows, (r) => max(keys, (k) => r[k.f] || 0)) || 1
  const y = scaleLinear().domain([0, ymax]).nice()
  const x = scaleLinear().domain([1, SEMANAS])
  const svg = select(el)
    .append('svg')
    .attr('width', '100%')
    .attr('height', H)
    .attr('role', 'img')
    .attr('aria-label', 'Venta semanal')
  const t = svg
    .append('g')
    .attr('class', 'axis')
    .call(axisLeft(y).ticks(5).tickFormat(formato))
  m.l = (max(t.selectAll('text').nodes(), (n) => n.getComputedTextLength()) || 40) + 10
  t.remove()
  x.range([m.l, W - m.r])
  y.range([H - m.b, m.t])
  svg
    .append('g')
    .attr('class', 'grid')
    .attr('transform', `translate(${m.l},0)`)
    .call(
      axisLeft(y)
        .ticks(5)
        .tickSize(-(W - m.l - m.r))
        .tickFormat('')
    )
    .call((g) => g.select('.domain').remove())
  svg
    .append('g')
    .attr('class', 'axis')
    .attr('transform', `translate(${m.l},0)`)
    .call(axisLeft(y).ticks(5).tickFormat(formato))
    .call((g) => g.select('.domain').remove())
  svg
    .append('g')
    .attr('class', 'axis')
    .attr('transform', `translate(0,${H - m.b})`)
    .call(
      axisBottom(x)
        .ticks(W < 480 ? 6 : 13)
        .tickFormat((v) => 'S' + v)
    )
  for (const k of keys)
    svg
      .append('path')
      .datum(rows)
      .attr('fill', 'none')
      .style('stroke', k.c)
      .attr('stroke-width', k.w || 2)
      .attr('stroke-dasharray', k.d || null)
      .attr(
        'd',
        line()
          .defined((r) => r[k.f] != null)
          .x((r) => x(r.semana))
          .y((r) => y(r[k.f]))
      )
  const tip = select(el).append('div').attr('class', 'tip').style('display', 'none')
  const guia = svg
    .append('line')
    .style('stroke', 'var(--cds-chart-reference)')
    .attr('y1', m.t)
    .attr('y2', H - m.b)
    .style('display', 'none')
  svg
    .append('rect')
    .attr('x', m.l)
    .attr('y', m.t)
    .attr('width', Math.max(0, W - m.l - m.r))
    .attr('height', H - m.t - m.b)
    .attr('fill', 'transparent')
    .on('pointermove', (ev) => {
      const s = Math.max(1, Math.min(SEMANAS, Math.round(x.invert(pointer(ev)[0]))))
      const r = rows.find((q) => q.semana === s)
      if (!r) return
      guia.attr('x1', x(s)).attr('x2', x(s)).style('display', null)
      tip
        .style('display', null)
        .text(
          'S' +
            s +
            ' · ' +
            keys
              .filter((k) => r[k.f] != null && !(k.skip && k.skip(r)))
              .map((k) => k.n + ': ' + formato(r[k.f]))
              .join(' · ')
        )
      const tw = tip.node().offsetWidth
      tip
        .style('left', Math.max(0, Math.min(W - tw, x(s) - tw / 2)) + 'px')
        .style('top', '0px')
    })
    .on('pointerleave', () => {
      tip.style('display', 'none')
      guia.style('display', 'none')
    })
}

export function GraficaSerie({ rows, claves, formato }) {
  const ref = useDibujo(
    (el) => lineChart(el, rows, claves, formato),
    [rows, claves, formato]
  )
  return <div className="chart" ref={ref} />
}

export const CLAVES_PESOS = [
  { f: 'p2025', c: '#8F87FF', n: '2025' },
  { f: 'p2026', c: '#1E6BF0', n: '2026', w: 2.5 },
  {
    f: 'p_tend',
    c: '#26A3FD',
    n: 'Tendencia',
    d: '5 4',
    w: 2.5,
    skip: (r) => r.semana === SEM,
  },
]
export const CLAVES_UNIDADES = [
  { f: 'u2025', c: '#8F87FF', n: '2025' },
  { f: 'u2026', c: '#1E6BF0', n: '2026', w: 2.5 },
  {
    f: 'u_tend',
    c: '#26A3FD',
    n: 'Tendencia',
    d: '5 4',
    w: 2.5,
    skip: (r) => r.semana === SEM,
  },
]

export function GraficaInventario({ serie, cadenas }) {
  const ref = useDibujo(
    (el) => {
      const rows = []
      for (let w = 1; w <= SEM; w++) {
        const o = { semana: w }
        for (const r of serie) if (r.semana === w) o[r.cadena] = r.inv
        rows.push(o)
      }
      lineChart(
        el,
        rows,
        cadenas.map((c) => ({ f: c, c: COLORES[c], n: c, w: 2.2 })),
        fmt.n
      )
    },
    [serie, cadenas]
  )
  return <div className="chart" ref={ref} />
}

function barras(el, datos, campo, formato) {
  el.replaceChildren()
  const rows = datos
    .filter((r) => r[campo] > 0)
    .sort((a, b) => b[campo] - a[campo])
    .slice(0, 15)
  if (!rows.length) {
    el.textContent = 'Sin datos'
    return
  }
  const W = el.clientWidth || 520
  const bh = 22
  const H = rows.length * bh + 8
  const svg = select(el)
    .append('svg')
    .attr('width', '100%')
    .attr('height', H)
    .attr('role', 'img')
    .attr('aria-label', 'Venta por artículo')
  const lab = (r) => r.rac + ' · ' + r.cadena
  const tmp = svg
    .selectAll('text.t')
    .data(rows)
    .join('text')
    .style('font-size', '12px')
    .text(lab)
  const lw = Math.min(W * 0.5, max(tmp.nodes(), (n) => n.getComputedTextLength()) + 8)
  tmp.remove()
  const x = scaleLinear()
    .domain([0, max(rows, (r) => r[campo])])
    .range([0, Math.max(40, W - lw - 110)])
  const g = svg
    .selectAll('g.b')
    .data(rows)
    .join('g')
    .attr('transform', (r, i) => `translate(0,${i * bh + 4})`)
  g.append('text')
    .attr('x', lw - 6)
    .attr('y', bh / 2)
    .attr('dy', '.32em')
    .attr('text-anchor', 'end')
    .style('font-size', '12px')
    .style('fill', 'var(--color-fg)')
    .text(lab)
  g.append('rect')
    .attr('x', lw)
    .attr('height', bh - 6)
    .attr('width', (r) => x(r[campo]))
    .attr('rx', 2)
    .style('fill', (r) => COLORES[r.cadena] || '#1E6BF0')
  g.append('text')
    .attr('x', (r) => lw + x(r[campo]) + 5)
    .attr('y', bh / 2)
    .attr('dy', '.32em')
    .style('font-size', '12px')
    .style('fill', 'var(--cds-text-secondary)')
    .text(
      (r) =>
        formato(r[campo]) +
        ' · ' +
        fmt.vari(campo === 'ytd26_p' ? r.var_p : r.var_u)
    )
}

export function GraficaBarras({ rows, campo, formato }) {
  const ref = useDibujo((el) => barras(el, rows, campo, formato), [rows, campo, formato])
  return <div className="chart" ref={ref} />
}

const cuantiles = (rows) => {
  const v = rows.map((r) => r.vpp).filter((x) => x > 0)
  return scaleQuantile()
    .domain(v.length ? v : [0])
    .range([0.2, 0.4, 0.6, 0.8, 1])
}

export function LeyendaMapa({ porEstado }) {
  const q = cuantiles(porEstado)
  const v = porEstado.map((r) => r.vpp).filter((x) => x > 0)
  if (!v.length) return <div className="legend" />
  return (
    <div className="legend">
      {[min(v), ...q.quantiles()].map((t, i) => (
        <span key={i}>
          <i
            className="sw"
            style={{ background: '#1E6BF0', opacity: q.range()[i] }}
          />
          {'desde ' + fmt.m(t)}
        </span>
      ))}
    </div>
  )
}

const altoMapa = (W) => Math.round(W * 0.66)
const proyeccion = (estados, W, H) =>
  geoMercator().fitExtent([[6, 6], [W - 6, H - 6]], {
    type: 'FeatureCollection',
    features: estados.features,
  })

export function MapaEstados({ estados, porEstado, estado, onEstado }) {
  const ref = useDibujo(
    (el) => {
      el.replaceChildren()
      const by = new Map(porEstado.map((r) => [r.clave, r]))
      const q = cuantiles(porEstado)
      const W = el.clientWidth || 600
      const H = altoMapa(W)
      const pa = geoPath(proyeccion(estados, W, H))
      const op = (r) => (r && r.vpp > 0 ? q(r.vpp) : 0)
      const svg = select(el)
        .append('svg')
        .attr('width', '100%')
        .attr('height', H)
        .attr('viewBox', `0 0 ${W} ${H}`)
        .attr('role', 'img')
        .attr('aria-label', 'Mapa de estados coloreados por venta por tienda')
      const tip = select(el).append('div').attr('class', 'tip').style('display', 'none')
      svg
        .append('g')
        .selectAll('path')
        .data(estados.features)
        .join('path')
        .attr('d', pa)
        .style('cursor', 'pointer')
        .style('fill', (f) =>
          op(by.get(f.properties.estado)) ? '#1E6BF0' : 'var(--color-border-line)'
        )
        .style('fill-opacity', (f) => {
          const n = f.properties.estado
          return (estado && estado !== n ? 0.25 : 1) * (op(by.get(n)) || 0.5)
        })
        .style('stroke', (f) => (estado === f.properties.estado ? '#0B2E6B' : '#fff'))
        .attr('stroke-width', (f) => (estado === f.properties.estado ? 2.2 : 0.9))
        .on('click', (e, f) => {
          const n = f.properties.estado
          onEstado(estado === n ? null : n)
        })
        .on('pointermove', (e, f) => {
          const n = f.properties.estado
          const r = by.get(n)
          tip
            .style('display', null)
            .text(
              r
                ? `${n} · ${fmt.p(r.vpp)} por piso · ${fmt.n(r.pisos)} pisos · venta ${fmt.m(r.ytd26_p)} (${fmt.vari(r.var_p)})${r.sams ? ' · ' + r.sams + ' Sam’s' : ''}`
                : n + ' · sin tiendas'
            )
          colocarTip(tip, el, e, W)
        })
        .on('pointerleave', () => tip.style('display', 'none'))
      svg
        .append('g')
        .selectAll('text')
        .data(
          estados.features.filter((f) => {
            const r = by.get(f.properties.estado)
            return r && r.vpp > 0
          })
        )
        .join('text')
        .attr('transform', (f) => {
          const c = pa.centroid(f)
          return `translate(${c[0]},${c[1]})`
        })
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .style('font-size', '9px')
        .style('pointer-events', 'none')
        .style('font-weight', 600)
        .style('fill', (f) =>
          op(by.get(f.properties.estado)) > 0.5 ? '#fff' : 'var(--color-fg)'
        )
        .text((f) => AB[f.properties.estado] || '')
    },
    [estados, porEstado, estado, onEstado]
  )
  return <div className="map" ref={ref} />
}

export function PuntosMapa({ estados, puntos }) {
  const ref = useDibujo(
    (el) => {
      el.replaceChildren()
      const W = el.clientWidth || 600
      const H = altoMapa(W)
      const pr = proyeccion(estados, W, H)
      const rows = puntos.filter(
        (p) => p.lon != null && p.lat != null && !isNaN(p.lon) && !isNaN(p.lat)
      )
      const mx = max(rows, (p) => p.ytd26_p || 0) || 1
      const rad = scaleSqrt().domain([0, mx]).range([1.6, 15])
      const svg = select(el)
        .append('svg')
        .attr('width', '100%')
        .attr('height', H)
        .attr('viewBox', `0 0 ${W} ${H}`)
        .style('pointer-events', 'none')
        .attr('role', 'img')
        .attr('aria-label', 'Tiendas: tamaño del punto según venta 2026 en pesos')
      const tip = select(el).append('div').attr('class', 'tip').style('display', 'none')
      const sams = (p) => p.cadena === "Sam's Club"
      svg
        .append('g')
        .selectAll('circle')
        .data(rows.slice().sort((a, b) => (b.ytd26_p || 0) - (a.ytd26_p || 0)))
        .join('circle')
        .attr('cx', (p) => pr([p.lon, p.lat])[0])
        .attr('cy', (p) => pr([p.lon, p.lat])[1])
        .attr('r', (p) => (sams(p) ? 2.2 : rad(p.ytd26_p || 0)))
        .style('pointer-events', 'auto')
        .style('fill', (p) => (sams(p) ? 'none' : COLORES[p.cadena]))
        .style('fill-opacity', (p) => (p.l4_u > 0 ? 0.6 : 0.25))
        .style('stroke', (p) =>
          sams(p) ? '#9AA5B1' : p.l4_u > 0 ? '#fff' : COLORES[p.cadena]
        )
        .attr('stroke-width', 0.7)
        .on('pointermove', (e, p) => {
          tip
            .style('display', null)
            .text(
              sams(p)
                ? `${p.tienda} · Sam's · ${p.estado} · sin datos`
                : `${p.tienda} · ${p.cadena} · ${p.estado} · venta 2026 ${fmt.p(p.ytd26_p)} · inv ${fmt.n(p.inv_u)} uds`
            )
          colocarTip(tip, el, e, W)
        })
        .on('pointerleave', () => tip.style('display', 'none'))
    },
    [estados, puntos]
  )
  return (
    <div
      className="map"
      ref={ref}
      style={{ position: 'absolute', inset: 0, minHeight: 0, pointerEvents: 'none' }}
    />
  )
}
