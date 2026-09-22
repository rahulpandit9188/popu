import { useState } from 'react';
import { boards, mediums } from '../data';
import { updateStoredUser } from '../session';

const streams = ['Science', 'Commerce', 'Arts'];

export default function ProfilePage({
  user,
  classes = [],
  onBack,
  onLogout,
  onExploreClass,
  onSaved,
}) {
  const [form, setForm] = useState({
    name: user.name || '',
    classLevel: user.classLevel || '',
    stream: user.stream || '',
    board: user.board || '',
    medium: user.medium || '',
  });

  const initial = (user.name || 'S').trim().charAt(0).toUpperCase();
  const needsStream = form.classLevel === 'Class 11' || form.classLevel === 'Class 12';

  const handleSave = (e) => {
    e.preventDefault();
    const nextUser = {
      ...user,
      name: form.name.trim() || user.name,
      classLevel: form.classLevel,
      stream: needsStream ? form.stream : '',
      board: form.board,
      medium: form.medium,
    };
    updateStoredUser(nextUser);
    onSaved(nextUser, 'Profile updated.');
  };

  return (
    <main className="profile-page">
      <div className="profile-card">
        <button className="class-page-back" type="button" onClick={onBack}>
          <i className="fas fa-arrow-left"></i>
          Back to Home
        </button>

        <div className="profile-hero">
          <div className="profile-avatar">{initial}</div>
          <div>
            <p className="class-page-eyebrow">My Profile</p>
            <h1 className="profile-name">{user.name}</h1>
            <p className="profile-email">{user.email}</p>
          </div>
        </div>

        <div className="profile-stats">
          <div className="profile-stat">
            <span>Board</span>
            <strong>{user.board || 'Not set'}</strong>
          </div>
          <div className="profile-stat">
            <span>Medium</span>
            <strong>{user.medium || 'Not set'}</strong>
          </div>
          <div className="profile-stat">
            <span>Class</span>
            <strong>{user.classLevel || 'Not set'}</strong>
          </div>
        </div>

        <form className="auth-form" onSubmit={handleSave}>
          <label className="auth-field">
            Full name
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            />
          </label>

          <label className="auth-field">
            Board
            <select
              value={form.board}
              onChange={(e) => setForm((prev) => ({ ...prev, board: e.target.value }))}
            >
              <option value="">Select board</option>
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

          <label className="auth-field">
            Your class
            <select
              value={form.classLevel}
              onChange={(e) => setForm((prev) => ({ ...prev, classLevel: e.target.value, stream: '' }))}
            >
              <option value="">Select class</option>
              {classes.map((item) => (
                <option value={item.class_name} key={item.uuid}>
                  {item.class_name}
                </option>
              ))}
            </select>
          </label>

          {needsStream ? (
            <label className="auth-field">
              Stream
              <select
                value={form.stream}
                onChange={(e) => setForm((prev) => ({ ...prev, stream: e.target.value }))}
              >
                <option value="">Select stream</option>
                {streams.map((stream) => (
                  <option value={stream} key={stream}>
                    {stream}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <button className="auth-submit" type="submit">
            Save Profile
          </button>
        </form>

        <div className="profile-actions">
          {user.classLevel ? (
            <button className="signup-btn" type="button" onClick={() => onExploreClass(user.classLevel)}>
              Open {user.classLevel} notes
              <i className="fas fa-arrow-right"></i>
            </button>
          ) : null}
          <button className="login-btn" type="button" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>
    </main>
  );
}
