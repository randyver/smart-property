import './globals.css'
import ChatbotProvider from '@/components/ChatbotProvider'
import Navbar from '@/components/Navbar'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
        <ChatbotProvider />
      </body>
    </html>
  )
}