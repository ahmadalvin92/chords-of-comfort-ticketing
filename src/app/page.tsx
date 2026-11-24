'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
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

  // Per-seat in-flight lock to prevent double-click race conditions
  const pendingSeatIdsRef = useRef<Set<string>>(new Set());

  const getSessionId = useCallback(() => {
    if (typeof window === 'undefined') return 'sess_default';
    let sId = localStorage.getItem('lspr_session_id');
    if (!sId) {
      sId = `sess_${Math.random().toString(36).substring(2, 10)}`;
      localStorage.setItem('lspr_session_id', sId);
    }
    return sId;
  }, []);

  // Fetch seats data from API with no-store & reconcile stale held selections
  const fetchSeats = useCallback(async () => {
    try {
      const res = await fetch('/api/seats', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.seats)) {
        const latestSeats = data.seats as Seat[];
        setSeats(latestSeats);

        const sessionId = getSessionId();
        setSelectedSeatIds((prev) => {
          if (prev.length === 0) return prev;
          const seatMap = new Map(latestSeats.map((s) => [s.id, s]));
          const filtered = prev.filter((id) => {
            if (pendingSeatIdsRef.current.has(id)) return true;
            const seat = seatMap.get(id);
            if (!seat || seat.category === 'VIP' || seat.status === 'sold') return false;
            if (seat.status === 'held' && (seat.orderId || seat.heldBy !== sessionId)) {
              return false;
            }
            return true;
          });
          return filtered.length === prev.length ? prev : filtered;
        });
      }
    } catch (err) {
      console.error('Failed to load seats:', err);
    }
  }, [getSessionId]);

  useEffect(() => {
    fetchSeats();
    const interval = setInterval(fetchSeats, 10000);
    return () => clearInterval(interval);
  }, [fetchSeats]);

  const handleToggleSeat = async (seatId: string) => {
    if (pendingSeatIdsRef.current.has(seatId)) return;

    const targetSeat = seats.find((s) => s.id === seatId);
    if (targetSeat && targetSeat.category === 'VIP') {
      alert('Main Floor VIP seats (Rows A & B) are exclusively reserved for special guests and cannot be booked online. VIP Balcony seats are available for booking!');
      return;
    }

    const sessionId = getSessionId();
    const isCurrentlySelected = selectedSeatIds.includes(seatId);

    if (isCurrentlySelected) {
      pendingSeatIdsRef.current.add(seatId);
      setSelectedSeatIds((prev) => prev.filter((id) => id !== seatId));
      try {
        await fetch('/api/seats', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ seatIds: [seatId], sessionId }),
        });
        await fetchSeats();
      } catch (e) {
        console.error('Failed to release seat:', e);
      } finally {
        pendingSeatIdsRef.current.delete(seatId);
      }
    } else {
      if (selectedSeatIds.length >= 6) {
        alert('Maximum booking limit is 6 seats per transaction.');
        return;
      }

      pendingSeatIdsRef.current.add(seatId);
      setSelectedSeatIds((prev) => [...prev, seatId]);

      try {
        const res = await fetch('/api/seats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ seatIds: [seatId], sessionId }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          setSelectedSeatIds((prev) => prev.filter((id) => id !== seatId));
          alert(data.error || 'Sorry, this seat is temporarily held by another attendee.');
        }
        await fetchSeats();
      } catch (err) {
        console.error('Hold error:', err);
        setSelectedSeatIds((prev) => prev.filter((id) => id !== seatId));
      } finally {
        pendingSeatIdsRef.current.delete(seatId);
      }
    }
  };

  const handleHoldExpired = useCallback(async () => {
    const sessionId = getSessionId();
    const seatsToRelease = [...selectedSeatIds];
    setSelectedSeatIds([]);
    setIsCheckoutOpen(false);
    setCheckoutError(null);

    if (seatsToRelease.length > 0) {
      try {
        await fetch('/api/seats', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ seatIds: seatsToRelease, sessionId }),
        });
      } catch {
        // Ignore release error on expiry
      }
    }
    fetchSeats();
  }, [getSessionId, selectedSeatIds, fetchSeats]);

  const handleScrollToSeats = () => {
    const el = document.getElementById('seatplan');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectCategory = (cat: string) => {
    setHighlightCategory(cat);
    handleScrollToSeats();
  };

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
      fetchSeats();
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

      {/* Interactive 297-Seat Seating Plan */}
      <SeatPlan
        seats={seats}
        selectedSeatIds={selectedSeatIds}
        onToggleSeat={handleToggleSeat}
        onProceedToCheckout={() => {
          setCheckoutError(null);
          setIsCheckoutOpen(true);
        }}
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
        onClose={() => {
          setIsCheckoutOpen(false);
          setCheckoutError(null);
        }}
        onHoldExpired={handleHoldExpired}
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
      />
    </main>
  );
}
