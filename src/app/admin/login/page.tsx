'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Coffee, Eye, EyeOff } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      localStorage.setItem('bersua_user', JSON.stringify(data));
      router.push('/admin/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-[#1A1A1A] flex items-center justify-center">
              <Coffee className="w-5 h-5 text-white" />
            </div>
            <span className="font-hand text-3xl font-bold text-[#1A1A1A]">BERSUA</span>
          </div>
          <p className="font-patrick text-sm text-[#3D3D3D]">Admin Dashboard</p>
        </div>

        {/* Form card */}
        <div className="bg-white border-2 border-[#1A1A1A] p-7 shadow-[5px_5px_0_#1A1A1A]" style={{transform:'rotate(-0.5deg)'}}>
          <h2 className="font-hand text-2xl font-bold text-[#1A1A1A] mb-5 text-center">Masuk Admin</h2>

          {error && (
            <div className="bg-red-50 border border-red-300 text-red-700 p-3 font-patrick text-sm mb-4 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="font-patrick text-sm font-semibold block mb-1">Username</label>
              <input
                type="text"
                value={form.username}
                onChange={e => setForm(f => ({...f, username: e.target.value}))}
                placeholder="admin / kasir"
                className="w-full border-2 border-[#1A1A1A] rounded-sm px-3 py-2.5 font-patrick focus:outline-none focus:border-[#2563EB]"
                required
              />
            </div>
            <div>
              <label className="font-patrick text-sm font-semibold block mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(f => ({...f, password: e.target.value}))}
                  placeholder="••••••••"
                  className="w-full border-2 border-[#1A1A1A] rounded-sm px-3 py-2.5 font-patrick focus:outline-none focus:border-[#2563EB] pr-10"
                  required
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3D3D3D]">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full btn-primary py-3 font-hand text-lg disabled:opacity-50">
              {loading ? 'Masuk...' : 'Masuk →'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="font-patrick text-xs text-[#3D3D3D]">Demo: admin / bersua2024</p>
          </div>
        </div>
      </div>
    </div>
  );
}

