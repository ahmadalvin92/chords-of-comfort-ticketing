'use client';

import React, { useState, useEffect } from 'react';
import { Seat, CustomerInfo, Order } from '@/types/ticket';
import {
  X,
  Ticket,
  User,
  Mail,
  Phone,
  ShieldCheck,
  CreditCard,
  QrCode,
  Building,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSeats: Seat[];
  onOrderCreated: (order: Order, snapToken?: string, hasLiveMidtrans?: boolean) => void;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  selectedSeats,
  onOrderCreated,
}: CheckoutModalProps) {
  const [customer, setCustomer] = useState<CustomerInfo>({
    fullName: '',
    email: '',
    phone: '',
    notes: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<'QRIS' | 'BCA_VA' | 'MANDIRI_VA' | 'EWALLET'>('QRIS');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 10-minute countdown for holding seats
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(600);

  useEffect(() => {
    if (!isOpen) return;
    setTimeLeftSeconds(600);

    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const totalAmount = selectedSeats.reduce((sum, s) => sum + s.price, 0);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!customer.fullName.trim() || !customer.email.trim() || !customer.phone.trim()) {
      setErrorMsg('Mohon lengkapi Nama, Email, dan Nomor WhatsApp Anda.');
      return;
    }

    if (!customer.email.includes('@') || !customer.email.includes('.')) {
      setErrorMsg('Format email tidak valid. Pastikan email benar untuk penerimaan e-ticket.');
      return;
    }

    if (!agreedToTerms) {
      setErrorMsg('Silakan setujui syarat & ketentuan sebelum melanjutkan.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Get or create customer sessionId in browser
      let sessionId = localStorage.getItem('lspr_session_id');
      if (!sessionId) {
        sessionId = `sess_${Math.random().toString(36).substring(2, 10)}`;
        localStorage.setItem('lspr_session_id', sessionId);
      }

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer,
          seatIds: selectedSeats.map((s) => s.id),
          sessionId,
          paymentMethod,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Terjadi kesalahan saat memproses pesanan.');
      }

      onOrderCreated(data.order, data.snapToken, data.hasLiveMidtrans);
    } catch (err) {
      setErrorMsg((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#F8F5EE] rounded-3xl border-4 border-[#0F1C30] shadow-[0_12px_0_#0F1C30] overflow-hidden my-8 animate-in zoom-in-95 duration-200">
        
        {/* Header Modal */}
        <div className="bg-[#182B49] text-white p-5 border-b-4 border-[#F4B32A] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C1272D] border border-[#F4B32A] flex items-center justify-center">
              <Ticket className="w-5 h-5 text-[#F4B32A]" />
            </div>
            <div>
              <h3 className="font-bebas text-2xl tracking-wider text-[#FAF6ED] leading-none">
                FORMULIR PEMBELIAN TIKET
              </h3>
              <p className="text-xs text-slate-300 font-medium">
                COMM30-6SP Musical Theater • LSPR Sudirman Park
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Hold Countdown Notice */}
        <div className="bg-amber-100 border-b-2 border-amber-300 px-5 py-2.5 flex items-center justify-between text-xs font-bold text-amber-900">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600 animate-spin" />
            <span>Kursi dikunci untuk Anda selama:</span>
          </div>
          <span className="font-mono bg-amber-200 px-2 py-0.5 rounded text-sm text-amber-950 font-black">
            {formatTimer(timeLeftSeconds)}
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {errorMsg && (
            <div className="bg-red-100 border-2 border-red-400 text-red-800 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Customer Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 font-bebas text-lg text-[#182B49]">
              <User className="w-4 h-4 text-[#C1272D]" />
              <span>DATA DIRI PEMBELI (SESUAI IDENTITAS)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Nama Lengkap *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Jessica Aurelia"
                    value={customer.fullName}
                    onChange={(e) => setCustomer({ ...customer, fullName: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 bg-white rounded-xl border-2 border-slate-300 focus:border-[#182B49] focus:outline-none text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Nomor WhatsApp/HP *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                  <input
                    type="tel"
                    required
                    placeholder="081234567890"
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 bg-white rounded-xl border-2 border-slate-300 focus:border-[#182B49] focus:outline-none text-sm font-medium"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Alamat Email (Untuk Pengiriman E-Ticket) *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="jessica@gmail.com"
                  value={customer.email}
                  onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                  className="w-full pl-9 pr-3 py-2.5 bg-white rounded-xl border-2 border-slate-300 focus:border-[#182B49] focus:outline-none text-sm font-medium"
                />
              </div>
              <p className="text-[11px] text-slate-500 font-semibold mt-1">
                E-Ticket resmi ber-QR Code akan dikirim otomatis ke alamat email ini setelah pembayaran berhasil.
              </p>
            </div>
          </div>

          {/* Section 2: Selected Seats Summary */}
          <div className="bg-white p-4 rounded-2xl border-2 border-[#182B49] shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="font-bebas text-lg text-[#182B49]">RINGKASAN PESANAN</span>
              <span className="text-xs font-bold text-slate-500">{selectedSeats.length} Kursi Dipilih</span>
            </div>

            <div className="max-h-36 overflow-y-auto space-y-2 pr-1">
              {selectedSeats.map((seat) => (
                <div
                  key={seat.id}
                  className="flex items-center justify-between text-xs font-semibold py-1 border-b border-dashed border-slate-100 last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bebas text-sm bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                      {seat.label}
                    </span>
                    <span className="text-slate-700">
                      {seat.category} ({seat.section === 'BALCONY' ? 'Balkon' : 'Main Floor'})
                    </span>
                  </div>
                  <span className="font-bold text-[#182B49]">
                    Rp {seat.price.toLocaleString('id-ID')}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-300 flex items-center justify-between">
              <span className="font-bebas text-xl text-[#182B49]">TOTAL TAGIHAN</span>
              <span className="font-bebas text-2xl text-[#C1272D]">
                Rp {totalAmount.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {/* Section 3: Payment Method */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase text-slate-700">
              Pilih Metode Pembayaran
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              
              <button
                type="button"
                onClick={() => setPaymentMethod('QRIS')}
                className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                  paymentMethod === 'QRIS'
                    ? 'border-[#182B49] bg-amber-50 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <QrCode className="w-4 h-4 text-[#C1272D]" />
                  <span className="font-bold text-xs text-slate-900">QRIS (Instant)</span>
                </div>
                <p className="text-[10px] text-slate-500">GoPay, OVO, BCA, Dana, dll</p>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('BCA_VA')}
                className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                  paymentMethod === 'BCA_VA'
                    ? 'border-[#182B49] bg-amber-50 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Building className="w-4 h-4 text-blue-600" />
                  <span className="font-bold text-xs text-slate-900">BCA VA</span>
                </div>
                <p className="text-[10px] text-slate-500">Virtual Account Otomatis</p>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('MANDIRI_VA')}
                className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                  paymentMethod === 'MANDIRI_VA'
                    ? 'border-[#182B49] bg-amber-50 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Building className="w-4 h-4 text-amber-600" />
                  <span className="font-bold text-xs text-slate-900">Mandiri VA</span>
                </div>
                <p className="text-[10px] text-slate-500">Livin & ATM Transfer</p>
              </button>

            </div>
          </div>

          {/* Section 4: Terms */}
          <div className="pt-2">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-slate-300 text-[#182B49] focus:ring-[#182B49]"
              />
              <span className="text-xs text-slate-600 font-medium leading-relaxed">
                Saya menyetujui bahwa nomor kursi yang dipilih tidak dapat ditukar dan tiket yang sudah dibeli bersifat non-refundable sesuai ketentuan panitia LSPR COMM30-6SP.
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || timeLeftSeconds <= 0}
            className="w-full cursor-pointer bg-[#C1272D] hover:bg-[#a61f25] disabled:bg-slate-400 text-white py-4 rounded-xl font-bebas text-2xl tracking-wider border-3 border-[#0F1C30] shadow-[0_5px_0_#0F1C30] hover:translate-y-0.5 active:translate-y-1 transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span className="animate-pulse">MEMPROSES TRANSAKSI...</span>
            ) : (
              <>
                <CreditCard className="w-6 h-6 text-[#F4B32A]" />
                <span>LANJUT KE PEMBAYARAN ONLINE</span>
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-2 text-[11px] font-bold text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Integrasi Aman Payment Gateway Midtrans & Xendit</span>
          </div>

        </form>

      </div>
    </div>
  );
}

