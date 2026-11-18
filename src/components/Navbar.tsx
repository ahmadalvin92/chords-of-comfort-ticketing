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
              Denah Kursi (300 Seat)
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

            <a
              href="https://www.instagram.com/chordsofcomfort.theater?jplx=MXM3c3J3bGQ1NXJ5Zg=="
              target="_blank"
              rel="noreferrer"
              className="text-slate-300 hover:text-pink-400 transition-colors"
              title="Instagram @chordsofcomfort.theater"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>

            <a
              href="https://wa.me/6281915348866?text=Halo%20Panitia%20Ticketing%20Chords%20of%20Comfort%2C%20saya%20mau%20bertanya%20seputar%20tiket"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 text-xs font-bold bg-emerald-950/60 border border-emerald-500/50 px-2.5 py-1 rounded-full transition-colors"
              title="Hubungi Panitia via WhatsApp"
            >
              <span>WA: 0819-1534-8866</span>
            </a>
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
            Denah Kursi (300 Seat)
          </a>
          <div className="pt-2 border-t border-slate-800 flex flex-wrap gap-4 items-center">
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
            <a
              href="https://wa.me/6281915348866?text=Halo%20Panitia%20Ticketing%20Chords%20of%20Comfort%2C%20saya%20mau%20bertanya%20seputar%20tiket"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-emerald-400 py-1 text-xs font-bold"
            >
              WA: 0819-1534-8866
            </a>
            <a
              href="https://www.instagram.com/chordsofcomfort.theater?jplx=MXM3c3J3bGQ1NXJ5Zg=="
              target="_blank"
              rel="noreferrer"
              className="text-pink-400 text-xs font-bold py-1"
            >
              @chordsofcomfort.theater
            </a>
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

