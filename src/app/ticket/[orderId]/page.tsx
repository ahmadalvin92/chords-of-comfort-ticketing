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
    async function loadOrder() {
      try {
        const res = await fetch(`/api/ticket/${orderId}`);
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Tiket tidak ditemukan.');
        }

        setOrder(data.order);

        // Generate high-resolution scannable QR Code
        const qrUrl = await QRCode.toDataURL(data.order.qrPayload, {
          width: 320,
          margin: 1,
          color: { dark: '#0F1C30', light: '#FFFFFF' },
          errorCorrectionLevel: 'M',
        });
        setQrCodeUrl(qrUrl);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
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
          MEMUAT E-TICKET RESMI...
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
        <h2 className="font-bebas text-3xl text-[#182B49] mb-2">TIKET TIDAK DITEMUKAN</h2>
        <p className="text-slate-600 text-sm max-w-md mb-6">{error || 'Silakan periksa kembali Order ID Anda.'}</p>
        <Link
          href="/"
          className="bg-[#182B49] text-white px-6 py-2.5 rounded-xl font-bebas text-lg tracking-wider border-2 border-[#0F1C30] hover:bg-[#C1272D] transition-colors"
        >
          Kembali ke Beranda
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
          <span>Kembali ke Website</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="cursor-pointer inline-flex items-center gap-2 bg-[#182B49] hover:bg-[#0F1C30] text-white px-4 py-2 rounded-xl text-xs font-bold border-2 border-[#0F1C30] shadow-sm hover:translate-y-0.5 transition-all"
          >
            <Printer className="w-4 h-4 text-[#F4B32A]" />
            <span>Cetak / Simpan PDF</span>
          </button>
        </div>
      </div>

      {/* Main E-Ticket Container */}
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Status Banner (Hidden during printing) */}
        <div className="bg-emerald-50 border-2 border-emerald-400 p-4 rounded-2xl flex items-center justify-between text-emerald-900 shadow-sm print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0 border border-emerald-300">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <div className="font-bebas text-lg leading-tight text-emerald-900">
                E-TICKET BERHASIL DITERBITKAN
              </div>
              <p className="text-xs text-emerald-700 font-medium">
                Status Pembayaran: <span className="font-bold uppercase">{order.paymentStatus}</span> • Dikirim ke {order.customer.email}
              </p>
            </div>
          </div>
          <span className="font-mono text-xs font-black bg-emerald-200 px-3 py-1 rounded-lg">
            {order.id}
          </span>
        </div>

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
                    LSPR COMM30-6SP Musical Theater • Sudirman Park Jakarta
                  </p>
                </div>
              </div>

              <div className="text-right sm:border-l-2 sm:border-dashed sm:border-slate-700 sm:pl-6">
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  ORDER ID
                </div>
                <div className="font-mono font-black text-xl text-[#F4B32A]">{order.id}</div>
                <div className="text-[10px] font-semibold text-emerald-400">
                  PAID: {order.paidAt ? new Date(order.paidAt).toLocaleDateString('id-ID') : 'PAID'}
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
                  Nama Pemegang Tiket
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
                    <span>Tanggal & Waktu</span>
                  </div>
                  <div className="font-bebas text-lg text-[#182B49] leading-none">
                    Sabtu, 19 Des 2026
                  </div>
                  <div className="text-xs font-bold text-slate-600">18:30 WIB (Gate 17:00)</div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    <span>Lokasi Venue</span>
                  </div>
                  <div className="font-bebas text-lg text-[#182B49] leading-none">
                    Auditorium LSPR
                  </div>
                  <div className="text-xs font-bold text-slate-600">Sudirman Park Lt. 2</div>
                </div>
              </div>

              {/* Seat Badges */}
              <div className="pt-3 border-t-2 border-dashed border-slate-200">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">
                  Nomor Kursi & Kategori Terdaftar ({order.items.length} Kursi)
                </span>
                <div className="flex flex-wrap gap-2">
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-[#F8F5EE] border-2 border-[#0F1C30] rounded-xl px-3 py-1.5 shadow-[0_2px_0_#0F1C30]"
                    >
                      <div className="font-bebas text-xl text-[#C1272D] leading-none">
                        KURSI {item.seatLabel}
                      </div>
                      <div className="text-[10px] font-bold text-slate-600">
                        {item.category} • Rp{item.price.toLocaleString('id-ID')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right 5 Columns: Official Scannable QR Code */}
            <div className="md:col-span-5 flex flex-col items-center justify-center p-6 bg-[#FAF6ED] rounded-2xl border-2 border-dashed border-[#182B49] text-center">
              
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-2">
                SCAN SAAT MEMASUKI GATE
              </div>

              <div className="p-3 bg-white rounded-2xl border-2 border-[#0F1C30] shadow-md">
                {qrCodeUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={qrCodeUrl}
                    alt="Ticket QR Code"
                    className="w-48 h-48 object-contain rounded-lg"
                  />
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
                  1 QR Code berlaku untuk seluruh kursi di pesanan ini
                </div>
              </div>

            </div>

          </div>

          {/* Ticket Footer / Instructions */}
          <div className="bg-[#F8F5EE] p-4 border-t-2 border-dashed border-slate-300 text-center text-xs font-medium text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>
              ★ Tunjukkan tiket ini (cetak atau dari layar ponsel) kepada petugas di pintu masuk LSPR Sudirman Park.
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
            <span>KEMBALI KE BERANDA (BELI TIKET LAGI)</span>
          </Link>

          <button
            onClick={handlePrint}
            className="w-full sm:w-auto cursor-pointer inline-flex items-center justify-center gap-2 bg-[#C1272D] hover:bg-[#a61f25] text-white px-6 py-3.5 rounded-xl font-bebas text-lg tracking-wider border-2 border-[#0F1C30] shadow-[0_3px_0_#0F1C30] transition-all"
          >
            <Printer className="w-5 h-5 text-[#F4B32A]" />
            <span>CETAK / SIMPAN SEBAGAI PDF</span>
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
          <div className="font-bebas text-2xl text-[#182B49]">MEMUAT TIKET...</div>
        </div>
      }
    >
      <TicketContent params={params} />
    </Suspense>
  );
}
