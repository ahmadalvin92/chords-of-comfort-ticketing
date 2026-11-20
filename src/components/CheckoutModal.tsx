'use client';

import React, { useState, useEffect } from 'react';
import { Seat, CustomerInfo } from '@/types/ticket';
import {
  X,
  Clock,
  ShieldCheck,
  User,
  Mail,
  Phone,
  Ticket,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSeats: Seat[];
  onConfirmCheckout: (customer: CustomerInfo, paymentMethod: string) => Promise<void>;
  loading: boolean;
  error?: string | null;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  selectedSeats,
  onConfirmCheckout,
  loading,
  error,
}: CheckoutModalProps) {
  const [formData, setFormData] = useState<CustomerInfo>({
    fullName: '',
    email: '',
    phone: '',
    notes: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<string>('MANDIRI_TRANSFER');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  // 10-Minute Concurrency Hold Countdown Timer
  const [secondsRemaining, setSecondsRemaining] = useState(600); // 10 mins

  useEffect(() => {
    if (!isOpen) return;

    // Listen to browser popstate (back button) to gracefully close modal
    const handlePopState = () => {
      onClose();
    };
    window.addEventListener('popstate', handlePopState);
    window.history.pushState({ modalOpen: true }, '');

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          alert('Your reservation hold window has expired. Selected seats have been returned to available.');
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const totalAmount = selectedSeats.reduce((sum, s) => sum + s.price, 0);

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const validate = () => {
    const errors: { [key: string]: string } = {};
    if (!formData.fullName.trim()) {
      errors.fullName = 'Please enter your full name as shown on your ID.';
    }
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please provide a valid email address for E-Ticket delivery.';
    }
    if (!formData.phone.trim() || formData.phone.length < 8) {
      errors.phone = 'Please provide an active WhatsApp number (min. 8 digits).';
    }
    if (!agreeTerms) {
      errors.agreeTerms = 'Please confirm agreement to the audience entry guidelines.';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onConfirmCheckout(formData, paymentMethod);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">

      {/* Modal Container */}
      <div className="relative w-full max-w-xl bg-white rounded-3xl border-4 border-[#0F1C30] shadow-[0_16px_0_#0F1C30] overflow-hidden my-6 animate-in zoom-in-95 duration-200">

        {/* Top Header */}
        <div className="bg-[#182B49] text-white p-5 sm:p-6 border-b-4 border-[#F4B32A] relative">
          <div className="flex items-center justify-between gap-4">

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-[#C1272D] text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Back to Seat Plan"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div>
                <div className="inline-flex items-center gap-1.5 bg-[#C1272D] text-[#FAF6ED] px-2.5 py-0.5 rounded text-xs font-bebas tracking-wider mb-1">
                  <Sparkles className="w-3 h-3 text-[#F4B32A]" />
                  <span>STEP 1: ATTENDEE INFORMATION</span>
                </div>
                <h3 className="font-bebas text-2xl sm:text-3xl text-[#FAF6ED] tracking-wide leading-none">
                  BOOKING REGISTRATION
                </h3>
                <p className="text-[11px] text-slate-300 font-semibold mt-0.5">
                  COMM30-6SP Musical Theater • Amani Palladium Theatre, LSPR Bekasi
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>

          </div>
        </div>

        {/* 10-Minute Lock Timer Bar */}
        <div className="bg-amber-100 border-b-2 border-amber-300 px-4 py-2.5 flex items-center justify-between text-xs text-amber-900 font-bold">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-700 animate-spin" />
            <span>Seats held for your order:</span>
          </div>
          <span className="font-mono text-sm bg-amber-200 px-2 py-0.5 rounded-md border border-amber-400 text-amber-950 font-black">
            {formatTimer(secondsRemaining)}
          </span>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">

          {error && (
            <div className="bg-red-100 border-2 border-red-400 text-red-800 p-3 rounded-2xl text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Attendee Form Inputs */}
          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Full Name (As shown on ID) *
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Jessica Althea"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#FAF6ED] rounded-xl border-2 border-slate-300 focus:border-[#182B49] focus:outline-none text-xs font-semibold text-slate-900"
                />
              </div>
              {validationErrors.fullName && (
                <p className="text-[11px] text-red-600 font-bold mt-1">{validationErrors.fullName}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Active WhatsApp Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="tel"
                    required
                    placeholder="081234567890"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 bg-[#FAF6ED] rounded-xl border-2 border-slate-300 focus:border-[#182B49] focus:outline-none text-xs font-semibold text-slate-900"
                  />
                </div>
                {validationErrors.phone && (
                  <p className="text-[11px] text-red-600 font-bold mt-1">{validationErrors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="jessica@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 bg-[#FAF6ED] rounded-xl border-2 border-slate-300 focus:border-[#182B49] focus:outline-none text-xs font-semibold text-slate-900"
                  />
                </div>
                {validationErrors.email && (
                  <p className="text-[11px] text-red-600 font-bold mt-1">{validationErrors.email}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Special Inquiries / Notes (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Need wheelchair accessibility assistance"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2.5 bg-[#FAF6ED] rounded-xl border-2 border-slate-300 focus:border-[#182B49] focus:outline-none text-xs font-medium text-slate-900"
              />
            </div>
          </div>

          {/* Order Summary Box */}
          <div className="bg-[#FAF6ED] p-4 rounded-2xl border-2 border-slate-300 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 border-b border-slate-200 pb-1.5">
              <span>Order Summary</span>
              <span>{selectedSeats.length} Seats Selected</span>
            </div>

            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
              {selectedSeats.map((s) => (
                <div key={s.id} className="flex items-center justify-between text-xs font-medium">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bebas text-sm text-[#182B49]">SEAT {s.label}</span>
                    <span className="text-[10px] text-slate-500">({s.category})</span>
                  </div>
                  <span className="font-bold text-slate-900">
                    Rp {s.price.toLocaleString('id-ID')}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t-2 border-dashed border-slate-300 flex items-center justify-between">
              <span className="font-bebas text-lg text-[#182B49]">TOTAL DUE:</span>
              <span className="font-bebas text-2xl text-[#C1272D]">
                RP {totalAmount.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {/* Payment Method Display (Mandiri Transfer Only) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Payment Method:
            </label>
            <div className="p-3.5 rounded-2xl border-2 border-[#182B49] bg-amber-50/70 flex items-center justify-between">
              <div>
                <div className="font-bebas text-base text-[#182B49] leading-tight">
                  DIRECT BANK TRANSFER (BANK MANDIRI)
                </div>
                <div className="text-[11px] font-semibold text-slate-600 mt-0.5">
                  Mandiri <span className="font-mono font-bold text-slate-900">1330037267812</span> (a.n. Viona Oktaviana)
                </div>
              </div>
              <span className="font-bebas text-xs bg-[#182B49] text-white px-2.5 py-1 rounded-md">
                MANDIRI ONLY
              </span>
            </div>
          </div>

          {/* Terms Agreement Checkbox */}
          <div>
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 rounded border-slate-400 text-[#C1272D] focus:ring-[#C1272D]"
              />
              <span className="text-[11px] text-slate-600 font-medium leading-relaxed">
                I agree to the theatre guidelines and confirm that all ticket purchases are non-refundable. Official QR passes will be generated upon receipt verification.
              </span>
            </label>
            {validationErrors.agreeTerms && (
              <p className="text-[11px] text-red-600 font-bold mt-1">{validationErrors.agreeTerms}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full cursor-pointer bg-[#C1272D] hover:bg-[#a61f25] disabled:bg-slate-400 text-white py-4 rounded-2xl font-bebas text-xl tracking-wider border-3 border-[#0F1C30] shadow-[0_4px_0_#0F1C30] hover:translate-y-0.5 active:translate-y-1 transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-5 h-5 text-[#F4B32A]" />
              <span>{loading ? 'SECURING RESERVATION...' : 'PROCEED TO PAYMENT CONFIRMATION'}</span>
              <ArrowRight className="w-5 h-5 ml-1" />
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
