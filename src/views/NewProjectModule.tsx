import React, { useState } from 'react';
import { JobType, Project, ProjectDocuments } from '../types/project';
import { isProjectNumberUnique, saveProject } from '../services/storageService';
import { FolderStructureView } from '../components/FolderStructureView';
import { ConfirmationModal } from '../components/ConfirmationModal';
import {
  FilePlus2,
  FolderGit2,
  User,
  FileCheck,
  AlertCircle,
  Check,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';

interface NewProjectModuleProps {
  onProjectCreated: (savedProject: Project) => void;
  onCancel: () => void;
  onShowToast: (type: 'success' | 'warning' | 'info', title: string, description?: string) => void;
}

export const NewProjectModule: React.FC<NewProjectModuleProps> = ({
  onProjectCreated,
  onCancel,
  onShowToast,
}) => {
  // Form State
  const [projectNumber, setProjectNumber] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobType, setJobType] = useState<JobType>('New Tank');
  const [tankCapacity, setTankCapacity] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [dateReceived, setDateReceived] = useState(
    new Date().toISOString().split('T')[0]
  );

  // Contact Info
  const [contactPerson, setContactPerson] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  // Documents Checkbox
  const [documents, setDocuments] = useState<ProjectDocuments>({
    customerEmail: true,
    tankDrawings: false,
    technicalSpecs: false,
    scopeOfWork: false,
    additionalAttachments: false,
  });

  // Internal & Initial Scope notes
  const [internalNotes, setInternalNotes] = useState('');

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const jobTypeOptions: JobType[] = [
    'New Tank',
    'Refurb',
    'Inspection (INS)',
    'Liner Cleaning (PLN)',
    'Other',
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!projectNumber.trim()) {
      newErrors.projectNumber = 'Project Number is required.';
    } else if (!isProjectNumberUnique(projectNumber.trim())) {
      newErrors.projectNumber = `Project number "${projectNumber.trim()}" is already registered. Duplicate numbers are not permitted.`;
    }

    if (!companyName.trim()) {
      newErrors.companyName = 'Company Name is required.';
    }

    if (!jobType) {
      newErrors.jobType = 'Job Type is required.';
    }

    if (!location.trim()) {
      newErrors.location = 'Project Location is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePreSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsConfirmModalOpen(true);
    } else {
      onShowToast('warning', 'Validation Error', 'Please complete all required fields marked in red.');
    }
  };

  const handleConfirmSave = () => {
    const result = saveProject({
      projectNumber: projectNumber.trim(),
      companyName: companyName.trim(),
      jobType,
      tankCapacity: tankCapacity.trim(),
      location: location.trim(),
      description: description.trim(),
      dateReceived,
      contactPerson: contactPerson.trim(),
      contactEmail: contactEmail.trim(),
      contactPhone: contactPhone.trim(),
      documents,
      checklist: [], // Will be auto-initialized with 16 standard tasks
      rfq: {
        scopeOfWork: description.trim(),
        contactPerson: contactPerson.trim(),
        contactEmail: contactEmail.trim(),
        contactPhone: contactPhone.trim(),
        googleDriveFolderLink: '',
        pipedriveDealLink: '',
        price: 0,
        status: 'Pending',
      },
      internalNotes: internalNotes.trim(),
      isDemoRecord: false,
    });

    if (result.success && result.project) {
      onShowToast('success', 'Project Registered', `Project ${result.project.projectNumber} created successfully.`);
      setIsConfirmModalOpen(false);
      onProjectCreated(result.project);
    } else {
      onShowToast('warning', 'Failed to save project', result.error || 'An error occurred while saving.');
    }
  };

  const toggleDocument = (key: keyof ProjectDocuments) => {
    setDocuments((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleFillDemoValues = () => {
    const randomNum = Math.floor(1035 + Math.random() * 50);
    setProjectNumber(`${randomNum}`);
    setCompanyName('Queensland Alumina Refineries');
    setJobType('New Tank');
    setTankCapacity('750KL');
    setLocation('Gladstone QLD');
    setDescription('Design, fabrication, and site assembly of 750kL circular bolted raw water tank with reinforced liner.');
    setContactPerson('Graham Hughes');
    setContactEmail('g.hughes@qar-sample.example.com');
    setContactPhone('+61 7 4976 2200');
    setDocuments({
      customerEmail: true,
      tankDrawings: true,
      technicalSpecs: true,
      scopeOfWork: false,
      additionalAttachments: false,
    });
    setInternalNotes('Awaiting geotechnical soil test report before finalizing footing details.');
    setErrors({});
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Page Title & Rule Callout */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-zinc-800">
        <div>
          <h2 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
            <FilePlus2 className="w-5 h-5 text-zinc-300" />
            New Project Inquiry Setup
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Enter confirmed client inquiry details. Do not guess sequential job numbers — verify against Raven records.
          </p>
        </div>

        <button
          type="button"
          onClick={handleFillDemoValues}
          className="text-xs text-zinc-400 hover:text-zinc-200 border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Fill Test Form</span>
        </button>
      </div>

      <form onSubmit={handlePreSave} className="space-y-6">
        {/* Section 1: Project Information */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-300 border-b border-zinc-800/80 pb-2.5">
            <FolderGit2 className="w-4 h-4 text-zinc-400" />
            <span>1. Core Project Information</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Project Number */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Project Number <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={projectNumber}
                onChange={(e) => {
                  setProjectNumber(e.target.value);
                  if (errors.projectNumber) setErrors((prev) => ({ ...prev, projectNumber: '' }));
                }}
                placeholder="e.g. 1033"
                className={`w-full bg-zinc-950 border rounded-lg px-3 py-2 text-xs font-mono text-zinc-100 placeholder:text-zinc-600 focus:outline-hidden ${
                  errors.projectNumber ? 'border-rose-500 ring-1 ring-rose-500' : 'border-zinc-800 focus:border-zinc-600'
                }`}
              />
              {errors.projectNumber ? (
                <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {errors.projectNumber}
                </p>
              ) : (
                <p className="text-[10px] text-zinc-500 mt-1">Must be unique and verified against records.</p>
              )}
            </div>

            {/* Company Name */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Company Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => {
                  setCompanyName(e.target.value);
                  if (errors.companyName) setErrors((prev) => ({ ...prev, companyName: '' }));
                }}
                placeholder="e.g. Queensland Water Authority"
                className={`w-full bg-zinc-950 border rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-hidden ${
                  errors.companyName ? 'border-rose-500 ring-1 ring-rose-500' : 'border-zinc-800 focus:border-zinc-600'
                }`}
              />
              {errors.companyName && (
                <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {errors.companyName}
                </p>
              )}
            </div>

            {/* Job Type Dropdown */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Job Type <span className="text-rose-400">*</span>
              </label>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value as JobType)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-600 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-hidden"
              >
                {jobTypeOptions.map((opt) => (
                  <option key={opt} value={opt} className="bg-zinc-900 text-zinc-200">
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Tank Capacity */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Tank Capacity
              </label>
              <input
                type="text"
                value={tankCapacity}
                onChange={(e) => setTankCapacity(e.target.value)}
                placeholder="e.g. 250KL, 1.2ML, 500kL"
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-600 rounded-lg px-3 py-2 text-xs font-mono text-zinc-100 placeholder:text-zinc-600 focus:outline-hidden"
              />
              <p className="text-[10px] text-zinc-500 mt-1">Appears directly in the generated folder name.</p>
            </div>

            {/* Project Location */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Project Location <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  if (errors.location) setErrors((prev) => ({ ...prev, location: '' }));
                }}
                placeholder="e.g. Sydney NSW, Brisbane QLD"
                className={`w-full bg-zinc-950 border rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-hidden ${
                  errors.location ? 'border-rose-500 ring-1 ring-rose-500' : 'border-zinc-800 focus:border-zinc-600'
                }`}
              />
              {errors.location && (
                <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {errors.location}
                </p>
              )}
            </div>

            {/* Date Received */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Date Received
              </label>
              <input
                type="date"
                value={dateReceived}
                onChange={(e) => setDateReceived(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-600 rounded-lg px-3 py-2 text-xs font-mono text-zinc-100 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Project Description */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Project Description / Customer Request Summary
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Summary of customer requirements, site restrictions, delivery deadlines..."
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-600 rounded-lg p-3 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Section 2: Contact Information */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-300 border-b border-zinc-800/80 pb-2.5">
            <User className="w-4 h-4 text-zinc-400" />
            <span>2. Customer Contact Information</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Contact Person
              </label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="e.g. John Edwards"
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-600 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Contact Email
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="e.g. j.edwards@company.com"
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-600 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Contact Phone
              </label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="e.g. +61 2 9000 0000"
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-600 rounded-lg px-3 py-2 text-xs font-mono text-zinc-100 placeholder:text-zinc-600 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Project Documents Checkboxes */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-300">
              <FileCheck className="w-4 h-4 text-zinc-400" />
              <span>3. Document Intake Checklist</span>
            </div>
            <span className="text-[11px] text-zinc-500">
              Record received customer files (do not assume files exist if unverified)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { key: 'customerEmail', label: 'Customer Email Body' },
              { key: 'tankDrawings', label: 'Tank Drawings / Civil Plans' },
              { key: 'technicalSpecs', label: 'Technical Specifications' },
              { key: 'scopeOfWork', label: 'Scope of Work Document' },
              { key: 'additionalAttachments', label: 'Additional Attachments / Photos' },
            ].map(({ key, label }) => {
              const checked = documents[key as keyof ProjectDocuments];
              return (
                <label
                  key={key}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer select-none transition-colors ${
                    checked
                      ? 'bg-zinc-900 border-zinc-700 text-zinc-100'
                      : 'bg-zinc-950/60 border-zinc-800/80 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleDocument(key as keyof ProjectDocuments)}
                    className="mt-0.5 rounded border-zinc-700 bg-zinc-900 text-zinc-100 focus:ring-0 focus:ring-offset-0"
                  />
                  <div>
                    <span className="text-xs font-medium block">{label}</span>
                    <span className="text-[10px] text-zinc-500">
                      {checked ? 'Status: Received' : 'Status: Pending receipt'}
                    </span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Live Folder Blueprint Preview */}
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <span>Live Folder Blueprint Preview</span>
          </div>
          <FolderStructureView
            projectNumber={projectNumber || '10XX'}
            companyName={companyName || 'Company Name'}
            jobType={jobType}
            tankCapacity={tankCapacity}
            location={location || 'Location'}
          />
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 bg-zinc-900 hover:bg-zinc-800 rounded-lg border border-zinc-800 transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 transition-colors shadow-sm"
          >
            <span>Review & Save Project</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </form>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        title="Confirm New Project Setup"
        message={`Are you sure you want to register project #${projectNumber} for "${companyName}"? Once created, the standard 16-point setup checklist and RFQ sheet will be initialized.`}
        confirmLabel="Confirm & Create"
        cancelLabel="Back to Edit"
        variant="primary"
        details={
          <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 font-mono text-[11px] space-y-1">
            <div className="text-zinc-400">
              <span className="text-zinc-500">Number:</span> {projectNumber}
            </div>
            <div className="text-zinc-400">
              <span className="text-zinc-500">Company:</span> {companyName}
            </div>
            <div className="text-zinc-400">
              <span className="text-zinc-500">Type / Cap:</span> {jobType} {tankCapacity}
            </div>
            <div className="text-zinc-400">
              <span className="text-zinc-500">Location:</span> {location}
            </div>
          </div>
        }
        onConfirm={handleConfirmSave}
        onCancel={() => setIsConfirmModalOpen(false)}
      />
    </div>
  );
};
