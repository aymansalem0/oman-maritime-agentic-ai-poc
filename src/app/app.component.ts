import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

type EvidenceGroup = 'vessel' | 'ownership' | 'activity';
type FieldState = 'Verified' | 'Needs Confirmation' | 'Missing' | 'Conflict';

interface EvidenceFile {
  name: string;
  group: EvidenceGroup;
  status: 'Uploaded' | 'Classified' | 'Processed';
  size: string;
}

interface ProfileField {
  label: string;
  value: string;
  status: FieldState;
  source?: string;
  page?: number;
  confidence?: number;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  currentScreen = 0;
  processingProgress = 0;
  processingMessage = 'Waiting to start';
  aiDrawerOpen = false;
  evidenceViewerOpen = false;
  selectedField: ProfileField | null = null;
  declarationAccepted = false;
  officerDecision = '';
  overrideReason = '';
  ownerType = 'Company';
  detectedOwner = 'Al Bahar Marine Fisheries LLC';
  dwt = '';
  callSign = 'V8NQ7';
  callSignResolved = false;
  dwtResolved = false;

  readonly screens = [
    'Service Details',
    'AI Assistant',
    'Upload Evidence',
    'AI Processing',
    'Prepared Application',
    'Resolve Exceptions',
    'Review & Submit',
    'Employee AI Review',
    'Human Decision'
  ];

  readonly processStages = [
    'Classifying uploaded evidence',
    'Extracting vessel identity and technical data',
    'Detecting ownership type from ownership evidence',
    'Identifying the intended marine activity',
    'Cross-checking values across documents',
    'Running simulated external verification',
    'Creating draft request through controlled action',
    'Applying authoritative backend validation'
  ];

  files: EvidenceFile[] = [];

  vesselFields: ProfileField[] = [
    { label: 'Vessel Name', value: 'FV AL NAJAH', status: 'Verified', source: 'Previous Certificate of Registry', page: 1, confidence: 99 },
    { label: 'IMO Number', value: '9876543', status: 'Verified', source: 'Previous Certificate of Registry', page: 1, confidence: 99 },
    { label: 'Call Sign', value: 'V8NQ7', status: 'Conflict', source: 'Previous Certificate of Registry', page: 1, confidence: 92 },
    { label: 'MMSI', value: '356789120', status: 'Verified', source: 'Ship Radio Station Licence', page: 1, confidence: 98 },
    { label: 'Ship Type', value: 'Fishing Vessel - Longline', status: 'Verified', source: 'Classification Certificate', page: 1, confidence: 97 },
    { label: 'Marine Activity', value: 'Commercial Longline Fishing', status: 'Needs Confirmation', source: 'Fisheries Activity Approval', page: 1, confidence: 94 },
    { label: 'Port of Registry', value: 'Port Victoria', status: 'Verified', source: 'Previous Certificate of Registry', page: 1, confidence: 98 },
    { label: 'Build Year', value: '2015', status: 'Verified', source: 'Builder’s Certificate', page: 1, confidence: 99 },
    { label: 'Gross Tonnage', value: '1,245', status: 'Verified', source: 'International Tonnage Certificate', page: 1, confidence: 99 },
    { label: 'Net Tonnage', value: '610', status: 'Verified', source: 'International Tonnage Certificate', page: 1, confidence: 99 },
    { label: 'Deadweight (DWT)', value: '', status: 'Missing', source: 'Not found in uploaded evidence', confidence: 0 },
    { label: 'Number of Decks', value: '', status: 'Missing', source: 'Not found in uploaded evidence', confidence: 0 }
  ];

  ownerFields: ProfileField[] = [
    { label: 'Owner Type', value: 'Company', status: 'Verified', source: 'Bill of Sale', page: 1, confidence: 97 },
    { label: 'Owner Name', value: 'Al Bahar Marine Fisheries LLC', status: 'Verified', source: 'Bill of Sale', page: 1, confidence: 99 },
    { label: 'Country', value: 'Sultanate of Oman', status: 'Verified', source: 'Bill of Sale', page: 1, confidence: 98 },
    { label: 'Ownership Evidence', value: 'Bill of Sale', status: 'Verified', source: 'Bill of Sale', page: 1, confidence: 99 }
  ];

  activityFields: ProfileField[] = [
    { label: 'Activity', value: 'Commercial Longline Fishing', status: 'Needs Confirmation', source: 'Fisheries Activity Approval', page: 1, confidence: 94 },
    { label: 'Issuing Authority', value: 'Fisheries Authority', status: 'Verified', source: 'Fisheries Activity Approval', page: 1, confidence: 96 },
    { label: 'Evidence Status', value: 'Valid supporting approval uploaded', status: 'Verified', source: 'Fisheries Activity Approval', page: 1, confidence: 98 }
  ];

  get verifiedCount(): number {
    return [...this.vesselFields, ...this.ownerFields, ...this.activityFields]
      .filter((field) => field.status === 'Verified').length;
  }

  get missingCount(): number {
    return this.vesselFields.filter((field) => field.status === 'Missing').length;
  }

  get conflictCount(): number {
    return this.vesselFields.filter((field) => field.status === 'Conflict').length;
  }

  goTo(screen: number): void {
    this.currentScreen = Math.max(0, Math.min(screen, this.screens.length - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  startAiJourney(): void {
    this.goTo(1);
  }

  continueManual(): void {
    alert('The existing manual service journey remains available as the fallback path. This POC demonstrates the AI-assisted route.');
  }

  onFilesSelected(event: Event, group: EvidenceGroup): void {
    const input = event.target as HTMLInputElement;
    const selected = Array.from(input.files ?? []);
    selected.forEach((file) => {
      this.files.push({
        name: file.name,
        group,
        status: 'Uploaded',
        size: this.formatSize(file.size)
      });
    });
    input.value = '';
  }

  removeFile(index: number): void {
    this.files.splice(index, 1);
  }

  loadSampleDossier(): void {
    this.files = [
      { name: '01_Previous_Certificate_of_Registry.pdf', group: 'vessel', status: 'Uploaded', size: '1.2 MB' },
      { name: '02_Certificate_of_Deletion.pdf', group: 'vessel', status: 'Uploaded', size: '0.8 MB' },
      { name: '03_Classification_Certificate.pdf', group: 'vessel', status: 'Uploaded', size: '1.5 MB' },
      { name: '04_Builders_Certificate.pdf', group: 'vessel', status: 'Uploaded', size: '1.1 MB' },
      { name: '05_Ship_Radio_Station_Licence.pdf', group: 'vessel', status: 'Uploaded', size: '0.9 MB' },
      { name: '06_Bill_of_Sale.pdf', group: 'ownership', status: 'Uploaded', size: '1.4 MB' },
      { name: '07_International_Tonnage_Certificate.pdf', group: 'vessel', status: 'Uploaded', size: '0.7 MB' },
      { name: '08_Engine_Technical_Data_Sheet.pdf', group: 'vessel', status: 'Uploaded', size: '2.2 MB' },
      { name: '09_General_Arrangement_Drawing.pdf', group: 'vessel', status: 'Uploaded', size: '4.6 MB' },
      { name: '10_Fisheries_Activity_Approval.pdf', group: 'activity', status: 'Uploaded', size: '0.8 MB' }
    ];
  }

  analyzeEvidence(): void {
    if (this.files.length === 0) {
      this.loadSampleDossier();
    }
    this.goTo(3);
    this.processingProgress = 0;
    let stage = 0;
    this.processingMessage = this.processStages[stage];

    const timer = window.setInterval(() => {
      this.processingProgress += 4;

      const nextStage = Math.min(
        this.processStages.length - 1,
        Math.floor((this.processingProgress / 100) * this.processStages.length)
      );

      if (nextStage !== stage) {
        stage = nextStage;
        this.processingMessage = this.processStages[stage];
      }

      if (this.processingProgress >= 100) {
        window.clearInterval(timer);
        this.processingProgress = 100;
        this.processingMessage = 'Draft prepared. Backend validation completed.';
        this.files = this.files.map((file) => ({ ...file, status: 'Processed' }));
        window.setTimeout(() => this.goTo(4), 700);
      }
    }, 120);
  }

  resolveCallSign(value: string): void {
    this.callSign = value;
    this.callSignResolved = true;
    const field = this.vesselFields.find((item) => item.label === 'Call Sign');
    if (field) {
      field.value = value;
      field.status = 'Verified';
      field.source = value === 'V8NQ7' ? 'Registry value confirmed by applicant' : 'Radio Licence value confirmed by applicant';
      field.confidence = 100;
    }
  }

  confirmActivity(): void {
    this.activityFields[0].status = 'Verified';
    const marine = this.vesselFields.find((item) => item.label === 'Marine Activity');
    if (marine) {
      marine.status = 'Verified';
    }
  }

  saveDwt(): void {
    if (!this.dwt.trim()) {
      return;
    }
    this.dwtResolved = true;
    const field = this.vesselFields.find((item) => item.label === 'Deadweight (DWT)');
    if (field) {
      field.value = this.dwt.trim();
      field.status = 'Verified';
      field.source = 'Applicant-provided value during exception resolution';
      field.confidence = 100;
    }
  }

  setDecksNotAvailable(): void {
    const field = this.vesselFields.find((item) => item.label === 'Number of Decks');
    if (field) {
      field.value = 'Not available — officer review';
      field.status = 'Needs Confirmation';
      field.source = 'Applicant could not provide evidence';
      field.confidence = 0;
    }
  }

  openEvidence(field: ProfileField): void {
    this.selectedField = field;
    this.evidenceViewerOpen = true;
  }

  submitApplication(): void {
    if (!this.declarationAccepted) {
      alert('Please accept the self-declaration before submitting.');
      return;
    }
    this.goTo(7);
  }

  chooseDecision(decision: string): void {
    this.officerDecision = decision;
    this.goTo(8);
  }

  finalizeDecision(): void {
    if (this.officerDecision !== 'Approve' && !this.overrideReason.trim()) {
      alert('A reason is required when the officer overrides or changes the proposed AI decision.');
      return;
    }
    alert('Decision recorded in the POC audit trail: ' + this.officerDecision);
  }

  toggleAiDrawer(): void {
    this.aiDrawerOpen = !this.aiDrawerOpen;
  }

  private formatSize(bytes: number): string {
    if (bytes < 1024 * 1024) {
      return Math.max(1, Math.round(bytes / 1024)) + ' KB';
    }
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
}
