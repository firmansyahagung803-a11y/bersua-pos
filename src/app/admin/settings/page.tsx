'use client';
import { useState } from 'react';
import { Check, Store, Coffee, MapPin, Phone, Clock } from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    store_name: 'BERSUA Coffee & Eatery',
    address: 'Jl. Kopi No. 12, Jakarta Selatan',
    phone: '+62 812 3456 7890',
    email: 'bersua@email.com',
    open_time: '08:00',
    close_time: '22:00',
    tax_rate: '0',
    currency: 'IDR',
  });
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would call an API
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="font-hand text-3xl font-bold text-[#1A1A1A] mb-6">Pengaturan</h1>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Store info */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Store className="w-4 h-4 text-gray-500" />
            <h2 className="font-semibold text-gray-800">Informasi Toko</h2>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-600 block mb-1">Nama Toko</label>
              <input
                type="text"
                value={settings.store_name}
                onChange={e => setSettings(s => ({ ...s, store_name: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 block mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> Alamat</label>
              <textarea
                value={settings.address}
                onChange={e => setSettings(s => ({ ...s, address: e.target.value }))}
                rows={2}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB] resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1 flex items-center gap-1"><Phone className="w-3 h-3" /> No. HP</label>
                <input
                  type="text"
                  value={settings.phone}
                  onChange={e => setSettings(s => ({ ...s, phone: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">Email</label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={e => setSettings(s => ({ ...s, email: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Operating hours */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-gray-500" />
            <h2 className="font-semibold text-gray-800">Jam Operasional</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-600 block mb-1">Buka</label>
              <input
                type="time"
                value={settings.open_time}
                onChange={e => setSettings(s => ({ ...s, open_time: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 block mb-1">Tutup</label>
              <input
                type="time"
                value={settings.close_time}
                onChange={e => setSettings(s => ({ ...s, close_time: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]"
              />
            </div>
          </div>
        </div>

        {/* Financial settings */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Coffee className="w-4 h-4 text-gray-500" />
            <h2 className="font-semibold text-gray-800">Pengaturan Keuangan</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-600 block mb-1">Pajak (%)</label>
              <input
                type="number"
                value={settings.tax_rate}
                onChange={e => setSettings(s => ({ ...s, tax_rate: e.target.value }))}
                min="0"
                max="100"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 block mb-1">Mata Uang</label>
              <select
                value={settings.currency}
                onChange={e => setSettings(s => ({ ...s, currency: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]"
              >
                <option value="IDR">IDR - Rupiah</option>
                <option value="USD">USD - Dollar</option>
              </select>
            </div>
          </div>
        </div>

        {/* Demo credentials info */}
        <div className="bg-blue-50 rounded-xl border border-blue-100 p-4">
          <p className="text-sm font-semibold text-blue-800 mb-2">🔑 Kredensial Login Demo</p>
          <div className="text-sm text-blue-700 space-y-1">
            <p><strong>Admin:</strong> username: admin | password: bersua2024</p>
            <p><strong>Kasir:</strong> username: kasir | password: bersua2024</p>
          </div>
        </div>

        <button
          type="submit"
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${saved ? 'bg-green-600 text-white' : 'bg-[#1A1A1A] text-white hover:bg-[#2563EB]'}`}
        >
          <Check className="w-4 h-4" /> {saved ? 'Tersimpan!' : 'Simpan Pengaturan'}
        </button>
      </form>
    </div>
  );
}

