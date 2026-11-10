'use client';

import React from 'react';
import { TicketCategory } from '@/types/ticket';
import { CATEGORY_INFO } from '@/data/initialSeats';
import { Check, Sparkles, Star } from 'lucide-react';

interface CategoriesSectionProps {
  onSelectCategoryFilter: (category: TicketCategory) => void;
}

export default function CategoriesSection({ onSelectCategoryFilter }: CategoriesSectionProps) {
  const categories: {
    category: TicketCategory;
    name: string;
    price: number;
    description: string;
    total: number;
    benefits: string[];
    bgHeader: string;
    accentColor: string;
    isPopular?: boolean;
  }[] = [
    {
      category: 'VIP',
      name: 'VIP Front Center',
      price: CATEGORY_INFO.VIP.price,
      description: CATEGORY_INFO.VIP.description,
      total: CATEGORY_INFO.VIP.total,
      benefits: [
        'Baris Paling Depan & Tengah (Row A1-A5)',
        'Pandangan Terbaik langsung ke Aktor & Panggung',
        'Prioritas Antrean Masuk Gate (Fast-Track)',
        'Exclusive COMM30-6SP Souvenir Sticker Pack',
      ],
      bgHeader: 'bg-pink-500 text-white',
      accentColor: '#EC4899',
      isPopular: true,
    },
    {
      category: 'SAPPHIRE',
      name: 'Sapphire Balcony',
      price: CATEGORY_INFO.SAPPHIRE.price,
      description: CATEGORY_INFO.SAPPHIRE.description,
      total: CATEGORY_INFO.SAPPHIRE.total,
      benefits: [
        'Balkon Baris Pertama (Row R1)',
        'Pandangan Luas & Menyeluruh dari Atas',
        'Akustik Audio Teater Sangat Jelas',
        'Kursi Nyaman & Eksklusif (Hanya 25 Kursi)',
      ],
      bgHeader: 'bg-blue-600 text-white',
      accentColor: '#3B82F6',
    },
    {
      category: 'DIAMOND',
      name: 'Diamond Main Floor',
      price: CATEGORY_INFO.DIAMOND.price,
      description: CATEGORY_INFO.DIAMOND.description,
      total: CATEGORY_INFO.DIAMOND.total,
      benefits: [
        'Main Floor Bagian Tengah & Belakang Tengah',
        'Kapasitas Terbesar & Suasana Teater Meriah',
        'Pandangan Lurus Sejajar Panggung',
        'Cocok untuk Nonton Rame-rame Bareng Teman',
      ],
      bgHeader: 'bg-amber-500 text-slate-900',
      accentColor: '#F59E0B',
    },
    {
      category: 'PLATINUM',
      name: 'Platinum Balcony',
      price: CATEGORY_INFO.PLATINUM.price,
      description: CATEGORY_INFO.PLATINUM.description,
      total: CATEGORY_INFO.PLATINUM.total,
      benefits: [
        'Balkon Baris 2 & 3 (Row R2-R3)',
        'Elevasi Tinggi Pandangan Bebas Halangan',
        'Pengalaman Menikmati Koreografi Panggung Penuh',
        'Harga Terjangkau untuk Area Balkon',
      ],
      bgHeader: 'bg-emerald-600 text-white',
      accentColor: '#10B981',
    },
    {
      category: 'RUBY',
      name: 'Ruby Best Value',
      price: CATEGORY_INFO.RUBY.price,
      description: CATEGORY_INFO.RUBY.description,
      total: CATEGORY_INFO.RUBY.total,
      benefits: [
        'Main Floor Sisi Kanan/Kiri & Baris Belakang',
        'Harga Paling Ekonomis (Student Friendly)',
        'Tetap Mendapatkan Seluruh Pengalaman Cerita & Musik',
        'E-Ticket Resmi & Validasi Barcode Sama Lengkap',
      ],
      bgHeader: 'bg-rose-600 text-white',
      accentColor: '#EF4444',
    },
  ];

  return (
    <section id="categories" className="py-20 bg-[#F9F6F0] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 bg-[#F4B32A] text-[#0F1C30] px-4 py-1.5 rounded-lg border-2 border-[#0F1C30] font-bebas text-lg shadow-[0_2px_0_#0F1C30] -rotate-1 mb-3">
            <Sparkles className="w-4 h-4" /> TICKET CATEGORIES & PRICING
          </div>
          <h2 className="font-bebas text-4xl sm:text-5xl lg:text-6xl text-[#182B49] leading-tight">
            PILIH KATEGORI TIKET SESUAI KEINGINANMU
          </h2>
          <p className="text-slate-600 font-medium text-base sm:text-lg">
            Seluruh tiket adalah sistem *Reserved Seating* (pilih nomor kursi langsung saat pemesanan). 
            Total kuota hanya 400 kursi di LSPR Sudirman Park.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          {categories.map((cat) => (
            <div
              key={cat.category}
              className={`bg-white rounded-2xl border-3 border-[#0F1C30] shadow-[0_6px_0_#0F1C30] hover:shadow-[0_8px_0_#0F1C30] hover:-translate-y-1 transition-all flex flex-col relative overflow-hidden ${
                cat.isPopular ? 'ring-4 ring-[#F4B32A]' : ''
              }`}
            >
              {/* Popular Badge */}
              {cat.isPopular && (
                <div className="bg-[#F4B32A] text-[#0F1C30] font-bebas text-sm tracking-wider py-1 text-center border-b-2 border-[#0F1C30] flex items-center justify-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-[#0F1C30]" /> BEST SEATS & POPULAR CHOICE
                </div>
              )}

              {/* Card Header with Category Color */}
              <div className={`p-5 ${cat.bgHeader} border-b-2 border-[#0F1C30] flex justify-between items-center`}>
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest opacity-90">Kategori</span>
                  <h3 className="font-bebas text-3xl leading-none">{cat.name}</h3>
                </div>
                <div className="bg-black/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-black border border-white/30">
                  {cat.total} Kursi
                </div>
              </div>

              {/* Price & Description */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-black text-slate-500">Rp</span>
                    <span className="font-bebas text-5xl text-[#182B49] tracking-tight">
                      {cat.price.toLocaleString('id-ID')}
                    </span>
                    <span className="text-xs font-bold text-slate-500">/ pax</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-500 mt-1">
                    {cat.description}
                  </p>

                  {/* Benefit list */}
                  <div className="mt-5 space-y-2.5 pt-4 border-t-2 border-dashed border-slate-200">
                    {cat.benefits.map((b, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs font-semibold text-slate-700">
                        <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-300">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Button Action */}
                <button
                  onClick={() => onSelectCategoryFilter(cat.category)}
                  className="w-full cursor-pointer bg-[#182B49] hover:bg-[#C1272D] text-white py-3.5 rounded-xl font-bebas text-xl tracking-wider border-2 border-[#0F1C30] shadow-[0_3px_0_#0F1C30] hover:translate-y-0.5 active:translate-y-1 transition-all flex items-center justify-center gap-2"
                >
                  PILIH KURSI {cat.category}
                </button>
              </div>

              {/* Serrated Ticket Notch */}
              <div className="ticket-cutout-left" />
              <div className="ticket-cutout-right" />
            </div>
          ))}
        </div>

        {/* Seating Capacity Summary Note */}
        <div className="mt-12 bg-[#FAF6ED] p-6 rounded-2xl border-3 border-[#0F1C30] shadow-[0_4px_0_#0F1C30] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <div className="font-bebas text-2xl text-[#182B49]">
              TOTAL KAPASITAS VENUE: 400 SEATS
            </div>
            <p className="text-xs font-semibold text-slate-600">
              Balcony: 75 Kursi (Sapphire & Platinum) • Main Floor: 325 Kursi (VIP, Diamond & Ruby)
            </p>
          </div>
          <div className="flex items-center gap-2 font-bebas text-xl bg-[#F4B32A] text-[#0F1C30] px-5 py-2.5 rounded-xl border-2 border-[#0F1C30]">
            ESTIMASI PENJUALAN: Rp 19.500.000
          </div>
        </div>

      </div>
    </section>
  );
}

