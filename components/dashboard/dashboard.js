'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  CADENAS,
  COLORES,
  CORTE,
  LOGOS,
} from '../../backend/dashboard/config.mjs'
import {
  PARAMS_VACIOS,
  SEM,
  calcularTodo,
  fmt,
  opcionesFiltro,
  preparar,
} from '../../backend/dashboard/calc.mjs'
import {
  CLAVES_PESOS,
  CLAVES_UNIDADES,
  GraficaBarras,
  GraficaInventario,
  GraficaSerie,
  LeyendaMapa,
  MapaEstados,
  PuntosMapa,
} from './charts'

const PESTANAS = [
  ['resumen', '1. Resumen ejecutivo'],
  ['estados', '2. Mapa y estados'],
  ['productos', '3. Productos'],
  ['inventarios', '4. Inventarios'],
  ['alertas', '5. Alertas'],
  ['acciones', '6. Accionables'],
]
const BANDA = { ok: 'up', warn: 'mid', bad: 'dn' }

function Logo({ src, alt, className }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={className} />
}

function Cifra({ fila, campo, formato, color }) {
  if (!fila) return '—'
  const v = fila[campo]
  const c = color ? fmt.cls(v) : ''
  const clase = c ? (color === 'banda' ? BANDA[c] : c) : undefined
  return clase ? <span className={clase}>{formato(v)}</span> : formato(v)
}

function Cab({ columnas }) {
  return (
    <tr>
      {columnas.map((c, i) => {
        const [texto, clase] = Array.isArray(c) ? c : [c]
        return (
          <th key={i} className={clase}>
            {texto}
          </th>
        )
      })}
    </tr>
  )
}

function Celda({ campo, formato, tipo, fila, indice }) {
  const v = fila[campo]
  if (campo === '#') return <td className="l">{indice + 1}</td>
  if (tipo === 'logo')
    return (
      <td className="l">
        {LOGOS[v] && <Logo src={LOGOS[v]} alt={v} />} {v}
      </td>
    )
  const extra = typeof tipo === 'function' ? tipo(v, fila) : {}
  const clases = [!formato && 'l']
  if (tipo === 'sem') clases.push('sem', fmt.cls(v))
  if (tipo === 'neg' && v < 0) clases.push('neg')
  if (tipo === 'real') clases.push('real')
  return (
    <td className={clases.filter(Boolean).join(' ') || undefined} style={extra.style}>
      {formato ? formato(v) : v}
    </td>
  )
}

function Cuerpo({ filas, columnas, onFila }) {
  if (!filas.length)
    return (
      <tbody>
        <tr>
          <td className="l" colSpan={columnas.length}>
            Sin datos con estos filtros.
          </td>
        </tr>
      </tbody>
    )
  return (
    <tbody>
      {filas.map((fila, i) => (
        <tr
          key={i}
          className={onFila ? 'click' : undefined}
          onClick={onFila ? () => onFila(fila) : undefined}
        >
          {columnas.map(([campo, formato, tipo], j) => (
            <Celda
              key={j}
              campo={campo}
              formato={formato}
              tipo={tipo}
              fila={fila}
              indice={i}
            />
          ))}
        </tr>
      ))}
    </tbody>
  )
}

function Tabla({ cabecera, columnas, filas, onFila }) {
  return (
    <div className="tw">
      <table>
        <thead>
          <Cab columnas={cabecera} />
        </thead>
        <Cuerpo filas={filas} columnas={columnas} onFila={onFila} />
      </table>
    </div>
  )
}

const BASE = [
  ['ytd26_p', fmt.p],
  ['var_p', fmt.vari, 'sem'],
  ['ytd26_u', fmt.n],
  ['var_u', fmt.vari, 'sem'],
  ['part', fmt.pct],
  ['pisos', fmt.n],
  ['prom_p', fmt.p],
  ['prom_u', fmt.n],
  ['prom_t_p', fmt.p],
  ['prom_t_u', fmt.n1],
  ['inv_u', fmt.n],
  ['cob', fmt.n1],
]
const TIENDA = [['cadena', null, 'logo'], ['estado']]

function Ocho({ filas }) {
  const neg = (v) => (v < 0 ? 'neg' : undefined)
  return (
    <div className="tw">
      <table>
        <thead>
          <tr className="g">
            <th className="l" />
            <th colSpan={4}>Comparativos</th>
            <th colSpan={6}>Variaciones vs</th>
          </tr>
          <Cab
            columnas={[
              ['Concepto', 'l'],
              'Año anterior',
              'Semana anterior',
              'Plan operativo',
              'Real',
              'Plan $',
              'Plan %',
              'Semana $',
              'Semana %',
              'Año ant. $',
              'Año ant. %',
            ]}
          />
        </thead>
        <tbody>
          {filas.flatMap((r, i) => {
            const celdas = [
              [r.clave.split(' · ')[1], 'l'],
              [fmt.n(r.aa)],
              [fmt.n(r.ant)],
              [fmt.n(r.plan)],
              [fmt.n(r.real), 'real'],
              [fmt.paren(r.v_plan), neg(r.v_plan)],
              [fmt.parenP(r.p_plan), neg(r.p_plan)],
              [fmt.paren(r.v_ant), neg(r.v_ant)],
              [fmt.parenP(r.p_ant), neg(r.p_ant)],
              [fmt.paren(r.v_aa), neg(r.v_aa)],
              [fmt.parenP(r.p_aa), neg(r.p_aa)],
            ]
            const filasHtml = []
            if (i === 0 || i === 2)
              filasHtml.push(
                <tr key={'s' + i} className="sec">
                  <td colSpan={11}>{i === 0 ? 'Semana' : 'Acumulado'}</td>
                </tr>
              )
            filasHtml.push(
              <tr key={r.clave}>
                {celdas.map(([t, c], j) => (
                  <td key={j} className={c}>
                    {t}
                  </td>
                ))}
              </tr>
            )
            return filasHtml
          })}
        </tbody>
      </table>
    </div>
  )
}

function Heat({ filas, tipo }) {
  const mx = Math.max(1, ...filas.flatMap((r) => CADENAS.map((c) => r[c + '_p'] || 0)))
  const col = (v) => {
    const x = Math.max(-0.5, Math.min(0.5, v))
    return x >= 0
      ? `rgba(31,164,99,${0.15 + 1.3 * x})`
      : `rgba(224,69,58,${0.15 + 1.3 * -x})`
  }
  const campos = tipo === 'p' ? CADENAS.map((c) => c + '_p') : [...CADENAS.map((c) => c + '_v'), 'tot_v']
  return (
    <div className="tw">
      <table>
        <thead>
          <Cab columnas={[['Artículo RAC', 'l'], ...CADENAS, 'Total']} />
        </thead>
        <tbody>
          {filas.map((r) => (
            <tr key={r.rac}>
              <td className="l">{r.rac}</td>
              {tipo === 'p' ? (
                <>
                  {campos.map((k) => {
                    const v = r[k]
                    const a = v > 0 ? 0.12 + 0.78 * (v / mx) : 0
                    return (
                      <td
                        key={k}
                        style={
                          v > 0
                            ? {
                                background: `rgba(30,107,240,${a})`,
                                color: a > 0.55 ? '#fff' : undefined,
                              }
                            : undefined
                        }
                      >
                        {v == null ? '' : fmt.m(v)}
                      </td>
                    )
                  })}
                  <td style={{ fontWeight: 600 }}>{fmt.m(r.tot_p)}</td>
                </>
              ) : (
                campos.map((k) => {
                  const v = r[k]
                  return (
                    <td
                      key={k}
                      style={{
                        background: v != null ? col(v) : undefined,
                        color: v != null && Math.abs(v) > 0.3 ? '#fff' : undefined,
                        fontWeight: k === 'tot_v' ? 600 : undefined,
                      }}
                    >
                      {v == null ? '' : fmt.vari(v)}
                    </td>
                  )
                })
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Estado({ children, rol }) {
  return (
    <div className="card estado-msg" role={rol}>
      {children}
    </div>
  )
}

export default function Dashboard() {
  const [carga, setCarga] = useState({ estado: 'cargando' })
  const [P, setP] = useState(PARAMS_VACIOS)
  const [pestana, setPestana] = useState('resumen')

  useEffect(() => {
    const control = new AbortController()
    fetch('/api/dashboard/data', { signal: control.signal, cache: 'no-store' })
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status))
        return res.json()
      })
      .then((payload) => {
        // La pestaña inicial puede venir del #ancla de la dirección.
        const id = window.location.hash.slice(1)
        if (PESTANAS.some(([p]) => p === id)) setPestana(id)
        setCarga({ estado: 'ok', base: preparar(payload), estados: payload.estados })
      })
      .catch((e) => {
        if (e.name !== 'AbortError') setCarga({ estado: 'error' })
      })
    return () => control.abort()
  }, [])

  const base = carga.base
  const r = useMemo(
    () => (base ? calcularTodo(base, P, CADENAS) : null),
    [base, P]
  )
  const fijar = useCallback(
    (cambio) => setP((actual) => ({ ...actual, ...cambio })),
    []
  )
  const elegirEstado = useCallback((estado) => fijar({ estado }), [fijar])
  const elegirPestana = (id) => {
    setPestana(id)
    window.history.replaceState(null, '', '#' + id)
  }

  const k = r?.kpi[0]
  const al = r?.alertas[0]
  const listo = carga.estado === 'ok' && r
  const selector = (campo, etiqueta, todos) => (
    <label>
      {etiqueta}
      <select
        className="dash-select"
        aria-label={etiqueta}
        value={P[campo] ?? ''}
        onChange={(e) => fijar({ [campo]: e.target.value || null })}
        disabled={!listo}
      >
        <option value="">{todos}</option>
        {listo &&
          opcionesFiltro(base.tiendas, P, campo).map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
      </select>
    </label>
  )
  const seccion = (id) => ({ id, hidden: pestana !== id })

  return (
    <div className="ch">
      <header className="band" id="encabezado">
        <div className="lg">
          <Logo src="/dashboard/cero-humedad.png" alt="Cero Humedad" />
        </div>
        <div style={{ flex: 1, minWidth: 260 }}>
          <h1>Dashboard General Autoservicios</h1>
          <div className="st">
            {CADENAS.join(' · ')} · Corte semana {CORTE.semana} ({CORTE.etiqueta}) ·
            Pesos sin IVA
          </div>
          <p className="lead" id="frase">
            Venta acumulada {CORTE.anio}:{' '}
            <b>
              <Cifra fila={k} campo="ytd26_p" formato={fmt.m} />
            </b>{' '}
            (
            <b>
              <Cifra fila={k} campo="var_p" formato={fmt.vari} color="banda" />
            </b>{' '}
            vs {CORTE.anio - 1}) y{' '}
            <b>
              <Cifra fila={k} campo="ytd26_u" formato={fmt.n} />
            </b>{' '}
            unidades. En la semana {SEM} se vendieron{' '}
            <b>
              <Cifra fila={k} campo="s46_p" formato={fmt.m} />
            </b>{' '}
            (
            <b>
              <Cifra fila={k} campo="var_s46_p" formato={fmt.vari} color="banda" />
            </b>{' '}
            vs la misma semana de {CORTE.anio - 1}) en{' '}
            <b>
              <Cifra fila={k} campo="pisos" formato={fmt.n} />
            </b>{' '}
            pisos de venta.
          </p>
        </div>
      </header>

      <div className="bar" id="filtros">
        <div className="filters">
          {selector('cadena', 'Cadena', 'Todas')}
          {selector('estado', 'Estado', 'Todos')}
          {selector('rac', 'Artículo RAC', 'Todos')}
          <button
            className="btn"
            id="limpiar"
            type="button"
            onClick={() => setP(PARAMS_VACIOS)}
          >
            Quitar filtros
          </button>
        </div>
        <div className="chips" id="chips">
          {CADENAS.map((c) => (
            <button
              key={c}
              className="chip"
              type="button"
              aria-pressed={P.cadena === c}
              aria-label={c}
              onClick={() => fijar({ cadena: P.cadena === c ? null : c })}
            >
              <Logo src={LOGOS[c]} alt={c} />
            </button>
          ))}
        </div>
      </div>

      <nav className="tabs" role="tablist" id="pestanas">
        {PESTANAS.map(([id, etiqueta]) => (
          <button
            key={id}
            className="tab"
            role="tab"
            type="button"
            aria-selected={pestana === id}
            onClick={() => elegirPestana(id)}
          >
            {etiqueta}
          </button>
        ))}
      </nav>

      {carga.estado === 'cargando' && (
        <Estado rol="status">Cargando datos del dashboard…</Estado>
      )}
      {carga.estado === 'error' && (
        <Estado rol="alert">
          Servicio no disponible: no se pudieron cargar los datos del dashboard.
          Vuelve a intentarlo en unos minutos.
        </Estado>
      )}

      {listo && (
        <>
          <section {...seccion('resumen')} data-sec>
            <div
              className="card"
              id="destacados"
              style={{ borderLeft: '6px solid var(--mn)' }}
            >
              <h3>Lo más importante</h3>
              <ul className="dest">
                {r.destacados.map((d) => (
                  <li key={d.clave}>{d.texto}</li>
                ))}
              </ul>
            </div>
            <h2 id="h-indicadores">1.1 Indicadores principales</h2>
            <div className="kpis">
              <div className="card" id="k1">
                <div className="lbl">Venta acumulada {CORTE.anio} · S1–S{SEM}</div>
                <div className="big">
                  <Cifra fila={k} campo="ytd26_p" formato={fmt.m} />
                </div>
                <div className="sub">
                  <Cifra fila={k} campo="var_p" formato={fmt.vari} color="x" /> vs{' '}
                  {CORTE.anio - 1} ·{' '}
                  <Cifra fila={k} campo="ytd26_u" formato={fmt.n} /> uds (
                  <Cifra fila={k} campo="var_u" formato={fmt.vari} color="x" />)
                </div>
              </div>
              <div className="card" id="k2">
                <div className="lbl">Venta semana {SEM}</div>
                <div className="big">
                  <Cifra fila={k} campo="s46_p" formato={fmt.m} />
                </div>
                <div className="sub">
                  <Cifra fila={k} campo="var_s46_p" formato={fmt.vari} color="x" /> vs
                  S{SEM} {CORTE.anio - 1} ·{' '}
                  <Cifra fila={k} campo="s46_u" formato={fmt.n} /> uds (
                  <Cifra fila={k} campo="var_s46_u" formato={fmt.vari} color="x" />)
                </div>
              </div>
              <div className="card" id="k3">
                <div className="lbl">Pisos de venta</div>
                <div className="big">
                  <Cifra fila={k} campo="pisos" formato={fmt.n} />
                </div>
                <div className="sub">
                  Tiendas con venta en 4 semanas o con inventario al cierre S{SEM}
                </div>
              </div>
              <div className="card" id="k4">
                <div className="lbl">Promedio de venta semanal</div>
                <div className="big">
                  <Cifra fila={k} campo="prom_p" formato={fmt.m} />
                </div>
                <div className="sub">
                  <Cifra fila={k} campo="prom_u" formato={fmt.n} /> uds por semana
                  (acumulado ÷ {SEM})
                </div>
              </div>
              <div className="card" id="k5">
                <div className="lbl">Promedio semanal por tienda</div>
                <div className="big">
                  <Cifra fila={k} campo="prom_t_p" formato={fmt.p} />
                </div>
                <div className="sub">
                  <Cifra fila={k} campo="prom_t_u" formato={fmt.n1} /> uds por
                  tienda por semana
                </div>
              </div>
            </div>

            <h2 id="h-ocho">
              1.2 Consolidado semana {SEM} ({CORTE.etiqueta})
            </h2>
            <Ocho filas={r.ocho} />
            <p className="muted">
              Plan operativo = venta {CORTE.anio - 1} de la misma semana + 10%.
              Semana anterior: S{SEM - 1} en Semana; acumulado a la S{SEM - 1} en
              Acumulado. Pesos en miles.
            </p>

            <h2 id="h-tendencia">
              1.3 Tendencia semanal {CORTE.anio} vs {CORTE.anio - 1}
            </h2>
            <div className="legend">
              <span>
                <i className="sw" style={{ background: 'var(--lv)' }} />
                {CORTE.anio - 1}
              </span>
              <span>
                <i className="sw" style={{ background: 'var(--bl)' }} />
                {CORTE.anio} real (S1–S{SEM})
              </span>
              <span>
                <i
                  className="sw"
                  style={{
                    background:
                      'repeating-linear-gradient(90deg,var(--sk) 0 4px,transparent 4px 7px)',
                  }}
                />
                Tendencia {CORTE.anio} (S{SEM + 1}–S52)
              </span>
            </div>
            <div className="two">
              <div className="card" id="g-pesos">
                <h3>Venta en pesos</h3>
                <GraficaSerie rows={r.serie} claves={CLAVES_PESOS} formato={fmt.m} />
              </div>
              <div className="card" id="g-uds">
                <h3>Venta en unidades</h3>
                <GraficaSerie
                  rows={r.serie}
                  claves={CLAVES_UNIDADES}
                  formato={fmt.n}
                />
              </div>
            </div>
            <p className="muted">
              Tendencia S{SEM + 1}–S52 = venta {CORTE.anio - 1} de cada semana × la
              relación {CORTE.anio}/{CORTE.anio - 1} de las últimas 8 semanas (S
              {SEM - 7}–S{SEM}). Sigue los filtros de cadena y artículo, no el de
              estado.
            </p>

            <h2 id="h-cadena">1.4 Resultados por cadena</h2>
            <Tabla
              cabecera={[
                ['Cadena', 'l'],
                'Venta 2026 $',
                '% var $',
                'Uds 2026',
                '% var uds',
                'Participación',
                'Pisos de venta',
                'Prom. semanal $',
                'Prom. semanal uds',
                'Prom. sem. por tienda $',
                'Prom. sem. por tienda uds',
                'Inventario uds',
                'Cobertura (sem)',
              ]}
              columnas={[['clave', null, 'logo'], ...BASE]}
              filas={r.por_cadena}
              onFila={(f) => fijar({ cadena: f.clave })}
            />
            <p className="muted">
              % de variación vs {CORTE.anio - 1}, mismas semanas. Semáforo:{' '}
              <span className="ok">● 0% o más</span> ·{' '}
              <span className="warn">● de −0.1% a −10%</span> ·{' '}
              <span className="bad">● más de 10% abajo</span>. Cobertura =
              inventario ÷ venta semanal promedio de las últimas 4 semanas.
            </p>
          </section>

          <section {...seccion('estados')} data-sec>
            <h2 id="h-mapa">2.1 Venta por tienda en cada estado</h2>
            <div className="card" id="mapa-estados">
              <h3>
                Estados por venta {CORTE.anio} ÷ pisos de venta · puntos por venta{' '}
                {CORTE.anio} en pesos de cada tienda
              </h3>
              <LeyendaMapa porEstado={r.por_estado} />
              <div className="legend">
                {CADENAS.map((c) => (
                  <span key={c}>
                    <i className="sw" style={{ background: COLORES[c] }} />
                    {c}
                  </span>
                ))}
                <span>
                  <i className="sw" style={{ background: COLORES["Sam's Club"] }} />
                  Sam&apos;s (sin datos)
                </span>
              </div>
              <div style={{ position: 'relative' }}>
                <MapaEstados
                  estados={carga.estados}
                  porEstado={r.por_estado}
                  estado={P.estado}
                  onEstado={elegirEstado}
                />
                <PuntosMapa estados={carga.estados} puntos={r.puntos_m} />
              </div>
              <p className="muted">
                Color del estado: venta por piso de venta (más oscuro = más venta
                por tienda). Tamaño del punto: venta {CORTE.anio} en pesos de esa
                tienda; punto tenue = sin venta en 4 semanas. Clic en un estado
                para filtrar el dashboard.
              </p>
            </div>
            <h2 id="h-ranking">2.2 Ranking por estado</h2>
            <Tabla
              cabecera={[
                ['#', 'l'],
                ['Estado', 'l'],
                'Venta 2026 $',
                '% var $',
                'Uds 2026',
                '% var uds',
                'Participación',
                'Pisos de venta',
                'Venta por piso $',
                'Prom. sem. por tienda $',
                'Inventario uds',
                'Cobertura',
                "Sam's (sin datos)",
              ]}
              columnas={[
                ['#'],
                ['clave'],
                ...BASE.slice(0, 6),
                ['vpp', fmt.p],
                ['prom_t_p', fmt.p],
                ['inv_u', fmt.n],
                ['cob', fmt.n1],
                ['sams', fmt.n],
              ]}
              filas={r.por_estado}
              onFila={(f) => fijar({ estado: f.clave })}
            />
          </section>

          <section {...seccion('productos')} data-sec>
            <h2 id="h-prod-g">3.1 Venta {CORTE.anio} por artículo RAC</h2>
            <div className="two">
              <div className="card" id="g-art-p">
                <h3>Pesos</h3>
                <GraficaBarras rows={r.por_articulo} campo="ytd26_p" formato={fmt.m} />
              </div>
              <div className="card" id="g-art-u">
                <h3>Unidades</h3>
                <GraficaBarras rows={r.por_articulo} campo="ytd26_u" formato={fmt.n} />
              </div>
            </div>
            <h2 id="h-heat-p">
              3.2 Mapa de calor · Venta {CORTE.anio} en pesos por producto y cadena
            </h2>
            <Heat filas={r.heat} tipo="p" />
            <h2 id="h-heat-v">
              3.3 Mapa de calor · % de variación vs {CORTE.anio - 1} por producto y
              cadena
            </h2>
            <Heat filas={r.heat} tipo="v" />
            <p className="muted">
              Pesos: más oscuro = más venta. Variación: verde crece, rojo baja;
              celda vacía = la cadena no maneja ese artículo.
            </p>
            <h2 id="h-prod-t">3.4 Detalle por cadena y artículo</h2>
            <Tabla
              cabecera={[
                ['Cadena', 'l'],
                ['Artículo RAC', 'l'],
                'Pisos de venta',
                'Uds 2026',
                '% var uds',
                'Venta 2026 $',
                '% var $',
                'Prom. sem. uds',
                'Prom. sem. $',
                'Prom. sem. por tienda uds',
                'Inventario uds',
                'Cobertura',
                'Empaque',
              ]}
              columnas={[
                ['cadena', null, 'logo'],
                ['rac'],
                ['pisos', fmt.n],
                ['ytd26_u', fmt.n],
                ['var_u', fmt.vari, 'sem'],
                ['ytd26_p', fmt.p],
                ['var_p', fmt.vari, 'sem'],
                ['prom_u', fmt.n1],
                ['prom_p', fmt.p],
                ['prom_t_u', fmt.n1],
                ['inv_u', fmt.n],
                ['cob', fmt.n1],
                ['emp', (v) => (v ? fmt.n(v) : '—')],
              ]}
              filas={r.por_articulo}
            />
          </section>

          <section {...seccion('inventarios')} data-sec>
            <h2 id="h-inv">
              4.1 Inventario en tienda al cierre de la semana {SEM} (unidades)
            </h2>
            <div className="kpis">
              <div className="card" id="i1">
                <div className="lbl">Inventario total</div>
                <div className="big">
                  <Cifra fila={k} campo="inv_u" formato={fmt.n} />
                </div>
                <div className="sub">unidades</div>
              </div>
              <div className="card" id="i2">
                <div className="lbl">Cobertura</div>
                <div className="big">
                  <Cifra fila={k} campo="cob" formato={fmt.n1} />
                </div>
                <div className="sub">semanas de venta</div>
              </div>
              <div className="card" id="i3">
                <div className="lbl">Tiendas con inventario</div>
                <div className="big">
                  <Cifra fila={k} campo="t_inv" formato={fmt.n} />
                </div>
                <div className="sub">
                  de <Cifra fila={k} campo="pisos" formato={fmt.n} /> pisos de venta
                </div>
              </div>
              <div className="card" id="i4">
                <div className="lbl">Tiendas con venta y sin inventario</div>
                <div className="big bad">
                  <Cifra fila={k} campo="t_sin_inv" formato={fmt.n} />
                </div>
                <div className="sub">vendieron en 4 semanas, inventario 0</div>
              </div>
            </div>
            <h2 id="h-inv-g">
              4.2 Inventario semanal {CORTE.anio} por cadena (unidades)
            </h2>
            <div className="card" id="g-inv">
              <div className="legend">
                {CADENAS.map((c) => (
                  <span key={c}>
                    <i className="sw" style={{ background: COLORES[c] }} />
                    {c}
                  </span>
                ))}
              </div>
              <GraficaInventario serie={r.inv_serie} cadenas={CADENAS} />
              <p className="muted">
                Walmart: S1–S19, S31 y S41–S44 del Excel INV_WMT_2026 (fotos de
                Retail Link del día de descarga), S20–S40 del histórico y S45–S46
                del portal; S2 sin dato. Soriana y Chedraui solo guardan cierres de
                mes en el portal (las semanas intermedias vienen de sus Excel).
              </p>
            </div>
            <h2 id="h-inv-t">4.3 Inventario por estado</h2>
            <Tabla
              cabecera={[
                ['Estado', 'l'],
                'Inventario uds',
                'Tiendas con inventario',
                'Uds vendidas 4 sem',
                'Cobertura (sem)',
                'Con venta y sin inventario',
              ]}
              columnas={[
                ['clave'],
                ['inv_u', fmt.n],
                ['t_inv', fmt.n],
                ['l4_u', fmt.n],
                ['cob', fmt.n1],
                ['t_sin_inv', fmt.n],
              ]}
              filas={r.por_estado}
              onFila={(f) => fijar({ estado: f.clave })}
            />
          </section>

          <section {...seccion('alertas')} data-sec>
            <h2 id="h-al">5.1 Resumen de alertas</h2>
            <div className="alerts">
              <div className="card" id="a0">
                <div className="lbl">Posible mercancía en bodega</div>
                <div className="big bad">
                  <Cifra fila={al} campo="bodega" formato={fmt.n} />
                </div>
                <div className="sub">
                  tienda-artículo con cajas completas y sin venta en 4 semanas ·{' '}
                  <Cifra fila={al} campo="bodega_u" formato={fmt.n} /> uds
                </div>
              </div>
              <div className="card" id="a1">
                <div className="lbl">Inventario detenido</div>
                <div className="big bad">
                  <Cifra fila={al} campo="sin_venta" formato={fmt.n} />
                </div>
                <div className="sub">
                  tiendas con inventario y sin venta en 4 semanas ·{' '}
                  <Cifra fila={al} campo="sin_venta_u" formato={fmt.n} /> uds
                </div>
              </div>
              <div className="card" id="a2">
                <div className="lbl">Faltante de inventario</div>
                <div className="big bad">
                  <Cifra fila={al} campo="faltante" formato={fmt.n} />
                </div>
                <div className="sub">
                  tiendas con venta y menos de 2 semanas de inventario
                </div>
              </div>
              <div className="card w" id="a3">
                <div className="lbl">Sobre-stock</div>
                <div className="big warn">
                  <Cifra fila={al} campo="sobre" formato={fmt.n} />
                </div>
                <div className="sub">
                  tiendas con más de 26 semanas ·{' '}
                  <Cifra fila={al} campo="sobre_u" formato={fmt.n} /> uds
                </div>
              </div>
              <div className="card w" id="a4">
                <div className="lbl">Dejaron de vender</div>
                <div className="big warn">
                  <Cifra fila={al} campo="perdidas" formato={fmt.n} />
                </div>
                <div className="sub">
                  vendían en S{SEM - 3}–S{SEM} de {CORTE.anio - 1} y hoy no
                </div>
              </div>
            </div>
            <p className="muted">
              Últimas 4 semanas = S{SEM - 3} a S{SEM}. Empaques de CATALOGO ARTURO
              (Drive); sin empaque: Walmart Costalitos, 200 grs., Dryhook 3 pack y
              Rejilla 3 pack. CEDIS fuera de las alertas.
            </p>
            <h2 id="h-bodega">
              5.2 Top 15 · Posible mercancía en bodega (cajas completas sin venta)
            </h2>
            <Tabla
              cabecera={[
                ['Cadena', 'l'],
                ['Estado', 'l'],
                ['Tienda', 'l'],
                ['Artículo RAC', 'l'],
                'Inventario uds',
                'Empaque',
                'Cajas completas',
              ]}
              columnas={[
                ...TIENDA,
                ['tienda'],
                ['rac'],
                ['inv_u', fmt.n],
                ['emp', fmt.n],
                ['cajas', fmt.n],
              ]}
              filas={r.top_bodega}
            />
            <div className="two">
              <div id="top-det">
                <h2>5.3 Top 15 · Inventario detenido</h2>
                <Tabla
                  cabecera={[['Cadena', 'l'], ['Estado', 'l'], ['Tienda', 'l'], 'Inventario uds']}
                  columnas={[...TIENDA, ['clave'], ['inv_u', fmt.n]]}
                  filas={r.top_sinventa}
                />
              </div>
              <div id="top-falt">
                <h2>5.4 Top 15 · Mayor faltante</h2>
                <Tabla
                  cabecera={[['Cadena', 'l'], ['Estado', 'l'], ['Tienda', 'l'], 'Uds 4 sem', 'Inv uds', 'Cobertura']}
                  columnas={[...TIENDA, ['clave'], ['l4_u', fmt.n], ['inv_u', fmt.n], ['cob', fmt.n1]]}
                  filas={r.top_faltante}
                />
              </div>
              <div id="top-sobre">
                <h2>5.5 Top 15 · Sobre-stock</h2>
                <Tabla
                  cabecera={[['Cadena', 'l'], ['Estado', 'l'], ['Tienda', 'l'], 'Inv uds', 'Uds 4 sem', 'Cobertura']}
                  columnas={[...TIENDA, ['clave'], ['inv_u', fmt.n], ['l4_u', fmt.n], ['cob', fmt.n1]]}
                  filas={r.top_sobre}
                />
              </div>
              <div id="top-caida">
                <h2>5.6 Top 15 · Mayor caída vs {CORTE.anio - 1}</h2>
                <Tabla
                  cabecera={[['Cadena', 'l'], ['Estado', 'l'], ['Tienda', 'l'], 'Venta 2026 $', 'Venta 2025 $', 'Diferencia $']}
                  columnas={[...TIENDA, ['clave'], ['ytd26_p', fmt.p], ['ytd25_p', fmt.p], ['dif', fmt.p, 'neg']]}
                  filas={r.top_caida}
                />
              </div>
            </div>
          </section>

          <section {...seccion('acciones')} data-sec>
            <h2 id="h-acc">6.1 Accionables de la semana</h2>
            <p className="muted">
              Se calculan con los mismos filtros del dashboard. Prioridad alta =
              afecta venta inmediata.
            </p>
            <Tabla
              cabecera={[
                ['Prioridad', 'l'],
                ['Tema', 'l'],
                ['Acción recomendada', 'l'],
                ['Responsable sugerido', 'l'],
                'Tiendas',
                'Unidades',
              ]}
              columnas={[
                [
                  'prioridad',
                  null,
                  (v) => ({
                    style: {
                      fontWeight: 600,
                      color:
                        v === 'Alta'
                          ? 'var(--bd)'
                          : v === 'Media'
                            ? '#B98900'
                            : 'var(--color-fg-muted)',
                    },
                  }),
                ],
                ['clave'],
                ['accion', null, () => ({ style: { whiteSpace: 'normal', minWidth: 320 } })],
                ['responsable'],
                ['tiendas', fmt.n],
                ['uds', fmt.n],
              ]}
              filas={r.acciones}
            />
            <h2 id="h-pedido">6.2 Pedido sugerido · tiendas con faltante (top 25)</h2>
            <Tabla
              cabecera={[
                ['Cadena', 'l'],
                ['Estado', 'l'],
                ['Tienda', 'l'],
                'Venta semanal uds',
                'Inventario uds',
                'Cobertura',
                'Pedido sugerido uds',
              ]}
              columnas={[
                ...TIENDA,
                ['clave'],
                ['prom_u', fmt.n1],
                ['inv_u', fmt.n],
                ['cob', fmt.n1],
                ['sug_u', fmt.n],
              ]}
              filas={r.pedido}
            />
            <p className="muted">
              Pedido sugerido = venta semanal promedio de las últimas 4 semanas × 4
              semanas de cobertura − inventario actual.
            </p>
          </section>

          <details id="notas">
            <summary>Fuentes y criterios</summary>
            <ul>
              <li>
                Bases {CORTE.anio - 1}–{CORTE.anio} por cadena (Drive, 03 Bases) y
                descargas originales de los portales. Walmart: base de ventas más
                los reportes CH Semanal de Retail Link de mayo a octubre, S45 y
                S46. Soriana S46: portal del 9 al 15-nov.
              </li>
              <li>
                Walmart 2025 S1–S13 y S30–S31 vienen de acumulados de Retail Link:
                el total es exacto, pero se repartió parejo entre esas semanas para
                la gráfica.
              </li>
              <li>
                Pisos de venta: tiendas con venta en las últimas 4 semanas o con
                inventario al cierre S{SEM}. Promedio semanal = acumulado{' '}
                {CORTE.anio} ÷ {SEM} semanas; por tienda = ese promedio ÷ pisos.
              </li>
              <li>
                Inventario en unidades al cierre S{SEM} (Walmart: foto del 16-nov).
                Base limpia: sin tiendas sin venta y sin inventario en todo el
                periodo.
              </li>
              <li>
                Mapa: coordenadas de Catalogo_Maestro_Tiendas_Mapa (02 Catálogos).
                Sam&apos;s solo como presencia: no hay licencia de su portal.
              </li>
            </ul>
          </details>
        </>
      )}
    </div>
  )
}
