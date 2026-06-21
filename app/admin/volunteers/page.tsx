'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import DashboardLayout from '../../components/DashboardLayout';
import { CircleCheck as CheckCircle, Circle as XCircle, Loader as Loader2, Search } from 'lucide-react';

interface VolunteerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  skills: string[];
  status: string;
  created_at: string;
}

export default function VolunteersPage() {
  const router = useRouter();
  const [volunteers, setVolunteers] = useState<VolunteerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        router.push('/login');
        return;
      }
      const userId = sessionData.session.user.id;
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).maybeSingle();
      if (profile?.role !== 'admin') {
        router.push('/dashboard');
        return;
      }
      const { data } = await supabase.from('profiles').select('*').eq('role', 'volunteer').order('created_at', { ascending: false });
      setVolunteers(data || []);
      setLoading(false);
    };
    fetchData();
  }, [router]);

  const handleStatus = async (id: string, status: 'approved' | 'rejected') => {
    setUpdating(id);
    const { error } = await supabase.from('profiles').update({ status }).eq('id', id);
    if (error) {
      alert('Failed to update: ' + error.message);
    } else {
      setVolunteers((prev) => prev.map((v) => (v.id === id ? { ...v, status } : v)));
    }
    setUpdating(null);
  };

  const filtered = volunteers.filter((v) => {
    const q = search.toLowerCase();
    return (
      v.name.toLowerCase().includes(q) ||
      v.email.toLowerCase().includes(q) ||
      v.city?.toLowerCase().includes(q) ||
      v.skills?.some((s) => s.toLowerCase().includes(q))
    );
  });

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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Volunteer Management</h1>
          <p className="text-gray-600">Review and manage volunteer applications.</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search volunteers..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#047857]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3 font-semibold text-gray-700">Name</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-700">City</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-700">Skills</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-700">Status</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{v.name}</div>
                      <div className="text-xs text-gray-500">{v.email}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{v.city || '-'}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {v.skills?.map((s, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-[#047857]/10 text-[#047857] text-xs">{s}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          v.status === 'approved'
                            ? 'bg-green-100 text-green-700'
                            : v.status === 'rejected'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {v.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {v.status !== 'approved' && (
                          <button
                            onClick={() => handleStatus(v.id, 'approved')}
                            disabled={updating === v.id}
                            className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-1"
                          >
                            {updating === v.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                            Approve
                          </button>
                        )}
                        {v.status !== 'rejected' && (
                          <button
                            onClick={() => handleStatus(v.id, 'rejected')}
                            disabled={updating === v.id}
                            className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-1"
                          >
                            {updating === v.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                            Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-500">No volunteers found.</div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
