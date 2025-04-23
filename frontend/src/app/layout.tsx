import './globals.css'
import ChatbotProvider from '@/components/ChatbotProvider'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <ChatbotProvider />
      </body>
    </html>
  )
}