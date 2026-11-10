import type { Metadata } from 'next';
import { Bebas_Neue, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas',
});

const jakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'CHORDS OF COMFORT | LSPR COMM30-6SP Musical Theater',
  description:
    'Sistem Pembelian Tiket Online Resmi Musical Theater "Chords of Comfort" LSPR COMM30-6SP di Sudirman Park. Pilih kursi langsung, bayar via QRIS/VA, dan dapatkan e-ticket instan.',
  keywords: ['Chords of Comfort', 'LSPR', 'Musical Theater', 'COMM30-6SP', 'Sudirman Park', 'Ticketing'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${bebasNeue.variable} ${jakartaSans.variable} scroll-smooth`}>
      <body className="min-h-screen bg-[#F7F4EB] text-slate-900 font-sans antialiased selection:bg-[#F4B32A] selection:text-[#182B49]">
        {children}
      </body>
    </html>
  );
}
