import React, { useState } from 'react';
import { Account } from '../types';
import { ShieldCheck, UserCheck, KeyRound, Info, Sparkles } from 'lucide-react';

interface LoginScreenProps {
  accounts: Account[];
  onLogin: (account: Account) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ accounts, onLogin }) => {
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim().toLowerCase();
    const cleanPin = pin.trim();

    const match = accounts.find(
      (a) => a.name.trim().toLowerCase() === cleanName && a.pin === cleanPin
    );

    if (!match) {
      setError('Name and PIN did not match an account.');
      return;
    }

    setError('');
    onLogin(match);
  };

  const handleQuickFill = (acc: Account) => {
    setName(acc.name);
    setPin(acc.pin);
    setError('');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-100 text-slate-800">
      {/* Background Honeycomb Ambience */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hexagons" width="50" height="43.4" patternUnits="userSpaceOnUse" patternTransform="scale(2)">
              <polygon points="25,0 50,14.4 50,43.3 25,57.7 0,43.3 0,14.4" fill="none" stroke="#94A3B8" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hexagons)" />
        </svg>
      </div>

      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-xl z-10">
        {/* Emblem */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 text-3xl shadow-xs mb-3">
            ⬡
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
            ApiaryOps
          </h1>
          <p className="text-xs uppercase font-mono tracking-widest text-indigo-600 mt-1 font-semibold">
            Beekeeping Operations Management
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Sign in with your operational PIN to access hive records
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-medium text-slate-600 uppercase tracking-wider mb-1.5">
              Account Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Owner or Assistant"
                className="w-full bg-white border border-slate-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors"
                required
              />
              <UserCheck className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-medium text-slate-600 uppercase tracking-wider mb-1.5">
              Security PIN
            </label>
            <div className="relative">
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••"
                maxLength={8}
                className="w-full bg-white border border-slate-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 rounded-lg px-3.5 py-2.5 text-sm font-mono tracking-widest text-slate-900 placeholder:text-slate-400 outline-none transition-colors"
                required
              />
              <KeyRound className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm py-2.5 px-4 rounded-lg transition-all shadow-sm font-mono uppercase tracking-wide flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            Sign In to Station
          </button>
        </form>

        {/* Quick Demo Access Pills */}
        <div className="mt-6 pt-5 border-t border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-600 mb-2.5">
            <span className="flex items-center gap-1 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              Quick Station Profiles
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {accounts.map((acc) => (
              <button
                key={acc.id}
                type="button"
                onClick={() => handleQuickFill(acc)}
                className="p-2.5 rounded-lg bg-slate-50 hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-200 text-left transition-colors flex flex-col group cursor-pointer"
              >
                <span className="text-xs font-semibold text-slate-900 group-hover:text-indigo-600 truncate transition-colors">
                  {acc.name}
                </span>
                <span className="text-[10px] text-slate-500 font-mono mt-0.5 flex items-center justify-between">
                  <span>{acc.role === 'admin' ? 'Owner (Admin)' : 'Staff (View)'}</span>
                  <span className="text-indigo-600 font-semibold">PIN: {acc.pin}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Informational Note */}
        <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-2 text-[11px] text-slate-600 leading-relaxed">
          <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <span>
            Default credentials: Name <strong>Owner</strong> with PIN <strong>1234</strong>. Manage accounts and staff PINs from the Accounts tab.
          </span>
        </div>
      </div>
    </div>
  );
};
