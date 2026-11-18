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
    'Official Online Ticketing for the musical theater production "Chords of Comfort" by LSPR COMM30-6SP at Amani Palladium Theatre, LSPR Bekasi. Select seats, reserve instantly, and receive official E-Tickets.',
  keywords: [
    'Chords of Comfort',
    'LSPR',
    'Musical Theater',
    'COMM30-6SP',
    'The 35th LSPR Theater Festival',
    'Amani Palladium Theatre',
    'LSPR Bekasi',
    'Ticketing',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${bebasNeue.variable} ${jakartaSans.variable} scroll-smooth`}>
      <body className="min-h-screen bg-[#F7F4EB] text-slate-900 font-sans antialiased selection:bg-[#F4B32A] selection:text-[#182B49]">
        {children}
      </body>
    </html>
  );
}
