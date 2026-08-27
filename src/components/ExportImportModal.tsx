import React, { useState } from 'react';
import { ApiaryDatabaseState, SEED_DATA } from '../storage/db';
import { Modal } from './Modal';
import { Download, Upload, RotateCcw, Check, AlertCircle } from 'lucide-react';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentData: ApiaryDatabaseState;
  onImportData: (data: ApiaryDatabaseState) => void;
  onResetDefaults: () => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  isOpen,
  onClose,
  currentData,
  onImportData,
  onResetDefaults,
}) => {
  const [importText, setImportText] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'success' | 'error'>('success');

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(currentData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `apiaryops_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = () => {
    try {
      const parsed = JSON.parse(importText);
      if (!parsed.hives || !Array.isArray(parsed.hives)) {
        throw new Error('Invalid JSON format: missing hives array.');
      }
      onImportData(parsed);
      setStatusType('success');
      setImportStatus('Successfully restored apiary backup!');
      setTimeout(() => {
        onClose();
        setImportStatus(null);
        setImportText('');
      }, 1200);
    } catch (err: any) {
      setStatusType('error');
      setImportStatus(`Import failed: ${err.message || 'Invalid JSON syntax'}`);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportText(content);
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (
      window.confirm(
        'Reset all apiary data back to original seed demo values? Any unsaved custom records will be replaced.'
      )
    ) {
      onResetDefaults();
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Apiary Data Backup & Restore"
      subtitle="Export JSON snapshots, restore operational logs, or reset demo state"
      maxWidth="md"
    >
      <div className="space-y-5 text-xs">
        {/* Export Card */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-sm text-slate-900 font-mono flex items-center gap-1.5">
                <Download className="w-4 h-4 text-indigo-600" />
                Export Operational Backup
              </h4>
              <p className="text-slate-500 mt-0.5">
                Save complete colony list ({currentData.hives.length} hives,{' '}
                {currentData.inspections.length} inspections) to a JSON file.
              </p>
            </div>
          </div>
          <button
            onClick={handleExportJSON}
            className="w-full mt-2 py-2 px-3 rounded-lg bg-white hover:bg-slate-100 text-slate-800 font-semibold font-mono uppercase tracking-wide border border-slate-200 shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600" />
            Download .json Backup
          </button>
        </div>

        {/* Import Card */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <div>
            <h4 className="font-semibold text-sm text-slate-900 font-mono flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-sky-600" />
              Restore from Backup
            </h4>
            <p className="text-slate-500 mt-0.5">
              Upload a previously exported .json file or paste raw JSON.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="flex-1 py-1.5 px-3 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-xs text-center font-mono cursor-pointer transition-colors">
              Choose .json file
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder="Paste JSON database payload here..."
            rows={3}
            className="w-full bg-white border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg p-2 text-slate-900 font-mono text-[11px] outline-none"
          />

          {importStatus && (
            <div
              className={`p-2.5 rounded-lg border flex items-center gap-2 ${
                statusType === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              {statusType === 'success' ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600" />
              )}
              <span>{importStatus}</span>
            </div>
          )}

          {importText && (
            <button
              onClick={handleImportJSON}
              className="w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold font-mono uppercase tracking-wide transition-colors cursor-pointer shadow-xs"
            >
              Confirm and Restore Database
            </button>
          )}
        </div>

        {/* Reset to Seed Defaults */}
        <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-600 font-mono transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset all data to default demo state
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
