'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import AboutSection from '@/components/AboutSection';
import CategoriesSection from '@/components/CategoriesSection';
import SeatPlan from '@/components/SeatPlan';
import FaqSection from '@/components/FaqSection';
import Footer from '@/components/Footer';
import CheckoutModal from '@/components/CheckoutModal';
import PaymentModal from '@/components/PaymentModal';
import { Seat, CustomerInfo, Order } from '@/types/ticket';

export default function Home() {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [highlightCategory, setHighlightCategory] = useState<string | null>(null);

  // Modals state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

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
    }
  }, []);

  useEffect(() => {
    fetchSeats();
    // Poll every 10 seconds to keep seat availability synchronized in real-time
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

  const handleToggleSeat = async (seatId: string) => {
    const targetSeat = seats.find((s) => s.id === seatId);
    if (targetSeat && targetSeat.category === 'VIP') {
      alert('Main Floor VIP seats (Rows A & B) are exclusively reserved for special guests and cannot be booked online. VIP Balcony seats are available for booking!');
      return;
    }

    const sessionId = getSessionId();
    const isCurrentlySelected = selectedSeatIds.includes(seatId);

    if (isCurrentlySelected) {
      // Unselect & release hold
      setSelectedSeatIds((prev) => prev.filter((id) => id !== seatId));
      try {
        await fetch('/api/seats', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ seatIds: [seatId], sessionId }),
        });
        fetchSeats();
      } catch (e) {
        console.error('Failed to release seat:', e);
      }
    } else {
      // Limit selection to max 6 tickets per booking
      if (selectedSeatIds.length >= 6) {
        alert('Maximum booking limit is 6 seats per transaction.');
        return;
      }

      // Optimistically add & request hold from server
      setSelectedSeatIds((prev) => [...prev, seatId]);

      try {
        const res = await fetch('/api/seats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ seatIds: [seatId], sessionId }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          // Revert selection if conflict
          setSelectedSeatIds((prev) => prev.filter((id) => id !== seatId));
          alert(data.error || 'Sorry, this seat is temporarily held by another attendee.');
        }
        fetchSeats();
      } catch (err) {
        console.error('Hold error:', err);
        setSelectedSeatIds((prev) => prev.filter((id) => id !== seatId));
      }
    }
  };

  const handleScrollToSeats = () => {
    const el = document.getElementById('seatplan');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectCategory = (cat: string) => {
    setHighlightCategory(cat);
    handleScrollToSeats();
  };

  // Checkout submission handler
  const handleConfirmCheckout = async (customer: CustomerInfo, paymentMethod: string) => {
    setCheckoutLoading(true);
    setCheckoutError(null);

    const sessionId = getSessionId();

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer,
          seatIds: selectedSeatIds,
          sessionId,
          paymentMethod,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success || !data.order) {
        throw new Error(data.error || 'Failed to complete order reservation.');
      }

      setCurrentOrder(data.order);
      setIsCheckoutOpen(false);
      setIsPaymentOpen(true);
      setSelectedSeatIds([]);
      fetchSeats();
    } catch (err) {
      setCheckoutError((err as Error).message);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const selectedSeatsList = seats.filter((s) => selectedSeatIds.includes(s.id));

  return (
    <main className="min-h-screen flex flex-col bg-[#FAF6ED]">
      {/* Navigation Bar */}
      <Navbar onBookTicketsClick={handleScrollToSeats} />

      {/* Hero Section */}
      <HeroSection onSelectSeatsClick={handleScrollToSeats} />

      {/* About The Musical & Venue Location Section */}
      <AboutSection />

      {/* Ticket Tiers & Pricing Section */}
      <CategoriesSection onSelectCategory={handleSelectCategory} />

      {/* Interactive 300-Seat Seating Plan */}
      <SeatPlan
        seats={seats}
        selectedSeatIds={selectedSeatIds}
        onToggleSeat={handleToggleSeat}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
        maxSeats={6}
        highlightCategory={highlightCategory}
        onClearHighlight={() => setHighlightCategory(null)}
      />

      {/* Frequently Asked Questions (FAQ) Section */}
      <FaqSection />

      {/* Footer */}
      <Footer />

      {/* Step 1: Attendee Information Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        selectedSeats={selectedSeatsList}
        onConfirmCheckout={handleConfirmCheckout}
        loading={checkoutLoading}
        error={checkoutError}
      />

      {/* Step 2: Payment Instructions & WhatsApp Confirmation Modal */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        order={currentOrder}
        onPaymentConfirmed={(updatedOrder) => {
          setCurrentOrder(updatedOrder);
          fetchSeats();
        }}
      />
    </main>
  );
}
