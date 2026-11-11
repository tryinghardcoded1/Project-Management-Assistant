import React, { useState, useEffect } from 'react';
import { Project } from './types/project';
import { getProjects, subscribeToProjects } from './services/storageService';
import { Sidebar, NavTab } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { ToastContainer, ToastMessage } from './components/Toast';
import { OverviewDashboard } from './views/OverviewDashboard';
import { NewProjectModule } from './views/NewProjectModule';
import { AllProjectsView } from './views/AllProjectsView';
import { RfqPreparationView } from './views/RfqPreparationView';
import { SetupChecklistGlobalView } from './views/SetupChecklistGlobalView';
import { ProjectDetailView, DetailTab } from './views/ProjectDetailView';
import { SettingsView } from './views/SettingsView';

export default function App() {
  const [projects, setProjects] = useState<Project[]>(() => getProjects());
  const [currentTab, setCurrentTab] = useState<NavTab>('overview');
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<DetailTab>('overview');
  const [globalSearch, setGlobalSearch] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Subscribe to storage changes
  useEffect(() => {
    const unsubscribe = subscribeToProjects(() => {
      setProjects([...getProjects()]);
    });
    return unsubscribe;
  }, []);

  const showToast = (type: 'success' | 'warning' | 'info', title: string, description?: string) => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, title, description }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleOpenProject = (projectId: string, tab: DetailTab = 'overview') => {
    setActiveProjectId(projectId);
    setActiveDetailTab(tab);
  };

  const handleProjectCreated = (newProject: Project) => {
    setActiveProjectId(newProject.id);
    setActiveDetailTab('overview');
  };

  // Pipeline metrics for sidebar
  const inSetupCount = projects.filter(
    (p) => p.setupStatus === 'In Progress' || p.setupStatus === 'Pending'
  ).length;
  const missingInfoCount = projects.filter(
    (p) => p.setupStatus === 'Missing Information'
  ).length;
  const readyCount = projects.filter(
    (p) => p.setupStatus === 'Ready for Budgeting'
  ).length;

  const activeProject = activeProjectId
    ? projects.find((p) => p.id === activeProjectId)
    : null;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex font-sans antialiased selection:bg-zinc-800 selection:text-zinc-100">
      {/* Sidebar navigation */}
      <Sidebar
        currentTab={activeProjectId ? 'all-projects' : currentTab}
        onSelectTab={(tab) => {
          setActiveProjectId(null);
          setCurrentTab(tab);
        }}
        projectCount={projects.length}
        inSetupCount={inSetupCount}
        missingInfoCount={missingInfoCount}
        readyCount={readyCount}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <TopBar
          currentTab={currentTab}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          onNavigateNewProject={() => {
            setActiveProjectId(null);
            setCurrentTab('new-project');
          }}
          searchQuery={globalSearch}
          onSearchChange={(q) => {
            setGlobalSearch(q);
            if (q.trim() && currentTab !== 'all-projects' && !activeProjectId) {
              setCurrentTab('all-projects');
            }
          }}
          activeProjectTitle={
            activeProject
              ? `#${activeProject.projectNumber} — ${activeProject.companyName}`
              : undefined
          }
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {activeProject ? (
            <ProjectDetailView
              project={activeProject}
              initialTab={activeDetailTab}
              onBack={() => setActiveProjectId(null)}
              onShowToast={showToast}
            />
          ) : currentTab === 'overview' ? (
            <OverviewDashboard
              projects={projects}
              onOpenProject={(id) => handleOpenProject(id, 'overview')}
              onNavigateNewProject={() => setCurrentTab('new-project')}
              onNavigateChecklist={(id) => {
                if (id) {
                  handleOpenProject(id, 'checklist');
                } else {
                  setCurrentTab('checklist');
                }
              }}
              onNavigateRfq={(id) => {
                if (id) {
                  handleOpenProject(id, 'rfq');
                } else {
                  setCurrentTab('rfq');
                }
              }}
            />
          ) : currentTab === 'new-project' ? (
            <NewProjectModule
              onProjectCreated={handleProjectCreated}
              onCancel={() => setCurrentTab('overview')}
              onShowToast={showToast}
            />
          ) : currentTab === 'all-projects' ? (
            <AllProjectsView
              projects={projects}
              onOpenProject={(id, initialTab) => handleOpenProject(id, initialTab || 'overview')}
              onNavigateNewProject={() => setCurrentTab('new-project')}
              onShowToast={showToast}
            />
          ) : currentTab === 'rfq' ? (
            <RfqPreparationView
              projects={projects}
              selectedProjectId={projects[0]?.id}
              onSelectProject={(id) => {}}
              onOpenProjectDetail={(id) => handleOpenProject(id, 'rfq')}
              onShowToast={showToast}
            />
          ) : currentTab === 'checklist' ? (
            <SetupChecklistGlobalView
              projects={projects}
              selectedProjectId={projects[0]?.id}
              onSelectProject={(id) => {}}
              onOpenProjectDetail={(id) => handleOpenProject(id, 'checklist')}
              onShowToast={showToast}
            />
          ) : currentTab === 'settings' ? (
            <SettingsView projects={projects} onShowToast={showToast} />
          ) : null}
        </main>
      </div>

      {/* Global Notifications */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
}
