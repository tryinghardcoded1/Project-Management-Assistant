import React from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  FolderKanban,
  FileSpreadsheet,
  CheckSquare,
  Settings,
  ShieldAlert,
  HardDrive,
} from 'lucide-react';

export type NavTab = 
  | 'overview' 
  | 'new-project' 
  | 'all-projects' 
  | 'rfq' 
  | 'checklist' 
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  projectCount: number;
  inSetupCount: number;
  missingInfoCount: number;
  readyCount: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  projectCount,
  inSetupCount,
  missingInfoCount,
  readyCount,
  isOpenMobile,
  onCloseMobile,
}) => {
  const navItems: { id: NavTab; label: string; icon: React.FC<{ className?: string }>; badge?: number | string; badgeColor?: string }[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
    },
    {
      id: 'new-project',
      label: 'New Project',
      icon: PlusCircle,
    },
    {
      id: 'all-projects',
      label: 'All Projects',
      icon: FolderKanban,
      badge: projectCount,
    },
    {
      id: 'rfq',
      label: 'RFQ Preparation',
      icon: FileSpreadsheet,
      badge: inSetupCount > 0 ? inSetupCount : undefined,
    },
    {
      id: 'checklist',
      label: 'Setup Checklist',
      icon: CheckSquare,
      badge: missingInfoCount > 0 ? `${missingInfoCount} req` : undefined,
      badgeColor: 'amber',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
    },
  ];

  const handleNavClick = (tab: NavTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/80 lg:hidden backdrop-blur-xs"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-zinc-950 border-r border-zinc-800/80 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700/80 flex items-center justify-center font-black tracking-wider text-sm text-zinc-100 shadow-inner">
              RT
            </div>
            <div>
              <div className="text-xs font-bold tracking-wider text-zinc-100 uppercase">
                Raven Tanks
              </div>
              <div className="text-[10px] tracking-wide text-zinc-400 font-mono">
                Project Setup Assistant
              </div>
            </div>
          </div>
        </div>

        {/* System Notice Banner */}
        <div className="p-3 mx-3 mt-3 bg-zinc-900/60 border border-zinc-800/80 rounded-lg">
          <div className="flex items-center gap-2 text-[10px] uppercase font-semibold text-zinc-400 tracking-wider">
            <HardDrive className="w-3.5 h-3.5 text-zinc-400" />
            <span>Prototype Engine v1.0</span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1 leading-snug">
            Local application storage. Live systems isolated.
          </p>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider px-3 mb-2">
            Main Navigation
          </div>
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors group ${
                  isActive
                    ? 'bg-zinc-800 text-zinc-100 font-semibold shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-zinc-100' : 'text-zinc-500 group-hover:text-zinc-300'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 text-[10px] font-mono font-medium rounded ${
                      item.badgeColor === 'amber'
                        ? 'bg-amber-950/80 text-amber-300 border border-amber-800/50'
                        : isActive
                        ? 'bg-zinc-700 text-zinc-200'
                        : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick status summary footer */}
        <div className="p-3 border-t border-zinc-800/80 bg-zinc-950 text-xs">
          <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
            Pipeline Health
          </div>
          <div className="space-y-1.5 text-[11px] font-mono">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                Missing Info
              </span>
              <span className="text-zinc-200 font-medium">{missingInfoCount}</span>
            </div>
            <div className="flex items-center justify-between text-zinc-400">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Ready for Budget
              </span>
              <span className="text-emerald-400 font-medium">{readyCount}</span>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-zinc-800/50 flex items-center gap-2 text-[10px] text-zinc-500">
            <ShieldAlert className="w-3 h-3 text-zinc-500 shrink-0" />
            <span className="truncate">Sample data mode active</span>
          </div>
        </div>
      </aside>
    </>
  );
};
