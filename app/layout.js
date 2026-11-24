import './globals.css'

export const metadata = {
  title: { default: 'Auto-Servicio', template: '%s | Auto-Servicio' },
  icons: { icon: 'data:,' },
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
