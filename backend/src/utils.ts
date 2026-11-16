// ── Timezone WIB (UTC+7) & Order ID helpers for Backend ──
const WIB_OFFSET_MS = 7 * 60 * 60 * 1000; // UTC+7 in milliseconds

/** Get current WIB date string: "YYYY-MM-DD" */
export function getWIBDate(): string {
  const nowWIB = new Date(Date.now() + WIB_OFFSET_MS);
  return nowWIB.toISOString().split('T')[0];
}

/** Get current WIB time string: "HH:MM:SS" */
export function getWIBTime(): string {
  const nowWIB = new Date(Date.now() + WIB_OFFSET_MS);
  return nowWIB.toISOString().split('T')[1].split('.')[0];
}

/** Get current WIB datetime string: "YYYY-MM-DD HH:MM:SS" */
export function getWIBDateTime(): string {
  return `${getWIBDate()} ${getWIBTime()}`;
}

/** Generate unique order number (e.g. BSA2611161200123) */
export function generateOrderNumber(): string {
  const now = getWIBDate();
  const d = now.replace(/-/g, '').slice(2); // YYMMDD
  const t = getWIBTime().replace(/:/g, '').slice(0, 4); // HHMM
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `BSA${d}${t}${random}`;
}

