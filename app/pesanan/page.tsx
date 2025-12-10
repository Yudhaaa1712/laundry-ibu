'use client';

import { useEffect, useState } from 'react';
import { listTransactions, updateTransactionStatus, deleteTransaction } from '../actions';
import {
    ShoppingBag,
    Search,
    Filter,
    CheckCircle2,
    XCircle,
    Trash2,
    Calendar,
    RefreshCw,
    Package
} from 'lucide-react';

const fmtIDR = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 });

type Transaction = {
    id: string;
    created_at: string;
    customer_name: string;
    service_type: string;
    weight_kg: number;
    total_price: number;
    status: string;
};

export default function PesananPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<'all' | 'Lunas' | 'Belum Lunas'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

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
            if (filterStatus !== 'all') params.status = filterStatus;

            const data = await listTransactions(params);
            setTransactions(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, [filterStatus, dateFrom, dateTo]);

    const filteredTransactions = transactions.filter(tx =>
        tx.customer_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalAmount = filteredTransactions.reduce((sum, tx) => sum + tx.total_price, 0);
    const lunasCount = filteredTransactions.filter(tx => tx.status === 'Lunas').length;
    const belumLunasCount = filteredTransactions.filter(tx => tx.status === 'Belum Lunas').length;

    return (
        <main className="min-h-screen p-4 md:p-8">
            <div className="mx-auto max-w-6xl space-y-6">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-3 mb-2">
                        <span className="text-4xl float-animation">📦</span>
                        <h1 className="text-3xl md:text-4xl font-extrabold gradient-text">Daftar Pesanan</h1>
                    </div>
                    <p className="text-gray-600">Lihat dan kelola semua pesanan laundry</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="glass rounded-2xl p-4 card-cute">
                        <div className="text-3xl mb-2">📊</div>
                        <div className="text-sm text-gray-600">Total Pesanan</div>
                        <div className="text-2xl font-extrabold text-gray-800">{filteredTransactions.length}</div>
                    </div>
                    <div className="glass rounded-2xl p-4 card-cute">
                        <div className="text-3xl mb-2">💰</div>
                        <div className="text-sm text-gray-600">Total Nilai</div>
                        <div className="text-2xl font-extrabold text-gray-800">{fmtIDR.format(totalAmount)}</div>
                    </div>
                    <div className="glass rounded-2xl p-4 card-cute">
                        <div className="text-3xl mb-2">✅</div>
                        <div className="text-sm text-gray-600">Lunas</div>
                        <div className="text-2xl font-extrabold text-green-600">{lunasCount}</div>
                    </div>
                    <div className="glass rounded-2xl p-4 card-cute">
                        <div className="text-3xl mb-2">⏳</div>
                        <div className="text-sm text-gray-600">Belum Lunas</div>
                        <div className="text-2xl font-extrabold text-red-600">{belumLunasCount}</div>
                    </div>
                </div>

                {/* Filters */}
                <div className="glass rounded-2xl p-5 card-cute">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari nama pelanggan..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 text-lg"
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setFilterStatus('all')}
                                className={`px-4 py-2 rounded-xl font-semibold transition-all ${filterStatus === 'all'
                                        ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                Semua
                            </button>
                            <button
                                onClick={() => setFilterStatus('Lunas')}
                                className={`px-4 py-2 rounded-xl font-semibold transition-all ${filterStatus === 'Lunas'
                                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                ✅ Lunas
                            </button>
                            <button
                                onClick={() => setFilterStatus('Belum Lunas')}
                                className={`px-4 py-2 rounded-xl font-semibold transition-all ${filterStatus === 'Belum Lunas'
                                        ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                ⏳ Belum Lunas
                            </button>
                        </div>
                    </div>

                    {/* Date Filter */}
                    <div className="flex flex-col md:flex-row gap-4 mt-4">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-gray-400" />
                            <span className="text-gray-600 text-sm">Dari:</span>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={e => setDateFrom(e.target.value)}
                                className="px-3 py-2 rounded-xl border-2"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-gray-600 text-sm">Sampai:</span>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={e => setDateTo(e.target.value)}
                                className="px-3 py-2 rounded-xl border-2"
                            />
                        </div>
                        <button
                            onClick={() => { setDateFrom(''); setDateTo(''); setSearchQuery(''); setFilterStatus('all'); }}
                            className="px-4 py-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 font-semibold flex items-center gap-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Reset Filter
                        </button>
                    </div>
                </div>

                {/* Transactions List */}
                <div className="glass rounded-2xl p-5 card-cute">
                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="shimmer h-24 rounded-xl"></div>
                            ))}
                        </div>
                    ) : filteredTransactions.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">📭</div>
                            <p className="text-gray-500 font-semibold">Tidak ada pesanan ditemukan</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredTransactions.map(tx => (
                                <div
                                    key={tx.id}
                                    className={`rounded-xl p-4 border-2 transition-all hover:shadow-md ${tx.status === 'Lunas'
                                            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
                                            : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200'
                                        }`}
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xl">
                                                    {tx.service_type === 'Cuci + Setrika' ? '🧺' : tx.service_type === 'Cuci Saja' ? '💧' : '👔'}
                                                </span>
                                                <span className="font-bold text-gray-800">{tx.customer_name}</span>
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${tx.status === 'Lunas'
                                                        ? 'bg-green-500 text-white'
                                                        : 'bg-red-500 text-white'
                                                    }`}>
                                                    {tx.status === 'Lunas' ? '✅ Lunas' : '⏳ Belum'}
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {tx.service_type} • {tx.weight_kg} kg
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                📅 {new Date(tx.created_at).toLocaleDateString('id-ID', {
                                                    weekday: 'short',
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="text-xl font-extrabold text-gray-800">
                                                {fmtIDR.format(tx.total_price)}
                                            </div>
                                            <div className="flex gap-2">
                                                {tx.status === 'Belum Lunas' && (
                                                    <button
                                                        onClick={async () => {
                                                            await updateTransactionStatus(tx.id, 'Lunas');
                                                            fetchData();
                                                        }}
                                                        className="btn-cute px-3 py-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-bold flex items-center gap-1"
                                                    >
                                                        <CheckCircle2 className="w-4 h-4" />
                                                        Lunas
                                                    </button>
                                                )}
                                                {tx.status === 'Lunas' && (
                                                    <button
                                                        onClick={async () => {
                                                            await updateTransactionStatus(tx.id, 'Belum Lunas');
                                                            fetchData();
                                                        }}
                                                        className="btn-cute px-3 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-bold flex items-center gap-1"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                        Batal
                                                    </button>
                                                )}
                                                <button
                                                    onClick={async () => {
                                                        if (confirm('Yakin ingin menghapus pesanan ini?')) {
                                                            await deleteTransaction(tx.id);
                                                            fetchData();
                                                        }
                                                    }}
                                                    className="btn-cute px-3 py-2 rounded-xl bg-gradient-to-r from-gray-400 to-gray-500 text-white text-sm font-bold flex items-center gap-1"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
