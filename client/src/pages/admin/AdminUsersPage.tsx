import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api.ts';
import { User, Role, AccountStatus } from '../../types/index.ts';
import { ChevronLeft, UserPlus, Ban, CheckCircle2, ShieldCheck, Mail, Phone } from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<string>('');

  // Invite Agent Modal
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [agentName, setAgentName] = useState('');
  const [agentEmail, setAgentEmail] = useState('');
  const [agentPhone, setAgentPhone] = useState('');
  const [agentArea, setAgentArea] = useState('');
  const [inviting, setInviting] = useState(false);
  const [invitedCredentials, setInvitedCredentials] = useState<any>(null);

  const loadUsers = async () => {
    try {
      const res = await api.get('/admin/users', {
        params: roleFilter ? { role: roleFilter } : undefined
      });
      setUsers(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [roleFilter]);

  const handleToggleStatus = async (userId: string, currentStatus: AccountStatus) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    if (!confirm(`Are you sure you want to change user status to ${nextStatus}?`)) return;

    try {
      await api.patch(`/admin/users/${userId}/status`, { status: nextStatus });
      await loadUsers();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to update status');
    }
  };

  const handleInviteAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    try {
      const res = await api.post('/admin/agents/invite', {
        name: agentName,
        email: agentEmail,
        phone: agentPhone,
        area: agentArea
      });
      setInvitedCredentials(res.data.data);
      await loadUsers();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to invite agent');
    } finally {
      setInviting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link to="/admin" className="inline-flex items-center gap-1 text-xs font-bold text-slate-600">
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Operations</span>
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">User & Field Agent Governance</h1>
          <p className="text-xs text-slate-500 mt-1">Manage accounts, permissions, and invite qualified inspection staff</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-semibold outline-none"
          >
            <option value="">All Roles</option>
            <option value="USER">Standard Users</option>
            <option value="AGENT">Field Agents</option>
            <option value="ADMIN">Administrators</option>
          </select>

          <button
            onClick={() => {
              setShowInviteModal(true);
              setInvitedCredentials(null);
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl shadow-md transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Invite Agent</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Area / Zone</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Member Since</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50">
                  <td className="px-5 py-4">
                    <div className="font-bold text-slate-900">{u.name}</div>
                    <div className="text-[11px] text-slate-400">{u.email} • {u.phone || 'No phone'}</div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      u.role === 'ADMIN'
                        ? 'bg-amber-100 text-amber-800'
                        : u.role === 'AGENT'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{u.area || '—'}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      u.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-500">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-5 py-4 text-right">
                    {u.role !== 'ADMIN' && (
                      <button
                        onClick={() => handleToggleStatus(u.id, u.status)}
                        className={`px-3 py-1 rounded-lg text-[11px] font-bold ${
                          u.status === 'ACTIVE'
                            ? 'text-rose-700 bg-rose-50 hover:bg-rose-100'
                            : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                        }`}
                      >
                        {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Agent Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-900">Invite New Field Agent</h3>
            <p className="text-xs text-slate-500">
              Field agents carry out physical bench testing, pick up items, and collect Cash on Delivery.
            </p>

            {invitedCredentials ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-2 text-xs">
                <div className="font-bold text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Agent Account Created!</span>
                </div>
                <div>Email: <strong>{invitedCredentials.agent?.email}</strong></div>
                <div>Temporary Password: <strong className="font-mono bg-white px-2 py-0.5 rounded">{invitedCredentials.temporaryPassword}</strong></div>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setShowInviteModal(false);
                      setInvitedCredentials(null);
                    }}
                    className="w-full py-2 bg-emerald-600 text-white font-bold rounded-lg text-xs"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleInviteAgent} className="space-y-3">
                <input
                  type="text"
                  placeholder="Agent Full Name *"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg outline-none"
                />
                <input
                  type="email"
                  placeholder="Official Email *"
                  value={agentEmail}
                  onChange={(e) => setAgentEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg outline-none"
                />
                <input
                  type="text"
                  placeholder="Contact Mobile Number *"
                  value={agentPhone}
                  onChange={(e) => setAgentPhone(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg outline-none"
                />
                <input
                  type="text"
                  placeholder="Assigned Operational Area / Zone *"
                  value={agentArea}
                  onChange={(e) => setAgentArea(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg outline-none"
                />

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={inviting}
                    className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl disabled:opacity-50"
                  >
                    {inviting ? 'Creating...' : 'Create Agent Account'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

