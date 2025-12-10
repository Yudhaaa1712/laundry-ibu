'use client';

import { useEffect, useState } from 'react';
import { listExpenses, deleteExpense, addExpense } from '../actions';
import {
    Wallet,
    Search,
    Calendar,
    RefreshCw,
    Trash2,
    Plus,
    X,
    Save,
    TrendingDown,
    ShoppingCart,
    Zap,
    Package
} from 'lucide-react';

const fmtIDR = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 });

type Expense = {
    id: number;
    created_at: string;
    category: string;
    amount: number;
    description: string;
};

const EXPENSE_CATEGORIES = [
    { name: 'Deterjen', emoji: '🧴' },
    { name: 'Plastik', emoji: '🛍️' },
    { name: 'Listrik', emoji: '⚡' },
    { name: 'Air', emoji: '💧' },
    { name: 'Pewangi', emoji: '🌸' },
    { name: 'Transportasi', emoji: '🚗' },
    { name: 'Gaji Karyawan', emoji: '👷' },
    { name: 'Lainnya', emoji: '📦' },
];

export default function PengeluaranPage() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [showModal, setShowModal] = useState(false);

    // Form states
    const [expCategory, setExpCategory] = useState('');
    const [expAmount, setExpAmount] = useState<number>(0);
    const [expDesc, setExpDesc] = useState('');

    async function fetchData() {
        setLoading(true);
        try {
            const params: any = {};
            if (dateFrom) params.fromISO = new Date(dateFrom).toISOString();
            if (dateTo) {
                const to = new Date(dateTo);
                to.setHours(23, 59, 59, 999);
                params.toISO = to.toISOString();
            }

            const data = await listExpenses(params);
            setExpenses(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, [dateFrom, dateTo]);

    const filteredExpenses = expenses.filter(exp =>
        exp.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalAmount = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    // Group by category
    const categoryTotals = filteredExpenses.reduce((acc, exp) => {
        acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
        return acc;
    }, {} as Record<string, number>);

    const getCategoryEmoji = (category: string) => {
        const cat = EXPENSE_CATEGORIES.find(c => c.name.toLowerCase() === category.toLowerCase());
        return cat?.emoji || '📦';
    };

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        try {
            await addExpense(new FormData(e.currentTarget));
            setExpCategory('');
            setExpAmount(0);
            setExpDesc('');
            setShowModal(false);
            fetchData();
        } catch (err: any) {
            alert(err.message || 'Gagal menyimpan pengeluaran');
        }
    }

    return (
        <main className="min-h-screen p-4 md:p-8">
            <div className="mx-auto max-w-6xl space-y-6">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-3 mb-2">
                        <span className="text-4xl float-animation">💸</span>
                        <h1 className="text-3xl md:text-4xl font-extrabold gradient-text">Pengeluaran</h1>
                    </div>
                    <p className="text-gray-600">Kelola semua pengeluaran operasional</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="glass rounded-2xl p-5 card-cute col-span-1 md:col-span-2">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-rose-400 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                                <TrendingDown className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <div className="text-sm text-gray-600">Total Pengeluaran</div>
                                <div className="text-3xl font-extrabold text-gray-800">{fmtIDR.format(totalAmount)}</div>
                            </div>
                        </div>
                        {/* Category breakdown */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {Object.entries(categoryTotals).slice(0, 4).map(([cat, amount]) => (
                                <div key={cat} className="bg-white/50 rounded-xl p-3 text-center">
                                    <div className="text-2xl mb-1">{getCategoryEmoji(cat)}</div>
                                    <div className="text-xs text-gray-600 truncate">{cat}</div>
                                    <div className="text-sm font-bold text-gray-800">{fmtIDR.format(amount)}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Add Button */}
                    <button
                        onClick={() => setShowModal(true)}
                        className="glass rounded-2xl p-5 card-cute flex flex-col items-center justify-center gap-3 hover:bg-pink-50 transition-colors group"
                    >
                        <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Plus className="w-8 h-8 text-white" />
                        </div>
                        <span className="font-bold text-gray-700">Tambah Pengeluaran</span>
                    </button>
                </div>

                {/* Filters */}
                <div className="glass rounded-2xl p-5 card-cute">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari kategori atau keterangan..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 text-lg"
                            />
                        </div>


                        <button
                            onClick={() => { setDateFrom(''); setDateTo(''); setSearchQuery(''); }}
                            className="px-4 py-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 font-semibold flex items-center gap-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Reset
                        </button>
                    </div>
                </div>

                {/* Expenses List */}
                <div className="glass rounded-2xl p-5 card-cute">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="text-xl">📋</span> Riwayat Pengeluaran
                    </h2>

                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="shimmer h-20 rounded-xl"></div>
                            ))}
                        </div>
                    ) : filteredExpenses.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">💰</div>
                            <p className="text-gray-500 font-semibold">Belum ada pengeluaran</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredExpenses.map(exp => (
                                <div
                                    key={exp.id}
                                    className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-4 border-2 border-gray-100 hover:border-pink-200 transition-all hover:shadow-md"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-gradient-to-br from-rose-100 to-pink-100 rounded-xl flex items-center justify-center">
                                                <span className="text-2xl">{getCategoryEmoji(exp.category)}</span>
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-800">{exp.category}</div>
                                                {exp.description && (
                                                    <div className="text-sm text-gray-500">{exp.description}</div>
                                                )}
                                                <div className="text-xs text-gray-400 mt-1">
                                                    📅 {new Date(exp.created_at).toLocaleDateString('id-ID', {
                                                        weekday: 'short',
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Add Expense Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="glass rounded-3xl p-6 w-full max-w-md relative animate-[bounce-cute_0.3s_ease-out]">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>

                        <div className="text-center mb-6">
                            <div className="text-4xl mb-2">💸</div>
                            <h3 className="text-xl font-bold text-gray-800">Tambah Pengeluaran</h3>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-sm font-semibold text-gray-700 mb-2 block">Kategori</label>
                                <div className="grid grid-cols-4 gap-2 mb-2">
                                    {EXPENSE_CATEGORIES.map(cat => (
                                        <button
                                            key={cat.name}
                                            type="button"
                                            onClick={() => setExpCategory(cat.name)}
                                            className={`p-2 rounded-xl text-center transition-all ${expCategory === cat.name
                                                ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg'
                                                : 'bg-gray-100 hover:bg-gray-200'
                                                }`}
                                        >
                                            <div className="text-xl">{cat.emoji}</div>
                                            <div className="text-xs truncate">{cat.name}</div>
                                        </button>
                                    ))}
                                </div>
                                <input
                                    name="category"
                                    value={expCategory}
                                    onChange={e => setExpCategory(e.target.value)}
                                    placeholder="Atau ketik kategori lain..."
                                    className="w-full px-4 py-3 rounded-xl border-2"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-gray-700 mb-2 block">Nominal</label>
                                <input
                                    name="amount"
                                    type="number"
                                    value={expAmount || ''}
                                    onChange={e => setExpAmount(Number(e.target.value))}
                                    placeholder="50000"
                                    className="w-full px-4 py-3 rounded-xl border-2 text-2xl font-bold"
                                    required
                                    min="0"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-gray-700 mb-2 block">Keterangan (opsional)</label>
                                <input
                                    name="description"
                                    value={expDesc}
                                    onChange={e => setExpDesc(e.target.value)}
                                    placeholder="Contoh: Beli deterjen di toko"
                                    className="w-full px-4 py-3 rounded-xl border-2"
                                />
                            </div>

                            <div className="bg-gradient-to-r from-rose-100 to-pink-100 rounded-xl p-4 text-center border-2 border-rose-200">
                                <div className="text-sm text-gray-600">Akan dicatat</div>
                                <div className="text-3xl font-extrabold text-rose-600">{fmtIDR.format(expAmount || 0)}</div>
                            </div>

                            <button
                                type="submit"
                                className="btn-cute w-full py-4 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold text-lg flex items-center justify-center gap-2"
                            >
                                <Save className="w-5 h-5" />
                                Simpan Pengeluaran
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}
