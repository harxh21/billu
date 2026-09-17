import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';
import Logo from '../components/common/Logo';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-indigo-950 px-4 py-12 overflow-hidden">
      {/* Decorative glow blobs */}
      <div className="pointer-events-none absolute -top-24 -left-24 w-80 h-80 rounded-full bg-indigo-600/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-16 w-96 h-96 rounded-full bg-amber-500/20 blur-3xl" />

      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <div className="inline-flex mb-4">
            <Logo size={56} />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Billu</h1>
          <p className="text-indigo-200 text-sm mt-1">Inventory & billing, made simple — for any shop</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-2xl shadow-indigo-950/40 space-y-4 border-t-4 border-amber-500">
          {error && <Alert type="error" message={error} />}

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />

          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-slate-400"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>

          <p className="text-sm text-slate-600 text-center pt-2">
            New here?{' '}
            <Link to="/register" className="text-indigo-600 font-semibold hover:underline">
              Create your shop
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
