import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ShelfSense – Retail Intelligence Chatbot',
  description: 'AI-powered retail analytics chatbot. Ask about inventory, sales trends, and store performance in English, Hindi, or Hinglish.',
  keywords: ['retail analytics', 'AI chatbot', 'inventory management', 'sales intelligence'],
  authors: [{ name: 'ShelfSense' }],
  openGraph: {
    title: 'ShelfSense – Retail Intelligence',
    description: 'Your 3 AM retail analyst. Ask anything about your stores.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
