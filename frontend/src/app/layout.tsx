import { Inter } from 'next/font/google'
import './globals.css'
import ChatbotProvider from '@/components/ChatbotProvider'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-sans'
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        {children}
        <ChatbotProvider />
      </body>
    </html>
  )
}