import React from 'react';
import { Menu, Plus, Search, ShieldCheck } from 'lucide-react';
import { NavTab } from './Sidebar';

interface TopBarProps {
  currentTab: NavTab;
  onOpenMobileMenu: () => void;
  onNavigateNewProject: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeProjectTitle?: string;
}

const TAB_TITLES: Record<NavTab, { title: string; subtitle: string }> = {
  overview: {
    title: 'Overview Dashboard',
    subtitle: 'Real-time project setup metrics, recent inquiries, and administrative status.',
  },
  'new-project': {
    title: 'New Project Setup',
    subtitle: 'Record client inquiries, assign verified job numbers, and generate folder blueprints.',
  },
  'all-projects': {
    title: 'Project Register',
    subtitle: 'Comprehensive searchable repository of Raven Tanks projects and setup states.',
  },
  rfq: {
    title: 'RFQ Preparation',
    subtitle: 'Format scope of work, technical inputs, and estimation handoff sheets.',
  },
  checklist: {
    title: 'Setup Checklist Manager',
    subtitle: 'Systematic 16-point admin quality verification before estimation handover.',
  },
  settings: {
    title: 'Configuration & Standards',
    subtitle: 'Folder naming formulas, job types, and master calculator template references.',
  },
};

export const TopBar: React.FC<TopBarProps> = ({
  currentTab,
  onOpenMobileMenu,
  onNavigateNewProject,
  searchQuery,
  onSearchChange,
  activeProjectTitle,
}) => {
  const currentInfo = TAB_TITLES[currentTab];

  return (
    <header className="sticky top-0 z-30 h-16 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile trigger & view title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open sidebar navigation"
          className="lg:hidden p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 rounded-lg"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold text-zinc-100 truncate tracking-tight">
              {activeProjectTitle || currentInfo.title}
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-900 text-zinc-400 border border-zinc-800">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              Isolated Prototype
            </span>
          </div>
          <p className="hidden md:block text-[11px] text-zinc-500 truncate mt-0.5">
            {currentInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Right: Search & Actions */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Search input */}
        <div className="relative hidden sm:block w-48 md:w-64">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search projects, clients..."
            className="w-full bg-zinc-900/90 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-hidden focus:border-zinc-700 transition-colors"
          />
        </div>

        {/* New Project CTA button */}
        {currentTab !== 'new-project' && (
          <button
            type="button"
            onClick={onNavigateNewProject}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>New Project</span>
          </button>
        )}
      </div>
    </header>
  );
};
