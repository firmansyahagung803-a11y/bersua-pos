'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { formatRupiah } from '@/lib/utils';
import Image from 'next/image';
import {
  Plus, Minus, Trash2, ShoppingBag, X, Check, Clock,
  CreditCard, RefreshCw, ChevronDown, ChevronUp, Printer, AlertCircle,
  UtensilsCrossed, ListOrdered,
} from 'lucide-react';

interface Category { id: number; name: string; slug: string; icon: string; }
interface MenuItem { id: number; name: string; price: number; image_url: string; category_name: string; description: string; is_available: number; }
interface CartItem { id: number; name: string; price: number; quantity: number; notes?: string; }

interface OrderItem { id: number; name: string; price: number; quantity: number; subtotal: number; notes?: string; }
interface ActiveOrder {
  id: number;
  order_number: string;
  customer_name: string;
  table_number: string;
  order_type: string;
  payment_method: string;
  total: number;
  subtotal: number;
  tax: number;
  created_at: string;
  payment_status: string;
  status: string;
  notes?: string;
  items?: OrderItem[];
}

type MobileTab = 'menu' | 'cart' | 'queue';

const PAYMENT_METHODS = ['cash', 'qris', 'transfer', 'debit'];
const PM_LABEL: Record<string, string> = { cash: 'Tunai', qris: 'QRIS', transfer: 'Transfer', debit: 'Debit' };
const PM_ICON: Record<string, string> = { cash: '💵', qris: '📱', transfer: '🏦', debit: '💳' };

// ── Live WIB Clock ──────────────────────────────────────────────
function LiveClock() {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      // Convert to WIB (UTC+7)
      const wib = new Date(now.getTime() + (7 * 60 * 60 * 1000));
      const h = String(wib.getUTCHours()).padStart(2, '0');
      const m = String(wib.getUTCMinutes()).padStart(2, '0');
      const s = String(wib.getUTCSeconds()).padStart(2, '0');
      setTime(`${h}:${m}:${s}`);

      const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
      setDate(`${days[wib.getUTCDay()]}, ${wib.getUTCDate()} ${months[wib.getUTCMonth()]} ${wib.getUTCFullYear()}`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="text-right">
      <p className="font-mono text-lg font-bold text-[#1A1A1A] leading-none tracking-wider">{time}</p>
      <p className="text-[10px] text-gray-400 leading-none mt-0.5">WIB · {date}</p>
    </div>
  );
}

// ── Struk Print ─────────────────────────────────────────────────
function printStruk(order: ActiveOrder) {
  const lines = order.items?.map(i =>
    `${i.name.padEnd(20)} x${i.quantity}  ${formatRupiah(i.subtotal)}`
  ).join('\n') ?? '';

  const content = `
================================
        BERSUA Coffee & Eatery
================================
Order  : #${order.order_number}
Kasir  : Kasir
Tgl    : ${new Date(order.created_at).toLocaleString('id-ID')}
--------------------------------
Pelanggan : ${order.customer_name}
${order.table_number ? `Meja      : ${order.table_number}` : 'Takeaway'}
================================
${lines}
================================
TOTAL  : ${formatRupiah(order.total)}
Bayar  : ${PM_LABEL[order.payment_method] || order.payment_method}
================================
   Terima kasih sudah mampir!
     Sampai jumpa lagi :)
================================
  `.trim();

  const w = window.open('', '_blank', 'width=320,height=600');
  if (!w) return;
  w.document.write(`<pre style="font-family:monospace;font-size:12px;padding:16px;white-space:pre-wrap">${content}</pre>`);
  w.document.close();
  w.print();
}

export default function CashierPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderForm, setOrderForm] = useState({
    customer_name: '', table_number: '',
    order_type: 'dine_in', payment_method: 'cash', notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [activeOrders, setActiveOrders] = useState<ActiveOrder[]>([]);
  const [confirmingId, setConfirmingId] = useState<number | null>(null);
  const [payModal, setPayModal] = useState<ActiveOrder | null>(null);
  const [payMethod, setPayMethod] = useState('cash');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<Set<number>>(new Set());
  const [searchMenu, setSearchMenu] = useState('');
  const [mobileTab, setMobileTab] = useState<MobileTab>('menu');
  const nameRef = useRef<HTMLInputElement>(null);

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4500);
  };

  // Fetch menu
  const fetchMenu = useCallback(async () => {
    setLoading(true);
    const url = activeCategory === 'all' ? '/api/menu' : `/api/menu?category=${activeCategory}`;
    const data = await fetch(url).then(r => r.json());
    setMenuItems(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [activeCategory]);

  // Fetch pesanan aktif (unpaid) + items detail
  const fetchActiveOrders = useCallback(async () => {
    const data = await fetch('/api/orders?payment_status=unpaid&limit=30').then(r => r.json());
    if (!Array.isArray(data)) return;

    // Ambil items untuk setiap order (parallel)
    const withItems = await Promise.all(
      data.map(async (o: ActiveOrder) => {
        try {
          const detail = await fetch(`/api/orders/${o.id}`).then(r => r.json());
          return { ...o, items: detail.items || [] };
        } catch {
          return o;
        }
      })
    );
    setActiveOrders(withItems);
  }, []);

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(d => setCategories(Array.isArray(d) ? d : []));
  }, []);

  useEffect(() => { fetchMenu(); }, [fetchMenu]);

  useEffect(() => {
    fetchActiveOrders();
    const interval = setInterval(fetchActiveOrders, 15000);
    return () => clearInterval(interval);
  }, [fetchActiveOrders]);

  const addToCart = (item: MenuItem) => {
    setCart(c => {
      const ex = c.find(i => i.id === item.id);
      if (ex) return c.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...c, { id: item.id, name: item.name, price: item.price, quantity: 1 }];
    });
  };

  const updateQty = (id: number, qty: number) => {
    if (qty <= 0) setCart(c => c.filter(i => i.id !== id));
    else setCart(c => c.map(i => i.id === id ? { ...i, quantity: qty } : i));
  };

  const handleSubmit = async () => {
    if (cart.length === 0) return;
    if (!orderForm.customer_name.trim()) {
      showToast('Nama pelanggan wajib diisi', 'error');
      nameRef.current?.focus();
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...orderForm,
          items: cart.map(i => ({ id: i.id, quantity: i.quantity, notes: i.notes }))
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCart([]);
      setOrderForm({ customer_name: '', table_number: '', order_type: 'dine_in', payment_method: 'cash', notes: '' });
      showToast(`✅ Order #${data.order_number} dibuat — menunggu pembayaran`);
      fetchActiveOrders();
      nameRef.current?.focus();
      // On mobile, switch to queue tab after order
      setMobileTab('queue');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal membuat order', 'error');
    }
    setSubmitting(false);
  };

  const handleConfirmPay = async () => {
    if (!payModal) return;
    setConfirmingId(payModal.id);
    try {
      const res = await fetch(`/api/orders/${payModal.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_status: 'paid', status: 'completed', payment_method: payMethod }),
      });
      if (!res.ok) throw new Error('Gagal konfirmasi');

      // Print struk otomatis setelah bayar
      const orderWithMethod = { ...payModal, payment_method: payMethod };
      showToast(`💰 Pembayaran #${payModal.order_number} dikonfirmasi — ${PM_LABEL[payMethod]}`);
      setPayModal(null);
      fetchActiveOrders();

      // Tanya print (opsional)
      if (window.confirm(`Cetak struk untuk ${payModal.customer_name}?`)) {
        printStruk(orderWithMethod);
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error', 'error');
    }
    setConfirmingId(null);
  };

  const toggleExpand = (id: number) => {
    setExpandedOrders(s => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const formatTime = (dt: string) => {
    const d = new Date(dt);
    return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const filteredMenu = menuItems.filter(item =>
    searchMenu === '' || item.name.toLowerCase().includes(searchMenu.toLowerCase())
  );

  // ── Shared sub-components ──────────────────────────────────────

  /** Menu panel (categories + search + grid) */
  const MenuPanel = () => (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Category tabs */}
      <div className="bg-white border-b border-gray-200 px-3 py-2 flex gap-1.5 overflow-x-auto flex-shrink-0">
        <button
          onClick={() => setActiveCategory('all')}
          className={`flex-shrink-0 px-4 py-1.5 text-xs font-bold rounded-full border transition-all
            ${activeCategory === 'all'
              ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}
        >
          Semua
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.slug)}
            className={`flex-shrink-0 px-4 py-1.5 text-xs font-bold rounded-full border transition-all
              ${activeCategory === cat.slug
                ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {/* Search menu */}
      <div className="bg-white px-3 pb-2 pt-1.5 flex-shrink-0">
        <input
          type="search"
          placeholder="🔍 Cari menu..."
          value={searchMenu}
          onChange={e => setSearchMenu(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-[#1A1A1A] bg-gray-50"
        />
      </div>

      {/* Menu grid */}
      <div className="flex-1 overflow-y-auto p-3">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {[...Array(10)].map((_, i) => <div key={i} className="animate-pulse bg-gray-200 h-32 rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {filteredMenu.map(item => {
              const inCart = cart.find(c => c.id === item.id);
              const unavailable = item.is_available === 0;
              return (
                <button
                  key={item.id}
                  onClick={() => !unavailable && addToCart(item)}
                  disabled={unavailable}
                  className={`relative bg-white border-2 rounded-xl p-0 text-left transition-all overflow-hidden group
                    ${unavailable
                      ? 'opacity-50 cursor-not-allowed border-gray-100'
                      : inCart
                        ? 'border-[#2563EB] shadow-lg shadow-blue-100'
                        : 'border-gray-200 hover:border-[#2563EB] hover:shadow-md'}`}
                >
                  {/* Badge qty */}
                  {inCart && (
                    <div className="absolute top-2 right-2 z-10 w-6 h-6 bg-[#2563EB] text-white text-xs rounded-full flex items-center justify-center font-bold shadow">
                      {inCart.quantity}
                    </div>
                  )}
                  {/* Image */}
                  <div className="relative h-20 bg-gradient-to-br from-amber-50 to-amber-100 overflow-hidden">
                    {item.image_url ? (
                      <Image src={item.image_url} alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform duration-200" unoptimized />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">☕</div>
                    )}
                    {unavailable && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white text-[10px] font-bold bg-red-600 px-2 py-0.5 rounded">Habis</span>
                      </div>
                    )}
                  </div>
                  {/* Info */}
                  <div className="p-2.5">
                    <p className="font-bold text-xs text-gray-800 line-clamp-1 leading-tight">{item.name}</p>
                    {item.description && (
                      <p className="text-[10px] text-gray-400 line-clamp-1 mt-0.5">{item.description}</p>
                    )}
                    <p className="text-sm font-bold text-[#2563EB] mt-1">{formatRupiah(item.price)}</p>
                  </div>
                </button>
              );
            })}
            {filteredMenu.length === 0 && (
              <div className="col-span-5 text-center py-16 text-gray-400">
                <p className="text-4xl mb-2">🔍</p>
                <p className="text-sm">Menu tidak ditemukan</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  /** Cart + order form panel */
  const CartPanel = () => (
    <div className="flex flex-col h-full overflow-hidden bg-white">
      {/* Header cart */}
      <div className="px-3 pt-3 pb-2 flex items-center justify-between flex-shrink-0 border-b border-dashed border-gray-200">
        <h2 className="font-hand text-base font-bold text-[#1A1A1A] flex items-center gap-1.5">
          <ShoppingBag className="w-4 h-4" />
          Pesanan Baru
          {cart.length > 0 && (
            <span className="bg-[#2563EB] text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
              {cartCount}
            </span>
          )}
        </h2>
        {cart.length > 0 && (
          <button onClick={() => setCart([])} className="text-xs text-red-400 hover:text-red-600 flex items-center gap-0.5 font-medium">
            <X className="w-3 h-3" /> Bersih
          </button>
        )}
      </div>

      {/* Cart items */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5">
        {cart.length === 0 ? (
          <div className="text-center py-8 text-gray-300">
            <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-xs">Pilih menu untuk ditambahkan</p>
          </div>
        ) : cart.map(item => (
          <div key={item.id} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2 border border-gray-100">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-800 truncate">{item.name}</p>
              <p className="text-xs text-[#2563EB] font-bold">{formatRupiah(item.price * item.quantity)}</p>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => updateQty(item.id, item.quantity - 1)}
                className="w-5 h-5 bg-gray-200 rounded flex items-center justify-center hover:bg-red-100 hover:text-red-600 transition-colors">
                <Minus className="w-2.5 h-2.5" />
              </button>
              <span className="text-xs font-bold w-5 text-center">{item.quantity}</span>
              <button onClick={() => updateQty(item.id, item.quantity + 1)}
                className="w-5 h-5 bg-gray-200 rounded flex items-center justify-center hover:bg-green-100 hover:text-green-600 transition-colors">
                <Plus className="w-2.5 h-2.5" />
              </button>
              <button onClick={() => updateQty(item.id, 0)}
                className="w-5 h-5 text-red-300 hover:text-red-500 ml-0.5 flex items-center justify-center">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Form + Total + Submit */}
      <div className="px-3 pb-3 space-y-2 flex-shrink-0 border-t border-gray-100 pt-2">
        <input
          ref={nameRef}
          type="text"
          placeholder="Nama pelanggan *"
          value={orderForm.customer_name}
          onChange={e => setOrderForm(f => ({ ...f, customer_name: e.target.value }))}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#1A1A1A] font-medium"
        />
        <div className="grid grid-cols-2 gap-1.5">
          <select
            value={orderForm.order_type}
            onChange={e => setOrderForm(f => ({ ...f, order_type: e.target.value }))}
            className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-[#1A1A1A]"
          >
            <option value="dine_in">🪑 Dine In</option>
            <option value="takeaway">🛍️ Takeaway</option>
          </select>
          <input
            type="text"
            placeholder="No. Meja"
            value={orderForm.table_number}
            onChange={e => setOrderForm(f => ({ ...f, table_number: e.target.value }))}
            className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-[#1A1A1A]"
          />
        </div>

        {/* Metode bayar */}
        <div className="grid grid-cols-4 gap-1">
          {PAYMENT_METHODS.map(pm => (
            <button
              key={pm}
              onClick={() => setOrderForm(f => ({ ...f, payment_method: pm }))}
              title={PM_LABEL[pm]}
              className={`py-1.5 text-sm rounded-lg border-2 font-semibold transition-all
                ${orderForm.payment_method === pm
                  ? 'bg-[#1A1A1A] border-[#1A1A1A]'
                  : 'bg-white border-gray-200 hover:border-gray-400'}`}
            >
              {PM_ICON[pm]}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-gray-400 text-center -mt-0.5">
          {PM_ICON[orderForm.payment_method]} {PM_LABEL[orderForm.payment_method]}
        </p>

        {/* Total */}
        {cart.length > 0 && (
          <div className="bg-[#1A1A1A] rounded-xl p-3 flex justify-between items-center">
            <span className="text-gray-400 text-xs font-medium">Total</span>
            <span className="text-white font-bold text-base">{formatRupiah(total)}</span>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={cart.length === 0 || submitting}
          className="w-full bg-[#2563EB] text-white py-3 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {submitting ? (
            <span className="flex items-center gap-2"><RefreshCw className="w-4 h-4 animate-spin" /> Memproses...</span>
          ) : (
            <><ShoppingBag className="w-4 h-4" /> Buat Pesanan</>
          )}
        </button>
      </div>
    </div>
  );

  /** Active orders / queue panel */
  const QueuePanel = () => (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-3 py-2 flex items-center justify-between flex-shrink-0 bg-orange-50 border-b border-orange-100">
        <h2 className="font-hand text-sm font-bold text-orange-800 flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-orange-500" />
          Menunggu Bayar
          {activeOrders.length > 0 && (
            <span className="bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold leading-none">
              {activeOrders.length}
            </span>
          )}
        </h2>
        <button onClick={fetchActiveOrders} className="text-orange-400 hover:text-orange-600 p-1 rounded-lg hover:bg-orange-100 transition-colors">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-2 bg-orange-50/30">
        {activeOrders.length === 0 ? (
          <div className="text-center py-8 text-gray-300 text-xs">
            <Check className="w-8 h-8 mx-auto mb-1 opacity-30" />
            Semua pesanan sudah dibayar
          </div>
        ) : activeOrders.map(order => {
          const isExpanded = expandedOrders.has(order.id);
          return (
            <div key={order.id} className="bg-white border-2 border-orange-200 rounded-xl overflow-hidden shadow-sm">
              {/* Order header */}
              <div className="p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-xs text-gray-800">{order.customer_name}</p>
                    <p className="text-[10px] text-gray-400 font-mono">#{order.order_number}</p>
                    {order.table_number && (
                      <p className="text-[10px] text-gray-500 mt-0.5">🪑 Meja {order.table_number}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm text-[#2563EB]">{formatRupiah(order.total)}</p>
                    <p className="text-[10px] text-gray-400">{formatTime(order.created_at)}</p>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${order.order_type === 'dine_in' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                      {order.order_type === 'dine_in' ? 'Dine In' : 'Takeaway'}
                    </span>
                  </div>
                </div>

                {/* Toggle items */}
                <button
                  onClick={() => toggleExpand(order.id)}
                  className="mt-2 w-full flex items-center justify-between text-[10px] text-gray-500 hover:text-gray-700"
                >
                  <span>{order.items?.length || 0} item</span>
                  {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>

                {/* Items detail */}
                {isExpanded && order.items && order.items.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-100 space-y-1">
                    {order.items.map(item => (
                      <div key={item.id} className="flex justify-between text-[10px]">
                        <span className="text-gray-600">{item.name} ×{item.quantity}</span>
                        <span className="text-gray-700 font-semibold">{formatRupiah(item.subtotal)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-1.5 mt-2.5">
                  <button
                    onClick={() => { setPayModal(order); setPayMethod(order.payment_method || 'cash'); }}
                    className="flex-1 py-2 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-1"
                  >
                    <CreditCard className="w-3 h-3" /> Bayar
                  </button>
                  <button
                    onClick={() => printStruk(order)}
                    title="Cetak struk"
                    className="px-2 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Printer className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row h-[calc(100dvh-49px)] md:h-screen bg-[#F5F0E8] overflow-hidden">

      {/* ── Toast ─────────────────────────────────────── */}
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[60] px-5 py-3 rounded-xl text-sm font-semibold shadow-2xl flex items-center gap-2 transition-all w-[90vw] max-w-sm text-center justify-center
          ${toast.type === 'success' ? 'bg-[#1A1A1A] text-white' : 'bg-red-600 text-white'}`}>
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4 flex-shrink-0" /> : null}
          {toast.msg}
        </div>
      )}

      {/* ── Modal Konfirmasi Bayar ─────────────────────── */}
      {payModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm shadow-2xl overflow-hidden border-t-2 sm:border-2 border-[#1A1A1A] max-h-[92dvh] flex flex-col">
            {/* Header modal */}
            <div className="bg-[#1A1A1A] text-white p-5 flex items-start justify-between flex-shrink-0">
              <div>
                <p className="font-hand text-2xl font-bold">Konfirmasi Bayar</p>
                <p className="text-gray-300 text-sm font-mono mt-0.5">#{payModal.order_number}</p>
              </div>
              <button onClick={() => setPayModal(null)} className="text-gray-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1">
              {/* Info order */}
              <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-100">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Pelanggan</span>
                  <span className="font-bold">{payModal.customer_name}</span>
                </div>
                {payModal.table_number && (
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">Meja</span>
                    <span className="font-semibold">{payModal.table_number}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Tipe</span>
                  <span className="font-semibold">{payModal.order_type === 'dine_in' ? 'Dine In' : 'Takeaway'}</span>
                </div>
                {/* Item list */}
                {payModal.items && payModal.items.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200 space-y-1">
                    {payModal.items.map(item => (
                      <div key={item.id} className="flex justify-between text-xs">
                        <span className="text-gray-600">{item.name} ×{item.quantity}</span>
                        <span className="text-gray-700">{formatRupiah(item.subtotal)}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex justify-between pt-3 border-t border-gray-200 mt-3">
                  <span className="font-bold text-base">Total</span>
                  <span className="font-bold text-[#2563EB] text-xl">{formatRupiah(payModal.total)}</span>
                </div>
              </div>

              {/* Metode bayar */}
              <p className="text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Metode Pembayaran</p>
              <div className="grid grid-cols-2 gap-2 mb-5">
                {PAYMENT_METHODS.map(pm => (
                  <button
                    key={pm}
                    onClick={() => setPayMethod(pm)}
                    className={`py-3 px-3 rounded-xl border-2 text-sm font-bold flex items-center gap-2 transition-all
                      ${payMethod === pm
                        ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-md'
                        : 'bg-white border-gray-200 hover:border-gray-300 text-gray-700'}`}
                  >
                    <span className="text-base">{PM_ICON[pm]}</span> {PM_LABEL[pm]}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setPayModal(null)}
                  className="flex-1 py-3 border-2 border-gray-200 rounded-xl text-sm font-bold hover:bg-gray-50 text-gray-700"
                >
                  Batal
                </button>
                <button
                  onClick={handleConfirmPay}
                  disabled={confirmingId === payModal.id}
                  className="flex-1 py-3 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  {confirmingId === payModal.id ? 'Memproses...' : 'Bayar Sekarang'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          DESKTOP LAYOUT (≥ md) — 2-column split
      ══════════════════════════════════════════════════════════ */}

      {/* ── PANEL KIRI: Menu ── */}
      <div className="hidden md:flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Header POS */}
        <div className="bg-white border-b-2 border-[#1A1A1A] px-4 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#1A1A1A] rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="font-hand text-white text-base font-bold">B</span>
            </div>
            <div>
              <h1 className="font-hand text-xl font-bold text-[#1A1A1A] leading-none">Kasir POS</h1>
              <p className="text-[10px] text-gray-500">BERSUA Coffee &amp; Eatery</p>
            </div>
          </div>
          <LiveClock />
        </div>
        <MenuPanel />
      </div>

      {/* ── PANEL KANAN ── */}
      <div className="hidden md:flex w-[300px] flex-shrink-0 bg-white border-l-2 border-[#1A1A1A] flex-col">
        {/* Cart + Form */}
        <div className="flex-1 flex flex-col min-h-0" style={{ maxHeight: '58%' }}>
          <CartPanel />
        </div>
        {/* Queue */}
        <div className="flex flex-col border-t-2 border-dashed border-[#1A1A1A]" style={{ height: '42%' }}>
          <QueuePanel />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          MOBILE LAYOUT (< md) — Tab-based
      ══════════════════════════════════════════════════════════ */}

      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b-2 border-[#1A1A1A] px-4 py-2.5 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#1A1A1A] rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="font-hand text-white text-sm font-bold">B</span>
          </div>
          <div>
            <h1 className="font-hand text-base font-bold text-[#1A1A1A] leading-none">Kasir POS</h1>
            <p className="text-[9px] text-gray-500">BERSUA Coffee &amp; Eatery</p>
          </div>
        </div>
        <LiveClock />
      </div>

      {/* Mobile Tab Content */}
      <div className="md:hidden flex-1 overflow-hidden">
        {mobileTab === 'menu' && <MenuPanel />}
        {mobileTab === 'cart' && <CartPanel />}
        {mobileTab === 'queue' && <QueuePanel />}
      </div>

      {/* Mobile Bottom Tab Bar */}
      <div className="md:hidden flex-shrink-0 bg-white border-t-2 border-[#1A1A1A] flex items-stretch">
        {/* Menu tab */}
        <button
          onClick={() => setMobileTab('menu')}
          className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 text-[10px] font-bold transition-colors
            ${mobileTab === 'menu' ? 'text-[#2563EB] bg-blue-50' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <UtensilsCrossed className="w-5 h-5" />
          <span>Menu</span>
        </button>

        {/* Cart tab */}
        <button
          onClick={() => setMobileTab('cart')}
          className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 text-[10px] font-bold transition-colors relative border-x-2 border-[#1A1A1A]
            ${mobileTab === 'cart' ? 'text-[#2563EB] bg-blue-50' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[#2563EB] text-white text-[8px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </div>
          <span>Keranjang{cartCount > 0 ? ` (${cartCount})` : ''}</span>
        </button>

        {/* Queue tab */}
        <button
          onClick={() => setMobileTab('queue')}
          className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 text-[10px] font-bold transition-colors relative
            ${mobileTab === 'queue' ? 'text-orange-600 bg-orange-50' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <div className="relative">
            <ListOrdered className="w-5 h-5" />
            {activeOrders.length > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-orange-500 text-white text-[8px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                {activeOrders.length > 9 ? '9+' : activeOrders.length}
              </span>
            )}
          </div>
          <span>Antrian{activeOrders.length > 0 ? ` (${activeOrders.length})` : ''}</span>
        </button>
      </div>
    </div>
  );
}
