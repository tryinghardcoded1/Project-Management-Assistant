import React, { useState } from 'react';
import { Project, ProjectDocuments, ChecklistItem, RfqStatus, SetupStatus } from '../types/project';
import {
  calculateSetupProgress,
  deriveSetupStatus,
  formatRfqPlainText,
  generateRfqCsv,
} from '../utils/projectLogic';
import { updateChecklistItem, updateProject, updateRfq } from '../services/storageService';
import { FolderStructureView } from '../components/FolderStructureView';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  Download,
  FileSpreadsheet,
  FileText,
  FolderGit2,
  Link,
  Printer,
  Save,
  User,
  AlertTriangle,
  FolderCheck,
  Building,
  MapPin,
  ExternalLink,
} from 'lucide-react';

export type DetailTab = 'overview' | 'documents' | 'rfq' | 'checklist' | 'notes';

interface ProjectDetailViewProps {
  project: Project;
  initialTab?: DetailTab;
  onBack: () => void;
  onShowToast: (type: 'success' | 'warning' | 'info', title: string, description?: string) => void;
}

export const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({
  project,
  initialTab = 'overview',
  onBack,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<DetailTab>(initialTab);

  // Editable fields for Overview
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [companyName, setCompanyName] = useState(project.companyName);
  const [tankCapacity, setTankCapacity] = useState(project.tankCapacity);
  const [location, setLocation] = useState(project.location);
  const [description, setDescription] = useState(project.description);
  const [contactPerson, setContactPerson] = useState(project.contactPerson);
  const [contactEmail, setContactEmail] = useState(project.contactEmail);
  const [contactPhone, setContactPhone] = useState(project.contactPhone);

  // Editable fields for RFQ
  const [rfqScope, setRfqScope] = useState(project.rfq.scopeOfWork || project.description);
  const [rfqDriveLink, setRfqDriveLink] = useState(project.rfq.googleDriveFolderLink);
  const [rfqPipedriveLink, setRfqPipedriveLink] = useState(project.rfq.pipedriveDealLink);
  const [rfqPrice, setRfqPrice] = useState<number>(project.rfq.price || 0);
  const [rfqStatus, setRfqStatus] = useState<RfqStatus>(project.rfq.status);
  const [rfqNotes, setRfqNotes] = useState(project.rfq.notes || '');

  // Internal notes
  const [internalNotes, setInternalNotes] = useState(project.internalNotes);

  // State for checklist notes expansion
  const [activeChecklistNoteId, setActiveChecklistNoteId] = useState<string | null>(null);
  const [checklistNoteDraft, setChecklistNoteDraft] = useState('');

  // Copy state
  const [copiedRfq, setCopiedRfq] = useState(false);

  const progress = calculateSetupProgress(project.checklist);

  const handleSaveInfo = () => {
    updateProject(project.id, {
      companyName: companyName.trim(),
      tankCapacity: tankCapacity.trim(),
      location: location.trim(),
      description: description.trim(),
      contactPerson: contactPerson.trim(),
      contactEmail: contactEmail.trim(),
      contactPhone: contactPhone.trim(),
    });
    setIsEditingInfo(false);
    onShowToast('success', 'Project Updated', 'Project details saved successfully.');
  };

  const handleToggleDoc = (key: keyof ProjectDocuments) => {
    const updatedDocs = {
      ...project.documents,
      [key]: !project.documents[key],
    };
    updateProject(project.id, { documents: updatedDocs });
    onShowToast('info', 'Document Intake Updated', `${key} status updated.`);
  };

  const handleToggleChecklist = (itemId: string, currentCompleted: boolean) => {
    updateChecklistItem(project.id, itemId, !currentCompleted);
    onShowToast(
      !currentCompleted ? 'success' : 'info',
      !currentCompleted ? 'Task Completed' : 'Task Reopened',
      'Checklist and readiness recalculated.'
    );
  };

  const handleSaveChecklistNote = (itemId: string) => {
    updateChecklistItem(project.id, itemId, project.checklist.find((i) => i.id === itemId)?.completed || false, checklistNoteDraft);
    setActiveChecklistNoteId(null);
    onShowToast('success', 'Checklist Note Saved', 'Note appended to checklist task.');
  };

  const handleSaveRfq = () => {
    updateProject(project.id, {
      rfq: {
        ...project.rfq,
        scopeOfWork: rfqScope,
        googleDriveFolderLink: rfqDriveLink.trim(),
        pipedriveDealLink: rfqPipedriveLink.trim(),
        price: Number(rfqPrice) || 0,
        status: rfqStatus,
        notes: rfqNotes,
      },
    });
    onShowToast('success', 'RFQ Sheet Saved', 'RFQ preparation information saved.');
  };

  const handleSaveNotes = () => {
    updateProject(project.id, { internalNotes });
    onShowToast('success', 'Notes Saved', 'Internal notes updated.');
  };

  const handleCopyRfqText = async () => {
    try {
      const text = formatRfqPlainText(project);
      await navigator.clipboard.writeText(text);
      setCopiedRfq(true);
      setTimeout(() => setCopiedRfq(false), 2000);
      onShowToast('success', 'Copied to Clipboard', 'RFQ preparation sheet ready to paste.');
    } catch {
      onShowToast('warning', 'Clipboard Error', 'Could not copy to clipboard.');
    }
  };

  const handleExportRfqCsv = () => {
    const csv = generateRfqCsv(project);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Raven_RFQ_${project.projectNumber}_${project.companyName.replace(/\s+/g, '_')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast('success', 'CSV Exported', `RFQ sheet for ${project.projectNumber} downloaded.`);
  };

  const handlePrintRfq = () => {
    window.print();
  };

  const tabs: { id: DetailTab; label: string; count?: string | number }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'documents', label: 'Documents', count: Object.values(project.documents).filter(Boolean).length },
    { id: 'rfq', label: 'RFQ Preparation' },
    { id: 'checklist', label: 'Checklist', count: `${progress.completed}/${progress.total}` },
    { id: 'notes', label: 'Internal Notes' },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Back button & top meta */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg border border-zinc-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Projects</span>
        </button>

        <div className="flex items-center gap-2">
          {project.isDemoRecord && (
            <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-amber-950/60 border border-amber-800/60 text-amber-300">
              DEMONSTRATION RECORD
            </span>
          )}
          <span className="text-xs text-zinc-500 font-mono">
            Created: {new Date(project.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Project Master Card Header */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-5 shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-1 rounded bg-zinc-950 border border-zinc-700/80 font-mono text-sm font-bold text-zinc-100">
                #{project.projectNumber}
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
                {project.jobType}
              </span>
              {project.setupStatus === 'Ready for Budgeting' ? (
                <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/70 inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Ready for Budgeting
                </span>
              ) : project.setupStatus === 'Missing Information' ? (
                <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-amber-950/80 text-amber-300 border border-amber-800/70 inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  Missing Information
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700 inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                  In Progress
                </span>
              )}
            </div>

            <h2 className="text-xl font-bold text-zinc-100 tracking-tight">
              {project.companyName}
            </h2>

            <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 pt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                {project.location}
              </span>
              {project.tankCapacity && (
                <span className="font-mono text-zinc-300">
                  Capacity: {project.tankCapacity}
                </span>
              )}
              {project.contactPerson && (
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-zinc-500" />
                  {project.contactPerson}
                </span>
              )}
            </div>
          </div>

          {/* Quick Right Metric Card */}
          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/80 min-w-56 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-zinc-400">Setup Completion</span>
              <span className={`font-mono font-bold ${progress.percentage === 100 ? 'text-emerald-400' : 'text-zinc-200'}`}>
                {progress.percentage}%
              </span>
            </div>
            <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
              <div
                className={`h-full transition-all duration-300 ${
                  progress.percentage === 100 ? 'bg-emerald-400' : 'bg-zinc-300'
                }`}
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
              <span>{progress.completed} of {progress.total} verified</span>
              <span>{progress.outstanding.length} remaining</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-zinc-800 overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
                  isActive
                    ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 text-[10px] rounded font-mono ${
                      isActive ? 'bg-zinc-300 text-zinc-950' : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Automatic Folder Blueprint Section */}
          <FolderStructureView
            projectNumber={project.projectNumber}
            companyName={project.companyName}
            jobType={project.jobType}
            tankCapacity={project.tankCapacity}
            location={project.location}
          />

          {/* Project Details Grid */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Project Information & Customer Details
              </h3>
              {!isEditingInfo ? (
                <button
                  type="button"
                  onClick={() => setIsEditingInfo(true)}
                  className="px-2.5 py-1 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-md border border-zinc-700 transition-colors"
                >
                  Edit Information
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingInfo(false)}
                    className="px-2.5 py-1 text-xs text-zinc-400 hover:text-zinc-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveInfo}
                    className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md bg-zinc-100 hover:bg-white text-zinc-950 shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </button>
                </div>
              )}
            </div>

            {!isEditingInfo ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
                <div>
                  <span className="text-zinc-500 block text-[11px] uppercase">Company Legal Name</span>
                  <span className="font-medium text-zinc-100 text-sm mt-0.5 block">{project.companyName}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[11px] uppercase">Project Job Number</span>
                  <span className="font-mono text-zinc-100 text-sm mt-0.5 block">{project.projectNumber}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[11px] uppercase">Job Classification</span>
                  <span className="font-medium text-zinc-100 text-sm mt-0.5 block">{project.jobType}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[11px] uppercase">Tank Volume / Capacity</span>
                  <span className="font-mono text-zinc-100 text-sm mt-0.5 block">{project.tankCapacity || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[11px] uppercase">Installation Location</span>
                  <span className="text-zinc-100 text-sm mt-0.5 block">{project.location}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[11px] uppercase">Date Inquiry Received</span>
                  <span className="font-mono text-zinc-100 text-sm mt-0.5 block">{project.dateReceived}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[11px] uppercase">Primary Contact Person</span>
                  <span className="text-zinc-100 text-sm mt-0.5 block">{project.contactPerson || 'Not provided'}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[11px] uppercase">Primary Email</span>
                  <span className="text-zinc-100 text-sm mt-0.5 block">{project.contactEmail || 'Not provided'}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[11px] uppercase">Primary Phone</span>
                  <span className="font-mono text-zinc-100 text-sm mt-0.5 block">{project.contactPhone || 'Not provided'}</span>
                </div>
                <div className="md:col-span-2 lg:col-span-3 pt-2 border-t border-zinc-800/60">
                  <span className="text-zinc-500 block text-[11px] uppercase mb-1">Scope Summary / Inquiry Notes</span>
                  <p className="text-zinc-300 leading-relaxed bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                    {project.description || 'No description recorded.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-zinc-400 mb-1">Company Name</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Tank Capacity</label>
                  <input
                    type="text"
                    value={tankCapacity}
                    onChange={(e) => setTankCapacity(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-zinc-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-zinc-100 font-mono"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-zinc-400 mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-zinc-100"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Documents */}
      {activeTab === 'documents' && (
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">
                Document Intake Verification
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Record whether drawings and specifications have been received from client.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              {
                key: 'customerEmail',
                title: 'Customer Email & Direct Request',
                desc: 'Initial correspondence containing customer requests, scope parameters, or scheduling expectations.',
              },
              {
                key: 'tankDrawings',
                title: 'Tank Drawings & Architectural Plans',
                desc: 'Dimensioned drawings, nozzle schedules, foundation details, or site general arrangements.',
              },
              {
                key: 'technicalSpecs',
                title: 'Technical Specifications & Design Standards',
                desc: 'Client technical sheets, AS2304 / AS1170 wind/seismic design parameters, or potable water compliance.',
              },
              {
                key: 'scopeOfWork',
                title: 'Formal Scope of Work Document',
                desc: 'Contract scope document, tender guidelines, or bill of quantities.',
              },
              {
                key: 'additionalAttachments',
                title: 'Additional Attachments & Site Photos',
                desc: 'Photographs of existing tank site, access constraints, crane pad locations, or power availability.',
              },
            ].map(({ key, title, desc }) => {
              const isChecked = project.documents[key as keyof ProjectDocuments];
              return (
                <div
                  key={key}
                  className={`flex items-start justify-between p-4 rounded-xl border transition-colors ${
                    isChecked
                      ? 'bg-zinc-900 border-zinc-700 text-zinc-100'
                      : 'bg-zinc-950/60 border-zinc-800/80 text-zinc-400'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-zinc-200">{title}</span>
                      {isChecked ? (
                        <span className="px-2 py-0.2 text-[10px] font-medium bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 rounded">
                          RECEIVED
                        </span>
                      ) : (
                        <span className="px-2 py-0.2 text-[10px] font-medium bg-amber-950/80 text-amber-300 border border-amber-800/60 rounded">
                          PENDING RECEIPT
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed max-w-2xl">{desc}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleDoc(key as keyof ProjectDocuments)}
                    className={`shrink-0 ml-4 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                      isChecked
                        ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700'
                        : 'bg-zinc-100 hover:bg-white text-zinc-950 font-semibold border-transparent'
                    }`}
                  >
                    {isChecked ? 'Mark Not Received' : 'Confirm Receipt'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: RFQ Preparation */}
      {activeTab === 'rfq' && (
        <div className="space-y-6">
          {/* RFQ Action Bar */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-zinc-400" />
                RFQ Preparation & Estimator Handoff
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Default price is 0. Drive and Pipedrive links remain empty until generated externally.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyRfqText}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg border border-zinc-700 transition-colors"
              >
                {copiedRfq ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedRfq ? 'Copied Details' : 'Copy RFQ Text'}</span>
              </button>

              <button
                type="button"
                onClick={handleExportRfqCsv}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg border border-zinc-700 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>

              <button
                type="button"
                onClick={handlePrintRfq}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg border border-zinc-700 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print RFQ</span>
              </button>

              <button
                type="button"
                onClick={handleSaveRfq}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 transition-colors shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save RFQ Data</span>
              </button>
            </div>
          </div>

          {/* Form and Preview Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Editable RFQ Inputs */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 border-b border-zinc-800 pb-2.5">
                Editable RFQ Fields
              </h4>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  RFQ Status
                </label>
                <select
                  value={rfqStatus}
                  onChange={(e) => setRfqStatus(e.target.value as RfqStatus)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 focus:outline-hidden"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Review">In Review</option>
                  <option value="Ready for Estimator">Ready for Estimator</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Scope of Work (Detailed for Estimating)
                </label>
                <textarea
                  rows={4}
                  value={rfqScope}
                  onChange={(e) => setRfqScope(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-hidden"
                  placeholder="List specific tank diameter, roof type, liner thickness, fittings..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Google Drive Folder URL
                  </label>
                  <input
                    type="url"
                    value={rfqDriveLink}
                    onChange={(e) => setRfqDriveLink(e.target.value)}
                    placeholder="https://drive.google.com/..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-hidden"
                  />
                  <p className="text-[10px] text-zinc-500 mt-1">Paste once created in Raven cloud drive.</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Pipedrive Deal Link
                  </label>
                  <input
                    type="url"
                    value={rfqPipedriveLink}
                    onChange={(e) => setRfqPipedriveLink(e.target.value)}
                    placeholder="https://raventanks.pipedrive.com/deal/..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-hidden"
                  />
                  <p className="text-[10px] text-zinc-500 mt-1">Link to active CRM opportunity.</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Budget / Initial Target Price (AUD)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-zinc-500">$</span>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={rfqPrice}
                    onChange={(e) => setRfqPrice(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-7 pr-3 py-2 text-xs font-mono text-zinc-100 focus:outline-hidden"
                  />
                </div>
                <p className="text-[10px] text-zinc-500 mt-1">
                  Default value is 0. Never invent engineering pricing before estimation calculation.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Estimator Notes & Special Site Constraints
                </label>
                <textarea
                  rows={2}
                  value={rfqNotes}
                  onChange={(e) => setRfqNotes(e.target.value)}
                  placeholder="e.g. Requires 55t crane hire, mine site inductions, or after-hours installation..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Right: Formatted Official RFQ Preview Card */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-100 tracking-wider uppercase">
                    Raven Tanks RFQ Summary Sheet
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                  REF #{project.projectNumber}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2 text-[11px] pb-3 border-b border-zinc-800/80">
                  <div>
                    <span className="text-zinc-500 block">Company:</span>
                    <span className="font-semibold text-zinc-200">{project.companyName}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Location:</span>
                    <span className="text-zinc-200">{project.location}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Job Type:</span>
                    <span className="text-zinc-200">{project.jobType}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Capacity:</span>
                    <span className="font-mono text-zinc-200">{project.tankCapacity || 'N/A'}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-zinc-500 uppercase block font-medium">Scope of Work</span>
                  <div className="mt-1 bg-zinc-900/80 p-3 rounded-lg border border-zinc-800/90 text-xs text-zinc-300 leading-relaxed font-sans">
                    {rfqScope || 'Pending scope definition.'}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  <div>
                    <span className="text-zinc-500 block">Contact Name:</span>
                    <span className="text-zinc-200">{project.contactPerson || 'Not provided'}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Contact Email:</span>
                    <span className="text-zinc-200">{project.contactEmail || 'Not provided'}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Drive Folder:</span>
                    <span className="text-zinc-400 font-mono text-[10px] truncate block">
                      {rfqDriveLink || 'Proposed structure generated (not yet linked)'}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Target Budget:</span>
                    <span className="text-zinc-200 font-mono font-medium">${rfqPrice.toLocaleString()} AUD</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-800/80 text-[10px] text-zinc-500 leading-relaxed">
                  * Notice: RFQ preparation document. Do not send to client without senior estimator approval and engineering calculation sign-off.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: 16-Point Setup Checklist */}
      {activeTab === 'checklist' && (
        <div className="space-y-6">
          {/* Checklist Metric Header */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-zinc-400" />
                16-Point Project Administration Checklist
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Each task must be verified by admin before project is ready for budget preparation.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-xs font-medium text-zinc-400">Readiness Score</div>
                <div className={`text-xl font-bold font-mono ${progress.percentage === 100 ? 'text-emerald-400' : 'text-zinc-100'}`}>
                  {progress.percentage}%
                </div>
              </div>
            </div>
          </div>

          {/* Checklist Items */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl divide-y divide-zinc-800/80 overflow-hidden shadow-xs">
            {project.checklist.map((item) => {
              const isNoteOpen = activeChecklistNoteId === item.id;
              return (
                <div
                  key={item.id}
                  className={`p-4 transition-colors ${
                    item.completed ? 'bg-zinc-950/40' : 'hover:bg-zinc-800/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() => handleToggleChecklist(item.id, item.completed)}
                        className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                          item.completed
                            ? 'bg-emerald-600 border-emerald-500 text-white'
                            : 'border-zinc-700 bg-zinc-950 hover:border-zinc-500'
                        }`}
                        title={item.completed ? 'Click to reopen task' : 'Click to mark complete'}
                      >
                        {item.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-zinc-500">
                            STEP #{item.order.toString().padStart(2, '0')}
                          </span>
                          <span
                            className={`text-xs font-medium ${
                              item.completed ? 'line-through text-zinc-500' : 'text-zinc-200'
                            }`}
                          >
                            {item.label}
                          </span>
                        </div>

                        {item.description && (
                          <p className="text-[11px] text-zinc-400 leading-relaxed">
                            {item.description}
                          </p>
                        )}

                        {item.notes && !isNoteOpen && (
                          <div className="mt-1 text-[11px] text-zinc-400 bg-zinc-950/80 px-2.5 py-1 rounded border border-zinc-800/80 inline-block font-sans">
                            <span className="text-zinc-500 font-medium">Note:</span> {item.notes}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          if (isNoteOpen) {
                            setActiveChecklistNoteId(null);
                          } else {
                            setActiveChecklistNoteId(item.id);
                            setChecklistNoteDraft(item.notes || '');
                          }
                        }}
                        className="text-xs text-zinc-400 hover:text-zinc-200 px-2 py-1 rounded hover:bg-zinc-800 transition-colors"
                      >
                        {item.notes ? 'Edit Note' : '+ Note'}
                      </button>
                    </div>
                  </div>

                  {/* Note Editing Drawer */}
                  {isNoteOpen && (
                    <div className="mt-3 pl-8 pr-2 pt-2 border-t border-zinc-800/60 flex items-center gap-2">
                      <input
                        type="text"
                        value={checklistNoteDraft}
                        onChange={(e) => setChecklistNoteDraft(e.target.value)}
                        placeholder="Add verification notes or reason for pending status..."
                        className="flex-1 bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveChecklistNote(item.id)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 shadow-xs"
                      >
                        Save Note
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveChecklistNoteId(null)}
                        className="px-2 py-1.5 text-xs text-zinc-400 hover:text-zinc-200"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 5: Internal Notes */}
      {activeTab === 'notes' && (
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">
                Internal Engineering & Administration Log
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Private notes for Raven Tanks estimating and project delivery team.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSaveNotes}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 transition-colors shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Internal Notes</span>
            </button>
          </div>

          <textarea
            rows={8}
            value={internalNotes}
            onChange={(e) => setInternalNotes(e.target.value)}
            placeholder="Record site constraints, special customer requests, delivery deadlines, crane permit requirements, or historical tank data..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3.5 text-xs text-zinc-100 leading-relaxed placeholder:text-zinc-600 focus:outline-hidden focus:border-zinc-700"
          />

          <div className="text-[11px] text-zinc-500 font-mono">
            Last Updated: {new Date(project.updatedAt).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
};
