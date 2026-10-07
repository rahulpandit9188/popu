import { useState } from 'react';
import { boards, mediums } from '../data';
import { authApi } from '../api';
import { readProfile, updateStoredUser } from '../session';
import globalIcon from '../assets/global-icon.png';

export default function AuthPage({ mode, onSwitch, onBack, onSuccess }) {
  const isLogin = mode === 'login';
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    board: '',
    medium: '',
  });

  const update = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = form.email.trim().toLowerCase();
    const password = form.password;

    if (!email || !password) {
      setError('Please fill in email and password.');
      return;
    }

    if (!form.board) {
      setError('Please select your board.');
      return;
    }
    if (!form.medium) {
      setError('Please select your medium.');
      return;
    }

    if (!isLogin) {
      if (!form.name.trim()) {
        setError('Please enter your name.');
        return;
      }
      if (!form.phoneNumber.trim()) {
        setError('Please enter your phone number.');
        return;
      }
      if (password.length < 6) {
        setError('Password should be at least 6 characters.');
        return;
      }
      if (password !== form.confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setLoading(true);
    setError('');

    try {
      if (!isLogin) {
        await authApi.register({
          email,
          phone_number: form.phoneNumber.trim(),
          password,
        });
      }

      const response = await authApi.login({ email, password });
      const auth = response.data;
      const savedProfile = readProfile(email);
      const name = isLogin
        ? savedProfile.name || email.split('@')[0]
        : form.name.trim();
      const session = {
        ...savedProfile,
        name,
        email: auth.email || email,
        phoneNumber: auth.phone_number || form.phoneNumber.trim(),
        is_staff: Boolean(auth.is_staff),
        joinedAt: savedProfile.joinedAt || new Date().toISOString(),
        classLevel: savedProfile.classLevel || '',
        stream: savedProfile.stream || '',
        board: form.board,
        medium: form.medium,
        access: auth.access,
        refresh: auth.refresh,
      };

      updateStoredUser(session);
      onSuccess(
        session,
        isLogin ? `Welcome back, ${name}!` : `Account created. Welcome, ${name}!`,
      );
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-card">
        <button className="class-page-back" type="button" onClick={onBack}>
          <i className="fas fa-arrow-left"></i>
          Back to Home
        </button>

        <div className="auth-icon">
          <img src={globalIcon} alt="" className="brand-icon brand-icon-lg" />
        </div>
        <h1 className="auth-title">{isLogin ? 'Welcome back' : 'Create your account'}</h1>
        <p className="auth-subtitle">
          {isLogin
            ? 'Select your board and medium, then login to continue.'
            : 'Sign up and choose your board and medium to get the right notes.'}
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {isLogin ? null : (
            <label className="auth-field">
              Full name
              <input
                type="text"
                value={form.name}
                onChange={update('name')}
                placeholder="Enter your name"
                autoComplete="name"
              />
            </label>
          )}

          <label className="auth-field">
            Email
            <input
              type="email"
              value={form.email}
              onChange={update('email')}
              placeholder="you@email.com"
              autoComplete="email"
            />
          </label>

          {isLogin ? null : (
            <label className="auth-field">
              Phone number
              <input
                type="tel"
                value={form.phoneNumber}
                onChange={update('phoneNumber')}
                placeholder="10 to 15 digit phone number"
                autoComplete="tel"
                inputMode="tel"
                maxLength={25}
              />
            </label>
          )}

          <label className="auth-field">
            Password
            <span className="auth-password">
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={update('password')}
                placeholder="Enter password"
                autoComplete={isLogin ? 'current-password' : 'new-password'}
              />
              <button
                className="auth-eye"
                type="button"
                onClick={() => setShowPassword((open) => !open)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </span>
          </label>

          {isLogin ? null : (
            <label className="auth-field">
              Confirm password
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={update('confirmPassword')}
                placeholder="Re-enter password"
                autoComplete="new-password"
              />
            </label>
          )}

          <label className="auth-field">
            Board
            <select value={form.board} onChange={update('board')}>
              <option value="">Select your board</option>
              {boards.map((board) => (
                <option value={board} key={board}>
                  {board}
                </option>
              ))}
            </select>
          </label>

          <div className="auth-field">
            Medium
            <div className="auth-choices">
              {mediums.map((medium) => (
                <button
                  key={medium}
                  type="button"
                  className={`auth-choice${form.medium === medium ? ' active' : ''}`}
                  onClick={() => setForm((prev) => ({ ...prev, medium }))}
                >
                  {medium === 'Hindi' ? 'हिन्दी' : 'English'}
                </button>
              ))}
            </div>
          </div>

          {error ? <p className="auth-error">{error}</p> : null}

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? 'Please wait...' : isLogin ? 'Login' : 'Sign Up'}
            <i className="fas fa-arrow-right"></i>
          </button>
        </form>

        <p className="auth-switch">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button type="button" onClick={() => onSwitch(isLogin ? 'signup' : 'login')}>
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>
    </main>
  );
}
