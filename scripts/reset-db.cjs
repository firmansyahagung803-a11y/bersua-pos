/**
 * BERSUA Database Reset Script
 * ─────────────────────────────
 * Jalankan: node scripts/reset-db.cjs
 *
 * Opsi:
 *   node scripts/reset-db.cjs          → reset data transaksi (orders, income, expenses)
 *   node scripts/reset-db.cjs --full   → reset semua + hapus menu & kategori (akan di-seed ulang)
 *   node scripts/reset-db.cjs --menu   → hanya reset menu & kategori (seed ulang)
 */

const Database = require('better-sqlite3');
const path = require('path');

const args = process.argv.slice(2);
const isFull = args.includes('--full');
const isMenuOnly = args.includes('--menu');

const DB_PATH = path.join(__dirname, '..', 'bersua.db');
const db = new Database(DB_PATH);
db.pragma('foreign_keys = OFF'); // supaya bisa hapus dengan FK

console.log('\n🗑️  BERSUA DB Reset Tool');
console.log('═══════════════════════════════');

if (isFull) {
  // ── FULL RESET: hapus semua data termasuk menu & kategori ──
  console.log('⚠️  Mode: FULL RESET (semua data termasuk menu)');
  db.exec(`
    DELETE FROM income;
    DELETE FROM expenses;
    DELETE FROM order_items;
    DELETE FROM orders;
    DELETE FROM menu_items;
    DELETE FROM categories;
    DELETE FROM sqlite_sequence WHERE name IN ('income','expenses','order_items','orders','menu_items','categories');
  `);
  console.log('✅ Semua tabel transaksi + menu + kategori dikosongkan');
  seedCategories();
  seedMenu();

} else if (isMenuOnly) {
  // ── MENU ONLY: reset menu & kategori saja ──
  console.log('🍽️  Mode: MENU RESET (hapus menu & kategori, seed ulang)');
  db.exec(`
    DELETE FROM order_items;
    DELETE FROM menu_items;
    DELETE FROM categories;
    DELETE FROM sqlite_sequence WHERE name IN ('order_items','menu_items','categories');
  `);
  console.log('✅ Menu & kategori dikosongkan');
  seedCategories();
  seedMenu();

} else {
  // ── DEFAULT: hanya reset data transaksi ──
  console.log('💼 Mode: RESET TRANSAKSI (orders, income, expenses)');
  db.exec(`
    DELETE FROM income;
    DELETE FROM expenses;
    DELETE FROM order_items;
    DELETE FROM orders;
    DELETE FROM sqlite_sequence WHERE name IN ('income','expenses','order_items','orders');
  `);
  console.log('✅ Data transaksi (orders, income, expenses) dikosongkan');
  console.log('ℹ️  Menu & kategori tetap ada');
}

// ── Print row counts ───────────────────────────────────────────
const tables = ['categories', 'menu_items', 'orders', 'order_items', 'income', 'expenses', 'users'];
console.log('\n📊 Row counts setelah reset:');
for (const t of tables) {
  const r = db.prepare(`SELECT COUNT(*) as c FROM "${t}"`).get();
  console.log(`   ${t.padEnd(14)}: ${r.c} rows`);
}

db.pragma('foreign_keys = ON');
db.close();
console.log('\n✨ Done! Restart dev server jika perlu.\n');


// ── Seed Functions ─────────────────────────────────────────────

function seedCategories() {
  const insertCat = db.prepare('INSERT INTO categories (name, slug, icon) VALUES (?, ?, ?)');
  const cats = [
    ['Coffe', 'kopi', '☕'],
    ['Non-Coffe', 'non-kopi', '🥤'],
    ['Minuman Lain', 'minuman-lain', '💧'],
    ['Snack & Side', 'snack', '🍟'],
    ['Roti & Dimsum', 'roti-dimsum', '🥐'],
  ];
  for (const cat of cats) insertCat.run(...cat);
  console.log('🌱 Kategori di-seed ulang (5 kategori)');
}

function seedMenu() {
  const catIds = db.prepare('SELECT id FROM categories ORDER BY id').all().map(r => r.id);

  const insertItem = db.prepare(`
    INSERT INTO menu_items (category_id, name, description, price, image_url, is_available, is_featured)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const items = [
    // Coffe
    [catIds[0], 'Echa', 'Expreso-Macha — perpaduan espresso dan matcha yang unik', 12000, 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=400', 1, 1],
    [catIds[0], 'Acha', 'Americano Clasic — espresso dengan air dingin, clean & bold', 10000, 'https://images.unsplash.com/photo-1521302080334-4bebac2763a6?w=400', 1, 1],
    [catIds[0], 'Ella', 'Expreso Latte — espresso dengan susu steamed, smooth', 12000, 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=400', 1, 1],
    // Non-Coffe
    [catIds[1], 'Ocha', 'Choklat-Susu — cokelat susu segar yang creamy', 10000, 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=400', 1, 1],
    [catIds[1], 'Suci', 'Susu-Machiato — susu segar dengan shot machiato', 12000, 'https://images.unsplash.com/photo-1562777717-dc6984f65a63?w=400', 1, 0],
    [catIds[1], 'S.Prita', 'Sprit-Yakul — Sprite segar dipadukan yakult', 10000, 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400', 1, 0],
    [catIds[1], 'Ana.S', 'Fanta-Susu — Fanta dengan susu, viral & segar', 10000, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400', 1, 0],
    [catIds[1], 'Okta.S', 'Coklat-Susu — susu cokelat dingin yang menyegarkan', 10000, 'https://images.unsplash.com/photo-1517959105821-eaf2591984ca?w=400', 1, 0],
    [catIds[1], 'Miss-U', 'Milo-Susu — Milo dengan susu, nostalgia dalam satu gelas', 10000, 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400', 1, 1],
    // Minuman Lain
    [catIds[2], 'Air Putih Botol', 'Air mineral botol segar', 5000, 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400', 1, 0],
    [catIds[2], 'Es Batu', 'Es batu untuk minuman kamu', 2000, 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400', 1, 0],
    // Snack
    [catIds[3], 'Paket Enjoy', 'Mix snack: sosis, nugget, kentang goreng', 10000, 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400', 1, 1],
    [catIds[3], 'Mie Gulung', 'Mie goreng digulung dengan sosis, disiram saus spesial', 10000, 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=400', 1, 1],
    [catIds[3], "The Cireng's", 'Cireng isi bumbu khas, renyah di luar lembut di dalam', 10000, 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400', 1, 0],
    [catIds[3], "Nodle's X Egg", 'Mie instan dengan telur mata sapi', 12000, 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400', 1, 1],
    // Roti & Dimsum
    [catIds[4], 'Toast Bread', 'Roti toast hangat dengan topping garlic butter', 10000, 'https://images.unsplash.com/photo-1541519227354-08fa5d50c820?w=400', 1, 1],
    [catIds[4], 'DDimsum', 'Dimsum kukus fresh — tanya promo hari ini ke kasir!', 15000, 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400', 1, 0],
  ];

  for (const item of items) insertItem.run(...item);
  console.log('🌱 Menu di-seed ulang (17 item)');
}

