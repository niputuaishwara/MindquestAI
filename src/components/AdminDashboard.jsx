import React, { useState, useEffect } from 'react';
import { db } from '@/config/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { ArrowLeft, Users, Activity, Shield, Key } from 'lucide-react';

export function AdminDashboard({ onBack }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const snap = await getDocs(collection(db, 'users'));
        const userList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsers(userList);
      } catch (err) {
        console.error("Gagal mengambil data pengguna", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const psychologists = users.filter(u => u.role === 'psychologist');
  const regularUsers = users.filter(u => u.role === 'user');

  return (
    <div className="min-h-[100dvh] bg-slate-50 text-slate-900 font-sans p-6 md:p-12 overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        <header className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <Shield className="w-6 h-6 text-red-500" />
                Admin Dashboard
              </h1>
              <p className="text-sm text-slate-500">MindQuest Super Admin Panel</p>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="text-center text-slate-500 mt-20">Memuat data...</div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                <div className="p-4 bg-indigo-100 rounded-xl">
                  <Users className="w-8 h-8 text-indigo-600" />
                </div>
                <div>
                  <div className="text-sm text-slate-500 font-bold">Total Pengguna Anonim</div>
                  <div className="text-3xl font-bold text-slate-800">{regularUsers.length}</div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                <div className="p-4 bg-emerald-100 rounded-xl">
                  <Activity className="w-8 h-8 text-emerald-600" />
                </div>
                <div>
                  <div className="text-sm text-slate-500 font-bold">Total Psikolog</div>
                  <div className="text-3xl font-bold text-slate-800">{psychologists.length}</div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                <div className="p-4 bg-red-100 rounded-xl">
                  <Key className="w-8 h-8 text-red-600" />
                </div>
                <div>
                  <div className="text-sm text-slate-500 font-bold">Role Akses</div>
                  <div className="text-sm font-bold text-slate-800">Super Admin Aktif</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Daftar Pengguna Sistem</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-bold">
                    <tr>
                      <th className="px-4 py-3 rounded-tl-lg">UID</th>
                      <th className="px-4 py-3">Pseudonym / Email</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3 rounded-tr-lg">Dibuat Pada</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-mono text-xs text-slate-500">{u.id}</td>
                        <td className="px-4 py-3 font-bold text-slate-800">{u.pseudonym || u.email || 'N/A'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            u.role === 'admin' ? 'bg-red-100 text-red-700' :
                            u.role === 'psychologist' ? 'bg-emerald-100 text-emerald-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {u.role || 'user'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {u.createdAt ? new Date(u.createdAt.seconds * 1000).toLocaleDateString('id-ID') : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
