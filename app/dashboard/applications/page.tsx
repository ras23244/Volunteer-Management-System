'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import DashboardLayout from '../../components/DashboardLayout';
import { Calendar, MapPin, CircleCheck as CheckCircle, Circle as XCircle, Loader as Loader2 } from 'lucide-react';

interface Application {
  id: string;
  status: string;
  created_at: string;
  events: {
    id: string;
    title: string;
    date: string;
    location: string;
    category: string;
  }[];
}

export default function ApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        router.push('/login');
        return;
      }
      const { data } = await supabase
        .from('applications')
        .select('id, status, created_at, events(id, title, date, location, category)')
        .eq('volunteer_id', sessionData.session.user.id)
        .order('created_at', { ascending: false });
      setApplications(data || []);
      setLoading(false);
    };
    fetchData();
  }, [router]);

  const handleWithdraw = async (appId: string) => {
    setWithdrawing(appId);
    const { error } = await supabase.from('applications').delete().eq('id', appId);
    if (error) {
      alert('Failed to withdraw: ' + error.message);
    } else {
      setApplications((prev) => prev.filter((a) => a.id !== appId));
    }
    setWithdrawing(null);
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">My Applications</h1>
          <p className="text-gray-600">Track your event applications and their status.</p>
        </div>
        <div className="space-y-4">
          {applications.map((app) => (
            <div key={app.id} className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{app.events?.[0]?.title || 'Event'}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        app.status === 'approved'
                          ? 'bg-green-100 text-green-700'
                          : app.status === 'rejected'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-[#047857]" />
                      <span>{app.events?.[0]?.date ? new Date(app.events[0].date).toLocaleDateString() : '-'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-[#047857]" />
                      <span>{app.events?.[0]?.location || '-'}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-[#047857]/10 text-[#047857] text-xs font-medium">
                      {app.events?.[0]?.category || '-'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleWithdraw(app.id)}
                  disabled={withdrawing === app.id}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {withdrawing === app.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                  Withdraw
                </button>
              </div>
            </div>
          ))}
          {applications.length === 0 && (
            <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-100">
              You haven&apos;t applied to any events yet.
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
