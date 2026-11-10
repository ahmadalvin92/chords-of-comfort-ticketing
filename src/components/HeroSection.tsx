'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Calendar, Clock, MapPin, Ticket, Flame, Star, Sparkles } from 'lucide-react';

interface HeroSectionProps {
  onSelectSeatsClick: () => void;
}

export default function HeroSection({ onSelectSeatsClick }: HeroSectionProps) {
  // Countdown timer to event date (Dec 19, 2026 18:30 WIB)
  const [timeLeft, setTimeLeft] = useState({
    days: 35,
    hours: 14,
    minutes: 20,
    seconds: 45,
  });

  useEffect(() => {
    const targetDate = new Date('2026-12-19T18:30:00+07:00').getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative overflow-hidden pt-8 pb-16 md:py-20 bg-[#F4EFE6] border-b-4 border-[#0F1C30]">
      {/* Decorative background grid & doodle stars */}
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#182B49_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Floating Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 bg-[#FAF6ED] px-4 py-2 rounded-full border-2 border-[#182B49] shadow-[0_3px_0_#182B49] -rotate-1 hover:rotate-0 transition-transform">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-[#182B49]">
              COMM30-6SP • OFFICIAL THEATER PRODUCTION
            </span>
            <Star className="w-4 h-4 fill-[#F4B32A] text-[#F4B32A]" />
          </div>
        </div>

        {/* Main Grid: Headline & Collage Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Typography & Info */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            <div className="space-y-2">
              <span className="inline-block bg-[#F4B32A] text-[#0F1C30] font-bebas text-xl sm:text-2xl px-3 py-1 rounded border-2 border-[#0F1C30] -rotate-2 shadow-[0_2px_0_#0F1C30]">
                LSPR INSTITUTE OF COMMUNICATION & BUSINESS
              </span>
              <h1 className="font-bebas text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight text-[#182B49] leading-[0.9] drop-shadow-sm uppercase">
                CHORDS OF <span className="text-[#C1272D] underline decoration-[#F4B32A] decoration-wavy decoration-4">COMFORT</span>
              </h1>
              <p className="font-bebas text-2xl sm:text-3xl tracking-wide text-slate-700">
                A MUSICAL THEATER PRODUCTION • COMM30-6SP LSPR
              </p>
            </div>

            <p className="text-slate-600 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed">
              Saksikan persembahan panggung musikal teater spektakuler penuh drama, tarian, dan nostalgia masa SMA. 
              Sistem pembelian tiket resmi terintegrasi dengan denah kursi visual interaktif dan konfirmasi instan via email.
            </p>

            {/* Event Key Details Cards (Collage Scrapbook Style) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              
              <div className="bg-[#FAF6ED] p-3.5 rounded-xl border-2 border-[#182B49] shadow-[0_3px_0_#182B49] text-left relative overflow-hidden group">
                <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center mb-2 text-amber-700">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tanggal Main</div>
                <div className="font-bebas text-lg text-[#182B49] leading-tight">Sabtu, 19 Des 2026</div>
              </div>

              <div className="bg-[#FAF6ED] p-3.5 rounded-xl border-2 border-[#182B49] shadow-[0_3px_0_#182B49] text-left relative overflow-hidden group">
                <div className="w-8 h-8 rounded-lg bg-rose-100 border border-rose-300 flex items-center justify-center mb-2 text-rose-700">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Waktu Acara</div>
                <div className="font-bebas text-lg text-[#182B49] leading-tight">18:30 WIB (Gate 17:00)</div>
              </div>

              <div className="bg-[#FAF6ED] p-3.5 rounded-xl border-2 border-[#182B49] shadow-[0_3px_0_#182B49] text-left relative overflow-hidden group">
                <div className="w-8 h-8 rounded-lg bg-blue-100 border border-blue-300 flex items-center justify-center mb-2 text-blue-700">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Lokasi Venue</div>
                <div className="font-bebas text-lg text-[#182B49] leading-tight">LSPR Sudirman Park</div>
              </div>

            </div>

            {/* CTA Buttons & Micro badges */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-3 justify-center lg:justify-start">
              <button
                onClick={onSelectSeatsClick}
                className="w-full sm:w-auto cursor-pointer bg-[#C1272D] hover:bg-[#a61f25] text-[#FAF6ED] px-8 py-4 rounded-xl font-bebas text-2xl tracking-wider border-3 border-[#0F1C30] shadow-[0_5px_0_#0F1C30] hover:translate-y-1 hover:shadow-[0_2px_0_#0F1C30] transition-all flex items-center justify-center gap-3"
              >
                <Ticket className="w-6 h-6 text-[#F4B32A]" />
                PILIH KURSI SEKARANG (400 SEATS)
              </button>

              <a
                href="#categories"
                className="w-full sm:w-auto text-center bg-[#FAF6ED] hover:bg-white text-[#182B49] px-6 py-4 rounded-xl font-bebas text-xl tracking-wider border-3 border-[#182B49] shadow-[0_5px_0_#182B49] hover:translate-y-1 hover:shadow-[0_2px_0_#182B49] transition-all"
              >
                LIHAT TIKET & HARGA
              </a>
            </div>

            {/* Quick Live Guarantee */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-600 justify-center lg:justify-start pt-2">
              <span className="flex items-center gap-1.5 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full border border-emerald-300">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Sistem Anti Double-Booking Aktif
              </span>
              <span className="flex items-center gap-1.5 bg-blue-100 text-blue-800 px-3 py-1 rounded-full border border-blue-300">
                ⚡ Instant E-Ticket Delivery
              </span>
              <span className="flex items-center gap-1.5 bg-amber-100 text-amber-800 px-3 py-1 rounded-full border border-amber-300">
                🛡️ QRIS & Virtual Account Resmi
              </span>
            </div>

          </div>

          {/* Right Column: Polaroid Collage & Wristband Aesthetic */}
          <div className="lg:col-span-5 relative flex justify-center">
            
            {/* Scrapbook Tape Top */}
            <div className="relative w-full max-w-md">
              
              {/* Tape sticker */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-32 h-8 bg-amber-100/80 backdrop-blur-sm border-x-2 border-dashed border-amber-400 rotate-2 z-20 shadow-sm" />

              {/* Main Polaroid Frame */}
              <div className="bg-white p-4 pb-6 rounded-2xl border-4 border-[#0F1C30] shadow-[0_8px_0_#0F1C30] -rotate-1 hover:rotate-0 transition-transform duration-300">
                
                {/* Image of Cast */}
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden border-2 border-[#0F1C30] bg-slate-900">
                  <Image
                    src="/assets/cast-photo.jpeg"
                    alt="LSPR COMM30-6SP Cast"
                    fill
                    className="object-cover object-top hover:scale-105 transition-transform duration-500"
                    priority
                  />
                  
                  {/* Floating Admit One badge */}
                  <div className="absolute bottom-3 right-3 bg-[#C1272D] text-[#FAF6ED] px-3 py-1 rounded-lg border-2 border-[#F4B32A] font-bebas text-lg rotate-3 shadow-md">
                    ADMIT ONE #COMM30-6SP
                  </div>
                </div>

                {/* Polaroid Bottom Note */}
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-bebas text-2xl text-[#182B49] leading-tight">
                      MEET THE 6SP SQUAD
                    </h3>
                    <p className="text-xs font-semibold text-slate-500">
                      Behind every hallway drama, there is a song to sing.
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-[#F4B32A] border-2 border-[#0F1C30] flex items-center justify-center font-bebas text-xl text-[#0F1C30] shadow-sm rotate-6">
                    #1
                  </div>
                </div>

                {/* Countdown Timer Inside Collage */}
                <div className="mt-4 pt-3 border-t-2 border-dashed border-slate-200">
                  <div className="text-[11px] font-black uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-red-500 inline fill-red-500" />
                    Hitung Mundur Pementasan:
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="bg-[#FAF6ED] py-1.5 rounded-lg border border-slate-300">
                      <div className="font-bebas text-2xl text-[#C1272D] leading-none">{timeLeft.days}</div>
                      <div className="text-[9px] font-bold text-slate-500 uppercase">Hari</div>
                    </div>
                    <div className="bg-[#FAF6ED] py-1.5 rounded-lg border border-slate-300">
                      <div className="font-bebas text-2xl text-[#182B49] leading-none">{timeLeft.hours}</div>
                      <div className="text-[9px] font-bold text-slate-500 uppercase">Jam</div>
                    </div>
                    <div className="bg-[#FAF6ED] py-1.5 rounded-lg border border-slate-300">
                      <div className="font-bebas text-2xl text-[#182B49] leading-none">{timeLeft.minutes}</div>
                      <div className="text-[9px] font-bold text-slate-500 uppercase">Menit</div>
                    </div>
                    <div className="bg-[#FAF6ED] py-1.5 rounded-lg border border-slate-300">
                      <div className="font-bebas text-2xl text-[#182B49] leading-none">{timeLeft.seconds}</div>
                      <div className="text-[9px] font-bold text-slate-500 uppercase">Detik</div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Floating Varsity Tag (Bottom Left) */}
              <div className="absolute -bottom-5 -left-4 bg-[#F4B32A] text-[#0F1C30] px-4 py-1.5 rounded-lg border-2 border-[#0F1C30] font-bebas text-lg shadow-[0_3px_0_#0F1C30] -rotate-6">
                ★ SUDIIRMAN PARK
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

