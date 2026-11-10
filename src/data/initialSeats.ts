import { Seat, TicketCategory } from '@/types/ticket';

export const CATEGORY_INFO: Record<
  TicketCategory,
  { name: string; price: number; color: string; badgeBg: string; border: string; description: string; total: number }
> = {
  VIP: {
    name: 'VIP',
    price: 70000,
    color: '#EC4899', // Pink
    badgeBg: 'bg-pink-100 text-pink-700 border-pink-400',
    border: 'border-pink-500',
    description: 'Main Floor - Front Center (Row A1-A5)',
    total: 50,
  },
  SAPPHIRE: {
    name: 'SAPPHIRE',
    price: 60000,
    color: '#3B82F6', // Blue
    badgeBg: 'bg-blue-100 text-blue-700 border-blue-400',
    border: 'border-blue-500',
    description: 'Balcony - Row 1',
    total: 25,
  },
  DIAMOND: {
    name: 'DIAMOND',
    price: 50000,
    color: '#F59E0B', // Orange/Amber
    badgeBg: 'bg-amber-100 text-amber-700 border-amber-400',
    border: 'border-amber-500',
    description: 'Main Floor - Middle & Rear',
    total: 175,
  },
  PLATINUM: {
    name: 'PLATINUM',
    price: 45000,
    color: '#10B981', // Emerald Green
    badgeBg: 'bg-emerald-100 text-emerald-700 border-emerald-400',
    border: 'border-emerald-500',
    description: 'Balcony - Row 2-3',
    total: 50,
  },
  RUBY: {
    name: 'RUBY',
    price: 35000,
    color: '#EF4444', // Red
    badgeBg: 'bg-rose-100 text-rose-700 border-rose-400',
    border: 'border-rose-500',
    description: 'Main Floor - Side & Rear (Limited View)',
    total: 100,
  },
};

export function generateInitialSeats(): Seat[] {
  const seats: Seat[] = [];

  // ================= 1. BALCONY (UPPER LEVEL) - 75 seats =================
  const balconyRows: { row: string; category: TicketCategory; price: number }[] = [
    { row: 'R1', category: 'SAPPHIRE', price: 60000 },
    { row: 'R2', category: 'PLATINUM', price: 45000 },
    { row: 'R3', category: 'PLATINUM', price: 45000 },
  ];

  balconyRows.forEach(({ row, category, price }) => {
    // Left: 8 seats
    for (let i = 1; i <= 8; i++) {
      seats.push({
        id: `BAL-${row}-L${i}`,
        label: `${row}-L${i}`,
        section: 'BALCONY',
        subSection: 'LEFT',
        row,
        number: i,
        category,
        price,
        status: 'available',
      });
    }

    // Center: 9 seats
    for (let i = 1; i <= 9; i++) {
      seats.push({
        id: `BAL-${row}-C${i}`,
        label: `${row}-C${i}`,
        section: 'BALCONY',
        subSection: 'CENTER',
        row,
        number: i,
        category,
        price,
        status: 'available',
      });
    }

    // Right: 8 seats
    for (let i = 1; i <= 8; i++) {
      seats.push({
        id: `BAL-${row}-R${i}`,
        label: `${row}-R${i}`,
        section: 'BALCONY',
        subSection: 'RIGHT',
        row,
        number: i,
        category,
        price,
        status: 'available',
      });
    }
  });

  // ================= 2. MAIN FLOOR (LOWER LEVEL) - 325 seats =================
  // Rows A1 to A5 have 16 left + 16 right = 32 seats/row (160 seats)
  // Rows A6 to A10 have 16 left + 17 right = 33 seats/row (165 seats)
  // Total = 325 seats
  // VIP: 50 seats (Row A1-A5 Center)
  // RUBY: 100 seats
  // DIAMOND: 175 seats
  const rows = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9', 'A10'];

  rows.forEach((rowName, rowIndex) => {
    const isRow1To5 = rowIndex < 5;
    const isRow6To9 = rowIndex >= 5 && rowIndex < 9;
    const isRow10 = rowIndex === 9;
    const rightCount = rowIndex < 5 ? 16 : 17;

    // LEFT WING (16 seats per row: L1 .. L16)
    for (let num = 1; num <= 16; num++) {
      let cat: TicketCategory = 'DIAMOND';
      let price = 50000;

      if (isRow1To5) {
        if (num >= 12) {
          cat = 'VIP'; // 5 seats per row (L12..L16) * 5 rows = 25 left VIP seats
          price = 70000;
        } else if (num <= 4) {
          cat = 'RUBY'; // 4 seats per row (L1..L4) * 5 rows = 20 left Ruby
          price = 35000;
        }
      } else if (isRow6To9) {
        if (num <= 4) {
          cat = 'RUBY'; // 4 seats per row * 4 rows = 16 left Ruby
          price = 35000;
        }
      } else if (isRow10) {
        if (num <= 14) {
          cat = 'RUBY'; // 14 seats left Ruby
          price = 35000;
        }
      }

      seats.push({
        id: `MF-${rowName}-L${num}`,
        label: `${rowName}-L${num}`,
        section: 'MAIN_FLOOR',
        subSection: 'LEFT',
        row: rowName,
        number: num,
        category: cat,
        price,
        status: 'available',
      });
    }

    // RIGHT WING (16 or 17 seats: R1 .. R16/17)
    for (let num = 1; num <= rightCount; num++) {
      let cat: TicketCategory = 'DIAMOND';
      let price = 50000;

      if (isRow1To5) {
        if (num <= 5) {
          cat = 'VIP'; // 5 seats per row (R1..R5) * 5 rows = 25 right VIP seats
          price = 70000;
        } else if (num >= 13) {
          cat = 'RUBY'; // 4 seats per row (R13..R16) * 5 rows = 20 right Ruby
          price = 35000;
        }
      } else if (isRow6To9) {
        if (num >= 14) {
          cat = 'RUBY'; // 4 seats per row (R14..R17) * 4 rows = 16 right Ruby
          price = 35000;
        }
      } else if (isRow10) {
        if (num >= 4) {
          cat = 'RUBY'; // 14 seats right Ruby (R4..R17)
          price = 35000;
        }
      }

      seats.push({
        id: `MF-${rowName}-R${num}`,
        label: `${rowName}-R${num}`,
        section: 'MAIN_FLOOR',
        subSection: 'RIGHT',
        row: rowName,
        number: num,
        category: cat,
        price,
        status: 'available',
      });
    }
  });

  return seats;
}
