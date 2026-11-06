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
    ['Main Course', 'main-course', '🍛'],
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
    // Coffe (catIds[0])
    [catIds[0], 'Echa', 'Expreso-Macha — perpaduan espresso dan matcha yang unik', 10000, '/images/echa.jpg', 1, 1],
    [catIds[0], 'Acha', 'Americano Clasic — espresso dengan air dingin, clean & bold', 10000, '/images/acha.jpeg', 1, 1],
    [catIds[0], 'Ella', 'Expreso Latte — espresso dengan susu steamed, smooth', 10000, '/images/ella.jpeg', 1, 1],
    // Non-Coffe (catIds[1])
    [catIds[1], 'Ocha', 'Choklat-Susu — cokelat susu segar yang creamy', 10000, '/images/ocha.jpeg', 1, 1],
    [catIds[1], 'Suci', 'Susu-Machiato — susu segar dengan shot machiato', 10000, '/images/suci.jpeg', 1, 0],
    [catIds[1], 'S.Prita', 'Sprit-Yakul — Sprite segar dipadukan yakult', 10000, '/images/s-prita.jpeg', 1, 0],
    [catIds[1], 'Ana.S', 'Fanta-Susu — Fanta dengan susu, viral & segar', 10000, '/images/ana-s.jpeg', 1, 0],
    [catIds[1], 'Okta.S', 'Coklat-Susu — susu cokelat dingin yang menyegarkan', 10000, '/images/okta-s.jpeg', 1, 0],
    [catIds[1], 'Miss-U', 'Milo-Susu — Milo dengan susu, nostalgia dalam satu gelas', 10000, '/images/miss-u.jpeg', 1, 1],
    // Minuman Lain (catIds[2])
    [catIds[2], 'Air Putih Botol', 'Air mineral botol segar', 5000, '/images/airputih.jpeg', 1, 0],
    [catIds[2], 'Es Batu', 'Es batu untuk minuman kamu', 2000, 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400', 1, 0],
    // Snack & Side (catIds[3])
    [catIds[3], 'Paket Enjoy', 'Mix snack: sosis, nugget, kentang goreng', 10000, '/images/paketenjoy.jpeg', 1, 1],
    [catIds[3], 'Mie Gulung', 'Mie goreng digulung dengan sosis, disiram saus spesial', 10000, '/images/miegulung.jpeg', 1, 1],
    [catIds[3], "The Cireng's", 'Cireng isi bumbu khas, renyah di luar lembut di dalam', 10000, '/images/thecirengs.jpeg', 1, 0],
    [catIds[3], "Nodle's X Egg", 'Mie instan dengan telur mata sapi', 10000, '/images/nodlesxegg.jpeg', 1, 1],
    [catIds[3], 'Toast Bread', 'Roti toast hangat dengan topping garlic butter', 10000, '/images/toastbread.jpeg', 1, 1],
    [catIds[3], 'DDimsum', 'Dimsum kukus fresh — tanya promo hari ini ke kasir!', 15000, '/images/ddimsum.jpeg', 1, 0],
    // Main Course (catIds[4])
    [catIds[4], 'Nasi Goreng Ijo', 'Nasi goreng cabe ijo spesial dengan bumbu khas dan aroma sedap', 14000, '/images/nasigorengijo.jpeg', 1, 1],
  ];

  for (const item of items) insertItem.run(...item);
  console.log('🌱 Menu di-seed ulang (18 item)');
}

