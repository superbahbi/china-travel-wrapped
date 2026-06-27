// ============================================================
// China Travel Wrapped — Main Page
// Style: Gradient Feast (Spotify Wrapped × Chinese Travel)
// Dark canvas, vivid gradient cards, animated stats
// ============================================================
import { useState, useEffect, useCallback, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { CSVUpload } from '@/components/CSVUpload';
import { Sun, Moon, Upload as UploadIcon } from 'lucide-react';
import { parseTransactions, computeTripStats, TripStats, formatDate, formatDateFull, getCategoryColor, getCityGradient, CATEGORY_COLORS, parseAccommodations, AccommodationEntry } from '@/lib/csvParser';
import { WrappedCard, StatNumber, CategoryPill, ProgressBar, GlassPanel } from '@/components/WrappedCard';

import { useScrollReveal } from '@/hooks/useScrollReveal';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { MapPin, TrendingUp, Utensils, Hotel, Train, ShoppingBag, Calendar, Zap, Award, DollarSign, ArrowRight, RefreshCw, Map as MapIcon } from 'lucide-react';
import { MapView } from '@/components/Map';

const HERO_BG = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663789310444/gPqDA8oDXYARxj2G8GPSGZ/hero-bg-ZsqqDYb5LYENCn3sc2jL3g.webp';
const LOGO = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663789310444/gPqDA8oDXYARxj2G8GPSGZ/logo-yuan-6cy4BnEm6t85zTyUz2wrCC.webp';

// CSV URLs - using local data folder for better reliability
const TRANSACTIONS_CSV_URL = '/data/transactions.csv';

export default function Home() {
  const [stats, setStats] = useState<TripStats | null>(null);
  const [accommodations, setAccommodations] = useState<AccommodationEntry[]>([]);
  const [csvFilename, setCsvFilename] = useState<string>('');
  const [loadStatus, setLoadStatus] = useState<'idle' | 'loaded' | 'error'>('idle');
  const [autoLoaded, setAutoLoaded] = useState(false);
  const [currency, setCurrency] = useState<'cny' | 'usd'>('usd');
  const { theme, toggleTheme } = useTheme();
  const [showUpload, setShowUpload] = useState(false);

  const formatCurrency = (usd: number, cny: number) => {
    if (currency === 'usd') {
      return `$${Math.abs(usd).toFixed(2)}`;
    }
    return `¥${Math.abs(cny).toFixed(0)}`;
  };

  const convertCurrency = (usd: number, cny: number) => {
    return currency === 'usd' ? Math.abs(usd) : Math.abs(cny);
  };

  const processCSV = useCallback((text: string, filename: string) => {
    console.log('Processing CSV, text length:', text.length);
    const txns = parseTransactions(text);
    console.log('Parsed transactions:', txns.length);
    if (txns.length === 0) {
      console.error('No transactions parsed!');
      setLoadStatus('error');
      return;
    }
    const computed = computeTripStats(txns);
    console.log('Computed stats:', computed);
    setStats(computed);
    setCsvFilename(filename);
    setLoadStatus('loaded');
  }, []);

  // Auto-load from GitHub repo
  const refreshFromGitHub = useCallback(() => {
    setLoadStatus('idle');
    const url = TRANSACTIONS_CSV_URL + '?t=' + Date.now();
    console.log('Fetching CSV from:', url);
    fetch(url)
      .then(r => {
        console.log('CSV fetch response:', r.status, r.ok);
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.text();
      })
      .then(text => {
        console.log('CSV loaded, size:', text.length);
        if (!text || text.trim().length === 0) throw new Error('Empty CSV');
        processCSV(text, 'transactions.csv');
      })
      .catch(err => {
        console.error('Failed to load CSV:', err);
        setLoadStatus('idle');
      });
  }, [processCSV]);

  useEffect(() => {
    if (autoLoaded) return;
    setAutoLoaded(true);
    refreshFromGitHub();
  }, [autoLoaded, refreshFromGitHub]);

  // Load accommodations from local data folder
  useEffect(() => {
    fetch('/data/accommodation.csv?t=' + Date.now())
      .then(r => {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.text();
      })
      .then(text => {
        if (text && text.trim().length > 0) {
          const accom = parseAccommodations(text);
          setAccommodations(accom);
        }
      })
      .catch(err => console.log('Accommodation CSV not found:', err));
  }, []);

  return (
    <div className="min-h-screen" style={{ background: '#0d0d0f' }}>
      {/* Sticky Header with Currency Toggle */}
      <header className="sticky top-0 z-50 backdrop-blur-md" style={{ background: 'rgba(13, 13, 15, 0.8)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div className="container max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={LOGO} alt="Yuan" className="w-6 h-6 rounded-full" />
            <span className="text-sm font-semibold text-white/60">China Wrapped</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowUpload(!showUpload)}
              className="p-2 rounded-full hover:bg-white/10 text-white/60 transition-colors"
              title="Upload CSV"
            >
              <UploadIcon className="w-5 h-5" />
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-white/10 text-white/60 transition-colors"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className="flex bg-white/10 rounded-full p-1 ml-2">
              <button
                onClick={() => setCurrency('usd')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${currency === 'usd' ? 'bg-white text-black shadow-lg' : 'text-white/40 hover:text-white/70'}`}
              >
                USD
              </button>
              <button
                onClick={() => setCurrency('cny')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${currency === 'cny' ? 'bg-white text-black shadow-lg' : 'text-white/40 hover:text-white/70'}`}
              >
                CNY
              </button>
            </div>
          </div>
        </div>
        {showUpload && (
          <div className="container max-w-3xl mx-auto px-4 pb-4 animate-in slide-in-from-top duration-300">
            <CSVUpload 
              onLoad={(text, name) => {
                processCSV(text, name);
                setShowUpload(false);
              }}
              filename={csvFilename}
              status={loadStatus}
              transactionCount={stats?.transactionCount}
            />
          </div>
        )}
      </header>
      {/* ── HERO ── */}
      <header
        className="relative min-h-[70vh] flex flex-col items-center justify-center text-center overflow-hidden"
        style={{
          backgroundImage: `url(${HERO_BG})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(13,13,15,0.3) 0%, rgba(13,13,15,0.7) 70%, rgba(13,13,15,1) 100%)' }} />

        <div className="relative z-10 flex flex-col items-center gap-4 px-4">
          <img src={LOGO} alt="Yuan logo" className="w-16 h-16 rounded-full" />
          <div className="text-white/60 text-xs font-semibold tracking-[0.25em] uppercase font-mono">
            China Overland · 2026
          </div>
          <h1 className="text-white font-bold leading-none" style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(3rem, 10vw, 7rem)', letterSpacing: '-0.03em' }}>
            Travel<br />
            <span style={{ background: 'linear-gradient(135deg, #FF6B6B, #FF8E53)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Wrapped
            </span>
          </h1>
          <p className="text-white/60 text-base max-w-sm" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            A China trip, in numbers — every yuan tracked, every city counted.
          </p>

          {stats && (
            <div className="flex items-center gap-6 mt-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
                  ${stats.grandTotal.toFixed(0)}
                </div>
                <div className="text-xs text-white/50 uppercase tracking-wider">Total Spent</div>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div className="text-center">
                <div className="text-3xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
                  {stats.daysTracked}
                </div>
                <div className="text-xs text-white/50 uppercase tracking-wider">Days</div>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div className="text-center">
                <div className="text-3xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
                  {stats.citiesVisited}
                </div>
                <div className="text-xs text-white/50 uppercase tracking-wider">Cities</div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="container max-w-3xl mx-auto px-4 py-8 space-y-6">



        {!stats && loadStatus === 'idle' && (
          <div className="text-center py-20 text-white/30">
            <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg">Loading travel data...</p>
          </div>
        )}

        {stats && (
          <>
            {/* ── CARD 1: Total Spent ── */}
            <WrappedCard gradient="linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)">
              <div className="p-8 text-white">
                <div className="text-sm font-semibold tracking-widest uppercase opacity-70 mb-2">They've spent</div>
                <div className="flex items-end gap-3 mb-1">
                  <div className="text-7xl sm:text-8xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
                    {formatCurrency(stats.grandTotal, stats.grandTotalCNY)}
                  </div>
                </div>
                <div className="text-white/70 text-lg mb-6">
                  That's <span className="font-bold text-white">${stats.grandTotal.toFixed(0)}</span> spent across {stats.daysTracked} days of travel
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <GlassPanel>
                    <div className="text-2xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>${stats.dailyAverage.toFixed(0)}</div>
                    <div className="text-xs opacity-70 mt-1">per day</div>
                  </GlassPanel>
                  <GlassPanel>
                    <div className="text-2xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>{stats.transactionCount}</div>
                    <div className="text-xs opacity-70 mt-1">transactions</div>
                  </GlassPanel>
                  <GlassPanel>
                    <div className="text-2xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>{currency === 'usd' ? '$' : '¥'}{stats.avgTransactionSize.toFixed(0)}</div>
                    <div className="text-xs opacity-70 mt-1">avg per txn</div>
                  </GlassPanel>
                </div>
              </div>
            </WrappedCard>

            {/* ── CARD 2: Daily Burn Chart ── */}
            <WrappedCard gradient="linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)">
              <div className="p-8 text-white">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-5 h-5 text-[#FF6B6B]" />
                  <div className="text-sm font-semibold tracking-widest uppercase opacity-70">Daily Burn Rate</div>
                </div>
                <div className="text-3xl font-bold mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>
                  {currency === 'usd' ? '$' : '¥'}{stats.mostExpensiveDay?.total.toFixed(0)} peak
                </div>
                <div className="text-white/50 text-sm mb-6">
                  on {formatDate(stats.mostExpensiveDay?.date || '')} · their biggest spending day
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={stats.dayStats.map(d => ({ date: formatDate(d.date), total: d.total, city: d.cities[0] || 'Trip' }))}>
                    <defs>
                      <linearGradient id="burnGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF6B6B" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#FF6B6B" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{ background: 'rgba(13,13,15,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff' }}
                      formatter={(v: number) => [`${currency === 'usd' ? '$' : '¥'}${v.toFixed(2)}`, 'Spent']}
                    />
                    <Area type="monotone" dataKey="total" stroke="#FF6B6B" strokeWidth={2.5} fill="url(#burnGrad)" dot={{ fill: '#FF6B6B', r: 3, strokeWidth: 0 }} />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="flex items-center justify-between mt-4 text-sm">
                  <span className="text-white/50">Lightest day: <span className="text-white font-semibold">{currency === 'usd' ? '$' : '¥'}{stats.cheapestDay?.total.toFixed(2)}</span> on {formatDate(stats.cheapestDay?.date || '')}</span>
                </div>
              </div>
            </WrappedCard>

            {/* ── CARD 3: Top Category ── */}
            <WrappedCard gradient={`linear-gradient(135deg, ${getCategoryColor(stats.topCategory?.category || 'Food')}cc 0%, ${getCategoryColor(stats.topCategory?.category || 'Food')}44 100%)`}>
              <div className="p-8 text-white">
                <div className="text-sm font-semibold tracking-widest uppercase opacity-70 mb-2">Their #1 spend</div>
                <div className="text-6xl font-bold mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
                  {stats.topCategory?.category}
                </div>
                <div className="text-white/70 text-lg mb-6">
                  <span className="font-bold text-white">{currency === 'usd' ? '$' : '¥'}{stats.topCategory?.total.toFixed(0)}</span> — {stats.topCategory?.percentage.toFixed(0)}% of their total budget
                </div>
                <div className="space-y-3">
                  {stats.categoryStats.slice(0, 6).map((cat) => (
                    <div key={cat.category}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{cat.category}</span>
                        <span className="mono text-white/70">{currency === 'usd' ? '$' : '¥'}{cat.total.toFixed(0)}</span>
                      </div>
                      <ProgressBar
                        value={cat.percentage}
                        color={cat.color}
                        active
                        height={6}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </WrappedCard>

            {/* ── CARD 4: Category Donut ── */}
            <WrappedCard gradient="linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)">
              <div className="p-8 text-white">
                <div className="flex items-center gap-2 mb-6">
                  <ShoppingBag className="w-5 h-5 text-[#f7971e]" />
                  <div className="text-sm font-semibold tracking-widest uppercase opacity-70">Where It Went</div>
                </div>
                <div className="flex gap-6 items-center">
                  <div className="flex-shrink-0">
                    <PieChart width={180} height={180}>
                      <Pie
                        data={stats.categoryStats}
                        cx={90}
                        cy={90}
                        innerRadius={55}
                        outerRadius={85}
                        dataKey="total"
                        strokeWidth={2}
                        stroke="#0d0d0f"
                      >
                        {stats.categoryStats.map((cat) => (
                          <Cell key={cat.category} fill={cat.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ background: 'rgba(13,13,15,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff' }}
                        formatter={(v: number) => [`${currency === 'usd' ? '$' : '¥'}${v.toFixed(2)}`, '']}
                      />
                    </PieChart>
                  </div>
                  <div className="flex-1 space-y-2">
                    {stats.categoryStats.map((cat) => (
                      <div key={cat.category} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                          <span className="text-sm text-white/80">{cat.category}</span>
                        </div>
                        <span className="text-sm mono text-white/60">{cat.percentage.toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </WrappedCard>

            {/* ── CARD 5: Journey Map ── */}
            <WrappedCard gradient="linear-gradient(135deg, #0d1b2a 0%, #1b263b 100%)">
              <div className="p-8 text-white">
                <div className="flex items-center gap-2 mb-6">
                  <MapIcon className="w-5 h-5 text-[#38ef7d]" />
                  <div className="text-sm font-semibold tracking-widest uppercase opacity-70">Journey Map</div>
                </div>
                <div className="rounded-2xl overflow-hidden border border-white/10 h-[300px]">
                  <MapView 
                    className="h-full w-full"
                    initialCenter={{ lat: 22.5431, lng: 114.0579 }} // Starting in Shenzhen
                    initialZoom={5}
                  />
                </div>
                <div className="mt-4 text-xs text-white/40 text-center italic">
                  Visualizing your route across China
                </div>
              </div>
            </WrappedCard>

            {/* ── CARD 6: Your Route Timeline ── */}
            <CityRouteCard stats={stats} />

            {/* ── CARD 5: Cities ── */}
            <WrappedCard gradient="linear-gradient(135deg, #11998e 0%, #38ef7d 100%)">
              <div className="p-8 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-5 h-5 text-white/70" />
                  <div className="text-sm font-semibold tracking-widest uppercase opacity-70">Cities Conquered</div>
                </div>
                <div className="text-7xl font-bold mb-6" style={{ fontFamily: 'Syne, sans-serif' }}>
                  {stats.citiesVisited}
                </div>
                <div className="space-y-3">
                  {stats.cityStats.map((city, i) => {
                    const maxTotal = stats.cityStats[0]?.total || 1;
                    return (
                      <div key={city.city} className="flex items-center gap-3">
                        <div className="text-sm font-bold w-5 text-white/50">{i + 1}</div>
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="font-semibold text-sm">{city.city}</span>
                            <span className="mono text-sm text-white/70">{currency === 'usd' ? '$' : '¥'}{city.total.toFixed(0)}</span>
                          </div>
                          <ProgressBar
                            value={(city.total / maxTotal) * 100}
                            color="rgba(255,255,255,0.9)"
                            active
                            height={5}
                          />
                          <div className="text-xs text-white/50 mt-1">{city.days} days · {currency === 'usd' ? '$' : '¥'}{city.avgPerDay.toFixed(0)}/day</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </WrappedCard>

            {/* ── CARD 6: Food Stats ── */}
            <WrappedCard gradient="linear-gradient(135deg, #FF6B6B 0%, #b91d73 100%)">
              <div className="p-8 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Utensils className="w-5 h-5 text-white/70" />
                  <div className="text-sm font-semibold tracking-widest uppercase opacity-70">They ate well</div>
                </div>
                <div className="text-7xl font-bold mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
                  {currency === 'usd' ? '$' : '¥'}{stats.foodTotal.toFixed(0)}
                </div>
                <div className="text-white/70 text-lg mb-6">
                  spent on food — that's <span className="font-bold text-white">{currency === 'usd' ? '$' : '¥'}{(stats.foodTotal / stats.daysTracked).toFixed(2)}/day</span> on average
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <GlassPanel>
                    <div className="text-2xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>
                      {stats.categoryStats.find(c => c.category === 'Food')?.count || 0}
                    </div>
                    <div className="text-xs opacity-70 mt-1">meals logged</div>
                  </GlassPanel>
                  <GlassPanel>
                    <div className="text-2xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>
                      {currency === 'usd' ? '$' : '¥'}{stats.categoryStats.find(c => c.category === 'Food')
                        ? (stats.foodTotal / (stats.categoryStats.find(c => c.category === 'Food')?.count || 1)).toFixed(1)
                        : '0'}
                    </div>
                    <div className="text-xs opacity-70 mt-1">avg per meal</div>
                  </GlassPanel>
                </div>
              </div>
            </WrappedCard>

            {/* ── CARD 7: Accommodation ── */}
            <WrappedCard gradient="linear-gradient(135deg, #8360c3 0%, #2ebf91 100%)">
              <div className="p-8 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Hotel className="w-5 h-5 text-white/70" />
                  <div className="text-sm font-semibold tracking-widest uppercase opacity-70">Beds & Hostels</div>
                </div>
                <div className="text-7xl font-bold mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
                  {currency === 'usd' ? '$' : '¥'}{stats.accommodationTotal.toFixed(0)}
                </div>
                <div className="text-white/70 text-lg mb-6">
                  on accommodation · <span className="font-bold text-white">{stats.categoryStats.find(c => c.category === 'Accommodation')?.count || 0} stays</span>
                </div>
                <div className="space-y-2">
                  {stats.transactions
                    .filter(t => t.category === 'Accommodation' && t.usd < 0)
                    .sort((a, b) => Math.abs(b.usd) - Math.abs(a.usd))
                    .slice(0, 5)
                    .map((t, i) => (
                      <div key={i} className="flex justify-between items-center py-2 border-b border-white/10">
                        <div>
                          <div className="text-sm font-semibold">{t.merchant}</div>
                          <div className="text-xs text-white/50">{t.city} · {formatDate(t.date)}</div>
                        </div>
                        <div className="mono text-sm font-bold">{currency === "usd" ? `$${Math.abs(t.usd).toFixed(2)}` : `¥${Math.abs(t.cny).toFixed(0)}`}</div>
                      </div>
                    ))}
                </div>
              </div>
            </WrappedCard>

            {/* ── CARD 8: Transport ── */}
            <WrappedCard gradient="linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)">
              <div className="p-8 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Train className="w-5 h-5 text-white/70" />
                  <div className="text-sm font-semibold tracking-widest uppercase opacity-70">Getting Around</div>
                </div>
                <div className="text-7xl font-bold mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
                  {currency === 'usd' ? '$' : '¥'}{stats.transportTotal.toFixed(0)}
                </div>
                <div className="text-white/70 text-lg mb-6">
                  on transport — trains, metros, bikes
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <GlassPanel>
                    <div className="text-2xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>
                      {currency === 'usd' ? '$' : '¥'}{(stats.categoryStats.find(c => c.category === 'Intercity Transport')?.total || 0).toFixed(0)}
                    </div>
                    <div className="text-xs opacity-70 mt-1">intercity trains</div>
                  </GlassPanel>
                  <GlassPanel>
                    <div className="text-2xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>
                      {currency === 'usd' ? '$' : '¥'}{(stats.categoryStats.find(c => c.category === 'Transport')?.total || 0).toFixed(0)}
                    </div>
                    <div className="text-xs opacity-70 mt-1">local transport</div>
                  </GlassPanel>
                </div>
              </div>
            </WrappedCard>

            {/* ── CARD 9: Biggest Purchase ── */}
            {stats.biggestPurchase && (
              <WrappedCard gradient="linear-gradient(135deg, #f7971e 0%, #ffd200 100%)">
                <div className="p-8 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-5 h-5 text-white/70" />
                    <div className="text-sm font-semibold tracking-widest uppercase opacity-70">Biggest splurge</div>
                  </div>
                  <div className="text-7xl font-bold mb-2" style={{ fontFamily: 'Syne, sans-serif', color: '#1a1a1a' }}>
                    {currency === 'usd' ? '$' : '¥'}{Math.abs(stats.biggestPurchase.usd).toFixed(0)}
                  </div>
                  <div className="text-black/60 text-lg mb-4">
                    <span className="font-bold text-black">{stats.biggestPurchase.merchant}</span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <CategoryPill label={stats.biggestPurchase.category} color="#1a1a1a" />
                    <CategoryPill label={stats.biggestPurchase.city} color="#1a1a1a" />
                    <CategoryPill label={formatDate(stats.biggestPurchase.date)} color="#1a1a1a" />
                  </div>
                </div>
              </WrappedCard>
            )}

            {/* ── CARD 10: Top Merchant ── */}
            {stats.topMerchant && (
              <WrappedCard gradient="linear-gradient(135deg, #f953c6 0%, #b91d73 100%)">
                <div className="p-8 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-white/70" />
                    <div className="text-sm font-semibold tracking-widest uppercase opacity-70">Your go-to spot</div>
                  </div>
                  <div className="text-5xl font-bold mb-2 leading-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
                    {stats.topMerchant.name}
                  </div>
                  <div className="text-white/70 text-lg mb-6">
                    They went back <span className="font-bold text-white">{stats.topMerchant.count} times</span> — spending {currency === 'usd' ? '$' : '¥'}{stats.topMerchant.total.toFixed(2)} total
                  </div>
                </div>
              </WrappedCard>
            )}

            {/* ── CARD 11: City Route ── */}
            <CityRouteCard stats={stats} />

            {/* ── CARD 12: Weekday Spending ── */}
            <WrappedCard gradient="linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)">
              <div className="p-8 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-[#8360c3]" />
                  <div className="text-sm font-semibold tracking-widest uppercase opacity-70">Day of the Week</div>
                </div>
                <div className="text-white/70 text-sm mb-6">Which days cost you the most?</div>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => ({ day: d, total: stats.weekdaySpend[d] || 0 }))}>
                    <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{ background: 'rgba(13,13,15,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff' }}
                      formatter={(v: number) => [`${currency === 'usd' ? '$' : '¥'}${v.toFixed(2)}`, 'Total']}
                    />
                    <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                      {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d, i) => (
                        <Cell key={d} fill={`hsl(${i * 51}, 80%, 65%)`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </WrappedCard>

            {/* ── CARD 12: Activities ── */}
            {stats.categoryStats.find(c => c.category === 'Activities') && (
              <WrappedCard gradient="linear-gradient(135deg, #f953c6 0%, #8360c3 100%)">
                <div className="p-8 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-white/70" />
                    <div className="text-sm font-semibold tracking-widest uppercase opacity-70">Adventures</div>
                  </div>
                  <div className="text-7xl font-bold mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
                    {currency === 'usd' ? '$' : '¥'}{(stats.categoryStats.find(c => c.category === 'Activities')?.total || 0).toFixed(0)}
                  </div>
                  <div className="text-white/70 text-lg mb-6">
                    on activities · <span className="font-bold text-white">{stats.categoryStats.find(c => c.category === 'Activities')?.count || 0} experiences</span>
                  </div>
                  <div className="space-y-2">
                    {stats.transactions
                      .filter(t => t.category === 'Activities' && t.usd < 0)
                      .sort((a, b) => Math.abs(b.usd) - Math.abs(a.usd))
                      .slice(0, 5)
                      .map((t, i) => (
                        <div key={i} className="flex justify-between items-center py-2 border-b border-white/10">
                          <div>
                            <div className="text-sm font-semibold">{t.merchant}</div>
                            <div className="text-xs text-white/50">{t.city} · {formatDate(t.date)}</div>
                          </div>
                          <div className="mono text-sm font-bold">{currency === 'usd' ? '$' : '¥'}{Math.abs(t.usd).toFixed(2)}</div>
                        </div>
                      ))}
                  </div>
                </div>
              </WrappedCard>
            )}

            {/* ── CARD 13: Pace Tracker ── */}
            <PaceTrackerCard stats={stats} />

            {/* ── CARD 14: Trip Highlights Grid ── */}
            <div className="grid grid-cols-2 gap-4">
              <HighlightMiniCard
                gradient="linear-gradient(135deg, #11998e 0%, #38ef7d 100%)"
                label="Streak"
                value={`${stats.longestStreak} days`}
                sub="consecutive spending"
                delay={0}
              />
              <HighlightMiniCard
                gradient="linear-gradient(135deg, #f7971e 0%, #ffd200 100%)"
                label="Trip-wide"
                value={`${currency === 'usd' ? '$' : '¥'}${stats.tripWideTotal.toFixed(0)}`}
                sub="SIM, VPN, rail"
                delay={100}
                dark
              />
              <HighlightMiniCard
                gradient="linear-gradient(135deg, #8360c3 0%, #2ebf91 100%)"
                label="Cheapest Day"
                value={`${currency === 'usd' ? '$' : '¥'}${stats.cheapestDay?.total.toFixed(2)}`}
                sub={formatDate(stats.cheapestDay?.date || '')}
                delay={200}
              />
              <HighlightMiniCard
                gradient="linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)"
                label="Most Active"
                value={stats.mostVisitedCity?.city || '—'}
                sub={`${stats.mostVisitedCity?.days} days`}
                delay={300}
              />
            </div>

            {/* ── CARD 13: Payment Methods ── */}
            <WrappedCard gradient="linear-gradient(135deg, #0f0c29 0%, #302b63 100%)">
              <div className="p-8 text-white">
                <div className="text-sm font-semibold tracking-widest uppercase opacity-70 mb-6">How You Paid</div>
                <div className="space-y-3">
                  {Object.entries(stats.paymentMethods)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 6)
                    .map(([method, amount]) => {
                      const pct = (amount / stats.grandTotal) * 100;
                      return (
                        <div key={method}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium">{method}</span>
                            <span className="mono text-white/60">{currency === 'usd' ? '$' : '¥'}{amount.toFixed(0)} · {pct.toFixed(0)}%</span>
                          </div>
                          <ProgressBar value={pct} color="#8360c3" active height={5} />
                        </div>
                      );
                    })}
                </div>
              </div>
            </WrappedCard>

            {/* ── CARD 14: Daily Log Table ── */}
            <DailyLogCard stats={stats} currency={currency} />

            {/* ── CARD 15: Accommodation Daily ── */}
            {accommodations.length > 0 && (
              <WrappedCard gradient="linear-gradient(135deg, #8360c3 0%, #2ebf91 100%)">
                <div className="p-8 text-white">
                  <div className="flex items-center gap-2 mb-6">
                    <Hotel className="w-5 h-5" />
                    <div className="text-sm font-semibold tracking-widest uppercase opacity-70">Where You Slept</div>
                  </div>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {accommodations.map((acc, i) => (
                      <div key={i} className="flex justify-between items-center py-2 border-b border-white/10">
                        <div>
                          <div className="text-sm font-medium text-white">{acc.merchant}</div>
                          <div className="text-xs text-white/50">{formatDateFull(acc.date)} · {acc.city}</div>
                        </div>
                        <div className="text-sm mono font-bold text-white/80">
                          {formatCurrency(acc.amountUSD, acc.amountCNY)}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-4 border-t border-white/20">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Total Accommodations</span>
                      <span className="font-bold">
                        {formatCurrency(
                          accommodations.reduce((s, a) => s + a.amountUSD, 0),
                          accommodations.reduce((s, a) => s + a.amountCNY, 0)
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm mt-2">
                      <span className="text-white/60">Average per night</span>
                      <span className="font-bold">
                        {formatCurrency(
                          accommodations.reduce((s, a) => s + a.amountUSD, 0) / accommodations.length,
                          accommodations.reduce((s, a) => s + a.amountCNY, 0) / accommodations.length
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </WrappedCard>
            )}

            {/* ── Footer ── */}
            <div className="text-center py-8 text-white/30 text-sm">
              <div className="text-2xl mb-2">元</div>
              <div>China Overland · {stats.dateRange.start} → {stats.dateRange.end}</div>
              </div>
          </>
        )}
      </main>
    </div>
  );
}

// Mini highlight card
function HighlightMiniCard({ gradient, label, value, sub, delay = 0, dark = false }: {
  gradient: string; label: string; value: string; sub: string; delay?: number; dark?: boolean;
}) {
  const { ref, visible } = useScrollReveal();
  return (
    <div
      ref={ref}
      className={`reveal rounded-2xl p-5 text-white ${visible ? 'visible' : ''}`}
      style={{ background: gradient, transitionDelay: `${delay}ms` }}
    >
      <div className={`text-xs font-semibold tracking-widest uppercase mb-2 ${dark ? 'text-black/50' : 'text-white/60'}`}>{label}</div>
      <div className={`text-2xl font-bold leading-tight ${dark ? 'text-black' : 'text-white'}`} style={{ fontFamily: 'Syne, sans-serif' }}>{value}</div>
      <div className={`text-xs mt-1 ${dark ? 'text-black/50' : 'text-white/50'}`}>{sub}</div>
    </div>
  );
}

// Pace tracker card — shows spending velocity over time
function PaceTrackerCard({ stats }: { stats: TripStats }) {
  const { ref, visible } = useScrollReveal();
  // Running total by day
  let running = 0;
  const runningData = stats.dayStats.map(d => {
    running += d.total;
    return { date: formatDate(d.date), running, daily: d.total };
  });

  // Projected total if pace continues
  const avgPerDay = stats.dailyAverage;
  const daysElapsed = stats.daysTracked;
  const projectedMonthly = avgPerDay * 30;

  return (
    <div
      ref={ref}
      className={`reveal rounded-3xl overflow-hidden p-8 text-white ${visible ? 'visible' : ''}`}
      style={{ background: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)', transitionDelay: '0ms' }}
    >
      <div className="text-sm font-semibold tracking-widest uppercase text-white/50 mb-2">Spending Pace</div>
      <div className="flex items-end gap-4 mb-6">
        <div>
          <div className="text-5xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>${avgPerDay.toFixed(0)}<span className="text-2xl text-white/50">/day</span></div>
          <div className="text-white/50 text-sm mt-1">At this pace: <span className="text-white font-semibold">${projectedMonthly.toFixed(0)}/month</span></div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <AreaChart data={runningData}>
          <defs>
            <linearGradient id="paceGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6dd5ed" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#6dd5ed" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
          <YAxis hide />
          <Tooltip
            contentStyle={{ background: 'rgba(13,13,15,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff' }}
            formatter={(v: number, name: string) => [`$${v.toFixed(2)}`, name === 'running' ? 'Running Total' : 'Daily']}
          />
          <Area type="monotone" dataKey="running" stroke="#6dd5ed" strokeWidth={2.5} fill="url(#paceGrad)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-3 gap-3 mt-4">
        <div className="glass rounded-xl p-3 text-center">
          <div className="text-lg font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>{daysElapsed}</div>
          <div className="text-xs text-white/50">days tracked</div>
        </div>
        <div className="glass rounded-xl p-3 text-center">
          <div className="text-lg font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>${stats.grandTotal.toFixed(0)}</div>
          <div className="text-xs text-white/50">total so far</div>
        </div>
        <div className="glass rounded-xl p-3 text-center">
          <div className="text-lg font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>${(stats.grandTotal / daysElapsed * 7).toFixed(0)}</div>
          <div className="text-xs text-white/50">weekly rate</div>
        </div>
      </div>
    </div>
  );
}

// City route timeline card
function CityRouteCard({ stats }: { stats: TripStats }) {
  const { ref, visible } = useScrollReveal();
  // Build city journey in chronological order
  const cityJourney: { city: string; date: string; days: number }[] = [];
  let lastCity = '';
  let startDate = '';
  let dayCount = 0;
  stats.dayStats.forEach((day) => {
    const city = day.cities[0] || 'Trip-wide';
    if (city !== lastCity) {
      if (lastCity) cityJourney.push({ city: lastCity, date: startDate, days: dayCount });
      lastCity = city;
      startDate = day.date;
      dayCount = 1;
    } else {
      dayCount++;
    }
  });
  if (lastCity) cityJourney.push({ city: lastCity, date: startDate, days: dayCount });

  return (
    <div
      ref={ref}
      className={`reveal rounded-3xl overflow-hidden p-8 text-white ${visible ? 'visible' : ''}`}
      style={{ background: 'linear-gradient(135deg, #1a0533 0%, #0d1b2a 100%)', border: '1px solid rgba(255,255,255,0.08)', transitionDelay: '0ms' }}
    >
      <div className="text-sm font-semibold tracking-widest uppercase text-white/50 mb-2">Your Route</div>
      <div className="text-3xl font-bold mb-6" style={{ fontFamily: 'Syne, sans-serif' }}>
        {cityJourney.map(c => c.city).join(' → ')}
      </div>
      <div className="flex flex-wrap gap-3">
        {cityJourney.filter(c => c.city !== 'Trip-wide').map((stop, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className="rounded-xl px-4 py-3 text-white"
              style={{ background: getCityGradient(stop.city) }}
            >
              <div className="text-sm font-bold">{stop.city}</div>
              <div className="text-xs opacity-70">{stop.days}d · {formatDate(stop.date)}</div>
            </div>
            {i < cityJourney.filter(c => c.city !== 'Trip-wide').length - 1 && (
              <ArrowRight className="w-4 h-4 text-white/30 flex-shrink-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Daily log expandable card
function DailyLogCard({ stats, currency }: { stats: TripStats; currency: 'cny' | 'usd' }) {
  const { ref, visible } = useScrollReveal();
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div
      ref={ref}
      className={`reveal rounded-3xl overflow-hidden ${visible ? 'visible' : ''}`}
      style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #0d0d0f 100%)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <div className="p-6 pb-4">
        <div className="text-sm font-semibold tracking-widest uppercase text-white/50 mb-1">Daily Log</div>
        <div className="text-2xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>Every day, every yuan</div>
      </div>
      <div className="divide-y divide-white/5">
        {stats.dayStats.slice().reverse().map((day) => (
          <div key={day.date}>
            <button
              className="w-full flex items-center justify-between px-6 py-3 hover:bg-white/5 transition-colors text-left"
              onClick={() => setExpanded(expanded === day.date ? null : day.date)}
            >
              <div className="flex items-center gap-3">
                <span className="text-white/30 text-xs mono">{formatDateFull(day.date)}</span>
                {day.cities.length > 0 && (
                  <span className="text-xs text-white/50 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />{day.cities.join(' → ')}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <CategoryPill label={day.topCategory} color={getCategoryColor(day.topCategory)} size="sm" />
                <span className="mono text-sm font-bold text-white">${day.total.toFixed(2)}</span>
                <ArrowRight className={`w-4 h-4 text-white/30 transition-transform ${expanded === day.date ? 'rotate-90' : ''}`} />
              </div>
            </button>
            {expanded === day.date && (
              <div className="px-6 pb-3 space-y-1.5 bg-white/3">
                {day.transactions.filter(t => t.usd < 0).map((t, i) => (
                  <div key={i} className="flex justify-between items-center py-1.5 border-b border-white/5">
                    <div>
                      <span className="text-sm text-white/80">{t.merchant}</span>
                      <span className="text-xs text-white/30 ml-2">{t.category}</span>
                    </div>
                    <span className="mono text-sm text-white/60">{currency === "usd" ? `$${Math.abs(t.usd).toFixed(2)}` : `¥${Math.abs(t.cny).toFixed(0)}`}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
