'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import DashboardLayout from '../components/DashboardLayout';
import { Calendar, ClipboardList, Clock, TrendingUp } from 'lucide-react';

interface Profile {
  id: string;
  name: string;
  role: string;
  status: string;
}

interface EventItem {
  id: string;
  title: string;
  date: string;
  location: string;
  category: string;
}

export default function VolunteerDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [applicationsCount, setApplicationsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        router.push('/login');
        return;
      }

      const userId = sessionData.session.user.id;

      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, name, role, status')
        .eq('id', userId)
        .maybeSingle();

      if (profileData?.role === 'admin') {
        router.push('/admin');
        return;
      }

      setProfile(profileData);

      const { data: eventsData } = await supabase
        .from('events')
        .select('id, title, date, location, category')
        .gte('date', new Date().toISOString())
        .order('date', { ascending: true })
        .limit(3);

      setEvents(eventsData || []);

      const { count } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('volunteer_id', userId);

      setApplicationsCount(count || 0);
      setLoading(false);
    };

    fetchData();
  }, [router]);

  if (loading) {
    return (
      <DashboardLayout role="volunteer">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-[#047857] border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="volunteer">
      <div className="space-y-6">
        {/* Welcome */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Hello {profile?.name || 'Volunteer'} 👋
          </h1>
          <p className="text-gray-600 mt-1">
            Welcome back to NayePankh Foundation. Here is your volunteering overview.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard icon={ClipboardList} label="Events Joined" value={applicationsCount} />
          <StatCard icon={Calendar} label="Upcoming Events" value={events.length} />
          <StatCard icon={Clock} label="Status" value={profile?.status || 'pending'} color={profile?.status === 'approved' ? 'text-green-600' : 'text-amber-600'} />
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Upcoming Events</h2>
            <button
              onClick={() => router.push('/dashboard/events')}
              className="text-sm text-[#047857] font-medium hover:underline"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {events.length === 0 ? (
              <p className="text-sm text-gray-500">No upcoming events found.</p>
            ) : (
              events.map((ev) => (
                <div key={ev.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition">
                  <div>
                    <h3 className="font-semibold text-gray-900">{ev.title}</h3>
                    <p className="text-sm text-gray-600">{ev.location} • {new Date(ev.date).toLocaleDateString()}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#047857]/10 text-[#047857] text-xs font-semibold">{ev.category}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: number | string; color?: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4">
      <div className="w-12 h-12 rounded-lg bg-[#047857]/10 flex items-center justify-center">
        <Icon className="w-6 h-6 text-[#047857]" />
      </div>
      <div>
        <p className="text-sm text-gray-600">{label}</p>
        <p className={`text-xl font-bold text-gray-900 ${color || ''}`}>{value}</p>
      </div>
    </div>
  );
}
