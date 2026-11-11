'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Order, Seat, TicketCategory } from '@/types/ticket';
import { CATEGORY_INFO } from '@/data/initialSeats';
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
  Lock,
  LogOut,
  UserCheck,
  Phone,
  Mail,
  Printer,
  PlusCircle,
  Trash2,
  Check,
  X,
  Sparkles,
  Info,
} from 'lucide-react';

interface AdminUser {
  email: string;
  name: string;
  role: string;
}

export default function AdminPage() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Data State
  const [orders, setOrders] = useState<Order[]>([]);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'paid' | 'pending'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<TicketCategory | 'ALL'>('ALL');
  const [checkInFilter, setCheckInFilter] = useState<'ALL' | 'checked_in' | 'not_checked_in'>('ALL');
  const [activeTab, setActiveTab] = useState<'transactions' | 'seat_inspector' | 'manual_order'>('transactions');

  // Modals & Inspectors
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [inspectedSeat, setInspectedSeat] = useState<Seat | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  // Manual Order Form State
  const [manualForm, setManualForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    seatId: '',
    paymentMethod: 'INVITATION_VIP',
    isPaid: true,
  });
  const [isCreatingManual, setIsCreatingManual] = useState(false);

  // Check login on mount
  useEffect(() => {
    const saved = localStorage.getItem('chords_admin_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed?.email) {
          setCurrentUser(parsed);
        }
      } catch {
        localStorage.removeItem('chords_admin_session');
      }
    }
  }, []);

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
    if (currentUser) {
      fetchAdminData();
    }
  }, [currentUser]);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Login gagal.');
      }

      setCurrentUser(data.user);
      localStorage.setItem('chords_admin_session', JSON.stringify(data.user));
    } catch (err) {
      setLoginError((err as Error).message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('chords_admin_session');
    setCurrentUser(null);
  };

  // Quick Account Autofill for Convenience
  const handleQuickFill = (email: string, pass: string) => {
    setLoginEmail(email);
    setLoginPassword(pass);
    setLoginError(null);
  };

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        o.id.toLowerCase().includes(q) ||
        o.customer.fullName.toLowerCase().includes(q) ||
        o.customer.email.toLowerCase().includes(q) ||
        o.customer.phone.includes(q) ||
        o.items.some((i) => i.seatLabel.toLowerCase().includes(q));

      const matchesStatus = statusFilter === 'ALL' || o.paymentStatus === statusFilter;

      const matchesCategory =
        categoryFilter === 'ALL' || o.items.some((i) => i.category === categoryFilter);

      const allChecked = o.items.every((i) => i.isCheckedIn);
      const matchesCheckIn =
        checkInFilter === 'ALL'
          ? true
          : checkInFilter === 'checked_in'
          ? allChecked
          : !allChecked;

      return matchesSearch && matchesStatus && matchesCategory && matchesCheckIn;
    });
  }, [orders, searchQuery, statusFilter, categoryFilter, checkInFilter]);

  // Actions
  const handleMarkAsPaid = async (orderId: string) => {
    if (!confirm(`Konfirmasi pembayaran lunas untuk Order ${orderId}?`)) return;

    try {
      const res = await fetch('/api/admin/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_paid', orderId }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Status berhasil diubah menjadi PAID.');
        fetchAdminData();
      } else {
        alert(data.error);
      }
    } catch (e) {
      alert((e as Error).message);
    }
  };

  const handleToggleCheckIn = async (orderId: string) => {
    try {
      const res = await fetch('/api/admin/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_checkin', orderId }),
      });
      const data = await res.json();
      if (data.success) {
        fetchAdminData();
      } else {
        alert(data.error);
      }
    } catch (e) {
      alert((e as Error).message);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (
      !confirm(
        `PERINGATAN: Apakah Anda yakin ingin menghapus Order ${orderId}? Kursi yang dipesan akan otomatis kembali TERSEDIA (Available).`
      )
    ) {
      return;
    }

    try {
      const res = await fetch('/api/admin/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_order', orderId }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Order berhasil dihapus dan kursi telah dikembalikan.');
        setSelectedOrder(null);
        fetchAdminData();
      } else {
        alert(data.error);
      }
    } catch (e) {
      alert((e as Error).message);
    }
  };

  // Handle Manual Order Submission
  const handleCreateManualOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.fullName.trim() || !manualForm.seatId) {
      alert('Nama tamu dan nomor kursi wajib diisi.');
      return;
    }

    setIsCreatingManual(true);
    try {
      const res = await fetch('/api/admin/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'manual_create',
          customer: {
            fullName: manualForm.fullName.trim(),
            email: manualForm.email.trim() || 'invitation@lspr.edu',
            phone: manualForm.phone.trim() || '-',
          },
          seatIds: [manualForm.seatId],
          paymentMethod: manualForm.paymentMethod,
          isPaid: manualForm.isPaid,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert(`Tiket tamu berhasil diterbitkan! Order ID: ${data.order.id}`);
        setManualForm({
          fullName: '',
          email: '',
          phone: '',
          seatId: '',
          paymentMethod: 'INVITATION_VIP',
          isPaid: true,
        });
        setActiveTab('transactions');
        fetchAdminData();
      } else {
        alert(data.error || 'Gagal membuat pesanan manual.');
      }
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setIsCreatingManual(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (orders.length === 0) {
      alert('Tidak ada data transaksi untuk diekspor.');
      return;
    }

    const headers = [
      'Order ID',
      'Tanggal Pembelian',
      'Nama Pembeli',
      'Email',
      'Nomor WhatsApp',
      'Daftar Nomor Kursi',
      'Kategori',
      'Total Kursi',
      'Total Bayar (Rp)',
      'Status Pembayaran',
      'Metode Pembayaran',
      'Status Kehadiran Gate',
      'Waktu Check-In',
    ];

    const rows = orders.map((o) => {
      const seatsStr = o.items.map((i) => i.seatLabel).join('; ');
      const catStr = o.items.map((i) => i.category).join('; ');
      const checkedInStr = o.items.every((i) => i.isCheckedIn)
        ? 'Checked In'
        : o.items.some((i) => i.isCheckedIn)
        ? 'Sebagian'
        : 'Belum';
      const checkInTime = o.items[0]?.checkedInAt
        ? new Date(o.items[0].checkedInAt).toLocaleString('id-ID')
        : '-';

      return [
        `"${o.id}"`,
        `"${new Date(o.createdAt).toLocaleString('id-ID')}"`,
        `"${o.customer.fullName}"`,
        `"${o.customer.email}"`,
        `"'${o.customer.phone}"`, // prefix with single quote to preserve leading zero in Excel
        `"${seatsStr}"`,
        `"${catStr}"`,
        o.items.length,
        o.totalAmount,
        `"${o.paymentStatus.toUpperCase()}"`,
        `"${o.paymentMethod || 'QRIS'}"`,
        `"${checkedInStr}"`,
        `"${checkInTime}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CHORDS_OF_COMFORT_Penjualan_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintAttendanceList = () => {
    window.print();
  };

  const handleResetData = async () => {
    if (
      !confirm(
        'PERINGATAN: Apakah Anda yakin ingin me-reset seluruh transaksi dan mengembalikan 400 kursi menjadi TERSEDIA? Seluruh data penjualan demo akan dibersihkan.'
      )
    ) {
      return;
    }

    setIsResetting(true);
    try {
      const res = await fetch('/api/admin/reset', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert('Database tiket berhasil di-reset.');
        fetchAdminData();
      }
    } catch (err) {
      alert('Gagal me-reset: ' + (err as Error).message);
    } finally {
      setIsResetting(false);
    }
  };

  // Available seats for manual order dropdown
  const availableSeatsList = useMemo(() => {
    return seats.filter((s) => s.status === 'available');
  }, [seats]);

  // ===================================================================
  // 1. LOGIN SCREEN (If not authenticated)
  // ===================================================================
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#F8F5EE] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl border-4 border-[#0F1C30] shadow-[0_12px_0_#0F1C30] overflow-hidden">
          
          {/* Header */}
          <div className="bg-[#182B49] text-white p-6 border-b-4 border-[#F4B32A] text-center relative">
            <div className="inline-flex items-center gap-1.5 bg-[#C1272D] text-[#FAF6ED] px-3 py-1 rounded-md text-xs font-bebas mb-2 border border-[#F4B32A]">
              <Lock className="w-3.5 h-3.5 text-[#F4B32A]" /> ADMIN PORTAL LOGIN
            </div>
            <h1 className="font-bebas text-3xl tracking-wider text-[#FAF6ED] leading-none">
              CHORDS OF COMFORT
            </h1>
            <p className="text-xs text-slate-300 font-semibold mt-1">
              LSPR COMM30-6SP • Ticketing Control System
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="p-6 space-y-4">
            
            {loginError && (
              <div className="bg-red-100 border-2 border-red-400 text-red-800 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Username / Email Panitia *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="meovivi@vinsky.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#FAF6ED] rounded-xl border-2 border-slate-300 focus:border-[#182B49] focus:outline-none text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#FAF6ED] rounded-xl border-2 border-slate-300 focus:border-[#182B49] focus:outline-none text-sm font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full cursor-pointer bg-[#C1272D] hover:bg-[#a61f25] disabled:bg-slate-400 text-white py-3.5 rounded-xl font-bebas text-xl tracking-wider border-2 border-[#0F1C30] shadow-[0_4px_0_#0F1C30] hover:translate-y-0.5 active:translate-y-1 transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-5 h-5 text-[#F4B32A]" />
              <span>{isLoggingIn ? 'MEMVALIDASI...' : 'MASUK KE DASHBOARD'}</span>
            </button>

            {/* Quick Login Chips for Panitia */}
            <div className="pt-3 border-t-2 border-dashed border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase block mb-2">
                Pilih Akun Panitia (Quick Login):
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickFill('meovivi@vinsky.com', 'viona1002')}
                  className="text-left p-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-xs transition-colors"
                >
                  <strong className="block text-[#182B49]">👤 Viona</strong>
                  <span className="text-[10px] text-slate-500 font-mono">meovivi@vinsky.com</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('vinsky@vinsky.com', 'alvin123')}
                  className="text-left p-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-300 text-xs transition-colors"
                >
                  <strong className="block text-[#182B49]">👤 Alvin</strong>
                  <span className="text-[10px] text-slate-500 font-mono">vinsky@vinsky.com</span>
                </button>
              </div>
            </div>

            <div className="text-center pt-2">
              <Link
                href="/"
                className="text-xs font-bold text-slate-500 hover:text-[#182B49] transition-colors"
              >
                ← Kembali ke Halaman Utama Website
              </Link>
            </div>

          </form>

        </div>
      </div>
    );
  }

  // ===================================================================
  // 2. MAIN ADMIN DASHBOARD (When authenticated)
  // ===================================================================
  return (
    <div className="min-h-screen bg-[#F8F5EE] py-6 sm:py-8 px-3 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Navbar Header */}
        <div className="bg-[#182B49] text-white p-4 sm:p-6 rounded-3xl border-4 border-[#0F1C30] shadow-[0_8px_0_#0F1C30] flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
          
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/"
              className="p-2 sm:p-2.5 rounded-xl bg-slate-800 hover:bg-[#C1272D] text-slate-300 hover:text-white transition-colors"
              title="Kembali ke Beranda"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 bg-[#F4B32A] text-[#0F1C30] px-2.5 py-0.5 rounded text-[11px] font-bebas">
                  <ShieldCheck className="w-3.5 h-3.5" /> TICKETING CONTROL PANEL
                </span>
                <span className="text-xs font-semibold text-emerald-400">
                  ● Sedang Bertugas: <strong>{currentUser.name}</strong> ({currentUser.email})
                </span>
              </div>
              <h1 className="font-bebas text-2xl sm:text-4xl text-[#FAF6ED] leading-none">
                CHORDS OF COMFORT • PANITIA COMM30-6SP
              </h1>
            </div>
          </div>

          {/* Action Buttons in Header */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <Link
              href="/scanner"
              className="cursor-pointer bg-[#F4B32A] hover:bg-amber-400 text-[#0F1C30] px-3.5 py-2 rounded-xl font-bebas text-sm sm:text-base tracking-wider border-2 border-[#0F1C30] shadow-sm flex items-center gap-1.5"
            >
              <QrCode className="w-4 h-4" />
              <span>Scan Gate HP</span>
            </Link>

            <button
              onClick={handleExportCSV}
              className="cursor-pointer bg-white hover:bg-slate-100 text-[#182B49] px-3.5 py-2 rounded-xl font-bebas text-sm sm:text-base tracking-wider border-2 border-[#0F1C30] shadow-sm flex items-center gap-1.5"
            >
              <Download className="w-4 h-4 text-blue-600" />
              <span>Export CSV (Excel)</span>
            </button>

            <button
              onClick={handlePrintAttendanceList}
              className="cursor-pointer bg-[#FAF6ED] hover:bg-slate-100 text-[#182B49] px-3.5 py-2 rounded-xl font-bebas text-sm sm:text-base tracking-wider border-2 border-[#0F1C30] shadow-sm flex items-center gap-1.5"
              title="Cetak Daftar Hadir Gate"
            >
              <Printer className="w-4 h-4 text-[#C1272D]" />
              <span>Cetak Daftar Hadir</span>
            </button>

            <button
              onClick={handleLogout}
              className="cursor-pointer bg-slate-800 hover:bg-[#C1272D] text-slate-300 hover:text-white px-3 py-2 rounded-xl font-bebas text-sm tracking-wider border border-slate-700 transition-colors flex items-center gap-1.5"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar</span>
            </button>
          </div>

        </div>

        {/* Printable Attendance Header (Only visible on Print) */}
        <div className="hidden print:block p-4 border-b-2 border-black text-center">
          <h2 className="text-xl font-bold uppercase">DAFTAR HADIR REGISTRASI PENONTON</h2>
          <p className="text-sm">Musical Theater LSPR COMM30-6SP: Chords of Comfort • Auditorium Sudirman Park</p>
          <p className="text-xs text-slate-600">Dicetak pada: {new Date().toLocaleString('id-ID')}</p>
        </div>

        {/* Analytics KPI Cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 print:hidden">
            
            <div className="bg-white p-4 sm:p-5 rounded-2xl border-3 border-[#0F1C30] shadow-[0_4px_0_#0F1C30]">
              <div className="flex items-center justify-between text-slate-500 mb-1 sm:mb-2">
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider">Total Pendapatan</span>
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-300">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="font-bebas text-2xl sm:text-4xl text-[#182B49] leading-tight">
                Rp {stats.totalRevenue.toLocaleString('id-ID')}
              </div>
              <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500 mt-1">
                Dari {stats.paidOrdersCount} transaksi lunas
              </p>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border-3 border-[#0F1C30] shadow-[0_4px_0_#0F1C30]">
              <div className="flex items-center justify-between text-slate-500 mb-1 sm:mb-2">
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider">Tiket Terjual</span>
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center border border-blue-300">
                  <Ticket className="w-4 h-4" />
                </div>
              </div>
              <div className="font-bebas text-2xl sm:text-4xl text-[#182B49] leading-tight">
                {stats.soldSeats} <span className="text-sm sm:text-lg text-slate-400">/ 400 Kursi</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden border border-slate-200">
                <div
                  className="bg-[#C1272D] h-2 rounded-full"
                  style={{ width: `${(stats.soldSeats / 400) * 100}%` }}
                />
              </div>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border-3 border-[#0F1C30] shadow-[0_4px_0_#0F1C30]">
              <div className="flex items-center justify-between text-slate-500 mb-1 sm:mb-2">
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider">Kursi Tersedia</span>
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center border border-amber-300">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="font-bebas text-2xl sm:text-4xl text-[#182B49] leading-tight">
                {stats.availableSeats} Kursi
              </div>
              <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500 mt-1">
                {stats.heldSeats} kursi sedang di-hold pembeli
              </p>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border-3 border-[#0F1C30] shadow-[0_4px_0_#0F1C30]">
              <div className="flex items-center justify-between text-slate-500 mb-1 sm:mb-2">
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider">Kehadiran (Check-In)</span>
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center border border-purple-300">
                  <QrCode className="w-4 h-4" />
                </div>
              </div>
              <div className="font-bebas text-2xl sm:text-4xl text-[#182B49] leading-tight">
                {stats.totalCheckIns} Hadir
              </div>
              <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500 mt-1">
                {stats.soldSeats > 0 ? Math.round((stats.totalCheckIns / stats.soldSeats) * 100) : 0}% rasio kehadiran gate
              </p>
            </div>

          </div>
        )}

        {/* Category Breakdown Cards */}
        {stats?.categoryStats && (
          <div className="bg-white p-4 sm:p-5 rounded-3xl border-3 border-[#0F1C30] shadow-[0_4px_0_#0F1C30] print:hidden">
            <h3 className="font-bebas text-xl sm:text-2xl text-[#182B49] mb-3">
              RINCIAN PENJUALAN PER KATEGORI KURSI
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {(Object.keys(stats.categoryStats) as TicketCategory[]).map((cat) => {
                const s = stats.categoryStats[cat];
                const info = CATEGORY_INFO[cat];
                return (
                  <div
                    key={cat}
                    className="p-3 rounded-xl bg-[#FAF6ED] border-2 border-slate-300 relative overflow-hidden"
                  >
                    <div
                      className="absolute top-0 left-0 right-0 h-1.5"
                      style={{ backgroundColor: info.color }}
                    />
                    <span className="font-bebas text-base sm:text-lg text-[#182B49] block mt-1">
                      {cat}
                    </span>
                    <div className="text-xs font-bold text-slate-600">
                      Terjual: <span className="text-[#C1272D] font-black">{s.sold}</span> / {s.total}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Sisa: {s.available} kursi
                    </div>
                    <div className="text-xs font-black text-emerald-700 mt-1.5">
                      Rp {s.revenue.toLocaleString('id-ID')}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Main Content Tabs Container */}
        <div className="bg-white rounded-3xl border-3 border-[#0F1C30] shadow-[0_6px_0_#0F1C30] overflow-hidden">
          
          {/* Tabs Navigation Header */}
          <div className="p-4 sm:p-5 border-b-2 border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 print:hidden">
            
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setActiveTab('transactions')}
                className={`cursor-pointer px-4 py-2.5 rounded-xl font-bebas text-base tracking-wider transition-all shrink-0 ${
                  activeTab === 'transactions'
                    ? 'bg-[#182B49] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Daftar Pembeli & Kursi ({orders.length})
              </button>

              <button
                onClick={() => setActiveTab('seat_inspector')}
                className={`cursor-pointer px-4 py-2.5 rounded-xl font-bebas text-base tracking-wider transition-all shrink-0 ${
                  activeTab === 'seat_inspector'
                    ? 'bg-[#182B49] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Denah Kursi & Pemilik (400)
              </button>

              <button
                onClick={() => setActiveTab('manual_order')}
                className={`cursor-pointer px-4 py-2.5 rounded-xl font-bebas text-base tracking-wider transition-all shrink-0 flex items-center gap-1.5 ${
                  activeTab === 'manual_order'
                    ? 'bg-[#C1272D] text-white shadow-sm'
                    : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Reservasi Manual / VIP</span>
              </button>
            </div>

            {/* Quick Reset Demo button */}
            <button
              onClick={handleResetData}
              disabled={isResetting}
              className="cursor-pointer bg-slate-100 hover:bg-red-50 text-red-700 px-3 py-1.5 rounded-xl text-xs font-bold border border-red-300 transition-colors flex items-center gap-1.5 shrink-0 self-end md:self-auto"
              title="Reset data transaksi"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Data Demo</span>
            </button>

          </div>

          {/* ================= TAB 1: DETAILED TRANSACTIONS & BUYERS ================= */}
          {activeTab === 'transactions' && (
            <div className="p-4 sm:p-5 space-y-4">
              
              {/* Search & Filter Controls Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 print:hidden">
                <div className="relative sm:col-span-2">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari Nama, WhatsApp, Order ID, Nomor Kursi..."
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
                  <option value="ALL">Semua Status Bayar</option>
                  <option value="paid">Hanya Lunas (PAID)</option>
                  <option value="pending">Hanya Menunggu (PENDING)</option>
                </select>

                <select
                  value={checkInFilter}
                  onChange={(e) => setCheckInFilter(e.target.value as any)}
                  className="bg-[#FAF6ED] border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none"
                >
                  <option value="ALL">Semua Status Gate</option>
                  <option value="checked_in">Sudah Check-In</option>
                  <option value="not_checked_in">Belum Hadir</option>
                </select>
              </div>

              {/* Transactions Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                {filteredOrders.length === 0 ? (
                  <div className="p-12 text-center text-slate-500 text-sm font-semibold">
                    Tidak ada pembeli atau transaksi yang cocok dengan filter.
                  </div>
                ) : (
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#FAF6ED] border-b-2 border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                        <th className="p-3">Order ID</th>
                        <th className="p-3">Nama Pembeli</th>
                        <th className="p-3">Kontak (WhatsApp / Email)</th>
                        <th className="p-3">Nomor Kursi</th>
                        <th className="p-3">Total Bayar</th>
                        <th className="p-3">Status Bayar</th>
                        <th className="p-3">Gate Check-In</th>
                        <th className="p-3 text-right print:hidden">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {filteredOrders.map((o) => (
                        <tr key={o.id} className="hover:bg-amber-50/50 transition-colors">
                          
                          {/* Order ID */}
                          <td className="p-3 font-mono font-black text-[#182B49]">
                            <div>{o.id}</div>
                            <div className="text-[10px] text-slate-400 font-sans font-normal">
                              {new Date(o.createdAt).toLocaleTimeString('id-ID', {
                                hour: '2-digit',
                                minute: '2-digit',
                                day: 'numeric',
                                month: 'short',
                              })}
                            </div>
                          </td>

                          {/* Customer Name */}
                          <td className="p-3">
                            <strong className="block text-slate-900 font-bold text-sm">
                              {o.customer.fullName}
                            </strong>
                            {o.customer.notes && (
                              <span className="text-[10px] text-slate-500 italic">
                                Note: {o.customer.notes}
                              </span>
                            )}
                          </td>

                          {/* Contact & WhatsApp Click */}
                          <td className="p-3 space-y-1">
                            <a
                              href={`https://wa.me/${o.customer.phone.replace(/[^0-9]/g, '').replace(/^0/, '62')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-900 font-bold text-xs"
                              title="Chat WhatsApp"
                            >
                              <Phone className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{o.customer.phone}</span>
                            </a>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-400" />
                              <span>{o.customer.email}</span>
                            </div>
                          </td>

                          {/* Seat numbers */}
                          <td className="p-3">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {o.items.map((it, idx) => (
                                <span
                                  key={idx}
                                  className="bg-[#FAF6ED] font-bebas text-xs px-2 py-0.5 rounded border border-[#182B49] shadow-xs text-[#182B49]"
                                >
                                  {it.seatLabel} ({it.category})
                                </span>
                              ))}
                            </div>
                          </td>

                          {/* Total Amount */}
                          <td className="p-3">
                            <span className="font-bold text-[#182B49]">
                              Rp {o.totalAmount.toLocaleString('id-ID')}
                            </span>
                            <div className="text-[10px] text-slate-400 uppercase">
                              {o.paymentMethod || 'QRIS'}
                            </div>
                          </td>

                          {/* Payment status badge */}
                          <td className="p-3">
                            {o.paymentStatus === 'paid' ? (
                              <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold text-[10px]">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> PAID
                              </span>
                            ) : (
                              <div className="space-y-1">
                                <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold text-[10px]">
                                  <Clock className="w-3 h-3" /> PENDING
                                </span>
                                <button
                                  onClick={() => handleMarkAsPaid(o.id)}
                                  className="block text-[10px] text-blue-600 hover:underline font-bold print:hidden"
                                >
                                  Konfirmasi Lunas
                                </button>
                              </div>
                            )}
                          </td>

                          {/* Gate Check-In Status */}
                          <td className="p-3">
                            {o.items.every((i) => i.isCheckedIn) ? (
                              <button
                                onClick={() => handleToggleCheckIn(o.id)}
                                className="inline-flex items-center gap-1 text-emerald-800 font-bold text-[10px] bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-300 print:border-0"
                                title="Klik untuk membatalkan check-in"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>Checked In</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleToggleCheckIn(o.id)}
                                className="inline-flex items-center gap-1 text-slate-600 hover:text-emerald-700 text-[10px] font-bold bg-slate-100 hover:bg-emerald-50 px-2 py-1 rounded-lg border border-slate-300 print:hidden"
                                title="Klik untuk manual check-in"
                              >
                                <span>Check-In Tamu</span>
                              </button>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="p-3 text-right space-x-2 print:hidden shrink-0">
                            <button
                              onClick={() => setSelectedOrder(o)}
                              className="text-xs font-bold text-[#182B49] bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg border border-slate-300"
                            >
                              Detail
                            </button>

                            <Link
                              href={`/ticket/${o.id}`}
                              target="_blank"
                              className="text-xs font-bold text-blue-600 hover:text-blue-800 underline"
                              title="Buka E-Ticket"
                            >
                              E-Ticket
                            </Link>

                            <button
                              onClick={() => handleDeleteOrder(o.id)}
                              className="text-slate-400 hover:text-red-600 p-1"
                              title="Hapus / Batalkan Order"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>

                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

            </div>
          )}

          {/* ================= TAB 2: SEAT MAP & BUYER INSPECTOR ================= */}
          {activeTab === 'seat_inspector' && (
            <div className="p-4 sm:p-6 space-y-4">
              
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-300 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                  <Info className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    Klik kursi manapun pada denah di bawah untuk melihat nama pemilik, nomor WhatsApp, atau membuat reservasi khusus VIP.
                  </span>
                </div>
              </div>

              {/* Inspector Popup if a seat is clicked */}
              {inspectedSeat && (
                <div className="bg-[#182B49] text-white p-5 rounded-2xl border-3 border-[#F4B32A] shadow-xl animate-in fade-in duration-200">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bebas text-2xl text-[#F4B32A]">
                          KURSI {inspectedSeat.label}
                        </span>
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded text-white"
                          style={{ backgroundColor: CATEGORY_INFO[inspectedSeat.category].color }}
                        >
                          {inspectedSeat.category} (Rp{inspectedSeat.price.toLocaleString('id-ID')})
                        </span>
                        <span
                          className={`text-xs font-black uppercase px-2 py-0.5 rounded ${
                            inspectedSeat.status === 'sold'
                              ? 'bg-red-500 text-white'
                              : inspectedSeat.status === 'held'
                              ? 'bg-amber-400 text-slate-900'
                              : 'bg-emerald-500 text-white'
                          }`}
                        >
                          {inspectedSeat.status}
                        </span>
                      </div>

                      {/* If sold, show buyer */}
                      {inspectedSeat.orderId ? (
                        (() => {
                          const ownerOrder = orders.find((o) => o.id === inspectedSeat.orderId);
                          if (!ownerOrder) {
                            return <p className="text-xs text-slate-300">Order ID: {inspectedSeat.orderId}</p>;
                          }
                          return (
                            <div className="mt-2 text-xs space-y-1 text-slate-200">
                              <div>
                                Nama Pembeli: <strong className="text-white text-sm">{ownerOrder.customer.fullName}</strong>
                              </div>
                              <div className="flex items-center gap-3">
                                <span>WhatsApp: <strong className="text-emerald-400">{ownerOrder.customer.phone}</strong></span>
                                <span>Email: {ownerOrder.customer.email}</span>
                              </div>
                              <div className="flex items-center gap-2 pt-1">
                                <Link
                                  href={`/ticket/${ownerOrder.id}`}
                                  target="_blank"
                                  className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded text-xs font-bold inline-flex items-center gap-1"
                                >
                                  <span>Buka Tiket {ownerOrder.id}</span>
                                  <ExternalLink className="w-3 h-3" />
                                </Link>
                              </div>
                            </div>
                          );
                        })()
                      ) : (
                        <div className="mt-2 text-xs text-slate-300">
                          Kursi ini masih kosong. Anda dapat mengalokasikannya ke tamu kehormatan melalui tab <strong>Reservasi Manual / VIP</strong>.
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => setInspectedSeat(null)}
                      className="p-1 rounded text-slate-400 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Grid of all 400 seats */}
              <div className="grid grid-cols-4 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-1.5 max-h-[500px] overflow-y-auto p-2 bg-[#FAF6ED] rounded-2xl border border-slate-300">
                {seats.map((seat) => (
                  <button
                    key={seat.id}
                    onClick={() => setInspectedSeat(seat)}
                    className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                      seat.status === 'sold'
                        ? 'bg-rose-100 border-rose-400 text-rose-900 hover:bg-rose-200'
                        : seat.status === 'held'
                        ? 'bg-amber-100 border-amber-400 text-amber-900'
                        : 'bg-white border-slate-300 text-slate-800 hover:border-[#182B49]'
                    }`}
                  >
                    <div className="font-bebas text-xs leading-none">{seat.label}</div>
                    <div className="text-[9px] font-bold text-slate-500 mt-0.5">{seat.category}</div>
                  </button>
                ))}
              </div>

            </div>
          )}

          {/* ================= TAB 3: MANUAL ORDER & VIP RESERVATION ================= */}
          {activeTab === 'manual_order' && (
            <div className="p-4 sm:p-6 max-w-2xl">
              
              <div className="mb-4">
                <h3 className="font-bebas text-2xl text-[#182B49]">
                  PENERBITAN TIKET MANUAL / RESERVASI VIP
                </h3>
                <p className="text-xs text-slate-600 font-medium">
                  Gunakan formulir ini untuk menerbitkan tiket bagi Tamu VIP, Dosen, Sponsor, atau pembayaran tunai di tempat.
                </p>
              </div>

              <form onSubmit={handleCreateManualOrder} className="space-y-4">
                
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Nama Tamu / Penerima Tiket *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Bpk. Dekan / Sponsor Utama"
                    value={manualForm.fullName}
                    onChange={(e) => setManualForm({ ...manualForm, fullName: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF6ED] rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:border-[#182B49]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                      Nomor WhatsApp / HP
                    </label>
                    <input
                      type="tel"
                      placeholder="08123456789"
                      value={manualForm.phone}
                      onChange={(e) => setManualForm({ ...manualForm, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-[#FAF6ED] rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:border-[#182B49]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                      Alamat Email
                    </label>
                    <input
                      type="email"
                      placeholder="vip@lspr.edu"
                      value={manualForm.email}
                      onChange={(e) => setManualForm({ ...manualForm, email: e.target.value })}
                      className="w-full px-3 py-2 bg-[#FAF6ED] rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:border-[#182B49]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Pilih Nomor Kursi yang Masih Tersedia * ({availableSeatsList.length} Tersedia)
                  </label>
                  <select
                    required
                    value={manualForm.seatId}
                    onChange={(e) => setManualForm({ ...manualForm, seatId: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF6ED] rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#182B49]"
                  >
                    <option value="">-- Pilih Kursi --</option>
                    {availableSeatsList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label} • {s.category} ({s.section === 'BALCONY' ? 'Balkon' : 'Main Floor'}) - Rp{s.price.toLocaleString('id-ID')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Jenis Reservasi / Metode
                  </label>
                  <select
                    value={manualForm.paymentMethod}
                    onChange={(e) => setManualForm({ ...manualForm, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF6ED] rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:outline-none"
                  >
                    <option value="INVITATION_VIP">Undangan Gratis / VIP Guest</option>
                    <option value="SPONSOR_COMP">Sponsor & Media Partner</option>
                    <option value="CASH_ON_SITE">Bayar Tunai di Tempat (Cash)</option>
                    <option value="DIRECT_TRANSFER">Transfer Manual Bank Panitia</option>
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isCreatingManual}
                    className="bg-[#C1272D] hover:bg-[#a61f25] text-white px-6 py-3 rounded-xl font-bebas text-lg tracking-wider border-2 border-[#0F1C30] shadow-[0_3px_0_#0F1C30] transition-all flex items-center gap-2"
                  >
                    <PlusCircle className="w-5 h-5 text-[#F4B32A]" />
                    <span>{isCreatingManual ? 'MEMPROSES...' : 'TERBITKAN TIKET TAMU RESMI'}</span>
                  </button>
                </div>

              </form>

            </div>
          )}

        </div>

      </div>

      {/* ================= ORDER DETAIL DRAWER MODAL ================= */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border-4 border-[#0F1C30] shadow-[0_12px_0_#0F1C30] max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="bg-[#182B49] text-white p-5 border-b-4 border-[#F4B32A] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
                  DETAIL TRANSAKSI
                </span>
                <h3 className="font-bebas text-2xl text-[#FAF6ED] leading-none">
                  ORDER: {selectedOrder.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Nama Pembeli:</span>
                <div className="font-bold text-slate-900 text-lg">{selectedOrder.customer.fullName}</div>
                <div className="text-xs text-slate-600 font-medium">
                  {selectedOrder.customer.email} • {selectedOrder.customer.phone}
                </div>
              </div>

              <div className="p-3 bg-[#FAF6ED] rounded-xl border border-slate-300 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-600 border-b border-slate-200 pb-1">
                  <span>Kursi Dipesan:</span>
                  <span>{selectedOrder.items.length} Tiket</span>
                </div>
                {selectedOrder.items.map((it, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="font-bebas text-sm text-[#182B49]">
                      Kursi {it.seatLabel} ({it.category})
                    </span>
                    <span className="font-bold text-[#C1272D]">
                      Rp {it.price.toLocaleString('id-ID')}
                    </span>
                  </div>
                ))}
                <div className="pt-2 border-t border-slate-300 flex items-center justify-between font-bebas text-lg text-[#182B49]">
                  <span>TOTAL:</span>
                  <span className="text-[#C1272D]">Rp {selectedOrder.totalAmount.toLocaleString('id-ID')}</span>
                </div>
              </div>

              <div className="text-xs space-y-1 text-slate-600">
                <div>Metode Bayar: <strong>{selectedOrder.paymentMethod || 'QRIS'}</strong></div>
                <div>Status Bayar: <strong className="uppercase">{selectedOrder.paymentStatus}</strong></div>
                <div>Waktu Pemesanan: <strong>{new Date(selectedOrder.createdAt).toLocaleString('id-ID')}</strong></div>
                {selectedOrder.paidAt && (
                  <div>Waktu Lunas: <strong>{new Date(selectedOrder.paidAt).toLocaleString('id-ID')}</strong></div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-200 flex flex-col gap-2">
                <Link
                  href={`/ticket/${selectedOrder.id}`}
                  target="_blank"
                  className="w-full bg-[#182B49] text-white py-2.5 rounded-xl font-bebas text-center text-base tracking-wider hover:bg-[#C1272D] transition-colors flex items-center justify-center gap-1.5"
                >
                  <Printer className="w-4 h-4 text-[#F4B32A]" />
                  <span>LIHAT & CETAK E-TICKET LENGKAP</span>
                </Link>

                {selectedOrder.paymentStatus !== 'paid' && (
                  <button
                    onClick={() => {
                      handleMarkAsPaid(selectedOrder.id);
                      setSelectedOrder(null);
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-bebas text-base tracking-wider transition-colors"
                  >
                    KONFIRMASI LUNAS SEKARANG
                  </button>
                )}

                <button
                  onClick={() => handleDeleteOrder(selectedOrder.id)}
                  className="w-full bg-slate-100 hover:bg-rose-50 text-rose-700 py-2 rounded-xl text-xs font-bold transition-colors"
                >
                  Hapus / Batalkan Order Ini
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
