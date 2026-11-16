'use client';
import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, UserCheck, UserX } from 'lucide-react';

interface User {
  id: number;
  name: string;
  username: string;
  role: string;
  is_active: number;
  created_at: string;
}

interface UserForm {
  name: string;
  username: string;
  password: string;
  role: string;
  is_active: boolean;
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  cashier: 'Kasir',
};

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-700',
  cashier: 'bg-blue-100 text-blue-700',
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; editing: User | null }>({ open: false, editing: null });
  const [form, setForm] = useState<UserForm>({ name: '', username: '', password: '', role: 'cashier', is_active: true });
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/users');
    const data = await res.json();
    setUsers(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const openAdd = () => {
    setForm({ name: '', username: '', password: '', role: 'cashier', is_active: true });
    setError('');
    setModal({ open: true, editing: null });
  };

  const openEdit = (u: User) => {
    setForm({ name: u.name, username: u.username, password: '', role: u.role, is_active: u.is_active === 1 });
    setError('');
    setModal({ open: true, editing: u });
  };

  const handleSave = async () => {
    if (!form.name || !form.username) { setError('Nama dan username wajib diisi'); return; }
    if (!modal.editing && !form.password) { setError('Password wajib diisi untuk user baru'); return; }
    setSaving(true);
    setError('');
    try {
      const payload: Record<string, unknown> = {
        name: form.name,
        username: form.username,
        role: form.role,
        is_active: form.is_active ? 1 : 0,
      };
      if (form.password) payload.password = form.password;

      const url = modal.editing ? `/api/users/${modal.editing.id}` : '/api/users';
      const method = modal.editing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan');
      setModal({ open: false, editing: null });
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus user ini?')) return;
    await fetch(`/api/users/${id}`, { method: 'DELETE' });
    fetchUsers();
  };

  const toggleActive = async (u: User) => {
    await fetch(`/api/users/${u.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: u.name, username: u.username, role: u.role, is_active: u.is_active === 1 ? 0 : 1 }),
    });
    fetchUsers();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-hand text-3xl font-bold text-[#1A1A1A]">Manajemen User</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola akun admin dan kasir</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-[#1A1A1A] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#2563EB] transition-colors">
          <Plus className="w-4 h-4" />
          Tambah User
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Memuat...</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Nama</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Username</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Role</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Dibuat</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-800">{u.name}</td>
                  <td className="px-4 py-3 text-gray-600 font-mono text-xs">{u.username}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${ROLE_COLORS[u.role] || 'bg-gray-100 text-gray-700'}`}>
                      {ROLE_LABELS[u.role] || u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(u)}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                    >
                      {u.is_active ? <><UserCheck className="w-3 h-3" /> Aktif</> : <><UserX className="w-3 h-3" /> Nonaktif</>}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">{u.created_at?.slice(0, 10) || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(u)} className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors" title="Edit">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(u.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition-colors" title="Hapus">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={6} className="text-center py-10 text-gray-400">Belum ada user</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {modal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
            <div className="p-5 border-b border-gray-100">
              <h2 className="font-hand text-xl font-bold">{modal.editing ? 'Edit User' : 'Tambah User Baru'}</h2>
            </div>
            <div className="p-5 space-y-4">
              {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-3 py-2 text-sm">{error}</div>}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]"
                  placeholder="Nama lengkap"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                <input
                  type="text"
                  value={form.username}
                  onChange={e => setForm(f => ({ ...f, username: e.target.value.toLowerCase().replace(/\s/g, '') }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB] font-mono"
                  placeholder="username (tanpa spasi)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password {modal.editing && <span className="text-gray-400 font-normal">(kosongkan jika tidak diubah)</span>}
                </label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 pr-9 text-sm focus:outline-none focus:border-[#2563EB]"
                    placeholder={modal.editing ? 'Password baru (opsional)' : 'Password *'}
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-2.5 top-2 text-gray-400">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={form.role}
                  onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]"
                >
                  <option value="cashier">Kasir</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={form.is_active}
                  onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="is_active" className="text-sm text-gray-700">Akun aktif</label>
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setModal({ open: false, editing: null })}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 text-sm bg-[#1A1A1A] text-white rounded-lg hover:bg-[#2563EB] transition-colors disabled:opacity-50"
              >
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

