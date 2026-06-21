import Navbar from './components/Navbar';
import Link from 'next/link';
import { Heart, Users, Globe, Calendar, MapPin, Tag } from 'lucide-react';

export default function Home() {
  return (
    <>
      <Navbar />
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#047857] to-[#065f46] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white" />
          <div className="absolute bottom-20 right-20 w-48 h-48 rounded-full bg-white" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 relative">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Empowering Communities, <span className="text-[#FACC15]">One Step at a Time</span>
            </h1>
            <p className="text-lg md:text-xl text-emerald-50 mb-8 leading-relaxed">
              Join NayePankh Foundation in our mission to create lasting change. Volunteer, donate, and be part of something bigger.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/signup" className="px-6 py-3 rounded-lg bg-[#FACC15] text-[#065f46] font-semibold hover:bg-[#eab308] transition">
                Become a Volunteer
              </Link>
              <Link href="/login" className="px-6 py-3 rounded-lg border border-white/30 text-white font-semibold hover:bg-white/10 transition">
                Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Volunteer Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative rounded-2xl overflow-hidden bg-[#f0fdf4] flex items-center justify-center min-h-[300px]">
              <div className="text-center p-8">
                <div className="w-20 h-20 rounded-full bg-[#047857] flex items-center justify-center mx-auto mb-4">
                  <Users className="w-10 h-10 text-white" />
                </div>
                <p className="text-[#047857] font-semibold text-lg">Community Volunteers</p>
              </div>
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Your Time Can Change Someone&apos;s Life
              </h2>
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#047857]/10 flex items-center justify-center shrink-0">
                    <Heart className="w-5 h-5 text-[#047857]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Make an Impact</h3>
                    <p className="text-sm text-gray-600">Directly contribute to social causes and see the difference you make.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#047857]/10 flex items-center justify-center shrink-0">
                    <Globe className="w-5 h-5 text-[#047857]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Build Connections</h3>
                    <p className="text-sm text-gray-600">Meet like-minded people and grow your network in the social sector.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#047857]/10 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5 text-[#047857]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Flexible Scheduling</h3>
                    <p className="text-sm text-gray-600">Choose events that fit your calendar and availability.</p>
                  </div>
                </div>
              </div>
              <Link href="/signup" className="inline-block px-6 py-3 rounded-lg bg-[#047857] text-white font-semibold hover:bg-[#065f46] transition">
                Become Volunteer
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Upcoming Events</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Be part of our upcoming initiatives. Browse events and apply to volunteer.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <EventCard title="Food Distribution Drive" date="2026-07-15" location="Delhi" category="Social Welfare" />
            <EventCard title="Education for All" date="2026-07-22" location="Mumbai" category="Education" />
            <EventCard title="Tree Plantation Drive" date="2026-08-05" location="Bangalore" category="Environment" />
          </div>
          <div className="text-center mt-10">
            <Link href="/login" className="inline-block px-6 py-3 rounded-lg border border-[#047857] text-[#047857] font-semibold hover:bg-[#047857] hover:text-white transition">
              View All Events
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#047857] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#047857] font-bold text-sm">N</div>
                <span className="text-lg font-bold">NayePankh Foundation</span>
              </div>
              <p className="text-emerald-100 text-sm">Empowering communities through volunteerism and social initiatives.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <div className="space-y-2 text-sm text-emerald-100">
                <Link href="/" className="block hover:text-white">Home</Link>
                <Link href="/signup" className="block hover:text-white">Become Volunteer</Link>
                <Link href="/login" className="block hover:text-white">Login</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <p className="text-sm text-emerald-100">contact@nayepankh.org</p>
              <p className="text-sm text-emerald-100">+91 98765 43210</p>
            </div>
          </div>
          <div className="border-t border-white/20 mt-10 pt-6 text-center text-sm text-emerald-100">
            © 2026 NayePankh Foundation. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  );
}

function EventCard({ title, date, location, category }: { title: string; date: string; location: string; category: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-lg transition">
      <div className="flex items-center gap-2 mb-3">
        <span className="px-3 py-1 rounded-full bg-[#047857]/10 text-[#047857] text-xs font-semibold">{category}</span>
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-3">{title}</h3>
      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#047857]" />
          <span>{date}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#047857]" />
          <span>{location}</span>
        </div>
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-[#047857]" />
          <span>{category}</span>
        </div>
      </div>
    </div>
  );
}
