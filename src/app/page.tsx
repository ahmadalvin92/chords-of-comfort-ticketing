'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import AboutSection from '@/components/AboutSection';
import CategoriesSection from '@/components/CategoriesSection';
import SeatPlan from '@/components/SeatPlan';
import Footer from '@/components/Footer';
import CheckoutModal from '@/components/CheckoutModal';
import PaymentModal from '@/components/PaymentModal';
import { Seat, TicketCategory, Order } from '@/types/ticket';

export default function Home() {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<TicketCategory | 'ALL'>('ALL');
  const [isLoadingSeats, setIsLoadingSeats] = useState(true);

  // Modals state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [snapToken, setSnapToken] = useState<string | undefined>(undefined);
  const [hasLiveMidtrans, setHasLiveMidtrans] = useState(false);

  // Fetch seats data from API
  const fetchSeats = useCallback(async () => {
    try {
      const res = await fetch('/api/seats');
      const data = await res.json();
      if (data.success && Array.isArray(data.seats)) {
        setSeats(data.seats);
      }
    } catch (err) {
      console.error('Failed to load seats:', err);
    } finally {
      setIsLoadingSeats(false);
    }
  }, []);

  useEffect(() => {
    fetchSeats();
    // Poll every 10 seconds to keep seat availability fresh in real-time
    const interval = setInterval(fetchSeats, 10000);
    return () => clearInterval(interval);
  }, [fetchSeats]);

  const getSessionId = () => {
    if (typeof window === 'undefined') return 'sess_default';
    let sId = localStorage.getItem('lspr_session_id');
    if (!sId) {
      sId = `sess_${Math.random().toString(36).substring(2, 10)}`;
      localStorage.setItem('lspr_session_id', sId);
    }
    return sId;
  };

  const handleToggleSeat = async (seat: Seat) => {
    const sessionId = getSessionId();
    const isCurrentlySelected = selectedSeatIds.includes(seat.id);

    if (isCurrentlySelected) {
      // Unselect & release hold
      setSelectedSeatIds((prev) => prev.filter((id) => id !== seat.id));
      try {
        await fetch('/api/seats', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ seatIds: [seat.id], sessionId }),
        });
        fetchSeats();
      } catch (e) {
        console.error('Failed to release seat:', e);
      }
    } else {
      // Limit selection (e.g., max 6 tickets per order)
      if (selectedSeatIds.length >= 6) {
        alert('Maksimal pemesanan adalah 6 kursi per transaksi.');
        return;
      }

      // Optimistically add & request hold from server
      const newSelected = [...selectedSeatIds, seat.id];
      setSelectedSeatIds(newSelected);

      try {
        const res = await fetch('/api/seats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ seatIds: [seat.id], sessionId }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          // Revert selection if conflict
          setSelectedSeatIds((prev) => prev.filter((id) => id !== seat.id));
          alert(data.error || 'Maaf, kursi ini baru saja dipilih oleh pembeli lain.');
        }
        fetchSeats();
      } catch (err) {
        console.error('Hold error:', err);
        setSelectedSeatIds((prev) => prev.filter((id) => id !== seat.id));
      }
    }
  };

  const handleScrollToSeats = () => {
    const el = document.getElementById('seating');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectCategoryFilter = (cat: TicketCategory) => {
    setActiveFilter(cat);
    handleScrollToSeats();
  };

  const handleOrderCreated = (order: Order, token?: string, live?: boolean) => {
    setCurrentOrder(order);
    setSnapToken(token);
    setHasLiveMidtrans(Boolean(live));
    setIsCheckoutOpen(false);
    setIsPaymentOpen(true);
    // Clear selection cart
    setSelectedSeatIds([]);
    fetchSeats();
  };

  const selectedSeatsList = seats.filter((s) => selectedSeatIds.includes(s.id));

  return (
    <main className="min-h-screen flex flex-col">
      {/* Midtrans Snap script loader if Client Key is configured */}
      {process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY && (
        <script
          src={
            process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true'
              ? 'https://app.midtrans.com/snap/snap.js'
              : 'https://app.sandbox.midtrans.com/snap/snap.js'
          }
          data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
          async
        />
      )}

      {/* Navigation Bar */}
      <Navbar onScrollToSeats={handleScrollToSeats} />

      {/* Hero Section */}
      <HeroSection onSelectSeatsClick={handleScrollToSeats} />

      {/* About The Show & Cast Section */}
      <AboutSection />

      {/* Ticket Categories & Pricing Section */}
      <CategoriesSection onSelectCategoryFilter={handleSelectCategoryFilter} />

      {/* Interactive 400-Seat Seating Plan */}
      <SeatPlan
        seats={seats}
        selectedSeatIds={selectedSeatIds}
        onToggleSeat={handleToggleSeat}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        isLoading={isLoadingSeats}
      />

      {/* Footer */}
      <Footer />

      {/* Checkout Form Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        selectedSeats={selectedSeatsList}
        onOrderCreated={handleOrderCreated}
      />

      {/* Payment Gateway Modal (Simulated QRIS / Midtrans Snap) */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        order={currentOrder}
        snapToken={snapToken}
        hasLiveMidtrans={hasLiveMidtrans}
      />
    </main>
  );
}
