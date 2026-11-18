'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Ticket, Menu, X, Phone, ShieldCheck } from 'lucide-react';

const InstagramIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

interface NavbarProps {
  onBookTicketsClick: () => void;
}

export default function Navbar({ onBookTicketsClick }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-[#FAF6ED] border-b-4 border-[#0F1C30] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Left Brand Identity: Varsity Crest / College Badge */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-[#C1272D] border-3 border-[#0F1C30] flex items-center justify-center text-[#FAF6ED] font-bebas text-2xl shadow-[0_3px_0_#0F1C30] group-hover:-rotate-6 transition-transform">
              6SP
            </div>
            <div>
              <span className="font-bebas text-2xl tracking-wider text-[#182B49] block leading-none">
                CHORDS OF COMFORT
              </span>
              <span className="text-[10px] font-bold tracking-widest text-[#C1272D] uppercase block mt-0.5">
                COMM30-6SP • LSPR THEATER FESTIVAL
              </span>
            </div>
          </Link>

          {/* Center Navigation Links (Desktop) */}
          <div className="hidden md:flex items-center gap-6 text-xs font-bold uppercase tracking-wider text-slate-700">
            <a href="#about" className="hover:text-[#C1272D] transition-colors">
              About
            </a>
            <a href="#categories" className="hover:text-[#C1272D] transition-colors">
              Ticket Tiers
            </a>
            <a href="#seatplan" className="hover:text-[#C1272D] transition-colors">
              Seating Plan
            </a>
            <a href="#faq" className="hover:text-[#C1272D] transition-colors">
              FAQ
            </a>
          </div>

          {/* Right Action Icons & Primary CTA (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="https://www.instagram.com/chordsofcomfort.theater?jplx=MXM3c3J3bGQ1NXJ5Zg=="
              target="_blank"
              rel="noreferrer"
              className="p-2.5 rounded-xl border-2 border-[#0F1C30] bg-white hover:bg-slate-100 text-[#182B49] transition-colors"
              title="Official Instagram @chordsofcomfort.theater"
            >
              <InstagramIcon className="w-4 h-4" />
            </a>

            <a
              href="https://wa.me/6281915348866"
              target="_blank"
              rel="noreferrer"
              className="p-2.5 rounded-xl border-2 border-[#0F1C30] bg-[#25D366] hover:bg-[#20ba59] text-white transition-colors"
              title="Official WhatsApp Hotline 0819-1534-8866"
            >
              <Phone className="w-4 h-4" />
            </a>

            <button
              onClick={onBookTicketsClick}
              className="cursor-pointer bg-[#C1272D] hover:bg-[#a61f25] text-white px-5 py-2.5 rounded-xl font-bebas text-lg tracking-wider border-2 border-[#0F1C30] shadow-[0_3px_0_#0F1C30] hover:translate-y-0.5 transition-all flex items-center gap-2"
            >
              <Ticket className="w-4 h-4 text-[#F4B32A]" />
              <span>BOOK TICKETS</span>
            </button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onBookTicketsClick}
              className="bg-[#C1272D] text-white px-3 py-2 rounded-xl font-bebas text-sm border-2 border-[#0F1C30] flex items-center gap-1"
            >
              <Ticket className="w-3.5 h-3.5 text-[#F4B32A]" />
              <span>TICKETS</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl border-2 border-[#0F1C30] bg-white text-[#182B49]"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FAF6ED] border-t-2 border-[#0F1C30] px-4 py-6 space-y-4 animate-in slide-in-from-top duration-200">
          <div className="flex flex-col space-y-3 font-bebas text-xl text-[#182B49]">
            <a
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-[#C1272D]"
            >
              About the Musical
            </a>
            <a
              href="#categories"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-[#C1272D]"
            >
              Ticket Tiers & Pricing
            </a>
            <a
              href="#seatplan"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-[#C1272D]"
            >
              Floor Plan & Seats
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-[#C1272D]"
            >
              Frequently Asked Questions (FAQ)
            </a>
          </div>

          <div className="pt-4 border-t-2 border-dashed border-slate-300 flex items-center gap-3">
            <a
              href="https://www.instagram.com/chordsofcomfort.theater?jplx=MXM3c3J3bGQ1NXJ5Zg=="
              target="_blank"
              rel="noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 bg-white text-[#182B49] py-2.5 rounded-xl border-2 border-[#0F1C30] text-xs font-bold"
            >
              <InstagramIcon className="w-4 h-4 text-[#C1272D]" />
              <span>Instagram</span>
            </a>
            <a
              href="https://wa.me/6281915348866"
              target="_blank"
              rel="noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 bg-[#25D366] text-white py-2.5 rounded-xl border-2 border-[#0F1C30] text-xs font-bold"
            >
              <Phone className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
