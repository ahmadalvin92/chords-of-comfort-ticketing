'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, MessageCircle, MapPin, Sparkles, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0F1C30] text-white border-t-4 border-[#F4B32A] pt-14 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
          
          {/* Col 1: Brand */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#C1272D] border border-[#F4B32A] flex items-center justify-center font-bebas text-xl text-[#FAF6ED]">
                6SP
              </div>
              <div>
                <span className="font-bebas text-2xl tracking-wider text-[#F4B32A] flex items-center gap-1.5">
                  COMM30-6SP THEATER PRODUCTION <Sparkles className="w-4 h-4 text-amber-300" />
                </span>
                <p className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
                  LSPR Institute of Communication & Business
                </p>
              </div>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed max-w-md font-medium">
              Sistem reservasi tiket daring resmi pementasan teater musikal angkatan COMM30-6SP. 
              Didukung sistem pemilihan nomor kursi interaktif 400 seat, pembayaran instan QRIS / Virtual Account, 
              serta validasi QR Code di gate acara.
            </p>

            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-[#C1272D] flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                title="Instagram"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href="https://wa.me/6281234567890"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-emerald-600 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                title="WhatsApp Panitia Ticketing"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-3">
            <h4 className="font-bebas text-lg text-[#F4B32A] tracking-wider">NAVIGASI</h4>
            <ul className="space-y-2 text-xs font-semibold text-slate-400">
              <li>
                <a href="#about" className="hover:text-white transition-colors">
                  Tentang Acara
                </a>
              </li>
              <li>
                <a href="#categories" className="hover:text-white transition-colors">
                  Kategori & Harga Tiket
                </a>
              </li>
              <li>
                <a href="#seating" className="hover:text-white transition-colors">
                  Peta Kursi (400 Seat)
                </a>
              </li>
              <li>
                <Link href="/admin" className="hover:text-emerald-400 transition-colors flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Dashboard Panitia
                </Link>
              </li>
              <li>
                <Link href="/scanner" className="hover:text-amber-400 transition-colors">
                  Mobile QR Gate Scanner
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Venue Information */}
          <div className="space-y-3">
            <h4 className="font-bebas text-lg text-[#F4B32A] tracking-wider">LOKASI VENUE</h4>
            <div className="space-y-2 text-xs text-slate-400 font-medium">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#C1272D] shrink-0 mt-0.5" />
                <span>Auditorium LSPR Sudirman Park, Lantai 2, Jakarta Pusat</span>
              </div>
              <p className="text-[11px] text-slate-500 pt-1">
                Kapasitas maksimal venue: 400 kursi berpendingin ruangan dengan tata suara panggung stereo.
              </p>
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500 font-medium">
          <div>
            © 2026 LSPR COMM30-6SP Musical Theater. Hak Cipta Dilindungi Undang-Undang.
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            Dibuat dengan <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" /> oleh Mahasiswa LSPR
          </div>
        </div>

      </div>
    </footer>
  );
}
