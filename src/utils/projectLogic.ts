import { ChecklistItem, JobType, Project, ProjectDocuments, SetupStatus } from '../types/project';

export const DEFAULT_CHECKLIST_CONFIG: { order: number; label: string; description: string }[] = [
  { order: 1, label: 'Project number confirmed.', description: 'Verify against Raven project master register without inventing numbers.' },
  { order: 2, label: 'Company details verified.', description: 'Ensure legal entity name, ABN, and contact details match inquiry.' },
  { order: 3, label: 'Project folder prepared.', description: 'Generate proposed folder hierarchy according to Raven naming standards.' },
  { order: 4, label: 'Project Information folder prepared.', description: 'Set up 01 Sales / Project Information subfolder.' },
  { order: 5, label: 'Quotes folder prepared.', description: 'Set up 01 Sales / Quotes subfolder for estimation work.' },
  { order: 6, label: 'Customer email reviewed.', description: 'Check initial email body for specific requirements, dates, or constraints.' },
  { order: 7, label: 'Tank drawings received.', description: 'Confirm architectural or civil drawings have been provided.' },
  { order: 8, label: 'Technical specifications reviewed.', description: 'Review AS1170, AS2304, NFPA, or client specification sheets.' },
  { order: 9, label: 'Internal dimensions confirmed.', description: 'Verify tank diameter, height, freeboard, and nozzle schedule.' },
  { order: 10, label: 'Missing information identified.', description: 'Catalog any missing drawings, access specs, or site constraints.' },
  { order: 11, label: 'RFI required or not required.', description: 'Determine if formal Request For Information must be drafted.' },
  { order: 12, label: 'RFQ information prepared.', description: 'Compile scope of work and project details for estimating team.' },
  { order: 13, label: 'Pipedrive deal created or linked.', description: 'Prepare pipeline record or link existing inquiry deal.' },
  { order: 14, label: 'Google Drive folder linked.', description: 'Paste Google Drive URL once created in Raven cloud drive.' },
  { order: 15, label: 'Correct calculator template identified.', description: 'Identify proper Raven estimation sheet (e.g. Circular Bolt, Rectangular, Liner).' },
  { order: 16, label: 'Project ready for budget preparation.', description: 'Final admin sign-off; hand off to estimator for costing.' },
];

export function createInitialChecklist(): ChecklistItem[] {
  return DEFAULT_CHECKLIST_CONFIG.map((item) => ({
    id: `chk_${item.order}`,
    order: item.order,
    label: item.label,
    description: item.description,
    completed: false,
    notes: '',
  }));
}

/**
 * Generates folder name following Raven's standard:
 * [Project Number] [Company Name] [Job Type] [Capacity] [Location]
 * Example: 1029 Example Client New Tank 250KL Sydney
 */
export function generateFolderName(project: {
  projectNumber?: string;
  companyName?: string;
  jobType?: string;
  tankCapacity?: string;
  location?: string;
}): string {
  const num = (project.projectNumber || '').trim();
  const company = (project.companyName || '').trim();
  const job = (project.jobType || '').trim();
  const cap = (project.tankCapacity || '').trim();
  const loc = (project.location || '').trim();

  const parts = [num, company, job, cap, loc].filter(Boolean);
  if (parts.length === 0) return 'PROPOSED_PROJECT_FOLDER';

  // Sanitize characters not allowed in file system / Google Drive folder names
  return parts.join(' ').replace(/[\\/:*?"<>|]/g, '').trim();
}

/**
 * Returns formatted ASCII folder tree representation
 */
export function generateFolderTree(rootFolderName: string): string {
  const root = rootFolderName.trim() || 'Project Folder';
  return `${root}/
│
└── 01 Sales/
    │
    ├── Project Information/
    │
    └── Quotes/`;
}

/**
 * Computes setup checklist progress
 */
export function calculateSetupProgress(checklist: ChecklistItem[] = []): {
  completed: number;
  total: number;
  percentage: number;
  outstanding: ChecklistItem[];
} {
  const total = checklist.length || DEFAULT_CHECKLIST_CONFIG.length;
  const completed = checklist.filter((item) => item.completed).length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const outstanding = checklist.filter((item) => !item.completed);

  return { completed, total, percentage, outstanding };
}

/**
 * Computes SetupStatus based on checklist completion & required documents
 */
export function deriveSetupStatus(
  checklist: ChecklistItem[] = [],
  documents?: ProjectDocuments
): SetupStatus {
  const { completed, total } = calculateSetupProgress(checklist);

  const readyItem = checklist.find((item) => item.order === 16);
  if (readyItem?.completed || completed === total) {
    return 'Ready for Budgeting';
  }

  // If tank drawings or email are missing or checklist items 1-6 not done
  const hasCrucialDocs = documents
    ? documents.customerEmail && (documents.tankDrawings || documents.technicalSpecs || documents.scopeOfWork)
    : false;

  if (completed === 0) {
    return 'Pending';
  }

  if (!hasCrucialDocs || completed < 4) {
    return 'Missing Information';
  }

  return 'In Progress';
}

/**
 * Exports RFQ details to CSV format
 */
export function generateRfqCsv(project: Project): string {
  const rows: [string, string][] = [
    ['Field', 'Value'],
    ['Project Number', project.projectNumber],
    ['Company Name', project.companyName],
    ['Job Type', project.jobType],
    ['Tank Capacity', project.tankCapacity || 'N/A'],
    ['Location', project.location],
    ['Date Received', project.dateReceived],
    ['Project Description', `"${(project.description || '').replace(/"/g, '""')}"`],
    ['Scope of Work', `"${(project.rfq.scopeOfWork || project.description || '').replace(/"/g, '""')}"`],
    ['Contact Person', project.contactPerson || 'N/A'],
    ['Contact Email', project.contactEmail || 'N/A'],
    ['Contact Phone', project.contactPhone || 'N/A'],
    ['Google Drive Folder Link', project.rfq.googleDriveFolderLink || 'Not Linked (Proposed Structure Only)'],
    ['Pipedrive Deal Link', project.rfq.pipedriveDealLink || 'Not Linked'],
    ['Base Budget / Price (AUD)', `$${(project.rfq.price || 0).toFixed(2)}`],
    ['RFQ Status', project.rfq.status],
    ['Setup Status', project.setupStatus],
    ['Checklist Progress', `${calculateSetupProgress(project.checklist).percentage}%`],
    ['Generated Folder Name', generateFolderName(project)],
    ['Record Notice', project.isDemoRecord ? 'DEMONSTRATION RECORD — SAMPLE DATA' : 'CONFIRMED PROJECT RECORD'],
  ];

  return rows.map((r) => `${r[0]},${r[1]}`).join('\n');
}

/**
 * Exports all projects summary to CSV
 */
export function generateAllProjectsCsv(projects: Project[]): string {
  const headers = [
    'Project Number',
    'Company',
    'Job Type',
    'Capacity',
    'Location',
    'Date Received',
    'Setup Status',
    'RFQ Status',
    'Checklist %',
    'Contact Person',
    'Contact Email',
    'Is Demo Record',
  ];

  const rows = projects.map((p) => {
    const progress = calculateSetupProgress(p.checklist).percentage;
    return [
      `"${p.projectNumber}"`,
      `"${p.companyName.replace(/"/g, '""')}"`,
      `"${p.jobType}"`,
      `"${p.tankCapacity}"`,
      `"${p.location.replace(/"/g, '""')}"`,
      `"${p.dateReceived}"`,
      `"${p.setupStatus}"`,
      `"${p.rfq.status}"`,
      `"${progress}%"`,
      `"${p.contactPerson.replace(/"/g, '""')}"`,
      `"${p.contactEmail.replace(/"/g, '""')}"`,
      `"${p.isDemoRecord ? 'YES (DEMO)' : 'NO'}"`,
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Generates formatted plain text for RFQ copy to clipboard
 */
export function formatRfqPlainText(project: Project): string {
  const folder = generateFolderName(project);
  return `=====================================================
RAVEN TANKS — RFQ & ESTIMATION PREPARATION SHEET
=====================================================
Project Number  : ${project.projectNumber}
Company Name    : ${project.companyName}
Job Type        : ${project.jobType}
Tank Capacity   : ${project.tankCapacity || 'Not specified'}
Location        : ${project.location}
Date Received   : ${project.dateReceived}
RFQ Status      : ${project.rfq.status}
Setup Status    : ${project.setupStatus}

CONTACT DETAILS
-----------------------------------------------------
Contact Person  : ${project.contactPerson || 'N/A'}
Contact Email   : ${project.contactEmail || 'N/A'}
Contact Phone   : ${project.contactPhone || 'N/A'}

SCOPE OF WORK & PROJECT DESCRIPTION
-----------------------------------------------------
${project.rfq.scopeOfWork || project.description || 'No detailed scope recorded.'}

DOCUMENTS STATUS
-----------------------------------------------------
- Customer Email Received    : ${project.documents.customerEmail ? '[YES]' : '[NO]'}
- Tank Drawings Received     : ${project.documents.tankDrawings ? '[YES]' : '[NO]'}
- Technical Specs Received   : ${project.documents.technicalSpecs ? '[YES]' : '[NO]'}
- Scope of Work Document     : ${project.documents.scopeOfWork ? '[YES]' : '[NO]'}
- Additional Attachments     : ${project.documents.additionalAttachments ? '[YES]' : '[NO]'}

SYSTEM LINKS & REFERENCES
-----------------------------------------------------
Proposed Folder Name : ${folder}
Google Drive Link    : ${project.rfq.googleDriveFolderLink || 'None (Proposed folder structure only)'}
Pipedrive Deal Link  : ${project.rfq.pipedriveDealLink || 'None'}
Initial Price / Budget: $${(project.rfq.price || 0).toLocaleString()} AUD

* NOTICE: Generated via Raven Project Setup Assistant.
* Do not alter original engineering formulas or issue unapproved quotations.
=====================================================`;
}
