import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import { formatRupiah } from '@/lib/utils';

async function getFeaturedMenu() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/menu?featured=true`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80',
  'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&q=80',
  'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&q=80',
];

export default async function HomePage() {
  const featured = await getFeaturedMenu();

  const infoCards = [
    { icon: '📍', title: 'Lokasi', desc: 'Jl. Kopi No. 12\nJakarta Selatan', sub: 'Sen–Min  08.00 – 22.00' },
    { icon: '☎️', title: 'Kontak', desc: '+62 812 3456 7890', sub: 'bersua@email.com' },
    { icon: '🛵', title: 'Order', desc: 'Dine in & Takeaway', sub: 'Order online tersedia' },
  ];

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      <Navbar />

      {/* ── HERO ───────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 py-10 md:py-20">
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">

          {/* Left copy */}
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 bg-[#DBEAFE] border-2 border-[#2563EB] px-3 py-1 mb-6 -rotate-1">
              <span className="font-hand text-[#2563EB] text-sm font-semibold">☕ Coffee &amp; Eatery</span>
            </div>
            <h1 className="font-hand text-6xl md:text-7xl font-bold text-[#1A1A1A] leading-tight mb-4">
              Tempat
              <br />
              <span className="text-[#2563EB] relative inline-block">
                Bersua
                <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 200 8" fill="none">
                  <path d="M2 6 Q50 2 100 6 Q150 10 198 4" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" fill="none" />
                </svg>
              </span>
              <br />
              &amp; Menikmati
            </h1>
            <p className="font-patrick text-[#3D3D3D] text-lg mt-6 mb-8 leading-relaxed max-w-md">
              Kopi pilihan, makanan lezat, dan suasana hangat untuk menemani setiap pertemuan bermakna.
            </p>
            <div className="flex gap-4 flex-wrap">
              <Link href="/menu" className="btn-primary font-hand text-xl">
                Lihat Menu →
              </Link>
              <Link
                href="/about"
                className="font-hand text-xl border-2 border-[#1A1A1A] px-6 py-2.5 rounded-sm hover:bg-[#EDE7D9] transition-colors"
              >
                Tentang Kami
              </Link>
            </div>

            {/* Stats strip */}
            <div className="flex gap-6 mt-10 pt-8 border-t-2 border-dashed border-[#C49A6C]">
              {[
                { n: '27+', label: 'Menu pilihan' },
                { n: '5★', label: 'Rating pelanggan' },
                { n: '2024', label: 'Didirikan' },
              ].map((s, i) => (
                <div key={i}>
                  <p className="font-hand text-2xl font-bold text-[#1A1A1A]">{s.n}</p>
                  <p className="font-patrick text-xs text-[#8B5E3C]">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right collage */}
          <div className="relative h-72 md:h-[460px] select-none">
            {/* Large main photo */}
            <div className="absolute top-0 right-0 w-56 md:w-64 h-56 md:h-64 border-4 border-[#1A1A1A] shadow-[6px_6px_0_#1A1A1A] rotate-2 overflow-hidden bg-[#8B5E3C]">
              <Image
                src={HERO_IMAGES[0]}
                alt="Kopi BERSUA"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            {/* Medium photo */}
            <div className="absolute top-24 md:top-32 left-0 w-44 md:w-48 h-44 md:h-48 border-4 border-white shadow-[5px_5px_0_#1A1A1A] -rotate-3 overflow-hidden bg-[#EDE7D9]">
              <Image
                src={HERO_IMAGES[1]}
                alt="Makanan BERSUA"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            {/* Small accent photo */}
            <div className="absolute bottom-6 right-12 md:right-16 w-32 md:w-36 h-32 md:h-36 border-4 border-[#2563EB] shadow-[4px_4px_0_#2563EB] rotate-1 overflow-hidden bg-[#DBEAFE]">
              <Image
                src={HERO_IMAGES[2]}
                alt="Dessert BERSUA"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            {/* Sticker labels */}
            <div className="absolute bottom-2 left-6 bg-[#F5F0E8] border-2 border-[#1A1A1A] px-3 py-1.5 -rotate-2 shadow-sm">
              <span className="font-hand text-sm font-bold">#BersuaYuk</span>
            </div>
            <div className="absolute top-6 left-16 bg-[#1A1A1A] text-white px-2 py-1 rotate-3">
              <span className="font-hand text-xs">est. 2024</span>
            </div>
            <div className="absolute top-2 right-24 md:right-32">
              <span className="font-hand text-xs text-[#8B5E3C] rotate-12 inline-block">↙ favorit!</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURED MENU ──────────────────────────────────── */}
      <section className="bg-[#1A1A1A] py-14">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-end justify-between mb-8 gap-4">
            <div>
              <p className="font-patrick text-[#C49A6C] text-sm mb-1">— Pilihan terbaik kami</p>
              <h2 className="font-hand text-4xl md:text-5xl font-bold text-white">Menu Favorit</h2>
            </div>
            <Link href="/menu" className="font-patrick text-[#DBEAFE] hover:text-white transition-colors text-sm flex-shrink-0">
              Lihat semua →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(featured.length > 0 ? featured : [
              { id: 0, name: 'Kopi Susu Bersua', price: 28000, image_url: 'https://images.unsplash.com/photo-1562777717-dc6984f65a63?w=400', description: 'Signature gula aren' },
              { id: 0, name: 'Nasi Ayam Bakar', price: 48000, image_url: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400', description: 'Bumbu kecap premium' },
              { id: 0, name: 'Cheesecake', price: 35000, image_url: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400', description: 'New York style' },
              { id: 0, name: 'Butterfly Pea Latte', price: 38000, image_url: 'https://images.unsplash.com/photo-1612203985729-70726954388c?w=400', description: 'Bunga telang biru' },
            ]).slice(0, 4).map((item: { id: number; name: string; price: number; image_url?: string; description?: string }, i: number) => (
              <Link
                key={item.id || i}
                href={item.id ? `/menu/${item.id}` : '/menu'}
                className="bg-[#EDE7D9] border-2 border-transparent hover:border-[#2563EB] transition-all group cursor-pointer rounded-sm overflow-hidden sticker"
              >
                <div className="relative h-32 bg-[#C49A6C]">
                  {item.image_url && (
                    <Image src={item.image_url} alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-hand text-base font-bold text-[#1A1A1A] group-hover:text-[#2563EB] transition-colors line-clamp-1">
                    {item.name}
                  </h3>
                  <p className="font-patrick text-xs text-[#3D3D3D] mt-0.5 line-clamp-1">{item.description}</p>
                  <p className="font-hand text-base font-bold text-[#2563EB] mt-1.5">{formatRupiah(item.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── INFO CARDS ─────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="font-hand text-4xl font-bold text-[#1A1A1A]">Temukan Kami</h2>
          <p className="font-patrick text-[#8B5E3C] mt-2">Kami siap menyambut kamu setiap hari</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {infoCards.map((info, i) => (
            <div
              key={i}
              className="border-2 border-[#1A1A1A] p-6 rounded-sm bg-white shadow-[4px_4px_0_#1A1A1A] card-hover"
              style={{ transform: `rotate(${i === 1 ? '0.5' : i === 0 ? '-0.5' : '0.3'}deg)` }}
            >
              <div className="text-3xl mb-3">{info.icon}</div>
              <h3 className="font-hand text-xl font-bold text-[#1A1A1A] mb-1">{info.title}</h3>
              <p className="font-patrick text-sm text-[#3D3D3D] whitespace-pre-line leading-relaxed">{info.desc}</p>
              <p className="font-patrick text-xs text-[#8B5E3C] mt-1">{info.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ─────────────────────────────────────── */}
      <section className="bg-[#2563EB] py-14 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, white 0, white 1px, transparent 0, transparent 50%)', backgroundSize: '20px 20px' }} />
        <div className="max-w-2xl mx-auto px-4 text-center relative">
          <p className="font-hand text-white text-lg mb-2 opacity-80">— Yuk, langsung saja —</p>
          <h2 className="font-hand text-4xl md:text-5xl font-bold text-white mb-6">Pesan Sekarang!</h2>
          <p className="font-patrick text-blue-100 mb-8 leading-relaxed">
            Nikmati kopi dan makanan terbaik kami. Dine in, takeaway, atau order online.
          </p>
          <Link
            href="/menu"
            className="inline-block bg-white text-[#2563EB] font-hand text-xl font-bold px-8 py-3 border-2 border-white hover:bg-[#F5F0E8] transition-colors shadow-[4px_4px_0_rgba(0,0,0,0.2)]"
          >
            Pesan Sekarang →
          </Link>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <footer className="bg-[#1A1A1A] text-white py-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="font-hand text-3xl font-bold mb-1">BERSUA</p>
              <p className="font-patrick text-sm text-gray-400">Coffee &amp; Eatery</p>
            </div>
            <div className="flex gap-8 text-sm font-patrick text-gray-400">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <Link href="/menu" className="hover:text-white transition-colors">Menu</Link>
              <Link href="/about" className="hover:text-white transition-colors">Tentang</Link>
              <Link href="/cart" className="hover:text-white transition-colors">Keranjang</Link>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-6 text-center">
            <p className="font-patrick text-xs text-gray-500">© 2024 BERSUA Coffee &amp; Eatery. Dibuat dengan ☕ dan ❤️</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
