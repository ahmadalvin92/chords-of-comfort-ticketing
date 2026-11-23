'use client';

import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, MessageCircle } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_DATA: FaqItem[] = [
  {
    question: 'When and where will Chords of Comfort be held?',
    answer:
      'Chords of Comfort will take place in January 2027 at the Amani Palladium Theatre, LSPR Bekasi, Indonesia (Transpark Juanda, Jl. Ir. H. Juanda No. 220, Duren Jaya, East Bekasi). The exact performance day and curtain-raiser time will be officially announced soon.',
  },
  {
    question: 'How do I choose and secure my seats?',
    answer:
      'You can select your preferred seats directly on our interactive 297-seat seating map (225 Main Floor seats and 72 Balcony seats). Once selected, click "Proceed to Checkout" to lock your seats for 10 minutes while you complete your details.',
  },
  {
    question: 'How do I complete payment without automated payment gateways?',
    answer:
      'Payments are handled via direct bank transfer to Bank Mandiri (Account: 1330037267812 a.n. Viona Oktaviana). Once you submit your order, click the WhatsApp confirmation button to send your transfer receipt directly to our ticketing team at 0819-1534-8866. Our committee will verify and activate your official ticket.',
  },
  {
    question: 'What ticket tiers are available and what are the prices?',
    answer:
      'We offer two pricing categories: VIP Main Floor (Rp 50.000) located in Rows A & B (center), VIP Balcony (Rp 50.000) located in Row AA (center), and Regular Theater Passes (Rp 35.000) across the remaining Main Floor and Balcony seats. All passes include collectible admission wristbands.',
  },
  {
    question: 'How do I receive and use my E-Ticket on show day?',
    answer:
      'Upon payment verification, your official E-Ticket is activated with a high-resolution scannable QR Code. You can print it or show it directly on your smartphone screen at the theatre registration desk to receive your official fabric festival wristband.',
  },
  {
    question: 'Can I cancel or refund my ticket reservation?',
    answer:
      'In accordance with festival production policies, all ticket sales are final and non-refundable. If you are unable to attend, you may transfer your E-Ticket to a friend or contact our WhatsApp hotline at 0819-1534-8866 for attendee name updates.',
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-16 md:py-24 bg-[#FAF6ED] border-b-4 border-[#0F1C30]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Section Heading */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-[#F4B32A] text-[#0F1C30] font-bebas text-sm px-3.5 py-1 rounded-md border-2 border-[#0F1C30] tracking-wider shadow-[0_2px_0_#0F1C30]">
            <HelpCircle className="w-4 h-4" />
            FREQUENTLY ASKED QUESTIONS
          </div>
          <h2 className="font-bebas text-4xl sm:text-5xl text-[#182B49] tracking-wider leading-tight">
            EVERYTHING YOU NEED TO KNOW
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Find quick answers about scheduling, seat booking, payment transfers, and gate admission.
          </p>
        </div>

        {/* Collapsible Accordion */}
        <div className="space-y-3">
          {FAQ_DATA.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border-3 border-[#0F1C30] shadow-[0_4px_0_#0F1C30] overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <span className="font-bebas text-lg sm:text-xl text-[#182B49] tracking-wide">
                    {item.question}
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-[#FAF6ED] border border-[#0F1C30] flex items-center justify-center shrink-0">
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-[#C1272D]" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#182B49]" />
                    )}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 pb-5 sm:px-5 sm:pb-6 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 font-medium pt-3">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Support Banner */}
        <div className="bg-[#182B49] text-white p-5 rounded-2xl border-3 border-[#0F1C30] shadow-[0_4px_0_#0F1C30] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <div className="font-bebas text-xl text-[#F4B32A]">STILL HAVE QUESTIONS?</div>
            <p className="text-xs text-slate-300">
              Our ticketing committee is ready to assist you on WhatsApp anytime.
            </p>
          </div>
          <a
            href="https://wa.me/6281915348866"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white px-5 py-2.5 rounded-xl font-bebas text-base tracking-wider border border-slate-900 shadow-sm shrink-0"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>CHAT ON WHATSAPP (0819-1534-8866)</span>
          </a>
        </div>

      </div>
    </section>
  );
}

