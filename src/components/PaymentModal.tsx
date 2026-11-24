'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Order } from '@/types/ticket';
import {
  X,
  Copy,
  Check,
  Phone,
  AlertTriangle,
  Sparkles,
  Ticket,
  ShieldCheck,
} from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onPaymentConfirmed?: (order: Order) => void;
}

export default function PaymentModal({
  isOpen,
  onClose,
  order,
}: PaymentModalProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen || !order) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const seatsStr = order.items.map((i) => i.seatLabel).join(', ');

  // English WhatsApp confirmation message template (Mandiri Transfer)
  const waConfirmationMsg = `Hello Chords of Comfort Ticketing Team! I would like to confirm my Bank Mandiri transfer payment for Order ID: #${order.id} under the name: ${order.customer.fullName} for Seats: ${seatsStr} (Total: Rp ${order.totalAmount.toLocaleString('id-ID')}). Please find my payment transfer receipt attached.`;
  const waUrl = `https://wa.me/6281915348866?text=${encodeURIComponent(waConfirmationMsg)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">

      <div className="relative w-full max-w-lg bg-white rounded-3xl border-4 border-[#0F1C30] shadow-[0_16px_0_#0F1C30] overflow-hidden my-6 animate-in zoom-in-95 duration-200">

        {/* Modal Header */}
        <div className="bg-[#182B49] text-white p-5 sm:p-6 border-b-4 border-[#F4B32A] relative">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-[#F4B32A] text-[#0F1C30] px-2.5 py-0.5 rounded text-xs font-bebas tracking-wider mb-1">
                <Sparkles className="w-3 h-3" />
                <span>STEP 2: PAYMENT & VERIFICATION</span>
              </div>
              <h3 className="font-bebas text-2xl sm:text-3xl text-[#FAF6ED] tracking-wide leading-none">
                ORDER #{order.id}
              </h3>
              <p className="text-[11px] text-slate-300 font-semibold mt-0.5">
                Chords of Comfort • The 35th LSPR Theater Festival
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Amount Due Banner */}
        <div className="bg-[#FAF6ED] p-4 border-b-2 border-slate-200 text-center">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
            TOTAL AMOUNT DUE
          </span>
          <div className="flex items-center justify-center gap-2.5 mt-1">
            <div className="font-bebas text-3xl sm:text-4xl text-[#C1272D] leading-none">
              RP {order.totalAmount.toLocaleString('id-ID')}
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(String(order.totalAmount), 'AMOUNT')}
              className="cursor-pointer bg-white hover:bg-slate-100 text-[#182B49] px-2.5 py-1 rounded-lg border border-[#0F1C30] font-bold text-[11px] inline-flex items-center gap-1 shadow-xs"
              title="Copy exact transfer amount"
            >
              {copiedKey === 'AMOUNT' ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-slate-500" />
                  <span>Copy Exact Total</span>
                </>
              )}
            </button>
          </div>
          <div className="text-xs text-slate-600 font-medium mt-1.5">
            Seats: <strong className="text-slate-900">{seatsStr}</strong> ({order.items.length} Seat{order.items.length > 1 ? 's' : ''})
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[70vh] overflow-y-auto text-xs">

          {/* Instructions Box */}
          <div className="bg-amber-50 border-2 border-amber-300 p-3.5 rounded-2xl text-amber-950 space-y-1.5 font-medium leading-relaxed">
            <div className="font-bold flex items-center gap-1.5 text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              <span>How to Complete Your Booking:</span>
            </div>
            <ol className="list-decimal pl-4 space-y-1 text-[11px]">
              <li>Transfer the exact total amount to our official Bank Mandiri account below.</li>
              <li>Click the green WhatsApp button below to submit your transfer receipt.</li>
              <li>Once verified by our ticketing committee, your official QR E-Ticket will be activated!</li>
            </ol>
          </div>

          {/* Committee Bank Account (Mandiri Only) */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              Official Committee Bank Account (Bank Mandiri Transfer):
            </span>

            {/* Mandiri */}
            <div className="p-4 bg-[#FAF6ED] rounded-2xl border-3 border-[#0F1C30] shadow-[0_4px_0_#0F1C30] flex items-center justify-between gap-2">
              <div>
                <span className="font-bebas text-xs px-2 py-0.5 rounded bg-[#182B49] text-white">
                  BANK MANDIRI
                </span>
                <div className="font-mono text-lg text-[#182B49] font-black mt-1">1330037267812</div>
                <span className="text-xs text-slate-600 font-bold block">a.n. Viona Oktaviana</span>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard('1330037267812', 'MANDIRI')}
                className="cursor-pointer bg-white hover:bg-slate-100 text-[#182B49] px-3.5 sm:px-4 py-2 rounded-xl border-2 border-[#0F1C30] font-bold text-xs flex items-center gap-1.5 shadow-xs shrink-0"
              >
                {copiedKey === 'MANDIRI' ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-500" />
                    <span>Copy Number</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Primary Action: Send Receipt to WhatsApp */}
          <div className="pt-2 space-y-2">
            <a
              href={waUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white py-3.5 px-4 rounded-2xl font-bebas text-lg tracking-wider border-2 border-slate-900 shadow-[0_4px_0_#0F1C30] hover:translate-y-0.5 active:translate-y-1 transition-all flex items-center justify-center gap-2 text-center"
            >
              <Phone className="w-5 h-5 fill-current shrink-0" />
              <span>SEND RECEIPT VIA WHATSAPP (0819-1534-8866)</span>
            </a>

            <Link
              href={`/ticket/${order.id}`}
              className="w-full bg-[#182B49] hover:bg-[#0F1C30] text-white py-3 px-4 rounded-2xl font-bebas text-base tracking-wider border-2 border-[#0F1C30] shadow-sm flex items-center justify-center gap-2"
            >
              <Ticket className="w-4 h-4 text-[#F4B32A]" />
              <span>CHECK E-TICKET STATUS &amp; PASS</span>
            </Link>
          </div>

          {/* Committee Verification Info */}
          <div className="pt-2 border-t-2 border-dashed border-slate-200 flex items-center justify-center gap-2 text-[11px] text-slate-500 font-semibold text-center">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Your seats are reserved while awaiting transfer verification via WhatsApp.</span>
          </div>

        </div>

      </div>
    </div>
  );
}
