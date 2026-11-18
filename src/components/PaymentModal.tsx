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
  Copy,
  Check,
  MessageCircle,
  Building,
  CreditCard,
  ExternalLink,
  ShieldAlert,
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
  const [copiedBank, setCopiedBank] = useState<string | null>(null);

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

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBank(label);
    setTimeout(() => setCopiedBank(null), 2500);
  };

  const handleConfirmPayment = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/payment/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          paymentMethod: order.paymentMethod || 'MANUAL_TRANSFER',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setPaymentSuccess(true);
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

  // WhatsApp confirmation message template
  const waTemplate = `Halo Panitia Ticketing Chords of Comfort! 👋%0A%0ASaya ingin konfirmasi pembayaran tiket teater musikal:%0A• Order ID: ${order.id}%0A• Nama: ${encodeURIComponent(order.customer.fullName)}%0A• No. WhatsApp: ${encodeURIComponent(order.customer.phone)}%0A• Kursi: ${encodeURIComponent(order.items.map((i) => i.seatLabel).join(', '))}%0A• Kategori: ${encodeURIComponent(order.items[0]?.category || 'REGULAR')}%0A• Total Tagihan: Rp ${order.totalAmount.toLocaleString('id-ID')}%0A%0ABerikut saya lampirkan foto bukti transfernya. Mohon segera diverifikasi ya min, terima kasih! 🎭🎟️`;
  const waUrl = `https://wa.me/6281915348866?text=${waTemplate}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-2xl sm:rounded-3xl border-3 sm:border-4 border-[#0F1C30] shadow-[0_12px_0_#0F1C30] overflow-hidden my-4 sm:my-8 max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Sticky Header with Prominent Back Button */}
        <div className="sticky top-0 z-30 bg-[#182B49] text-white p-3.5 sm:p-4 border-b-4 border-[#F4B32A] flex items-center justify-between shrink-0 shadow-md">
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
                PEMBAYARAN TIKET
              </h3>
              <p className="text-[10px] sm:text-[11px] text-slate-300 font-mono">
                Order ID: #{order.id}
              </p>
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
            <h4 className="font-bebas text-3xl text-[#182B49]">PEMBAYARAN DITERIMA!</h4>
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
          <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 text-left">
            
            {/* Amount & Order details banner */}
            <div className="bg-[#F8F5EE] p-3.5 sm:p-4 rounded-2xl border-2 border-[#182B49] flex items-center justify-between">
              <div>
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-widest block">
                  Total yang Harus Ditransfer
                </span>
                <div className="font-bebas text-3xl sm:text-4xl text-[#C1272D] leading-none">
                  Rp {order.totalAmount.toLocaleString('id-ID')}
                </div>
                <p className="text-xs font-bold text-slate-700 mt-1">
                  {order.items.length} Kursi: {order.items.map((i) => i.seatLabel).join(', ')} ({order.items[0]?.category})
                </p>
              </div>

              <div className="text-right">
                <span className="inline-block bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider mb-1">
                  Menunggu Transfer
                </span>
                <p className="text-[11px] text-slate-500 font-medium">Batas: 60 Menit</p>
              </div>
            </div>

            {/* Rekening Tujuan Transfer */}
            <div className="space-y-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                Pilih Rekening Tujuan Transfer Panitia:
              </span>

              {/* Rekening 1: BCA */}
              <div className="p-3 bg-white rounded-xl border-2 border-slate-300 flex items-center justify-between shadow-sm hover:border-[#182B49] transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center font-bold text-blue-700 text-xs">
                    BCA
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm text-slate-900">7650892101</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">a.n. Viona / Panitia Chords of Comfort</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => copyToClipboard('7650892101', 'bca')}
                  className="cursor-pointer px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 border border-slate-300 transition-colors"
                >
                  {copiedBank === 'bca' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Salin</span>
                    </>
                  )}
                </button>
              </div>

              {/* Rekening 2: Mandiri */}
              <div className="p-3 bg-white rounded-xl border-2 border-slate-300 flex items-center justify-between shadow-sm hover:border-[#182B49] transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center font-bold text-amber-700 text-xs">
                    MANDIRI
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm text-slate-900">1220019283741</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">a.n. Panitia Chords of Comfort</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => copyToClipboard('1220019283741', 'mandiri')}
                  className="cursor-pointer px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 border border-slate-300 transition-colors"
                >
                  {copiedBank === 'mandiri' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Salin</span>
                    </>
                  )}
                </button>
              </div>

              {/* Rekening 3: GoPay / Dana / ShopeePay */}
              <div className="p-3 bg-white rounded-xl border-2 border-slate-300 flex items-center justify-between shadow-sm hover:border-[#182B49] transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center font-bold text-emerald-700 text-xs">
                    E-WALLET
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm text-slate-900">081915348866</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">GoPay / Dana / OVO a.n. Panitia</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => copyToClipboard('081915348866', 'ewallet')}
                  className="cursor-pointer px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 border border-slate-300 transition-colors"
                >
                  {copiedBank === 'ewallet' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Salin</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* STEP PEMBAYARAN & WHATSAPP ACTION BUTTON */}
            <div className="bg-[#10B981]/10 border-2 border-[#10B981] p-4 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm">
                <MessageCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>LANGKAH SELANJUTNYA: KONFIRMASI WHATSAPP</span>
              </div>
              <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                Setelah melakukan transfer sesuai nominal di atas, klik tombol hijau di bawah untuk mengirim bukti transfer ke WhatsApp resmi panitia (<strong>0819-1534-8866</strong>). Panitia akan memverifikasi dan mengirimkan E-Ticket resmi ber-QR Code ke Anda!
              </p>

              {/* Big Prominent WhatsApp Button */}
              <a
                href={waUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full cursor-pointer bg-[#25D366] hover:bg-[#20ba59] text-white py-3.5 px-4 rounded-xl font-bebas text-xl tracking-wider border-2 border-[#0F1C30] shadow-[0_4px_0_#0F1C30] hover:translate-y-0.5 active:translate-y-1 transition-all flex items-center justify-center gap-2.5 text-center"
              >
                <MessageCircle className="w-6 h-6 fill-current" />
                <span>KIRIM BUKTI TRANSFER KE WHATSAPP PANITIA</span>
              </a>
            </div>

            {/* Direct Ticket Link Status */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
              <div className="text-slate-600 font-medium">
                Sudah transfer & ingin cek status tiket Anda?
              </div>
              <a
                href={`/ticket/${order.id}`}
                target="_blank"
                rel="noreferrer"
                className="font-bold text-[#182B49] hover:underline flex items-center gap-1"
              >
                <span>Halaman Tiket</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Collapsible Sandbox Simulation for Testing */}
            <div className="pt-2 border-t-2 border-dashed border-slate-200">
              <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-300 text-left mb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Mode Pengujian / Simulasi Instan</span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-amber-800">
                  Tombol di bawah ini disediakan untuk pengujian instan tanpa transfer asli:
                </p>
              </div>

              <button
                type="button"
                onClick={handleConfirmPayment}
                disabled={isProcessing}
                className="w-full cursor-pointer bg-[#182B49] hover:bg-[#233c63] text-white py-2.5 rounded-xl font-bebas text-base tracking-wider border border-[#0F1C30] hover:translate-y-0.5 transition-all flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <span>MEMPROSES...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>SIMULASI INSTAN: SETUJUI PEMBAYARAN LANGSUNG</span>
                  </>
                )}
              </button>
            </div>

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
        )}

      </div>
    </div>
  );
}
