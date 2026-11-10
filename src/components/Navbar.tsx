'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Ticket, ShieldCheck, QrCode, Menu, X, Sparkles } from 'lucide-react';

interface NavbarProps {
  onScrollToSeats?: () => void;
}

export default function Navbar({ onScrollToSeats }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#182B49] text-white border-b-4 border-[#F4B32A] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo / Brand with Varsity Badge */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-xl bg-[#C1272D] border-2 border-[#F4B32A] flex items-center justify-center font-bebas text-2xl text-[#FAF6ED] shadow-md transform -rotate-3 group-hover:rotate-0 transition-transform">
              6SP
            </div>
            <div>
              <div className="font-bebas text-xl sm:text-2xl tracking-wider text-[#F4B32A] flex items-center gap-1.5 leading-none">
                COMM30-6SP <Sparkles className="w-4 h-4 text-amber-300 inline" />
              </div>
              <div className="text-[11px] font-bold tracking-widest text-slate-300 uppercase">
                Theater Production • LSPR
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 font-semibold text-sm">
            <a
              href="#about"
              className="hover:text-[#F4B32A] transition-colors py-1 border-b-2 border-transparent hover:border-[#F4B32A]"
            >
              Tentang Acara
            </a>
            <a
              href="#categories"
              className="hover:text-[#F4B32A] transition-colors py-1 border-b-2 border-transparent hover:border-[#F4B32A]"
            >
              Kategori Tiket
            </a>
            <a
              href="#seating"
              onClick={(e) => {
                if (onScrollToSeats) {
                  e.preventDefault();
                  onScrollToSeats();
                }
              }}
              className="hover:text-[#F4B32A] transition-colors py-1 border-b-2 border-transparent hover:border-[#F4B32A]"
            >
              Denah Kursi (400 Seat)
            </a>
            <Link
              href="/admin"
              className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Admin
            </Link>
            <Link
              href="/scanner"
              className="flex items-center gap-1.5 text-slate-300 hover:text-[#F4B32A] transition-colors"
            >
              <QrCode className="w-4 h-4 text-[#F4B32A]" />
              Scan Gate
            </Link>
          </nav>

          {/* CTA Button */}
          <div className="hidden md:block">
            <button
              onClick={() => {
                if (onScrollToSeats) onScrollToSeats();
                else {
                  const el = document.getElementById('seating');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="cursor-pointer bg-[#C1272D] hover:bg-[#a61f25] text-white px-5 py-2.5 rounded-lg font-bebas text-lg tracking-wider border-2 border-[#F4B32A] shadow-[0_4px_0_#0F1C30] hover:translate-y-0.5 hover:shadow-[0_2px_0_#0F1C30] active:translate-y-1 transition-all flex items-center gap-2"
            >
              <Ticket className="w-5 h-5 text-[#F4B32A]" />
              Beli Tiket Sekarang
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-200 hover:text-white hover:bg-slate-800 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0F1C30] border-t border-slate-700 px-4 pt-3 pb-6 space-y-3 font-semibold text-sm">
          <a
            href="#about"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-200 hover:text-[#F4B32A]"
          >
            Tentang Acara
          </a>
          <a
            href="#categories"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-200 hover:text-[#F4B32A]"
          >
            Kategori Tiket
          </a>
          <a
            href="#seating"
            onClick={() => {
              setMobileMenuOpen(false);
              if (onScrollToSeats) onScrollToSeats();
            }}
            className="block py-2 text-slate-200 hover:text-[#F4B32A]"
          >
            Denah Kursi (400 Seat)
          </a>
          <div className="pt-2 border-t border-slate-800 flex gap-4">
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-1.5 text-slate-300 py-1"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Admin
            </Link>
            <Link
              href="/scanner"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-1.5 text-slate-300 py-1"
            >
              <QrCode className="w-4 h-4 text-[#F4B32A]" />
              Scan Gate
            </Link>
          </div>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              const el = document.getElementById('seating');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full mt-3 bg-[#C1272D] text-white py-3 rounded-lg font-bebas text-lg tracking-wider border-2 border-[#F4B32A] flex items-center justify-center gap-2"
          >
            <Ticket className="w-5 h-5 text-[#F4B32A]" />
            Beli Tiket Sekarang
          </button>
        </div>
      )}
    </header>
  );
}

