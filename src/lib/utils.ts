// Formatting utilities
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function generateOrderNumber(): string {
  const now = getWIBDate();
  const d = now.replace(/-/g, '').slice(2); // YYMMDD
  const t = getWIBTime().replace(/:/g, '').slice(0, 4); // HHMM
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `BSA${d}${t}${random}`;
}

// ── Timezone WIB (UTC+7) helpers ───────────────────────────────
// Semua tanggal/waktu disimpan dalam zona waktu WIB agar
// ketika jam 00:00 WIB, hari berganti dengan benar.

const WIB_OFFSET_MS = 7 * 60 * 60 * 1000; // UTC+7 dalam milidetik

/** Kembalikan tanggal WIB sekarang: format "YYYY-MM-DD" */
export function getWIBDate(): string {
  const nowWIB = new Date(Date.now() + WIB_OFFSET_MS);
  return nowWIB.toISOString().split('T')[0];
}

/** Kembalikan waktu WIB sekarang: format "HH:MM:SS" */
export function getWIBTime(): string {
  const nowWIB = new Date(Date.now() + WIB_OFFSET_MS);
  return nowWIB.toISOString().split('T')[1].split('.')[0];
}

/** Kembalikan datetime WIB sekarang: format "YYYY-MM-DD HH:MM:SS" */
export function getWIBDateTime(): string {
  return `${getWIBDate()} ${getWIBTime()}`;
}

// Status display
export const ORDER_STATUS_LABEL: Record<string, string> = {
  pending: 'Menunggu',
  processing: 'Diproses',
  ready: 'Siap',
  completed: 'Selesai',
  cancelled: 'Dibatal',
};

export const PAYMENT_METHOD_LABEL: Record<string, string> = {
  cash: 'Tunai',
  transfer: 'Transfer Bank',
  qris: 'QRIS',
  debit: 'Kartu Debit',
};

export const EXPENSE_CATEGORY_LABEL: Record<string, string> = {
  bahan_baku: 'Bahan Baku',
  gaji: 'Gaji Karyawan',
  sewa: 'Sewa Tempat',
  utilitas: 'Listrik & Air',
  peralatan: 'Peralatan',
  operasional: 'Operasional',
  marketing: 'Marketing',
  lainnya: 'Lainnya',
};
