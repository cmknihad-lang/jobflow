import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase } from 'lucide-react';
import api from '../lib/axios';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    business_name: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        await api.post('/business/register/', formData);
        const response = await api.post('/token/', {
          username: formData.username,
          password: formData.password,
        });
        localStorage.setItem('accessToken', response.data.access);
        localStorage.setItem('refreshToken', response.data.refresh);
      } else {
        const response = await api.post('/token/', {
          username: formData.username,
          password: formData.password,
        });
        localStorage.setItem('accessToken', response.data.access);
        localStorage.setItem('refreshToken', response.data.refresh);
      }
      navigate('/');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e.response?.data?.error || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
      <div className="w-full max-w-sm fade-in-up">

        {/* Brand mark */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-10 w-10 rounded-lg bg-sidebar flex items-center justify-center mb-4">
            <Briefcase className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-semibold text-text-primary">
            {isRegister ? 'Create your account' : 'Sign in to JobFlow'}
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            {isRegister
              ? 'Get your business up and running.'
              : 'Manage your jobs, customers and payments.'}
          </p>
        </div>

        {/* Form card */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 p-3 bg-status-red-bg border border-status-red-border text-status-red rounded-sm text-sm"
              >
                {error}
              </div>
            )}

            {isRegister && (
              <div>
                <label htmlFor="business_name" className="block text-sm font-medium text-text-primary mb-1">
                  Business name
                </label>
                <input
                  id="business_name"
                  type="text"
                  name="business_name"
                  value={formData.business_name}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Acme Services"
                  required
                  autoComplete="organization"
                />
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-text-primary mb-1">
                Username
              </label>
              <input
                id="username"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="input-field"
                placeholder="yourname"
                required
                autoComplete="username"
              />
            </div>

            {isRegister && (
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input-field"
                placeholder="••••••••"
                required
                autoComplete={isRegister ? 'new-password' : 'current-password'}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 mt-2"
            >
              {loading
                ? 'Please wait...'
                : isRegister
                ? 'Create account'
                : 'Sign in'}
            </button>
          </form>
        </div>

        {/* Toggle */}
        <p className="mt-4 text-center text-sm text-text-secondary">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => { setIsRegister(!isRegister); setError(''); }}
            className="font-medium text-accent hover:text-accent-hover transition-colors"
          >
            {isRegister ? 'Sign in' : 'Create one'}
          </button>
        </p>
      </div>
    </div>
  );
}
