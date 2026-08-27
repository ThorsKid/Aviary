import React from 'react';
import { TabKey, Account } from '../types';
import {
  LayoutDashboard,
  Box,
  ClipboardCheck,
  Crown,
  GitFork,
  Users,
  LogOut,
  DatabaseBackup,
} from 'lucide-react';
import { StatusChip } from './StatusChip';

interface SidebarProps {
  currentTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  session: Account;
  onLogout: () => void;
  onOpenExportImport: () => void;
  hivesCount: number;
  urgentInspectionsCount: number;
  spareQueensCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  session,
  onLogout,
  onOpenExportImport,
  hivesCount,
  urgentInspectionsCount,
  spareQueensCount,
}) => {
  const isAdmin = session.role === 'admin';

  const navItems: {
    key: TabKey;
    label: string;
    icon: React.ReactNode;
    badge?: string | number;
    badgeTone?: 'warn' | 'neutral';
    adminOnly?: boolean;
  }[] = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      key: 'hives',
      label: 'Hives',
      icon: <Box className="w-4 h-4" />,
      badge: hivesCount,
    },
    {
      key: 'inspections',
      label: 'Inspections',
      icon: <ClipboardCheck className="w-4 h-4" />,
      badge: urgentInspectionsCount > 0 ? `${urgentInspectionsCount} due` : undefined,
      badgeTone: 'warn',
    },
    {
      key: 'queens',
      label: 'Queens',
      icon: <Crown className="w-4 h-4" />,
      badge: spareQueensCount > 0 ? `${spareQueensCount} bank` : undefined,
      badgeTone: 'neutral',
    },
    {
      key: 'splits',
      label: 'Splits & Sales',
      icon: <GitFork className="w-4 h-4" />,
    },
    {
      key: 'accounts',
      label: 'Accounts',
      icon: <Users className="w-4 h-4" />,
      adminOnly: true,
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 select-none h-screen sticky top-0">
      {/* Brand Header */}
      <div>
        <div className="px-5 py-5 border-b border-slate-200 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-xs">
            ⬡
          </div>
          <div>
            <h1 className="font-display font-bold text-base text-slate-900 tracking-tight leading-tight">
              ApiaryOps
            </h1>
            <p className="text-[10px] font-mono uppercase tracking-wider text-indigo-600 font-semibold">
              Apiary Operations
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="p-3 space-y-1 mt-2">
          {navItems.map((item) => {
            if (item.adminOnly && !isAdmin) return null;
            const isActive = currentTab === item.key;

            return (
              <button
                key={item.key}
                onClick={() => onSelectTab(item.key)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium tracking-wide transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 shadow-xs border border-indigo-100 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-indigo-600' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${
                      item.badgeTone === 'warn'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200 font-medium'
                        : isActive
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer / User Profile & Tools */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/70 space-y-2.5">
        {/* Data Tools */}
        <button
          onClick={onOpenExportImport}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium shadow-xs transition-colors cursor-pointer"
        >
          <DatabaseBackup className="w-3.5 h-3.5 text-indigo-600" />
          <span>Backup & Restore Data</span>
        </button>

        {/* Current Operator Card */}
        <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-xs flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-900 truncate">
              {session.name}
            </span>
            <StatusChip
              label={isAdmin ? 'Admin' : 'Staff'}
              tone={isAdmin ? 'warn' : 'neutral'}
              size="sm"
            />
          </div>
          <p className="text-[10px] text-slate-500 font-mono">
            {isAdmin ? 'Full read & write control' : 'Inspection & view access'}
          </p>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-medium transition-colors border border-slate-200 hover:border-rose-200 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out Station</span>
        </button>
      </div>
    </aside>
  );
};
