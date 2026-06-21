'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import DashboardLayout from '../../components/DashboardLayout';
import { Calendar, MapPin, Tag, Users, CircleCheck as CheckCircle, Loader as Loader2 } from 'lucide-react';

interface EventItem {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  category: string;
  required_volunteers: number;
  created_at: string;
}

interface Application {
  id: string;
  event_id: string;
  status: string;
}

export default function VolunteerEventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        router.push('/login');
        return;
      }
      const uid = sessionData.session.user.id;
      setUserId(uid);

      const { data: eventsData } = await supabase
        .from('events')
        .select('*')
        .gte('date', new Date().toISOString())
        .order('date', { ascending: true });

      const { data: appsData } = await supabase
        .from('applications')
        .select('id, event_id, status')
        .eq('volunteer_id', uid);

      setEvents(eventsData || []);
      setApplications(appsData || []);
      setLoading(false);
    };
    fetchData();
  }, [router]);

  const getAppStatus = (eventId: string) => {
    const app = applications.find((a) => a.event_id === eventId);
    return app?.status || null;
  };

  const getAppId = (eventId: string) => {
    const app = applications.find((a) => a.event_id === eventId);
    return app?.id || null;
  };

  const handleApply = async (eventId: string) => {
    if (!userId) return;
    setApplying(eventId);
    const { data, error } = await supabase
      .from('applications')
      .insert({ event_id: eventId, volunteer_id: userId })
      .select()
      .single();
    if (error) {
      alert('Failed to apply: ' + error.message);
    } else {
      setApplications((prev) => [...prev, data]);
    }
    setApplying(null);
  };

  const handleWithdraw = async (eventId: string) => {
    const appId = getAppId(eventId);
    if (!appId) return;
    setApplying(eventId);
    const { error } = await supabase.from('applications').delete().eq('id', appId);
    if (error) {
      alert('Failed to withdraw: ' + error.message);
    } else {
      setApplications((prev) => prev.filter((a) => a.id !== appId));
    }
    setApplying(null);
  };

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
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Upcoming Events</h1>
          <p className="text-gray-600">Browse and apply to events you want to volunteer for.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {events.map((ev) => {
            const status = getAppStatus(ev.id);
            return (
              <div key={ev.id} className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="px-3 py-1 rounded-full bg-[#047857]/10 text-[#047857] text-xs font-semibold">{ev.category}</span>
                  {status === 'applied' && (
                    <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">Applied</span>
                  )}
                  {status === 'approved' && (
                    <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">Approved</span>
                  )}
                  {status === 'rejected' && (
                    <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">Rejected</span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{ev.title}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{ev.description}</p>
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#047857]" />
                    <span>{new Date(ev.date).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#047857]" />
                    <span>{ev.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#047857]" />
                    <span>{ev.required_volunteers} volunteers needed</span>
                  </div>
                </div>
                {status === 'applied' || status === 'approved' ? (
                  <button
                    onClick={() => handleWithdraw(ev.id)}
                    disabled={applying === ev.id}
                    className="w-full py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {applying === ev.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Withdraw'}
                  </button>
                ) : (
                  <button
                    onClick={() => handleApply(ev.id)}
                    disabled={applying === ev.id || status === 'rejected'}
                    className="w-full py-2 rounded-lg bg-[#047857] text-white font-medium hover:bg-[#065f46] transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {applying === ev.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    Apply
                  </button>
                )}
              </div>
            );
          })}
        </div>
        {events.length === 0 && (
          <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-100">
            No upcoming events available.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
