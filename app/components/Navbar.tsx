'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Home,
    ShoppingBag,
    Wallet,
    Users,
    BarChart3,
    Sparkles
} from 'lucide-react';

const navItems = [
    { href: '/', label: 'Beranda', icon: Home, emoji: '🏠' },
    { href: '/pesanan', label: 'Pesanan', icon: ShoppingBag, emoji: '📦' },
    { href: '/pengeluaran', label: 'Pengeluaran', icon: Wallet, emoji: '💸' },
    { href: '/gaji', label: 'Penggajian', icon: Users, emoji: '👷' },
    { href: '/laporan', label: 'Laporan', icon: BarChart3, emoji: '📊' },
];

export default function Navbar() {
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Prevent hydration mismatch by not rendering active states until mounted
    const isActive = (href: string) => {
        if (!mounted) return false;
        return pathname === href;
    };

    return (
        <>
            {/* Desktop Navigation */}
            <nav className="hidden md:block fixed top-0 left-0 right-0 z-50">
                <div className="max-w-6xl mx-auto px-4 py-3">
                    <div className="glass rounded-2xl shadow-lg px-6 py-3">
                        <div className="flex items-center justify-between">
                            {/* Logo */}
                            <Link href="/" className="flex items-center gap-3 group">
                                <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                    <span className="text-2xl">🧺</span>
                                </div>
                                <div>
                                    <h1 className="text-xl font-extrabold gradient-text">Laundry 3 Putra</h1>
                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                        <Sparkles className="w-3 h-3" /> Bersih & Wangi
                                    </p>
                                </div>
                            </Link>

                            {/* Nav Links */}
                            <div className="flex items-center gap-2">
                                {navItems.map((item) => {
                                    const active = isActive(item.href);
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`
                                                flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm
                                                transition-all duration-300
                                                ${active
                                                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg shadow-pink-300/50'
                                                    : 'text-gray-600 hover:bg-pink-100 hover:text-pink-600'
                                                }
                                            `}
                                        >
                                            <span className="text-lg">{item.emoji}</span>
                                            {item.label}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 p-3">
                <div className="glass rounded-2xl shadow-lg px-2 py-2">
                    <div className="flex items-center justify-around">
                        {navItems.map((item) => {
                            const active = isActive(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`
                                        flex flex-col items-center gap-1 px-3 py-2 rounded-xl
                                        transition-all duration-300
                                        ${active
                                            ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg'
                                            : 'text-gray-600'
                                        }
                                    `}
                                >
                                    <span className="text-xl">{item.emoji}</span>
                                    <span className="text-[10px] font-semibold">{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </nav>

            {/* Mobile Top Header */}
            <header className="md:hidden fixed top-0 left-0 right-0 z-50 p-3">
                <div className="glass rounded-2xl shadow-lg px-4 py-3">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-xl flex items-center justify-center">
                                <span className="text-xl">🧺</span>
                            </div>
                            <div>
                                <h1 className="text-lg font-extrabold gradient-text">Laundry 3 Putra</h1>
                            </div>
                        </Link>
                        <div className="text-2xl float-animation">✨</div>
                    </div>
                </div>
            </header>
        </>
    );
}
