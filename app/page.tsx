'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  addExpense,
  addTransaction,
  getDashboardStats,
  getWeeklyStats,
  listEmployees,
  listUnpaidTransactions,
  payWage,
  updateTransactionStatus
} from './actions';
import {
  Calculator,
  Coins,
  DollarSign,
  Save,
  Users,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  ChevronDown,
  Shirt,
  Droplets,
  Wind,
  PartyPopper
} from 'lucide-react';

const SERVICE_RATES: Record<string, number> = {
  'Cuci + Setrika': 5000,
  'Cuci Saja': 3000,
  'Setrika Saja': 3000,
};

const fmtIDR = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 });

type Employee = { id: string; name: string; wage_per_kg: number; };
type UnpaidTx = { id: string; created_at: string; customer_name: string; service_type: string; weight_kg: number; total_price: number; status: string; };

export default function Page() {
  const [stats, setStats] = useState<{ cashToday: number; incomeToday: number; expenseToday: number }>({ cashToday: 0, incomeToday: 0, expenseToday: 0 });
  const [weeklyStats, setWeeklyStats] = useState<{ incomeWeek: number; expenseWeek: number; cashWeek: number }>({ incomeWeek: 0, expenseWeek: 0, cashWeek: 0 });
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [unpaid, setUnpaid] = useState<UnpaidTx[]>([]);
  const [loading, setLoading] = useState(true);

  const [txCustomer, setTxCustomer] = useState('');
  const [txService, setTxService] = useState<keyof typeof SERVICE_RATES>('Cuci + Setrika');
  const [txWeight, setTxWeight] = useState<number>(0);
  const [txStatus, setTxStatus] = useState<'Lunas' | 'Belum Lunas'>('Belum Lunas');

  const [expCategory, setExpCategory] = useState('');
  const [expAmount, setExpAmount] = useState<number>(0);
  const [expDesc, setExpDesc] = useState('');

  const [wageEmpId, setWageEmpId] = useState<string>('');
  const [wageWeight, setWageWeight] = useState<number>(0);

  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const txRate = SERVICE_RATES[txService] ?? 6000;
  const txTotal = useMemo(() => Math.max(0, Math.round((txWeight || 0) * txRate)), [txWeight, txRate]);

  const selectedEmp = employees.find(e => e.id === wageEmpId);
  const wageTotal = useMemo(() => {
    const rate = selectedEmp?.wage_per_kg ?? 0;
    return Math.max(0, Math.round((wageWeight || 0) * rate));
  }, [selectedEmp, wageWeight]);

  const [todayStr, setTodayStr] = useState<string>('');

  async function refreshAll() {
    const [s, ws, emps, up] = await Promise.all([
      getDashboardStats(),
      getWeeklyStats(),
      listEmployees(),
      listUnpaidTransactions(),
    ]);
    setStats(s);
    setWeeklyStats(ws);
    setEmployees(emps);
    setUnpaid(up);
  }

  useEffect(() => {
    setTodayStr(new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));

    (async () => {
      try {
        await refreshAll();
      } catch (e: any) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function showSuccessToast(message: string) {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  }

  async function onSubmitTransaction(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      await addTransaction(new FormData(e.currentTarget));
      setTxCustomer(''); setTxWeight(0); setTxStatus('Belum Lunas'); setTxService('Cuci + Setrika');
      await refreshAll();
      showSuccessToast('Pesanan berhasil disimpan! 🎉');
    } catch (e: any) {
      alert(e.message ?? 'Gagal simpan pesanan.');
    }
  }

  async function onSubmitExpense(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      await addExpense(new FormData(e.currentTarget));
      setExpCategory(''); setExpAmount(0); setExpDesc('');
      await refreshAll();
      showSuccessToast('Pengeluaran tercatat! 💰');
    } catch (e: any) {
      alert(e.message ?? 'Gagal simpan pengeluaran.');
    }
  }

  async function onSubmitWage(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      await payWage(new FormData(e.currentTarget));
      setWageEmpId(''); setWageWeight(0);
      await refreshAll();
      showSuccessToast('Gaji berhasil dibayarkan! 💵');
    } catch (e: any) {
      alert(e.message ?? 'Gagal bayar gaji.');
    }
  }

  return (
    <main className="min-h-screen p-4 md:p-8">
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3">
            <PartyPopper className="w-6 h-6" />
            <span className="font-semibold">{successMessage}</span>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-2">
            <span className="text-4xl float-animation">🧺</span>
            <h1 className="text-3xl md:text-4xl font-extrabold gradient-text">Selamat Datang!</h1>
            <span className="text-4xl float-animation" style={{ animationDelay: '0.5s' }}>✨</span>
          </div>
          <p className="text-gray-600 flex items-center justify-center gap-2">
            <Clock className="w-4 h-4" />
            {todayStr}
          </p>
        </div>

        {/* Stats Cards - Weekly */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-gray-700 mb-3 flex items-center gap-2">
            <span className="text-xl">📅</span> Ringkasan Minggu Ini
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="Pemasukan Minggu Ini"
              value={fmtIDR.format(weeklyStats.incomeWeek)}
              icon={<TrendingUp className="w-6 h-6" />}
              gradient="from-emerald-400 to-green-500"
              emoji="💵"
            />
            <StatCard
              title="Pengeluaran Minggu Ini"
              value={fmtIDR.format(weeklyStats.expenseWeek)}
              icon={<TrendingDown className="w-6 h-6" />}
              gradient="from-rose-400 to-pink-500"
              emoji="💸"
            />
            <StatCard
              title="Kas Bersih Minggu Ini"
              value={fmtIDR.format(weeklyStats.cashWeek)}
              icon={<Coins className="w-6 h-6" />}
              gradient="from-amber-400 to-orange-500"
              emoji="🏆"
            />
          </div>
        </section>

        {/* Today Stats */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-gray-700 mb-3 flex items-center gap-2">
            <span className="text-xl">📊</span> Hari Ini
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl p-4 border-2 border-blue-300">
              <div className="flex items-center gap-2 text-blue-700 mb-2">
                <DollarSign className="w-5 h-5" />
                <span className="font-semibold text-sm">Pemasukan Hari Ini</span>
              </div>
              <div className="text-2xl font-extrabold text-blue-800">{fmtIDR.format(stats.incomeToday)}</div>
            </div>
            <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl p-4 border-2 border-purple-300">
              <div className="flex items-center gap-2 text-purple-700 mb-2">
                <Coins className="w-5 h-5" />
                <span className="font-semibold text-sm">Pengeluaran Hari Ini</span>
              </div>
              <div className="text-2xl font-extrabold text-purple-800">{fmtIDR.format(stats.expenseToday)}</div>
            </div>
          </div>
        </section>

        {/* Forms Section */}
        <section className="space-y-4">
          {/* Transaction Form */}
          <details className="glass rounded-2xl shadow-lg overflow-hidden card-cute" open>
            <summary className="cursor-pointer p-5 flex items-center justify-between hover:bg-pink-50/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-rose-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Shirt className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">Catat Pesanan Baru</h3>
                  <p className="text-sm text-gray-500">Tambah pesanan laundry baru</p>
                </div>
              </div>
              <ChevronDown className="w-5 h-5 text-gray-400 transition-transform chevron-icon" />
            </summary>
            <form onSubmit={onSubmitTransaction} className="p-5 pt-0 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <span>👤</span> Nama Pelanggan
                  </span>
                  <input
                    required
                    name="customer_name"
                    value={txCustomer}
                    onChange={e => setTxCustomer(e.target.value)}
                    className="px-4 py-3 rounded-xl border-2 text-lg focus:border-pink-400 transition-colors"
                    placeholder="Contoh: Bu Rina"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <span>🧴</span> Jenis Layanan
                  </span>
                  <select
                    name="service_type"
                    value={txService}
                    onChange={e => setTxService(e.target.value as any)}
                    className="px-4 py-3 rounded-xl border-2 text-lg"
                  >
                    {Object.keys(SERVICE_RATES).map(k => (
                      <option key={k} value={k}>
                        {k === 'Cuci + Setrika' ? '🧺 ' : k === 'Cuci Saja' ? '💧 ' : '👔 '}
                        {k} (Rp {SERVICE_RATES[k as keyof typeof SERVICE_RATES].toLocaleString('id-ID')}/kg)
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <span>⚖️</span> Berat (kg)
                  </span>
                  <input
                    required
                    name="weight_kg"
                    type="number"
                    step="0.1"
                    min="0"
                    value={txWeight || ''}
                    onChange={e => setTxWeight(Number(e.target.value))}
                    className="px-4 py-3 rounded-xl border-2 text-lg"
                    placeholder="Contoh: 3.5"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <span>📋</span> Status Pembayaran
                  </span>
                  <select
                    name="status"
                    value={txStatus}
                    onChange={e => setTxStatus(e.target.value as any)}
                    className="px-4 py-3 rounded-xl border-2 text-lg"
                  >
                    <option value="Belum Lunas">⏳ Belum Lunas</option>
                    <option value="Lunas">✅ Lunas</option>
                  </select>
                </label>
              </div>

              <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-xl p-4 flex items-center justify-between border-2 border-pink-200">
                <div className="text-gray-700 font-semibold flex items-center gap-2">
                  <span className="text-xl">💰</span> Total Harga
                </div>
                <div className="text-3xl font-extrabold gradient-text">{fmtIDR.format(txTotal)}</div>
              </div>

              <button
                type="submit"
                className="btn-cute w-full inline-flex items-center justify-center gap-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-6 py-4 rounded-xl text-lg font-bold"
              >
                <Save className="w-5 h-5" />
                Simpan Pesanan ✨
              </button>
            </form>
          </details>

          {/* Expense Form */}
          <details className="glass rounded-2xl shadow-lg overflow-hidden card-cute">
            <summary className="cursor-pointer p-5 flex items-center justify-between hover:bg-green-50/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Coins className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">Catat Pengeluaran</h3>
                  <p className="text-sm text-gray-500">Tambah pengeluaran operasional</p>
                </div>
              </div>
              <ChevronDown className="w-5 h-5 text-gray-400 transition-transform chevron-icon" />
            </summary>
            <form onSubmit={onSubmitExpense} className="p-5 pt-0 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <span>📁</span> Kategori
                  </span>
                  <input
                    required
                    name="category"
                    value={expCategory}
                    onChange={e => setExpCategory(e.target.value)}
                    className="px-4 py-3 rounded-xl border-2 text-lg"
                    placeholder="Contoh: Deterjen / Plastik"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <span>💵</span> Nominal
                  </span>
                  <input
                    required
                    name="amount"
                    type="number"
                    min="0"
                    step="100"
                    value={expAmount || ''}
                    onChange={e => setExpAmount(Number(e.target.value))}
                    className="px-4 py-3 rounded-xl border-2 text-lg"
                    placeholder="Contoh: 50000"
                  />
                </label>
              </div>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <span>📝</span> Keterangan (opsional)
                </span>
                <input
                  name="description"
                  value={expDesc}
                  onChange={e => setExpDesc(e.target.value)}
                  className="px-4 py-3 rounded-xl border-2 text-lg"
                  placeholder="Contoh: Beli deterjen di toko"
                />
              </label>

              <div className="bg-gradient-to-r from-emerald-100 to-green-100 rounded-xl p-4 flex items-center justify-between border-2 border-emerald-200">
                <div className="text-gray-700 font-semibold flex items-center gap-2">
                  <span className="text-xl">🧾</span> Akan Dicatat
                </div>
                <div className="text-3xl font-extrabold text-emerald-600">{fmtIDR.format(expAmount || 0)}</div>
              </div>

              <button
                type="submit"
                className="btn-cute w-full inline-flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white px-6 py-4 rounded-xl text-lg font-bold"
              >
                <Save className="w-5 h-5" />
                Simpan Pengeluaran 💰
              </button>
            </form>
          </details>

          {/* Wage Form */}
          <details className="glass rounded-2xl shadow-lg overflow-hidden card-cute">
            <summary className="cursor-pointer p-5 flex items-center justify-between hover:bg-sky-50/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">Bayar Gaji Pegawai</h3>
                  <p className="text-sm text-gray-500">Pembayaran gaji berdasarkan berat cucian</p>
                </div>
              </div>
              <ChevronDown className="w-5 h-5 text-gray-400 transition-transform chevron-icon" />
            </summary>
            <form onSubmit={onSubmitWage} className="p-5 pt-0 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <span>👷</span> Pilih Karyawan
                  </span>
                  <select
                    required
                    name="employee_id"
                    value={wageEmpId}
                    onChange={e => setWageEmpId(e.target.value)}
                    className="px-4 py-3 rounded-xl border-2 text-lg"
                  >
                    <option value="" disabled>Pilih karyawan...</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} (Rp {Number(emp.wage_per_kg).toLocaleString('id-ID')}/kg)
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <span>⚖️</span> Berat Dikerjakan (kg)
                  </span>
                  <input
                    required
                    name="weight_processed"
                    type="number"
                    step="0.1"
                    min="0"
                    value={wageWeight || ''}
                    onChange={e => setWageWeight(Number(e.target.value))}
                    className="px-4 py-3 rounded-xl border-2 text-lg"
                    placeholder="Contoh: 8"
                  />
                </label>
              </div>

              <div className="bg-gradient-to-r from-sky-100 to-blue-100 rounded-xl p-4 flex items-center justify-between border-2 border-sky-200">
                <div className="text-gray-700 font-semibold flex items-center gap-2">
                  <span className="text-xl">💵</span> Total Gaji
                </div>
                <div className="text-3xl font-extrabold text-sky-600">{fmtIDR.format(wageTotal)}</div>
              </div>

              <button
                type="submit"
                className="btn-cute w-full inline-flex items-center justify-center gap-3 bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white px-6 py-4 rounded-xl text-lg font-bold"
              >
                <Save className="w-5 h-5" />
                Bayar Gaji 👷
              </button>
            </form>
          </details>
        </section>

        {/* Unpaid Transactions */}
        <section className="glass rounded-2xl shadow-lg p-5 card-cute">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-rose-500 rounded-xl flex items-center justify-center shadow-lg pulse-cute">
              <span className="text-2xl">🚨</span>
            </div>
            <div>
              <h2 className="font-bold text-gray-800 text-lg">Belum Lunas</h2>
              <p className="text-sm text-gray-500">{unpaid.length} pesanan belum dibayar</p>
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="shimmer h-20 rounded-xl"></div>
              ))}
            </div>
          ) : unpaid.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🎉</div>
              <p className="text-green-600 font-bold text-lg">Semua pesanan sudah lunas!</p>
              <p className="text-gray-500 text-sm">Alhamdulillah, kerja bagus!</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {unpaid.map(u => (
                <li key={u.id} className="bg-gradient-to-r from-red-50 to-rose-50 rounded-xl p-4 border-2 border-red-200 hover:border-red-300 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="font-bold text-gray-800 flex items-center gap-2">
                        <span>👤</span> {u.customer_name}
                      </div>
                      <div className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                        <span>🧺</span> {u.service_type} • {u.weight_kg} kg
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(u.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-xl font-extrabold text-red-600">{fmtIDR.format(u.total_price)}</div>
                      <button
                        onClick={async () => {
                          await updateTransactionStatus(u.id, 'Lunas');
                          await refreshAll();
                          showSuccessToast('Pembayaran dikonfirmasi! ✅');
                        }}
                        className="btn-cute inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-sm font-bold"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Lunas
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Footer */}
        <footer className="text-center py-8">
          <p className="text-gray-500 text-sm flex items-center justify-center gap-2">
            Laundry Ibu <span className="text-red-500">❤️</span> Laundry 3 Putra
          </p>
          <div className="text-2xl mt-2 flex items-center justify-center gap-2">
            <span className="float-animation">🧺</span>
            <span className="float-animation" style={{ animationDelay: '0.2s' }}>🫧</span>
            <span className="float-animation" style={{ animationDelay: '0.4s' }}>👕</span>
            <span className="float-animation" style={{ animationDelay: '0.6s' }}>✨</span>
          </div>
        </footer>
      </div>
    </main>
  );
}

function StatCard({
  title,
  value,
  icon,
  gradient,
  emoji
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  gradient: string;
  emoji: string;
}) {
  return (
    <div className="glass rounded-2xl p-5 card-cute relative overflow-hidden">
      <div className="absolute top-2 right-2 text-4xl opacity-20">{emoji}</div>
      <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shadow-lg text-white mb-3`}>
        {icon}
      </div>
      <div className="text-sm font-semibold text-gray-600 mb-1">{title}</div>
      <div className="text-2xl font-extrabold text-gray-800">{value}</div>
    </div>
  );
}
