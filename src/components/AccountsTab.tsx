import React, { useState } from 'react';
import { Account, AccountRole } from '../types';
import { uid } from '../storage/db';
import { StatusChip } from './StatusChip';
import { Modal } from './Modal';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  ShieldCheck,
  KeyRound,
  UserCheck,
  Info,
} from 'lucide-react';

interface AccountsTabProps {
  accounts: Account[];
  session: Account;
  onSaveAccount: (account: Account) => void;
  onDeleteAccount: (accountId: string) => void;
}

export const AccountsTab: React.FC<AccountsTabProps> = ({
  accounts,
  session,
  onSaveAccount,
  onDeleteAccount,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    role: 'employee' as AccountRole,
    pin: '',
  });

  const handleOpenAdd = () => {
    setEditingAccount(null);
    setFormData({
      name: '',
      role: 'employee',
      pin: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (acc: Account) => {
    setEditingAccount(acc);
    setFormData({
      name: acc.name,
      role: acc.role,
      pin: acc.pin,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (acc: Account) => {
    if (acc.id === session.id) {
      alert('You cannot delete your own currently signed-in account.');
      return;
    }
    if (window.confirm(`Remove access for ${acc.name}?`)) {
      onDeleteAccount(acc.id);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.pin.trim()) {
      alert('Please provide both an account name and a PIN.');
      return;
    }

    const updated: Account = {
      id: editingAccount ? editingAccount.id : uid(),
      name: formData.name.trim(),
      role: formData.role,
      pin: formData.pin.trim(),
    };

    onSaveAccount(updated);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-2xl text-slate-900 tracking-tight">
            Accounts &amp; PIN Access
          </h2>
          <p className="text-xs font-mono text-slate-500 mt-1">
            Owner has full admin privileges. Staff members receive operational inspection and view access.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold py-2.5 px-4 rounded-lg shadow-sm font-mono uppercase tracking-wider transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          + Add Account
        </button>
      </div>

      {/* Account Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {accounts.map((acc) => {
          const isCurrent = acc.id === session.id;

          return (
            <div
              key={acc.id}
              className={`p-5 rounded-xl border shadow-xs transition-all flex flex-col justify-between ${
                isCurrent
                  ? 'bg-indigo-50/70 border-indigo-300 ring-1 ring-indigo-400/50'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-indigo-600" />
                    <span className="font-semibold text-sm text-slate-900">
                      {acc.name}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] font-mono text-indigo-700 px-1.5 py-0.5 rounded bg-indigo-100 border border-indigo-200 font-semibold">
                        Current User
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(acc)}
                      className="p-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 shadow-xs transition-colors cursor-pointer"
                      title="Edit Account"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {!isCurrent && (
                      <button
                        onClick={() => handleDelete(acc)}
                        className="p-1.5 rounded-md bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 shadow-xs transition-colors cursor-pointer"
                        title="Delete Account"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-slate-400">Role:</span>
                    <StatusChip
                      label={acc.role === 'admin' ? 'Admin / Owner' : 'Staff / Employee'}
                      tone={acc.role === 'admin' ? 'warn' : 'neutral'}
                      size="sm"
                    />
                  </div>

                  <div className="flex items-center gap-1 font-mono text-xs text-slate-700 font-medium">
                    <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                    <span>PIN: {acc.pin}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 font-mono">
                {acc.role === 'admin'
                  ? 'Can create, edit, delete hives, queens, inspections, splits, & accounts.'
                  : 'Can review colonies, look up queens, and log weekly inspections.'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Guidance Card */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 flex items-start gap-3 text-xs text-slate-600 leading-relaxed shadow-xs">
        <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-900 block font-mono text-[11px] mb-0.5">
            Station PIN Security
          </strong>
          This system uses lightweight PIN validation for shared farm terminals and yard field tablets. To change any operator PIN, click the pencil icon next to their profile.
        </div>
      </div>

      {/* Add / Edit Account Modal */}
      {isModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsModalOpen(false)}
          title={editingAccount ? `Edit ${editingAccount.name}` : 'Add Staff Account'}
          subtitle="Configure operator name, permission role, and 4-digit PIN"
          maxWidth="sm"
        >
          <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-mono font-medium text-slate-700 uppercase tracking-wider mb-1">
                Account / Staff Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Morgan or Inspector 2"
                className="w-full bg-white border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-slate-900 outline-none transition-colors"
                required
              />
            </div>

            <div>
              <label className="block font-mono font-medium text-slate-700 uppercase tracking-wider mb-1">
                System Role
              </label>
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value as AccountRole })
                }
                className="w-full bg-white border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-slate-900 outline-none capitalize"
              >
                <option value="employee">Staff / Employee (Inspection &amp; View)</option>
                <option value="admin">Owner / Admin (Full Control)</option>
              </select>
            </div>

            <div>
              <label className="block font-mono font-medium text-slate-700 uppercase tracking-wider mb-1">
                4-Digit Station PIN *
              </label>
              <input
                type="text"
                value={formData.pin}
                onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
                placeholder="e.g. 1234"
                maxLength={8}
                className="w-full bg-white border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-slate-900 outline-none font-mono tracking-widest transition-colors"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold font-mono uppercase tracking-wide transition-colors cursor-pointer"
              >
                Save Account
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
