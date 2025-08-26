import './globals.css'

import type { Metadata } from 'next'
import { Alfa_Slab_One } from 'next/font/google'
import localFont from 'next/font/local'

import { ThemeProvider } from '@/components/providers/theme-provider'
import { Toaster } from '@/components/ui/toaster'

import { AppProvider } from './provider'

const roboto = localFont({
  src: [
    {
      path: './fonts/roboto-light.ttf',
      weight: '300',
      style: 'normal',
    },
    {
      path: './fonts/roboto-regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/roboto-medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: './fonts/roboto-bold.ttf',
      weight: '600',
      style: 'bold',
    },
    {
      path: './fonts/roboto-bold.ttf',
      weight: '700',
      style: 'bold',
    },
    {
      path: './fonts/roboto-black.ttf',
      weight: '900',
      style: 'bold',
    },
  ],
  variable: '--font-roboto',
  display: 'swap',
})

const alfaSlabOne = Alfa_Slab_One({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-alfaSlabOne',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'FantasyEdge',
  description: 'FantasyEdge is a suite of tools for fantasy sports games.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${roboto.variable} ${alfaSlabOne.variable} antialiased`}>
        <AppProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            {children}
            <Toaster />
          </ThemeProvider>
        </AppProvider>
      </body>
    </html>
  )
}
