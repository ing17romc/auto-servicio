export default function AccessChart({ days }) {
  const max = Math.max(1, ...days.map((day) => day.count))
  const width = 900 / days.length
  return (
    <section className="panel" aria-labelledby="chart-heading">
      <h2 id="chart-heading">Entradas por día</h2>
      <p className="muted">
        Cada entrada autorizada al dashboard, incluidas las recargas.
      </p>
      <svg
        className="chart"
        viewBox="0 0 900 180"
        preserveAspectRatio="none"
        role="img"
        aria-labelledby="chart-title chart-desc"
      >
        <title id="chart-title">Entradas al dashboard por día</title>
        <desc id="chart-desc">
          Gráfica de barras. Los valores de cada día están disponibles en la
          tabla que aparece debajo.
        </desc>
        <line x1="0" y1="179" x2="900" y2="179" stroke="#dce2e7" />
        {days.map(({ day, count }, i) => (
          <rect
            key={day}
            x={i * width + width * 0.15}
            y={179 - (count / max) * 160}
            width={Math.max(1, width * 0.7)}
            height={(count / max) * 160}
            rx="1"
            fill="#176b55"
          >
            <title>
              {day}: {count}
            </title>
          </rect>
        ))}
      </svg>
      <div className="chart-labels">
        <span>{days[0]?.day}</span>
        <span>
          Máximo diario:{' '}
          {max === 1 && days.every((day) => !day.count) ? 0 : max}
        </span>
        <span>{days.at(-1)?.day}</span>
      </div>
      <details className="chart-table">
        <summary>Ver valores diarios en tabla</summary>
        <div className="table-scroll">
          <table>
            <caption className="sr-only">
              Entradas diarias, Ciudad de México
            </caption>
            <thead>
              <tr>
                <th>Día</th>
                <th>Entradas</th>
              </tr>
            </thead>
            <tbody>
              {days.map((day) => (
                <tr key={day.day}>
                  <td>{day.day}</td>
                  <td>{day.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </section>
  )
}
