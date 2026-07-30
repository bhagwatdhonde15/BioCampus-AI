import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { UserAccount } from '../types/plant';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserAccount) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [isChecked, setIsChecked] = useState(false);

  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupRole, setSignupRole] = useState<'Student Contributor' | 'Campus Arborist' | 'Institution Admin'>('Student Contributor');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupEmail || !signupPassword) return;

    const user: UserAccount = {
      name: signupName || 'Campus Contributor',
      email: signupEmail,
      phone: signupPhone,
      role: signupRole,
    };

    setSuccessMsg(`Welcome to BioCampus AI, ${user.name}!`);
    setTimeout(() => {
      onLoginSuccess(user);
      onClose();
      setSuccessMsg(null);
    }, 1000);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return;

    const nameFromEmail = loginEmail.split('@')[0];
    const capitalized = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);

    const user: UserAccount = {
      name: capitalized || 'Campus User',
      email: loginEmail,
      role: 'Student Contributor',
    };

    setSuccessMsg(`Logged in successfully as ${user.name}!`);
    setTimeout(() => {
      onLoginSuccess(user);
      onClose();
      setSuccessMsg(null);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="relative">
        
        {/* Close Button Floating */}
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 transition-colors z-50"
        >
          <X size={20} />
        </button>

        {/* Sliding Card Container - Custom User CSS Adapted */}
        <div className="slide-auth-main font-['Jost',sans-serif]">
          <input
            type="checkbox"
            id="chk"
            aria-hidden="true"
            checked={isChecked}
            onChange={(e) => setIsChecked(e.target.checked)}
            className="hidden"
          />

          {/* Signup Section */}
          <div className="signup relative w-full h-full pt-4">
            <form onSubmit={handleSignupSubmit}>
              <label
                htmlFor="chk"
                aria-hidden="true"
                className="text-white text-3xl font-bold flex justify-center mb-6 cursor-pointer transition-transform duration-500 ease-in-out"
                style={{ transform: isChecked ? 'scale(0.6)' : 'scale(1)' }}
              >
                Sign up
              </label>

              <input
                type="text"
                name="txt"
                placeholder="User name"
                required
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                className="w-[72%] h-10 bg-[#e0dede] mx-auto mb-3 px-4 py-2 text-slate-800 rounded-lg outline-none font-medium block text-sm"
              />

              <input
                type="email"
                name="email"
                placeholder="Email"
                required
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                className="w-[72%] h-10 bg-[#e0dede] mx-auto mb-3 px-4 py-2 text-slate-800 rounded-lg outline-none font-medium block text-sm"
              />

              <input
                type="tel"
                name="broj"
                placeholder="BrojTelefona (Phone)"
                required
                value={signupPhone}
                onChange={(e) => setSignupPhone(e.target.value)}
                className="w-[72%] h-10 bg-[#e0dede] mx-auto mb-3 px-4 py-2 text-slate-800 rounded-lg outline-none font-medium block text-sm"
              />

              <input
                type="password"
                name="pswd"
                placeholder="Password"
                required
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                className="w-[72%] h-10 bg-[#e0dede] mx-auto mb-4 px-4 py-2 text-slate-800 rounded-lg outline-none font-medium block text-sm"
              />

              <select
                value={signupRole}
                onChange={(e) => setSignupRole(e.target.value as any)}
                className="w-[72%] h-9 bg-[#e0dede] mx-auto mb-4 px-3 text-slate-800 rounded-lg outline-none font-semibold block text-xs"
              >
                <option value="Student Contributor">Student Contributor</option>
                <option value="Campus Arborist">Campus Arborist</option>
                <option value="Institution Admin">Institution Admin</option>
              </select>

              <button
                type="submit"
                className="w-[72%] h-11 mx-auto block text-white bg-[#573b8a] hover:bg-[#6d44b8] text-base font-bold outline-none border-none rounded-lg cursor-pointer transition-colors duration-200 shadow-lg"
              >
                Sign up
              </button>
            </form>
          </div>

          {/* Login Section */}
          <div
            className="login h-[520px] bg-[#eee] rounded-[60%/10%] transition-transform duration-700 ease-in-out pt-4"
            style={{ transform: isChecked ? 'translateY(-560px)' : 'translateY(-200px)' }}
          >
            <form onSubmit={handleLoginSubmit}>
              <label
                htmlFor="chk"
                aria-hidden="true"
                className="text-[#573b8a] text-3xl font-bold flex justify-center mb-8 cursor-pointer transition-transform duration-500 ease-in-out"
                style={{ transform: isChecked ? 'scale(1)' : 'scale(0.6)' }}
              >
                Login
              </label>

              <input
                type="email"
                name="email"
                placeholder="Email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-[72%] h-11 bg-[#e0dede] mx-auto mb-4 px-4 py-2 text-slate-800 rounded-lg outline-none font-medium block text-sm"
              />

              <input
                type="password"
                name="pswd"
                placeholder="Password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-[72%] h-11 bg-[#e0dede] mx-auto mb-6 px-4 py-2 text-slate-800 rounded-lg outline-none font-medium block text-sm"
              />

              <button
                type="submit"
                className="w-[72%] h-11 mx-auto block text-white bg-[#573b8a] hover:bg-[#6d44b8] text-base font-bold outline-none border-none rounded-lg cursor-pointer transition-colors duration-200 shadow-lg"
              >
                Login
              </button>
            </form>
          </div>

          {/* Success Overlay Banner */}
          {successMsg && (
            <div className="absolute inset-0 bg-[#573b8a] text-white flex flex-col items-center justify-center p-6 text-center z-40 animate-fade-in">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mb-3">
                <Check size={32} />
              </div>
              <h3 className="text-xl font-bold">{successMsg}</h3>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
