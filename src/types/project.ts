export type JobType = 
  | 'New Tank' 
  | 'Refurb' 
  | 'Inspection (INS)' 
  | 'Liner Cleaning (PLN)' 
  | 'Other';

export type SetupStatus = 
  | 'Pending' 
  | 'In Progress' 
  | 'Missing Information' 
  | 'Ready for Budgeting';

export type RfqStatus = 
  | 'Pending' 
  | 'In Review' 
  | 'Ready for Estimator' 
  | 'Completed';

export interface ProjectDocuments {
  customerEmail: boolean;
  tankDrawings: boolean;
  technicalSpecs: boolean;
  scopeOfWork: boolean;
  additionalAttachments: boolean;
}

export interface ChecklistItem {
  id: string;
  order: number;
  label: string;
  description?: string;
  completed: boolean;
  notes?: string;
  updatedAt?: string;
}

export interface RfqData {
  scopeOfWork: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  googleDriveFolderLink: string;
  pipedriveDealLink: string;
  price: number; // default 0
  status: RfqStatus;
  notes?: string;
}

export interface Project {
  id: string;
  projectNumber: string;
  companyName: string;
  jobType: JobType;
  tankCapacity: string;
  location: string;
  description: string;
  dateReceived: string; // YYYY-MM-DD
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  documents: ProjectDocuments;
  checklist: ChecklistItem[];
  rfq: RfqData;
  internalNotes: string;
  isDemoRecord: boolean;
  createdAt: string;
  updatedAt: string;
  setupStatus: SetupStatus;
}

export interface AppSettings {
  companyName: string;
  defaultFolderStructure: string[];
  jobTypes: string[];
  namingFormat: string;
  calculatorTemplates: {
    id: string;
    name: string;
    type: string;
    referenceCode: string;
    notes: string;
  }[];
  rfqStatuses: string[];
}
