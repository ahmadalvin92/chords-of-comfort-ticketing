'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Order, Seat, TicketCategory } from '@/types/ticket';
import {
  ShieldCheck,
  TrendingUp,
  Ticket,
  Users,
  Search,
  Download,
  RotateCcw,
  QrCode,
  ArrowLeft,
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertCircle,
  Filter,
} from 'lucide-react';

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'paid' | 'pending'>('ALL');
  const [activeTab, setActiveTab] = useState<'transactions' | 'seats'>('transactions');
  const [isResetting, setIsResetting] = useState(false);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/orders');
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
        setSeats(data.seats);
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch =
        o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customer.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customer.phone.includes(searchQuery) ||
        o.items.some((i) => i.seatLabel.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = statusFilter === 'ALL' || o.paymentStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  // Export to CSV
  const handleExportCSV = () => {
    if (orders.length === 0) {
      alert('Tidak ada data transaksi untuk diekspor.');
      return;
    }

    const headers = [
      'Order ID',
      'Tanggal',
      'Nama Customer',
      'Email',
      'Nomor WhatsApp',
      'Nomor Kursi',
      'Kategori',
      'Jumlah Tiket',
      'Total Tagihan (Rp)',
      'Status Pembayaran',
      'Metode Pembayaran',
      'Status Check-In',
    ];

    const rows = orders.map((o) => {
      const seatsStr = o.items.map((i) => i.seatLabel).join('; ');
      const catStr = o.items.map((i) => i.category).join('; ');
      const checkedInStr = o.items.every((i) => i.isCheckedIn)
        ? 'Sudah Check-In'
        : o.items.some((i) => i.isCheckedIn)
        ? 'Sebagian'
        : 'Belum';

      return [
        `"${o.id}"`,
        `"${new Date(o.createdAt).toLocaleString('id-ID')}"`,
        `"${o.customer.fullName}"`,
        `"${o.customer.email}"`,
        `"${o.customer.phone}"`,
        `"${seatsStr}"`,
        `"${catStr}"`,
        o.items.length,
        o.totalAmount,
        `"${o.paymentStatus.toUpperCase()}"`,
        `"${o.paymentMethod || 'QRIS'}"`,
        `"${checkedInStr}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `LSPR_COMM30_6SP_Ticketing_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetData = async () => {
    if (
      !confirm(
        'PERINGATAN: Apakah Anda yakin ingin me-reset seluruh transaksi dan mengembalikan 400 kursi menjadi tersedia (Available)? Aksi ini tidak dapat dibatalkan.'
      )
    ) {
      return;
    }

    setIsResetting(true);
    try {
      const res = await fetch('/api/admin/reset', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert('Database tiket berhasil di-reset ke kondisi awal.');
        fetchAdminData();
      }
    } catch (err) {
      alert('Gagal me-reset: ' + (err as Error).message);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F5EE] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#182B49] text-white p-6 rounded-3xl border-4 border-[#0F1C30] shadow-[0_8px_0_#0F1C30]">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-[#C1272D] text-slate-300 hover:text-white transition-colors"
              title="Kembali ke Beranda"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="inline-flex items-center gap-1.5 bg-[#F4B32A] text-[#0F1C30] px-3 py-0.5 rounded text-xs font-bebas mb-1">
                <ShieldCheck className="w-3.5 h-3.5" /> OFFICIAL TICKETING ADMIN
              </div>
              <h1 className="font-bebas text-3xl sm:text-4xl text-[#FAF6ED] leading-none">
                DASHBOARD PANITIA COMM30-6SP
              </h1>
              <p className="text-xs text-slate-300 font-semibold">
                LSPR Musical Theater • Sudirman Park Venue Control
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/scanner"
              className="cursor-pointer bg-[#F4B32A] hover:bg-amber-400 text-[#0F1C30] px-4 py-2.5 rounded-xl font-bebas text-base tracking-wider border-2 border-[#0F1C30] shadow-sm flex items-center gap-2"
            >
              <QrCode className="w-4 h-4" />
              <span>Buka Mobile QR Scanner</span>
            </Link>

            <button
              onClick={handleExportCSV}
              className="cursor-pointer bg-white hover:bg-slate-100 text-[#182B49] px-4 py-2.5 rounded-xl font-bebas text-base tracking-wider border-2 border-[#0F1C30] shadow-sm flex items-center gap-2"
            >
              <Download className="w-4 h-4 text-blue-600" />
              <span>Export CSV (Excel)</span>
            </button>

            <button
              onClick={handleResetData}
              disabled={isResetting}
              className="cursor-pointer bg-[#C1272D] hover:bg-[#9e1b22] text-white px-3.5 py-2.5 rounded-xl font-bebas text-base tracking-wider border-2 border-[#0F1C30] shadow-sm flex items-center gap-1.5"
              title="Reset Demo Data"
            >
              <RotateCcw className="w-4 h-4 text-amber-300" />
              <span>Reset Data</span>
            </button>
          </div>
        </div>

        {/* Analytics KPI Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white p-5 rounded-2xl border-3 border-[#0F1C30] shadow-[0_4px_0_#0F1C30]">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Total Pendapatan</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-300">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="font-bebas text-3xl sm:text-4xl text-[#182B49] leading-tight">
                Rp {stats.totalRevenue.toLocaleString('id-ID')}
              </div>
              <p className="text-[11px] font-semibold text-slate-500 mt-1">
                Dari {stats.paidOrdersCount} transaksi terverifikasi
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border-3 border-[#0F1C30] shadow-[0_4px_0_#0F1C30]">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Tiket Terjual (Seats)</span>
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center border border-blue-300">
                  <Ticket className="w-4 h-4" />
                </div>
              </div>
              <div className="font-bebas text-3xl sm:text-4xl text-[#182B49] leading-tight">
                {stats.soldSeats} <span className="text-lg text-slate-400">/ 400 Kursi</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden border border-slate-200">
                <div
                  className="bg-[#C1272D] h-2 rounded-full"
                  style={{ width: `${(stats.soldSeats / 400) * 100}%` }}
                />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border-3 border-[#0F1C30] shadow-[0_4px_0_#0F1C30]">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Kursi Tersedia</span>
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center border border-amber-300">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="font-bebas text-3xl sm:text-4xl text-[#182B49] leading-tight">
                {stats.availableSeats} Kursi
              </div>
              <p className="text-[11px] font-semibold text-slate-500 mt-1">
                {stats.heldSeats} kursi sedang di-hold pembeli
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border-3 border-[#0F1C30] shadow-[0_4px_0_#0F1C30]">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Kehadiran (Check-In)</span>
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center border border-purple-300">
                  <QrCode className="w-4 h-4" />
                </div>
              </div>
              <div className="font-bebas text-3xl sm:text-4xl text-[#182B49] leading-tight">
                {stats.totalCheckIns} Hadir
              </div>
              <p className="text-[11px] font-semibold text-slate-500 mt-1">
                Sudah diverifikasi via QR Scanner Gate
              </p>
            </div>

          </div>
        )}

        {/* Category Breakdown Table */}
        {stats && stats.categoryStats && (
          <div className="bg-white p-6 rounded-3xl border-3 border-[#0F1C30] shadow-[0_6px_0_#0F1C30]">
            <h3 className="font-bebas text-2xl text-[#182B49] mb-4">
              RINGKASAN PENJUALAN PER KATEGORI TIKET
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {(Object.keys(stats.categoryStats) as TicketCategory[]).map((cat) => {
                const s = stats.categoryStats[cat];
                return (
                  <div key={cat} className="p-3.5 rounded-xl bg-[#FAF6ED] border-2 border-slate-300">
                    <span className="font-bebas text-lg text-[#182B49] block">{cat}</span>
                    <div className="text-xs font-bold text-slate-600 mt-1">
                      Terjual: <span className="text-[#C1272D] font-black">{s.sold}</span> / {s.total}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Sisa: {s.available} kursi
                    </div>
                    <div className="text-xs font-bold text-emerald-700 mt-2">
                      Rp {s.revenue.toLocaleString('id-ID')}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Transactions Table Card */}
        <div className="bg-white rounded-3xl border-3 border-[#0F1C30] shadow-[0_6px_0_#0F1C30] overflow-hidden">
          
          {/* Controls Bar */}
          <div className="p-5 border-b-2 border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('transactions')}
                className={`cursor-pointer px-4 py-2 rounded-xl font-bebas text-base tracking-wider transition-all ${
                  activeTab === 'transactions'
                    ? 'bg-[#182B49] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Daftar Transaksi ({orders.length})
              </button>
              <button
                onClick={() => setActiveTab('seats')}
                className={`cursor-pointer px-4 py-2 rounded-xl font-bebas text-base tracking-wider transition-all ${
                  activeTab === 'seats'
                    ? 'bg-[#182B49] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Status Kursi ({seats.length})
              </button>
            </div>

            {/* Search and filter */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari Order ID, Nama, Kursi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs font-medium bg-[#FAF6ED] rounded-xl border border-slate-300 focus:outline-none focus:border-[#182B49]"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-[#FAF6ED] border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none"
              >
                <option value="ALL">Semua Status</option>
                <option value="paid">Hanya Lunas (PAID)</option>
                <option value="pending">Hanya Menunggu (PENDING)</option>
              </select>
            </div>

          </div>

          {/* Table Content */}
          {activeTab === 'transactions' ? (
            <div className="overflow-x-auto">
              {filteredOrders.length === 0 ? (
                <div className="p-12 text-center text-slate-500 text-sm font-semibold">
                  Tidak ada transaksi yang cocok dengan pencarian.
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#FAF6ED] border-b-2 border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="p-3.5">Order ID</th>
                      <th className="p-3.5">Waktu</th>
                      <th className="p-3.5">Customer</th>
                      <th className="p-3.5">Kursi Dipesan</th>
                      <th className="p-3.5">Total (Rp)</th>
                      <th className="p-3.5">Status Bayar</th>
                      <th className="p-3.5">Check-In</th>
                      <th className="p-3.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredOrders.map((o) => (
                      <tr key={o.id} className="hover:bg-amber-50/50 transition-colors">
                        <td className="p-3.5 font-mono font-black text-[#182B49]">
                          {o.id}
                        </td>
                        <td className="p-3.5 text-slate-500">
                          {new Date(o.createdAt).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                            day: 'numeric',
                            month: 'short',
                          })}
                        </td>
                        <td className="p-3.5">
                          <div className="font-bold text-slate-900">{o.customer.fullName}</div>
                          <div className="text-[11px] text-slate-500">
                            {o.customer.email} • {o.customer.phone}
                          </div>
                        </td>
                        <td className="p-3.5">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {o.items.map((it, idx) => (
                              <span
                                key={idx}
                                className="bg-slate-100 font-bebas text-xs px-2 py-0.5 rounded border border-slate-300"
                              >
                                {it.seatLabel} ({it.category})
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-3.5 font-bold text-[#182B49]">
                          Rp {o.totalAmount.toLocaleString('id-ID')}
                        </td>
                        <td className="p-3.5">
                          {o.paymentStatus === 'paid' ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold text-[10px]">
                              <CheckCircle2 className="w-3 h-3" /> PAID
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full font-bold text-[10px]">
                              <Clock className="w-3 h-3" /> PENDING
                            </span>
                          )}
                        </td>
                        <td className="p-3.5">
                          {o.items.every((i) => i.isCheckedIn) ? (
                            <span className="text-emerald-700 font-bold text-[10px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                              ✓ Checked In
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[10px]">Belum</span>
                          )}
                        </td>
                        <td className="p-3.5 text-right">
                          <Link
                            href={`/ticket/${o.id}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-bold hover:underline"
                          >
                            <span>E-Ticket</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ) : (
            <div className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 max-h-[500px] overflow-y-auto">
                {seats.map((seat) => (
                  <div
                    key={seat.id}
                    className={`p-2 rounded-lg border text-xs text-center font-medium ${
                      seat.status === 'sold'
                        ? 'bg-slate-200 border-slate-400 text-slate-500'
                        : seat.status === 'held'
                        ? 'bg-amber-100 border-amber-400 text-amber-800'
                        : 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    }`}
                  >
                    <div className="font-bebas text-sm leading-none">{seat.label}</div>
                    <div className="text-[9px] uppercase font-bold mt-0.5">{seat.category}</div>
                    <div className="text-[10px] font-black uppercase mt-1">
                      {seat.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

