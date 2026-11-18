'use client';

import React from 'react';
import Link from 'next/link';
import {
  Ticket,
  MapPin,
  Calendar,
  Phone,
  ShieldCheck,
  Heart,
  ExternalLink,
} from 'lucide-react';

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

export default function Footer() {
  return (
    <footer className="bg-[#182B49] text-white border-t-4 border-[#F4B32A] pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">

          {/* Col 1: Brand & Synopsis (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#C1272D] border-2 border-[#F4B32A] flex items-center justify-center font-bebas text-2xl text-[#FAF6ED] shadow-md">
                6SP
              </div>
              <div>
                <span className="font-bebas text-3xl tracking-wider text-[#FAF6ED] leading-none block">
                  CHORDS OF COMFORT
                </span>
                <span className="text-[10px] font-bold tracking-widest text-[#F4B32A] uppercase block mt-0.5">
                  COMM30-6SP • THE 35TH LSPR THEATER FESTIVAL
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-medium max-w-sm">
              “Where Love, Friendship, and Dreams Find Their Way Home.” An original musical theater production by LSPR students exploring the unexpected connections that bring comfort when life turns upside down.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <a
                href="https://www.instagram.com/chordsofcomfort.theater?jplx=MXM3c3J3bGQ1NXJ5Zg=="
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-slate-800 hover:bg-[#C1272D] text-slate-300 hover:text-white transition-colors"
                title="Instagram @chordsofcomfort.theater"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a
                href="https://wa.me/6281915348866"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-slate-800 hover:bg-[#25D366] text-slate-300 hover:text-white transition-colors"
                title="WhatsApp 0819-1534-8866"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Navigation Links (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-[#F4B32A] block">
              QUICK LINKS
            </span>
            <ul className="space-y-2 text-xs font-semibold text-slate-300">
              <li>
                <a href="#about" className="hover:text-[#F4B32A] transition-colors">
                  About the Musical
                </a>
              </li>
              <li>
                <a href="#categories" className="hover:text-[#F4B32A] transition-colors">
                  Ticket Categories
                </a>
              </li>
              <li>
                <a href="#seatplan" className="hover:text-[#F4B32A] transition-colors">
                  Seating Floor Plan
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-[#F4B32A] transition-colors">
                  FAQ & Guidelines
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Event Information (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-[#F4B32A] block">
              SCHEDULE & VENUE
            </span>
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-[#C1272D] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-white">January 2027</strong>
                  <span>Date & Showtime TBA</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-white">Amani Palladium Theatre</strong>
                  <span>LSPR Bekasi, Indonesia (Transpark Juanda)</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Ticket className="w-4 h-4 text-[#F4B32A] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-white">Auditorium Capacity</strong>
                  <span>300 Seats (225 Main Floor + 75 Balcony)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Col 4: Committee Hotline (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-[#F4B32A] block">
              HOTLINE & SUPPORT
            </span>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              Have questions regarding seat reservations or transfer confirmations?
            </p>
            <a
              href="https://wa.me/6281915348866"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold bg-[#25D366] hover:bg-[#20ba59] text-white px-3.5 py-2 rounded-xl transition-all shadow-sm"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>0819-1534-8866</span>
            </a>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Attribution */}
        <div className="pt-8 border-t border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-medium">
          <div>
            © 2027 <strong>Chords of Comfort</strong> • LSPR COMM30-6SP. All rights reserved.
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <span>The 35th LSPR Theater Festival • LSPR Institute of Communication & Business</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
