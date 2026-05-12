import type { Metadata } from 'next'
import { Inter, Crimson_Text, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import Link from 'next/link'
import './globals.css'

const _inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const _crimson = Crimson_Text({ subsets: ['latin'], weight: ['400', '600'], style: ['normal', 'italic'], variable: '--font-crimson' });
const _geistMono = Geist_Mono({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Source Sheet Editor',
  description: 'Build beautiful source sheets for shiurim and chaburot',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className="font-sans antialiased min-h-screen flex flex-col">
        <div className="flex-1">{children}</div>
        <footer className="border-t border-border bg-card/80 print:hidden">
          <div className="mx-auto max-w-5xl px-6 py-4 text-sm text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-2">
            <span>© {new Date().getFullYear()} Mekorly</span>
            <Link href="/" className="hover:text-foreground underline underline-offset-4">
              Home
            </Link>
            <Link href="/about" className="hover:text-foreground underline underline-offset-4">
              About
            </Link>
            <Link href="/terms" className="hover:text-foreground underline underline-offset-4">
              Terms of Service
            </Link>
            <Link href="/privacy" className="hover:text-foreground underline underline-offset-4">
              Privacy Policy
            </Link>
          </div>
        </footer>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
