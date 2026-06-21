'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#047857] flex items-center justify-center text-white font-bold text-sm">N</div>
            <span className="text-lg font-bold text-[#047857]">NayePankh Foundation</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-gray-700 hover:text-[#047857] transition">Home</Link>
            <Link href="/" className="text-sm font-medium text-gray-700 hover:text-[#047857] transition">About</Link>
            <Link href="/" className="text-sm font-medium text-gray-700 hover:text-[#047857] transition">Events</Link>
            <Link href="/signup" className="text-sm font-medium text-[#047857] hover:text-[#065f46] transition">Become Volunteer</Link>
            <Link href="/login" className="px-4 py-2 rounded-lg bg-[#047857] text-white text-sm font-medium hover:bg-[#065f46] transition">Login</Link>
          </div>
          <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-6 h-6 text-gray-700" /> : <Menu className="w-6 h-6 text-gray-700" />}
          </button>
        </div>
      </div>
      {mobileOpen && (
        <div className="md:hidden px-4 pb-4 space-y-2">
          <Link href="/" className="block text-sm font-medium text-gray-700 hover:text-[#047857]" onClick={() => setMobileOpen(false)}>Home</Link>
          <Link href="/" className="block text-sm font-medium text-gray-700 hover:text-[#047857]" onClick={() => setMobileOpen(false)}>About</Link>
          <Link href="/" className="block text-sm font-medium text-gray-700 hover:text-[#047857]" onClick={() => setMobileOpen(false)}>Events</Link>
          <Link href="/signup" className="block text-sm font-medium text-[#047857]" onClick={() => setMobileOpen(false)}>Become Volunteer</Link>
          <Link href="/login" className="block text-sm font-medium text-[#047857]" onClick={() => setMobileOpen(false)}>Login</Link>
        </div>
      )}
    </nav>
  );
}
