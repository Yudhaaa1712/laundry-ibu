'use client';

import { useEffect, useState } from 'react';
import { listWageRecords, listEmployees, payWage } from '../actions';
import {
    Users,
    Search,
    Calendar,
    RefreshCw,
    Plus,
    X,
    Save,
    Award,
    DollarSign
} from 'lucide-react';

const fmtIDR = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 });

type WageRecord = {
    id: string;
    created_at: string;
    employee_id: string;
    weight_processed: number;
    total_wage: number;
    employees?: { name: string } | { name: string }[] | null;
};

type Employee = {
    id: string;
    name: string;
    wage_per_kg: number;
};

export default function GajiPage() {
    const [wageRecords, setWageRecords] = useState<WageRecord[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [showModal, setShowModal] = useState(false);

    // Form states
    const [wageEmpId, setWageEmpId] = useState<string>('');
    const [wageWeight, setWageWeight] = useState<number>(0);

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

            const [wages, emps] = await Promise.all([
                listWageRecords(params),
                listEmployees()
            ]);
            setWageRecords(wages);
            setEmployees(emps);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, [dateFrom, dateTo]);

    const getEmployeeName = (empId: string) => {
        const emp = employees.find(e => e.id === empId);
        return emp?.name || 'Unknown';
    };

    const getRecordEmployeeName = (rec: WageRecord): string => {
        if (rec.employees) {
            if (Array.isArray(rec.employees)) {
                return rec.employees[0]?.name || getEmployeeName(rec.employee_id);
            }
            return rec.employees.name || getEmployeeName(rec.employee_id);
        }
        return getEmployeeName(rec.employee_id);
    };

    const filteredRecords = wageRecords.filter(rec => {
        const empName = getRecordEmployeeName(rec);
        return empName.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const totalWages = filteredRecords.reduce((sum, rec) => sum + rec.total_wage, 0);
    const totalWeight = filteredRecords.reduce((sum, rec) => sum + rec.weight_processed, 0);

    // Group by employee
    const employeeStats = filteredRecords.reduce((acc, rec) => {
        const name = getRecordEmployeeName(rec);
        if (!acc[name]) {
            acc[name] = { total: 0, weight: 0, count: 0 };
        }
        acc[name].total += rec.total_wage;
        acc[name].weight += rec.weight_processed;
        acc[name].count += 1;
        return acc;
    }, {} as Record<string, { total: number; weight: number; count: number }>);

    const selectedEmp = employees.find(e => e.id === wageEmpId);
    const wageTotal = selectedEmp ? Math.round(wageWeight * selectedEmp.wage_per_kg) : 0;

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        try {
            await payWage(new FormData(e.currentTarget));
            setWageEmpId('');
            setWageWeight(0);
            setShowModal(false);
            fetchData();
        } catch (err: any) {
            alert(err.message || 'Gagal membayar gaji');
        }
    }

    const employeeAvatars = ['👨‍🔧', '👩‍🔧', '👷', '👷‍♀️', '🧑‍🔧', '👨‍💼', '👩‍💼'];
    const getRandomAvatar = (name: string) => {
        const index = name.charCodeAt(0) % employeeAvatars.length;
        return employeeAvatars[index];
    };

    return (
        <main className="min-h-screen p-4 md:p-8">
            <div className="mx-auto max-w-6xl space-y-6">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-3 mb-2">
                        <span className="text-4xl float-animation">👷</span>
                        <h1 className="text-3xl md:text-4xl font-extrabold gradient-text">Penggajian</h1>
                    </div>
                    <p className="text-gray-600">Kelola pembayaran gaji karyawan</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="glass rounded-2xl p-5 card-cute">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center">
                                <DollarSign className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-sm text-gray-600">Total Gaji</span>
                        </div>
                        <div className="text-2xl font-extrabold text-gray-800">{fmtIDR.format(totalWages)}</div>
                    </div>
                    <div className="glass rounded-2xl p-5 card-cute">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
                                <Award className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-sm text-gray-600">Total Berat</span>
                        </div>
                        <div className="text-2xl font-extrabold text-gray-800">{totalWeight.toFixed(1)} kg</div>
                    </div>
                    <div className="glass rounded-2xl p-5 card-cute">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center">
                                <Users className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-sm text-gray-600">Pembayaran</span>
                        </div>
                        <div className="text-2xl font-extrabold text-gray-800">{filteredRecords.length}x</div>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="glass rounded-2xl p-5 card-cute flex items-center justify-center gap-3 hover:bg-blue-50 transition-colors group"
                    >
                        <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Plus className="w-6 h-6 text-white" />
                        </div>
                        <span className="font-bold text-gray-700">Bayar Gaji</span>
                    </button>
                </div>

                {/* Employee Stats Cards */}
                {Object.keys(employeeStats).length > 0 && (
                    <div className="glass rounded-2xl p-5 card-cute">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <span className="text-xl">🏆</span> Statistik per Karyawan
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {Object.entries(employeeStats).map(([name, stats]) => (
                                <div
                                    key={name}
                                    className="bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl p-4 border-2 border-sky-200"
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-blue-500 rounded-xl flex items-center justify-center text-2xl">
                                            {getRandomAvatar(name)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-800">{name}</div>
                                            <div className="text-xs text-gray-500">{stats.count} pembayaran</div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-center">
                                        <div className="bg-white/70 rounded-lg p-2">
                                            <div className="text-xs text-gray-500">Total</div>
                                            <div className="font-bold text-sky-600">{fmtIDR.format(stats.total)}</div>
                                        </div>
                                        <div className="bg-white/70 rounded-lg p-2">
                                            <div className="text-xs text-gray-500">Berat</div>
                                            <div className="font-bold text-sky-600">{stats.weight.toFixed(1)} kg</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="glass rounded-2xl p-5 card-cute">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari nama karyawan..."
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

                {/* Wage Records List */}
                <div className="glass rounded-2xl p-5 card-cute">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="text-xl">📋</span> Riwayat Pembayaran Gaji
                    </h2>

                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="shimmer h-20 rounded-xl"></div>
                            ))}
                        </div>
                    ) : filteredRecords.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">👷</div>
                            <p className="text-gray-500 font-semibold">Belum ada riwayat pembayaran gaji</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredRecords.map(rec => (
                                <div
                                    key={rec.id}
                                    className="bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl p-4 border-2 border-sky-100 hover:border-sky-300 transition-all hover:shadow-md"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-blue-500 rounded-xl flex items-center justify-center text-2xl">
                                                {getRandomAvatar(getRecordEmployeeName(rec))}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-800">
                                                    {getRecordEmployeeName(rec)}
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    ⚖️ {rec.weight_processed} kg dikerjakan
                                                </div>
                                                <div className="text-xs text-gray-400 mt-1">
                                                    📅 {new Date(rec.created_at).toLocaleDateString('id-ID', {
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
                                        <div className="text-xl font-extrabold text-sky-600">
                                            {fmtIDR.format(rec.total_wage)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Employee List */}
                <div className="glass rounded-2xl p-5 card-cute">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="text-xl">👥</span> Daftar Karyawan
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {employees.map(emp => (
                            <div
                                key={emp.id}
                                className="bg-white rounded-xl p-4 border-2 border-gray-100 hover:border-blue-200 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center text-3xl">
                                        {getRandomAvatar(emp.name)}
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-800">{emp.name}</div>
                                        <div className="text-sm text-gray-500">
                                            💰 {fmtIDR.format(emp.wage_per_kg)} / kg
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Pay Wage Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="glass rounded-3xl p-6 w-full max-w-md relative">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>

                        <div className="text-center mb-6">
                            <div className="text-4xl mb-2">💵</div>
                            <h3 className="text-xl font-bold text-gray-800">Bayar Gaji Karyawan</h3>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-sm font-semibold text-gray-700 mb-2 block">Pilih Karyawan</label>
                                <select
                                    name="employee_id"
                                    value={wageEmpId}
                                    onChange={e => setWageEmpId(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border-2 text-lg"
                                    required
                                >
                                    <option value="" disabled>Pilih karyawan...</option>
                                    {employees.map(emp => (
                                        <option key={emp.id} value={emp.id}>
                                            {emp.name} ({fmtIDR.format(emp.wage_per_kg)}/kg)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-gray-700 mb-2 block">Berat Dikerjakan (kg)</label>
                                <input
                                    name="weight_processed"
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    value={wageWeight || ''}
                                    onChange={e => setWageWeight(Number(e.target.value))}
                                    placeholder="Contoh: 8"
                                    className="w-full px-4 py-3 rounded-xl border-2 text-2xl font-bold"
                                    required
                                />
                            </div>

                            {selectedEmp && (
                                <div className="bg-sky-50 rounded-xl p-3 text-sm text-sky-700">
                                    <span className="font-semibold">{selectedEmp.name}</span> •
                                    Tarif: {fmtIDR.format(selectedEmp.wage_per_kg)}/kg
                                </div>
                            )}

                            <div className="bg-gradient-to-r from-sky-100 to-blue-100 rounded-xl p-4 text-center border-2 border-sky-200">
                                <div className="text-sm text-gray-600">Total Gaji</div>
                                <div className="text-3xl font-extrabold text-sky-600">{fmtIDR.format(wageTotal)}</div>
                            </div>

                            <button
                                type="submit"
                                className="btn-cute w-full py-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-500 text-white font-bold text-lg flex items-center justify-center gap-2"
                            >
                                <Save className="w-5 h-5" />
                                Bayar Gaji
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}
