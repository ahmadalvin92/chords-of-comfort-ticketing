'use client';

import React from 'react';
import Image from 'next/image';
import { Calendar, Clock, MapPin, Ticket, Flame, Star, Sparkles } from 'lucide-react';

interface HeroSectionProps {
  onSelectSeatsClick: () => void;
}

export default function HeroSection({ onSelectSeatsClick }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden pt-8 pb-16 md:py-20 bg-[#FAF6ED] border-b-4 border-[#0F1C30]">
      {/* Decorative American High School Background Grids & Dots */}
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#182B49_1px,transparent_1px)] [background-size:16px_16px]" />

      {/* Floating Varsity Mascot / Sticker Elements */}
      <div className="absolute top-12 left-6 hidden lg:block -rotate-12 pointer-events-none opacity-85 select-none">
        <div className="bg-[#C1272D] text-[#FAF6ED] font-bebas text-lg px-3 py-1 rounded-md border-2 border-[#0F1C30] shadow-[0_4px_0_#0F1C30] flex items-center gap-1.5">
          <Star className="w-4 h-4 text-[#F4B32A] fill-[#F4B32A]" />
          <span>THE 35TH LSPR THEATER FESTIVAL</span>
        </div>
      </div>

      <div className="absolute bottom-16 right-8 hidden lg:block rotate-6 pointer-events-none opacity-90 select-none">
        <div className="bg-[#182B49] text-[#FAF6ED] font-bebas text-base px-3.5 py-1.5 rounded-md border-2 border-[#F4B32A] shadow-[0_4px_0_#0F1C30] flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#F4B32A]" />
          <span>OFFICIAL STAGE PRODUCTION</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

          {/* Left Column: Headlines & Call to Actions */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">

            {/* Top Pill / Badge */}
            <div className="inline-flex items-center gap-2 bg-[#F4B32A] text-[#0F1C30] px-3.5 py-1.5 rounded-full border-2 border-[#0F1C30] font-bebas text-sm sm:text-base tracking-wider shadow-[0_2px_0_#0F1C30]">
              <Flame className="w-4 h-4 fill-[#0F1C30] text-[#0F1C30]" />
              <span>COMM30-6SP PRESENTS • THE 35TH LSPR THEATER FESTIVAL</span>
            </div>

            {/* Main Title Banner with Retro Cutout Styling */}
            <div className="space-y-2">
              <h1 className="font-bebas text-5xl sm:text-7xl lg:text-8xl tracking-wider text-[#182B49] leading-[0.9] drop-shadow-[0_2px_0_#FAF6ED]">
                CHORDS OF <span className="text-[#C1272D] italic underline decoration-[#F4B32A] decoration-4">COMFORT</span>
              </h1>

              <div className="font-bebas text-xl sm:text-2xl text-[#C1272D] tracking-widest uppercase">
                A MUSICAL THEATER PRODUCTION
              </div>
            </div>

            {/* Tagline & Official Hero Synopsis */}
            <div className="space-y-3">
              <p className="font-bebas text-2xl sm:text-3xl text-[#182B49] leading-tight tracking-wide">
                “Where Love, Friendship, and Dreams Find Their Way Home.”
              </p>

              <p className="text-slate-700 text-sm sm:text-base leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium">
                A heartwarming musical theater production about love, friendship, unexpected connections, and finding comfort through life’s greatest challenges.
              </p>
            </div>

            {/* Production Schedule & Venue Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 max-w-lg mx-auto lg:mx-0">
              <div className="bg-white p-3.5 rounded-2xl border-2 border-[#0F1C30] shadow-[0_4px_0_#0F1C30] flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FAF6ED] border border-[#0F1C30] flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5 text-[#C1272D]" />
                </div>
                <div className="text-left">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">SCHEDULE</div>
                  <div className="font-bebas text-lg text-[#182B49] leading-tight">January 2027</div>
                  <div className="text-[11px] font-semibold text-slate-600">Showtime TBA (Gate TBA)</div>
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border-2 border-[#0F1C30] shadow-[0_4px_0_#0F1C30] flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FAF6ED] border border-[#0F1C30] flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">LOCATION</div>
                  <div className="font-bebas text-lg text-[#182B49] leading-tight">Amani Palladium Theatre</div>
                  <div className="text-[11px] font-semibold text-slate-600">LSPR Bekasi, Indonesia</div>
                </div>
              </div>
            </div>

            {/* Official Date Notice / Milestone Badge */}
            <div className="bg-[#182B49] text-white p-4 rounded-2xl border-3 border-[#0F1C30] shadow-[0_4px_0_#0F1C30] max-w-lg mx-auto lg:mx-0 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#C1272D] border-2 border-[#F4B32A] flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-[#F4B32A]" />
                </div>
                <div className="text-left">
                  <div className="font-bebas text-base text-[#F4B32A] leading-tight">
                    COMING JANUARY 2027
                  </div>
                  <div className="text-xs text-slate-300 font-medium">
                    Official Date & Showtime Announcements Coming Soon • Booking Open
                  </div>
                </div>
              </div>
              <span className="font-bebas text-xs bg-[#F4B32A] text-[#0F1C30] px-2.5 py-1 rounded-md shrink-0">
                LSPR BEKASI
              </span>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={onSelectSeatsClick}
                className="w-full sm:w-auto cursor-pointer inline-flex items-center justify-center gap-2.5 bg-[#C1272D] hover:bg-[#a61f25] text-white px-8 py-4 rounded-2xl font-bebas text-xl sm:text-2xl tracking-wider border-3 border-[#0F1C30] shadow-[0_6px_0_#0F1C30] hover:translate-y-0.5 active:translate-y-1 transition-all"
              >
                <Ticket className="w-6 h-6 text-[#F4B32A]" />
                <span>SELECT YOUR SEATS</span>
              </button>

              <a
                href="#about"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-[#FAF6ED] text-[#182B49] px-6 py-4 rounded-2xl font-bebas text-xl sm:text-2xl tracking-wider border-3 border-[#0F1C30] shadow-[0_6px_0_#0F1C30] hover:translate-y-0.5 active:translate-y-1 transition-all"
              >
                <span>VIEW STORY & CAST</span>
              </a>
            </div>

          </div>

          {/* Right Column: High School Varsity Poster Mockup */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-sm sm:max-w-md">

              {/* Retro Paper Drop Background */}
              <div className="absolute inset-0 bg-[#F4B32A] rounded-3xl rotate-3 border-4 border-[#0F1C30] shadow-[0_8px_0_#0F1C30]" />

              {/* Main Card Frame */}
              <div className="relative bg-white p-4 rounded-3xl -rotate-2 border-4 border-[#0F1C30] shadow-[0_8px_0_#0F1C30] space-y-4">

                {/* Poster Photo with Pin Effect */}
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border-2 border-[#0F1C30] bg-slate-900">
                  <Image
                    src="/assets/cast-photo.jpeg"
                    alt="Chords of Comfort Cast"
                    fill
                    sizes="(max-width: 768px) 100vw, 450px"
                    className="object-cover object-top hover:scale-105 transition-transform duration-500"
                    priority
                  />

                  {/* Corner Ribbon / Stamp */}
                  <div className="absolute top-3 right-3 bg-[#C1272D] text-[#FAF6ED] border-2 border-[#0F1C30] px-3 py-1 rounded-lg font-bebas text-sm shadow-md rotate-6">
                    ★ LSPR BEKASI
                  </div>

                  <div className="absolute bottom-3 left-3 bg-[#182B49]/90 backdrop-blur-xs text-[#FAF6ED] border border-white/20 px-3 py-1.5 rounded-xl text-xs font-semibold">
                    The 35th LSPR Theater Festival
                  </div>
                </div>

                {/* Bottom Ticket Pass Snippet */}
                <div className="bg-[#FAF6ED] p-3 rounded-xl border-2 border-dashed border-[#0F1C30] flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      ADMISSION PASS
                    </div>
                    <div className="font-bebas text-lg text-[#182B49] leading-tight">
                      300 SEATS TOTAL CAPACITY
                    </div>
                  </div>
                  <div className="font-bebas text-xl text-[#C1272D]">
                    FROM RP 35.000
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
