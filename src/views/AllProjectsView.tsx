import React, { useState } from 'react';
import { JobType, Project, SetupStatus } from '../types/project';
import { calculateSetupProgress, generateAllProjectsCsv } from '../utils/projectLogic';
import { deleteProject } from '../services/storageService';
import { ConfirmationModal } from '../components/ConfirmationModal';
import {
  Search,
  Filter,
  Download,
  Trash2,
  Edit3,
  CheckSquare,
  FileSpreadsheet,
  ExternalLink,
  ArrowUpDown,
  FolderPlus,
} from 'lucide-react';

interface AllProjectsViewProps {
  projects: Project[];
  onOpenProject: (projectId: string, initialTab?: 'overview' | 'documents' | 'rfq' | 'checklist' | 'notes') => void;
  onNavigateNewProject: () => void;
  onShowToast: (type: 'success' | 'warning' | 'info', title: string, description?: string) => void;
}

export const AllProjectsView: React.FC<AllProjectsViewProps> = ({
  projects,
  onOpenProject,
  onNavigateNewProject,
  onShowToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Deletion modal state
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  const jobTypeOptions = ['All', 'New Tank', 'Refurb', 'Inspection (INS)', 'Liner Cleaning (PLN)', 'Other'];
  const statusOptions = ['All', 'Pending', 'In Progress', 'Missing Information', 'Ready for Budgeting'];

  const filteredProjects = projects
    .filter((p) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.projectNumber.toLowerCase().includes(q) ||
        p.companyName.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        (p.contactPerson && p.contactPerson.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (jobTypeFilter !== 'All' && p.jobType !== jobTypeFilter) return false;
      if (statusFilter !== 'All' && p.setupStatus !== statusFilter) return false;

      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.dateReceived).getTime();
      const dateB = new Date(b.dateReceived).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

  const handleDeleteConfirm = () => {
    if (!projectToDelete) return;
    const ok = deleteProject(projectToDelete.id);
    if (ok) {
      onShowToast('success', 'Project Removed', `Project ${projectToDelete.projectNumber} was deleted from storage.`);
    } else {
      onShowToast('warning', 'Deletion failed', 'Project could not be found.');
    }
    setProjectToDelete(null);
  };

  const handleExportCsv = () => {
    if (projects.length === 0) {
      onShowToast('warning', 'No Projects', 'Project register is currently empty.');
      return;
    }
    const csvContent = generateAllProjectsCsv(projects);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Raven_Tanks_Project_Register_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast('success', 'Export Complete', 'Exported all project records to CSV.');
  };

  const renderStatusBadge = (status: SetupStatus) => {
    switch (status) {
      case 'Ready for Budgeting':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-950/70 text-emerald-400 border border-emerald-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Ready for Budgeting
          </span>
        );
      case 'Missing Information':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-950/70 text-amber-400 border border-amber-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Missing Information
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            In Progress
          </span>
        );
      case 'Pending':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-900 text-zinc-400 border border-zinc-800">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
            Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-zinc-800">
        <div>
          <h2 className="text-base font-semibold text-zinc-100">
            Raven Project Register
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Manage projects, check estimation readiness, and track RFQ requirements.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-zinc-100 bg-zinc-900 hover:bg-zinc-800 rounded-lg border border-zinc-800 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={onNavigateNewProject}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 transition-colors shadow-xs"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* Filter / Search Bar Container */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search by Number, Company, Location */}
          <div className="md:col-span-2 relative">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by project number, company, location, contact..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-hidden focus:border-zinc-700"
            />
          </div>

          {/* Job Type Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-zinc-500 font-medium whitespace-nowrap">Type:</span>
            <select
              value={jobTypeFilter}
              onChange={(e) => setJobTypeFilter(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-2 text-xs text-zinc-200 focus:outline-hidden focus:border-zinc-700"
            >
              {jobTypeOptions.map((opt) => (
                <option key={opt} value={opt} className="bg-zinc-900 text-zinc-200">
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Setup Status Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-zinc-500 font-medium whitespace-nowrap">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-2 text-xs text-zinc-200 focus:outline-hidden focus:border-zinc-700"
            >
              {statusOptions.map((opt) => (
                <option key={opt} value={opt} className="bg-zinc-900 text-zinc-200">
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sort & Count footer inside filter box */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60 text-xs text-zinc-400">
          <div>
            Showing <span className="text-zinc-100 font-semibold">{filteredProjects.length}</span> of {projects.length} registered projects
          </div>
          <button
            type="button"
            onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
            className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-200 text-xs py-1 px-2 rounded hover:bg-zinc-800/60 transition-colors"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Sort by Date ({sortOrder === 'desc' ? 'Newest First' : 'Oldest First'})</span>
          </button>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-zinc-950/80 border-b border-zinc-800 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                <th className="px-4 py-3">Project No.</th>
                <th className="px-4 py-3">Company Name</th>
                <th className="px-4 py-3">Job Type</th>
                <th className="px-4 py-3">Capacity</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Date Received</th>
                <th className="px-4 py-3">Checklist</th>
                <th className="px-4 py-3">Setup Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-16 text-center text-zinc-500 text-xs">
                    No projects found matching the current search and filter settings.
                  </td>
                </tr>
              ) : (
                filteredProjects.map((project) => {
                  const progress = calculateSetupProgress(project.checklist);
                  return (
                    <tr
                      key={project.id}
                      className="hover:bg-zinc-800/40 transition-colors group"
                    >
                      {/* Project Number */}
                      <td className="px-4 py-3.5 font-mono font-medium text-zinc-100 whitespace-nowrap">
                        <span className="bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                          {project.projectNumber}
                        </span>
                        {project.isDemoRecord && (
                          <span className="ml-1.5 text-[9px] px-1 py-0.2 rounded bg-zinc-800 text-zinc-400 font-sans">
                            DEMO
                          </span>
                        )}
                      </td>

                      {/* Company Name */}
                      <td className="px-4 py-3.5 font-medium text-zinc-100 max-w-xs truncate">
                        {project.companyName}
                        {project.contactPerson && (
                          <div className="text-[10px] text-zinc-500 font-normal truncate">
                            Contact: {project.contactPerson}
                          </div>
                        )}
                      </td>

                      {/* Job Type */}
                      <td className="px-4 py-3.5 text-zinc-300 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[11px] bg-zinc-950 border border-zinc-800">
                          {project.jobType}
                        </span>
                      </td>

                      {/* Capacity */}
                      <td className="px-4 py-3.5 font-mono text-zinc-300 whitespace-nowrap">
                        {project.tankCapacity || '—'}
                      </td>

                      {/* Location */}
                      <td className="px-4 py-3.5 text-zinc-400 whitespace-nowrap">
                        {project.location}
                      </td>

                      {/* Date Received */}
                      <td className="px-4 py-3.5 font-mono text-zinc-500 whitespace-nowrap">
                        {project.dateReceived}
                      </td>

                      {/* Checklist Progress Bar */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="w-28 space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                            <span>{progress.completed}/{progress.total}</span>
                            <span className={progress.percentage === 100 ? 'text-emerald-400 font-semibold' : ''}>
                              {progress.percentage}%
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                            <div
                              className={`h-full transition-all duration-300 ${
                                progress.percentage === 100 ? 'bg-emerald-400' : 'bg-zinc-400'
                              }`}
                              style={{ width: `${progress.percentage}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Setup Status */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {renderStatusBadge(project.setupStatus)}
                      </td>

                      {/* Action buttons */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => onOpenProject(project.id, 'overview')}
                            title="Open project details"
                            className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onOpenProject(project.id, 'checklist')}
                            title="Open setup checklist"
                            className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded transition-colors"
                          >
                            <CheckSquare className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onOpenProject(project.id, 'rfq')}
                            title="Open RFQ sheet"
                            className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded transition-colors"
                          >
                            <FileSpreadsheet className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setProjectToDelete(project)}
                            title="Delete project"
                            className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(projectToDelete)}
        title="Delete Project Record"
        message={`Are you sure you want to delete Project #${projectToDelete?.projectNumber} (${projectToDelete?.companyName})? This action will remove the record, folder blueprint, and checklist from local storage.`}
        confirmLabel="Yes, Delete Project"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setProjectToDelete(null)}
      />
    </div>
  );
};
