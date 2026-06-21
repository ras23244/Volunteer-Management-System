'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import DashboardLayout from '../../components/DashboardLayout';
import { Save, Loader as Loader2 } from 'lucide-react';

interface Profile {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  skills: string[];
  interests: string[];
  role: string;
  status: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [interestInput, setInterestInput] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        router.push('/login');
        return;
      }
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sessionData.session.user.id)
        .maybeSingle();
      if (data) {
        setProfile(data);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [router]);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        name: profile.name,
        phone: profile.phone,
        city: profile.city,
        skills: profile.skills,
        interests: profile.interests,
      })
      .eq('id', profile.id);
    setSaving(false);
    if (error) {
      alert('Failed to save profile: ' + error.message);
    }
  };

  const addSkill = () => {
    if (!skillInput.trim()) return;
    setProfile((prev) => (prev ? { ...prev, skills: [...prev.skills, skillInput.trim()] } : prev));
    setSkillInput('');
  };

  const removeSkill = (index: number) => {
    setProfile((prev) => (prev ? { ...prev, skills: prev.skills.filter((_, i) => i !== index) } : prev));
  };

  const addInterest = () => {
    if (!interestInput.trim()) return;
    setProfile((prev) => (prev ? { ...prev, interests: [...prev.interests, interestInput.trim()] } : prev));
    setInterestInput('');
  };

  const removeInterest = (index: number) => {
    setProfile((prev) => (prev ? { ...prev, interests: prev.interests.filter((_, i) => i !== index) } : prev));
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

  if (!profile) {
    return (
      <DashboardLayout role="volunteer">
        <div className="text-center py-12 text-gray-500">Profile not found.</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="volunteer">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#047857]"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  disabled
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-500"
                  value={profile.email}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#047857]"
                  value={profile.phone || ''}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#047857]"
                  value={profile.city || ''}
                  onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#047857]"
                  placeholder="Add a skill"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                />
                <button
                  onClick={addSkill}
                  className="px-4 py-2 rounded-lg bg-[#047857] text-white text-sm font-medium hover:bg-[#065f46]"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((s, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#047857]/10 text-[#047857] text-sm">
                    {s}
                    <button onClick={() => removeSkill(i)} className="text-[#047857] hover:text-[#065f46] font-bold">&times;</button>
                  </span>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Interested Areas</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#047857]"
                  placeholder="Add an interest"
                  value={interestInput}
                  onChange={(e) => setInterestInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addInterest()}
                />
                <button
                  onClick={addInterest}
                  className="px-4 py-2 rounded-lg bg-[#047857] text-white text-sm font-medium hover:bg-[#065f46]"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((s, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#FACC15]/20 text-[#92400e] text-sm">
                    {s}
                    <button onClick={() => removeInterest(i)} className="text-[#92400e] hover:text-[#78350f] font-bold">&times;</button>
                  </span>
                ))}
              </div>
            </div>
            <div className="pt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Status:</span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${profile.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {profile.status}
                </span>
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 rounded-lg bg-[#047857] text-white font-medium hover:bg-[#065f46] transition disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
