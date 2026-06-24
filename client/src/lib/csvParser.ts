// ============================================================
// CSV Parser & Data Processing for China Travel Wrapped
// Handles transactions.csv from the GitHub repo
// ============================================================

export interface Transaction {
  id: number;
  date: string; // YYYY-MM-DD
  merchant: string;
  cny: number;
  usd: number;
  category: string;
  payment: string;
  city: string;
  expenseType: string;
  notes: string;
}

export interface DayStats {
  date: string;
  total: number;
  transactions: Transaction[];
  topCategory: string;
  cities: string[];
}

export interface CityStats {
  city: string;
  total: number;
  days: number;
  transactions: number;
  avgPerDay: number;
}

export interface CategoryStats {
  category: string;
  total: number;
  count: number;
  percentage: number;
  color: string;
}

export interface TripStats {
  grandTotal: number;
  totalCNY: number;
  daysTracked: number;
  transactionCount: number;
  dailyAverage: number;
  citiesVisited: number;
  biggestPurchase: Transaction | null;
  cheapestDay: DayStats | null;
  mostExpensiveDay: DayStats | null;
  topMerchant: { name: string; count: number; total: number } | null;
  topCategory: CategoryStats | null;
  accommodationTotal: number;
  foodTotal: number;
  transportTotal: number;
  tripWideTotal: number;
  avgTransactionSize: number;
  longestStreak: number; // consecutive days with spending
  dateRange: { start: string; end: string };
  weekdaySpend: Record<string, number>; // Mon-Sun totals
  paymentMethods: Record<string, number>;
  mostVisitedCity: CityStats | null;
  cityStats: CityStats[];
  categoryStats: CategoryStats[];
  dayStats: DayStats[];
  transactions: Transaction[];
}

const GENERIC_CITIES = new Set(['china', 'unknown', '']);
export const isGenericCity = (city: string) =>
  GENERIC_CITIES.has((city || '').trim().toLowerCase());

// Category color palette — Spotify Wrapped style
export const CATEGORY_COLORS: Record<string, string> = {
  Food: '#FF6B6B',
  Accommodation: '#8360c3',
  Transport: '#2193b0',
  'Intercity Transport': '#11998e',
  Shopping: '#f7971e',
  Activities: '#f953c6',
  Laundry: '#6dd5ed',
  'Personal Care': '#ffd200',
  Subscription: '#b91d73',
  Uncategorized: '#555',
};

export const CITY_GRADIENTS: Record<string, string> = {
  Shenzhen: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
  Guangzhou: 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)',
  Guilin: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
  Yangshuo: 'linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)',
  Kunming: 'linear-gradient(135deg, #8360c3 0%, #2ebf91 100%)',
  "Pu'er": 'linear-gradient(135deg, #f953c6 0%, #b91d73 100%)',
  China: 'linear-gradient(135deg, #555 0%, #888 100%)',
};

export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] || '#888';
}

export function getCityGradient(city: string): string {
  return CITY_GRADIENTS[city] || 'linear-gradient(135deg, #555 0%, #888 100%)';
}

function parseCSVText(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  for (let i = 0; i < normalized.length; i++) {
    const c = normalized[i];
    if (inQuotes) {
      if (c === '"') {
        if (normalized[i + 1] === '"') { field += '"'; i++; }
        else { inQuotes = false; }
      } else {
        field += c;
      }
    } else {
      if (c === '"') { inQuotes = true; }
      else if (c === ',') { row.push(field); field = ''; }
      else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
      else { field += c; }
    }
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }

  // Drop trailing empty rows
  while (rows.length && rows[rows.length - 1].every(c => c.trim() === '')) rows.pop();
  if (rows.length === 0) return [];

  const headers = rows[0].map(h => h.trim());
  return rows.slice(1).map(r => {
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = r[i] !== undefined ? r[i].trim() : ''; });
    return obj;
  });
}

export function parseTransactions(csvText: string): Transaction[] {
  const raw = parseCSVText(csvText);
  return raw
    .filter(r => r.USD !== undefined && r.USD !== '' && !isNaN(parseFloat(r.USD)))
    .map((r, idx) => ({
      id: parseInt(r['#'] || String(idx + 1)),
      date: (r.Date || '').trim().slice(0, 10),
      merchant: r.Merchant || '',
      cny: parseFloat(r.CNY || '0'),
      usd: parseFloat(r.USD || '0'),
      category: r.Category || 'Uncategorized',
      payment: r.Payment || '',
      city: r.City || 'Unknown',
      expenseType: r['Expense Type'] || '',
      notes: r.Notes || '',
    }))
    .filter(r => /^\d{4}-\d{2}-\d{2}$/.test(r.date));
}

export function computeTripStats(transactions: Transaction[]): TripStats {
  // Only count expenses (negative USD values)
  const expenses = transactions.filter(t => t.usd < 0);
  const grandTotal = expenses.reduce((s, t) => s + Math.abs(t.usd), 0);
  const totalCNY = expenses.reduce((s, t) => s + Math.abs(t.cny), 0);

  // Daily grouping
  const byDay: Record<string, Transaction[]> = {};
  transactions.forEach(t => {
    if (!byDay[t.date]) byDay[t.date] = [];
    byDay[t.date].push(t);
  });

  const days = Object.keys(byDay).sort();
  const daysTracked = days.length;

  // Day stats
  const dayStats: DayStats[] = days.map(date => {
    const txns = byDay[date];
    const total = txns.filter(t => t.usd < 0).reduce((s, t) => s + Math.abs(t.usd), 0);
    const catTotals: Record<string, number> = {};
    txns.forEach(t => {
      catTotals[t.category] = (catTotals[t.category] || 0) + Math.abs(t.usd);
    });
    const topCategory = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || '';
    const citiesSet = new Set(txns.map(t => t.city).filter(c => !isGenericCity(c)));
    const cities = Array.from(citiesSet);
    return { date, total, transactions: txns, topCategory, cities };
  });

  // Category stats
  const catTotals: Record<string, { total: number; count: number }> = {};
  expenses.forEach(t => {
    if (!catTotals[t.category]) catTotals[t.category] = { total: 0, count: 0 };
    catTotals[t.category].total += Math.abs(t.usd);
    catTotals[t.category].count += 1;
  });
  const categoryStats: CategoryStats[] = Object.entries(catTotals)
    .sort((a, b) => b[1].total - a[1].total)
    .map(([category, { total, count }]) => ({
      category,
      total,
      count,
      percentage: grandTotal > 0 ? (total / grandTotal) * 100 : 0,
      color: getCategoryColor(category),
    }));

  // City stats
  const cityTotals: Record<string, { total: number; days: Set<string>; count: number }> = {};
  expenses.forEach(t => {
    if (isGenericCity(t.city)) return;
    if (!cityTotals[t.city]) cityTotals[t.city] = { total: 0, days: new Set(), count: 0 };
    cityTotals[t.city].total += Math.abs(t.usd);
    cityTotals[t.city].days.add(t.date);
    cityTotals[t.city].count += 1;
  });
  const cityStats: CityStats[] = Object.entries(cityTotals)
    .sort((a, b) => b[1].total - a[1].total)
    .map(([city, { total, days, count }]) => ({
      city,
      total,
      days: days.size,
      transactions: count,
      avgPerDay: days.size > 0 ? total / days.size : 0,
    }));

  // Highlights
  const biggestPurchase = expenses.reduce<Transaction | null>(
    (max, t) => (!max || Math.abs(t.usd) > Math.abs(max.usd) ? t : max), null
  );

  const mostExpensiveDay = dayStats.reduce<DayStats | null>(
    (max, d) => (!max || d.total > max.total ? d : max), null
  );
  const cheapestDay = dayStats
    .filter(d => d.total > 0)
    .reduce<DayStats | null>((min, d) => (!min || d.total < min.total ? d : min), null);

  // Top merchant
  const merchantMap: Record<string, { count: number; total: number }> = {};
  expenses.forEach(t => {
    if (!merchantMap[t.merchant]) merchantMap[t.merchant] = { count: 0, total: 0 };
    merchantMap[t.merchant].count += 1;
    merchantMap[t.merchant].total += Math.abs(t.usd);
  });
  const topMerchantEntry = Object.entries(merchantMap).sort((a, b) => b[1].count - a[1].count)[0];
  const topMerchant = topMerchantEntry
    ? { name: topMerchantEntry[0], ...topMerchantEntry[1] }
    : null;

  // Category totals
  const foodTotal = catTotals['Food']?.total || 0;
  const accommodationTotal = catTotals['Accommodation']?.total || 0;
  const transportTotal = (catTotals['Transport']?.total || 0) + (catTotals['Intercity Transport']?.total || 0);
  const tripWideTotal = expenses.filter(t => isGenericCity(t.city)).reduce((s, t) => s + Math.abs(t.usd), 0);

  // Weekday spend
  const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weekdaySpend: Record<string, number> = {};
  weekdayNames.forEach(d => { weekdaySpend[d] = 0; });
  dayStats.forEach(d => {
    const dt = new Date(d.date + 'T00:00:00');
    if (!isNaN(dt.getTime())) {
      weekdaySpend[weekdayNames[dt.getDay()]] += d.total;
    }
  });

  // Payment methods
  const paymentMethods: Record<string, number> = {};
  expenses.forEach(t => {
    paymentMethods[t.payment] = (paymentMethods[t.payment] || 0) + Math.abs(t.usd);
  });

  // Consecutive days streak
  let longestStreak = 0, currentStreak = 0;
  for (let i = 0; i < days.length; i++) {
    if (i === 0) { currentStreak = 1; continue; }
    const prev = new Date(days[i - 1] + 'T00:00:00');
    const curr = new Date(days[i] + 'T00:00:00');
    const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      currentStreak++;
    } else {
      longestStreak = Math.max(longestStreak, currentStreak);
      currentStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, currentStreak);

  return {
    grandTotal,
    totalCNY,
    daysTracked,
    transactionCount: expenses.length,
    dailyAverage: daysTracked > 0 ? grandTotal / daysTracked : 0,
    citiesVisited: cityStats.length,
    biggestPurchase,
    cheapestDay,
    mostExpensiveDay,
    topMerchant,
    topCategory: categoryStats[0] || null,
    accommodationTotal,
    foodTotal,
    transportTotal,
    tripWideTotal,
    avgTransactionSize: expenses.length > 0 ? grandTotal / expenses.length : 0,
    longestStreak,
    dateRange: {
      start: days[0] || '',
      end: days[days.length - 1] || '',
    },
    weekdaySpend,
    paymentMethods,
    mostVisitedCity: cityStats.sort((a, b) => b.days - a.days)[0] || null,
    cityStats: cityStats.sort((a, b) => b.total - a.total),
    categoryStats,
    dayStats,
    transactions,
  };
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  const dt = new Date(dateStr + 'T00:00:00');
  if (isNaN(dt.getTime())) return dateStr;
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatDateFull(dateStr: string): string {
  if (!dateStr) return '—';
  const dt = new Date(dateStr + 'T00:00:00');
  if (isNaN(dt.getTime())) return dateStr;
  return dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export interface AccommodationEntry {
  date: string;
  amountCNY: number;
  city: string;
  merchant: string;
}

export function parseAccommodations(csvText: string): AccommodationEntry[] {
  const raw = parseCSVText(csvText);
  return raw
    .filter(r => r['Amount (CNY)'] !== undefined && r['Amount (CNY)'] !== '' && !isNaN(parseFloat(r['Amount (CNY)'])))
    .map(r => ({
      date: (r.Date || '').trim().slice(0, 10),
      amountCNY: parseFloat(r['Amount (CNY)'] || '0'),
      city: r.City || 'Unknown',
      merchant: r.Merchant || '',
    }))
    .filter(r => /^\d{4}-\d{2}-\d{2}$/.test(r.date))
    .sort((a, b) => a.date.localeCompare(b.date));
}
