import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateFolderName,
  generateFolderTree,
  calculateSetupProgress,
  deriveSetupStatus,
  createInitialChecklist,
  DEFAULT_CHECKLIST_CONFIG,
} from './projectLogic';
import { ChecklistItem, ProjectDocuments } from '../types/project';

test('generateFolderName matches Raven specification format', () => {
  const folder = generateFolderName({
    projectNumber: '1029',
    companyName: 'Example Client',
    jobType: 'New Tank',
    tankCapacity: '250KL',
    location: 'Sydney',
  });
  assert.equal(folder, '1029 Example Client New Tank 250KL Sydney');
});

test('generateFolderName handles missing fields and invalid path characters', () => {
  const folder = generateFolderName({
    projectNumber: '1040',
    companyName: 'BHP / Water:Ops*',
    jobType: 'Refurb',
    location: 'Perth',
  });
  assert.equal(folder, '1040 BHP  WaterOps Refurb Perth');
});

test('generateFolderTree creates 01 Sales subfolders according to spec', () => {
  const tree = generateFolderTree('1029 Example Client New Tank 250KL Sydney');
  assert.ok(tree.includes('1029 Example Client New Tank 250KL Sydney/'));
  assert.ok(tree.includes('01 Sales/'));
  assert.ok(tree.includes('Project Information/'));
  assert.ok(tree.includes('Quotes/'));
});

test('createInitialChecklist creates all 16 predefined checklist tasks', () => {
  const checklist = createInitialChecklist();
  assert.equal(checklist.length, 16);
  assert.equal(checklist[0].order, 1);
  assert.equal(checklist[0].label, 'Project number confirmed.');
  assert.equal(checklist[15].order, 16);
  assert.equal(checklist[15].label, 'Project ready for budget preparation.');
});

test('calculateSetupProgress accurately computes completion metrics', () => {
  const checklist = createInitialChecklist();
  checklist[0].completed = true;
  checklist[1].completed = true;
  checklist[2].completed = true;
  checklist[3].completed = true;

  const result = calculateSetupProgress(checklist);
  assert.equal(result.completed, 4);
  assert.equal(result.total, 16);
  assert.equal(result.percentage, 25);
  assert.equal(result.outstanding.length, 12);
});

test('deriveSetupStatus flags Ready for Budgeting when step 16 is complete', () => {
  const checklist = createInitialChecklist();
  checklist[15].completed = true; // item 16 is index 15
  const docs: ProjectDocuments = {
    customerEmail: true,
    tankDrawings: true,
    technicalSpecs: true,
    scopeOfWork: true,
    additionalAttachments: false,
  };

  const status = deriveSetupStatus(checklist, docs);
  assert.equal(status, 'Ready for Budgeting');
});

test('deriveSetupStatus flags Missing Information when documents or early checklist incomplete', () => {
  const checklist = createInitialChecklist();
  checklist[0].completed = true; // only 1 done
  const docs: ProjectDocuments = {
    customerEmail: false,
    tankDrawings: false,
    technicalSpecs: false,
    scopeOfWork: false,
    additionalAttachments: false,
  };

  const status = deriveSetupStatus(checklist, docs);
  assert.equal(status, 'Missing Information');
});
