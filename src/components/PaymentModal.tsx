'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Order } from '@/types/ticket';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import {
  X,
  QrCode,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  snapToken?: string;
  hasLiveMidtrans?: boolean;
}

export default function PaymentModal({
  isOpen,
  onClose,
  order,
  snapToken,
  hasLiveMidtrans,
}: PaymentModalProps) {
  const router = useRouter();
  const [qrisQrDataUrl, setQrisQrDataUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Handle browser back button (popstate) & lock body scroll
  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = 'hidden';
    window.history.pushState({ modal: 'payment' }, '');

    const handlePopState = () => {
      onClose();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !order) return;

    // Generate simulated QRIS payload
    const qrisMockPayload = `00020101021226670014ID.LINKAJA.WWW01189360000201100000000215${order.id}520458125303360540${order.totalAmount}5802ID5920LSPR COMM30-6SP TCK6007JAKARTA6304D1A2`;

    QRCode.toDataURL(qrisMockPayload, {
      width: 260,
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' },
    }).then((url) => {
      setQrisQrDataUrl(url);
    });

    // If live Snap is ready and user is using Midtrans Snap
    if (hasLiveMidtrans && snapToken && typeof window !== 'undefined' && (window as any).snap) {
      (window as any).snap.pay(snapToken, {
        onSuccess: function () {
          handleConfirmPayment();
        },
        onPending: function (result: any) {
          console.log('Payment pending', result);
        },
        onError: function (result: any) {
          console.error('Payment error', result);
        },
        onClose: function () {
          console.log('Customer closed popup without payment');
        },
      });
    }
  }, [isOpen, order, snapToken, hasLiveMidtrans]);

  if (!isOpen || !order) return null;

  const handleConfirmPayment = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/payment/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          paymentMethod: order.paymentMethod || 'QRIS',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setPaymentSuccess(true);
        // Trigger celebratory confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });

        setTimeout(() => {
          router.push(`/ticket/${order.id}`);
        }, 1500);
      }
    } catch (err) {
      console.error('Error confirming payment:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl border-3 sm:border-4 border-[#0F1C30] shadow-[0_12px_0_#0F1C30] overflow-hidden my-4 sm:my-8 max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Sticky Header with Prominent Back Button */}
        <div className="sticky top-0 z-30 bg-[#182B49] text-white p-3.5 sm:p-5 border-b-4 border-[#F4B32A] flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer flex items-center gap-1.5 bg-[#C1272D] hover:bg-[#a61f25] text-white px-3 py-1.5 rounded-xl text-xs font-bold border-2 border-[#F4B32A] shadow-sm transition-all active:scale-95"
              title="Kembali ke Form Pemesanan"
            >
              <ArrowLeft className="w-4 h-4 text-[#F4B32A]" />
              <span className="font-bebas text-sm tracking-wider">KEMBALI</span>
            </button>

            <div>
              <h3 className="font-bebas text-lg sm:text-xl text-[#FAF6ED] leading-none">
                PEMBAYARAN {order.paymentMethod || 'QRIS'}
              </h3>
              <p className="text-[10px] sm:text-[11px] text-slate-300">Order ID: {order.id}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Tutup"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {paymentSuccess ? (
          <div className="p-6 sm:p-8 text-center space-y-4 overflow-y-auto flex-1">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border-2 border-emerald-400 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="font-bebas text-3xl text-[#182B49]">PEMBAYARAN BERHASIL!</h4>
            <p className="text-xs text-slate-600 font-semibold">
              Terima kasih! Tiket Anda telah diterbitkan dan dikirimkan ke email{' '}
              <span className="font-bold text-[#182B49]">{order.customer.email}</span>.
            </p>
            <div className="pt-2">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 animate-pulse">
                <span>Membuka E-Ticket Anda...</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 sm:p-6 text-center space-y-4 overflow-y-auto flex-1">
            
            {/* Amount details */}
            <div className="bg-[#F8F5EE] p-3 rounded-2xl border-2 border-[#182B49]">
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                Total Tagihan
              </span>
              <div className="font-bebas text-3xl sm:text-4xl text-[#C1272D] leading-tight">
                Rp {order.totalAmount.toLocaleString('id-ID')}
              </div>
              <p className="text-xs font-semibold text-slate-600 mt-0.5">
                {order.items.length} Kursi: {order.items.map((i) => i.seatLabel).join(', ')}
              </p>
            </div>

            {/* QR Code Container */}
            <div className="flex flex-col items-center">
              <div className="p-3 sm:p-4 bg-white rounded-2xl border-2 border-slate-300 shadow-md relative">
                {qrisQrDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={qrisQrDataUrl}
                    alt="QRIS Payment Code"
                    className="w-44 h-44 sm:w-52 sm:h-52 object-contain rounded-lg mx-auto"
                  />
                ) : (
                  <div className="w-44 h-44 sm:w-52 sm:h-52 bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                    Membuat Kode QR...
                  </div>
                )}
                <div className="mt-2 flex items-center justify-center gap-1 text-[10px] sm:text-[11px] font-black text-slate-700 tracking-wider">
                  <span>QRIS STANDAR PEMBAYARAN NASIONAL</span>
                </div>
              </div>

              <div className="mt-2 text-xs font-medium text-slate-500 max-w-xs">
                Pindai kode QR menggunakan GoPay, OVO, Dana, BCA Mobile, atau aplikasi bank apapun.
              </div>
            </div>

            {/* Simulated Payment Action for Testing / Sandbox */}
            <div className="pt-2 border-t-2 border-dashed border-slate-200 space-y-2.5">
              <div className="bg-amber-50 p-2.5 sm:p-3 rounded-xl border border-amber-300 text-left">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Mode Simulasi Pembayaran / Sandbox</span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-amber-800">
                  Untuk pengujian, klik tombol hijau di bawah untuk konfirmasi bayar instan.
                </p>
              </div>

              <button
                type="button"
                onClick={handleConfirmPayment}
                disabled={isProcessing}
                className="w-full cursor-pointer bg-[#10B981] hover:bg-[#059669] text-white py-3 sm:py-3.5 rounded-xl font-bebas text-lg sm:text-xl tracking-wider border-2 border-[#0F1C30] shadow-[0_4px_0_#0F1C30] hover:translate-y-0.5 active:translate-y-1 transition-all flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <span>MEMVERIFIKASI PEMBAYARAN...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-amber-200" />
                    <span>SIMULASI PEMBAYARAN BERHASIL (TEST PAY)</span>
                  </>
                )}
              </button>

              {/* Bottom Back Button */}
              <button
                type="button"
                onClick={onClose}
                className="w-full cursor-pointer bg-[#EBE5D8] hover:bg-[#ded6c4] text-[#182B49] py-2.5 rounded-xl font-bebas text-base tracking-wider border-2 border-[#182B49] shadow-[0_2px_0_#182B49] hover:translate-y-0.5 transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4 text-[#C1272D]" />
                <span>← BATAL / KEMBALI UBAH KURSI</span>
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
