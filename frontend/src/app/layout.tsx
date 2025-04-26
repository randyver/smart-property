// import './globals.css'
// import ChatbotProvider from '@/components/ChatbotProvider'
// import Navbar from '@/components/Navbar'

// export const metadata = {
//   metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://elninolanina.mapid.co.id'),
//   title: 'SmartProperty - Climate-Safe Property Analysis',
//   description: 'Find climate-safe properties with advanced GIS analysis. Compare environmental factors, evaluate climate risks, and make informed real estate decisions.',
//   keywords: 'smart property, climate-safe, real estate, GIS, property analysis, flood risk, climate change, sustainable housing, land surface temperature, urban heat island, NDVI',
//   authors: [
//     { name: 'Team El Nino La Nina' }
//   ],
//   viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
//   themeColor: '#1E88E5',
//   creator: 'MAPID Web GIS Competition 2025',
//   openGraph: {
//     type: 'website',
//     locale: 'id_ID',
//     url: '/',
//     title: 'SmartProperty - Climate-Safe Property Analysis',
//     description: 'Find climate-safe properties with advanced GIS analysis and make informed real estate decisions.',
//     siteName: 'SmartProperty'
//   }
// }

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode
// }) {
//   return (
//     <html lang="id">
//       <head>
//         <meta charSet="utf-8" />
//         <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
//         <meta name="format-detection" content="telephone=no" />
//         <meta name="apple-mobile-web-app-capable" content="yes" />
//         <meta name="apple-mobile-web-app-status-bar-style" content="default" />
//         <link rel="icon" href="/icon.ico" sizes="any" />
//         <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
//       </head>
//       <body>
//         <Navbar />
//         {children}
//         <ChatbotProvider />
//       </body>
//     </html>
//   )
// }

import './globals.css'
import ChatbotProvider from '@/components/ChatbotProvider'
import Navbar from '@/components/Navbar'
import { Frown } from 'lucide-react'

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://elninolanina.mapid.co.id'),
  title: 'SmartProperty - Climate-Safe Property Analysis',
  description: 'Find climate-safe properties with advanced GIS analysis. Compare environmental factors, evaluate climate risks, and make informed real estate decisions.',
  keywords: 'smart property, climate-safe, real estate, GIS, property analysis, flood risk, climate change, sustainable housing, land surface temperature, urban heat island, NDVI',
  authors: [
    { name: 'Team El Nino La Nina' }
  ],
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  themeColor: '#1E88E5',
  creator: 'MAPID Web GIS Competition 2025',
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: '/',
    title: 'SmartProperty - Climate-Safe Property Analysis',
    description: 'Find climate-safe properties with advanced GIS analysis and make informed real estate decisions.',
    siteName: 'SmartProperty'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="icon" href="/icon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="min-h-screen flex items-center justify-center">
        <div className="z-50">
          <Frown size={96} color="#ff6b6b" />
        </div>
      </body>
    </html>
  )
}