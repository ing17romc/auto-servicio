'use client'

export default function ErrorPage({ reset }) {
  return (
    <main className="page">
      <section className="panel">
        <h1>No fue posible cargar esta página</h1>
        <p>Vuelve a intentarlo en un momento.</p>
        <button className="button" onClick={reset}>
          Reintentar
        </button>{' '}
        <a href="/">Volver al inicio</a>
      </section>
    </main>
  )
}
