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
  grandTotalCNY: number;
  daysTracked: number;
  transactionCount: number;
  dailyAverage: number;
  dailyAverageCNY: number;
  citiesVisited: number;
  biggestPurchase: Transaction | null;
  cheapestDay: DayStats | null;
  mostExpensiveDay: DayStats | null;
  topMerchant: { name: string; count: number; total: number; totalCNY: number } | null;
  topCategory: CategoryStats | null;
  accommodationTotal: number;
  accommodationTotalCNY: number;
  foodTotal: number;
  foodTotalCNY: number;
  transportTotal: number;
  transportTotalCNY: number;
  tripWideTotal: number;
  tripWideTotalCNY: number;
  avgTransactionSize: number;
  avgTransactionSizeCNY: number;
  longestStreak: number;
  dateRange: { start: string; end: string };
  weekdaySpend: Record<string, number>;
  weekdaySpendCNY: Record<string, number>;
  paymentMethods: Record<string, number>;
  paymentMethodsCNY: Record<string, number>;
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
  Activities: '#F4A261',
  Shopping: '#E76F51',
  'Trip-wide': '#95B8D1',
};

export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] || '#9D84B7';
}

export function getCityGradient(city: string): string {
  const gradients: Record<string, string> = {
    'Shanghai': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'Beijing': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'Chengdu': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'Xi\'an': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'Hangzhou': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'Guilin': 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    'Yangshuo': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'Nanjing': 'linear-gradient(135deg, #ff9a56 0%, #ff6a88 100%)',
    'Suzhou': 'linear-gradient(135deg, #2e2e78 0%, #662d8c 100%)',
    'Wuhan': 'linear-gradient(135deg, #ffa751 0%, #ffe259 100%)',
    'Chongqing': 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
    'Kunming': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'Lijiang': 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    'Dali': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  };
  return gradients[city] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
}

export function parseTransactions(csv: string): Transaction[] {
  const lines = csv.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  const dateIdx = headers.indexOf('Date');
  const merchantIdx = headers.indexOf('Merchant');
  const cnyIdx = headers.indexOf('CNY');
  const usdIdx = headers.indexOf('USD');
  const categoryIdx = headers.indexOf('Category');
  const paymentIdx = headers.indexOf('Payment');
  const cityIdx = headers.indexOf('City');
  const expenseTypeIdx = headers.indexOf('Expense Type');
  const notesIdx = headers.indexOf('Notes');

  return lines
    .slice(1)
    .map((line, id) => ({
      id,
      date: (line.split(',')[dateIdx] || '').trim(),
      merchant: (line.split(',')[merchantIdx] || '').trim(),
      cny: parseFloat((line.split(',')[cnyIdx] || '0').trim()) || 0,
      usd: parseFloat((line.split(',')[usdIdx] || '0').trim()) || 0,
      category: (line.split(',')[categoryIdx] || '').trim(),
      payment: (line.split(',')[paymentIdx] || '').trim(),
      city: (line.split(',')[cityIdx] || '').trim(),
      expenseType: (line.split(',')[expenseTypeIdx] || '').trim(),
      notes: (line.split(',')[notesIdx] || '').trim(),
    }))
    .filter(r => /^\d{4}-\d{2}-\d{2}$/.test(r.date));
}

export function computeTripStats(transactions: Transaction[]): TripStats {
  const expenses = transactions.filter(t => t.usd < 0);
  const grandTotal = expenses.reduce((s, t) => s + Math.abs(t.usd), 0);
  const grandTotalCNY = expenses.reduce((s, t) => s + Math.abs(t.cny), 0);

  const byDay: Record<string, Transaction[]> = {};
  transactions.forEach(t => {
    if (!byDay[t.date]) byDay[t.date] = [];
    byDay[t.date].push(t);
  });

  const days = Object.keys(byDay).sort();
  const daysTracked = days.length;

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

  const biggestPurchase = expenses.reduce<Transaction | null>(
    (max, t) => (!max || Math.abs(t.usd) > Math.abs(max.usd) ? t : max), null
  );

  const mostExpensiveDay = dayStats.reduce<DayStats | null>(
    (max, d) => (!max || d.total > max.total ? d : max), null
  );
  const cheapestDay = dayStats
    .filter(d => d.total > 0)
    .reduce<DayStats | null>((min, d) => (!min || d.total < min.total ? d : min), null);

  const merchantMap: Record<string, { count: number; total: number; totalCNY: number }> = {};
  expenses.forEach(t => {
    if (!merchantMap[t.merchant]) merchantMap[t.merchant] = { count: 0, total: 0, totalCNY: 0 };
    merchantMap[t.merchant].count += 1;
    merchantMap[t.merchant].total += Math.abs(t.usd);
    merchantMap[t.merchant].totalCNY += Math.abs(t.cny);
  });
  const topMerchantEntry = Object.entries(merchantMap).sort((a, b) => b[1].count - a[1].count)[0];
  const topMerchant = topMerchantEntry
    ? { name: topMerchantEntry[0], ...topMerchantEntry[1] }
    : null;

  const foodTotal = catTotals['Food']?.total || 0;
  const accommodationTotal = catTotals['Accommodation']?.total || 0;
  const transportTotal = (catTotals['Transport']?.total || 0) + (catTotals['Intercity Transport']?.total || 0);
  const tripWideTotal = expenses.filter(t => isGenericCity(t.city)).reduce((s, t) => s + Math.abs(t.usd), 0);

  const catTotalsCNY: Record<string, { total: number; count: number }> = {};
  expenses.forEach(t => {
    if (!catTotalsCNY[t.category]) catTotalsCNY[t.category] = { total: 0, count: 0 };
    catTotalsCNY[t.category].total += Math.abs(t.cny);
    catTotalsCNY[t.category].count += 1;
  });
  const foodTotalCNY = catTotalsCNY['Food']?.total || 0;
  const accommodationTotalCNY = catTotalsCNY['Accommodation']?.total || 0;
  const transportTotalCNY = (catTotalsCNY['Transport']?.total || 0) + (catTotalsCNY['Intercity Transport']?.total || 0);
  const tripWideTotalCNY = expenses.filter(t => isGenericCity(t.city)).reduce((s, t) => s + Math.abs(t.cny), 0);

  const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weekdaySpend: Record<string, number> = {};
  weekdayNames.forEach(d => { weekdaySpend[d] = 0; });
  dayStats.forEach(d => {
    const dt = new Date(d.date + 'T00:00:00');
    if (!isNaN(dt.getTime())) {
      weekdaySpend[weekdayNames[dt.getDay()]] += d.total;
    }
  });

  const weekdaySpendCNY: Record<string, number> = {};
  weekdayNames.forEach(d => { weekdaySpendCNY[d] = 0; });
  dayStats.forEach(d => {
    const txns = byDay[d.date];
    const totalCNY = txns.filter(t => t.usd < 0).reduce((s, t) => s + Math.abs(t.cny), 0);
    const dt = new Date(d.date + 'T00:00:00');
    if (!isNaN(dt.getTime())) {
      weekdaySpendCNY[weekdayNames[dt.getDay()]] += totalCNY;
    }
  });

  const paymentMethods: Record<string, number> = {};
  expenses.forEach(t => {
    paymentMethods[t.payment] = (paymentMethods[t.payment] || 0) + Math.abs(t.usd);
  });

  const paymentMethodsCNY: Record<string, number> = {};
  expenses.forEach(t => {
    paymentMethodsCNY[t.payment] = (paymentMethodsCNY[t.payment] || 0) + Math.abs(t.cny);
  });

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
    grandTotalCNY,
    daysTracked,
    transactionCount: expenses.length,
    dailyAverage: daysTracked > 0 ? grandTotal / daysTracked : 0,
    dailyAverageCNY: daysTracked > 0 ? grandTotalCNY / daysTracked : 0,
    citiesVisited: cityStats.length,
    biggestPurchase,
    cheapestDay,
    mostExpensiveDay,
    topMerchant,
    topCategory: categoryStats[0] || null,
    accommodationTotal,
    accommodationTotalCNY,
    foodTotal,
    foodTotalCNY,
    transportTotal,
    transportTotalCNY,
    tripWideTotal,
    tripWideTotalCNY,
    avgTransactionSize: expenses.length > 0 ? grandTotal / expenses.length : 0,
    avgTransactionSizeCNY: expenses.length > 0 ? grandTotalCNY / expenses.length : 0,
    longestStreak,
    dateRange: {
      start: days[0] || '',
      end: days[days.length - 1] || '',
    },
    weekdaySpend,
    weekdaySpendCNY,
    paymentMethods,
    paymentMethodsCNY,
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
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
}

export interface AccommodationEntry {
  date: string;
  merchant: string;
  amountCNY: number;
  amountUSD: number;
  city: string;
}

export function parseAccommodations(csv: string): AccommodationEntry[] {
  const lines = csv.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  const dateIdx = headers.indexOf('Date');
  const merchantIdx = headers.indexOf('Merchant');
  const cnyIdx = headers.indexOf('CNY');
  const usdIdx = headers.indexOf('USD');
  const cityIdx = headers.indexOf('City');

  return lines
    .slice(1)
    .map(line => ({
      date: (line.split(',')[dateIdx] || '').trim(),
      merchant: (line.split(',')[merchantIdx] || '').trim(),
      amountCNY: parseFloat((line.split(',')[cnyIdx] || '0').trim()) || 0,
      amountUSD: parseFloat((line.split(',')[usdIdx] || '0').trim()) || 0,
      city: (line.split(',')[cityIdx] || '').trim(),
    }))
    .filter(r => /^\d{4}-\d{2}-\d{2}$/.test(r.date));
}
