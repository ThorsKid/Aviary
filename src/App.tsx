import React, { useState, useEffect } from 'react';
import {
  Account,
  Hive,
  Queen,
  Inspection,
  Split,
  Sale,
  TabKey,
} from './types';
import {
  loadDatabase,
  saveDatabase,
  resetDatabaseToDefaults,
  ApiaryDatabaseState,
  uid,
  daysAgo,
} from './storage/db';
import { LoginScreen } from './components/LoginScreen';
import { Sidebar } from './components/Sidebar';
import { DashboardTab } from './components/DashboardTab';
import { HivesTab } from './components/HivesTab';
import { InspectionsTab } from './components/InspectionsTab';
import { QueensTab } from './components/QueensTab';
import { SplitsTab } from './components/SplitsTab';
import { AccountsTab } from './components/AccountsTab';
import { ExportImportModal } from './components/ExportImportModal';
import { Menu, X } from 'lucide-react';

export default function App() {
  const [dbState, setDbState] = useState<ApiaryDatabaseState>(() => loadDatabase());
  const [session, setSession] = useState<Account | null>(null);
  const [currentTab, setCurrentTab] = useState<TabKey>('dashboard');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [preselectedHiveIdForInspection, setPreselectedHiveIdForInspection] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Sync to localStorage on changes
  useEffect(() => {
    saveDatabase(dbState);
  }, [dbState]);

  // If active session was deleted by admin, log out
  useEffect(() => {
    if (session) {
      const stillExists = dbState.accounts.find((a) => a.id === session.id);
      if (!stillExists) {
        setSession(null);
      }
    }
  }, [dbState.accounts, session]);

  if (!session) {
    return (
      <LoginScreen
        accounts={dbState.accounts}
        onLogin={(acc) => {
          setSession(acc);
          setCurrentTab('dashboard');
        }}
      />
    );
  }

  const isAdmin = session.role === 'admin';

  // Last inspection map for overdue badge count
  const lastInspectionMap: Record<string, string> = {};
  for (const insp of dbState.inspections) {
    if (!lastInspectionMap[insp.hive_id] || insp.date > lastInspectionMap[insp.hive_id]) {
      lastInspectionMap[insp.hive_id] = insp.date;
    }
  }

  const activeHives = dbState.hives.filter(
    (h) => h.status !== 'sold' && h.status !== 'merged' && h.status !== 'dead'
  );
  const urgentCount = activeHives.filter(
    (h) => daysAgo(lastInspectionMap[h.id]) > 7
  ).length;

  const spareQueensCount = dbState.queens.filter((q) => q.status === 'spare').length;

  // --- CRUD Handlers ---

  // Hives
  const handleSaveHive = (hive: Hive) => {
    setDbState((prev) => {
      const exists = prev.hives.some((h) => h.id === hive.id);
      const updatedHives = exists
        ? prev.hives.map((h) => (h.id === hive.id ? hive : h))
        : [...prev.hives, hive];
      return { ...prev, hives: updatedHives };
    });
  };

  const handleDeleteHive = (hiveId: string) => {
    setDbState((prev) => ({
      ...prev,
      hives: prev.hives.filter((h) => h.id !== hiveId),
      // remove references in queens
      queens: prev.queens.map((q) =>
        q.hive_id === hiveId ? { ...q, hive_id: '', status: 'spare' as const } : q
      ),
    }));
  };

  // Inspections with auto-flagging logic
  const handleSaveInspection = (insp: Inspection) => {
    setDbState((prev) => {
      const exists = prev.inspections.some((i) => i.id === insp.id);
      const updatedInspections = exists
        ? prev.inspections.map((i) => (i.id === insp.id ? insp : i))
        : [...prev.inspections, insp];

      // Auto-flag hive status:
      // If queen not seen and eggs not seen -> flag as queenless
      // If queen seen on queenless hive -> flag as active
      let updatedHives = [...prev.hives];
      const targetHive = updatedHives.find((h) => h.id === insp.hive_id);
      if (targetHive) {
        if (!insp.queen_seen && !insp.eggs_seen && targetHive.status === 'active') {
          updatedHives = updatedHives.map((h) =>
            h.id === insp.hive_id ? { ...h, status: 'queenless' as const } : h
          );
        } else if (insp.queen_seen && targetHive.status === 'queenless') {
          updatedHives = updatedHives.map((h) =>
            h.id === insp.hive_id ? { ...h, status: 'active' as const } : h
          );
        }
      }

      return {
        ...prev,
        inspections: updatedInspections,
        hives: updatedHives,
      };
    });
  };

  const handleDeleteInspection = (inspectionId: string) => {
    setDbState((prev) => ({
      ...prev,
      inspections: prev.inspections.filter((i) => i.id !== inspectionId),
    }));
  };

  // Queens
  const handleSaveQueen = (queen: Queen) => {
    setDbState((prev) => {
      const exists = prev.queens.some((q) => q.id === queen.id);
      const updatedQueens = exists
        ? prev.queens.map((q) => (q.id === queen.id ? queen : q))
        : [...prev.queens, queen];

      // If queen is placed in a hive, update hive's queen_id and status
      let updatedHives = [...prev.hives];
      if (queen.status === 'in-hive' && queen.hive_id) {
        updatedHives = updatedHives.map((h) => {
          if (h.id === queen.hive_id) {
            return {
              ...h,
              queen_id: queen.id,
              status: h.status === 'queenless' ? ('active' as const) : h.status,
            };
          }
          return h;
        });
      }

      return {
        ...prev,
        queens: updatedQueens,
        hives: updatedHives,
      };
    });
  };

  const handleDeleteQueen = (queenId: string) => {
    setDbState((prev) => ({
      ...prev,
      queens: prev.queens.filter((q) => q.id !== queenId),
      hives: prev.hives.map((h) =>
        h.queen_id === queenId ? { ...h, queen_id: '' } : h
      ),
    }));
  };

  // Splits
  const handleSaveSplit = (split: Split) => {
    setDbState((prev) => {
      const exists = prev.splits.some((s) => s.id === split.id);
      const updatedSplits = exists
        ? prev.splits.map((s) => (s.id === split.id ? split : s))
        : [...prev.splits, split];

      let updatedHives = [...prev.hives];

      // Auto-create new hive if outcome was 'kept' and new_hive_number provided
      if (!exists && split.outcome === 'kept' && split.new_hive_number.trim()) {
        const parentHive = prev.hives.find((h) => h.id === split.parent_hive_id);
        const newHive: Hive = {
          id: uid(),
          number: split.new_hive_number.trim(),
          location: parentHive ? parentHive.location : '',
          date_established: split.date,
          source: 'split',
          status: 'active',
          queen_id: '',
          notes: `Created from split of ${parentHive ? parentHive.number : 'colony'}.`,
        };
        updatedHives = [...updatedHives, newHive];
      }

      return {
        ...prev,
        splits: updatedSplits,
        hives: updatedHives,
      };
    });
  };

  const handleDeleteSplit = (splitId: string) => {
    setDbState((prev) => ({
      ...prev,
      splits: prev.splits.filter((s) => s.id !== splitId),
    }));
  };

  // Queen Sales
  const handleSaveSale = (sale: Sale) => {
    setDbState((prev) => {
      const exists = prev.sales.some((s) => s.id === sale.id);
      const updatedSales = exists
        ? prev.sales.map((s) => (s.id === sale.id ? sale : s))
        : [...prev.sales, sale];

      // If linked to an existing queen, update queen status to 'sold'
      let updatedQueens = [...prev.queens];
      if (sale.queen_id) {
        updatedQueens = updatedQueens.map((q) =>
          q.id === sale.queen_id
            ? { ...q, status: 'sold' as const, hive_id: '' }
            : q
        );
      }

      return {
        ...prev,
        sales: updatedSales,
        queens: updatedQueens,
      };
    });
  };

  const handleDeleteSale = (saleId: string) => {
    setDbState((prev) => ({
      ...prev,
      sales: prev.sales.filter((s) => s.id !== saleId),
    }));
  };

  // Accounts
  const handleSaveAccount = (account: Account) => {
    setDbState((prev) => {
      const exists = prev.accounts.some((a) => a.id === account.id);
      const updatedAccounts = exists
        ? prev.accounts.map((a) => (a.id === account.id ? account : a))
        : [...prev.accounts, account];
      return { ...prev, accounts: updatedAccounts };
    });
  };

  const handleDeleteAccount = (accountId: string) => {
    setDbState((prev) => ({
      ...prev,
      accounts: prev.accounts.filter((a) => a.id !== accountId),
    }));
  };

  // Navigation helpers
  const handleSelectHiveFromDashboard = (hive: Hive) => {
    setCurrentTab('hives');
  };

  const handleAddInspectionForHive = (hiveId: string) => {
    setPreselectedHiveIdForInspection(hiveId);
    setCurrentTab('inspections');
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-800 flex flex-col md:flex-row">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span className="text-indigo-600 font-bold text-xl">⬡</span>
          <span className="font-display font-bold text-base text-slate-900">
            ApiaryOps
          </span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex flex-col">
          <div className="p-4 flex justify-end">
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-lg bg-white text-slate-700 hover:bg-slate-100 shadow-md cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-4 flex-1">
            <Sidebar
              currentTab={currentTab}
              onSelectTab={(tab) => {
                setCurrentTab(tab);
                setIsMobileMenuOpen(false);
              }}
              session={session}
              onLogout={() => setSession(null)}
              onOpenExportImport={() => {
                setIsExportModalOpen(true);
                setIsMobileMenuOpen(false);
              }}
              hivesCount={dbState.hives.length}
              urgentInspectionsCount={urgentCount}
              spareQueensCount={spareQueensCount}
            />
          </div>
        </div>
      )}

      {/* Desktop Persistent Sidebar */}
      <div className="hidden md:block">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          session={session}
          onLogout={() => setSession(null)}
          onOpenExportImport={() => setIsExportModalOpen(true)}
          hivesCount={dbState.hives.length}
          urgentInspectionsCount={urgentCount}
          spareQueensCount={spareQueensCount}
        />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-screen">
        {currentTab === 'dashboard' && (
          <DashboardTab
            hives={dbState.hives}
            inspections={dbState.inspections}
            queens={dbState.queens}
            splits={dbState.splits}
            sales={dbState.sales}
            session={session}
            isAdmin={isAdmin}
            onSelectHive={handleSelectHiveFromDashboard}
            onAddInspectionForHive={handleAddInspectionForHive}
            onAddHive={() => setCurrentTab('hives')}
            onAddInspection={() => setCurrentTab('inspections')}
          />
        )}

        {currentTab === 'hives' && (
          <HivesTab
            hives={dbState.hives}
            queens={dbState.queens}
            inspections={dbState.inspections}
            isAdmin={isAdmin}
            onSaveHive={handleSaveHive}
            onDeleteHive={handleDeleteHive}
            onLogInspectionForHive={handleAddInspectionForHive}
          />
        )}

        {currentTab === 'inspections' && (
          <InspectionsTab
            inspections={dbState.inspections}
            hives={dbState.hives}
            session={session}
            isAdmin={isAdmin}
            onSaveInspection={handleSaveInspection}
            onDeleteInspection={handleDeleteInspection}
            preselectedHiveId={preselectedHiveIdForInspection}
            onClearPreselectedHive={() => setPreselectedHiveIdForInspection(null)}
          />
        )}

        {currentTab === 'queens' && (
          <QueensTab
            queens={dbState.queens}
            hives={dbState.hives}
            isAdmin={isAdmin}
            onSaveQueen={handleSaveQueen}
            onDeleteQueen={handleDeleteQueen}
          />
        )}

        {currentTab === 'splits' && (
          <SplitsTab
            splits={dbState.splits}
            sales={dbState.sales}
            hives={dbState.hives}
            queens={dbState.queens}
            isAdmin={isAdmin}
            onSaveSplit={handleSaveSplit}
            onDeleteSplit={handleDeleteSplit}
            onSaveSale={handleSaveSale}
            onDeleteSale={handleDeleteSale}
          />
        )}

        {currentTab === 'accounts' && isAdmin && (
          <AccountsTab
            accounts={dbState.accounts}
            session={session}
            onSaveAccount={handleSaveAccount}
            onDeleteAccount={handleDeleteAccount}
          />
        )}
      </main>

      {/* Backup & Restore Modal */}
      <ExportImportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        currentData={dbState}
        onImportData={(imported) => setDbState(imported)}
        onResetDefaults={() => setDbState(resetDatabaseToDefaults())}
      />
    </div>
  );
}
