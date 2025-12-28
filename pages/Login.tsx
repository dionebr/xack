import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ASSETS } from '../constants';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username,
              full_name: fullName,
              avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`
            }
          }
        });
        if (error) throw error;
        alert('Account created! Please check your email to confirm if configured, or just sign in now.');
        setIsSignUp(false); // Switch back to login
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-main bg-grid-dots flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent-purple/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="absolute top-10 left-10">
        <img src={ASSETS.LOGO} alt="XACK" className="h-14 w-auto" />
      </div>

      <div className="w-full max-w-[480px] bg-bg-card rounded-[2.5rem] border border-white/5 shadow-card relative z-10 overflow-hidden group">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-accent-purple to-transparent opacity-50"></div>

        <div className="p-12 flex flex-col items-center text-center">
          <h1 className="text-4xl font-display font-bold text-white mb-2 tracking-wide uppercase italic">
            {isSignUp ? 'Join the Elite' : 'Welcome Back'}
          </h1>
          <p className="text-text-muted text-sm mb-10 max-w-[300px]">
            {isSignUp ? 'Create your credentials to access ' : 'Enter your credentials to access '}
            <span className="text-white font-bold">XACK</span>.
          </p>

          <form className="w-full space-y-6" onSubmit={handleAuth}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs p-3 rounded-xl">
                {error}
              </div>
            )}

            {isSignUp && (
              <>
                <div className="text-left space-y-2">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest pl-1">Username</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-3.5 text-text-muted text-lg">alternate_email</span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="operative_007"
                      required={isSignUp}
                      className="w-full bg-[#161718] border border-white/5 text-white rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-accent-purple/50 transition-all placeholder:text-text-muted/30"
                    />
                  </div>
                </div>
                <div className="text-left space-y-2">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest pl-1">Full Name</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-3.5 text-text-muted text-lg">badge</span>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Doe"
                      required={isSignUp}
                      className="w-full bg-[#161718] border border-white/5 text-white rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-accent-purple/50 transition-all placeholder:text-text-muted/30"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="text-left space-y-2">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest pl-1">Email</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-3.5 text-text-muted text-lg">mail</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="agent@xack.com"
                  required
                  className="w-full bg-[#161718] border border-white/5 text-white rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-accent-purple/50 transition-all placeholder:text-text-muted/30"
                />
              </div>
            </div>

            <div className="text-left space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Password</label>
                {!isSignUp && <Link to="/recovery" className="text-[10px] font-bold text-accent-purple hover:text-accent-cyan transition-colors uppercase tracking-widest">Forgot Password?</Link>}
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-3.5 text-text-muted text-lg">lock</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full bg-[#161718] border border-white/5 text-white rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-accent-purple/50 transition-all placeholder:text-text-muted/30"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-accent-purple hover:bg-accent-purple/80 text-white rounded-2xl font-display font-bold text-sm tracking-[0.2em] uppercase shadow-[0_10px_30px_rgba(185,70,233,0.3)] transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (isSignUp ? 'Creating...' : 'Authenticating...') : (isSignUp ? 'Create Account' : 'Access Dashboard')}
            </button>
          </form>

          <div className="mt-12 w-full pt-8 border-t border-white/5 flex flex-col items-center gap-6">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
              {isSignUp ? 'Already have an account?' : 'New Agent?'}
            </span>
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="group flex items-center gap-3 px-8 py-3 rounded-2xl border border-white/10 hover:border-white/30 text-white text-[11px] font-bold uppercase tracking-[0.15em] transition-all"
            >
              {isSignUp ? 'Sign In' : 'Create Account'}
              <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
