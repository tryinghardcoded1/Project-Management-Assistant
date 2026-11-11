import React, { useState } from 'react';
import { Copy, Check, Download, Folder, FolderGit2, AlertCircle } from 'lucide-react';
import { generateFolderName, generateFolderTree } from '../utils/projectLogic';

interface FolderStructureViewProps {
  projectNumber: string;
  companyName: string;
  jobType: string;
  tankCapacity?: string;
  location: string;
  compact?: boolean;
}

export const FolderStructureView: React.FC<FolderStructureViewProps> = ({
  projectNumber,
  companyName,
  jobType,
  tankCapacity,
  location,
  compact = false,
}) => {
  const [copiedName, setCopiedName] = useState(false);
  const [copiedStructure, setCopiedStructure] = useState(false);

  const folderName = generateFolderName({
    projectNumber,
    companyName,
    jobType,
    tankCapacity,
    location,
  });

  const folderTree = generateFolderTree(folderName);

  const handleCopyName = async () => {
    try {
      await navigator.clipboard.writeText(folderName);
      setCopiedName(true);
      setTimeout(() => setCopiedName(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleCopyStructure = async () => {
    try {
      await navigator.clipboard.writeText(folderTree);
      setCopiedStructure(true);
      setTimeout(() => setCopiedStructure(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleDownloadTxt = () => {
    const element = document.createElement('a');
    const file = new Blob([folderTree], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${folderName || 'Raven-Project-Folder-Structure'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden text-zinc-200">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-zinc-900/90 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <FolderGit2 className="w-4 h-4 text-zinc-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
            Automatic Folder Structure Generator
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyName}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-zinc-300 hover:text-zinc-100 bg-zinc-800/80 hover:bg-zinc-700/80 rounded-md border border-zinc-700/60 transition-colors"
            title="Copy root folder name to clipboard"
          >
            {copiedName ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedName ? 'Copied Name' : 'Copy Folder Name'}</span>
          </button>

          <button
            type="button"
            onClick={handleCopyStructure}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-zinc-300 hover:text-zinc-100 bg-zinc-800/80 hover:bg-zinc-700/80 rounded-md border border-zinc-700/60 transition-colors"
            title="Copy full directory tree to clipboard"
          >
            {copiedStructure ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedStructure ? 'Copied Tree' : 'Copy Structure'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadTxt}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-zinc-300 hover:text-zinc-100 bg-zinc-800/80 hover:bg-zinc-700/80 rounded-md border border-zinc-700/60 transition-colors"
            title="Download folder blueprint as text file"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .txt</span>
          </button>
        </div>
      </div>

      {/* Root folder pill */}
      <div className="px-4 py-3 bg-zinc-950/70 border-b border-zinc-800/70">
        <div className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1">
          Standard Naming Convention: [Project Number] [Company Name] [Job Type] [Capacity] [Location]
        </div>
        <div className="flex items-center gap-2 font-mono text-xs text-zinc-100 bg-zinc-900 px-3 py-2 rounded-lg border border-zinc-800 select-all overflow-x-auto">
          <Folder className="w-4 h-4 text-amber-400/90 shrink-0" />
          <span className="font-semibold">{folderName}</span>
        </div>
      </div>

      {/* Visual Directory Tree */}
      <div className="p-4 bg-zinc-950/40">
        <div className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-2">
          Directory Hierarchy Tree
        </div>
        <div className="font-mono text-xs leading-relaxed text-zinc-300 bg-zinc-950 border border-zinc-800/90 rounded-lg p-3.5 overflow-x-auto">
          <div className="flex items-center gap-2 text-zinc-100 font-semibold mb-1">
            <span className="text-amber-400">📁</span> {folderName}/
          </div>
          <div className="text-zinc-600 pl-2">│</div>
          <div className="flex items-center gap-2 text-zinc-300 pl-2 font-medium">
            <span className="text-zinc-500">└──</span> <span className="text-amber-300/80">📁</span> 01 Sales/
          </div>
          <div className="text-zinc-600 pl-6">│</div>
          <div className="flex items-center gap-2 text-zinc-400 pl-6">
            <span className="text-zinc-500">├──</span> <span className="text-amber-200/70">📁</span> Project Information/
          </div>
          <div className="text-zinc-600 pl-6">│</div>
          <div className="flex items-center gap-2 text-zinc-400 pl-6">
            <span className="text-zinc-500">└──</span> <span className="text-amber-200/70">📁</span> Quotes/
          </div>
        </div>
      </div>

      {/* Safety Notice per Rule 5 & 12 */}
      {!compact && (
        <div className="px-4 py-2.5 bg-amber-950/20 border-t border-amber-800/30 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-[11px] text-amber-200/90 leading-relaxed">
            <strong className="font-semibold text-amber-300">Proposed Structure Notice:</strong> This is an internal proposed folder blueprint generated according to Raven Tanks naming protocols. Folders have not been created in live Google Drive. Use the copy button above when initializing the Google Drive customer folder.
          </div>
        </div>
      )}
    </div>
  );
};
