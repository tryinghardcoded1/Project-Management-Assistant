import { AppSettings, Project } from '../types/project';
import { deriveSetupStatus, calculateSetupProgress, createInitialChecklist } from '../utils/projectLogic';
import { DEFAULT_SETTINGS, SAMPLE_PROJECTS } from '../utils/sampleData';

const STORAGE_KEYS = {
  PROJECTS: 'raven_projects_v1',
  SETTINGS: 'raven_settings_v1',
};

type Listener = () => void;
const listeners = new Set<Listener>();

function notifyChange() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.error('Error notifying storage listener:', e);
    }
  });
}

export function subscribeToProjects(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getProjects(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (!raw) {
      // Seed with sample data on first run
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(SAMPLE_PROJECTS));
      return SAMPLE_PROJECTS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return SAMPLE_PROJECTS;
    }
    return parsed;
  } catch (err) {
    console.error('Error loading projects from localStorage:', err);
    return SAMPLE_PROJECTS;
  }
}

export function getProjectById(id: string): Project | undefined {
  const projects = getProjects();
  return projects.find((p) => p.id === id);
}

export function isProjectNumberUnique(projectNumber: string, excludeId?: string): boolean {
  const projects = getProjects();
  const cleanNumber = projectNumber.trim().toLowerCase();
  return !projects.some((p) => p.projectNumber.trim().toLowerCase() === cleanNumber && p.id !== excludeId);
}

export function saveProject(
  projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'setupStatus'> & { id?: string; setupStatus?: Project['setupStatus'] }
): { success: boolean; error?: string; project?: Project } {
  const projects = getProjects();

  const cleanNumber = (projectData.projectNumber || '').trim();
  const cleanCompany = (projectData.companyName || '').trim();
  const cleanLocation = (projectData.location || '').trim();

  if (!cleanNumber) {
    return { success: false, error: 'Project Number is required.' };
  }
  if (!cleanCompany) {
    return { success: false, error: 'Company Name is required.' };
  }
  if (!projectData.jobType) {
    return { success: false, error: 'Job Type is required.' };
  }
  if (!cleanLocation) {
    return { success: false, error: 'Project Location is required.' };
  }

  // Duplicate check
  if (!isProjectNumberUnique(cleanNumber, projectData.id)) {
    return { success: false, error: `Project Number "${cleanNumber}" already exists in the system. Project numbers must be unique.` };
  }

  const now = new Date().toISOString();
  const checklist = projectData.checklist && projectData.checklist.length > 0 ? projectData.checklist : createInitialChecklist();
  const status = deriveSetupStatus(checklist, projectData.documents);

  if (projectData.id) {
    // Updating existing project
    const existingIndex = projects.findIndex((p) => p.id === projectData.id);
    if (existingIndex === -1) {
      return { success: false, error: 'Project not found to update.' };
    }
    const updated: Project = {
      ...projects[existingIndex],
      ...projectData,
      id: projectData.id,
      projectNumber: cleanNumber,
      companyName: cleanCompany,
      location: cleanLocation,
      checklist,
      setupStatus: status,
      updatedAt: now,
    };
    projects[existingIndex] = updated;
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    notifyChange();
    return { success: true, project: updated };
  } else {
    // Creating new project
    const newProject: Project = {
      ...projectData,
      id: `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      projectNumber: cleanNumber,
      companyName: cleanCompany,
      location: cleanLocation,
      checklist,
      setupStatus: status,
      createdAt: now,
      updatedAt: now,
    };
    projects.unshift(newProject);
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    notifyChange();
    return { success: true, project: newProject };
  }
}

export function updateProject(id: string, updates: Partial<Project>): Project | undefined {
  const projects = getProjects();
  const index = projects.findIndex((p) => p.id === id);
  if (index === -1) return undefined;

  const current = projects[index];
  const updatedChecklist = updates.checklist ?? current.checklist;
  const updatedDocs = updates.documents ?? current.documents;
  const computedStatus = deriveSetupStatus(updatedChecklist, updatedDocs);

  const updated: Project = {
    ...current,
    ...updates,
    checklist: updatedChecklist,
    documents: updatedDocs,
    setupStatus: updates.setupStatus ?? computedStatus,
    updatedAt: new Date().toISOString(),
  };

  projects[index] = updated;
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  notifyChange();
  return updated;
}

export function updateChecklistItem(
  projectId: string,
  itemId: string,
  completed: boolean,
  notes?: string
): Project | undefined {
  const project = getProjectById(projectId);
  if (!project) return undefined;

  const updatedChecklist = project.checklist.map((item) => {
    if (item.id === itemId) {
      return {
        ...item,
        completed,
        notes: notes !== undefined ? notes : item.notes,
        updatedAt: new Date().toISOString(),
      };
    }
    return item;
  });

  return updateProject(projectId, { checklist: updatedChecklist });
}

export function updateRfq(
  projectId: string,
  rfqData: Partial<Project['rfq']>
): Project | undefined {
  const project = getProjectById(projectId);
  if (!project) return undefined;

  return updateProject(projectId, {
    rfq: {
      ...project.rfq,
      ...rfqData,
    },
  });
}

export function deleteProject(id: string): boolean {
  const projects = getProjects();
  const filtered = projects.filter((p) => p.id !== id);
  if (filtered.length === projects.length) return false;

  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(filtered));
  notifyChange();
  return true;
}

export function resetToDemoData(): void {
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(SAMPLE_PROJECTS));
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
  notifyChange();
}

export function getSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (err) {
    console.error('Error loading settings:', err);
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  notifyChange();
}
