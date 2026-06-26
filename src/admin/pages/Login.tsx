import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/mhmb-logo.png';
import '../admin.css';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      setError('Please enter both your username and password.');
      return;
    }

    // No backend yet — once the auth/database branch lands, replace this
    // with a real credential check against the API.
    setError('');
    navigate('/admin/dashboard');
  };

  return (
    <div className="admin-login-shell">
      <div className="admin-login-card">
        <div className="admin-login-watermark" aria-hidden="true">
          <img src={logo} alt="" />
        </div>

        <form className="admin-login-box" onSubmit={handleSubmit}>
          <h1>WELCOME BACK</h1>
          <p>Log in to your account</p>

          <div className="admin-login-field">
            <label htmlFor="admin-username" className="sr-only" style={{ position: 'absolute', left: '-9999px' }}>
              Username
            </label>
            <input
              id="admin-username"
              type="text"
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>

          <div className="admin-login-field">
            <label htmlFor="admin-password" className="sr-only" style={{ position: 'absolute', left: '-9999px' }}>
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {error && <p className="admin-login-error" role="alert">{error}</p>}

          <button type="submit" className="admin-login-submit">
            LOGIN
          </button>
        </form>
      </div>
    </div>
  );
}
