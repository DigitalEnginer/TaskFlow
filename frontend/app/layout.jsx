import './globals.css'

export const metadata = {
  title: 'TaskFlow',
  description: 'Trello-like project management app',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  )
}
