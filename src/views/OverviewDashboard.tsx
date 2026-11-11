import React, { useState } from 'react';
import { Project, SetupStatus } from '../types/project';
import { calculateSetupProgress } from '../utils/projectLogic';
import {
  FolderKanban,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Plus,
  ArrowRight,
  ExternalLink,
  Search,
  Filter,
} from 'lucide-react';

interface OverviewDashboardProps {
  projects: Project[];
  onOpenProject: (projectId: string) => void;
  onNavigateNewProject: () => void;
  onNavigateChecklist: (projectId?: string) => void;
  onNavigateRfq: (projectId?: string) => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  projects,
  onOpenProject,
  onNavigateNewProject,
  onNavigateChecklist,
  onNavigateRfq,
}) => {
  const [filter, setFilter] = useState<string>('All');
  const [tableSearch, setTableSearch] = useState<string>('');

  // Dynamic statistics calculated directly from actual records
  const totalProjects = projects.length;
  const inSetupProjects = projects.filter(
    (p) => p.setupStatus === 'In Progress' || p.setupStatus === 'Pending'
  ).length;
  const missingInfoProjects = projects.filter(
    (p) => p.setupStatus === 'Missing Information'
  ).length;
  const readyProjects = projects.filter(
    (p) => p.setupStatus === 'Ready for Budgeting'
  ).length;

  // Filter options as specified
  const filterOptions = [
    'All',
    'New Tank',
    'Refurb',
    'Inspection',
    'Liner Cleaning',
    'Pending',
    'In Progress',
    'Ready for Budgeting',
  ];

  const filteredProjects = projects.filter((p) => {
    // Check search term
    const term = tableSearch.toLowerCase().trim();
    const matchesSearch =
      !term ||
      p.projectNumber.toLowerCase().includes(term) ||
      p.companyName.toLowerCase().includes(term) ||
      p.location.toLowerCase().includes(term);

    if (!matchesSearch) return false;

    // Check filter selection
    if (filter === 'All') return true;
    if (filter === 'New Tank') return p.jobType === 'New Tank';
    if (filter === 'Refurb') return p.jobType === 'Refurb';
    if (filter === 'Inspection') return p.jobType.includes('Inspection');
    if (filter === 'Liner Cleaning') return p.jobType.includes('Liner Cleaning');
    if (filter === 'Pending') return p.setupStatus === 'Pending';
    if (filter === 'In Progress') return p.setupStatus === 'In Progress';
    if (filter === 'Ready for Budgeting') return p.setupStatus === 'Ready for Budgeting';

    return true;
  });

  const getStatusBadge = (status: SetupStatus) => {
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
            Pending Setup
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Demonstration Banner */}
      <div className="p-3.5 bg-zinc-900/70 border border-zinc-800 rounded-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-xs text-zinc-300 font-medium">
            Demo Environment — All sample records are clearly flagged and stored safely in local browser storage.
          </span>
        </div>
        <div className="text-[11px] font-mono text-zinc-500">
          Source of Truth: Local App State
        </div>
      </div>

      {/* Top 4 KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Projects */}
        <div className="p-4 bg-zinc-900/80 border border-zinc-800/90 rounded-xl relative overflow-hidden group hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
            <span>Total Projects</span>
            <FolderKanban className="w-4 h-4 text-zinc-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-zinc-100">
            {totalProjects}
          </div>
          <div className="mt-1 text-[11px] text-zinc-500">
            Active in local database
          </div>
        </div>

        {/* Projects in Setup */}
        <div className="p-4 bg-zinc-900/80 border border-zinc-800/90 rounded-xl relative overflow-hidden group hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
            <span>Projects in Setup</span>
            <Clock className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-zinc-100">
            {inSetupProjects}
          </div>
          <div className="mt-1 text-[11px] text-zinc-500">
            Checklist / folder in draft
          </div>
        </div>

        {/* Missing Information */}
        <div className="p-4 bg-zinc-900/80 border border-zinc-800/90 rounded-xl relative overflow-hidden group hover:border-amber-900/60 transition-colors">
          <div className="flex items-center justify-between text-amber-300 text-xs font-medium">
            <span>Missing Information</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-amber-400">
            {missingInfoProjects}
          </div>
          <div className="mt-1 text-[11px] text-amber-500/80">
            Awaiting drawings or client specs
          </div>
        </div>

        {/* Ready for Budgeting */}
        <div className="p-4 bg-zinc-900/80 border border-zinc-800/90 rounded-xl relative overflow-hidden group hover:border-emerald-900/60 transition-colors">
          <div className="flex items-center justify-between text-emerald-400 text-xs font-medium">
            <span>Ready for Budgeting</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-400">
            {readyProjects}
          </div>
          <div className="mt-1 text-[11px] text-emerald-500/80">
            Handoff ready for estimator
          </div>
        </div>
      </div>

      {/* Quick Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-xl">
        <div>
          <h2 className="text-sm font-semibold text-zinc-100">Quick Actions</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Accelerate Raven project administration workflows
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onNavigateNewProject}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-zinc-100 hover:bg-white text-zinc-900 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>New Project Inquiry</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigateRfq()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/80 transition-colors"
          >
            <span>RFQ Preparation</span>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
          </button>
        </div>
      </div>

      {/* Recent Projects Section */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl overflow-hidden shadow-xs">
        {/* Table Header & Filter Bar */}
        <div className="p-4 border-b border-zinc-800 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">
                Recently Created Projects
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Overview of current tank inquiries and administration pipelines.
              </p>
            </div>
            {/* Inline search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                placeholder="Filter recent list..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-hidden focus:border-zinc-700"
              />
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] text-zinc-500 flex items-center gap-1 pr-1 font-medium">
              <Filter className="w-3 h-3" /> Filters:
            </span>
            {filterOptions.map((opt) => {
              const isActive = filter === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setFilter(opt)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-zinc-100 text-zinc-950 font-semibold'
                      : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 border border-zinc-800/80'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-zinc-950/80 border-b border-zinc-800 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                <th className="px-4 py-3">Project No.</th>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Job Type</th>
                <th className="px-4 py-3">Capacity</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Date Created</th>
                <th className="px-4 py-3">Setup Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-zinc-500 text-xs">
                    No projects matching filter criteria.
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
                      <td className="px-4 py-3.5 font-mono font-medium text-zinc-200 whitespace-nowrap">
                        <span className="bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                          {project.projectNumber}
                        </span>
                        {project.isDemoRecord && (
                          <span className="ml-1.5 text-[9px] px-1 py-0.2 rounded bg-zinc-800 text-zinc-400 font-sans">
                            DEMO
                          </span>
                        )}
                      </td>

                      {/* Company */}
                      <td className="px-4 py-3.5 font-medium text-zinc-100 max-w-xs truncate">
                        {project.companyName}
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

                      {/* Date Created */}
                      <td className="px-4 py-3.5 font-mono text-zinc-500 whitespace-nowrap">
                        {project.dateReceived}
                      </td>

                      {/* Setup Status */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          {getStatusBadge(project.setupStatus)}
                          <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono">
                            <span>Checklist: {progress.completed}/{progress.total}</span>
                            <span>({progress.percentage}%)</span>
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onOpenProject(project.id)}
                            className="px-2.5 py-1 text-xs font-medium text-zinc-200 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-md border border-zinc-700/70 transition-colors inline-flex items-center gap-1"
                          >
                            <span>Details</span>
                            <ExternalLink className="w-3 h-3 text-zinc-400" />
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
    </div>
  );
};
