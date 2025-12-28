
import React from 'react';
import { Link } from 'react-router-dom';
import { ASSETS } from '../constants';

const Recovery: React.FC = () => {
  return (
    <div className="min-h-screen bg-bg-main bg-grid-dots flex flex-col items-center justify-center p-6 relative">
      <div className="mb-12">
        <img src={ASSETS.LOGO} alt="XACK" className="h-12 w-auto mx-auto" />
      </div>

      <div className="w-full max-w-[440px] bg-bg-card rounded-[2rem] border border-white/5 shadow-card overflow-hidden">
        <div className="p-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-[#252628] rounded-full flex items-center justify-center mb-8">
            <span className="material-symbols-outlined text-4xl text-text-muted">sentiment_very_dissatisfied</span>
          </div>

          <h1 className="text-2xl font-display font-bold text-white mb-3">Password Recovery</h1>
          <p className="text-text-muted text-sm mb-8 leading-relaxed font-light">
            Enter the email associated with your account and we will send instructions to securely reset your password.
          </p>

          <div className="w-full text-left space-y-2 mb-8">
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest pl-1">Email</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-3.5 text-text-muted text-lg">mail</span>
              <input
                type="email"
                placeholder="user@example.com"
                className="w-full bg-[#161718] border border-white/5 text-white rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-accent-purple/50 transition-all placeholder:text-text-muted/30"
              />
            </div>
          </div>

          <button
            className="w-full py-4 bg-accent-purple hover:bg-accent-purple/80 text-white rounded-2xl font-display font-bold text-sm tracking-widest uppercase flex items-center justify-center gap-3 transition-all"
          >
            Send Instructions
            <span className="material-symbols-outlined text-sm">send</span>
          </button>
        </div>

        <div className="bg-[#1a1b1c] py-5 text-center">
          <Link to="/login" className="text-xs font-medium text-text-muted hover:text-accent-purple transition-all flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Remembered your password? <span className="text-accent-purple font-bold">Back to Login</span>
          </Link>
        </div>
      </div>

      <footer className="mt-12 flex items-center gap-6 text-[10px] font-bold text-text-muted uppercase tracking-widest opacity-40">
        <a href="#">Terms of Use</a>
        <div className="w-px h-3 bg-text-muted"></div>
        <a href="#">Privacy</a>
        <div className="w-px h-3 bg-text-muted"></div>
        <a href="#">Support</a>
      </footer>
    </div>
  );
};

export default Recovery;
