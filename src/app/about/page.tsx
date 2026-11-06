import Navbar from '@/components/Navbar';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-block bg-[#1A1A1A] text-white px-4 py-1 font-hand text-sm mb-6 rotate-[-1deg]">
            EST. 2026
          </div>
          <h1 className="font-hand text-6xl font-bold text-[#1A1A1A] mb-4">
            Tentang <span className="text-[#2563EB]">BERSUA</span>
          </h1>
          <p className="font-patrick text-[#3D3D3D] text-lg max-w-xl mx-auto leading-relaxed">
            BERSUA bukan sekadar kedai kopi. Kami adalah tempat di mana cerita dimulai, persahabatan tumbuh, dan momen berharga tercipta.
          </p>
        </div>

        {/* Story */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white border-2 border-[#1A1A1A] p-6 shadow-[4px_4px_0_#1A1A1A]" style={{ transform: 'rotate(-0.5deg)' }}>
            <h2 className="font-hand text-2xl font-bold text-[#1A1A1A] mb-3">☕ Cerita Kami</h2>
            <p className="font-patrick text-[#3D3D3D] leading-relaxed">
              Lahir dari kecintaan mendalam terhadap kopi dan makanan, BERSUA hadir untuk menciptakan ruang di mana orang-orang bisa berkumpul, bercengkrama, dan menikmati sajian berkualitas.
            </p>
            <p className="font-patrick text-[#3D3D3D] leading-relaxed mt-3">
              Setiap cangkir kopi yang kami seduh dan setiap hidangan yang kami sajikan dibuat dengan sepenuh hati, menggunakan bahan-bahan pilihan terbaik.
            </p>
          </div>
          <div className="bg-[#DBEAFE] border-2 border-[#2563EB] p-6" style={{ transform: 'rotate(0.5deg)' }}>
            <h2 className="font-hand text-2xl font-bold text-[#1A1A1A] mb-3">🌱 Filosofi</h2>
            <ul className="space-y-3 font-patrick text-[#3D3D3D]">
              <li className="flex items-start gap-2"><span>✦</span><span>Bahan segar dan lokal untuk kualitas terbaik</span></li>
              <li className="flex items-start gap-2"><span>✦</span><span>Suasana nyaman yang membuat betah berlama-lama</span></li>
              <li className="flex items-start gap-2"><span>✦</span><span>Pelayanan yang tulus dari hati ke hati</span></li>
              <li className="flex items-start gap-2"><span>✦</span><span>Mendukung petani kopi lokal Indonesia</span></li>
            </ul>
          </div>
        </div>

        {/* Team */}
        <div className="mb-16">
          <h2 className="font-hand text-3xl font-bold text-[#1A1A1A] mb-6 text-center">Tim Kami</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Alip', role: 'Owner', emoji: '👨‍🍳' },
              { name: 'Farhan', role: 'Manager Store', emoji: '👩‍🍳' },
              { name: 'Agung', role: 'Barista', emoji: '👨‍💼' },
              { name: 'Naksya', role: 'Barista', emoji: '👩‍💼' },
            ].map((m, i) => (
              <div key={i} className="bg-white border-2 border-[#1A1A1A] p-4 text-center" style={{ transform: `rotate(${i % 2 === 0 ? '-1' : '1'}deg)` }}>
                <div className="text-5xl mb-2">{m.emoji}</div>
                <p className="font-hand text-lg font-bold">{m.name}</p>
                <p className="font-patrick text-xs text-[#3D3D3D]">{m.role}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="bg-[#1A1A1A] text-white p-8 text-center">
          <h2 className="font-hand text-3xl font-bold mb-4">Kunjungi Kami</h2>
          <div className="grid md:grid-cols-3 gap-6 font-patrick">
            <div>
              <p className="text-gray-400 text-sm mb-1">📍 Alamat</p>
              <p>Jl. Kopi No. 12, Jakarta Selatan</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">🕐 Jam Buka</p>
              <p>Senin–Minggu<br />08.00 – 22.00 WIB</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">📞 Kontak</p>
              <p>+62 812 3456 7890</p>
              <p className="text-[#DBEAFE]">bersua@email.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

