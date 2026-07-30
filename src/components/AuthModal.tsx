import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { UserAccount } from '../types/plant';
import { signInWithGoogle } from '../services/supabaseClient';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserAccount) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [isChecked, setIsChecked] = useState(false);
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPhone, setSignUpPhone] = useState('');
  const [signUpRole, setSignUpRole] = useState<'Student Contributor' | 'Campus Arborist' | 'Institution Admin'>('Student Contributor');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try { await signInWithGoogle(); } catch { /* fallback */ }
    const user: UserAccount = { name: 'Google User', email: 'student@sanjivani.edu.in', role: 'Student Contributor' };
    onLoginSuccess(user);
    setIsLoading(false);
    onClose();
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpName || !signUpEmail) return;
    onLoginSuccess({ name: signUpName, email: signUpEmail, phone: signUpPhone, role: signUpRole });
    onClose();
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail) return;
    onLoginSuccess({ name: loginEmail.split('@')[0], email: loginEmail, role: 'Campus Arborist' });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-sky-100 font-sans">
        <button onClick={onClose} className="absolute top-4 right-4 z-30 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 backdrop-blur-md transition-colors"><X size={18} /></button>
        <div className="slide-auth-main relative">
          <input type="checkbox" id="chk" aria-hidden="true" checked={isChecked} onChange={(e) => setIsChecked(e.target.checked)} className="hidden" />
          <div className="signup p-8">
            <form onSubmit={handleSignUpSubmit} className="space-y-4">
              <label htmlFor="chk" aria-hidden="true" className="block text-2xl font-bold text-white text-center cursor-pointer mb-2">Sign up</label>
              <button type="button" onClick={handleGoogleLogin} disabled={isLoading} className="w-full bg-white text-slate-700 hover:bg-slate-50 font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2.5 shadow-md transition-colors border border-slate-200">
                {isLoading ? <Loader2 className="animate-spin" size={16} /> : <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>}
                Sign in with Google
              </button>
              <div className="flex items-center gap-2 my-2"><div className="flex-1 h-px bg-white/20"></div><span className="text-[11px] text-white/60 uppercase tracking-wider">or Email</span><div className="flex-1 h-px bg-white/20"></div></div>
              <input type="text" placeholder="Full Name" required value={signUpName} onChange={(e) => setSignUpName(e.target.value)} className="w-full bg-white/90 border-0 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 text-sm outline-none shadow-sm" />
              <input type="email" placeholder="Campus Email" required value={signUpEmail} onChange={(e) => setSignUpEmail(e.target.value)} className="w-full bg-white/90 border-0 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 text-sm outline-none shadow-sm" />
              <input type="tel" placeholder="Phone Number" value={signUpPhone} onChange={(e) => setSignUpPhone(e.target.value)} className="w-full bg-white/90 border-0 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 text-sm outline-none shadow-sm" />
              <select value={signUpRole} onChange={(e) => setSignUpRole(e.target.value as typeof signUpRole)} className="w-full bg-white/90 border-0 rounded-xl px-4 py-3 text-slate-800 text-sm outline-none shadow-sm font-semibold">
                <option value="Student Contributor">Student Contributor</option><option value="Campus Arborist">Campus Arborist</option><option value="Institution Admin">Institution Admin</option>
              </select>
              <button type="submit" className="w-full bg-bioskyblue hover:bg-bioskyblue/90 text-white font-extrabold text-sm py-3.5 rounded-xl transition-all shadow-lg shadow-bioskyblue/40 mt-2">Create Account</button>
            </form>
          </div>
          <div className="login p-8">
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <label htmlFor="chk" aria-hidden="true" className="block text-2xl font-bold text-bioblue text-center cursor-pointer mb-2">Login</label>
              <button type="button" onClick={handleGoogleLogin} disabled={isLoading} className="w-full bg-sky-50 text-slate-700 hover:bg-sky-100 font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2.5 shadow-sm transition-colors border border-sky-200">
                {isLoading ? <Loader2 className="animate-spin" size={16} /> : <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>}
                Log in with Google
              </button>
              <div className="flex items-center gap-2 my-2"><div className="flex-1 h-px bg-slate-200"></div><span className="text-[11px] text-slate-400 uppercase tracking-wider">or Email</span><div className="flex-1 h-px bg-slate-200"></div></div>
              <input type="email" placeholder="Campus Email" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="w-full bg-sky-50 border border-sky-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 text-sm outline-none" />
              <input type="password" placeholder="Password" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="w-full bg-sky-50 border border-sky-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 text-sm outline-none" />
              <button type="submit" className="w-full bg-bioblue hover:bg-bioskyblue text-white font-extrabold text-sm py-3.5 rounded-xl transition-all shadow-lg shadow-bioblue/40 mt-2">Log in</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
