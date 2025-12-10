'use client';

import { useEffect, useState } from 'react';
import { getPeriodReport, ReportPeriod, listTransactions, listExpenses, listWageRecords } from '../actions';
import {
    BarChart3,
    Calendar,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Users,
    Package,
    PiggyBank,
    ArrowRight,
    RefreshCw,
    Download,
    FileText
} from 'lucide-react';

const fmtIDR = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 });

type ReportData = {
    income: number;
    pendingIncome: number;
    expense: number;
    wages: number;
    cash: number;
    totalOrders: number;
    fromDate: string;
    toDate: string;
};

const PERIOD_OPTIONS: { value: ReportPeriod; label: string; emoji: string }[] = [
    { value: 'day', label: 'Hari Ini', emoji: '📅' },
    { value: 'week', label: 'Minggu Ini', emoji: '📆' },
    { value: '15days', label: '15 Hari', emoji: '🗓️' },
    { value: 'month', label: 'Bulan Ini', emoji: '📋' },
    { value: 'year', label: 'Tahun Ini', emoji: '📊' },
    { value: 'custom', label: 'Custom', emoji: '🎯' },
];

export default function LaporanPage() {
    const [period, setPeriod] = useState<ReportPeriod>('week');
    const [reportData, setReportData] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(true);

    // Custom date range
    const [customFrom, setCustomFrom] = useState('');
    const [customTo, setCustomTo] = useState('');

    // Detail data
    const [transactions, setTransactions] = useState<any[]>([]);
    const [expenses, setExpenses] = useState<any[]>([]);
    const [wages, setWages] = useState<any[]>([]);
    const [showDetail, setShowDetail] = useState<'transactions' | 'expenses' | 'wages' | null>(null);

    async function fetchReport() {
        setLoading(true);
        try {
            const data = await getPeriodReport(
                period,
                period === 'custom' ? customFrom : undefined,
                period === 'custom' ? customTo : undefined
            );
            setReportData(data);

            // Also fetch detail data
            const params: any = {};
            if (data.fromDate) params.fromISO = data.fromDate;
            if (data.toDate) params.toISO = data.toDate;

            const [txs, exps, wgs] = await Promise.all([
                listTransactions(params),
                listExpenses(params),
                listWageRecords(params),
            ]);
            setTransactions(txs);
            setExpenses(exps);
            setWages(wgs);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (period !== 'custom' || (customFrom && customTo)) {
            fetchReport();
        }
    }, [period, customFrom, customTo]);

    const formatDateRange = () => {
        if (!reportData) return '';
        const from = new Date(reportData.fromDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
        const to = new Date(reportData.toDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
        return `${from} - ${to}`;
    };

    const profitLoss = reportData ? reportData.income - reportData.expense : 0;
    const profitMargin = reportData && reportData.income > 0
        ? ((profitLoss / reportData.income) * 100).toFixed(1)
        : '0';

    return (
        <main className="min-h-screen p-4 md:p-8">
            <div className="mx-auto max-w-6xl space-y-6">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-3 mb-2">
                        <span className="text-4xl float-animation">📊</span>
                        <h1 className="text-3xl md:text-4xl font-extrabold gradient-text">Laporan Keuangan</h1>
                    </div>
                    <p className="text-gray-600">Analisis performa bisnis laundry Anda</p>
                </div>

                {/* Period Selector */}
                <div className="glass rounded-2xl p-5 card-cute">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-pink-500" />
                        Pilih Periode Laporan
                    </h2>

                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-4">
                        {PERIOD_OPTIONS.map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => setPeriod(opt.value)}
                                className={`p-3 rounded-xl text-center transition-all font-semibold ${period === opt.value
                                        ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg'
                                        : 'bg-white hover:bg-pink-50 text-gray-700 border-2 border-gray-100'
                                    }`}
                            >
                                <div className="text-xl mb-1">{opt.emoji}</div>
                                <div className="text-xs">{opt.label}</div>
                            </button>
                        ))}
                    </div>

                    {/* Custom Date Range */}
                    {period === 'custom' && (
                        <div className="flex flex-col md:flex-row gap-4 bg-pink-50 p-4 rounded-xl border-2 border-pink-200">
                            <div className="flex-1">
                                <label className="text-sm font-semibold text-gray-700 mb-1 block">Dari Tanggal</label>
                                <input
                                    type="date"
                                    value={customFrom}
                                    onChange={e => setCustomFrom(e.target.value)}
                                    className="w-full px-4 py-2 rounded-xl border-2"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="text-sm font-semibold text-gray-700 mb-1 block">Sampai Tanggal</label>
                                <input
                                    type="date"
                                    value={customTo}
                                    onChange={e => setCustomTo(e.target.value)}
                                    className="w-full px-4 py-2 rounded-xl border-2"
                                />
                            </div>
                            <button
                                onClick={fetchReport}
                                disabled={!customFrom || !customTo}
                                className="btn-cute px-6 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold disabled:opacity-50 self-end"
                            >
                                Tampilkan
                            </button>
                        </div>
                    )}

                    {/* Date Range Display */}
                    {reportData && (
                        <div className="mt-4 text-center">
                            <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full">
                                <Calendar className="w-4 h-4 text-pink-500" />
                                <span className="font-semibold text-gray-700">{formatDateRange()}</span>
                            </span>
                        </div>
                    )}
                </div>

                {/* Main Stats */}
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="shimmer h-32 rounded-2xl"></div>
                        ))}
                    </div>
                ) : reportData && (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {/* Income */}
                            <button
                                onClick={() => setShowDetail(showDetail === 'transactions' ? null : 'transactions')}
                                className="glass rounded-2xl p-5 card-cute text-left relative overflow-hidden"
                            >
                                <div className="absolute top-2 right-2 text-4xl opacity-10">💰</div>
                                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center shadow-lg mb-3">
                                    <TrendingUp className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-sm text-gray-600 mb-1">Pemasukan</div>
                                <div className="text-2xl font-extrabold text-emerald-600">{fmtIDR.format(reportData.income)}</div>
                                {reportData.pendingIncome > 0 && (
                                    <div className="text-xs text-orange-500 mt-1">
                                        + {fmtIDR.format(reportData.pendingIncome)} belum lunas
                                    </div>
                                )}
                            </button>

                            {/* Expense */}
                            <button
                                onClick={() => setShowDetail(showDetail === 'expenses' ? null : 'expenses')}
                                className="glass rounded-2xl p-5 card-cute text-left relative overflow-hidden"
                            >
                                <div className="absolute top-2 right-2 text-4xl opacity-10">💸</div>
                                <div className="w-12 h-12 bg-gradient-to-br from-rose-400 to-pink-500 rounded-xl flex items-center justify-center shadow-lg mb-3">
                                    <TrendingDown className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-sm text-gray-600 mb-1">Pengeluaran</div>
                                <div className="text-2xl font-extrabold text-rose-600">{fmtIDR.format(reportData.expense)}</div>
                            </button>

                            {/* Wages */}
                            <button
                                onClick={() => setShowDetail(showDetail === 'wages' ? null : 'wages')}
                                className="glass rounded-2xl p-5 card-cute text-left relative overflow-hidden"
                            >
                                <div className="absolute top-2 right-2 text-4xl opacity-10">👷</div>
                                <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg mb-3">
                                    <Users className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-sm text-gray-600 mb-1">Gaji Karyawan</div>
                                <div className="text-2xl font-extrabold text-sky-600">{fmtIDR.format(reportData.wages)}</div>
                            </button>

                            {/* Orders */}
                            <div className="glass rounded-2xl p-5 card-cute relative overflow-hidden">
                                <div className="absolute top-2 right-2 text-4xl opacity-10">📦</div>
                                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg mb-3">
                                    <Package className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-sm text-gray-600 mb-1">Total Pesanan</div>
                                <div className="text-2xl font-extrabold text-amber-600">{reportData.totalOrders}</div>
                            </div>
                        </div>

                        {/* Profit/Loss Card */}
                        <div className={`glass rounded-2xl p-6 card-cute ${profitLoss >= 0
                                ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200'
                                : 'bg-gradient-to-r from-rose-50 to-red-50 border-2 border-rose-200'
                            }`}>
                            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${profitLoss >= 0
                                            ? 'bg-gradient-to-br from-emerald-400 to-green-500'
                                            : 'bg-gradient-to-br from-rose-400 to-red-500'
                                        }`}>
                                        {profitLoss >= 0 ? (
                                            <PiggyBank className="w-8 h-8 text-white" />
                                        ) : (
                                            <TrendingDown className="w-8 h-8 text-white" />
                                        )}
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-600">
                                            {profitLoss >= 0 ? '🎉 Laba Bersih' : '😢 Rugi'}
                                        </div>
                                        <div className={`text-3xl font-extrabold ${profitLoss >= 0 ? 'text-emerald-600' : 'text-rose-600'
                                            }`}>
                                            {fmtIDR.format(Math.abs(profitLoss))}
                                        </div>
                                    </div>
                                </div>

                                <div className="text-center">
                                    <div className="text-sm text-gray-600">Margin Keuntungan</div>
                                    <div className={`text-2xl font-bold ${profitLoss >= 0 ? 'text-emerald-600' : 'text-rose-600'
                                        }`}>
                                        {profitMargin}%
                                    </div>
                                </div>

                                {/* Summary */}
                                <div className="bg-white/70 rounded-xl p-4">
                                    <div className="text-xs text-gray-500 mb-2">Ringkasan</div>
                                    <div className="space-y-1 text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                            <span>Pemasukan: {fmtIDR.format(reportData.income)}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                                            <span>Pengeluaran: {fmtIDR.format(reportData.expense)}</span>
                                        </div>
                                        <div className="border-t pt-1 mt-1">
                                            <span className="font-bold">= {fmtIDR.format(profitLoss)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Detail Sections */}
                        {showDetail === 'transactions' && (
                            <div className="glass rounded-2xl p-5 card-cute">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <span className="text-xl">📦</span> Detail Pesanan
                                </h3>
                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                    {transactions.map(tx => (
                                        <div key={tx.id} className="bg-white rounded-xl p-3 flex justify-between items-center">
                                            <div>
                                                <div className="font-semibold">{tx.customer_name}</div>
                                                <div className="text-xs text-gray-500">
                                                    {tx.service_type} • {tx.weight_kg} kg
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className={`font-bold ${tx.status === 'Lunas' ? 'text-emerald-600' : 'text-orange-500'}`}>
                                                    {fmtIDR.format(tx.total_price)}
                                                </div>
                                                <div className={`text-xs ${tx.status === 'Lunas' ? 'text-emerald-500' : 'text-orange-400'}`}>
                                                    {tx.status}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {showDetail === 'expenses' && (
                            <div className="glass rounded-2xl p-5 card-cute">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <span className="text-xl">💸</span> Detail Pengeluaran
                                </h3>
                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                    {expenses.map(exp => (
                                        <div key={exp.id} className="bg-white rounded-xl p-3 flex justify-between items-center">
                                            <div>
                                                <div className="font-semibold">{exp.category}</div>
                                                <div className="text-xs text-gray-500">{exp.description || '-'}</div>
                                            </div>
                                            <div className="font-bold text-rose-600">
                                                -{fmtIDR.format(exp.amount)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {showDetail === 'wages' && (
                            <div className="glass rounded-2xl p-5 card-cute">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <span className="text-xl">👷</span> Detail Gaji
                                </h3>
                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                    {wages.map(wg => (
                                        <div key={wg.id} className="bg-white rounded-xl p-3 flex justify-between items-center">
                                            <div>
                                                <div className="font-semibold">{wg.employees?.name || 'Karyawan'}</div>
                                                <div className="text-xs text-gray-500">{wg.weight_processed} kg</div>
                                            </div>
                                            <div className="font-bold text-sky-600">
                                                {fmtIDR.format(wg.total_wage)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Visual Chart Placeholder */}
                        <div className="glass rounded-2xl p-5 card-cute">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-pink-500" />
                                Visualisasi
                            </h3>

                            {/* Simple Bar Chart */}
                            <div className="space-y-4">
                                {/* Income Bar */}
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-semibold text-gray-700">💰 Pemasukan</span>
                                        <span className="font-bold text-emerald-600">{fmtIDR.format(reportData.income)}</span>
                                    </div>
                                    <div className="h-8 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-emerald-400 to-green-500 rounded-full transition-all duration-1000"
                                            style={{
                                                width: reportData.income > 0
                                                    ? `${Math.min(100, (reportData.income / Math.max(reportData.income, reportData.expense)) * 100)}%`
                                                    : '0%'
                                            }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Expense Bar */}
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-semibold text-gray-700">💸 Pengeluaran</span>
                                        <span className="font-bold text-rose-600">{fmtIDR.format(reportData.expense)}</span>
                                    </div>
                                    <div className="h-8 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-rose-400 to-pink-500 rounded-full transition-all duration-1000"
                                            style={{
                                                width: reportData.expense > 0
                                                    ? `${Math.min(100, (reportData.expense / Math.max(reportData.income, reportData.expense)) * 100)}%`
                                                    : '0%'
                                            }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Wages Bar */}
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-semibold text-gray-700">👷 Gaji (bagian dari pengeluaran)</span>
                                        <span className="font-bold text-sky-600">{fmtIDR.format(reportData.wages)}</span>
                                    </div>
                                    <div className="h-8 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-sky-400 to-blue-500 rounded-full transition-all duration-1000"
                                            style={{
                                                width: reportData.wages > 0
                                                    ? `${Math.min(100, (reportData.wages / Math.max(reportData.income, reportData.expense)) * 100)}%`
                                                    : '0%'
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tips */}
                        <div className="glass rounded-2xl p-5 card-cute bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <span className="text-xl">💡</span> Tips Bisnis
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {profitLoss >= 0 ? (
                                    <>
                                        <div className="bg-white/70 rounded-xl p-3 flex items-start gap-2">
                                            <span className="text-xl">🎉</span>
                                            <div className="text-sm text-gray-700">
                                                Bisnis Anda menguntungkan! Pertahankan kualitas layanan.
                                            </div>
                                        </div>
                                        <div className="bg-white/70 rounded-xl p-3 flex items-start gap-2">
                                            <span className="text-xl">📈</span>
                                            <div className="text-sm text-gray-700">
                                                Margin {profitMargin}% cukup {Number(profitMargin) > 30 ? 'bagus' : 'perlu ditingkatkan'}.
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="bg-white/70 rounded-xl p-3 flex items-start gap-2">
                                            <span className="text-xl">⚠️</span>
                                            <div className="text-sm text-gray-700">
                                                Pengeluaran melebihi pemasukan. Evaluasi biaya operasional.
                                            </div>
                                        </div>
                                        <div className="bg-white/70 rounded-xl p-3 flex items-start gap-2">
                                            <span className="text-xl">💪</span>
                                            <div className="text-sm text-gray-700">
                                                Coba tingkatkan jumlah pelanggan atau naikkan harga layanan.
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </main>
    );
}
