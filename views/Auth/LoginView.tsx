
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api';

const LoginView: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await api.post('/api/login', formData);

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background-dark">
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(rgba(99, 102, 241, 0.2) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full"></div>

      <div className="w-full max-w-md px-6 z-10">
        <div className="glass rounded-[2rem] p-10 shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-primary/20">
              <span className="material-icons-round text-white text-3xl">terminal</span>
            </div>
            <h1 className="text-3xl font-black tracking-tighter text-white uppercase mb-1 font-display italic">XACK</h1>
            <p className="text-slate-400 font-medium">Welcome Back, Operative</p>
          </div>

          <form className="space-y-5" onSubmit={handleLogin}>
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold flex items-center gap-3">
                <span className="material-icons-round text-sm">error_outline</span>
                {error}
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Username / Email</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">alternate_email</span>
                <input
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-xl pl-12 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-primary/50 transition-all text-white placeholder:text-slate-600 outline-none"
                  placeholder="operator"
                  type="text"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between px-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Password</label>
                <a className="text-[11px] font-bold text-primary hover:text-indigo-400 uppercase tracking-wider" href="#">Forgot?</a>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">lock</span>
                <input
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-xl pl-12 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-primary/50 transition-all text-white placeholder:text-slate-600 outline-none"
                  placeholder="••••••••••••"
                  type="password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary text-white font-bold rounded-xl shadow-xl shadow-primary/20 hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4 uppercase tracking-widest text-xs disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  CONNECTING...
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <span className="material-icons-round text-lg">login</span>
                </>
              )}
            </button>
          </form>

          <div className="flex items-center my-8">
            <div className="flex-1 h-px bg-slate-800"></div>
            <span className="px-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest whitespace-nowrap">Secure Access</span>
            <div className="flex-1 h-px bg-slate-800"></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 py-3 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 transition-all">
              <span className="text-xs font-bold text-slate-400">GitHub</span>
            </button>
            <button className="flex items-center justify-center gap-2 py-3 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 transition-all">
              <span className="text-xs font-bold text-slate-400">Google</span>
            </button>
          </div>

          <p className="mt-8 text-center text-sm text-slate-500">
            New operative? <Link to="/signup" className="text-accent font-bold hover:underline">Apply Here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
