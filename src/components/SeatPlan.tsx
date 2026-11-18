'use client';

import React, { useState, useMemo, useRef } from 'react';
import { Seat, TicketCategory } from '@/types/ticket';
import { CATEGORY_INFO } from '@/data/initialSeats';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Ticket,
  ChevronRight,
  Maximize2,
  Info,
} from 'lucide-react';

interface SeatPlanProps {
  seats: Seat[];
  selectedSeatIds: string[];
  onToggleSeat: (seatId: string) => void;
  onProceedToCheckout: () => void;
  maxSeats?: number;
  highlightCategory?: string | null;
  onClearHighlight?: () => void;
}

export default function SeatPlan({
  seats,
  selectedSeatIds,
  onToggleSeat,
  onProceedToCheckout,
  maxSeats = 6,
  highlightCategory,
  onClearHighlight,
}: SeatPlanProps) {
  const [zoom, setZoom] = useState(1);
  const [activeSection, setActiveSection] = useState<'ALL' | 'MAIN' | 'BALCONY'>('ALL');
  const [hoveredSeat, setHoveredSeat] = useState<Seat | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Group seats by section and row
  const { mainFloorRows, balconyRows } = useMemo(() => {
    const mainSeats = seats.filter((s) => s.section === 'MAIN_FLOOR');
    const balcSeats = seats.filter((s) => s.section === 'BALCONY');

    const groupByRow = (seatList: Seat[]) => {
      const map: { [row: string]: Seat[] } = {};
      seatList.forEach((s) => {
        if (!map[s.row]) map[s.row] = [];
        map[s.row].push(s);
      });
      // Sort rows
      const sortedKeys = Object.keys(map).sort();
      // Sort seats within each row by number
      sortedKeys.forEach((r) => {
        map[r].sort((a, b) => a.number - b.number);
      });
      return { keys: sortedKeys, map };
    };

    return {
      mainFloorRows: groupByRow(mainSeats),
      balconyRows: groupByRow(balcSeats),
    };
  }, [seats]);

  // Selected seats summary
  const selectedSeats = useMemo(() => {
    return seats.filter((s) => selectedSeatIds.includes(s.id));
  }, [seats, selectedSeatIds]);

  const totalAmount = useMemo(() => {
    return selectedSeats.reduce((sum, s) => sum + s.price, 0);
  }, [selectedSeats]);

  const handleZoom = (delta: number) => {
    setZoom((prev) => Math.min(Math.max(0.7, prev + delta), 1.6));
  };

  const handleResetZoom = () => {
    setZoom(1);
  };

  const getSeatColor = (seat: Seat, isSelected: boolean) => {
    if (seat.status === 'sold') {
      return 'bg-slate-300 text-slate-400 border-slate-400 cursor-not-allowed opacity-60 line-through';
    }
    if (seat.status === 'held' && !isSelected) {
      return 'bg-amber-200 text-amber-900 border-amber-400 cursor-not-allowed animate-pulse';
    }
    if (isSelected) {
      return 'bg-[#F4B32A] text-[#0F1C30] border-[#0F1C30] font-black shadow-[0_0_12px_rgba(244,179,42,0.8)] scale-110 z-20 ring-2 ring-[#0F1C30]';
    }
    if (seat.category === 'VIP' || seat.category === 'VIP_BALCONY') {
      return 'bg-[#C1272D] text-white border-[#0F1C30] hover:scale-115 hover:z-10 shadow-xs';
    }
    return 'bg-[#4B88E2] text-white border-[#0F1C30] hover:scale-115 hover:z-10 shadow-xs';
  };

  return (
    <section id="seatplan" className="py-16 md:py-24 bg-[#0F1C30] text-white relative">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Title & Section Switchers */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-700 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#C1272D] text-[#FAF6ED] font-bebas text-xs sm:text-sm px-3 py-1 rounded-md border border-[#F4B32A] mb-2 tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#F4B32A]" />
              OFFICIAL 300-SEAT SEATING PLAN
            </div>
            <h2 className="font-bebas text-4xl sm:text-6xl text-[#FAF6ED] tracking-wider leading-none">
              CHOOSE YOUR <span className="text-[#F4B32A]">SEATS</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mt-1">
              Main Floor (225 Seats) & Balcony (75 Seats). Click any available seat to reserve. Maximum {maxSeats} seats per booking.
            </p>
          </div>

          {/* Section Filter Pills */}
          <div className="flex items-center gap-2 bg-[#182B49] p-1.5 rounded-2xl border-2 border-slate-700 self-start md:self-auto">
            <button
              onClick={() => setActiveSection('ALL')}
              className={`cursor-pointer px-3.5 py-1.5 rounded-xl font-bebas text-xs sm:text-sm tracking-wider transition-all ${
                activeSection === 'ALL'
                  ? 'bg-[#C1272D] text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              ALL TIERS (300)
            </button>
            <button
              onClick={() => setActiveSection('MAIN')}
              className={`cursor-pointer px-3.5 py-1.5 rounded-xl font-bebas text-xs sm:text-sm tracking-wider transition-all ${
                activeSection === 'MAIN'
                  ? 'bg-[#C1272D] text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              MAIN FLOOR (225)
            </button>
            <button
              onClick={() => setActiveSection('BALCONY')}
              className={`cursor-pointer px-3.5 py-1.5 rounded-xl font-bebas text-xs sm:text-sm tracking-wider transition-all ${
                activeSection === 'BALCONY'
                  ? 'bg-[#C1272D] text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              BALCONY (75)
            </button>
          </div>
        </div>

        {/* Highlight Category Notification if redirected from Categories section */}
        {highlightCategory && (
          <div className="bg-[#182B49] border-2 border-[#F4B32A] p-3 rounded-2xl flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-slate-200">
              <Info className="w-4 h-4 text-[#F4B32A]" />
              <span>
                Filtering view for <strong>{highlightCategory}</strong>. Click any seat on the map to add it to your order.
              </span>
            </span>
            <button
              onClick={onClearHighlight}
              className="text-[#F4B32A] hover:underline font-bold"
            >
              Show All Tiers
            </button>
          </div>
        )}

        {/* Seating Map Interactive Board */}
        <div className="relative bg-[#182B49] rounded-3xl border-4 border-slate-700 shadow-[0_12px_0_#060c15] p-4 sm:p-8 overflow-hidden">
          
          {/* Zoom & Reset Floating Controls */}
          <div className="absolute top-4 right-4 z-30 flex items-center gap-1.5 bg-[#0F1C30]/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-700">
            <button
              onClick={() => handleZoom(0.1)}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleZoom(-0.1)}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Reset Zoom"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Swipe guidance indicator for mobile */}
          <div className="sm:hidden text-center text-[11px] font-semibold text-slate-400 mb-3 flex items-center justify-center gap-1">
            <span>← Swipe left or right to view all 30 rows →</span>
          </div>

          {/* Zoomable / Scrollable Floor Canvas */}
          <div
            ref={containerRef}
            className="overflow-x-auto pb-8 pt-2 transition-transform duration-150 origin-top"
          >
            <div
              className="min-w-[780px] max-w-4xl mx-auto space-y-12"
              style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
            >
              
              {/* ================= STAGE AREA ================= */}
              {(activeSection === 'ALL' || activeSection === 'MAIN') && (
                <div className="space-y-6">
                  
                  {/* Physical Stage Banner */}
                  <div className="relative max-w-md mx-auto">
                    <div className="h-14 bg-gradient-to-b from-[#C1272D] to-[#8E1C21] rounded-2xl border-3 border-[#F4B32A] flex items-center justify-center shadow-lg relative overflow-hidden">
                      <div className="absolute inset-0 bg-[radial-gradient(#F4B32A_1px,transparent_1px)] [background-size:8px_8px] opacity-30" />
                      <div className="font-bebas text-2xl tracking-widest text-[#FAF6ED] flex items-center gap-2 relative z-10">
                        <Sparkles className="w-4 h-4 text-[#F4B32A]" />
                        <span>★ MAIN STAGE • AMANI PALLADIUM THEATRE ★</span>
                        <Sparkles className="w-4 h-4 text-[#F4B32A]" />
                      </div>
                    </div>
                    {/* Stage lighting apron gradient */}
                    <div className="h-6 bg-gradient-to-b from-[#F4B32A]/20 to-transparent rounded-b-2xl blur-xs" />
                  </div>

                  {/* Main Floor Header */}
                  <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                    <span className="font-bebas text-lg text-[#F4B32A] tracking-wider">
                      MAIN FLOOR — 225 SEATS TOTAL
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      20 VIP (Rows A & B) • 205 Regular
                    </span>
                  </div>

                  {/* Main Floor Seat Matrix */}
                  <div className="space-y-2">
                    {mainFloorRows.keys.map((rowKey) => {
                      const rowSeats = mainFloorRows.map[rowKey] || [];
                      const leftBlock = rowSeats.filter((s) => s.number <= 10);
                      const centerBlock = rowSeats.filter((s) => s.number >= 11 && s.number <= 20);
                      const rightBlock = rowSeats.filter((s) => s.number >= 21);

                      return (
                        <div key={rowKey} className="flex items-center justify-center gap-3">
                          
                          {/* Row Letter Left */}
                          <span className="w-6 font-bebas text-sm text-[#F4B32A] text-right shrink-0">
                            {rowKey}
                          </span>

                          {/* Left Block (Seats 1-10) */}
                          <div className="flex gap-1">
                            {leftBlock.map((seat) => {
                              const isSelected = selectedSeatIds.includes(seat.id);
                              return (
                                <button
                                  key={seat.id}
                                  onClick={() => onToggleSeat(seat.id)}
                                  onMouseEnter={() => setHoveredSeat(seat)}
                                  onMouseLeave={() => setHoveredSeat(null)}
                                  disabled={seat.status === 'sold' || (seat.status === 'held' && !isSelected)}
                                  className={`w-6 h-6 rounded-md border text-[10px] font-bold flex items-center justify-center transition-all ${getSeatColor(
                                    seat,
                                    isSelected
                                  )}`}
                                >
                                  {seat.number}
                                </button>
                              );
                            })}
                          </div>

                          {/* Center Block (Seats 11-20, VIP on A & B) */}
                          <div className="flex gap-1 mx-2 p-1 rounded-lg bg-black/20 border border-slate-700/60">
                            {centerBlock.map((seat) => {
                              const isSelected = selectedSeatIds.includes(seat.id);
                              return (
                                <button
                                  key={seat.id}
                                  onClick={() => onToggleSeat(seat.id)}
                                  onMouseEnter={() => setHoveredSeat(seat)}
                                  onMouseLeave={() => setHoveredSeat(null)}
                                  disabled={seat.status === 'sold' || (seat.status === 'held' && !isSelected)}
                                  className={`w-6 h-6 rounded-md border text-[10px] font-bold flex items-center justify-center transition-all ${getSeatColor(
                                    seat,
                                    isSelected
                                  )}`}
                                >
                                  {seat.number}
                                </button>
                              );
                            })}
                          </div>

                          {/* Right Block (Seats 21-30) */}
                          <div className="flex gap-1">
                            {rightBlock.map((seat) => {
                              const isSelected = selectedSeatIds.includes(seat.id);
                              return (
                                <button
                                  key={seat.id}
                                  onClick={() => onToggleSeat(seat.id)}
                                  onMouseEnter={() => setHoveredSeat(seat)}
                                  onMouseLeave={() => setHoveredSeat(null)}
                                  disabled={seat.status === 'sold' || (seat.status === 'held' && !isSelected)}
                                  className={`w-6 h-6 rounded-md border text-[10px] font-bold flex items-center justify-center transition-all ${getSeatColor(
                                    seat,
                                    isSelected
                                  )}`}
                                >
                                  {seat.number}
                                </button>
                              );
                            })}
                          </div>

                          {/* Row Letter Right */}
                          <span className="w-6 font-bebas text-sm text-[#F4B32A] text-left shrink-0">
                            {rowKey}
                          </span>

                        </div>
                      );
                    })}
                  </div>

                </div>
              )}

              {/* ================= BALCONY AREA ================= */}
              {(activeSection === 'ALL' || activeSection === 'BALCONY') && (
                <div className="space-y-6 pt-6 border-t-2 border-dashed border-slate-700">
                  
                  {/* Balcony Header */}
                  <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                    <span className="font-bebas text-lg text-[#F4B32A] tracking-wider">
                      BALCONY LEVEL — 75 SEATS TOTAL
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      9 VIP Balcony (Row AA 9–17) • 66 Regular
                    </span>
                  </div>

                  {/* Balcony Seat Matrix */}
                  <div className="space-y-2">
                    {balconyRows.keys.map((rowKey) => {
                      const rowSeats = balconyRows.map[rowKey] || [];
                      const leftBlock = rowSeats.filter((s) => s.number <= 8);
                      const centerBlock = rowSeats.filter((s) => s.number >= 9 && s.number <= 17);
                      const rightBlock = rowSeats.filter((s) => s.number >= 18);

                      return (
                        <div key={rowKey} className="flex items-center justify-center gap-3">
                          
                          {/* Row Letter Left */}
                          <span className="w-6 font-bebas text-sm text-[#F4B32A] text-right shrink-0">
                            {rowKey}
                          </span>

                          {/* Left Block (Seats 1-8) */}
                          <div className="flex gap-1">
                            {leftBlock.map((seat) => {
                              const isSelected = selectedSeatIds.includes(seat.id);
                              return (
                                <button
                                  key={seat.id}
                                  onClick={() => onToggleSeat(seat.id)}
                                  onMouseEnter={() => setHoveredSeat(seat)}
                                  onMouseLeave={() => setHoveredSeat(null)}
                                  disabled={seat.status === 'sold' || (seat.status === 'held' && !isSelected)}
                                  className={`w-6 h-6 rounded-md border text-[10px] font-bold flex items-center justify-center transition-all ${getSeatColor(
                                    seat,
                                    isSelected
                                  )}`}
                                >
                                  {seat.number}
                                </button>
                              );
                            })}
                          </div>

                          {/* Center Block (Seats 9-17, VIP Balcony on AA) */}
                          <div className="flex gap-1 mx-2 p-1 rounded-lg bg-black/20 border border-slate-700/60">
                            {centerBlock.map((seat) => {
                              const isSelected = selectedSeatIds.includes(seat.id);
                              return (
                                <button
                                  key={seat.id}
                                  onClick={() => onToggleSeat(seat.id)}
                                  onMouseEnter={() => setHoveredSeat(seat)}
                                  onMouseLeave={() => setHoveredSeat(null)}
                                  disabled={seat.status === 'sold' || (seat.status === 'held' && !isSelected)}
                                  className={`w-6 h-6 rounded-md border text-[10px] font-bold flex items-center justify-center transition-all ${getSeatColor(
                                    seat,
                                    isSelected
                                  )}`}
                                >
                                  {seat.number}
                                </button>
                              );
                            })}
                          </div>

                          {/* Right Block (Seats 18-25) */}
                          <div className="flex gap-1">
                            {rightBlock.map((seat) => {
                              const isSelected = selectedSeatIds.includes(seat.id);
                              return (
                                <button
                                  key={seat.id}
                                  onClick={() => onToggleSeat(seat.id)}
                                  onMouseEnter={() => setHoveredSeat(seat)}
                                  onMouseLeave={() => setHoveredSeat(null)}
                                  disabled={seat.status === 'sold' || (seat.status === 'held' && !isSelected)}
                                  className={`w-6 h-6 rounded-md border text-[10px] font-bold flex items-center justify-center transition-all ${getSeatColor(
                                    seat,
                                    isSelected
                                  )}`}
                                >
                                  {seat.number}
                                </button>
                              );
                            })}
                          </div>

                          {/* Row Letter Right */}
                          <span className="w-6 font-bebas text-sm text-[#F4B32A] text-left shrink-0">
                            {rowKey}
                          </span>

                        </div>
                      );
                    })}
                  </div>

                </div>
              )}

            </div>
          </div>

          {/* Hovered Seat Quick Tooltip */}
          {hoveredSeat && (
            <div className="absolute bottom-4 left-4 z-30 bg-[#0F1C30]/95 backdrop-blur-sm border-2 border-[#F4B32A] p-2.5 rounded-xl text-xs space-y-0.5 shadow-xl animate-in fade-in duration-100">
              <div className="font-bebas text-base text-[#F4B32A] leading-tight">
                SEAT {hoveredSeat.label} • {hoveredSeat.category}
              </div>
              <div className="text-[11px] text-slate-300">
                Tier Price: <strong>Rp {hoveredSeat.price.toLocaleString('id-ID')}</strong> • {hoveredSeat.section === 'BALCONY' ? 'Balcony Level' : 'Main Floor Level'}
              </div>
              <div className="text-[10px] text-emerald-400 font-bold uppercase">
                Status: {hoveredSeat.status === 'sold' ? 'SOLD OUT' : hoveredSeat.status === 'held' ? 'TEMPORARILY HELD' : 'AVAILABLE TO SELECT'}
              </div>
            </div>
          )}

          {/* Map Legend */}
          <div className="pt-6 border-t border-slate-700 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded bg-[#C1272D] border border-[#0F1C30]" />
              <span>VIP Tier (Rp 50.000)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded bg-[#4B88E2] border border-[#0F1C30]" />
              <span>Regular Pass (Rp 35.000)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded bg-[#F4B32A] border border-[#0F1C30]" />
              <span>Your Selection</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded bg-slate-400 opacity-60 border border-slate-500 line-through" />
              <span>Sold Out</span>
            </div>
          </div>

        </div>

        {/* Floating Bottom Bar when Seats are Selected */}
        {selectedSeatIds.length > 0 && (
          <div className="sticky bottom-4 z-40 bg-[#FAF6ED] text-[#182B49] p-4 sm:p-5 rounded-3xl border-4 border-[#0F1C30] shadow-[0_8px_0_#0F1C30] flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-bottom-4 duration-200">
            
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="font-bebas text-xl sm:text-2xl text-[#C1272D] leading-none">
                  {selectedSeatIds.length} SEAT{selectedSeatIds.length > 1 ? 'S' : ''} SELECTED
                </span>
                <span className="text-xs bg-[#182B49] text-white px-2 py-0.5 rounded font-mono font-bold">
                  MAX {maxSeats}
                </span>
              </div>
              <div className="text-xs text-slate-600 font-semibold flex flex-wrap gap-1 justify-center sm:justify-start">
                <span>Assigned Seats:</span>
                {selectedSeats.map((s) => (
                  <span
                    key={s.id}
                    className="bg-white border border-[#0F1C30] px-1.5 py-0.5 rounded text-[11px] font-bebas text-[#C1272D]"
                  >
                    {s.label} ({s.category})
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
              <div className="text-right">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  TOTAL BILL
                </div>
                <div className="font-bebas text-2xl sm:text-3xl text-[#C1272D] leading-none">
                  RP {totalAmount.toLocaleString('id-ID')}
                </div>
              </div>

              <button
                onClick={onProceedToCheckout}
                className="cursor-pointer bg-[#C1272D] hover:bg-[#a61f25] text-white px-6 py-3.5 rounded-2xl font-bebas text-lg sm:text-xl tracking-wider border-2 border-[#0F1C30] shadow-[0_3px_0_#0F1C30] hover:translate-y-0.5 transition-all flex items-center gap-2"
              >
                <span>PROCEED TO CHECKOUT</span>
                <ChevronRight className="w-5 h-5 text-[#F4B32A]" />
              </button>
            </div>

          </div>
        )}

      </div>
    </section>
  );
}
