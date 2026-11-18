'use client';

import React, { useState, useMemo } from 'react';
import { Seat, TicketCategory } from '@/types/ticket';
import { CATEGORY_INFO } from '@/data/initialSeats';
import {
  Lock,
  Check,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Ticket,
  ChevronRight,
  Info,
} from 'lucide-react';

interface SeatPlanProps {
  seats: Seat[];
  selectedSeatIds: string[];
  onToggleSeat: (seat: Seat) => void;
  onProceedToCheckout: () => void;
  activeFilter?: TicketCategory | 'ALL';
  onFilterChange: (cat: TicketCategory | 'ALL') => void;
  isLoading?: boolean;
}

export default function SeatPlan({
  seats,
  selectedSeatIds,
  onToggleSeat,
  onProceedToCheckout,
  activeFilter = 'ALL',
  onFilterChange,
  isLoading = false,
}: SeatPlanProps) {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [hoveredSeat, setHoveredSeat] = useState<Seat | null>(null);

  // Group Main Floor seats by Row (A to H)
  const mainFloorRows = useMemo(() => {
    const rowNames = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    return rowNames.map((row) => {
      const rowSeats = seats.filter((s) => s.section === 'MAIN_FLOOR' && s.row === row);
      const left = rowSeats.filter((s) => s.block === 'LEFT').sort((a, b) => a.number - b.number);
      const center = rowSeats.filter((s) => s.block === 'CENTER').sort((a, b) => a.number - b.number);
      const right = rowSeats.filter((s) => s.block === 'RIGHT').sort((a, b) => a.number - b.number);
      return { row, left, center, right };
    });
  }, [seats]);

  // Group Balcony seats by Row (AA, AB, AC)
  const balconyRows = useMemo(() => {
    const rowNames = ['AA', 'AB', 'AC'];
    return rowNames.map((row) => {
      const rowSeats = seats.filter((s) => s.section === 'BALCONY' && s.row === row);
      const left = rowSeats.filter((s) => s.block === 'LEFT').sort((a, b) => a.number - b.number);
      const center = rowSeats.filter((s) => s.block === 'CENTER').sort((a, b) => a.number - b.number);
      const right = rowSeats.filter((s) => s.block === 'RIGHT').sort((a, b) => a.number - b.number);
      return { row, left, center, right };
    });
  }, [seats]);

  // Calculate selected seats total
  const selectedSeats = useMemo(() => {
    return seats.filter((s) => selectedSeatIds.includes(s.id));
  }, [seats, selectedSeatIds]);

  const totalPrice = useMemo(() => {
    return selectedSeats.reduce((sum, s) => sum + s.price, 0);
  }, [selectedSeats]);

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(Math.max(0.7, prev + delta), 1.4));
  };

  const getSeatColorClass = (seat: Seat) => {
    const isSelected = selectedSeatIds.includes(seat.id);

    if (isSelected) {
      return 'bg-white text-slate-900 ring-4 ring-cyan-400 font-black shadow-lg scale-110 z-20';
    }

    if (seat.status === 'sold') {
      return 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-60 border-slate-400';
    }

    if (seat.status === 'held') {
      return 'bg-amber-300 text-amber-900 border-amber-500 animate-pulse cursor-not-allowed';
    }

    const matchesFilter = activeFilter === 'ALL' || seat.category === activeFilter;
    const filterDimmed = !matchesFilter ? 'opacity-25' : 'opacity-100 hover:scale-115 hover:z-20';

    if (seat.category === 'VIP' || seat.category === 'VIP_BALCONY') {
      // Coral/Red VIP as in official design
      return `bg-[#E04D65] text-white border-[#B83248] hover:bg-[#c93b52] ${filterDimmed}`;
    }

    // Regular Blue
    return `bg-[#3B82F6] text-white border-[#1D4ED8] hover:bg-[#2563EB] ${filterDimmed}`;
  };

  return (
    <section id="seating" className="py-16 bg-[#182B49] text-white relative overflow-hidden">
      
      {/* Background Theater Atmosphere */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-amber-200/10 via-amber-400/5 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#F4B32A] text-[#0F1C30] px-3.5 py-1 rounded-md font-bebas text-base mb-2">
              <Sparkles className="w-4 h-4" /> OFFICIAL SEATING PLAN • 300 SEATS
            </div>
            <h2 className="font-bebas text-3xl sm:text-5xl text-white tracking-wide">
              DENAH KURSI CHORDS OF COMFORT
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl font-medium">
              Pilih langsung nomor kursi di denah panggung. Main Floor (225 seats) & Balcony (75 seats).
            </p>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-2 bg-[#0F1C30] p-1.5 rounded-xl border border-slate-700 shrink-0 self-start md:self-auto">
            <button
              onClick={() => handleZoom(-0.15)}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono font-bold px-2 text-slate-300">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => handleZoom(0.15)}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Reset Zoom"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category Filters Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none">
          <span className="text-xs font-black uppercase text-slate-400 tracking-wider shrink-0 mr-1">
            Filter:
          </span>
          <button
            onClick={() => onFilterChange('ALL')}
            className={`cursor-pointer px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-lg font-bebas text-xs sm:text-sm tracking-wider border-2 transition-all shrink-0 ${
              activeFilter === 'ALL'
                ? 'bg-[#F4B32A] text-[#0F1C30] border-[#F4B32A] shadow-md'
                : 'bg-[#0F1C30] text-slate-300 border-slate-700 hover:border-slate-500'
            }`}
          >
            SEMUA KURSI (300)
          </button>
          {(Object.keys(CATEGORY_INFO) as TicketCategory[]).map((cat) => {
            const info = CATEGORY_INFO[cat];
            const isSelected = activeFilter === cat;
            return (
              <button
                key={cat}
                onClick={() => onFilterChange(cat)}
                className={`cursor-pointer px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg font-bebas text-xs sm:text-sm tracking-wider border-2 transition-all flex items-center gap-1.5 sm:gap-2 shrink-0 ${
                  isSelected
                    ? 'bg-white text-slate-900 border-white shadow-md'
                    : 'bg-[#0F1C30] text-slate-300 border-slate-700 hover:border-slate-500'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border border-black/20"
                  style={{ backgroundColor: info.color }}
                />
                {info.name} (Rp{info.price / 1000}k)
              </button>
            );
          })}
        </div>

        {/* Mobile Swipe Guidance Banner */}
        <div className="md:hidden mb-3 bg-amber-400/15 text-amber-200 border border-amber-400/30 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base animate-pulse">👈👉</span>
            <span>Geser denah ke samping untuk melihat seluruh nomor kursi</span>
          </div>
          <span className="font-mono text-[10px] bg-black/40 text-amber-300 px-2 py-0.5 rounded border border-amber-400/20">
            Geser
          </span>
        </div>

        {/* ================= SEATING CANVAS CONTAINER ================= */}
        <div className="bg-[#0b1424] rounded-2xl sm:rounded-3xl border-3 border-slate-700 shadow-2xl p-3 sm:p-8 relative overflow-x-auto min-h-[620px]">
          
          {/* Zoom Wrapper */}
          <div
            className="transition-transform duration-200 origin-top min-w-[880px] mx-auto flex flex-col items-center space-y-10"
            style={{ transform: `scale(${zoomLevel})` }}
          >

            {/* ========================================================= */}
            {/* 1. MAIN FLOOR CARD (225 SEATS TOTAL)                     */}
            {/* ========================================================= */}
            <div className="w-full max-w-4xl bg-[#FAF6ED] text-slate-900 p-6 sm:p-8 rounded-3xl border-4 border-[#0F1C30] shadow-[0_8px_0_#0F1C30] relative overflow-hidden">
              
              {/* Header inside paper card */}
              <div className="flex items-center justify-between border-b-2 border-slate-300 pb-4 mb-6">
                <div>
                  <div className="inline-block bg-[#F4B32A] text-[#0F1C30] px-3 py-0.5 rounded font-bebas text-xl border-2 border-[#0F1C30] -rotate-1 shadow-xs">
                    MAIN FLOOR — 225 SEATS TOTAL
                  </div>
                </div>

                {/* Legend badges on top-right */}
                <div className="flex items-center gap-3">
                  <div className="bg-[#E04D65] text-white px-3 py-1 rounded-lg font-bebas text-sm border border-[#0F1C30] shadow-xs">
                    20 VIP
                  </div>
                  <div className="bg-[#3B82F6] text-white px-3 py-1 rounded-lg font-bebas text-sm border border-[#0F1C30] shadow-xs">
                    205 REGULAR
                  </div>
                </div>
              </div>

              {/* Main Floor STAGE (at top) */}
              <div className="w-full max-w-md mx-auto mb-8">
                <div className="bg-[#D8C7A5] text-[#0F1C30] py-2 px-8 rounded-full border-3 border-[#0F1C30] text-center shadow-md">
                  <span className="font-bebas text-2xl tracking-[0.3em] font-black">
                    S T A G E
                  </span>
                </div>
              </div>

              {/* Rows A to H */}
              <div className="space-y-2.5">
                {mainFloorRows.map(({ row, left, center, right }) => (
                  <div key={row} className="flex items-center justify-between gap-3">
                    
                    {/* Row Label (Left) */}
                    <div className="w-8 h-8 rounded-lg bg-[#182B49] text-white flex items-center justify-center font-bebas text-lg shrink-0 border border-[#0F1C30]">
                      {row}
                    </div>

                    {/* Left Block (Seats 1-10) */}
                    <div className="flex items-center gap-1 bg-black/5 p-1 rounded-xl border border-slate-300">
                      {left.map((seat) => (
                        <button
                          key={seat.id}
                          disabled={seat.status === 'sold' || (seat.status === 'held' && !selectedSeatIds.includes(seat.id))}
                          onClick={() => onToggleSeat(seat)}
                          onMouseEnter={() => setHoveredSeat(seat)}
                          onMouseLeave={() => setHoveredSeat(null)}
                          className={`w-6 h-7 rounded text-[10px] font-bold border transition-all cursor-pointer flex items-center justify-center ${getSeatColorClass(
                            seat
                          )}`}
                          title={`${seat.label} (${seat.category}) - Rp${seat.price.toLocaleString('id-ID')}`}
                        >
                          {seat.status === 'sold' ? (
                            <Lock className="w-3 h-3 text-slate-500" />
                          ) : selectedSeatIds.includes(seat.id) ? (
                            <Check className="w-3 h-3 text-slate-900" />
                          ) : (
                            seat.number
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Center Gangway / Aisle */}
                    <div className="w-2" />

                    {/* Center Block (Seats 11-20 or empty on Row H) */}
                    <div className="flex items-center gap-1 min-w-[280px] justify-center">
                      {center.length > 0 ? (
                        <div className="flex items-center gap-1 bg-black/5 p-1 rounded-xl border border-slate-300">
                          {center.map((seat) => (
                            <button
                              key={seat.id}
                              disabled={seat.status === 'sold' || (seat.status === 'held' && !selectedSeatIds.includes(seat.id))}
                              onClick={() => onToggleSeat(seat)}
                              onMouseEnter={() => setHoveredSeat(seat)}
                              onMouseLeave={() => setHoveredSeat(null)}
                              className={`w-6 h-7 rounded text-[10px] font-bold border transition-all cursor-pointer flex items-center justify-center ${getSeatColorClass(
                                seat
                              )}`}
                              title={`${seat.label} (${seat.category}) - Rp${seat.price.toLocaleString('id-ID')}`}
                            >
                              {seat.status === 'sold' ? (
                                <Lock className="w-3 h-3 text-slate-500" />
                              ) : selectedSeatIds.includes(seat.id) ? (
                                <Check className="w-3 h-3 text-slate-900" />
                              ) : (
                                seat.number
                              )}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="text-[10px] text-slate-400 font-mono italic">
                          [ Area FOH / Sound Control ]
                        </div>
                      )}
                    </div>

                    {/* Center Gangway / Aisle */}
                    <div className="w-2" />

                    {/* Right Block (Seats 21-30 or 21-25 on Row H) */}
                    <div className="flex items-center gap-1 bg-black/5 p-1 rounded-xl border border-slate-300">
                      {right.map((seat) => (
                        <button
                          key={seat.id}
                          disabled={seat.status === 'sold' || (seat.status === 'held' && !selectedSeatIds.includes(seat.id))}
                          onClick={() => onToggleSeat(seat)}
                          onMouseEnter={() => setHoveredSeat(seat)}
                          onMouseLeave={() => setHoveredSeat(null)}
                          className={`w-6 h-7 rounded text-[10px] font-bold border transition-all cursor-pointer flex items-center justify-center ${getSeatColorClass(
                            seat
                          )}`}
                          title={`${seat.label} (${seat.category}) - Rp${seat.price.toLocaleString('id-ID')}`}
                        >
                          {seat.status === 'sold' ? (
                            <Lock className="w-3 h-3 text-slate-500" />
                          ) : selectedSeatIds.includes(seat.id) ? (
                            <Check className="w-3 h-3 text-slate-900" />
                          ) : (
                            seat.number
                          )}
                        </button>
                      ))}
                    </div>

                  </div>
                ))}
              </div>

              {/* Price legend inside Main Floor card */}
              <div className="mt-6 pt-4 border-t-2 border-dashed border-slate-300 flex items-center justify-center gap-8 text-xs font-bold text-slate-700">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-[#E04D65] border border-[#B83248]" />
                  <span>VIP • Rp50.000</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-[#3B82F6] border border-[#1D4ED8]" />
                  <span>REGULAR • Rp35.000</span>
                </div>
              </div>

            </div>

            {/* ========================================================= */}
            {/* 2. BALCONY CARD (75 SEATS TOTAL)                         */}
            {/* ========================================================= */}
            <div className="w-full max-w-4xl bg-[#FAF6ED] text-slate-900 p-6 sm:p-8 rounded-3xl border-4 border-[#0F1C30] shadow-[0_8px_0_#0F1C30] relative overflow-hidden">
              
              {/* Header inside Balcony card */}
              <div className="flex items-center justify-between border-b-2 border-slate-300 pb-4 mb-6">
                <div>
                  <div className="inline-block bg-[#F4B32A] text-[#0F1C30] px-3 py-0.5 rounded font-bebas text-xl border-2 border-[#0F1C30] rotate-1 shadow-xs">
                    BALCONY — 75 SEATS TOTAL
                  </div>
                </div>

                {/* Legend badges on top-right */}
                <div className="flex items-center gap-3">
                  <div className="bg-[#E04D65] text-white px-3 py-1 rounded-lg font-bebas text-sm border border-[#0F1C30] shadow-xs">
                    9 VIP
                  </div>
                  <div className="bg-[#3B82F6] text-white px-3 py-1 rounded-lg font-bebas text-sm border border-[#0F1C30] shadow-xs">
                    66 REGULAR
                  </div>
                </div>
              </div>

              {/* Balcony STAGE (at top) */}
              <div className="w-full max-w-md mx-auto mb-8">
                <div className="bg-[#D8C7A5] text-[#0F1C30] py-2 px-8 rounded-full border-3 border-[#0F1C30] text-center shadow-md">
                  <span className="font-bebas text-2xl tracking-[0.3em] font-black">
                    S T A G E
                  </span>
                </div>
              </div>

              {/* Rows AA, AB, AC */}
              <div className="space-y-3">
                {balconyRows.map(({ row, left, center, right }) => (
                  <div key={row} className="flex items-center justify-between gap-3">
                    
                    {/* Row Label (Left) */}
                    <div className="w-9 h-8 rounded-lg bg-[#182B49] text-white flex items-center justify-center font-bebas text-base shrink-0 border border-[#0F1C30]">
                      {row}
                    </div>

                    {/* Left Block (Seats 1-8) */}
                    <div className="flex items-center gap-1 bg-black/5 p-1 rounded-xl border border-slate-300">
                      {left.map((seat) => (
                        <button
                          key={seat.id}
                          disabled={seat.status === 'sold' || (seat.status === 'held' && !selectedSeatIds.includes(seat.id))}
                          onClick={() => onToggleSeat(seat)}
                          onMouseEnter={() => setHoveredSeat(seat)}
                          onMouseLeave={() => setHoveredSeat(null)}
                          className={`w-6 h-7 rounded text-[10px] font-bold border transition-all cursor-pointer flex items-center justify-center ${getSeatColorClass(
                            seat
                          )}`}
                          title={`${seat.label} (${seat.category}) - Rp${seat.price.toLocaleString('id-ID')}`}
                        >
                          {seat.status === 'sold' ? (
                            <Lock className="w-3 h-3 text-slate-500" />
                          ) : selectedSeatIds.includes(seat.id) ? (
                            <Check className="w-3 h-3 text-slate-900" />
                          ) : (
                            seat.number
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Center Gangway */}
                    <div className="w-2" />

                    {/* Center Block (Seats 9-17) */}
                    <div className="flex items-center gap-1 bg-black/5 p-1 rounded-xl border border-slate-300">
                      {center.map((seat) => (
                        <button
                          key={seat.id}
                          disabled={seat.status === 'sold' || (seat.status === 'held' && !selectedSeatIds.includes(seat.id))}
                          onClick={() => onToggleSeat(seat)}
                          onMouseEnter={() => setHoveredSeat(seat)}
                          onMouseLeave={() => setHoveredSeat(null)}
                          className={`w-6 h-7 rounded text-[10px] font-bold border transition-all cursor-pointer flex items-center justify-center ${getSeatColorClass(
                            seat
                          )}`}
                          title={`${seat.label} (${seat.category}) - Rp${seat.price.toLocaleString('id-ID')}`}
                        >
                          {seat.status === 'sold' ? (
                            <Lock className="w-3 h-3 text-slate-500" />
                          ) : selectedSeatIds.includes(seat.id) ? (
                            <Check className="w-3 h-3 text-slate-900" />
                          ) : (
                            seat.number
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Center Gangway */}
                    <div className="w-2" />

                    {/* Right Block (Seats 18-25) */}
                    <div className="flex items-center gap-1 bg-black/5 p-1 rounded-xl border border-slate-300">
                      {right.map((seat) => (
                        <button
                          key={seat.id}
                          disabled={seat.status === 'sold' || (seat.status === 'held' && !selectedSeatIds.includes(seat.id))}
                          onClick={() => onToggleSeat(seat)}
                          onMouseEnter={() => setHoveredSeat(seat)}
                          onMouseLeave={() => setHoveredSeat(null)}
                          className={`w-6 h-7 rounded text-[10px] font-bold border transition-all cursor-pointer flex items-center justify-center ${getSeatColorClass(
                            seat
                          )}`}
                          title={`${seat.label} (${seat.category}) - Rp${seat.price.toLocaleString('id-ID')}`}
                        >
                          {seat.status === 'sold' ? (
                            <Lock className="w-3 h-3 text-slate-500" />
                          ) : selectedSeatIds.includes(seat.id) ? (
                            <Check className="w-3 h-3 text-slate-900" />
                          ) : (
                            seat.number
                          )}
                        </button>
                      ))}
                    </div>

                  </div>
                ))}
              </div>

              {/* Price legend inside Balcony card */}
              <div className="mt-6 pt-4 border-t-2 border-dashed border-slate-300 flex items-center justify-center gap-8 text-xs font-bold text-slate-700">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-[#E04D65] border border-[#B83248]" />
                  <span>VIP BALCONY • Rp50.000</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-[#3B82F6] border border-[#1D4ED8]" />
                  <span>REGULAR • Rp35.000</span>
                </div>
              </div>

            </div>

          </div>

          {/* Floating Hover Tooltip */}
          {hoveredSeat && (
            <div className="absolute bottom-4 left-4 bg-slate-900/95 backdrop-blur-md p-3 rounded-xl border border-slate-700 shadow-xl pointer-events-none flex items-center gap-3 z-30">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: CATEGORY_INFO[hoveredSeat.category]?.color || '#3B82F6' }}
              />
              <div className="text-xs">
                <div className="font-bold text-white flex items-center gap-2">
                  <span>Kursi {hoveredSeat.label}</span>
                  <span className="text-amber-400 font-bebas text-sm">
                    ({CATEGORY_INFO[hoveredSeat.category]?.name || hoveredSeat.category})
                  </span>
                </div>
                <div className="text-slate-300">
                  Rp{hoveredSeat.price.toLocaleString('id-ID')} •{' '}
                  <span
                    className={
                      hoveredSeat.status === 'sold'
                        ? 'text-red-400 font-bold'
                        : hoveredSeat.status === 'held'
                        ? 'text-amber-400 font-bold'
                        : 'text-emerald-400 font-bold'
                    }
                  >
                    {hoveredSeat.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Legend bar at bottom */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-300 bg-[#0F1C30] p-4 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-[#E04D65] border border-[#B83248]" />
            <span>VIP / VIP Balcony (Rp50.000)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-[#3B82F6] border border-[#1D4ED8]" />
            <span>Regular (Rp35.000)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-white border-2 border-cyan-400 ring-2 ring-cyan-400" />
            <span className="text-cyan-300 font-bold">Kursi Dipilih</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-slate-400 border border-slate-500 opacity-60 flex items-center justify-center">
              <Lock className="w-2.5 h-2.5 text-slate-700" />
            </span>
            <span>Sudah Terjual</span>
          </div>
        </div>

      </div>

      {/* Floating Bottom Cart Bar when seats are selected */}
      {selectedSeats.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0F1C30]/95 backdrop-blur-md border-t-4 border-[#F4B32A] shadow-2xl p-3 sm:p-4 animate-in slide-in-from-bottom duration-300">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4">
            
            {/* Selected seats badges */}
            <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-2 overflow-x-auto">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#C1272D] flex items-center justify-center text-white shrink-0 border border-[#F4B32A]">
                  <Ticket className="w-4 h-4 sm:w-5 sm:h-5 text-[#F4B32A]" />
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto max-w-[220px] sm:max-w-md py-0.5">
                  {selectedSeats.map((s) => (
                    <span
                      key={s.id}
                      className="inline-block bg-white text-slate-900 font-bebas text-xs sm:text-sm px-2 py-0.5 rounded border border-slate-300 shadow-sm shrink-0"
                    >
                      {s.label}
                    </span>
                  ))}
                </div>
              </div>

              <span className="text-[11px] font-bold text-amber-300 shrink-0 bg-white/10 px-2 py-0.5 rounded sm:hidden">
                {selectedSeats.length} Kursi
              </span>
            </div>

            {/* Total and Checkout Button */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t border-slate-800 sm:border-0 pt-2 sm:pt-0">
              <div className="text-left sm:text-right">
                <div className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                  Total Pembayaran
                </div>
                <div className="font-bebas text-xl sm:text-3xl text-[#F4B32A] leading-tight">
                  Rp {totalPrice.toLocaleString('id-ID')}
                </div>
              </div>

              <button
                onClick={onProceedToCheckout}
                disabled={isLoading}
                className="cursor-pointer bg-[#C1272D] hover:bg-[#a61f25] text-white px-4 py-2.5 sm:px-6 sm:py-3.5 rounded-xl font-bebas text-base sm:text-xl tracking-wider border-2 border-[#F4B32A] shadow-[0_3px_0_#000] hover:translate-y-0.5 active:translate-y-1 transition-all flex items-center gap-1.5 sm:gap-2 shrink-0"
              >
                <span>LANJUT KE PEMBAYARAN</span>
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

          </div>
        </div>
      )}

    </section>
  );
}
