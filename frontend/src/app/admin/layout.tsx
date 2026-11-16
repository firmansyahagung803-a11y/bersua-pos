'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard, ShoppingBag, UtensilsCrossed, Tag,
  Calculator, TrendingUp, TrendingDown, BarChart2,
  Settings, LogOut, Coffee, ChevronLeft, ChevronRight, Menu, Users
} from 'lucide-react';

const navItems = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/orders', icon: ShoppingBag, label: 'Pesanan' },
  { href: '/admin/cashier', icon: Calculator, label: 'Kasir / POS' },
  { href: '/admin/menu', icon: UtensilsCrossed, label: 'Menu' },
  { href: '/admin/categories', icon: Tag, label: 'Kategori' },
  { href: '/admin/income', icon: TrendingUp, label: 'Pemasukan' },
  { href: '/admin/expenses', icon: TrendingDown, label: 'Pengeluaran' },
  { href: '/admin/finance', icon: BarChart2, label: 'Laporan' },
  { href: '/admin/users', icon: Users, label: 'Pengguna' },
  { href: '/admin/settings', icon: Settings, label: 'Pengaturan' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (pathname === '/admin/login') return;
    const stored = localStorage.getItem('bersua_user');
    if (!stored) { router.push('/admin/login'); return; }
    setUser(JSON.parse(stored));
  }, [pathname, router]);

  if (pathname === '/admin/login') return <>{children}</>;

  const logout = () => {
    localStorage.removeItem('bersua_user');
    router.push('/admin/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-2 p-4 border-b border-gray-100 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 bg-[#1A1A1A] flex items-center justify-center flex-shrink-0">
          <Coffee className="w-4 h-4 text-white" />
        </div>
        {!collapsed && <span className="font-hand text-xl font-bold text-[#1A1A1A]">BERSUA</span>}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`admin-sidebar-item mb-0.5 ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-2' : ''}`}
              title={collapsed ? item.label : ''}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className={`p-3 border-t border-gray-100 ${collapsed ? 'flex flex-col items-center gap-2' : ''}`}>
        {!collapsed && user && (
          <div className="mb-2 px-3">
            <p className="font-semibold text-sm text-[#1A1A1A]">{user.name}</p>
            <p className="text-xs text-gray-400 capitalize">{user.role}</p>
          </div>
        )}
        <button
          onClick={logout}
          className={`admin-sidebar-item text-red-500 hover:text-red-700 hover:bg-red-50 ${collapsed ? 'justify-center px-2' : ''}`}
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && <span>Keluar</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden">
      {/* Desktop sidebar */}
      <aside className={`hidden md:flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ${collapsed ? 'w-16' : 'w-56'} flex-shrink-0`}>
        <SidebarContent />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-16 -right-3 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow z-10 hover:bg-gray-50"
          style={{ position: 'sticky', alignSelf: 'flex-end', marginTop: '-24px', marginRight: '-12px' }}
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-56 bg-white z-50">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 flex-shrink-0">
          <button onClick={() => setMobileOpen(true)} className="p-1">
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-hand text-lg font-bold">BERSUA Admin</span>
        </div>
        <main className="flex-1 overflow-auto min-h-0">{children}</main>
      </div>
    </div>
  );
}

