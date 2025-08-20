import type { Metadata, Viewport } from 'next'
import { Inter, Orbitron } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { Toaster } from 'react-hot-toast'
import { MobileResponsiveLayout } from '@/components/layout/mobile-responsive-layout'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'UAV Docking Management System',
  description: 'Advanced UAV fleet management and docking system with real-time monitoring',
  keywords: ['UAV', 'drone', 'management', 'docking', 'fleet', 'monitoring'],
  authors: [{ name: 'UAV Management Team' }],
  robots: 'index, follow',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'UAV Docking Management System',
    description: 'Advanced UAV fleet management and docking system with real-time monitoring',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UAV Docking Management System',
    description: 'Advanced UAV fleet management and docking system with real-time monitoring',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${orbitron.variable}`} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2c3e50" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="UAV Control" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#2563eb" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body className={`${inter.className} antialiased mobile-viewport safe-area-all`}>
        <Providers>
          <MobileResponsiveLayout>
            {children}
          </MobileResponsiveLayout>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'hsl(var(--card))',
                color: 'hsl(var(--card-foreground))',
                border: '1px solid hsl(var(--border))',
              },
              success: {
                iconTheme: {
                  primary: 'hsl(var(--primary))',
                  secondary: 'white',
                },
              },
              error: {
                iconTheme: {
                  primary: 'hsl(var(--destructive))',
                  secondary: 'white',
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
