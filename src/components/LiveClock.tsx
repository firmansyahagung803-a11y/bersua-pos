'use client';
import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface LiveClockProps {
  showDate?: boolean;
  showStatus?: boolean;
  className?: string;
}

export default function LiveClock({ showDate = true, showStatus = true, className = '' }: LiveClockProps) {
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    setMounted(true);
    const update = () => {
      const now = new Date();
      // Konversi ke WIB (UTC+7)
      const wib = new Date(now.getTime() + 7 * 60 * 60 * 1000);
      const hours = wib.getUTCHours();
      const minutes = wib.getUTCMinutes();
      const seconds = wib.getUTCSeconds();

      const h = String(hours).padStart(2, '0');
      const m = String(minutes).padStart(2, '0');
      const s = String(seconds).padStart(2, '0');
      setTime(`${h}:${m}:${s}`);

      const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
      setDate(`${days[wib.getUTCDay()]}, ${wib.getUTCDate()} ${months[wib.getUTCMonth()]} ${wib.getUTCFullYear()}`);

      // Buka jam 08:00 - 22:00 WIB
      setIsOpen(hours >= 8 && hours < 22);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    return (
      <div className={`inline-flex items-center gap-2 text-xs font-mono text-gray-500 ${className}`}>
        <Clock className="w-3.5 h-3.5 animate-pulse" />
        <span>Memuat jam...</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 border-2 border-[#1A1A1A] bg-white px-3 py-1.5 shadow-[2px_2px_0_#1A1A1A] ${className}`}>
      <span className="relative flex h-2 w-2">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isOpen ? 'bg-green-400' : 'bg-amber-400'}`}></span>
        <span className={`relative inline-flex rounded-full h-2 w-2 ${isOpen ? 'bg-green-500' : 'bg-amber-500'}`}></span>
      </span>
      <div className="flex flex-col text-left leading-none">
        <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-[#1A1A1A]">
          <span>{time}</span>
          <span className="text-[10px] text-gray-400">WIB</span>
        </div>
        {showDate && (
          <span className="text-[10px] font-patrick text-[#3D3D3D] mt-0.5">{date}</span>
        )}
      </div>
      {showStatus && (
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm ml-1 ${isOpen ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
          {isOpen ? 'Buka' : 'Tutup'}
        </span>
      )}
    </div>
  );
}
