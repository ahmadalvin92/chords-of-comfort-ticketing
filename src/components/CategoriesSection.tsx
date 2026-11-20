'use client';

import React from 'react';
import { Sparkles, Check, ArrowRight } from 'lucide-react';

interface CategoriesSectionProps {
  onSelectCategory: (category: string) => void;
}

export default function CategoriesSection({ onSelectCategory }: CategoriesSectionProps) {
  return (
    <section id="categories" className="py-16 bg-[#FAF6ED] border-b-4 border-[#0F1C30]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 bg-[#F4B32A] text-[#0F1C30] font-bebas text-sm px-3 py-1 rounded-md border-2 border-[#0F1C30] tracking-wider">
            TICKET TIERS & PRICING
          </div>
          <h2 className="font-bebas text-4xl sm:text-5xl text-[#182B49] tracking-wider">
            SELECT YOUR SEATING TIER
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            300 total capacity across Main Floor and Balcony levels. All tickets include official collectible wristband admission stubs.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">

          {/* VIP Main Floor */}
          <div className="relative bg-white rounded-3xl border-4 border-[#0F1C30] shadow-[0_8px_0_#0F1C30] p-6 space-y-6 flex flex-col justify-between hover:-translate-y-1 transition-transform opacity-95">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bebas text-xs px-2.5 py-1 rounded bg-[#C1272D] text-white border border-[#0F1C30]">
                  MAIN FLOOR • ROWS A & B
                </span>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  RESERVED (20 SEATS)
                </span>
              </div>

              <div>
                <h3 className="font-bebas text-3xl text-[#182B49] leading-tight">
                  VIP MAIN FLOOR
                </h3>
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-block bg-[#C1272D]/10 text-[#C1272D] font-bebas text-sm sm:text-base px-3 py-1 rounded-md border border-[#C1272D]/30 tracking-wider">
                    RESERVED • INVITATION ONLY
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-2 font-medium">
                  Reserved exclusively for guest stars, VIP dignitaries, and production committee. Not available for online purchase.
                </p>
              </div>

              <ul className="space-y-2 text-xs text-slate-600 border-t-2 border-dashed border-slate-200 pt-4">
                <li className="flex items-center gap-2 font-medium">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Front-row stage view (Center Rows A & B)</span>
                </li>
                <li className="flex items-center gap-2 font-medium">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Official commemorative wristband pass</span>
                </li>
                <li className="flex items-center gap-2 font-medium">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Priority fast-track venue gate entry</span>
                </li>
              </ul>
            </div>

            <div className="w-full bg-slate-100 text-slate-400 py-3 rounded-xl font-bebas text-lg tracking-wider border-2 border-slate-300 flex items-center justify-center gap-2 cursor-not-allowed select-none">
              <span>RESERVED (INVITATION ONLY)</span>
            </div>
          </div>

          {/* VIP Balcony */}
          <div className="relative bg-white rounded-3xl border-4 border-[#0F1C30] shadow-[0_8px_0_#0F1C30] p-6 space-y-6 flex flex-col justify-between hover:-translate-y-1 transition-transform">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bebas text-xs px-2.5 py-1 rounded bg-[#C1272D] text-white border border-[#0F1C30]">
                  BALCONY • ROW AA
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  9 SEATS AVAILABLE
                </span>
              </div>

              <div>
                <h3 className="font-bebas text-3xl text-[#182B49] leading-tight">
                  VIP BALCONY
                </h3>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-xs font-bold text-slate-400">Rp</span>
                  <span className="font-bebas text-4xl text-[#C1272D]">50.000</span>
                  <span className="text-xs font-medium text-slate-500">/ pass</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-2 font-medium">
                  Front-row balcony seating with unobstructed panoramic stage viewing. Includes official collectible festival stub.
                </p>
              </div>

              <ul className="space-y-2 text-xs text-slate-600 border-t-2 border-dashed border-slate-200 pt-4">
                <li className="flex items-center gap-2 font-medium">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Elevated panoramic front-balcony perspective (Row AA)</span>
                </li>
                <li className="flex items-center gap-2 font-medium">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Official commemorative wristband pass</span>
                </li>
                <li className="flex items-center gap-2 font-medium">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Priority fast-track venue gate entry</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onSelectCategory('VIP BALCONY')}
              className="w-full cursor-pointer bg-[#C1272D] hover:bg-[#a61f25] text-white py-3 rounded-xl font-bebas text-lg tracking-wider border-2 border-[#0F1C30] shadow-[0_3px_0_#0F1C30] flex items-center justify-center gap-2 transition-all active:translate-y-0.5"
            >
              <span>CHOOSE VIP BALCONY</span>
              <ArrowRight className="w-4 h-4 text-[#F4B32A]" />
            </button>
          </div>

          {/* Regular Theater Pass */}
          <div className="relative bg-white rounded-3xl border-4 border-[#0F1C30] shadow-[0_8px_0_#0F1C30] p-6 space-y-6 flex flex-col justify-between hover:-translate-y-1 transition-transform">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bebas text-xs px-2.5 py-1 rounded bg-[#182B49] text-white border border-[#0F1C30]">
                  MAIN FLOOR & BALCONY
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  271 SEATS AVAILABLE
                </span>
              </div>

              <div>
                <h3 className="font-bebas text-3xl text-[#182B49] leading-tight">
                  REGULAR PASS
                </h3>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-xs font-bold text-slate-400">Rp</span>
                  <span className="font-bebas text-4xl text-[#182B49]">35.000</span>
                  <span className="text-xs font-medium text-slate-500">/ pass</span>
                </div>
              </div>

              <ul className="space-y-2 text-xs text-slate-600 border-t-2 border-dashed border-slate-200 pt-4">
                <li className="flex items-center gap-2 font-medium">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Standard auditorium seating (Main Floor or Balcony)</span>
                </li>
                <li className="flex items-center gap-2 font-medium">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Official commemorative wristband pass</span>
                </li>
                <li className="flex items-center gap-2 font-medium">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Full access to live stage musical & musical numbers</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onSelectCategory('REGULAR')}
              className="w-full cursor-pointer bg-[#F4B32A] hover:bg-amber-400 text-[#0F1C30] py-3 rounded-xl font-bebas text-lg tracking-wider border-2 border-[#0F1C30] shadow-[0_3px_0_#0F1C30] flex items-center justify-center gap-2 transition-all active:translate-y-0.5"
            >
              <span>CHOOSE REGULAR PASS</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
}
