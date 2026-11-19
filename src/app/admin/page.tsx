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
  Info,
  MessageCircle,
  Edit3,
  Copy,
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
  const [activeTab, setActiveTab] = useState<'transactions' | 'users' | 'seat_inspector' | 'manual_order' | 'wa_templates'>('transactions');

  // Modals & Inspectors
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [inspectedSeat, setInspectedSeat] = useState<Seat | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null);

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
        throw new Error(data.error || 'Authentication failed.');
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

  // Quick Account Autofill for Committee
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
    if (!confirm(`Confirm verified payment for Order #${orderId}?`)) return;

    try {
      const res = await fetch('/api/admin/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_paid', orderId }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Order status successfully updated to PAID.');
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
        `WARNING: Are you sure you want to delete Order #${orderId}? Reserved seats will automatically return to Available status.`
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
        alert('Order successfully deleted and seats released back to available.');
        setSelectedOrder(null);
        fetchAdminData();
      } else {
        alert(data.error);
      }
    } catch (e) {
      alert((e as Error).message);
    }
  };

  // Update Customer Info (CRUD Update)
  const handleUpdateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;

    try {
      const res = await fetch('/api/admin/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_customer',
          orderId: editingOrder.id,
          customer: editingOrder.customer,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert('Attendee information updated successfully!');
        setEditingOrder(null);
        fetchAdminData();
      } else {
        alert(data.error || 'Failed to update attendee information.');
      }
    } catch (err) {
      alert((err as Error).message);
    }
  };

  // WhatsApp Message Builders with robust URL-encoding (protecting #, emojis, and newlines)
  const buildSendTicketWaUrl = (o: Order) => {
    const cleanPhone = o.customer.phone.replace(/[^0-9]/g, '').replace(/^0/, '62');
    const seatsStr = o.items.map((i) => i.seatLabel).join(', ');
    const catStr = o.items[0]?.category || 'REGULAR';
    const plainMsg = `Hello ${o.customer.fullName}! ✨\n\nYour ticket payment for *Chords of Comfort* (LSPR COMM30-6SP • The 35th LSPR Theater Festival) has been *SUCCESSFULLY VERIFIED*! 🎉🎟️\n\n*OFFICIAL TICKET DETAILS:*\n• Order ID: *#${o.id}*\n• Name: ${o.customer.fullName}\n• Seats: *${seatsStr}* (${catStr})\n• Total Paid: Rp ${o.totalAmount.toLocaleString('id-ID')}\n• Status: *PAID (VERIFIED)*\n\n*YOUR OFFICIAL E-TICKET & QR PASS:*\n👉 https://chords-of-comfort-ticketing.vercel.app/ticket/${o.id}\n\n⚠️ *IMPORTANT INSTRUCTIONS:*\n1. Save your ticket link or take a screenshot of the QR Code.\n2. Present your QR Code at the registration desk upon gate opening (January 2027 • Amani Palladium Theatre, LSPR Bekasi).\n\nWe look forward to seeing you at the musical! 🎭🌟\nInstagram: @chordsofcomfort.theater\nSupport: WA 0819-1534-8866`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(plainMsg)}`;
  };

  const buildFollowUpWaUrl = (o: Order) => {
    const cleanPhone = o.customer.phone.replace(/[^0-9]/g, '').replace(/^0/, '62');
    const seatsStr = o.items.map((i) => i.seatLabel).join(', ');
    const plainMsg = `Hello ${o.customer.fullName}! 👋\n\nThis is the Ticketing Team for *Chords of Comfort* (LSPR COMM30-6SP).\n\nFriendly reminder regarding your ticket reservation:\n• Order ID: *#${o.id}*\n• Name: ${o.customer.fullName}\n• Seats: *${seatsStr}*\n• Total Amount: *Rp ${o.totalAmount.toLocaleString('id-ID')}*\n• Status: *Awaiting Bank Transfer*\n\n*Committee Bank Account (BCA Only):*\n- Bank BCA: *7650892101* (a.n. Viona)\n\nPlease reply with your transfer receipt to secure your reserved seats before they are automatically released. Thank you! 🙏🎭`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(plainMsg)}`;
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTemplate(id);
    setTimeout(() => setCopiedTemplate(null), 2500);
  };

  // Handle Manual Order Submission
  const handleCreateManualOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.fullName.trim() || !manualForm.seatId) {
      alert('Guest name and seat selection are required.');
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
        alert(`Guest ticket successfully issued! Order ID: #${data.order.id}`);
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
        alert(data.error || 'Failed to create manual order.');
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
      alert('No transaction records available to export.');
      return;
    }

    const headers = [
      'Order ID',
      'Booking Date',
      'Attendee Name',
      'Email',
      'WhatsApp Phone',
      'Seat Numbers',
      'Tier Category',
      'Total Seats',
      'Total Amount (IDR)',
      'Payment Status',
      'Payment Method',
      'Gate Check-In Status',
      'Check-In Timestamp',
    ];

    const rows = orders.map((o) => {
      const seatsStr = o.items.map((i) => i.seatLabel).join('; ');
      const catStr = o.items.map((i) => i.category).join('; ');
      const checkedInStr = o.items.every((i) => i.isCheckedIn)
        ? 'Checked In'
        : o.items.some((i) => i.isCheckedIn)
        ? 'Partial'
        : 'Pending';
      const checkInTime = o.items[0]?.checkedInAt
        ? new Date(o.items[0].checkedInAt).toLocaleString('en-US')
        : '-';

      return [
        `"${o.id}"`,
        `"${new Date(o.createdAt).toLocaleString('en-US')}"`,
        `"${o.customer.fullName}"`,
        `"${o.customer.email}"`,
        `"'${o.customer.phone}"`, // prefix with single quote to preserve leading zero
        `"${seatsStr}"`,
        `"${catStr}"`,
        o.items.length,
        o.totalAmount,
        `"${o.paymentStatus.toUpperCase()}"`,
        `"${o.paymentMethod || 'BANK_TRANSFER'}"`,
        `"${checkedInStr}"`,
        `"${checkInTime}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CHORDS_OF_COMFORT_Attendees_${new Date().toISOString().slice(0, 10)}.csv`);
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
        'WARNING: Are you sure you want to reset all transactions and restore all 300 seats to AVAILABLE? All demo order records will be cleared.'
      )
    ) {
      return;
    }

    setIsResetting(true);
    try {
      const res = await fetch('/api/admin/reset', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert('Ticketing database reset successfully.');
        fetchAdminData();
      }
    } catch (err) {
      alert('Failed to reset: ' + (err as Error).message);
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
                Committee Username / Email *
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
              <span>{isLoggingIn ? 'VALIDATING CREDENTIALS...' : 'SIGN IN TO DASHBOARD'}</span>
            </button>

            {/* Quick Login Chips for Committee */}
            <div className="pt-3 border-t-2 border-dashed border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase block mb-2">
                Quick Sign-In Accounts:
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
                ← Return to Public Website
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
              title="Return to Homepage"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 bg-[#F4B32A] text-[#0F1C30] px-2.5 py-0.5 rounded text-[11px] font-bebas">
                  <ShieldCheck className="w-3.5 h-3.5" /> TICKETING CONTROL PANEL
                </span>
                <span className="text-xs font-semibold text-emerald-400">
                  ● On Duty: <strong>{currentUser.name}</strong> ({currentUser.email})
                </span>
              </div>
              <h1 className="font-bebas text-2xl sm:text-4xl text-[#FAF6ED] leading-none">
                CHORDS OF COMFORT • COMM30-6SP COMMITTEE
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
              <span>Gate QR Scanner</span>
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
              title="Print Gate Attendance List"
            >
              <Printer className="w-4 h-4 text-[#C1272D]" />
              <span>Print Attendance List</span>
            </button>

            <button
              onClick={handleLogout}
              className="cursor-pointer bg-slate-800 hover:bg-[#C1272D] text-slate-300 hover:text-white px-3 py-2 rounded-xl font-bebas text-sm tracking-wider border border-slate-700 transition-colors flex items-center gap-1.5"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>

        </div>

        {/* Printable Attendance Header (Only visible on Print) */}
        <div className="hidden print:block p-4 border-b-2 border-black text-center">
          <h2 className="text-xl font-bold uppercase">OFFICIAL AUDIENCE ATTENDANCE & GATE CHECK-IN ROSTER</h2>
          <p className="text-sm">Musical Theater LSPR COMM30-6SP: Chords of Comfort • Amani Palladium Theatre, LSPR Bekasi</p>
          <p className="text-xs text-slate-600">Printed: {new Date().toLocaleString('en-US')}</p>
        </div>

        {/* Analytics KPI Cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 print:hidden">
            
            <div className="bg-white p-4 sm:p-5 rounded-2xl border-3 border-[#0F1C30] shadow-[0_4px_0_#0F1C30]">
              <div className="flex items-center justify-between text-slate-500 mb-1 sm:mb-2">
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider">Total Revenue</span>
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-300">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="font-bebas text-2xl sm:text-4xl text-[#182B49] leading-tight">
                Rp {stats.totalRevenue.toLocaleString('id-ID')}
              </div>
              <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500 mt-1">
                From {stats.paidOrdersCount} verified transactions
              </p>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border-3 border-[#0F1C30] shadow-[0_4px_0_#0F1C30]">
              <div className="flex items-center justify-between text-slate-500 mb-1 sm:mb-2">
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider">Tickets Sold</span>
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center border border-blue-300">
                  <Ticket className="w-4 h-4" />
                </div>
              </div>
              <div className="font-bebas text-2xl sm:text-4xl text-[#182B49] leading-tight">
                {stats.soldSeats} <span className="text-sm sm:text-lg text-slate-400">/ {stats.totalCapacity || 300} Seats</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden border border-slate-200">
                <div
                  className="bg-[#C1272D] h-2 rounded-full"
                  style={{ width: `${(stats.soldSeats / (stats.totalCapacity || 300)) * 100}%` }}
                />
              </div>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border-3 border-[#0F1C30] shadow-[0_4px_0_#0F1C30]">
              <div className="flex items-center justify-between text-slate-500 mb-1 sm:mb-2">
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider">Available Seats</span>
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center border border-amber-300">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="font-bebas text-2xl sm:text-4xl text-[#182B49] leading-tight">
                {stats.availableSeats} Seats
              </div>
              <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500 mt-1">
                {stats.heldSeats} seats temporarily held
              </p>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border-3 border-[#0F1C30] shadow-[0_4px_0_#0F1C30]">
              <div className="flex items-center justify-between text-slate-500 mb-1 sm:mb-2">
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider">Gate Check-In</span>
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center border border-purple-300">
                  <QrCode className="w-4 h-4" />
                </div>
              </div>
              <div className="font-bebas text-2xl sm:text-4xl text-[#182B49] leading-tight">
                {stats.totalCheckIns} Checked In
              </div>
              <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500 mt-1">
                {stats.soldSeats > 0 ? Math.round((stats.totalCheckIns / stats.soldSeats) * 100) : 0}% gate attendance rate
              </p>
            </div>

          </div>
        )}

        {/* Category Breakdown Cards */}
        {stats?.categoryStats && (
          <div className="bg-white p-4 sm:p-5 rounded-3xl border-3 border-[#0F1C30] shadow-[0_4px_0_#0F1C30] print:hidden">
            <h3 className="font-bebas text-xl sm:text-2xl text-[#182B49] mb-3">
              SALES BREAKDOWN BY SEATING TIER
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
                      Sold: <span className="text-[#C1272D] font-black">{s.sold}</span> / {s.total}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Remaining: {s.available} seats
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
                Orders & Transactions ({orders.length})
              </button>

              <button
                onClick={() => setActiveTab('users')}
                className={`cursor-pointer px-4 py-2.5 rounded-xl font-bebas text-base tracking-wider transition-all shrink-0 flex items-center gap-1.5 ${
                  activeTab === 'users'
                    ? 'bg-[#182B49] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Users className="w-4 h-4 text-[#F4B32A]" />
                <span>Attendees CMS ({orders.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('seat_inspector')}
                className={`cursor-pointer px-4 py-2.5 rounded-xl font-bebas text-base tracking-wider transition-all shrink-0 ${
                  activeTab === 'seat_inspector'
                    ? 'bg-[#182B49] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Seat Map & Occupancy ({seats.length})
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
                <span>+ Manual / VIP Reservation</span>
              </button>

              <button
                onClick={() => setActiveTab('wa_templates')}
                className={`cursor-pointer px-4 py-2.5 rounded-xl font-bebas text-base tracking-wider transition-all shrink-0 flex items-center gap-1.5 ${
                  activeTab === 'wa_templates'
                    ? 'bg-[#25D366] text-white shadow-sm'
                    : 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
                }`}
              >
                <MessageCircle className="w-4 h-4" />
                <span>💬 WhatsApp Templates</span>
              </button>
            </div>

            {/* Quick Export & Reset Demo buttons */}
            <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
              <button
                onClick={handleExportCSV}
                className="cursor-pointer bg-[#182B49] hover:bg-[#0F1C30] text-[#FAF6ED] px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-700 transition-colors flex items-center gap-1.5 shadow-sm"
                title="Download attendee database as CSV"
              >
                <Download className="w-3.5 h-3.5 text-[#F4B32A]" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={handleResetData}
                disabled={isResetting}
                className="cursor-pointer bg-slate-100 hover:bg-red-50 text-red-700 px-3 py-2 rounded-xl text-xs font-bold border border-red-300 transition-colors flex items-center gap-1.5"
                title="Reset transaction records"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Demo</span>
              </button>
            </div>

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
                    placeholder="Search by Name, WhatsApp, Order ID, Seat Number..."
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
                  <option value="ALL">All Payment Statuses</option>
                  <option value="paid">Paid (Verified)</option>
                  <option value="pending">Pending Payment</option>
                </select>

                <select
                  value={checkInFilter}
                  onChange={(e) => setCheckInFilter(e.target.value as any)}
                  className="bg-[#FAF6ED] border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none"
                >
                  <option value="ALL">All Gate Statuses</option>
                  <option value="checked_in">Checked In</option>
                  <option value="not_checked_in">Not Yet Checked In</option>
                </select>
              </div>

              {/* Transactions Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                {filteredOrders.length === 0 ? (
                  <div className="p-12 text-center text-slate-500 text-sm font-semibold">
                    No orders or attendees match the current filters.
                  </div>
                ) : (
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#FAF6ED] border-b-2 border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                        <th className="p-3">Order ID</th>
                        <th className="p-3">Attendee Name</th>
                        <th className="p-3">Contact (WhatsApp / Email)</th>
                        <th className="p-3">Seats</th>
                        <th className="p-3">Total Amount</th>
                        <th className="p-3">Payment Status</th>
                        <th className="p-3">Gate Check-In</th>
                        <th className="p-3 text-right print:hidden">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {filteredOrders.map((o) => (
                        <tr key={o.id} className="hover:bg-amber-50/50 transition-colors">
                          
                          {/* Order ID */}
                          <td className="p-3 font-mono font-black text-[#182B49]">
                            <div>{o.id}</div>
                            <div className="text-[10px] text-slate-400 font-sans font-normal">
                              {new Date(o.createdAt).toLocaleTimeString('en-US', {
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
                              title="Chat on WhatsApp"
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
                              {o.paymentMethod || 'BANK_TRANSFER'}
                            </div>
                          </td>

                          {/* Payment status badge & WhatsApp Trigger */}
                          <td className="p-3">
                            {o.paymentStatus === 'paid' ? (
                              <div className="space-y-1.5">
                                <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold text-[10px]">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> PAID (VERIFIED)
                                </span>
                                <a
                                  href={buildSendTicketWaUrl(o)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 bg-[#25D366] hover:bg-[#20ba59] text-white px-2 py-1 rounded-md text-[10px] font-bold shadow-xs transition-transform active:scale-95"
                                  title="Send official E-Ticket link to attendee via WhatsApp"
                                >
                                  <MessageCircle className="w-3 h-3 fill-current" />
                                  <span>Send Ticket WA</span>
                                </a>
                              </div>
                            ) : (
                              <div className="space-y-1.5">
                                <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold text-[10px]">
                                  <Clock className="w-3 h-3" /> PENDING
                                </span>
                                <div className="flex flex-col gap-1 print:hidden">
                                  <button
                                    onClick={() => handleMarkAsPaid(o.id)}
                                    className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-2 py-0.5 rounded text-[10px] font-bold text-center"
                                  >
                                    ✓ Approve Payment
                                  </button>
                                  <a
                                    href={buildFollowUpWaUrl(o)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-white px-2 py-0.5 rounded text-[10px] font-bold justify-center"
                                    title="Remind attendee via WhatsApp to complete bank transfer"
                                  >
                                    <MessageCircle className="w-3 h-3" />
                                    <span>Remind WA</span>
                                  </a>
                                </div>
                              </div>
                            )}
                          </td>

                          {/* Gate Check-In Status */}
                          <td className="p-3">
                            {o.items.every((i) => i.isCheckedIn) ? (
                              <button
                                onClick={() => handleToggleCheckIn(o.id)}
                                className="inline-flex items-center gap-1 text-emerald-800 font-bold text-[10px] bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-300 print:border-0"
                                title="Click to undo check-in"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>Checked In</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleToggleCheckIn(o.id)}
                                className="inline-flex items-center gap-1 text-slate-600 hover:text-emerald-700 text-[10px] font-bold bg-slate-100 hover:bg-emerald-50 px-2 py-1 rounded-lg border border-slate-300 print:hidden"
                                title="Click to manually check in guest"
                              >
                                <span>Check-In Guest</span>
                              </button>
                            )}
                          </td>

                          {/* Actions (CRUD Read, Update, Delete) */}
                          <td className="p-3 text-right space-x-1.5 print:hidden shrink-0">
                            <button
                              onClick={() => setSelectedOrder(o)}
                              className="text-[11px] font-bold text-[#182B49] bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-lg border border-slate-300"
                              title="View Order Details"
                            >
                              Details
                            </button>

                            <button
                              onClick={() => setEditingOrder(o)}
                              className="text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-amber-50 hover:text-amber-800 px-2 py-1 rounded-lg border border-slate-300 inline-flex items-center gap-1"
                              title="Edit Attendee Info (CRUD Update)"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Edit</span>
                            </button>

                            <Link
                              href={`/ticket/${o.id}`}
                              target="_blank"
                              className="text-[11px] font-bold text-blue-600 hover:text-blue-800 underline"
                              title="Open E-Ticket Pass"
                            >
                              Ticket
                            </Link>

                            <button
                              onClick={() => handleDeleteOrder(o.id)}
                              className="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors"
                              title="Cancel / Delete Order (Release Seats)"
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

          {/* ================= TAB: ATTENDEE & USER MANAGEMENT (CMS) ================= */}
          {activeTab === 'users' && (
            <div className="p-4 sm:p-5 space-y-6">
              
              {/* Header & Quick Stats */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <h3 className="font-bebas text-2xl text-[#182B49] tracking-wider leading-none">
                    ATTENDEE DIRECTORY & USER MANAGEMENT (CMS)
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Manage registered attendees, verify transfer receipts, update attendee information, or send official E-Tickets.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-50 text-emerald-800 border border-emerald-300 px-3 py-1 rounded-xl text-xs font-bold">
                    {orders.filter((o) => o.paymentStatus === 'paid').length} Paid
                  </span>
                  <span className="bg-amber-50 text-amber-800 border border-amber-300 px-3 py-1 rounded-xl text-xs font-bold">
                    {orders.filter((o) => o.paymentStatus !== 'paid').length} Pending
                  </span>
                  <button
                    onClick={handleExportCSV}
                    className="cursor-pointer bg-[#182B49] text-white hover:bg-[#0F1C30] px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5 text-[#F4B32A]" />
                    <span>Download CSV</span>
                  </button>
                </div>
              </div>

              {/* Search & Filter Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 print:hidden">
                <div className="relative sm:col-span-2">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search attendee by name, WhatsApp, email, or order ID..."
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
                  <option value="ALL">All Payment Statuses</option>
                  <option value="paid">Paid (Verified)</option>
                  <option value="pending">Pending Payment</option>
                </select>

                <select
                  value={checkInFilter}
                  onChange={(e) => setCheckInFilter(e.target.value as any)}
                  className="bg-[#FAF6ED] border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none"
                >
                  <option value="ALL">All Gate Check-In Statuses</option>
                  <option value="checked_in">Checked In</option>
                  <option value="not_checked_in">Not Checked In</option>
                </select>
              </div>

              {/* Attendee Profiles Cards Grid */}
              {filteredOrders.length === 0 ? (
                <div className="p-12 text-center text-slate-500 text-sm font-semibold bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                  No attendees found matching the query.
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filteredOrders.map((o) => {
                    const isCheckedIn = o.items.every((i) => i.isCheckedIn);
                    const cleanPhone = o.customer.phone.replace(/[^0-9]/g, '').replace(/^0/, '62');

                    return (
                      <div
                        key={o.id}
                        className="bg-[#FAF6ED] rounded-2xl border-2 border-slate-300 p-4 sm:p-5 shadow-sm space-y-4 hover:border-[#182B49] transition-all"
                      >
                        {/* Top: Name, Order ID & Status */}
                        <div className="flex items-start justify-between gap-2 border-b border-slate-200 pb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#182B49] text-[#F4B32A] font-bebas text-xl flex items-center justify-center shrink-0 border border-[#0F1C30]">
                              {o.customer.fullName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
                                {o.customer.fullName}
                              </h4>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="font-mono text-[11px] text-[#182B49] font-bold">
                                  #{o.id}
                                </span>
                                <span className="text-[10px] text-slate-400">•</span>
                                <span className="text-[10px] text-slate-500">
                                  {new Date(o.createdAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1">
                            {o.paymentStatus === 'paid' ? (
                              <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> PAID
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-300">
                                <Clock className="w-3 h-3 text-amber-600" /> PENDING
                              </span>
                            )}

                            {isCheckedIn ? (
                              <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                <UserCheck className="w-3 h-3" /> Checked In
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-semibold">
                                Gate: Unscanned
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Middle: Contact Info & Seats */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div className="space-y-1.5">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              Contact Channels
                            </div>
                            <div className="flex items-center gap-2">
                              <a
                                href={`https://wa.me/${cleanPhone}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 rounded-lg text-[11px] shadow-xs"
                                title="Chat on WhatsApp"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>{o.customer.phone}</span>
                              </a>
                            </div>
                            <div className="text-slate-600 flex items-center gap-1.5 pt-0.5">
                              <Mail className="w-3.5 h-3.5 text-slate-400" />
                              <span className="truncate">{o.customer.email}</span>
                            </div>
                            {o.customer.notes && (
                              <div className="text-[11px] text-amber-900 bg-amber-50 p-1.5 rounded-lg border border-amber-200 italic">
                                "{o.customer.notes}"
                              </div>
                            )}
                          </div>

                          <div className="space-y-1.5">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              Assigned Seats ({o.items.length})
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {o.items.map((it, idx) => (
                                <span
                                  key={idx}
                                  className="bg-white border border-[#182B49] text-[#182B49] font-bebas text-xs px-2 py-0.5 rounded shadow-xs"
                                >
                                  {it.seatLabel} ({it.category})
                                </span>
                              ))}
                            </div>
                            <div className="pt-1 flex items-baseline justify-between border-t border-slate-200">
                              <span className="text-[11px] text-slate-500 font-medium">Total Bill:</span>
                              <span className="font-bebas text-lg text-[#C1272D] leading-none">
                                Rp {o.totalAmount.toLocaleString('id-ID')}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Bottom Actions Toolbar */}
                        <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            {o.paymentStatus === 'paid' ? (
                              <a
                                href={buildSendTicketWaUrl(o)}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 bg-[#25D366] hover:bg-[#20ba59] text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all"
                                title="Send official ticket pass to user via WhatsApp"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>Send Ticket WA</span>
                              </a>
                            ) : (
                              <button
                                onClick={() => handleMarkAsPaid(o.id)}
                                className="cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Approve BCA Transfer</span>
                              </button>
                            )}

                            <Link
                              href={`/ticket/${o.id}`}
                              target="_blank"
                              className="inline-flex items-center gap-1 bg-white hover:bg-slate-100 text-slate-700 px-2.5 py-1.5 rounded-xl text-xs font-bold border border-slate-300"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>View Ticket</span>
                            </Link>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setEditingOrder(o)}
                              className="cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-700 px-2.5 py-1.5 rounded-xl text-xs font-bold border border-blue-200 flex items-center gap-1"
                              title="Edit attendee name, phone, email, notes"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>

                            <button
                              onClick={() => handleDeleteOrder(o.id)}
                              className="cursor-pointer bg-red-50 hover:bg-red-100 text-red-700 px-2.5 py-1.5 rounded-xl text-xs font-bold border border-red-200 flex items-center gap-1"
                              title="Delete attendee reservation and release seats"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}

          {/* ================= TAB 2: SEAT MAP & BUYER INSPECTOR ================= */}
          {activeTab === 'seat_inspector' && (
            <div className="p-4 sm:p-6 space-y-4">
              
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-300 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                  <Info className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    Click any seat on the floor map below to inspect attendee details, contact info, or assign honorary VIP reservations.
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
                          SEAT {inspectedSeat.label}
                        </span>
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded text-white"
                          style={{ backgroundColor: CATEGORY_INFO[inspectedSeat.category].color }}
                        >
                          {inspectedSeat.category} (Rp {inspectedSeat.price.toLocaleString('id-ID')})
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
                            return <p className="text-xs text-slate-300">Order ID: #{inspectedSeat.orderId}</p>;
                          }
                          return (
                            <div className="mt-2 text-xs space-y-1 text-slate-200">
                              <div>
                                Attendee Name: <strong className="text-white text-sm">{ownerOrder.customer.fullName}</strong>
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
                                  <span>View E-Ticket #{ownerOrder.id}</span>
                                  <ExternalLink className="w-3 h-3" />
                                </Link>
                              </div>
                            </div>
                          );
                        })()
                      ) : (
                        <div className="mt-2 text-xs text-slate-300">
                          This seat is currently available. You can allocate it to special guests via the <strong>Manual / VIP Reservation</strong> tab.
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

              {/* Grid of all 300 seats */}
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
                  MANUAL TICKET ISSUANCE & VIP RESERVATION
                </h3>
                <p className="text-xs text-slate-600 font-medium">
                  Use this form to issue tickets for VIP Guests, Faculty, Sponsors, or on-site cash payments.
                </p>
              </div>

              <form onSubmit={handleCreateManualOrder} className="space-y-4">
                
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Guest / Recipient Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dean of Communication / Primary Sponsor"
                    value={manualForm.fullName}
                    onChange={(e) => setManualForm({ ...manualForm, fullName: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF6ED] rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:border-[#182B49]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                      WhatsApp / Phone Number
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
                      Email Address
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
                    Select Available Seat * ({availableSeatsList.length} Available)
                  </label>
                  <select
                    required
                    value={manualForm.seatId}
                    onChange={(e) => setManualForm({ ...manualForm, seatId: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF6ED] rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#182B49]"
                  >
                    <option value="">-- Choose Seat --</option>
                    {availableSeatsList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label} • {s.category} ({s.section === 'BALCONY' ? 'Balcony' : 'Main Floor'}) - Rp {s.price.toLocaleString('id-ID')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Reservation Type / Payment Method
                  </label>
                  <select
                    value={manualForm.paymentMethod}
                    onChange={(e) => setManualForm({ ...manualForm, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF6ED] rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:outline-none"
                  >
                    <option value="INVITATION_VIP">Complimentary VIP Invitation</option>
                    <option value="SPONSOR_COMP">Sponsor & Media Partner</option>
                    <option value="CASH_ON_SITE">On-Site Cash Payment</option>
                    <option value="DIRECT_TRANSFER">Direct Bank Transfer</option>
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isCreatingManual}
                    className="bg-[#C1272D] hover:bg-[#a61f25] text-white px-6 py-3 rounded-xl font-bebas text-lg tracking-wider border-2 border-[#0F1C30] shadow-[0_3px_0_#0F1C30] transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <PlusCircle className="w-5 h-5 text-[#F4B32A]" />
                    <span>{isCreatingManual ? 'PROCESSING...' : 'ISSUE OFFICIAL GUEST TICKET'}</span>
                  </button>
                </div>

              </form>

            </div>
          )}

          {/* ================= TAB 4: WHATSAPP CHAT TEMPLATES ================= */}
          {activeTab === 'wa_templates' && (
            <div className="p-4 sm:p-6 space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-emerald-50 border-2 border-emerald-300 p-4 rounded-2xl">
                <div>
                  <div className="flex items-center gap-2 text-emerald-950 font-bebas text-xl">
                    <MessageCircle className="w-5 h-5 text-emerald-600 fill-emerald-600" />
                    <span>OFFICIAL WHATSAPP COMMITTEE COMMUNICATION TEMPLATES</span>
                  </div>
                  <p className="text-xs text-emerald-800 font-medium mt-0.5">
                    Official WhatsApp Ticketing Contact: <strong>0819-1534-8866</strong> • Official Instagram: <strong>@chordsofcomfort.theater</strong>
                  </p>
                </div>

                <a
                  href="https://wa.me/6281915348866"
                  target="_blank"
                  rel="noreferrer"
                  className="bg-[#25D366] hover:bg-[#20ba59] text-white px-4 py-2 rounded-xl text-xs font-bold border border-slate-900 shadow-sm flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>Open Committee WA (081915348866)</span>
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Template 1: Approved / E-Ticket Delivery */}
                <div className="bg-[#FAF6ED] p-4 sm:p-5 rounded-2xl border-2 border-slate-300 shadow-sm flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="bg-emerald-100 text-emerald-900 font-bold text-[10px] uppercase px-2.5 py-0.5 rounded-full border border-emerald-300">
                        Template 1: Verified Payment (Send E-Ticket)
                      </span>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            `Hello [Attendee Name]! ✨\n\nYour ticket payment for *Chords of Comfort* (LSPR COMM30-6SP • The 35th LSPR Theater Festival) has been *SUCCESSFULLY VERIFIED*! 🎉🎟️\n\n*OFFICIAL TICKET DETAILS:*\n• Order ID: *#[Order ID]*\n• Name: [Attendee Name]\n• Seats: *[Seat Numbers]* ([Category])\n• Total: Rp [Total Amount]\n• Status: *PAID (VERIFIED)*\n\n*YOUR OFFICIAL E-TICKET & QR PASS:*\n👉 https://chords-of-comfort-ticketing.vercel.app/ticket/[Order ID]\n\n⚠️ *IMPORTANT INSTRUCTIONS:*\n1. Save your ticket link or take a screenshot of the QR Code.\n2. Present your QR Code at the registration desk upon gate opening (January 2027 • Amani Palladium Theatre, LSPR Bekasi).\n\nWe look forward to welcoming you to the musical! 🎭🌟\nInstagram: @chordsofcomfort.theater\nSupport: WA 0819-1534-8866`,
                            'tmpl_1'
                          )
                        }
                        className="cursor-pointer text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-300 flex items-center gap-1"
                      >
                        {copiedTemplate === 'tmpl_1' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-500" />
                            <span>Copy Text</span>
                          </>
                        )}
                      </button>
                    </div>

                    <h4 className="font-bebas text-lg text-[#182B49]">OFFICIAL TICKET VERIFIED (PAID)</h4>
                    <p className="text-[11px] text-slate-500 mb-2 font-medium">
                      Use this template once bank transfer proof is verified in committee accounts.
                    </p>

                    <div className="bg-white p-3 rounded-xl border border-slate-300 text-xs font-mono text-slate-700 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
{`Hello [Attendee Name]! ✨

Your ticket payment for *Chords of Comfort* (LSPR COMM30-6SP • The 35th LSPR Theater Festival) has been *SUCCESSFULLY VERIFIED*! 🎉🎟️

*OFFICIAL TICKET DETAILS:*
• Order ID: *#[Order ID]*
• Seats: *[Seat Numbers]* ([Category])
• Total: Rp [Total Amount]
• Status: *PAID (VERIFIED)*

*YOUR OFFICIAL E-TICKET & QR PASS:*
👉 https://chords-of-comfort-ticketing.vercel.app/ticket/[Order ID]

⚠️ *IMPORTANT INSTRUCTIONS:*
1. Save your ticket link or take a screenshot of the QR Code.
2. Present your QR Code at the registration desk upon gate opening (January 2027 • Amani Palladium Theatre, LSPR Bekasi).

We look forward to welcoming you to the musical! 🎭🌟
Instagram: @chordsofcomfort.theater`}
                    </div>
                  </div>
                </div>

                {/* Template 2: Follow-up Pending Transfer */}
                <div className="bg-[#FAF6ED] p-4 sm:p-5 rounded-2xl border-2 border-slate-300 shadow-sm flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="bg-amber-100 text-amber-900 font-bold text-[10px] uppercase px-2.5 py-0.5 rounded-full border border-amber-300">
                        Template 2: Payment Reminder (Pending)
                      </span>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            `Hello [Attendee Name]! 👋\n\nThis is the Ticketing Team for *Chords of Comfort* (LSPR COMM30-6SP).\n\nFriendly reminder regarding your ticket reservation:\n• Order ID: *#[Order ID]*\n• Seats: *[Seat Numbers]*\n• Total Amount: *Rp [Total Amount]*\n• Status: *Awaiting Bank Transfer*\n\n*Committee Bank Account (BCA Only):*\n- Bank BCA: *7650892101* (a.n. Viona)\n\nPlease reply with your transfer receipt to secure your reserved seats before they are automatically released. Thank you! 🙏🎭`,
                            'tmpl_2'
                          )
                        }
                        className="cursor-pointer text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-300 flex items-center gap-1"
                      >
                        {copiedTemplate === 'tmpl_2' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-500" />
                            <span>Copy Text</span>
                          </>
                        )}
                      </button>
                    </div>

                    <h4 className="font-bebas text-lg text-[#182B49]">TRANSFER REMINDER FOR PENDING ORDERS</h4>
                    <p className="text-[11px] text-slate-500 mb-2 font-medium">
                      Send to attendees who booked seats on the site but have not yet submitted payment receipts.
                    </p>

                    <div className="bg-white p-3 rounded-xl border border-slate-300 text-xs font-mono text-slate-700 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
{`Hello [Attendee Name]! 👋

This is the Ticketing Team for *Chords of Comfort* (LSPR COMM30-6SP).

Friendly reminder regarding your ticket reservation:
• Order ID: *#[Order ID]*
• Seats: *[Seat Numbers]*
• Total Amount: *Rp [Total Amount]*
• Status: *Awaiting Bank Transfer*

*Committee Bank Account (BCA Only):*
- Bank BCA: *7650892101* (a.n. Viona)

Please reply with your transfer receipt to secure your reserved seats before they are automatically released. Thank you! 🙏🎭`}
                    </div>
                  </div>
                </div>

                {/* Template 3: Order Cancellation / Rejection */}
                <div className="bg-[#FAF6ED] p-4 sm:p-5 rounded-2xl border-2 border-slate-300 shadow-sm flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="bg-red-100 text-red-900 font-bold text-[10px] uppercase px-2.5 py-0.5 rounded-full border border-red-300">
                        Template 3: Order Cancellation / Expired
                      </span>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            `Hello [Attendee Name], we regret to inform you that your reservation for Chords of Comfort (*Order ID: #[Order ID]*) has been cancelled due to payment window expiration or an unverified transfer receipt. Your seats have been released back to the floor. If you have any questions, please contact us at 0819-1534-8866. Thank you!`,
                            'tmpl_3'
                          )
                        }
                        className="cursor-pointer text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-300 flex items-center gap-1"
                      >
                        {copiedTemplate === 'tmpl_3' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-500" />
                            <span>Copy Text</span>
                          </>
                        )}
                      </button>
                    </div>

                    <h4 className="font-bebas text-lg text-[#182B49]">ORDER CANCELLATION NOTICE</h4>
                    <p className="text-[11px] text-slate-500 mb-2 font-medium">
                      Send when the committee cancels an order due to payment window expiry.
                    </p>

                    <div className="bg-white p-3 rounded-xl border border-slate-300 text-xs font-mono text-slate-700 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
{`Hello [Attendee Name], we regret to inform you that your reservation for Chords of Comfort (*Order ID: #[Order ID]*) has been cancelled due to payment window expiration or an unverified transfer receipt. Your seats have been released back to the floor. 

If you have any questions, please contact us at 0819-1534-8866. Thank you!`}
                    </div>
                  </div>
                </div>

                {/* Template 4: Rundown & Show Day Guide */}
                <div className="bg-[#FAF6ED] p-4 sm:p-5 rounded-2xl border-2 border-slate-300 shadow-sm flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="bg-blue-100 text-blue-900 font-bold text-[10px] uppercase px-2.5 py-0.5 rounded-full border border-blue-300">
                        Template 4: Show Day & Gate Guide
                      </span>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            `Hello Chords of Comfort Attendees! 🎭✨\n\nThe musical theater production *COMM30-6SP: Chords of Comfort* (The 35th LSPR Theater Festival) is coming up!\n\n📍 *VENUE:* Amani Palladium Theatre, LSPR Bekasi, Indonesia\n⏰ *SCHEDULE:* January 2027 (Date & Showtime TBA)\n\n⚠️ *ENTRY GUIDELINES:*\n• Have your official E-Ticket ready from your confirmation link.\n• Present the QR Code on your mobile screen to gate scanners.\n• Please arrive promptly prior to auditorium doors closing.\n\nSee you at the theatre! 🌟`,
                            'tmpl_4'
                          )
                        }
                        className="cursor-pointer text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-300 flex items-center gap-1"
                      >
                        {copiedTemplate === 'tmpl_4' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-500" />
                            <span>Copy Text</span>
                          </>
                        )}
                      </button>
                    </div>

                    <h4 className="font-bebas text-lg text-[#182B49]">SHOW DAY REMINDER & GATE GUIDELINES</h4>
                    <p className="text-[11px] text-slate-500 mb-2 font-medium">
                      Broadcast to attendees prior to show day to prepare their entry passes.
                    </p>

                    <div className="bg-white p-3 rounded-xl border border-slate-300 text-xs font-mono text-slate-700 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
{`Hello Chords of Comfort Attendees! 🎭✨

The musical theater production *COMM30-6SP: Chords of Comfort* (The 35th LSPR Theater Festival) is coming up!

📍 *VENUE:* Amani Palladium Theatre, LSPR Bekasi, Indonesia
⏰ *SCHEDULE:* January 2027 (Date & Showtime TBA)

⚠️ *ENTRY GUIDELINES:*
• Have your official E-Ticket ready from your confirmation link.
• Present the QR Code on your mobile screen to gate scanners.
• Please arrive promptly prior to auditorium doors closing.

See you at the theatre! 🌟`}
                    </div>
                  </div>
                </div>

              </div>

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
                  TRANSACTION DETAILS & ACTIONS
                </span>
                <h3 className="font-bebas text-2xl text-[#FAF6ED] leading-none">
                  ORDER: #{selectedOrder.id}
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
              
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Attendee Name:</span>
                  <div className="font-bold text-slate-900 text-lg">{selectedOrder.customer.fullName}</div>
                  <div className="text-xs text-slate-600 font-medium">
                    {selectedOrder.customer.email} • {selectedOrder.customer.phone}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setEditingOrder(selectedOrder);
                    setSelectedOrder(null);
                  }}
                  className="bg-amber-100 hover:bg-amber-200 text-amber-900 px-3 py-1.5 rounded-xl text-xs font-bold border border-amber-300 flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Info</span>
                </button>
              </div>

              <div className="p-3 bg-[#FAF6ED] rounded-xl border border-slate-300 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-600 border-b border-slate-200 pb-1">
                  <span>Reserved Seats:</span>
                  <span>{selectedOrder.items.length} Tickets</span>
                </div>
                {selectedOrder.items.map((it, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="font-bebas text-sm text-[#182B49]">
                      Seat {it.seatLabel} ({it.category})
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
                <div>Payment Method: <strong>{selectedOrder.paymentMethod || 'BANK_TRANSFER'}</strong></div>
                <div>Payment Status: <strong className="uppercase">{selectedOrder.paymentStatus}</strong></div>
                <div>Order Timestamp: <strong>{new Date(selectedOrder.createdAt).toLocaleString('en-US')}</strong></div>
                {selectedOrder.paidAt && (
                  <div>Verified At: <strong>{new Date(selectedOrder.paidAt).toLocaleString('en-US')}</strong></div>
                )}
              </div>

              {/* WhatsApp Quick Actions */}
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-300 space-y-2">
                <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4 text-emerald-600 fill-current" />
                  <span>Send WhatsApp Message to Attendee:</span>
                </span>
                <div className="flex flex-col gap-1.5">
                  <a
                    href={buildSendTicketWaUrl(selectedOrder)}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs"
                  >
                    <MessageCircle className="w-4 h-4 fill-current" />
                    <span>Send Official E-Ticket Pass (Paid)</span>
                  </a>

                  {selectedOrder.paymentStatus !== 'paid' && (
                    <a
                      href={buildFollowUpWaUrl(selectedOrder)}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Send Payment Reminder (Pending)</span>
                    </a>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex flex-col gap-2">
                <Link
                  href={`/ticket/${selectedOrder.id}`}
                  target="_blank"
                  className="w-full bg-[#182B49] text-white py-2.5 rounded-xl font-bebas text-center text-base tracking-wider hover:bg-[#C1272D] transition-colors flex items-center justify-center gap-1.5"
                >
                  <Printer className="w-4 h-4 text-[#F4B32A]" />
                  <span>VIEW & PRINT OFFICIAL E-TICKET</span>
                </Link>

                {selectedOrder.paymentStatus !== 'paid' && (
                  <button
                    onClick={() => {
                      handleMarkAsPaid(selectedOrder.id);
                      setSelectedOrder(null);
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-bebas text-base tracking-wider transition-colors cursor-pointer"
                  >
                    APPROVE / VERIFY PAYMENT
                  </button>
                )}

                <button
                  onClick={() => handleDeleteOrder(selectedOrder.id)}
                  className="w-full bg-slate-100 hover:bg-rose-50 text-rose-700 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel / Delete Order (Release Seats to Available)
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ================= EDIT BUYER CUSTOMER MODAL (CRUD UPDATE) ================= */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border-4 border-[#0F1C30] shadow-[0_12px_0_#0F1C30] max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="bg-[#182B49] text-white p-5 border-b-4 border-[#F4B32A] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
                  EDIT ATTENDEE INFORMATION (CRUD)
                </span>
                <h3 className="font-bebas text-2xl text-[#FAF6ED] leading-none">
                  ORDER: #{editingOrder.id}
                </h3>
              </div>
              <button
                onClick={() => setEditingOrder(null)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleUpdateCustomer} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Attendee Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={editingOrder.customer.fullName}
                  onChange={(e) =>
                    setEditingOrder({
                      ...editingOrder,
                      customer: { ...editingOrder.customer, fullName: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-[#FAF6ED] rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:border-[#182B49]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  WhatsApp / Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={editingOrder.customer.phone}
                  onChange={(e) =>
                    setEditingOrder({
                      ...editingOrder,
                      customer: { ...editingOrder.customer, phone: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-[#FAF6ED] rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:border-[#182B49]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={editingOrder.customer.email}
                  onChange={(e) =>
                    setEditingOrder({
                      ...editingOrder,
                      customer: { ...editingOrder.customer, email: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-[#FAF6ED] rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:border-[#182B49]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Internal Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. VIP Committee / Campus Guest"
                  value={editingOrder.customer.notes || ''}
                  onChange={(e) =>
                    setEditingOrder({
                      ...editingOrder,
                      customer: { ...editingOrder.customer, notes: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-[#FAF6ED] rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:border-[#182B49]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-xl text-xs font-bold text-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#182B49] hover:bg-[#C1272D] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
