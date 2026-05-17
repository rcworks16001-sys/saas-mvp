import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

export const metadata = {
  title: 'SaaS MVP - WhatsApp CRM',
  description: 'WhatsApp CRM for Real Estate Agents',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <Toaster position="top-right" />
        {children}
      </body>
    </html>
  );
}