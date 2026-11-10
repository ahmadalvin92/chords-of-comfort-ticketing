'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Html5Qrcode } from 'html5-qrcode';
import {
  QrCode,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowLeft,
  Camera,
  RefreshCw,
  Search,
  Volume2,
} from 'lucide-react';
import { CheckInResult } from '@/types/ticket';

export default function ScannerPage() {
  const [scanResult, setScanResult] = useState<CheckInResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);
  const [history, setHistory] = useState<CheckInResult[]>([]);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isHandlingScan = useRef(false);

  // Play audio beep using browser Web Audio API
  const playSound = (type: 'valid' | 'duplicate' | 'invalid') => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'valid') {
        osc.frequency.setValueAtTime(880, audioCtx.currentTime); // High pitch cheerful beep
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.2);
      } else if (type === 'duplicate') {
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
        osc.start();
        setTimeout(() => {
          osc.frequency.setValueAtTime(330, audioCtx.currentTime);
        }, 150);
        osc.stop(audioCtx.currentTime + 0.35);
      } else {
        osc.frequency.setValueAtTime(220, audioCtx.currentTime); // Low buzz
        gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
      }
    } catch {
      // Audio context might be restricted before interaction
    }
  };

  const handleValidation = async (payload: string) => {
    if (isHandlingScan.current) return;
    isHandlingScan.current = true;

    try {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrPayload: payload }),
      });

      const data: CheckInResult = await res.json();
      setScanResult(data);

      if (data.status === 'VALID') {
        playSound('valid');
      } else if (data.status === 'ALREADY_CHECKED_IN') {
        playSound('duplicate');
      } else {
        playSound('invalid');
      }

      setHistory((prev) => [data, ...prev.slice(0, 9)]);
    } catch (err) {
      const errorResult: CheckInResult = {
        status: 'INVALID',
        message: 'Gagal menghubungi server validasi.',
      };
      setScanResult(errorResult);
      playSound('invalid');
    } finally {
      setTimeout(() => {
        isHandlingScan.current = false;
      }, 2500); // 2.5s cooldown before next scan
    }
  };

  const startScanner = async () => {
    try {
      const html5QrCode = new Html5Qrcode('qr-reader');
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          handleValidation(decodedText);
        },
        (errorMessage) => {
          // ignore scan frame errors
        }
      );

      setIsScanning(true);
    } catch (err) {
      console.error('Camera start error:', err);
      alert('Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan di browser Anda.');
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.error('Stop error:', err);
      } finally {
        setIsScanning(false);
      }
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;

    setIsSubmittingManual(true);
    await handleValidation(manualCode.trim());
    setManualCode('');
    setIsSubmittingManual(false);
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0F1C30] text-white py-6 px-4 sm:px-6">
      <div className="max-w-xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <Link
            href="/admin"
            className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
          <div className="text-center">
            <h1 className="font-bebas text-2xl text-[#F4B32A] tracking-wider">
              GATE QR SCANNER
            </h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">
              LSPR COMM30-6SP • CHECK-IN SYSTEM
            </p>
          </div>
          <div className="w-8" />
        </div>

        {/* Scan Status Feedback Card */}
        {scanResult && (
          <div
            className={`p-5 rounded-2xl border-4 text-center animate-in zoom-in-95 duration-200 ${
              scanResult.status === 'VALID'
                ? 'bg-emerald-950 border-emerald-500 text-emerald-100'
                : scanResult.status === 'ALREADY_CHECKED_IN'
                ? 'bg-amber-950 border-amber-500 text-amber-100'
                : 'bg-rose-950 border-rose-500 text-rose-100'
            }`}
          >
            <div className="flex items-center justify-center mb-2">
              {scanResult.status === 'VALID' && (
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border-2 border-emerald-400 animate-pulse">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
              )}
              {scanResult.status === 'ALREADY_CHECKED_IN' && (
                <div className="w-14 h-14 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center border-2 border-amber-400">
                  <AlertTriangle className="w-8 h-8" />
                </div>
              )}
              {scanResult.status === 'INVALID' && (
                <div className="w-14 h-14 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center border-2 border-rose-400">
                  <XCircle className="w-8 h-8" />
                </div>
              )}
            </div>

            <div className="font-bebas text-3xl tracking-wider uppercase leading-tight">
              {scanResult.status === 'VALID' && 'TIKET VALID - CHECKED IN'}
              {scanResult.status === 'ALREADY_CHECKED_IN' && 'ALREADY CHECKED IN!'}
              {scanResult.status === 'INVALID' && 'INVALID TICKET!'}
            </div>

            <p className="text-xs font-semibold mt-1 opacity-90">{scanResult.message}</p>

            {scanResult.order && (
              <div className="mt-4 pt-3 border-t border-white/20 text-left space-y-1.5 text-xs">
                <div>
                  <span className="opacity-70">Nama Tamu: </span>
                  <strong className="text-white font-bold">{scanResult.order.customerName}</strong>
                </div>
                <div>
                  <span className="opacity-70">Order ID: </span>
                  <strong className="font-mono text-amber-300">{scanResult.order.id}</strong>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="opacity-70">Kursi: </span>
                  {scanResult.order.seatLabels.map((lbl, idx) => (
                    <span
                      key={idx}
                      className="bg-white/20 px-2 py-0.5 rounded font-bebas text-sm tracking-wider"
                    >
                      {lbl}
                    </span>
                  ))}
                  <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded font-bold">
                    {scanResult.order.category}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Camera Viewport Container */}
        <div className="bg-[#182B49] rounded-3xl border-3 border-slate-700 p-4 overflow-hidden relative shadow-2xl">
          <div
            id="qr-reader"
            className="w-full aspect-square rounded-2xl overflow-hidden bg-black flex items-center justify-center"
          />

          {!isScanning && (
            <div className="absolute inset-4 rounded-2xl bg-slate-900/90 flex flex-col items-center justify-center p-6 text-center">
              <Camera className="w-12 h-12 text-[#F4B32A] mb-3 animate-bounce" />
              <h3 className="font-bebas text-2xl text-white">KAMERA CHECK-IN GATE</h3>
              <p className="text-xs text-slate-300 max-w-xs mb-5">
                Buka kamera HP Anda untuk mulai memindai QR Code pengunjung di pintu masuk LSPR Sudirman Park.
              </p>
              <button
                onClick={startScanner}
                className="cursor-pointer bg-[#C1272D] hover:bg-[#a61f25] text-white px-6 py-3 rounded-xl font-bebas text-lg tracking-wider border-2 border-[#F4B32A] shadow-md flex items-center gap-2"
              >
                <Camera className="w-5 h-5 text-[#F4B32A]" />
                AKTIFKAN KAMERA SCANNER
              </button>
            </div>
          )}

          {isScanning && (
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Kamera aktif - Siap scan
              </span>
              <button
                onClick={stopScanner}
                className="text-xs font-bold text-slate-400 hover:text-white px-3 py-1 rounded-lg bg-slate-800"
              >
                Hentikan Kamera
              </button>
            </div>
          )}
        </div>

        {/* Manual Input Fallback */}
        <div className="bg-[#182B49] p-5 rounded-2xl border-2 border-slate-700">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-[#F4B32A]" />
            <span>Input Manual Order ID / Ticket Code</span>
          </div>
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <input
              type="text"
              placeholder="Contoh: LSPR-6SP-XXXXXX"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              className="flex-1 bg-[#0F1C30] border border-slate-600 rounded-xl px-3 py-2 text-xs font-mono uppercase text-white focus:outline-none focus:border-[#F4B32A]"
            />
            <button
              type="submit"
              disabled={isSubmittingManual || !manualCode.trim()}
              className="bg-[#F4B32A] hover:bg-amber-400 disabled:opacity-50 text-[#0F1C30] px-4 py-2 rounded-xl font-bebas text-sm border border-[#0F1C30]"
            >
              VALIDASI
            </button>
          </form>
        </div>

        {/* Recent Scan History */}
        {history.length > 0 && (
          <div className="bg-[#182B49] p-4 rounded-2xl border-2 border-slate-700 space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Riwayat Scan Terbaru (10 Terakhir)
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {history.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-[#0F1C30] text-xs"
                >
                  <div>
                    <span className="font-bold text-white">
                      {item.order?.customerName || 'Tamu'}
                    </span>{' '}
                    <span className="text-slate-400 text-[10px]">
                      ({item.order?.seatLabels.join(', ')})
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                      item.status === 'VALID'
                        ? 'bg-emerald-900 text-emerald-300'
                        : item.status === 'ALREADY_CHECKED_IN'
                        ? 'bg-amber-900 text-amber-300'
                        : 'bg-rose-900 text-rose-300'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

