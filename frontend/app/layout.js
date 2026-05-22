import { Inter, Playfair_Display } from 'next/font/google';
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

export const metadata = {
  title: 'Ourivo — WhatsApp CRM for Real Estate',
  description: 'Capture, qualify and follow up with every WhatsApp lead automatically. Built for real estate agents in India.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body style={{ fontFamily: 'var(--font-inter)' }}>
        <Toaster position="top-right" />
        {children}
      </body>
    </html>
  );
}