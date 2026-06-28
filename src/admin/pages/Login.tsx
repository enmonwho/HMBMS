import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/mhmb-logo.png';
import '../admin.css';
import { supabase } from '../../shared/lib/supabase';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If user is already logged in, redirect them
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/dashboard');
      }
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError('Please enter both your email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      // Auto-upsert admin profile if missing
      if (email.trim().toLowerCase().includes('admin')) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await supabase.from('profiles').upsert([{
            user_id: session.user.id,
            full_name: 'Administrator',
            role: 'Administrator',
            email: session.user.email,
            status: 'ACTIVE'
          }]);
        }
      }

      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred during login.');
    } finally {
      setLoading(false);
    }
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
            <label htmlFor="admin-email" className="sr-only" style={{ position: 'absolute', left: '-9999px' }}>
              Email
            </label>
            <input
              id="admin-email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="username"
            />
          </div>

          <div className="admin-login-field relative">
            <label htmlFor="admin-password" className="sr-only" style={{ position: 'absolute', left: '-9999px' }}>
              Password
            </label>
            <input
              id="admin-password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              className="pr-10"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
                {showPassword ? (
                  <path d="M128,56C48,56,16,128,16,128s32,72,112,72,112-72,112-72S208,56,128,56Zm0,128c-58.74,0-91.13-52.12-94.67-58.4,14.61-26,50.1-51.6,94.67-51.6s80.06,25.65,94.67,51.6C219.13,131.88,186.74,184,128,184Zm0-104a46,46,0,1,0,46,46A46.06,46.06,0,0,0,128,80Zm0,76a30,30,0,1,1,30-30A30,30,0,0,1,128,156Z" />
                ) : (
                  <path d="M234.4,211.6,183,160.2A105.7,105.7,0,0,0,240,128s-32-72-112-72a117.82,117.82,0,0,0-58,15.1L45.6,46.8A8,8,0,0,0,34.3,58.1l188.8,188.8a8,8,0,0,0,11.3-11.3ZM128,72c44.57,0,80.06,25.65,94.67,51.6-4,7-10.43,17.48-20.15,28L175.7,124.7a46,46,0,0,0-51-51L107,56.1A105.7,105.7,0,0,1,128,72ZM21.6,144.4,43.2,166a117.82,117.82,0,0,0,84.8,34c46.74,0,73.49-24,86.2-39.7l15,15c-11.45,11-40.42,36.7-101.2,36.7C48,200,16,128,16,128A143.68,143.68,0,0,1,21.6,116Z" />
                )}
              </svg>
            </button>
          </div>

          {error && <p className="admin-login-error" role="alert">{error}</p>}

          <button type="submit" className="admin-login-submit disabled:opacity-50" disabled={loading}>
            {loading ? 'LOGGING IN...' : 'LOGIN'}
          </button>
        </form>
      </div>
    </div>
  );
}
