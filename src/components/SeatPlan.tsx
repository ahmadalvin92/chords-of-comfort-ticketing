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

  // Group Balcony seats
  const balconyRows = useMemo(() => {
    const r1 = seats.filter((s) => s.section === 'BALCONY' && s.row === 'R1');
    const r2 = seats.filter((s) => s.section === 'BALCONY' && s.row === 'R2');
    const r3 = seats.filter((s) => s.section === 'BALCONY' && s.row === 'R3');
    return [
      { row: 'R1', seats: r1 },
      { row: 'R2', seats: r2 },
      { row: 'R3', seats: r3 },
    ];
  }, [seats]);

  // Group Main Floor seats
  const mainFloorRows = useMemo(() => {
    const rowNames = ['A10', 'A9', 'A8', 'A7', 'A6', 'A5', 'A4', 'A3', 'A2', 'A1'];
    return rowNames.map((rowName) => {
      const rowSeats = seats.filter((s) => s.section === 'MAIN_FLOOR' && s.row === rowName);
      const left = rowSeats
        .filter((s) => s.subSection === 'LEFT')
        .sort((a, b) => a.number - b.number);
      const right = rowSeats
        .filter((s) => s.subSection === 'RIGHT')
        .sort((a, b) => a.number - b.number);
      return {
        row: rowName,
        left,
        right,
      };
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
    setZoomLevel((prev) => Math.min(Math.max(0.7, prev + delta), 1.5));
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

    switch (seat.category) {
      case 'VIP':
        return `bg-pink-500 text-white border-pink-700 hover:bg-pink-400 ${filterDimmed}`;
      case 'SAPPHIRE':
        return `bg-blue-600 text-white border-blue-800 hover:bg-blue-500 ${filterDimmed}`;
      case 'DIAMOND':
        return `bg-amber-500 text-slate-950 border-amber-700 hover:bg-amber-400 ${filterDimmed}`;
      case 'PLATINUM':
        return `bg-emerald-600 text-white border-emerald-800 hover:bg-emerald-500 ${filterDimmed}`;
      case 'RUBY':
        return `bg-rose-600 text-white border-rose-800 hover:bg-rose-500 ${filterDimmed}`;
      default:
        return `bg-slate-400 text-white ${filterDimmed}`;
    }
  };

  return (
    <section id="seating" className="py-16 bg-[#182B49] text-white relative overflow-hidden">
      
      {/* Background Theater Light Cone */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-amber-200/10 via-amber-400/5 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#F4B32A] text-[#0F1C30] px-3.5 py-1 rounded-md font-bebas text-base mb-2">
              <Sparkles className="w-4 h-4" /> SEATING PLAN INTERAKTIF (400 SEATS)
            </div>
            <h2 className="font-bebas text-4xl sm:text-5xl text-white tracking-wide">
              PILIH NOMOR KURSI VENUE LSPR SUDIRMAN PARK
            </h2>
            <p className="text-slate-300 text-sm max-w-2xl font-medium">
              Klik kursi yang kamu inginkan untuk melakukan reservasi. Kursi yang kamu pilih akan dikunci sementara selama proses pembayaran.
            </p>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-2 bg-[#0F1C30] p-1.5 rounded-xl border border-slate-700 shrink-0">
            <button
              onClick={() => handleZoom(-0.15)}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono font-bold px-2 text-slate-300">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => handleZoom(0.15)}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors"
              title="Reset Zoom"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category Filters Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
          <span className="text-xs font-black uppercase text-slate-400 tracking-wider shrink-0 mr-1">
            Filter:
          </span>
          <button
            onClick={() => onFilterChange('ALL')}
            className={`cursor-pointer px-4 py-2 rounded-lg font-bebas text-sm tracking-wider border-2 transition-all shrink-0 ${
              activeFilter === 'ALL'
                ? 'bg-[#F4B32A] text-[#0F1C30] border-[#F4B32A] shadow-md'
                : 'bg-[#0F1C30] text-slate-300 border-slate-700 hover:border-slate-500'
            }`}
          >
            SEMUA KURSI (400)
          </button>
          {(Object.keys(CATEGORY_INFO) as TicketCategory[]).map((cat) => {
            const info = CATEGORY_INFO[cat];
            const isSelected = activeFilter === cat;
            return (
              <button
                key={cat}
                onClick={() => onFilterChange(cat)}
                className={`cursor-pointer px-3.5 py-2 rounded-lg font-bebas text-sm tracking-wider border-2 transition-all flex items-center gap-2 shrink-0 ${
                  isSelected
                    ? 'bg-white text-slate-900 border-white shadow-md'
                    : 'bg-[#0F1C30] text-slate-300 border-slate-700 hover:border-slate-500'
                }`}
              >
                <span
                  className="w-3 h-3 rounded-full border border-black/20"
                  style={{ backgroundColor: info.color }}
                />
                {cat} (Rp{info.price / 1000}k)
              </button>
            );
          })}
        </div>

        {/* Seating Map Canvas Container */}
        <div className="bg-[#0b1424] rounded-2xl border-3 border-slate-700 shadow-2xl p-4 sm:p-8 relative overflow-x-auto min-h-[600px]">
          
          {/* Zoom Wrapper */}
          <div
            className="transition-transform duration-200 origin-top min-w-[850px] mx-auto flex flex-col items-center"
            style={{ transform: `scale(${zoomLevel})` }}
          >

            {/* ================= SECTION 1: BALCONY ================= */}
            <div className="w-full max-w-4xl bg-[#111e35] p-5 rounded-2xl border-2 border-slate-700/80 mb-8 shadow-inner">
              <div className="flex items-center justify-between mb-4 border-b border-slate-700 pb-2">
                <div className="font-bebas text-lg tracking-wider text-amber-300 flex items-center gap-2">
                  <span>BALCONY (UPPER LEVEL)</span>
                  <span className="text-xs font-sans text-slate-400 font-semibold">• 75 Seats Total</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Sapphire: Row 1
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Platinum: Row 2-3
                  </span>
                </div>
              </div>

              {/* Balcony Rows */}
              <div className="space-y-3">
                {balconyRows.map(({ row, seats: rowSeats }) => {
                  const leftSeats = rowSeats.filter((s) => s.subSection === 'LEFT');
                  const centerSeats = rowSeats.filter((s) => s.subSection === 'CENTER');
                  const rightSeats = rowSeats.filter((s) => s.subSection === 'RIGHT');

                  return (
                    <div key={row} className="flex items-center justify-between gap-4">
                      <span className="font-bebas text-amber-400 w-8 text-center text-sm">{row}</span>

                      {/* Left Block (8 seats) */}
                      <div className="flex items-center gap-1 bg-black/20 p-1.5 rounded-lg border border-slate-800">
                        {leftSeats.map((seat) => (
                          <button
                            key={seat.id}
                            disabled={seat.status === 'sold' || (seat.status === 'held' && !selectedSeatIds.includes(seat.id))}
                            onClick={() => onToggleSeat(seat)}
                            onMouseEnter={() => setHoveredSeat(seat)}
                            onMouseLeave={() => setHoveredSeat(null)}
                            className={`w-7 h-7 rounded text-[10px] font-bold border transition-all cursor-pointer flex items-center justify-center ${getSeatColorClass(
                              seat
                            )}`}
                            title={`${seat.label} (${seat.category}) - Rp${seat.price.toLocaleString('id-ID')}`}
                          >
                            {seat.status === 'sold' ? (
                              <Lock className="w-3 h-3 text-slate-500" />
                            ) : selectedSeatIds.includes(seat.id) ? (
                              <Check className="w-3.5 h-3.5 text-slate-900" />
                            ) : (
                              seat.number
                            )}
                          </button>
                        ))}
                      </div>

                      {/* Center Block (9 seats) */}
                      <div className="flex items-center gap-1 bg-black/20 p-1.5 rounded-lg border border-slate-800">
                        {centerSeats.map((seat) => (
                          <button
                            key={seat.id}
                            disabled={seat.status === 'sold' || (seat.status === 'held' && !selectedSeatIds.includes(seat.id))}
                            onClick={() => onToggleSeat(seat)}
                            onMouseEnter={() => setHoveredSeat(seat)}
                            onMouseLeave={() => setHoveredSeat(null)}
                            className={`w-7 h-7 rounded text-[10px] font-bold border transition-all cursor-pointer flex items-center justify-center ${getSeatColorClass(
                              seat
                            )}`}
                            title={`${seat.label} (${seat.category}) - Rp${seat.price.toLocaleString('id-ID')}`}
                          >
                            {seat.status === 'sold' ? (
                              <Lock className="w-3 h-3 text-slate-500" />
                            ) : selectedSeatIds.includes(seat.id) ? (
                              <Check className="w-3.5 h-3.5 text-slate-900" />
                            ) : (
                              seat.number
                            )}
                          </button>
                        ))}
                      </div>

                      {/* Right Block (8 seats) */}
                      <div className="flex items-center gap-1 bg-black/20 p-1.5 rounded-lg border border-slate-800">
                        {rightSeats.map((seat) => (
                          <button
                            key={seat.id}
                            disabled={seat.status === 'sold' || (seat.status === 'held' && !selectedSeatIds.includes(seat.id))}
                            onClick={() => onToggleSeat(seat)}
                            onMouseEnter={() => setHoveredSeat(seat)}
                            onMouseLeave={() => setHoveredSeat(null)}
                            className={`w-7 h-7 rounded text-[10px] font-bold border transition-all cursor-pointer flex items-center justify-center ${getSeatColorClass(
                              seat
                            )}`}
                            title={`${seat.label} (${seat.category}) - Rp${seat.price.toLocaleString('id-ID')}`}
                          >
                            {seat.status === 'sold' ? (
                              <Lock className="w-3 h-3 text-slate-500" />
                            ) : selectedSeatIds.includes(seat.id) ? (
                              <Check className="w-3.5 h-3.5 text-slate-900" />
                            ) : (
                              seat.number
                            )}
                          </button>
                        ))}
                      </div>

                      <span className="font-bebas text-amber-400 w-8 text-center text-sm">{row}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Separator / Walkway */}
            <div className="w-full max-w-4xl flex items-center justify-between text-xs font-mono font-bold text-slate-500 my-2 px-4">
              <span className="border-b border-dashed border-slate-700 flex-1 mr-4" />
              <span>MAIN AISLE & WALKWAY</span>
              <span className="border-b border-dashed border-slate-700 flex-1 ml-4" />
            </div>

            {/* ================= SECTION 2: MAIN FLOOR (LOWER LEVEL) ================= */}
            <div className="w-full max-w-4xl bg-[#111e35] p-5 rounded-2xl border-2 border-slate-700/80 mb-6 shadow-inner">
              <div className="flex items-center justify-between mb-4 border-b border-slate-700 pb-2">
                <div className="font-bebas text-lg tracking-wider text-amber-300 flex items-center gap-2">
                  <span>MAIN FLOOR (LOWER LEVEL)</span>
                  <span className="text-xs font-sans text-slate-400 font-semibold">• 325 Seats Total</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-pink-500" /> VIP (A1-A5 Center)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Diamond
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Ruby
                  </span>
                </div>
              </div>

              {/* Rows A10 down to A1 */}
              <div className="space-y-2.5">
                {mainFloorRows.map(({ row, left, right }) => (
                  <div key={row} className="flex items-center justify-between gap-3">
                    <span className="font-bebas text-amber-400 w-7 text-center text-xs">{row}</span>

                    {/* Left Wing (16 seats) */}
                    <div className="flex items-center gap-0.5 sm:gap-1 bg-black/20 p-1 rounded-lg border border-slate-800">
                      {left.map((seat) => (
                        <button
                          key={seat.id}
                          disabled={seat.status === 'sold' || (seat.status === 'held' && !selectedSeatIds.includes(seat.id))}
                          onClick={() => onToggleSeat(seat)}
                          onMouseEnter={() => setHoveredSeat(seat)}
                          onMouseLeave={() => setHoveredSeat(null)}
                          className={`w-5 h-6 sm:w-6 sm:h-7 rounded text-[9px] font-bold border transition-all cursor-pointer flex items-center justify-center ${getSeatColorClass(
                            seat
                          )}`}
                          title={`${seat.label} (${seat.category}) - Rp${seat.price.toLocaleString('id-ID')}`}
                        >
                          {seat.status === 'sold' ? (
                            <Lock className="w-2.5 h-2.5 text-slate-500" />
                          ) : selectedSeatIds.includes(seat.id) ? (
                            <Check className="w-3 h-3 text-slate-900" />
                          ) : (
                            seat.number
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Center Gangway / Space */}
                    <div className="w-3 sm:w-4 flex items-center justify-center text-[10px] text-slate-600 font-mono">
                      |
                    </div>

                    {/* Right Wing (16 or 17 seats) */}
                    <div className="flex items-center gap-0.5 sm:gap-1 bg-black/20 p-1 rounded-lg border border-slate-800">
                      {right.map((seat) => (
                        <button
                          key={seat.id}
                          disabled={seat.status === 'sold' || (seat.status === 'held' && !selectedSeatIds.includes(seat.id))}
                          onClick={() => onToggleSeat(seat)}
                          onMouseEnter={() => setHoveredSeat(seat)}
                          onMouseLeave={() => setHoveredSeat(null)}
                          className={`w-5 h-6 sm:w-6 sm:h-7 rounded text-[9px] font-bold border transition-all cursor-pointer flex items-center justify-center ${getSeatColorClass(
                            seat
                          )}`}
                          title={`${seat.label} (${seat.category}) - Rp${seat.price.toLocaleString('id-ID')}`}
                        >
                          {seat.status === 'sold' ? (
                            <Lock className="w-2.5 h-2.5 text-slate-500" />
                          ) : selectedSeatIds.includes(seat.id) ? (
                            <Check className="w-3 h-3 text-slate-900" />
                          ) : (
                            seat.number
                          )}
                        </button>
                      ))}
                    </div>

                    <span className="font-bebas text-amber-400 w-7 text-center text-xs">{row}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ================= THEATER MAIN STAGE ================= */}
            <div className="w-full max-w-3xl mt-4 relative">
              
              {/* Spotlight cones */}
              <div className="absolute -top-10 left-1/4 w-32 h-16 bg-gradient-to-t from-amber-300/30 to-transparent blur-md -rotate-12 pointer-events-none" />
              <div className="absolute -top-10 right-1/4 w-32 h-16 bg-gradient-to-t from-amber-300/30 to-transparent blur-md rotate-12 pointer-events-none" />

              <div className="bg-gradient-to-b from-[#C1272D] to-[#801419] text-[#FAF6ED] py-4 px-6 rounded-2xl border-4 border-[#F4B32A] text-center shadow-[0_8px_20px_rgba(193,39,45,0.4)]">
                <div className="font-bebas text-3xl sm:text-4xl tracking-widest flex items-center justify-center gap-3">
                  <span>★</span>
                  <span>MAIN STAGE / PANGGUNG UTAMA</span>
                  <span>★</span>
                </div>
                <div className="text-[11px] font-bold uppercase tracking-widest text-amber-200">
                  LSPR SUDIRMAN PARK AUDITORIUM
                </div>
              </div>
            </div>

          </div>

          {/* Floating Hover Tooltip */}
          {hoveredSeat && (
            <div className="absolute bottom-4 left-4 bg-slate-900/95 backdrop-blur-md p-3 rounded-xl border border-slate-700 shadow-xl pointer-events-none flex items-center gap-3 z-30">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: CATEGORY_INFO[hoveredSeat.category].color }}
              />
              <div className="text-xs">
                <div className="font-bold text-white flex items-center gap-2">
                  <span>Kursi {hoveredSeat.label}</span>
                  <span className="text-amber-400 font-bebas text-sm">
                    ({hoveredSeat.category})
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

        {/* Legend bar */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-300 bg-[#0F1C30] p-4 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-pink-500 border border-pink-700" />
            <span>VIP (Rp70.000)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-blue-600 border border-blue-800" />
            <span>Sapphire (Rp60.000)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-amber-500 border border-amber-700" />
            <span>Diamond (Rp50.000)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-emerald-600 border border-emerald-800" />
            <span>Platinum (Rp45.000)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-rose-600 border border-rose-800" />
            <span>Ruby (Rp35.000)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-white border-2 border-cyan-400 ring-2 ring-cyan-400" />
            <span className="text-cyan-300 font-bold">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-slate-400 border border-slate-500 opacity-60 flex items-center justify-center">
              <Lock className="w-2.5 h-2.5 text-slate-700" />
            </span>
            <span>Sold</span>
          </div>
        </div>

      </div>

      {/* Floating Bottom Cart Bar when seats are selected */}
      {selectedSeats.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0F1C30]/95 backdrop-blur-md border-t-4 border-[#F4B32A] shadow-2xl p-4 animate-in slide-in-from-bottom duration-300">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Selected seats badges */}
            <div className="flex items-center gap-3 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              <div className="w-10 h-10 rounded-xl bg-[#C1272D] flex items-center justify-center text-white shrink-0 border border-[#F4B32A]">
                <Ticket className="w-5 h-5 text-[#F4B32A]" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <span>{selectedSeats.length} Kursi Dipilih:</span>
                </div>
                <div className="flex items-center gap-1.5 mt-1 overflow-x-auto max-w-md">
                  {selectedSeats.map((s) => (
                    <span
                      key={s.id}
                      className="inline-block bg-white text-slate-900 font-bebas text-sm px-2.5 py-0.5 rounded border border-slate-300 shadow-sm shrink-0"
                    >
                      {s.label} ({s.category})
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Total and Checkout Button */}
            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
              <div className="text-right">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Total Pembayaran
                </div>
                <div className="font-bebas text-2xl sm:text-3xl text-[#F4B32A] leading-tight">
                  Rp {totalPrice.toLocaleString('id-ID')}
                </div>
              </div>

              <button
                onClick={onProceedToCheckout}
                disabled={isLoading}
                className="cursor-pointer bg-[#C1272D] hover:bg-[#a61f25] text-white px-6 py-3.5 rounded-xl font-bebas text-xl tracking-wider border-2 border-[#F4B32A] shadow-[0_4px_0_#000] hover:translate-y-0.5 active:translate-y-1 transition-all flex items-center gap-2 shrink-0"
              >
                <span>LANJUT KE PEMBAYARAN</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

          </div>
        </div>
      )}

    </section>
  );
}

