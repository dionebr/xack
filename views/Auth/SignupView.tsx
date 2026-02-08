
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const SignupView: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    inviteCode: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.type === 'email' ? 'email' : (e.target.type === 'password' ? 'password' : (e.target.placeholder.includes('XACK') ? 'inviteCode' : 'username'))]: e.target.value });
  };

  // Alternative safer handleChange if we add 'name' attributes to inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://76.13.236.223:3001/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Save token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      navigate('/onboarding');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-background-dark overflow-hidden">
      {/* Left Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0 z-0">
          <img alt="Hacking" className="w-full h-full object-cover opacity-30 mix-blend-luminosity" src="https://picsum.photos/seed/cyber/1200/1200" />
          <div className="absolute inset-0 bg-gradient-to-tr from-background-dark via-background-dark/80 to-primary/20"></div>
        </div>
        <div className="relative z-10 flex flex-col justify-between p-20 w-full h-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg">
              <span className="material-icons-round text-white text-2xl">terminal</span>
            </div>
            <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic">XACK</h1>
          </div>
          <div className="max-w-md">
            <span className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest mb-6 border border-primary/30">Access Level: Elite</span>
            <h2 className="text-6xl font-display font-black text-white leading-[1.1] mb-6 tracking-tight">
              Join the <span className="text-primary italic">Elite</span> Operatives.
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              The ultimate playground for security researchers. Sharpen your skills in high-fidelity environments and claim your rank.
            </p>
          </div>
          <div className="flex items-center gap-12 opacity-50">
            <div className="flex flex-col"><span className="text-2xl font-bold text-white">500+</span><span className="text-[10px] font-black uppercase tracking-widest">Active Labs</span></div>
            <div className="text-slate-800 text-2xl">/</div>
            <div className="flex flex-col"><span className="text-2xl font-bold text-white">25k</span><span className="text-[10px] font-black uppercase tracking-widest">Operatives</span></div>
          </div>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background-dark border-l border-white/5 overflow-y-auto">
        <div className="w-full max-w-md space-y-8 py-10">
          <div>
            <h3 className="text-3xl font-display font-black text-white tracking-tight">Create Identity</h3>
            <p className="text-slate-500 mt-2">Initialize your operative profile.</p>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold flex items-center gap-3">
              <span className="material-icons-round text-sm">error_outline</span>
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleRegister}>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Username</label>
                <input
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-primary/50 text-white placeholder:text-slate-600 outline-none transition-all"
                  placeholder="cyber_phantom_01"
                  type="text"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Email Address</label>
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-primary/50 text-white placeholder:text-slate-600 outline-none transition-all"
                  placeholder="ghost@xack.io"
                  type="email"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Password</label>
                <input
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-primary/50 text-white placeholder:text-slate-600 outline-none transition-all"
                  placeholder="••••••••••••"
                  type="password"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Invite Code <span className="text-slate-600 ml-2 normal-case tracking-normal">(Optional)</span></label>
                <input
                  name="inviteCode"
                  value={formData.inviteCode}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3.5 text-sm font-mono focus:ring-2 focus:ring-primary/50 text-accent uppercase placeholder:text-slate-700 outline-none transition-all"
                  placeholder="XACK-XXXX-XXXX"
                  type="text"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 py-2">
              <input className="w-4 h-4 rounded border-slate-800 bg-slate-900 text-primary focus:ring-primary/20 cursor-pointer" type="checkbox" id="tos" required />
              <label className="text-xs text-slate-500 cursor-pointer" htmlFor="tos">Agree to <span className="text-primary font-bold">Protocols</span> & <span className="text-primary font-bold">Privacy</span></label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary text-white font-black rounded-xl shadow-xl shadow-primary/20 hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group uppercase tracking-widest text-xs disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Processing...
                </>
              ) : (
                <>
                  Complete Onboarding
                  <span className="material-icons-round text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500">
            Already verified? <Link to="/login" className="text-primary font-bold hover:underline">Log In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupView;
