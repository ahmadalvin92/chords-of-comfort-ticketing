'use client';

import React from 'react';
import Image from 'next/image';
import {
  MapPin,
  Clock,
  Sparkles,
  Ticket,
  AlertTriangle,
  Award,
  Music,
  Heart,
  Users,
} from 'lucide-react';

export default function AboutSection() {
  return (
    <section id="about" className="py-20 bg-[#F4EFE6] border-b-4 border-[#0F1C30] relative overflow-hidden">
      
      {/* Tape Decoration */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-[#FAF6ED] px-4 py-1.5 rounded-full border-2 border-[#182B49] shadow-[0_2px_0_#182B49] text-xs font-black uppercase tracking-widest text-[#182B49] -rotate-1 mb-3">
            <Sparkles className="w-4 h-4 text-amber-500" />
            TENTANG PRODUKSI & ACARA
          </div>
          <h2 className="font-bebas text-4xl sm:text-5xl lg:text-6xl text-[#182B49] leading-tight">
            CHORDS OF COMFORT
          </h2>
          <p className="text-slate-600 font-medium text-base sm:text-lg">
            Karya teater musikal orisinal karya mahasiswa LSPR Institute of Communication & Business angkatan COMM30-6SP.
          </p>
        </div>

        {/* 2-Column Story & Visual Collage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
          
          {/* Left: Scrapbook Polaroid & Poster */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="relative bg-white p-4 pb-6 rounded-2xl border-4 border-[#0F1C30] shadow-[0_8px_0_#0F1C30] rotate-1 hover:rotate-0 transition-transform">
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden border-2 border-[#0F1C30]">
                <Image
                  src="/assets/cast-photo.jpeg"
                  alt="Cast of LSPR Theater"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <h4 className="font-bebas text-2xl text-[#182B49] leading-none">
                    MEMORIES OF THE HALLWAY
                  </h4>
                  <p className="text-xs font-bold text-slate-500 mt-0.5">
                    An American High School Musical Story
                  </p>
                </div>
                <span className="bg-[#F4B32A] text-[#0F1C30] px-3 py-1 rounded font-bebas text-sm border border-[#0F1C30]">
                  LSPR 2026
                </span>
              </div>
            </div>

            {/* Wristband info banner */}
            <div className="bg-[#182B49] text-white p-5 rounded-2xl border-3 border-[#F4B32A] shadow-[0_4px_0_#0F1C30] flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#C1272D] flex items-center justify-center shrink-0 border border-[#F4B32A]">
                <Ticket className="w-6 h-6 text-[#F4B32A]" />
              </div>
              <div>
                <h5 className="font-bebas text-lg text-[#F4B32A] leading-tight">
                  PENUKARAN WRISTBAND & ADMIT-ONE
                </h5>
                <p className="text-xs text-slate-300 font-medium">
                  Tunjukkan QR Code E-Ticket di meja registrasi untuk mendapatkan wristband resmi dan akses masuk venue.
                </p>
              </div>
            </div>

          </div>

          {/* Right: Story & Production Details */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="bg-white p-6 sm:p-8 rounded-3xl border-3 border-[#0F1C30] shadow-[0_6px_0_#0F1C30] space-y-4">
              <h3 className="font-bebas text-3xl sm:text-4xl text-[#182B49]">
                SINOPSIS: MIMPI, PERSAHABATAN & CINTA DI KORIDOR KAMPUS
              </h3>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Di tengah dinamika kehidupan sekolah bergaya Amerika yang penuh warna, kelompok anak muda berjuang mengejar panggung impian mereka. Menghadirkan deretan lagu orisinal, tarian penuh energi, serta koreografi yang dirancang khusus untuk memukau penonton di panggung megah LSPR Sudirman Park.
              </p>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Produksi ini dipersiapkan dengan dedikasi penuh oleh tim COMM30-6SP mulai dari tata panggung, kostum varsity retro, pencahayaan panggung broadway, hingga sistem audio stereo mutakhir.
              </p>

              {/* Quick Pillars */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t-2 border-dashed border-slate-200">
                <div className="text-center p-3 rounded-xl bg-[#FAF6ED] border border-slate-300">
                  <Music className="w-5 h-5 mx-auto text-[#C1272D] mb-1" />
                  <div className="font-bebas text-lg text-[#182B49]">15+ LAGU</div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Live Performance</div>
                </div>
                <div className="text-center p-3 rounded-xl bg-[#FAF6ED] border border-slate-300">
                  <Users className="w-5 h-5 mx-auto text-blue-600 mb-1" />
                  <div className="font-bebas text-lg text-[#182B49]">30+ CAST</div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase">& Dancer Squad</div>
                </div>
                <div className="text-center p-3 rounded-xl bg-[#FAF6ED] border border-slate-300">
                  <Award className="w-5 h-5 mx-auto text-amber-600 mb-1" />
                  <div className="font-bebas text-lg text-[#182B49]">BROADWAY</div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Stage Setup</div>
                </div>
              </div>
            </div>

            {/* Venue Location & Access Note */}
            <div className="bg-[#FAF6ED] p-5 rounded-2xl border-2 border-[#182B49] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-700 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bebas text-lg text-[#182B49] leading-none">
                    LSPR SUDIRMAN PARK AUDITORIUM
                  </div>
                  <p className="text-xs text-slate-600 font-medium">
                    Jl. K.H. Mas Mansyur Kav. 35, Karet Tengsin, Tanah Abang, Jakarta Pusat
                  </p>
                </div>
              </div>
              <a
                href="https://maps.google.com/?q=LSPR+Sudirman+Park"
                target="_blank"
                rel="noreferrer"
                className="bg-[#182B49] text-white text-xs font-bold px-4 py-2 rounded-lg border border-[#0F1C30] hover:bg-[#C1272D] transition-colors shrink-0"
              >
                Buka Google Maps
              </a>
            </div>

          </div>

        </div>

        {/* Attendee Terms & Protocol Cards */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border-3 border-[#0F1C30] shadow-[0_6px_0_#0F1C30]">
          <h4 className="font-bebas text-2xl text-[#182B49] mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[#C1272D]" />
            KETENTUAN PENTING BAGI PENONTON
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600 font-medium">
            <div className="p-4 rounded-xl bg-[#FAF6ED] border border-slate-200">
              <strong className="block text-[#182B49] font-bold mb-1">1. Tepat Waktu (Open Gate)</strong>
              Pintu masuk dibuka pukul 17:00 WIB dan ditutup pukul 18:15 WIB. Penonton yang terlambat hanya dapat masuk saat jeda lagu untuk menjaga kenyamanan pertunjukan.
            </div>
            <div className="p-4 rounded-xl bg-[#FAF6ED] border border-slate-200">
              <strong className="block text-[#182B49] font-bold mb-1">2. Satu Tiket Satu Orang</strong>
              Setiap QR Code bersifat unik dan hanya berlaku untuk 1 kali pemindaian di pintu masuk. Jangan menyebarkan kode QR Anda kepada orang lain.
            </div>
            <div className="p-4 rounded-xl bg-[#FAF6ED] border border-slate-200">
              <strong className="block text-[#182B49] font-bold mb-1">3. Dress Code Retro School</strong>
              Disarankan mengenakan pakaian dengan sentuhan *American High School*, *Varsity Jacket*, atau nuansa warna *Navy & Red* untuk meramaikan suasana teater!
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

