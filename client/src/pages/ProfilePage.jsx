import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import StitchNavbar from '../components/StitchNavbar';
import StitchFooter from '../components/StitchFooter';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';

const emptyAddr = () => ({
  fullAddress: '',
  city: '',
  pincode: '',
  landmark: '',
});

const formatDate = (d) => {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return '—';
  }
};

export default function ProfilePage() {
  const { user, refreshUser, updateUser, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: emptyAddr(),
  });
  const [changePassword, setChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const syncFromUser = useCallback((u) => {
    if (!u) return;
    setForm({
      name: u.name || '',
      phone: u.phone || '',
      address: {
        fullAddress: u.address?.fullAddress ?? '',
        city: u.address?.city ?? '',
        pincode: u.address?.pincode ?? '',
        landmark: u.address?.landmark ?? '',
      },
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        await refreshUser();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshUser]);

  useEffect(() => {
    syncFromUser(user);
  }, [user, syncFromUser]);

  const handleField = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddress = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      address: { ...prev.address, [name]: value },
    }));
  };

  const resetPasswordFields = () => {
    setChangePassword(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleCancel = () => {
    syncFromUser(user);
    resetPasswordFields();
    setIsEditing(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (changePassword) {
      if (!newPassword || newPassword.length < 6) {
        toast.error('New password must be at least 6 characters');
        return;
      }
      if (newPassword !== confirmPassword) {
        toast.error('New passwords do not match');
        return;
      }
      if (!currentPassword) {
        toast.error('Enter your current password to change it');
        return;
      }
    }

    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim() === '' ? null : form.phone.trim(),
      address: {
        fullAddress: form.address.fullAddress.trim(),
        city: form.address.city.trim(),
        pincode: form.address.pincode.trim(),
        landmark: form.address.landmark.trim(),
      },
    };

    if (changePassword && newPassword) {
      payload.currentPassword = currentPassword;
      payload.newPassword = newPassword;
    }

    setSaving(true);
    try {
      const { data } = await API.patch('/auth/profile', payload);
      if (data.success && data.data) {
        updateUser(data.data);
        toast.success(data.message || 'Profile saved');
        setIsEditing(false);
        resetPasswordFields();
      }
    } catch {
      // axios interceptor surfaces API message
    } finally {
      setSaving(false);
    }
  };

  const uid = user?.id || user?._id;

  return (
    <div className="bg-[var(--color-surface)] text-[var(--color-on-surface)] min-h-screen flex flex-col">
      <StitchNavbar activeLink="" />

      <main className="flex-1 pt-28 pb-20 max-w-3xl mx-auto px-4 sm:px-6 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Your profile</h1>
            <p className="text-sm text-[var(--color-on-surface-variant)] mt-1">
              View and update your account details and delivery address.
            </p>
          </div>
          {!loading && (
            <div className="flex flex-wrap gap-2">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="gradient-primary text-white font-bold py-2.5 px-6 rounded-full text-sm shadow-md"
                >
                  Edit profile
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="py-2.5 px-6 rounded-full text-sm font-bold border border-[var(--color-outline-variant)] text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-high)] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    form="profile-form"
                    disabled={saving}
                    className="gradient-primary text-white font-bold py-2.5 px-6 rounded-full text-sm shadow-md disabled:opacity-60"
                  >
                    {saving ? 'Saving…' : 'Save changes'}
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <span className="material-symbols-outlined text-4xl animate-spin text-[var(--color-primary)]">
              refresh
            </span>
          </div>
        ) : (
          <form id="profile-form" onSubmit={handleSave} className="space-y-8">
            <section className="bg-[var(--color-surface-container-low)] rounded-3xl p-6 sm:p-8 border border-[var(--color-surface-variant)]">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--color-outline)] mb-6">
                Account
              </h2>
              <dl className="space-y-4 text-sm">
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <dt className="text-[var(--color-on-surface-variant)] font-medium">StudTrade ID</dt>
                  <dd className="font-bold text-[var(--color-on-surface)]">{user?.studtradeID || '—'}</dd>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <dt className="text-[var(--color-on-surface-variant)] font-medium">Email</dt>
                  <dd className="font-bold break-all">{user?.email || '—'}</dd>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <dt className="text-[var(--color-on-surface-variant)] font-medium">Verification</dt>
                  <dd>
                    {user?.isEmailVerified ? (
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                        <span className="material-symbols-outlined text-lg">verified</span>
                        Verified
                      </span>
                    ) : (
                      <span className="font-semibold text-amber-700">Not verified</span>
                    )}
                  </dd>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <dt className="text-[var(--color-on-surface-variant)] font-medium">Role</dt>
                  <dd className="font-bold capitalize">{user?.role || '—'}</dd>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <dt className="text-[var(--color-on-surface-variant)] font-medium">Member since</dt>
                  <dd className="font-bold">{formatDate(user?.createdAt)}</dd>
                </div>
                {user?.updatedAt && (
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                    <dt className="text-[var(--color-on-surface-variant)] font-medium">Last updated</dt>
                    <dd className="font-bold">{formatDate(user.updatedAt)}</dd>
                  </div>
                )}
              </dl>
            </section>

            <section className="bg-[var(--color-surface-container-low)] rounded-3xl p-6 sm:p-8 border border-[var(--color-surface-variant)]">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--color-outline)] mb-6">
                Personal
              </h2>
              <div className="space-y-5">
                <div>
                  <label htmlFor="name" className="block text-xs font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wide mb-2">
                    Display name
                  </label>
                  <input
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={handleField}
                    disabled={!isEditing}
                    autoComplete="name"
                    className="w-full rounded-2xl border border-[var(--color-surface-variant)] bg-[var(--color-surface)] px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-[var(--color-primary)]/25 disabled:opacity-70"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-xs font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wide mb-2">
                    Mobile (10 digits, India)
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    value={form.phone}
                    onChange={handleField}
                    disabled={!isEditing}
                    inputMode="numeric"
                    autoComplete="tel"
                    placeholder="9876543210"
                    className="w-full rounded-2xl border border-[var(--color-surface-variant)] bg-[var(--color-surface)] px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-[var(--color-primary)]/25 disabled:opacity-70"
                  />
                </div>
              </div>
            </section>

            <section className="bg-[var(--color-surface-container-low)] rounded-3xl p-6 sm:p-8 border border-[var(--color-surface-variant)]">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--color-outline)] mb-6">
                Delivery address
              </h2>
              <div className="space-y-5">
                <div>
                  <label htmlFor="fullAddress" className="block text-xs font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wide mb-2">
                    Full address
                  </label>
                  <textarea
                    id="fullAddress"
                    name="fullAddress"
                    value={form.address.fullAddress}
                    onChange={handleAddress}
                    disabled={!isEditing}
                    rows={3}
                    className="w-full rounded-2xl border border-[var(--color-surface-variant)] bg-[var(--color-surface)] px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-[var(--color-primary)]/25 disabled:opacity-70 resize-y min-h-[88px]"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="city" className="block text-xs font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wide mb-2">
                      City
                    </label>
                    <input
                      id="city"
                      name="city"
                      value={form.address.city}
                      onChange={handleAddress}
                      disabled={!isEditing}
                      className="w-full rounded-2xl border border-[var(--color-surface-variant)] bg-[var(--color-surface)] px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-[var(--color-primary)]/25 disabled:opacity-70"
                    />
                  </div>
                  <div>
                    <label htmlFor="pincode" className="block text-xs font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wide mb-2">
                      Pincode (6 digits)
                    </label>
                    <input
                      id="pincode"
                      name="pincode"
                      value={form.address.pincode}
                      onChange={handleAddress}
                      disabled={!isEditing}
                      inputMode="numeric"
                      maxLength={6}
                      className="w-full rounded-2xl border border-[var(--color-surface-variant)] bg-[var(--color-surface)] px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-[var(--color-primary)]/25 disabled:opacity-70"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="landmark" className="block text-xs font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wide mb-2">
                    Landmark (optional)
                  </label>
                  <input
                    id="landmark"
                    name="landmark"
                    value={form.address.landmark}
                    onChange={handleAddress}
                    disabled={!isEditing}
                    className="w-full rounded-2xl border border-[var(--color-surface-variant)] bg-[var(--color-surface)] px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-[var(--color-primary)]/25 disabled:opacity-70"
                  />
                </div>
              </div>
            </section>

            {isEditing && (
              <section className="bg-[var(--color-surface-container-low)] rounded-3xl p-6 sm:p-8 border border-[var(--color-surface-variant)]">
                <div className="flex items-center justify-between gap-4 mb-6">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--color-outline)]">
                    Password
                  </h2>
                  <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={changePassword}
                      onChange={(e) => {
                        setChangePassword(e.target.checked);
                        if (!e.target.checked) {
                          setCurrentPassword('');
                          setNewPassword('');
                          setConfirmPassword('');
                        }
                      }}
                      className="rounded border-[var(--color-outline)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                    />
                    Change password
                  </label>
                </div>
                {changePassword && (
                  <div className="space-y-5">
                    <div>
                      <label htmlFor="currentPassword" className="block text-xs font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wide mb-2">
                        Current password
                      </label>
                      <input
                        id="currentPassword"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        autoComplete="current-password"
                        className="w-full rounded-2xl border border-[var(--color-surface-variant)] bg-[var(--color-surface)] px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-[var(--color-primary)]/25"
                      />
                    </div>
                    <div>
                      <label htmlFor="newPassword" className="block text-xs font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wide mb-2">
                        New password
                      </label>
                      <input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        autoComplete="new-password"
                        className="w-full rounded-2xl border border-[var(--color-surface-variant)] bg-[var(--color-surface)] px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-[var(--color-primary)]/25"
                      />
                    </div>
                    <div>
                      <label htmlFor="confirmPassword" className="block text-xs font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wide mb-2">
                        Confirm new password
                      </label>
                      <input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        autoComplete="new-password"
                        className="w-full rounded-2xl border border-[var(--color-surface-variant)] bg-[var(--color-surface)] px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-[var(--color-primary)]/25"
                      />
                    </div>
                  </div>
                )}
                {!changePassword && (
                  <p className="text-sm text-[var(--color-on-surface-variant)]">
                    Turn on &quot;Change password&quot; to set a new password. Your other details can be saved without it.
                  </p>
                )}
              </section>
            )}

            <section className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2 border-t border-[var(--color-surface-variant)]">
              <button
                type="button"
                onClick={() => logout()}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--color-error)]/30 bg-[var(--color-error)]/5 px-6 py-3 text-sm font-bold text-[var(--color-error)] hover:bg-[var(--color-error)]/10 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">logout</span>
                Log out
              </button>
              {uid && (
                <Link
                  to={`/seller/${String(uid)}`}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--color-outline-variant)] px-6 py-3 text-sm font-bold text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-high)] transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">storefront</span>
                  View public seller page
                </Link>
              )}
            </section>
          </form>
        )}
      </main>

      <StitchFooter />
    </div>
  );
}
