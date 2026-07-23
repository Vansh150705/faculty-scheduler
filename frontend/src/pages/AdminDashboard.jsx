import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api, { getErrorMessage } from '../api/client';
import StatCard from '../components/StatCard';
import { Users, GraduationCap, Briefcase, CalendarClock, Search, Trash2, ShieldCheck } from 'lucide-react';

const ROLE_BADGE = {
  admin: 'badge-primary',
  faculty: 'badge-success',
  student: 'badge-warning',
};

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [confirmingId, setConfirmingId] = useState(null);

  const loadStats = () => api.get('/stats').then(({ data }) => setStats(data)).catch(() => {});

  const loadUsers = () => {
    const params = {};
    if (search) params.search = search;
    if (roleFilter) params.role = roleFilter;
    api.get('/admin/users', { params }).then(({ data }) => setUsers(data)).catch((e) => toast.error(getErrorMessage(e)));
  };

  useEffect(() => {
    loadStats();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const t = setTimeout(loadUsers, 250); // debounce search/filter
    return () => clearTimeout(t);
  }, [search, roleFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const changeRole = async (id, role) => {
    try {
      await api.put(`/admin/users/${id}/role`, { role });
      setUsers((cur) => cur.map((u) => (u._id === id ? { ...u, role } : u)));
      toast.success('Role updated');
      loadStats();
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const removeUser = async (id) => {
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers((cur) => cur.filter((u) => u._id !== id));
      setConfirmingId(null);
      toast.success('User deleted');
      loadStats();
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  return (
    <div className="container animate-slide-up">
      <div className="mb-8 p-8 glass-panel rounded-2xl flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center shrink-0">
          <ShieldCheck size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold m-0 text-text-main">Admin Panel</h1>
          <p className="text-text-muted m-0">System-wide overview and user management.</p>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard icon={Users} label="Total users" value={stats.totalUsers} accent="primary" />
          <StatCard icon={Briefcase} label="Faculty" value={stats.usersByRole.faculty} accent="success" />
          <StatCard icon={GraduationCap} label="Students" value={stats.usersByRole.student} accent="warning" />
          <StatCard icon={CalendarClock} label="Appointments" value={stats.totalAppointments} accent="secondary" />
        </div>
      )}

      {stats?.topFaculty?.length > 0 && (
        <div className="glass-card p-6 mb-8">
          <h3 className="text-lg font-bold mb-4 text-text-main">Most booked faculty</h3>
          <div className="flex flex-col gap-3">
            {stats.topFaculty.map((f, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-primary-light text-primary text-sm font-bold flex items-center justify-center">{i + 1}</span>
                  <div>
                    <p className="font-semibold text-text-main m-0">{f.name}</p>
                    <p className="text-xs text-text-muted m-0">{f.department || '—'}</p>
                  </div>
                </div>
                <span className="badge badge-primary">{f.count} bookings</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User management */}
      <div className="glass-card p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold m-0 text-text-main">Users</h2>
          <div className="flex gap-3">
            <div className="relative">
              <input
                className="input-field pl-10 py-2.5"
                placeholder="Search name or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            </div>
            <select className="input-field py-2.5 cursor-pointer" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="">All roles</option>
              <option value="student">Students</option>
              <option value="faculty">Faculty</option>
              <option value="admin">Admins</option>
            </select>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td className="font-semibold text-text-main">{u.name}</td>
                  <td className="text-text-muted">{u.email}</td>
                  <td>
                    <select
                      className={`badge ${ROLE_BADGE[u.role]} border-0 cursor-pointer`}
                      value={u.role}
                      onChange={(e) => changeRole(u._id, e.target.value)}
                      disabled={u._id === user.id}
                    >
                      <option value="student">student</option>
                      <option value="faculty">faculty</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td className="text-right">
                    {u._id === user.id ? (
                      <span className="text-xs text-text-light">You</span>
                    ) : confirmingId === u._id ? (
                      <span className="inline-flex gap-2">
                        <button onClick={() => removeUser(u._id)} className="text-xs font-bold text-danger hover:underline">Confirm</button>
                        <button onClick={() => setConfirmingId(null)} className="text-xs text-text-muted hover:underline">Cancel</button>
                      </span>
                    ) : (
                      <button onClick={() => setConfirmingId(u._id)} className="btn-icon text-text-muted hover:text-danger" title="Delete user">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center text-text-muted py-8">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
