'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCartStore } from '@/store/cart';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const { itemCount } = useCartStore();
  const count = itemCount();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/menu', label: 'Menu' },
    { href: '/about', label: 'Tentang' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-[#F5F0E8] border-b-2 border-[#1A1A1A]">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 bg-[#1A1A1A] rounded-sm flex items-center justify-center text-white font-hand text-lg font-bold group-hover:bg-[#2563EB] transition-colors">
            B
          </div>
          <span className="font-hand text-2xl font-bold text-[#1A1A1A] leading-none">
            BERSUA
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`font-patrick text-base transition-colors ${
                pathname === link.href
                  ? 'text-[#2563EB] font-bold'
                  : 'text-[#1A1A1A] hover:text-[#2563EB]'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {/* Cart */}
          <Link href="/cart" className="relative p-2 hover:bg-[#EDE7D9] rounded-sm transition-colors">
            <ShoppingBag className="w-5 h-5 text-[#1A1A1A]" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#2563EB] text-white text-xs font-bold rounded-full flex items-center justify-center">
                {count > 9 ? '9+' : count}
              </span>
            )}
          </Link>

          {/* Admin */}
          <Link
            href="/admin/login"
            className="hidden md:block font-patrick text-sm border-2 border-[#1A1A1A] px-3 py-1.5 rounded-sm hover:bg-[#1A1A1A] hover:text-white transition-all"
          >
            Admin
          </Link>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#F5F0E8] border-t border-[#1A1A1A] px-4 py-4 flex flex-col gap-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`font-patrick text-base py-2 ${
                pathname === link.href ? 'text-[#2563EB] font-bold' : 'text-[#1A1A1A]'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/admin/login"
            onClick={() => setMobileOpen(false)}
            className="font-patrick text-base py-2 text-[#1A1A1A] border-t border-[#1A1A1A] mt-2 pt-3"
          >
            Admin Login
          </Link>
        </div>
      )}
    </nav>
  );
}

