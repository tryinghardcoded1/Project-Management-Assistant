import React, { useState } from 'react';
import { AppSettings, Project } from '../types/project';
import { getSettings, resetToDemoData, saveSettings } from '../services/storageService';
import { ConfirmationModal } from '../components/ConfirmationModal';
import {
  Settings as SettingsIcon,
  Save,
  RotateCcw,
  AlertTriangle,
  FolderTree,
  FileSpreadsheet,
  CheckCircle2,
  HardDrive,
  Download,
} from 'lucide-react';

interface SettingsViewProps {
  projects: Project[];
  onShowToast: (type: 'success' | 'warning' | 'info', title: string, description?: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ projects, onShowToast }) => {
  const currentSettings = getSettings();

  const [companyName, setCompanyName] = useState(currentSettings.companyName);
  const [namingFormat, setNamingFormat] = useState(currentSettings.namingFormat);
  const [jobTypes, setJobTypes] = useState(currentSettings.jobTypes.join(', '));
  const [rfqStatuses, setRfqStatuses] = useState(currentSettings.rfqStatuses.join(', '));
  const [folderStructure, setFolderStructure] = useState(
    currentSettings.defaultFolderStructure.join('\n')
  );

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: AppSettings = {
      ...currentSettings,
      companyName: companyName.trim(),
      namingFormat: namingFormat.trim(),
      jobTypes: jobTypes
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      rfqStatuses: rfqStatuses
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      defaultFolderStructure: folderStructure
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
    };
    saveSettings(updated);
    onShowToast('success', 'Settings Saved', 'Application configuration updated successfully.');
  };

  const handleConfirmReset = () => {
    resetToDemoData();
    setIsResetModalOpen(false);
    onShowToast('success', 'Database Reset', 'Sample demonstration records reloaded.');
  };

  const handleExportJsonBackup = () => {
    const data = {
      exportDate: new Date().toISOString(),
      system: 'Raven Project Setup Assistant',
      version: '1.0-prototype',
      projects,
      settings: currentSettings,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Raven_Tanks_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast('success', 'Backup Exported', 'Full project database downloaded as JSON.');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-zinc-800">
        <div>
          <h2 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
            <SettingsIcon className="w-4 h-4 text-zinc-400" />
            System Configuration & Standards
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Raven Tanks naming protocols, job classifications, and master calculator references.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportJsonBackup}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg border border-zinc-800 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON Backup</span>
          </button>

          <button
            type="button"
            onClick={() => setIsResetModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-300 hover:text-amber-200 bg-amber-950/40 hover:bg-amber-950/80 rounded-lg border border-amber-800/60 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Records</span>
          </button>
        </div>
      </div>

      {/* Standard Procedure Advisory Banner */}
      <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl flex items-start gap-3 text-xs text-zinc-400">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-zinc-200 font-semibold">
            Governance & Procedure Notice
          </p>
          <p className="leading-relaxed">
            Changes to naming conventions and folder structures must be approved based on Raven Tanks' confirmed standard operating procedures. Original calculation formulas, engineering rules, and pricing algorithms remain strictly controlled and are never altered by this assistant.
          </p>
        </div>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Company & Naming Formula */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 border-b border-zinc-800 pb-2.5">
            1. Organization & Naming Rules
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-zinc-300 font-medium mb-1">Company Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-100 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-medium mb-1">
                Project Folder Naming Formula
              </label>
              <input
                type="text"
                value={namingFormat}
                onChange={(e) => setNamingFormat(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 font-mono text-zinc-100 focus:outline-hidden"
              />
              <p className="text-[10px] text-zinc-500 mt-1">
                Standard: [Project Number] [Company Name] [Job Type] [Capacity] [Location]
              </p>
            </div>
          </div>
        </div>

        {/* Dropdown Options */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 border-b border-zinc-800 pb-2.5">
            2. Taxonomies & Classifications
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-zinc-300 font-medium mb-1">
                Job Type Classifications (comma-separated)
              </label>
              <input
                type="text"
                value={jobTypes}
                onChange={(e) => setJobTypes(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-100 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-medium mb-1">
                RFQ Status Options (comma-separated)
              </label>
              <input
                type="text"
                value={rfqStatuses}
                onChange={(e) => setRfqStatuses(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-100 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-medium mb-1">
                Default Folder Hierarchy Template (one per line)
              </label>
              <textarea
                rows={3}
                value={folderStructure}
                onChange={(e) => setFolderStructure(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 font-mono text-xs text-zinc-100 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Master Calculator Templates Reference */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
              3. Master Calculator Template Catalog (Read-Only Master References)
            </h3>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
              Protected Formulas
            </span>
          </div>

          <div className="space-y-2.5">
            {currentSettings.calculatorTemplates.map((tpl) => (
              <div
                key={tpl.id}
                className="p-3 bg-zinc-950 border border-zinc-800/90 rounded-lg flex flex-wrap items-start justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-zinc-200">{tpl.name}</span>
                    <span className="font-mono text-[10px] px-1.5 py-0.2 bg-zinc-800 text-zinc-300 rounded">
                      {tpl.referenceCode}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5">{tpl.notes}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-medium text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                    Type: {tpl.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit action */}
        <div className="flex items-center justify-end pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 transition-colors shadow-xs"
          >
            <Save className="w-4 h-4 stroke-[2.5]" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>

      {/* Reset Confirmation Modal */}
      <ConfirmationModal
        isOpen={isResetModalOpen}
        title="Reset to Demonstration Records"
        message="This will reset all project records and settings back to the initial Raven demonstration data. Any new local projects created will be replaced."
        confirmLabel="Reset Everything"
        cancelLabel="Cancel"
        variant="warning"
        onConfirm={handleConfirmReset}
        onCancel={() => setIsResetModalOpen(false)}
      />
    </div>
  );
};
