import React, { useState } from 'react';
import { Project, RfqStatus } from '../types/project';
import { formatRfqPlainText, generateRfqCsv } from '../utils/projectLogic';
import { updateProject } from '../services/storageService';
import {
  FileSpreadsheet,
  Copy,
  Check,
  Download,
  Printer,
  Save,
  Building,
  MapPin,
  Calendar,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

interface RfqPreparationViewProps {
  projects: Project[];
  selectedProjectId?: string;
  onSelectProject: (projectId: string) => void;
  onOpenProjectDetail: (projectId: string) => void;
  onShowToast: (type: 'success' | 'warning' | 'info', title: string, description?: string) => void;
}

export const RfqPreparationView: React.FC<RfqPreparationViewProps> = ({
  projects,
  selectedProjectId,
  onSelectProject,
  onOpenProjectDetail,
  onShowToast,
}) => {
  // If no project selected, default to first project
  const currentProject =
    projects.find((p) => p.id === selectedProjectId) || projects[0];

  // Editable local state synced when currentProject changes
  const [scopeOfWork, setScopeOfWork] = useState(
    currentProject?.rfq.scopeOfWork || currentProject?.description || ''
  );
  const [driveLink, setDriveLink] = useState(
    currentProject?.rfq.googleDriveFolderLink || ''
  );
  const [pipedriveLink, setPipedriveLink] = useState(
    currentProject?.rfq.pipedriveDealLink || ''
  );
  const [price, setPrice] = useState<number>(currentProject?.rfq.price || 0);
  const [status, setStatus] = useState<RfqStatus>(
    currentProject?.rfq.status || 'Pending'
  );
  const [notes, setNotes] = useState(currentProject?.rfq.notes || '');

  const [copied, setCopied] = useState(false);

  // Sync state when switching projects
  const handleProjectSelect = (id: string) => {
    onSelectProject(id);
    const p = projects.find((proj) => proj.id === id);
    if (p) {
      setScopeOfWork(p.rfq.scopeOfWork || p.description || '');
      setDriveLink(p.rfq.googleDriveFolderLink || '');
      setPipedriveLink(p.rfq.pipedriveDealLink || '');
      setPrice(p.rfq.price || 0);
      setStatus(p.rfq.status);
      setNotes(p.rfq.notes || '');
    }
  };

  const handleSave = () => {
    if (!currentProject) return;
    updateProject(currentProject.id, {
      rfq: {
        ...currentProject.rfq,
        scopeOfWork,
        googleDriveFolderLink: driveLink.trim(),
        pipedriveDealLink: pipedriveLink.trim(),
        price: Number(price) || 0,
        status,
        notes,
      },
    });
    onShowToast('success', 'RFQ Sheet Saved', `Updated RFQ for #${currentProject.projectNumber}`);
  };

  const handleCopy = async () => {
    if (!currentProject) return;
    try {
      const text = formatRfqPlainText(currentProject);
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onShowToast('success', 'RFQ Copied', 'Formatted RFQ details copied to clipboard.');
    } catch {
      onShowToast('warning', 'Clipboard Error', 'Could not copy to clipboard.');
    }
  };

  const handleExportCsv = () => {
    if (!currentProject) return;
    const csv = generateRfqCsv(currentProject);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `RFQ_${currentProject.projectNumber}_${currentProject.companyName.replace(/\s+/g, '_')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast('success', 'CSV Downloaded', `Exported RFQ for #${currentProject.projectNumber}`);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!currentProject) {
    return (
      <div className="p-12 text-center text-zinc-500 bg-zinc-900 border border-zinc-800 rounded-xl">
        No projects available for RFQ preparation. Create a new project inquiry first.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Selector & Action Bar */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        {/* Project Selector Dropdown */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider whitespace-nowrap">
            Select Project:
          </label>
          <select
            value={currentProject.id}
            onChange={(e) => handleProjectSelect(e.target.value)}
            className="bg-zinc-950 border border-zinc-700 text-zinc-100 text-xs font-medium rounded-lg px-3 py-1.5 focus:outline-hidden"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id} className="bg-zinc-900">
                #{p.projectNumber} — {p.companyName} ({p.jobType})
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => onOpenProjectDetail(currentProject.id)}
            className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1 hover:underline ml-2"
          >
            <span>Full Details</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        {/* Global RFQ Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg border border-zinc-700 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy RFQ'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg border border-zinc-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg border border-zinc-700 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print RFQ</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 transition-colors shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save RFQ</span>
          </button>
        </div>
      </div>

      {/* Safety Notice per Specification Rule 6 & 12 */}
      <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl flex items-start gap-2.5 text-xs text-zinc-400">
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-zinc-200">Pre-Estimation Notice:</strong> Default base budget price is AUD $0. Drive and Pipedrive links remain empty until generated externally. Do not dispatch RFQs to customers or invent material costs without senior engineering approval.
        </p>
      </div>

      {/* Split Grid: Left Form, Right Document Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left: Input Editor */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 border-b border-zinc-800 pb-2.5">
            RFQ Parameters & Metadata
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-zinc-400 mb-1">Date Received</label>
              <input
                type="text"
                disabled
                value={currentProject.dateReceived}
                className="w-full bg-zinc-950/80 border border-zinc-800 rounded-lg p-2 text-zinc-400 font-mono"
              />
            </div>
            <div>
              <label className="block text-zinc-400 mb-1">Project Number</label>
              <input
                type="text"
                disabled
                value={currentProject.projectNumber}
                className="w-full bg-zinc-950/80 border border-zinc-800 rounded-lg p-2 text-zinc-400 font-mono"
              />
            </div>
            <div>
              <label className="block text-zinc-400 mb-1">Company</label>
              <input
                type="text"
                disabled
                value={currentProject.companyName}
                className="w-full bg-zinc-950/80 border border-zinc-800 rounded-lg p-2 text-zinc-400"
              />
            </div>
            <div>
              <label className="block text-zinc-400 mb-1">Project Location</label>
              <input
                type="text"
                disabled
                value={currentProject.location}
                className="w-full bg-zinc-950/80 border border-zinc-800 rounded-lg p-2 text-zinc-400"
              />
            </div>
            <div>
              <label className="block text-zinc-400 mb-1">Job Type</label>
              <input
                type="text"
                disabled
                value={currentProject.jobType}
                className="w-full bg-zinc-950/80 border border-zinc-800 rounded-lg p-2 text-zinc-400"
              />
            </div>
            <div>
              <label className="block text-zinc-400 mb-1">Tank Capacity</label>
              <input
                type="text"
                disabled
                value={currentProject.tankCapacity || 'N/A'}
                className="w-full bg-zinc-950/80 border border-zinc-800 rounded-lg p-2 text-zinc-400 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Scope of Work (Editable)
            </label>
            <textarea
              rows={4}
              value={scopeOfWork}
              onChange={(e) => setScopeOfWork(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-hidden"
              placeholder="Specify structural details, nozzle requirements, access equipment..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-zinc-400 mb-1">Google Drive Folder Link</label>
              <input
                type="text"
                value={driveLink}
                onChange={(e) => setDriveLink(e.target.value)}
                placeholder="https://drive.google.com/..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-100 placeholder:text-zinc-600"
              />
            </div>
            <div>
              <label className="block text-zinc-400 mb-1">Pipedrive Deal Link</label>
              <input
                type="text"
                value={pipedriveLink}
                onChange={(e) => setPipedriveLink(e.target.value)}
                placeholder="https://raventanks.pipedrive.com/..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-100 placeholder:text-zinc-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-zinc-400 mb-1">Price / Initial Budget (AUD)</label>
              <input
                type="number"
                min="0"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-zinc-400 mb-1">RFQ Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as RfqStatus)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-100"
              >
                <option value="Pending">Pending</option>
                <option value="In Review">In Review</option>
                <option value="Ready for Estimator">Ready for Estimator</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right: Print / Document Preview Card */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div>
              <div className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
                RAVEN TANKS AUSTRALIA
              </div>
              <h2 className="text-base font-bold text-zinc-100 mt-0.5">
                Request For Quotation (RFQ) Preparation Sheet
              </h2>
            </div>
            <div className="text-right">
              <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-200">
                PROJ #{currentProject.projectNumber}
              </span>
            </div>
          </div>

          {/* Master Table Preview */}
          <div className="divide-y divide-zinc-800 text-xs">
            <div className="py-2.5 grid grid-cols-3">
              <span className="text-zinc-500 font-medium">Company</span>
              <span className="col-span-2 text-zinc-200 font-semibold">{currentProject.companyName}</span>
            </div>
            <div className="py-2.5 grid grid-cols-3">
              <span className="text-zinc-500 font-medium">Job Classification</span>
              <span className="col-span-2 text-zinc-200">{currentProject.jobType}</span>
            </div>
            <div className="py-2.5 grid grid-cols-3">
              <span className="text-zinc-500 font-medium">Tank Capacity</span>
              <span className="col-span-2 text-zinc-200 font-mono">{currentProject.tankCapacity || 'Not specified'}</span>
            </div>
            <div className="py-2.5 grid grid-cols-3">
              <span className="text-zinc-500 font-medium">Location</span>
              <span className="col-span-2 text-zinc-200">{currentProject.location}</span>
            </div>
            <div className="py-2.5 grid grid-cols-3">
              <span className="text-zinc-500 font-medium">Date Received</span>
              <span className="col-span-2 text-zinc-200 font-mono">{currentProject.dateReceived}</span>
            </div>
            <div className="py-2.5 grid grid-cols-3">
              <span className="text-zinc-500 font-medium">Primary Contact</span>
              <div className="col-span-2 text-zinc-200 space-y-0.5">
                <div>{currentProject.contactPerson || 'Not provided'}</div>
                <div className="text-zinc-400 font-mono text-[11px]">{currentProject.contactEmail}</div>
                <div className="text-zinc-400 font-mono text-[11px]">{currentProject.contactPhone}</div>
              </div>
            </div>
            <div className="py-2.5 grid grid-cols-3">
              <span className="text-zinc-500 font-medium">Scope of Work</span>
              <div className="col-span-2 text-zinc-300 leading-relaxed bg-zinc-900/60 p-3 rounded-lg border border-zinc-800">
                {scopeOfWork || 'No detailed scope recorded.'}
              </div>
            </div>
            <div className="py-2.5 grid grid-cols-3">
              <span className="text-zinc-500 font-medium">Proposed Folder</span>
              <span className="col-span-2 text-zinc-400 font-mono text-[11px] break-all">
                {currentProject.projectNumber} {currentProject.companyName} {currentProject.jobType} {currentProject.tankCapacity} {currentProject.location}
              </span>
            </div>
            <div className="py-2.5 grid grid-cols-3">
              <span className="text-zinc-500 font-medium">Drive Folder Link</span>
              <span className="col-span-2 text-zinc-400 font-mono text-[11px] truncate">
                {driveLink || 'Proposed folder structure generated (Not yet linked in Drive)'}
              </span>
            </div>
            <div className="py-2.5 grid grid-cols-3">
              <span className="text-zinc-500 font-medium">Pipedrive Deal</span>
              <span className="col-span-2 text-zinc-400 font-mono text-[11px] truncate">
                {pipedriveLink || 'None linked'}
              </span>
            </div>
            <div className="py-2.5 grid grid-cols-3">
              <span className="text-zinc-500 font-medium">Base Price / Budget</span>
              <span className="col-span-2 font-mono text-zinc-100 font-bold">
                ${Number(price).toLocaleString()} AUD
              </span>
            </div>
            <div className="py-2.5 grid grid-cols-3">
              <span className="text-zinc-500 font-medium">RFQ Status</span>
              <span className="col-span-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-900 text-zinc-300 border border-zinc-700">
                  {status}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
