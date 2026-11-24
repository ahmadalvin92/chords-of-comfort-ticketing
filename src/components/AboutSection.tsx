'use client';

import React from 'react';
import Image from 'next/image';
import {
  Sparkles,
  MapPin,
  Clock,
  Shirt,
  QrCode,
  ExternalLink,
  Phone,
} from 'lucide-react';

const InstagramIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export default function AboutSection() {
  return (
    <section id="about" className="py-16 md:py-24 bg-[#F8F5EE] border-b-4 border-[#0F1C30]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* ================= SECTION 1: ABOUT THE MUSICAL & SYNOPSIS ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Visual Collage & Wristband Reference */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="relative bg-white p-4 rounded-3xl border-4 border-[#0F1C30] shadow-[0_8px_0_#0F1C30] -rotate-1">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border-2 border-[#0F1C30]">
                <Image
                  src="/assets/ticket-wristband-ref.jpeg"
                  alt="Chords of Comfort Wristband & Ticket Stubs"
                  fill
                  sizes="(max-width: 768px) 100vw, 450px"
                  className="object-cover"
                />
                <div className="absolute top-2 left-2 bg-[#F4B32A] text-[#0F1C30] font-bebas text-xs px-2.5 py-1 rounded border border-[#0F1C30]">
                  OFFICIAL WRISTBAND PASS
                </div>
              </div>

              <div className="mt-4 p-3 bg-[#FAF6ED] rounded-xl border-2 border-dashed border-[#0F1C30] text-center">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">
                  ADMISSION VERIFICATION
                </span>
                <p className="font-bebas text-lg text-[#182B49] leading-tight mt-0.5">
                  E-TICKET SCANNED AT GATE & EXCHANGED FOR FABRIC WRISTBAND
                </p>
              </div>
            </div>

          </div>

          {/* Right Column: Full Official Synopsis */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 bg-[#C1272D] text-[#FAF6ED] font-bebas text-sm px-3 py-1 rounded-md border-2 border-[#0F1C30] tracking-wider shadow-[0_2px_0_#0F1C30]">
                ABOUT THE PRODUCTION
              </div>
              <h2 className="font-bebas text-4xl sm:text-5xl text-[#182B49] tracking-wider leading-tight">
                THE STORY BEHIND <span className="text-[#C1272D]">CHORDS OF COMFORT</span>
              </h2>
              <p className="text-xs font-bold uppercase tracking-widest text-[#F4B32A] bg-[#182B49] inline-block px-3 py-1 rounded-md">
                COMM30-6SP • THE 35TH LSPR THEATER FESTIVAL
              </p>
            </div>

            {/* Official 7-Paragraph Synopsis */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border-4 border-[#0F1C30] shadow-[0_8px_0_#0F1C30] space-y-4 text-slate-700 text-sm sm:text-base leading-relaxed">
              <p>
                Victoria, a wealthy student who loves shopping with her best friends, Selena and Isabella, is assigned an essay about the Irish Revolution. Her research leads her to the library, where she unexpectedly meets Oliver, a hardworking restaurant employee saving money for college.
              </p>
              
              <p>
                At first, their personalities clash, and they struggle to get along. However, as they spend more time together, their differences slowly turn into an unexpected connection.
              </p>

              <p>
                When Victoria’s family suddenly faces bankruptcy and their house is put up for sale, Oliver becomes her greatest source of comfort and support. Their growing friendship eventually blossoms into love.
              </p>

              <p>
                But their relationship faces a difficult moment when Victoria describes herself as being happy to live like an ‘ordinary person’ like Oliver. Her words hurt him, as he realizes that she still has privileges he could only dream of.
              </p>

              <p>
                Through reflection, honest conversations, and advice from the people closest to them, they learn to understand each other’s struggles, apologize, and find their way back to one another.
              </p>

              <p>
                Meanwhile, Victoria discovers that her father has secretly preserved her college education fund, giving her a chance to pursue her dreams after all.
              </p>

              <div className="pt-2 border-t-2 border-dashed border-slate-200">
                <p className="font-medium text-[#182B49] italic">
                  Chords of Comfort is a heartwarming story about love beyond social differences, the meaning of true support, and discovering that sometimes the greatest comfort comes from the people we least expect.
                </p>
              </div>
            </div>

          </div>

        </div>

        {/* ================= SECTION 2: VENUE INFORMATION & GOOGLE MAPS EMBED ================= */}
        <div className="space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 bg-[#182B49] text-[#F4B32A] font-bebas text-sm px-3.5 py-1 rounded-md border-2 border-[#0F1C30] tracking-wider shadow-[0_2px_0_#0F1C30]">
              VENUE &amp; LOCATION
            </div>
            <h3 className="font-bebas text-3xl sm:text-4xl md:text-5xl text-[#182B49] tracking-wider leading-tight">
              <span className="block sm:inline">LSPR BEKASI</span>
              <span className="hidden sm:inline mx-2 text-[#C1272D]">•</span>
              <span className="block sm:inline text-[#C1272D] sm:text-[#182B49]">AMANI PALLADIUM THEATRE</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-xl mx-auto leading-relaxed">
              Transpark Juanda, Jl. Ir. H. Juanda No. 220, Duren Jaya, East Bekasi, Bekasi City, West Java 17111
            </p>
          </div>

          <div className="bg-white rounded-3xl border-4 border-[#0F1C30] shadow-[0_8px_0_#0F1C30] overflow-hidden grid grid-cols-1 lg:grid-cols-12">
            
            {/* Left 5 Columns: Venue Info Details */}
            <div className="lg:col-span-5 p-6 sm:p-8 space-y-6 flex flex-col justify-between border-b-4 lg:border-b-0 lg:border-r-4 border-[#0F1C30] bg-[#FAF6ED]">
              <div className="space-y-4">
                <div>
                  <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-[#C1272D] bg-[#C1272D]/10 px-2.5 py-1 rounded-md border border-[#C1272D]/30 mb-2">
                    THEATRE AUDITORIUM
                  </span>
                  <h4 className="font-bebas text-2xl sm:text-3xl text-[#182B49] leading-tight">
                    LSPR BEKASI CAMPUS
                  </h4>
                  <div className="font-bebas text-lg sm:text-xl text-[#C1272D] tracking-wide mt-0.5">
                    Amani Palladium Theatre • Transpark Juanda
                  </div>
                  <p className="text-xs text-slate-600 mt-2 font-medium leading-relaxed">
                    State-of-the-art auditorium equipped with theatrical acoustics, dual-level seating (Main Floor &amp; Balcony), full air conditioning, and convenient on-site parking at Transpark Juanda.
                  </p>
                </div>

                <div className="space-y-3 pt-2 text-xs">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-slate-900">Address:</strong>
                      <span className="text-slate-600">
                        Transpark Juanda, Jl. Ir. H. Juanda No. 220, Duren Jaya, East Bekasi, Bekasi City, West Java 17111
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-slate-900">Production Date:</strong>
                      <span className="text-slate-600">
                        January 2027 • Showtime & Gate Opening TBA
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Direct Open in Google Maps CTA */}
              <div className="pt-4 border-t-2 border-dashed border-slate-300">
                <a
                  href="https://www.google.com/maps/place/LSPR+BEKASI/@-6.2492029,107.0170136,17z/data=!3m1!4b1!4m6!3m5!1s0x2e698f15b75cee39:0x2e5917016b27bfad!8m2!3d-6.2492029!4d107.0170136!16s%2Fg%2F11hyn7g4fg"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#182B49] hover:bg-[#C1272D] text-white px-5 py-3 rounded-xl font-bebas text-lg tracking-wider border-2 border-[#0F1C30] shadow-[0_3px_0_#0F1C30] hover:translate-y-0.5 transition-all"
                >
                  <MapPin className="w-5 h-5 text-[#F4B32A]" />
                  <span>OPEN IN GOOGLE MAPS</span>
                  <ExternalLink className="w-4 h-4 ml-1" />
                </a>
              </div>
            </div>

            {/* Right 7 Columns: Embedded Interactive Google Maps */}
            <div className="lg:col-span-7 h-72 sm:h-96 lg:h-auto min-h-[320px] bg-slate-100 relative">
              <iframe
                title="LSPR Bekasi Google Maps Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.191294579647!2d107.0170136!3d-6.2492029!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e698f15b75cee39%3A0x2e5917016b27bfad!2sLSPR%20BEKASI!5e0!3m2!1sen!2sid!4v1700000000000!5m2!1sen!2sid"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full min-h-[320px]"
              />
            </div>

          </div>
        </div>

        {/* ================= SECTION 3: AUDIENCE GUIDELINES & WRISTBAND EXCHANGE ================= */}
        <div className="bg-white rounded-3xl border-4 border-[#0F1C30] shadow-[0_8px_0_#0F1C30] p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-slate-200 pb-4">
            <div>
              <span className="block mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                AUDIENCE GUIDELINES
              </span>
              <h3 className="font-bebas text-3xl sm:text-4xl text-[#182B49] leading-tight">
                IMPORTANT ENTRY INFORMATION
              </h3>
            </div>
            <div className="font-bebas text-sm bg-[#FAF6ED] border-2 border-[#0F1C30] px-3.5 py-1.5 rounded-xl text-[#C1272D] self-start sm:self-auto">
              NON-REFUNDABLE • ALL SALES FINAL
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="p-4 rounded-2xl bg-[#FAF6ED] border-2 border-slate-300 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#182B49] text-[#F4B32A] flex items-center justify-center border border-[#0F1C30]">
                <QrCode className="w-5 h-5" />
              </div>
              <h4 className="font-bebas text-xl text-[#182B49]">E-TICKET & QR ADMISSION</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Please present the official QR Code E-Ticket received via WhatsApp/email at the registration desk. Each ticket is strictly valid for single check-in.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF6ED] border-2 border-slate-300 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#C1272D] text-white flex items-center justify-center border border-[#0F1C30]">
                <Clock className="w-5 h-5" />
              </div>
              <h4 className="font-bebas text-xl text-[#182B49]">DOOR POLICY & TIMING</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Registration opens prior to curtain call. Late arrivals will only be admitted during designated scene transitions to preserve the theatrical experience.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF6ED] border-2 border-slate-300 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-900 text-[#F4B32A] flex items-center justify-center border border-[#0F1C30]">
                <Shirt className="w-5 h-5" />
              </div>
              <h4 className="font-bebas text-xl text-[#182B49]">DRESS CODE & ETIQUETTE</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Casual chic, varsity apparel, or smart casual attire is highly recommended. Flash photography and professional video recording inside the theatre are prohibited.
              </p>
            </div>

          </div>

          {/* Social Contact Card */}
          <div className="pt-4 border-t-2 border-dashed border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-slate-600 text-center sm:text-left">
              Need assistance or group bookings? Contact the official ticketing team:
            </div>
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <a
                href="https://www.instagram.com/chordsofcomfort.theater?jplx=MXM3c3J3bGQ1NXJ5Zg=="
                target="_blank"
                rel="noreferrer"
                className="flex-1 sm:flex-initial justify-center inline-flex items-center gap-1.5 text-xs font-bold text-[#182B49] bg-[#FAF6ED] hover:bg-slate-200 px-3 py-2 rounded-xl border border-slate-300"
              >
                <InstagramIcon className="w-4 h-4 text-[#C1272D] shrink-0" />
                <span>@chordsofcomfort.theater</span>
              </a>
              <a
                href="https://wa.me/6281915348866"
                target="_blank"
                rel="noreferrer"
                className="flex-1 sm:flex-initial justify-center inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#25D366] hover:bg-[#20ba59] px-3 py-2 rounded-xl border border-slate-900 shadow-sm"
              >
                <Phone className="w-4 h-4 shrink-0" />
                <span>0819-1534-8866</span>
              </a>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
