export const metadata = {
  title: 'General Dashboard',
  icons: { icon: 'data:,' },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
