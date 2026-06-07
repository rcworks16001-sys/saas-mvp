import { ClerkProvider } from '@clerk/nextjs';
import { Inter, Playfair_Display, Bebas_Neue } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-inter',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  display: 'swap',
  variable: '--font-playfair',
});

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
});

export const metadata = {
  title: 'Ourivo — AI Lead Capture for Real Estate',
  description: 'Your AI bot captures and qualifies buyers on WhatsApp 24/7. Never miss a lead again.',
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${inter.variable} ${playfair.variable} ${bebasNeue.variable}`}>
        <body style={{ fontFamily: 'var(--font-inter)' }}>
          <Toaster position="top-right" />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}