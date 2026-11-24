'use client';

import React, { useEffect, useState, use, Suspense } from 'react';
import Link from 'next/link';
import { Order } from '@/types/ticket';
import QRCode from 'qrcode';
import {
  Ticket,
  Printer,
  ArrowLeft,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  AlertCircle,
  MessageCircle,
} from 'lucide-react';

function TicketContent({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.orderId;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  useEffect(() => {
    let active = true;

    async function loadOrder(showSpinner = false) {
      if (showSpinner) setLoading(true);
      try {
        const res = await fetch(`/api/ticket/${orderId}`, { cache: 'no-store' });
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Ticket not found.');
        }

        if (!active) return;
        setOrder(data.order);

        // Generate high-resolution scannable QR Code
        const qrUrl = await QRCode.toDataURL(data.order.qrPayload, {
          width: 320,
          margin: 1,
          color: { dark: '#0F1C30', light: '#FFFFFF' },
          errorCorrectionLevel: 'M',
        });
        if (active) setQrCodeUrl(qrUrl);
      } catch (err) {
        if (active) setError((err as Error).message);
      } finally {
        if (active && showSpinner) setLoading(false);
      }
    }

    loadOrder(true);

    // Poll every 10s so ticket auto-activates when admin verifies payment
    const interval = setInterval(() => {
      loadOrder(false);
    }, 10000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [orderId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F5EE] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-xl bg-[#C1272D] border-2 border-[#F4B32A] flex items-center justify-center text-white animate-spin mb-4">
          <Ticket className="w-6 h-6 text-[#F4B32A]" />
        </div>
        <div className="font-bebas text-2xl text-[#182B49] tracking-wider">
          LOADING OFFICIAL E-TICKET...
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#F8F5EE] flex flex-col items-center justify-center p-4 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4 border-2 border-red-300">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="font-bebas text-3xl text-[#182B49] mb-2">TICKET NOT FOUND</h2>
        <p className="text-slate-600 text-sm max-w-md mb-6">{error || 'Please verify your Order ID.'}</p>
        <Link
          href="/"
          className="bg-[#182B49] text-white px-6 py-2.5 rounded-xl font-bebas text-lg tracking-wider border-2 border-[#0F1C30] hover:bg-[#C1272D] transition-colors"
        >
          Return to Homepage
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F5EE] py-8 px-4 sm:px-6 lg:px-8">

      {/* Top Bar (Hidden during printing) */}
      <div className="max-w-3xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#182B49] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Website</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="cursor-pointer inline-flex items-center gap-2 bg-[#182B49] hover:bg-[#0F1C30] text-white px-4 py-2 rounded-xl text-xs font-bold border-2 border-[#0F1C30] shadow-sm hover:translate-y-0.5 transition-all"
          >
            <Printer className="w-4 h-4 text-[#F4B32A]" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Main E-Ticket Container */}
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Status Banner (Hidden during printing) */}
        {order.paymentStatus === 'paid' ? (
          <div className="bg-emerald-50 border-2 border-emerald-400 p-4 rounded-2xl flex items-center justify-between text-emerald-900 shadow-sm print:hidden">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0 border border-emerald-300">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <div className="font-bebas text-lg leading-tight text-emerald-900">
                  OFFICIAL E-TICKET ACTIVE (PAID)
                </div>
                <p className="text-xs text-emerald-700 font-medium">
                  Payment Verified • Present this QR Code to registration staff on show day.
                </p>
              </div>
            </div>
            <span className="font-mono text-xs font-black bg-emerald-200 px-3 py-1 rounded-lg">
              #{order.id}
            </span>
          </div>
        ) : (
          <div className="bg-amber-50 border-2 border-amber-400 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-amber-900 shadow-sm print:hidden">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 border border-amber-300">
                <Clock className="w-6 h-6 text-amber-600 animate-spin" />
              </div>
              <div>
                <div className="font-bebas text-lg leading-tight text-amber-900">
                  AWAITING BANK TRANSFER VERIFICATION
                </div>
                <p className="text-xs text-amber-800 font-medium">
                  Your seats are temporarily held. Please send your Bank Mandiri transfer receipt to WhatsApp to activate your official ticket.
                </p>
              </div>
            </div>
            <a
              href={`https://wa.me/6281915348866?text=${encodeURIComponent(
                `Hello Chords of Comfort Ticketing Team! I would like to confirm my Bank Mandiri transfer payment for Order ID: #${order.id} under the name: ${order.customer.fullName}.`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="bg-[#25D366] hover:bg-[#20ba59] text-white px-4 py-2 rounded-xl text-xs font-bold border border-slate-900 shadow-sm flex items-center gap-1.5 shrink-0"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Send Receipt via WhatsApp</span>
            </a>
          </div>
        )}

        {/* ================= PHYSICAL ADMIT-ONE RETRO TICKET DESIGN ================= */}
        <div className="bg-white rounded-3xl border-4 border-[#0F1C30] shadow-[0_12px_0_#0F1C30] overflow-hidden relative">

          {/* Header Banner - American High School Varsity */}
          <div className="bg-[#182B49] text-white p-6 border-b-4 border-[#F4B32A] relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-[#C1272D] border-2 border-[#F4B32A] flex items-center justify-center font-bebas text-3xl text-[#FAF6ED] shadow-md -rotate-3">
                  6SP
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 bg-[#F4B32A] text-[#0F1C30] font-bebas text-xs px-2.5 py-0.5 rounded border border-[#0F1C30] mb-1">
                    <Sparkles className="w-3 h-3" /> OFFICIAL ADMIT-ONE PASS
                  </div>
                  <h1 className="font-bebas text-3xl sm:text-4xl tracking-wider text-[#FAF6ED] leading-none">
                    CHORDS OF COMFORT
                  </h1>
                  <p className="text-xs font-semibold text-slate-300">
                    The 35th LSPR Theater Festival • COMM30-6SP Musical Theater
                  </p>
                </div>
              </div>

              <div className="text-right sm:border-l-2 sm:border-dashed sm:border-slate-700 sm:pl-6">
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  ORDER ID
                </div>
                <div className="font-mono font-black text-xl text-[#F4B32A]">#{order.id}</div>
                <div className="text-[10px] font-semibold text-emerald-400">
                  STATUS: {order.paymentStatus === 'paid' ? 'PAID (VERIFIED)' : 'PENDING'}
                </div>
              </div>
            </div>
          </div>

          {/* Ticket Body: Info & QR Code Side-by-Side */}
          <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative">

            {/* Left 7 Columns: Details */}
            <div className="md:col-span-7 space-y-5">

              {/* Customer Box */}
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Attendee Name
                </span>
                <div className="font-bebas text-3xl text-[#182B49] leading-tight">
                  {order.customer.fullName}
                </div>
                <div className="text-xs font-semibold text-slate-500">
                  {order.customer.email} • {order.customer.phone}
                </div>
              </div>

              {/* Event Date & Location */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t-2 border-dashed border-slate-200">
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-slate-500">
                    <Calendar className="w-3.5 h-3.5 text-[#C1272D]" />
                    <span>Date & Showtime</span>
                  </div>
                  <div className="font-bebas text-lg text-[#182B49] leading-none">
                    January 2027
                  </div>
                  <div className="text-xs font-bold text-slate-600">Showtime TBA (Gate TBA)</div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    <span>Venue Location</span>
                  </div>
                  <div className="font-bebas text-lg text-[#182B49] leading-none">
                    LSPR Bekasi
                  </div>
                  <div className="text-xs font-bold text-slate-600">Amani Palladium Theatre, Indonesia</div>
                </div>
              </div>

              {/* Seat Badges */}
              <div className="pt-3 border-t-2 border-dashed border-slate-200">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">
                  Assigned Seats ({order.items.length} Seats)
                </span>
                <div className="flex flex-wrap gap-2">
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-[#F8F5EE] border-2 border-[#0F1C30] rounded-xl px-3 py-1.5 shadow-[0_2px_0_#0F1C30]"
                    >
                      <div className="font-bebas text-xl text-[#C1272D] leading-none">
                        SEAT {item.seatLabel}
                      </div>
                      <div className="text-[10px] font-bold text-slate-600">
                        {item.category} • Rp {item.price.toLocaleString('id-ID')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right 5 Columns: Official Scannable QR Code */}
            <div className="md:col-span-5 flex flex-col items-center justify-center p-6 bg-[#FAF6ED] rounded-2xl border-2 border-dashed border-[#182B49] text-center">

              <div className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-2">
                SCAN AT VENUE GATE
              </div>

              <div className="p-3 bg-white rounded-2xl border-2 border-[#0F1C30] shadow-md relative overflow-hidden">
                {qrCodeUrl ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={qrCodeUrl}
                      alt="Ticket QR Code"
                      className={`w-48 h-48 object-contain rounded-lg transition-all ${
                        order.paymentStatus !== 'paid' ? 'blur-sm opacity-40 select-none pointer-events-none' : ''
                      }`}
                    />
                    {order.paymentStatus !== 'paid' && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-3 bg-amber-50/60">
                        <span className="bg-[#182B49] text-[#F4B32A] font-bebas text-sm px-3 py-1 rounded-md border-2 border-[#0F1C30] tracking-wider shadow-sm">
                          PENDING VERIFICATION
                        </span>
                        <span className="text-[10px] font-bold text-slate-800 mt-1.5 leading-tight">
                          QR activates automatically after transfer verification
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-48 h-48 bg-slate-100 flex items-center justify-center text-xs">
                    Generating QR...
                  </div>
                )}
              </div>

              <div className="mt-3">
                <div className="font-mono text-xs font-black text-[#182B49]">
                  {order.items[0]?.ticketCode}
                </div>
                <div className="text-[10px] font-bold text-slate-500 mt-0.5">
                  1 QR Code admits all seats under this order
                </div>
              </div>

            </div>

          </div>

          {/* Ticket Footer / Instructions */}
          <div className="bg-[#F8F5EE] p-4 border-t-2 border-dashed border-slate-300 text-center text-xs font-medium text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>
              ★ Present this ticket (printed or on mobile screen) to registration staff at Amani Palladium Theatre, LSPR Bekasi.
            </span>
            <span className="font-mono font-bold text-slate-400">
              NON-REFUNDABLE • COMM30-6SP
            </span>
          </div>

          {/* Retro Cutout Perforations on Sides */}
          <div className="absolute top-1/2 -left-4 -translate-y-1/2 w-8 h-8 rounded-full bg-[#F8F5EE] border-r-2 border-[#0F1C30]" />
          <div className="absolute top-1/2 -right-4 -translate-y-1/2 w-8 h-8 rounded-full bg-[#F8F5EE] border-l-2 border-[#0F1C30]" />

        </div>

        {/* Bottom Actions for Mobile & Desktop (Hidden on Print) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 print:hidden">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#182B49] hover:bg-[#0F1C30] text-white px-6 py-3.5 rounded-xl font-bebas text-lg tracking-wider border-2 border-[#0F1C30] shadow-[0_3px_0_#0F1C30] transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-[#F4B32A]" />
            <span>RETURN TO HOMEPAGE</span>
          </Link>

          <button
            onClick={handlePrint}
            className="w-full sm:w-auto cursor-pointer inline-flex items-center justify-center gap-2 bg-[#C1272D] hover:bg-[#a61f25] text-white px-6 py-3.5 rounded-xl font-bebas text-lg tracking-wider border-2 border-[#0F1C30] shadow-[0_3px_0_#0F1C30] transition-all"
          >
            <Printer className="w-5 h-5 text-[#F4B32A]" />
            <span>PRINT / SAVE AS PDF</span>
          </button>
        </div>

      </div>

    </div>
  );
}

export default function TicketPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8F5EE] flex flex-col items-center justify-center p-4">
          <div className="font-bebas text-2xl text-[#182B49]">LOADING TICKET...</div>
        </div>
      }
    >
      <TicketContent params={params} />
    </Suspense>
  );
}
