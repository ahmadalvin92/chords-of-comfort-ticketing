'use client';

import React, { useState, useMemo, useRef } from 'react';
import { Seat } from '@/types/ticket';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Info,
  Lock,
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

  // Group seats by row for O(1) lookup: seatLookup[row][seatNumber]
  const seatLookup = useMemo(() => {
    const map: Record<string, Record<number, Seat>> = {};
    seats.forEach((s) => {
      if (!map[s.row]) map[s.row] = {};
      map[s.row][s.number] = s;
    });
    return map;
  }, [seats]);

  // Poster top-to-bottom row ordering: Balcony (AC -> AA) at top, Main Floor (H -> A) below, STAGE at bottom
  const BALCONY_ROWS = ['AC', 'AB', 'AA'];
  const BALC_LEFT_SLOTS = [24, 23, 22, 21, 20, 19, 18, 17];
  const BALC_CENTER_SLOTS = [16, 15, 14, 13, 12, 11, 10, 9];
  const BALC_RIGHT_SLOTS = [8, 7, 6, 5, 4, 3, 2, 1];

  const MAIN_FLOOR_ALL_ROWS = ['H', 'G', 'F', 'E', 'D', 'C', 'B', 'A'];
  const MAIN_FLOOR_CENTER_ROWS = ['G', 'F', 'E', 'D', 'C', 'B', 'A'];

  const MAIN_LEFT_SLOTS = [30, 29, 28, 27, 26, 25, 24, 23, 22, 21];
  const MAIN_LEFT_ROW_H_SLOTS: (number | null)[] = [null, null, null, null, null, 15, 14, 13, 12, 11];
  const MAIN_CENTER_SLOTS = [20, 19, 18, 17, 16, 15, 14, 13, 12, 11];
  const MAIN_RIGHT_SLOTS = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];

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
      return 'bg-slate-400 text-slate-700 border border-slate-500 cursor-not-allowed opacity-50 line-through';
    }
    if (seat.status === 'held' && !isSelected) {
      return 'bg-amber-300 text-amber-950 border border-amber-500 cursor-not-allowed animate-pulse';
    }
    if (isSelected) {
      return 'bg-[#F4B32A] text-[#0F1C30] border-[#0F1C30] font-black shadow-[0_0_12px_rgba(244,179,42,0.9)] scale-110 z-20 ring-2 ring-[#0F1C30]';
    }
    if (seat.category === 'VIP') {
      // Main Floor VIP (Rows A & B center 11-20) — Strictly Reserved / Cannot be clicked or seated
      return 'bg-[#E85D1A] text-white/95 border border-[#A83B0B] cursor-not-allowed opacity-90 shadow-xs';
    }
    if (seat.category === 'VIP_BALCONY') {
      // Balcony VIP (Row AA center 9-16) — Purchasable @ Rp 50.000
      return 'bg-[#E85D1A] text-white border border-[#B2410E] hover:scale-115 hover:z-10 shadow-xs cursor-pointer';
    }
    // Regular seats — Royal/Poster Blue @ Rp 35.000
    return 'bg-[#0D6BA8] text-white border border-[#084B78] hover:scale-115 hover:z-10 shadow-xs cursor-pointer';
  };

  const renderSeatButton = (seat: Seat | undefined, slotKey: string | number) => {
    if (!seat) {
      return <div key={slotKey} className="w-6 h-6 sm:w-7 sm:h-7 shrink-0" />;
    }

    const isReserved = seat.category === 'VIP';
    const isSelected = selectedSeatIds.includes(seat.id);
    const isDisabled = seat.status === 'sold' || (seat.status === 'held' && !isSelected) || isReserved;

    return (
      <button
        key={seat.id}
        type="button"
        onClick={() => {
          if (isReserved) return;
          onToggleSeat(seat.id);
        }}
        onMouseEnter={() => setHoveredSeat(seat)}
        onMouseLeave={() => setHoveredSeat(null)}
        disabled={isDisabled}
        aria-label={`Seat ${seat.label} - ${isReserved ? 'VIP Main Floor (Reserved)' : seat.category === 'VIP_BALCONY' ? 'VIP Balcony' : 'Regular'} - Rp ${seat.price.toLocaleString('id-ID')}`}
        title={
          isReserved
            ? `Seat ${seat.label} is RESERVED (Cannot be booked)`
            : `Seat ${seat.label} • Rp ${seat.price.toLocaleString('id-ID')}`
        }
        className={`relative w-6 h-6 sm:w-7 sm:h-7 rounded-md text-[9px] sm:text-[10px] font-bold flex items-center justify-center shrink-0 transition-transform ${getSeatColor(
          seat,
          isSelected
        )}`}
      >
        {seat.number}
      </button>
    );
  };

  return (
    <section id="seatplan" className="py-16 md:py-24 bg-[#0F1C30] text-white relative">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-8">

        {/* Header Title & Section Switchers */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-700 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#C1272D] text-[#FAF6ED] font-bebas text-xs sm:text-sm px-3 py-1 rounded-md border border-[#F4B32A] mb-2 tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#F4B32A]" />
              FIND YOUR COMFORT ZONE • 297 SEATS TOTAL
            </div>
            <h2 className="font-bebas text-4xl sm:text-6xl text-[#FAF6ED] tracking-wider leading-none">
              CHOOSE YOUR <span className="text-[#F4B32A]">SEATS</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mt-1">
              Balcony (72 Seats) & Main Floor (225 Seats). Click any available blue or orange Balcony seat to reserve (max {maxSeats} seats). Main Floor Row A &amp; B orange VIP seats are strictly reserved.
            </p>
          </div>

          {/* Section Filter Pills */}
          <div className="flex items-center gap-2 bg-[#182B49] p-1.5 rounded-2xl border-2 border-slate-700 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setActiveSection('ALL')}
              className={`cursor-pointer px-3.5 py-1.5 rounded-xl font-bebas text-xs sm:text-sm tracking-wider transition-all ${activeSection === 'ALL'
                ? 'bg-[#C1272D] text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
                }`}
            >
              ALL TIERS (297)
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('BALCONY')}
              className={`cursor-pointer px-3.5 py-1.5 rounded-xl font-bebas text-xs sm:text-sm tracking-wider transition-all ${activeSection === 'BALCONY'
                ? 'bg-[#C1272D] text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
                }`}
            >
              BALCONY (72)
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('MAIN')}
              className={`cursor-pointer px-3.5 py-1.5 rounded-xl font-bebas text-xs sm:text-sm tracking-wider transition-all ${activeSection === 'MAIN'
                ? 'bg-[#C1272D] text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
                }`}
            >
              MAIN FLOOR (225)
            </button>
          </div>
        </div>

        {/* Highlight Category Notification */}
        {highlightCategory && (
          <div className="bg-[#182B49] border-2 border-[#F4B32A] p-3 rounded-2xl flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-slate-200">
              <Info className="w-4 h-4 text-[#F4B32A]" />
              <span>
                Showing seats for <strong>{highlightCategory}</strong>. Click any available seat on the map below to add it to your booking.
              </span>
            </span>
            <button
              type="button"
              onClick={onClearHighlight}
              className="text-[#F4B32A] hover:underline font-bold cursor-pointer"
            >
              Show All Tiers
            </button>
          </div>
        )}

        {/* Seating Map Interactive Board */}
        <div className="relative bg-[#182B49] rounded-3xl border-4 border-slate-700 shadow-[0_12px_0_#060c15] p-3 sm:p-8 overflow-hidden">

          {/* Zoom & Reset Floating Controls */}
          <div className="flex items-center justify-between mb-4">
            <div className="sm:hidden text-[11px] font-semibold text-slate-300 flex items-center gap-1">
              <span>← Swipe sideways to view full seat chart →</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-300 font-semibold">
              <Lock className="w-3.5 h-3.5 text-[#F4B32A]" />
              <span>Note: Main Floor Center Rows A &amp; B (11–20) are reserved and cannot be selected.</span>
            </div>
            <div className="flex items-center gap-1.5 bg-[#0F1C30]/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-700 ml-auto">
              <button
                type="button"
                onClick={() => handleZoom(0.1)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleZoom(-0.1)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleResetZoom}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Reset Zoom"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Zoomable / Scrollable Floor Canvas */}
          <div
            ref={containerRef}
            className="overflow-x-auto pb-8 pt-2 transition-transform duration-150 origin-top"
          >
            <div
              className="min-w-[860px] max-w-5xl mx-auto space-y-8"
              style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
            >

              {/* ================= 1. BALCONY WINDOW (TOP) ================= */}
              {(activeSection === 'ALL' || activeSection === 'BALCONY') && (
                <div className="rounded-2xl border-4 border-[#0F1C30] bg-[#FAF6ED] text-[#0F1C30] shadow-[6px_6px_0_#060c15] overflow-hidden max-w-4xl mx-auto">
                  {/* Retro Orange-Red Window Title Bar */}
                  <div className="bg-[#E84A27] border-b-4 border-[#0F1C30] px-4 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-bebas text-2xl text-[#0F1C30] tracking-wider leading-none">
                        BALCONY
                      </span>
                      <span className="bg-[#FAF6ED] text-[#0F1C30] font-bebas text-xs px-2.5 py-0.5 rounded border-2 border-[#0F1C30] tracking-wider">
                        72 SEATS TOTAL • 8 VIP BALCONY (AA 9–16) • 64 REGULAR
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-[#0F1C30] bg-[#FAF6ED]/30" />
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-[#0F1C30] bg-[#FAF6ED]/30" />
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-[#0F1C30] bg-[#FAF6ED]/30" />
                    </div>
                  </div>

                  {/* Balcony Grid: Rows AC, AB, AA */}
                  <div className="p-4 sm:p-6 flex items-center justify-center gap-3 sm:gap-5">
                    {/* Left Row Labels */}
                    <div className="flex flex-col gap-1.5 sm:gap-2 py-2.5">
                      {BALCONY_ROWS.map((rowKey) => (
                        <div
                          key={`bal-lbl-l-${rowKey}`}
                          className="h-6 sm:h-7 w-7 font-bebas text-base text-[#0F1C30] flex items-center justify-center font-bold"
                        >
                          {rowKey}
                        </div>
                      ))}
                    </div>

                    {/* Left Block (24..17) */}
                    <div className="border-2 border-[#0F1C30] rounded-xl p-2 sm:p-2.5 bg-white shadow-xs">
                      <div className="flex flex-col gap-1.5 sm:gap-2">
                        {BALCONY_ROWS.map((rowKey) => {
                          const rowLookup = seatLookup[rowKey] || {};
                          return (
                            <div key={`bal-l-${rowKey}`} className="flex gap-1 sm:gap-1.5">
                              {BALC_LEFT_SLOTS.map((num) =>
                                renderSeatButton(rowLookup[num], `BAL-${rowKey}-${num}`)
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Center Block (16..9) */}
                    <div className="border-2 border-[#0F1C30] rounded-xl p-2 sm:p-2.5 bg-white shadow-xs">
                      <div className="flex flex-col gap-1.5 sm:gap-2">
                        {BALCONY_ROWS.map((rowKey) => {
                          const rowLookup = seatLookup[rowKey] || {};
                          return (
                            <div key={`bal-c-${rowKey}`} className="flex gap-1 sm:gap-1.5">
                              {BALC_CENTER_SLOTS.map((num) =>
                                renderSeatButton(rowLookup[num], `BAL-${rowKey}-${num}`)
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Right Block (8..1) */}
                    <div className="border-2 border-[#0F1C30] rounded-xl p-2 sm:p-2.5 bg-white shadow-xs">
                      <div className="flex flex-col gap-1.5 sm:gap-2">
                        {BALCONY_ROWS.map((rowKey) => {
                          const rowLookup = seatLookup[rowKey] || {};
                          return (
                            <div key={`bal-r-${rowKey}`} className="flex gap-1 sm:gap-1.5">
                              {BALC_RIGHT_SLOTS.map((num) =>
                                renderSeatButton(rowLookup[num], `BAL-${rowKey}-${num}`)
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Right Row Labels */}
                    <div className="flex flex-col gap-1.5 sm:gap-2 py-2.5">
                      {BALCONY_ROWS.map((rowKey) => (
                        <div
                          key={`bal-lbl-r-${rowKey}`}
                          className="h-6 sm:h-7 w-7 font-bebas text-base text-[#0F1C30] flex items-center justify-center font-bold"
                        >
                          {rowKey}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ================= 2. MAIN FLOOR WINDOW (MIDDLE) ================= */}
              {(activeSection === 'ALL' || activeSection === 'MAIN') && (
                <div className="rounded-2xl border-4 border-[#0F1C30] bg-[#FAF6ED] text-[#0F1C30] shadow-[6px_6px_0_#060c15] overflow-hidden">
                  {/* Retro Yellow Window Title Bar */}
                  <div className="bg-[#F4B32A] border-b-4 border-[#0F1C30] px-4 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-bebas text-2xl text-[#0F1C30] tracking-wider leading-none">
                        MAIN FLOOR
                      </span>
                      <span className="bg-[#FAF6ED] text-[#0F1C30] font-bebas text-xs px-2.5 py-0.5 rounded border-2 border-[#0F1C30] tracking-wider">
                        225 SEATS TOTAL • 20 VIP (RESERVED / NOT BOOKABLE) • 205 REGULAR
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-[#0F1C30] bg-[#FAF6ED]/40" />
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-[#0F1C30] bg-[#FAF6ED]/40" />
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-[#0F1C30] bg-[#FAF6ED]/40" />
                    </div>
                  </div>

                  {/* Main Floor Matrix (Rows H -> A top-to-bottom) */}
                  <div className="p-4 sm:p-6 flex items-end justify-center gap-2 sm:gap-3.5">
                    {/* Left Row Labels (H -> A) */}
                    <div className="flex flex-col gap-1.5 sm:gap-2 py-2.5">
                      {MAIN_FLOOR_ALL_ROWS.map((rowKey) => (
                        <div
                          key={`mf-lbl-l-${rowKey}`}
                          className="h-6 sm:h-7 w-5 font-bebas text-base text-[#0F1C30] flex items-center justify-center font-bold"
                        >
                          {rowKey}
                        </div>
                      ))}
                    </div>

                    {/* Left Wing Block (Row H: 15..11 aligned right; Rows G..A: 30..21) */}
                    <div className="border-2 border-[#0F1C30] rounded-xl p-2 sm:p-2.5 bg-white shadow-xs">
                      <div className="flex flex-col gap-1.5 sm:gap-2">
                        {MAIN_FLOOR_ALL_ROWS.map((rowKey) => {
                          const rowLookup = seatLookup[rowKey] || {};
                          if (rowKey === 'H') {
                            return (
                              <div key="mf-l-H" className="flex gap-1 sm:gap-1.5">
                                {MAIN_LEFT_ROW_H_SLOTS.map((num, idx) =>
                                  num === null
                                    ? renderSeatButton(undefined, `MF-H-empty-${idx}`)
                                    : renderSeatButton(rowLookup[num], `MF-H-${num}`)
                                )}
                              </div>
                            );
                          }
                          return (
                            <div key={`mf-l-${rowKey}`} className="flex gap-1 sm:gap-1.5">
                              {MAIN_LEFT_SLOTS.map((num) =>
                                renderSeatButton(rowLookup[num], `MF-${rowKey}-${num}`)
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Center Block (Rows G..A: 20..11; Rows B & A Reserved VIP) */}
                    <div className="border-2 border-[#0F1C30] rounded-xl p-2 sm:p-2.5 bg-white shadow-xs self-end relative">
                      <div className="flex flex-col gap-1.5 sm:gap-2">
                        {MAIN_FLOOR_CENTER_ROWS.map((rowKey) => {
                          const rowLookup = seatLookup[rowKey] || {};
                          return (
                            <div key={`mf-c-${rowKey}`} className="flex gap-1 sm:gap-1.5">
                              {MAIN_CENTER_SLOTS.map((num) =>
                                renderSeatButton(rowLookup[num], `MF-${rowKey}-${num}`)
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Right Wing Block (Rows H..A: 10..1) */}
                    <div className="border-2 border-[#0F1C30] rounded-xl p-2 sm:p-2.5 bg-white shadow-xs">
                      <div className="flex flex-col gap-1.5 sm:gap-2">
                        {MAIN_FLOOR_ALL_ROWS.map((rowKey) => {
                          const rowLookup = seatLookup[rowKey] || {};
                          return (
                            <div key={`mf-r-${rowKey}`} className="flex gap-1 sm:gap-1.5">
                              {MAIN_RIGHT_SLOTS.map((num) =>
                                renderSeatButton(rowLookup[num], `MF-${rowKey}-${num}`)
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Right Row Labels (H -> A) */}
                    <div className="flex flex-col gap-1.5 sm:gap-2 py-2.5">
                      {MAIN_FLOOR_ALL_ROWS.map((rowKey) => (
                        <div
                          key={`mf-lbl-r-${rowKey}`}
                          className="h-6 sm:h-7 w-5 font-bebas text-base text-[#0F1C30] flex items-center justify-center font-bold"
                        >
                          {rowKey}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ================= 3. STAGE BANNER (BOTTOM) ================= */}
              <div className="max-w-3xl mx-auto pt-2">
                <div className="flex items-center justify-center gap-4">
                  <div className="flex-1 h-1 bg-[#FAF6ED]/80 rounded-full" />
                  <div className="px-8 py-2 bg-[#FAF6ED] text-[#0F1C30] rounded-xl border-3 border-[#0F1C30] shadow-[4px_4px_0_#060c15]">
                    <span className="font-bebas text-3xl sm:text-4xl tracking-[0.25em] pl-[0.25em] font-black">
                      STAGE
                    </span>
                  </div>
                  <div className="flex-1 h-1 bg-[#FAF6ED]/80 rounded-full" />
                </div>
              </div>

              {/* ================= 4. POSTER LEGEND PILL + STATUS GUIDE ================= */}
              <div className="space-y-4">
                <div className="max-w-xl mx-auto bg-[#FAF6ED] text-[#0F1C30] rounded-2xl border-4 border-[#0F1C30] shadow-[5px_5px_0_#060c15] grid grid-cols-2 divide-x-3 divide-[#0F1C30] overflow-hidden">
                  <div className="px-4 py-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-[#0D6BA8] border-2 border-[#0F1C30] shrink-0" />
                      <span className="font-bold text-xs sm:text-sm leading-tight">
                        Regular Seat
                      </span>
                    </div>
                    <span className="font-bebas text-2xl sm:text-3xl text-[#0F1C30] tracking-wider">
                      35K
                    </span>
                  </div>
                  <div className="px-4 py-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-[#E85D1A] border-2 border-[#0F1C30] shrink-0" />
                      <span className="font-bold text-xs sm:text-sm leading-tight">
                        VIP Seat
                      </span>
                    </div>
                    <span className="font-bebas text-2xl sm:text-3xl text-[#0F1C30] tracking-wider">
                      50K
                    </span>
                  </div>
                </div>

                {/* Additional Interactive State Legend */}
                <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-200">
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded bg-[#E85D1A] border border-[#0F1C30]" />
                    <span>VIP Balcony (Rp 50.000 • Available to Book)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded bg-[#E85D1A] border border-[#A83B0B] opacity-70" />
                    <span>VIP Main Floor A–B (Reserved / Cannot Be Booked)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded bg-[#0D6BA8] border border-[#0F1C30]" />
                    <span>Regular Pass (Rp 35.000)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded bg-[#F4B32A] border border-[#0F1C30]" />
                    <span>Your Selection</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded bg-slate-500 opacity-60 border border-slate-700 line-through" />
                    <span>Sold Out</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Hovered Seat Quick Tooltip */}
          {hoveredSeat && (
            <div className="mt-4 sm:mt-0 sm:absolute sm:bottom-4 sm:left-4 z-30 bg-[#0F1C30]/95 backdrop-blur-sm border-2 border-[#F4B32A] p-2.5 rounded-xl text-xs space-y-0.5 shadow-xl animate-in fade-in duration-100">
              <div className="font-bebas text-base text-[#F4B32A] leading-tight">
                SEAT {hoveredSeat.label} •{' '}
                {hoveredSeat.category === 'VIP'
                  ? 'VIP MAIN FLOOR (RESERVED)'
                  : hoveredSeat.category === 'VIP_BALCONY'
                    ? 'VIP BALCONY'
                    : 'REGULAR'}
              </div>
              <div className="text-[11px] text-slate-300">
                Tier Price: <strong>Rp {hoveredSeat.price.toLocaleString('id-ID')}</strong> •{' '}
                {hoveredSeat.section === 'BALCONY' ? 'Balcony Level' : 'Main Floor Level'}
              </div>
              <div
                className={`text-[10px] font-bold uppercase ${
                  hoveredSeat.category === 'VIP' ? 'text-amber-400 font-black' : 'text-emerald-400'
                }`}
              >
                Status:{' '}
                {hoveredSeat.category === 'VIP'
                  ? 'RESERVED (INVITATION ONLY • CANNOT BE BOOKED)'
                  : hoveredSeat.status === 'sold'
                    ? 'SOLD OUT'
                    : hoveredSeat.status === 'held'
                      ? 'TEMPORARILY HELD'
                      : 'AVAILABLE TO SELECT'}
              </div>
            </div>
          )}

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
                type="button"
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
