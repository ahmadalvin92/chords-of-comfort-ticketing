import { Seat, TicketCategory } from '@/types/ticket';

export const CATEGORY_INFO: Record<
  TicketCategory,
  { name: string; price: number; color: string; badgeBg: string; border: string; description: string; total: number }
> = {
  VIP: {
    name: 'VIP Main Floor',
    price: 50000,
    color: '#E04D65', // Coral/Red as in the chart
    badgeBg: 'bg-rose-100 text-rose-700 border-rose-400',
    border: 'border-rose-500',
    description: 'Main Floor - Row A & B Center (Seats 11-20)',
    total: 20,
  },
  VIP_BALCONY: {
    name: 'VIP Balcony',
    price: 50000,
    color: '#E04D65', // Coral/Red as in the chart
    badgeBg: 'bg-rose-100 text-rose-700 border-rose-400',
    border: 'border-rose-500',
    description: 'Balcony - Row AA Center (Seats 9-17)',
    total: 9,
  },
  REGULAR: {
    name: 'REGULAR',
    price: 35000,
    color: '#3B82F6', // Blue as in the chart
    badgeBg: 'bg-blue-100 text-blue-700 border-blue-400',
    border: 'border-blue-500',
    description: 'Main Floor & Balcony (Standard Theater View)',
    total: 271,
  },
};

export function generateInitialSeats(): Seat[] {
  const seats: Seat[] = [];

  // =================================================================
  // 1. MAIN FLOOR (225 SEATS TOTAL)
  // Rows: A, B, C, D, E, F, G, H
  // Rows A-G: 30 seats each (Left 1-10, Center 11-20, Right 21-30)
  // Row H: 15 seats (Left 1-10, Right 21-25)
  // VIP: Row A (11-20) & Row B (11-20) = 20 seats
  // REGULAR: The rest = 205 seats
  // =================================================================
  const mainFloorRows = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

  mainFloorRows.forEach((row) => {
    // Left Block: 1 to 10 (Regular)
    for (let num = 1; num <= 10; num++) {
      seats.push({
        id: `MF-${row}-${num}`,
        label: `${row}-${num}`,
        section: 'MAIN_FLOOR',
        row,
        number: num,
        block: 'LEFT',
        category: 'REGULAR',
        price: 35000,
        status: 'available',
      });
    }

    // Center Block: 11 to 20 (VIP for Row A and B; Regular for C-G)
    for (let num = 11; num <= 20; num++) {
      const isVip = row === 'A' || row === 'B';
      seats.push({
        id: `MF-${row}-${num}`,
        label: `${row}-${num}`,
        section: 'MAIN_FLOOR',
        row,
        number: num,
        block: 'CENTER',
        category: isVip ? 'VIP' : 'REGULAR',
        price: isVip ? 50000 : 35000,
        status: 'available',
      });
    }

    // Right Block: 21 to 30 (Regular)
    for (let num = 21; num <= 30; num++) {
      seats.push({
        id: `MF-${row}-${num}`,
        label: `${row}-${num}`,
        section: 'MAIN_FLOOR',
        row,
        number: num,
        block: 'RIGHT',
        category: 'REGULAR',
        price: 35000,
        status: 'available',
      });
    }
  });

  // Row H: Left (1-10) and Right (21-25)
  for (let num = 1; num <= 10; num++) {
    seats.push({
      id: `MF-H-${num}`,
      label: `H-${num}`,
      section: 'MAIN_FLOOR',
      row: 'H',
      number: num,
      block: 'LEFT',
      category: 'REGULAR',
      price: 35000,
      status: 'available',
    });
  }

  for (let num = 21; num <= 25; num++) {
    seats.push({
      id: `MF-H-${num}`,
      label: `H-${num}`,
      section: 'MAIN_FLOOR',
      row: 'H',
      number: num,
      block: 'RIGHT',
      category: 'REGULAR',
      price: 35000,
      status: 'available',
    });
  }

  // =================================================================
  // 2. BALCONY (75 SEATS TOTAL)
  // Rows: AA, AB, AC
  // Left: 1 to 8 (Regular)
  // Center: 9 to 17 (VIP Balcony on Row AA; Regular on Row AB and AC)
  // Right: 18 to 25 (Regular)
  // VIP BALCONY: Row AA (9-17) = 9 seats
  // REGULAR: 66 seats
  // =================================================================
  const balconyRows = ['AA', 'AB', 'AC'];

  balconyRows.forEach((row) => {
    // Left: 1 to 8
    for (let num = 1; num <= 8; num++) {
      seats.push({
        id: `BAL-${row}-${num}`,
        label: `${row}-${num}`,
        section: 'BALCONY',
        row,
        number: num,
        block: 'LEFT',
        category: 'REGULAR',
        price: 35000,
        status: 'available',
      });
    }

    // Center: 9 to 17 (VIP Balcony for Row AA; Regular for AB & AC)
    for (let num = 9; num <= 17; num++) {
      const isVipBalcony = row === 'AA';
      seats.push({
        id: `BAL-${row}-${num}`,
        label: `${row}-${num}`,
        section: 'BALCONY',
        row,
        number: num,
        block: 'CENTER',
        category: isVipBalcony ? 'VIP_BALCONY' : 'REGULAR',
        price: isVipBalcony ? 50000 : 35000,
        status: 'available',
      });
    }

    // Right: 18 to 25
    for (let num = 18; num <= 25; num++) {
      seats.push({
        id: `BAL-${row}-${num}`,
        label: `${row}-${num}`,
        section: 'BALCONY',
        row,
        number: num,
        block: 'RIGHT',
        category: 'REGULAR',
        price: 35000,
        status: 'available',
      });
    }
  });

  return seats;
}
