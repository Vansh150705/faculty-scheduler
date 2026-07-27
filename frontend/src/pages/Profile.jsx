import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api, { getErrorMessage } from '../api/client';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { User as UserIcon, Lock, Save, Building2, Briefcase, Phone, MapPin } from 'lucide-react';

const Profile = () => {
  const { user, updateUser } = useContext(AuthContext);
  const toast = useToast();
  useDocumentTitle('Profile');
  const isFaculty = user.role === 'faculty';

  const [form, setForm] = useState({
    name: '', department: '', title: '', phone: '', officeLocation: '', bio: '',
  });
  const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);

  useEffect(() => {
    api
      .get('/auth/me')
      .then(({ data }) =>
        setForm({
          name: data.name || '',
          department: data.department || '',
          title: data.title || '',
          phone: data.phone || '',
          officeLocation: data.officeLocation || '',
          bio: data.bio || '',
        })
      )
      .catch((e) => toast.error(getErrorMessage(e)));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onField = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const saveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const { data } = await api.put('/auth/profile', form);
      updateUser({ name: data.user.name, department: data.user.department, title: data.user.title });
      toast.success('Profile updated');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (pwd.newPassword !== pwd.confirm) return toast.error('New passwords do not match');
    setSavingPwd(true);
    try {
      await api.put('/auth/password', {
        currentPassword: pwd.currentPassword,
        newPassword: pwd.newPassword,
      });
      toast.success('Password changed');
      setPwd({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSavingPwd(false);
    }
  };

  return (
    <div className="container max-w-4xl animate-slide-up">
      <div className="mb-10 p-8 glass-panel rounded-2xl flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-primary text-white flex items-center justify-center text-2xl font-extrabold shrink-0">
          {user.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-3xl font-extrabold m-0 text-text-main">{user.name}</h1>
          <p className="text-text-muted m-0 capitalize">{user.role}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile details */}
        <div className="glass-card p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-xl bg-primary-light text-primary flex items-center justify-center">
              <UserIcon size={22} />
            </div>
            <h2 className="text-xl font-bold m-0 text-text-main">Profile Details</h2>
          </div>

          <form onSubmit={saveProfile} className="flex flex-col gap-4">
            <div>
              <label className="label">Full Name</label>
              <input className="input-field" name="name" value={form.name} onChange={onField} required />
            </div>

            {isFaculty && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label flex items-center gap-1"><Building2 size={14} /> Department</label>
                    <input className="input-field" name="department" value={form.department} onChange={onField} placeholder="Computer Science" />
                  </div>
                  <div>
                    <label className="label flex items-center gap-1"><Briefcase size={14} /> Title</label>
                    <input className="input-field" name="title" value={form.title} onChange={onField} placeholder="Professor" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label flex items-center gap-1"><Phone size={14} /> Phone</label>
                    <input className="input-field" name="phone" value={form.phone} onChange={onField} placeholder="+1 555 0100" />
                  </div>
                  <div>
                    <label className="label flex items-center gap-1"><MapPin size={14} /> Office</label>
                    <input className="input-field" name="officeLocation" value={form.officeLocation} onChange={onField} placeholder="Turing Hall 204" />
                  </div>
                </div>
                <div>
                  <label className="label">Bio</label>
                  <textarea className="input-field resize-none" rows={3} name="bio" value={form.bio} onChange={onField} maxLength={500} placeholder="A short introduction for students" />
                </div>
              </>
            )}

            <button type="submit" disabled={savingProfile} className="btn btn-primary mt-2">
              <Save size={18} /> {savingProfile ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Change password */}
        <div className="glass-card p-8 self-start">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-xl bg-primary-light text-primary flex items-center justify-center">
              <Lock size={22} />
            </div>
            <h2 className="text-xl font-bold m-0 text-text-main">Change Password</h2>
          </div>

          <form onSubmit={savePassword} className="flex flex-col gap-4">
            <div>
              <label className="label">Current Password</label>
              <input className="input-field" type="password" value={pwd.currentPassword} onChange={(e) => setPwd({ ...pwd, currentPassword: e.target.value })} required />
            </div>
            <div>
              <label className="label">New Password</label>
              <input className="input-field" type="password" value={pwd.newPassword} onChange={(e) => setPwd({ ...pwd, newPassword: e.target.value })} required minLength={6} />
            </div>
            <div>
              <label className="label">Confirm New Password</label>
              <input className="input-field" type="password" value={pwd.confirm} onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })} required />
            </div>
            <button type="submit" disabled={savingPwd} className="btn btn-primary mt-2">
              <Lock size={18} /> {savingPwd ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
