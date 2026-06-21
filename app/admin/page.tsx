'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import DashboardLayout from '../components/DashboardLayout';
import { Users, UserCheck, UserX, Calendar, TrendingUp } from 'lucide-react';

interface Stats {
  totalVolunteers: number;
  approvedVolunteers: number;
  pendingRequests: number;
  totalEvents: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    totalVolunteers: 0,
    approvedVolunteers: 0,
    pendingRequests: 0,
    totalEvents: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        router.push('/login');
        return;
      }
      const userId = sessionData.session.user.id;
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle();
      if (profile?.role !== 'admin') {
        router.push('/dashboard');
        return;
      }

      const { data: volunteers } = await supabase.from('profiles').select('status', { count: 'exact' }).eq('role', 'volunteer');
      const totalVolunteers = volunteers?.length || 0;
      const approvedVolunteers = volunteers?.filter((v) => v.status === 'approved').length || 0;
      const pendingRequests = volunteers?.filter((v) => v.status === 'pending').length || 0;

      const { count: eventsCount } = await supabase.from('events').select('*', { count: 'exact', head: true });

      setStats({
        totalVolunteers,
        approvedVolunteers,
        pendingRequests,
        totalEvents: eventsCount || 0,
      });
      setLoading(false);
    };
    fetchData();
  }, [router]);

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-[#047857] border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Overview of volunteers, events, and applications.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Users} label="Total Volunteers" value={stats.totalVolunteers} />
          <StatCard icon={UserCheck} label="Approved Volunteers" value={stats.approvedVolunteers} color="text-green-600" />
          <StatCard icon={UserX} label="Pending Requests" value={stats.pendingRequests} color="text-amber-600" />
          <StatCard icon={Calendar} label="Total Events" value={stats.totalEvents} />
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: number; color?: string }) {
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
