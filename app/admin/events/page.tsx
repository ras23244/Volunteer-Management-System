'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import DashboardLayout from '../../components/DashboardLayout';
import { Plus, Pencil, Trash2, X, Loader as Loader2, Calendar, MapPin, Users, Tag } from 'lucide-react';

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

export default function AdminEventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    category: '',
    required_volunteers: 0,
  });

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
      const { data } = await supabase.from('events').select('*').order('date', { ascending: true });
      setEvents(data || []);
      setLoading(false);
    };
    fetchData();
  }, [router]);

  const openCreate = () => {
    setEditingEvent(null);
    setForm({ title: '', description: '', date: '', location: '', category: '', required_volunteers: 0 });
    setModalOpen(true);
  };

  const openEdit = (ev: EventItem) => {
    setEditingEvent(ev);
    setForm({
      title: ev.title,
      description: ev.description || '',
      date: ev.date.slice(0, 16),
      location: ev.location,
      category: ev.category,
      required_volunteers: ev.required_volunteers,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    if (editingEvent) {
      const { error } = await supabase.from('events').update(form).eq('id', editingEvent.id);
      if (error) {
        alert('Failed to update: ' + error.message);
      } else {
        setEvents((prev) => prev.map((ev) => (ev.id === editingEvent.id ? { ...ev, ...form, date: new Date(form.date).toISOString() } : ev)));
        setModalOpen(false);
      }
    } else {
      const { data, error } = await supabase.from('events').insert(form).select().single();
      if (error) {
        alert('Failed to create: ' + error.message);
      } else {
        setEvents((prev) => [...prev, data]);
        setModalOpen(false);
      }
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    setDeleting(id);
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) {
      alert('Failed to delete: ' + error.message);
    } else {
      setEvents((prev) => prev.filter((ev) => ev.id !== id));
    }
    setDeleting(null);
  };

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
        <div className="flex items-center justify-between bg-white rounded-xl border border-gray-100 p-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Events Management</h1>
            <p className="text-gray-600">Create, edit, and manage NGO events.</p>
          </div>
          <button
            onClick={openCreate}
            className="px-4 py-2 rounded-lg bg-[#047857] text-white font-medium hover:bg-[#065f46] transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Event
          </button>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {events.map((ev) => (
            <div key={ev.id} className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex items-start justify-between mb-3">
                <span className="px-3 py-1 rounded-full bg-[#047857]/10 text-[#047857] text-xs font-semibold">{ev.category}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEdit(ev)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(ev.id)}
                    disabled={deleting === ev.id}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition disabled:opacity-50"
                  >
                    {deleting === ev.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{ev.title}</h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{ev.description}</p>
              <div className="space-y-2 text-sm text-gray-600">
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
            </div>
          ))}
        </div>
        {events.length === 0 && (
          <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-100">
            No events created yet.
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">{editingEvent ? 'Edit Event' : 'Create Event'}</h2>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#047857]"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#047857]"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#047857]"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#047857]"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#047857]"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Required Volunteers</label>
                  <input
                    type="number"
                    required
                    min={1}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#047857]"
                    value={form.required_volunteers}
                    onChange={(e) => setForm({ ...form, required_volunteers: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-[#047857] text-white font-medium hover:bg-[#065f46] transition disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
