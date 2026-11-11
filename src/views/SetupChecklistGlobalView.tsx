import React, { useState } from 'react';
import { Project } from '../types/project';
import { calculateSetupProgress } from '../utils/projectLogic';
import { updateChecklistItem } from '../services/storageService';
import {
  CheckSquare,
  Check,
  AlertCircle,
  ExternalLink,
  Filter,
  FileCheck2,
  Calendar,
} from 'lucide-react';

interface SetupChecklistGlobalViewProps {
  projects: Project[];
  selectedProjectId?: string;
  onSelectProject: (projectId: string) => void;
  onOpenProjectDetail: (projectId: string) => void;
  onShowToast: (type: 'success' | 'warning' | 'info', title: string, description?: string) => void;
}

export const SetupChecklistGlobalView: React.FC<SetupChecklistGlobalViewProps> = ({
  projects,
  selectedProjectId,
  onSelectProject,
  onOpenProjectDetail,
  onShowToast,
}) => {
  const currentProject =
    projects.find((p) => p.id === selectedProjectId) || projects[0];

  const [filterMode, setFilterMode] = useState<'all' | 'outstanding' | 'completed'>('all');
  const [activeNoteItemId, setActiveNoteItemId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState('');

  if (!currentProject) {
    return (
      <div className="p-12 text-center text-zinc-500 bg-zinc-900 border border-zinc-800 rounded-xl">
        No projects available. Create a new project inquiry first.
      </div>
    );
  }

  const progress = calculateSetupProgress(currentProject.checklist);

  const filteredItems = currentProject.checklist.filter((item) => {
    if (filterMode === 'outstanding') return !item.completed;
    if (filterMode === 'completed') return item.completed;
    return true;
  });

  const handleToggle = (itemId: string, currentCompleted: boolean) => {
    updateChecklistItem(currentProject.id, itemId, !currentCompleted);
    onShowToast(
      !currentCompleted ? 'success' : 'info',
      !currentCompleted ? 'Task Verified' : 'Task Reopened',
      `Checklist progress updated (${progress.completed + (!currentCompleted ? 1 : -1)}/${progress.total})`
    );
  };

  const handleSaveNote = (itemId: string) => {
    const item = currentProject.checklist.find((i) => i.id === itemId);
    if (!item) return;
    updateChecklistItem(currentProject.id, itemId, item.completed, noteDraft);
    setActiveNoteItemId(null);
    onShowToast('success', 'Note Updated', 'Saved checklist item notes.');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Top Project Selector Card */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider whitespace-nowrap">
            Active Project:
          </label>
          <select
            value={currentProject.id}
            onChange={(e) => onSelectProject(e.target.value)}
            className="bg-zinc-950 border border-zinc-700 text-zinc-100 text-xs font-medium rounded-lg px-3 py-1.5 focus:outline-hidden"
          >
            {projects.map((p) => {
              const pProg = calculateSetupProgress(p.checklist);
              return (
                <option key={p.id} value={p.id} className="bg-zinc-900">
                  #{p.projectNumber} — {p.companyName} ({pProg.percentage}%)
                </option>
              );
            })}
          </select>

          <button
            type="button"
            onClick={() => onOpenProjectDetail(currentProject.id)}
            className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1 hover:underline ml-2"
          >
            <span>Project Details</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              filterMode === 'all'
                ? 'bg-zinc-100 text-zinc-950 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200 bg-zinc-950 border border-zinc-800'
            }`}
          >
            All 16 Steps
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('outstanding')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              filterMode === 'outstanding'
                ? 'bg-amber-400 text-zinc-950 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200 bg-zinc-950 border border-zinc-800'
            }`}
          >
            Outstanding ({progress.outstanding.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('completed')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              filterMode === 'completed'
                ? 'bg-emerald-400 text-zinc-950 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200 bg-zinc-950 border border-zinc-800'
            }`}
          >
            Completed ({progress.completed})
          </button>
        </div>
      </div>

      {/* Progress & Readiness Banner */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-200">
              #{currentProject.projectNumber}
            </span>
            <span className="font-semibold text-sm text-zinc-100">
              {currentProject.companyName}
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            {currentProject.jobType} • {currentProject.location} • Status: {currentProject.setupStatus}
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-xs text-zinc-400">Checklist Completion</div>
            <div className={`text-2xl font-bold font-mono ${progress.percentage === 100 ? 'text-emerald-400' : 'text-zinc-100'}`}>
              {progress.percentage}%
            </div>
            <div className="text-[10px] text-zinc-500 font-mono">
              {progress.completed} of {progress.total} verified
            </div>
          </div>
        </div>
      </div>

      {/* Checklist Task Rows */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl divide-y divide-zinc-800/80 overflow-hidden shadow-xs">
        {filteredItems.map((item) => {
          const isNoteOpen = activeNoteItemId === item.id;
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
                    onClick={() => handleToggle(item.id, item.completed)}
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
                      <p className="text-[11px] text-zinc-400 leading-relaxed max-w-2xl">
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
                        setActiveNoteItemId(null);
                      } else {
                        setActiveNoteItemId(item.id);
                        setNoteDraft(item.notes || '');
                      }
                    }}
                    className="text-xs text-zinc-400 hover:text-zinc-200 px-2 py-1 rounded hover:bg-zinc-800 transition-colors"
                  >
                    {item.notes ? 'Edit Note' : '+ Note'}
                  </button>
                </div>
              </div>

              {/* Note Editing Section */}
              {isNoteOpen && (
                <div className="mt-3 pl-8 pr-2 pt-2 border-t border-zinc-800/60 flex items-center gap-2">
                  <input
                    type="text"
                    value={noteDraft}
                    onChange={(e) => setNoteDraft(e.target.value)}
                    placeholder="Add verification notes or reason for pending status..."
                    className="flex-1 bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => handleSaveNote(item.id)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 shadow-xs"
                  >
                    Save Note
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveNoteItemId(null)}
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
  );
};
