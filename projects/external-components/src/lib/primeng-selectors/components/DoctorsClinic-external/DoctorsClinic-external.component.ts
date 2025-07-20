// DoctorsClinicComponent for Angular 18
// Features:
// - Add/edit patients and appointments
// - Search/filter patients
// - WhatsApp reminders for appointments
// - Backup (download) and restore (upload) all clinic data as .txt file via header buttons
// - Upload uses a small icon button (PrimeIcons v7), download is labeled "Backup Data"
// - All UI styled with Bootstrap 5, icons with PrimeIcons
// - Data stored in LocalStorage (browser only, no server needed)
// - Strict typing everywhere
// - Upcoming appointments: Time shown in 12-hour format; each row has Delete button
// - Patients list: Edit button is blue and icon-only; set appointment is a blue calendar icon
// - On clicking edit, page scrolls smoothly to the patient form section
// - When editing a patient, Save and Cancel buttons are placed side by side and labeled as 'Save' and 'Cancel'

import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonExternalComponent } from '../common-external/common-external.component';

interface Patient {
  key?: string;
  name: string;
  dob?: Date | string;
  countryCode?: string;
  phone?: string;
  whatsapp: string;
  email?: string;
  address?: string;
  appointments: Appointment[];
}

interface Appointment {
  date: Date | string;
  time: string;
  reason: string;
}

@Component({
  selector: 'app-doctors-clinic',
  template: `
    <!-- Header with backup/download and upload/restore -->
    <div class="d-flex align-items-center justify-content-between mb-3">
      <h1 class="mb-0 fs-3">Doctor's Clinic</h1>
      <div class="d-flex align-items-center gap-2">
        <button type="button"
          class="btn btn-outline-primary btn-sm px-3 me-2 d-flex align-items-center"
          (click)="backupData()"
        >
          <i class="pi pi-download me-2"></i> Backup Data
        </button>
        <label class="btn btn-outline-secondary btn-sm m-0 p-0 border-0" style="width:auto; min-width:unset; background:transparent;">
          <input type="file"
            accept=".txt"
            (change)="restoreData($event)"
            style="display:none"
          />
          <i class="pi pi-upload fs-5" style="vertical-align:middle;" title="Restore Data"></i>
        </label>
      </div>
    </div>

    <!-- Patient Add/Edit Form -->
    <form #patientFormSection [formGroup]="patientForm" (ngSubmit)="addPatient()" class="clinic-form card shadow-sm p-4 mb-4">
      <h2 class="mb-3">{{ editPatientIdx === null ? 'Add New Patient' : 'Edit Patient' }}</h2>
      <div class="row g-3">
        <div class="col-md-6">
          <label class="form-label">Name: <span class="text-danger">*</span>
            <input formControlName="name" required class="form-control" />
          </label>
          <div *ngIf="patientForm.get('name')?.invalid && patientForm.get('name')?.touched" class="text-danger small">
            Name is required.
          </div>
        </div>
        <div class="col-md-6">
          <label class="form-label">Date of Birth:
            <input type="date" formControlName="dob" class="form-control" />
          </label>
        </div>
        <div class="col-md-3">
          <label class="form-label">Country Code:
            <input formControlName="countryCode" maxlength="4" class="form-control" style="width:80px;" />
          </label>
        </div>
        <div class="col-md-4">
          <label class="form-label">Phone Number:
            <input formControlName="phone" maxlength="15" class="form-control" />
          </label>
        </div>
        <div class="col-md-5">
          <label class="form-label w-100">WhatsApp Number: <span class="text-danger">*</span>
            <div class="input-group">
              <input formControlName="whatsapp" required maxlength="15"
                [readonly]="patientForm.get('sameAsPhone')?.value" class="form-control" />
              <span class="input-group-text bg-white border-0">
                <input type="checkbox" formControlName="sameAsPhone" class="form-check-input me-1" /> Same as above
              </span>
            </div>
          </label>
          <div *ngIf="patientForm.get('whatsapp')?.invalid && patientForm.get('whatsapp')?.touched" class="text-danger small">
            WhatsApp number is required.
          </div>
        </div>
        <div class="col-md-6">
          <label class="form-label">Email:
            <input formControlName="email" type="email" class="form-control" />
          </label>
        </div>
        <div class="col-md-6">
          <label class="form-label">Address:
            <input formControlName="address" class="form-control" />
          </label>
        </div>
      </div>
      <div class="mt-3 d-flex gap-2">
        <button type="submit"
          [disabled]="!patientForm.get('name')?.value || !patientForm.get('whatsapp')?.value"
          class="btn btn-primary add-patient-btn">
          {{ editPatientIdx === null ? 'Save Patient' : 'Save' }}
        </button>
        <button *ngIf="editPatientIdx !== null"
          type="button"
          (click)="cancelEditPatient()"
          class="btn btn-secondary"
        >Cancel</button>
      </div>
    </form>

    <!-- Patients List -->
    <div class="patients-list card shadow-sm p-4 mb-4">
      <h2>Patients</h2>
      <div class="mb-3">
        <input
          type="text"
          placeholder="Search by name or phone"
          [(ngModel)]="searchTerm"
          (ngModelChange)="onSearchTermChange()"
          class="form-control search-box"
          name="patientSearch"
          autocomplete="off"
        />
      </div>
      <ul class="list-group">
        <li *ngFor="let patient of filteredPatients; let idx = index" class="list-group-item d-flex justify-content-between align-items-center">
          <span>
            {{ patient.name }} <small class="text-muted" *ngIf="patient.dob">({{ patient.dob | date:'mediumDate' }})</small>
          </span>
          <div class="d-flex gap-2">
            <button (click)="editPatient(getOriginalIndex(idx))"
              class="btn btn-link p-0 m-0 text-primary"
              style="font-size:1.3rem;min-width:unset;width:2.2rem;height:2.2rem;"
              title="Edit Patient">
              <i class="pi pi-pencil"></i>
            </button>
            <button (click)="selectPatient(getOriginalIndex(idx))"
              class="btn btn-link p-0 m-0 text-primary"
              style="font-size:1.3rem;min-width:unset;width:2.2rem;height:2.2rem;"
              title="Set Appointment">
              <i class="pi pi-calendar"></i>
            </button>
          </div>
        </li>
      </ul>
    </div>

    <!-- Appointment Add/Edit Form -->
    <form *ngIf="selectedPatientIdx !== null" [formGroup]="appointmentForm" (ngSubmit)="addAppointment()" class="appointment-form card shadow-sm p-4 mb-4">
      <h3 class="mb-3">New Appointment for <span class="text-primary">{{ patients[selectedPatientIdx]?.name }}</span></h3>
      <div class="row g-3">
        <div class="col-md-4">
          <label class="form-label">Date:
            <input type="date" formControlName="date" required class="form-control" />
          </label>
        </div>
        <div class="col-md-4">
          <label class="form-label">Time:
            <input type="time" formControlName="time" required class="form-control" />
          </label>
        </div>
        <div class="col-md-4">
          <label class="form-label">Reason:
            <input formControlName="reason" required class="form-control" />
          </label>
        </div>
      </div>
      <div class="mt-3">
        <button type="submit" [disabled]="!appointmentForm.valid" class="btn btn-success me-2">Add Appointment</button>
        <button type="button" (click)="cancelAppointment()" class="btn btn-secondary">Cancel</button>
      </div>
    </form>

    <!-- Appointments Table -->
    <div class="appointments-table card shadow-sm p-4">
      <h2>Upcoming Appointments</h2>
      <div class="table-responsive">
        <table class="table table-bordered align-middle">
          <thead class="table-light">
            <tr>
              <th>Patient</th>
              <th>Date</th>
              <th>Time</th>
              <th>Reason</th>
              <th>Reminder</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of upcomingAppointments; let i = index">
              <td>{{ item.patientName }}</td>
              <td>{{ item.appointment.date | date:'mediumDate' }}</td>
              <td>{{ formatTime12(item.appointment.time) }}</td>
              <td>{{ item.appointment.reason }}</td>
              <td>
                <button
                  type="button"
                  (click)="sendWhatsAppReminder(item.patient, item.appointment)"
                  title="Send WhatsApp Reminder"
                  class="btn btn-outline-success btn-sm"
                ><i class="pi pi-whatsapp"></i> Send WhatsApp</button>
              </td>
              <td>
                <button type="button"
                  (click)="deleteAppointment(item.patient, item.appointment)"
                  class="btn btn-outline-danger btn-sm"
                  title="Delete Appointment"
                ><i class="pi pi-trash"></i></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [
    `
    .card { border-radius: 10px; }
    .search-box { max-width: 320px; }
    .list-group-item { transition: background 0.2s; }
    .list-group-item:hover { background: #f8f9fa; }
    .btn { min-width: 110px; }
    .table th, .table td { vertical-align: middle; }
    .add-patient-btn:disabled,
    .add-patient-btn[disabled] {
      background-color: #e0e0e0 !important;
      color: #a0a0a0 !important;
      border-color: #e0e0e0 !important;
      opacity: 1 !important;
      cursor: not-allowed;
    }
    .pi.pi-upload { font-size: 1.3rem; }
    .btn-link.text-primary i {
      color: #0d6efd !important;
      vertical-align: middle;
    }
    .btn-link {
      box-shadow: none !important;
    }
    `
  ],
})
export class DoctorsClinicComponent
  extends CommonExternalComponent
  implements OnInit
{
  @ViewChild('patientFormSection') patientFormSection!: ElementRef<HTMLFormElement>;

  patientForm: FormGroup;
  appointmentForm: FormGroup;
  patients: Patient[] = [];
  selectedPatientIdx: number | null = null;
  searchTerm: string = '';
  filteredPatients: Patient[] = [];
  private filteredPatientIndices: number[] = [];
  editPatientIdx: number | null = null;

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    super();
    this.patientForm = this.fb.group({
      name: ['', Validators.required],
      dob: [''],
      countryCode: ['91', [Validators.maxLength(4)]],
      phone: ['', [Validators.maxLength(15)]],
      whatsapp: ['', [Validators.required, Validators.maxLength(15)]],
      sameAsPhone: [false],
      email: [''],
      address: [''],
    });

    this.appointmentForm = this.fb.group({
      date: ['', Validators.required],
      time: ['', Validators.required],
      reason: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadPatientsFromStorage();

    this.patientForm
      .get('sameAsPhone')
      ?.valueChanges.subscribe((checked: boolean) => {
        if (checked) {
          const phoneValue: string = this.patientForm.get('phone')?.value || '';
          this.patientForm.get('whatsapp')?.setValue(phoneValue);
          this.patientForm.get('whatsapp')?.disable();
        } else {
          this.patientForm.get('whatsapp')?.enable();
        }
      });

    this.patientForm
      .get('phone')
      ?.valueChanges.subscribe((phoneValue: string) => {
        if (this.patientForm.get('sameAsPhone')?.value) {
          this.patientForm.get('whatsapp')?.setValue(phoneValue || '');
        }
      });

    this.updateFilteredPatients();
  }

  private getPatientKey(name: string, whatsapp: string): string {
    return `${name.trim().toLowerCase()}_${whatsapp.trim()}`;
  }

  private loadPatientsFromStorage(): void {
    const data = localStorage.getItem('doctors-clinic-data');
    if (data) {
      try {
        const obj = JSON.parse(data) as { patients: Patient[] };
        this.patients = Array.isArray(obj.patients) ? obj.patients : [];
      } catch {
        this.patients = [];
      }
    } else {
      this.patients = [];
    }
    this.updateFilteredPatients();
    this.cdr.markForCheck();
  }

  private savePatientsToStorage(): void {
    localStorage.setItem('doctors-clinic-data', JSON.stringify({ patients: this.patients }));
  }

  async addPatient(): Promise<void> {
    if (
      this.patientForm.get('name')?.value &&
      this.patientForm.get('whatsapp')?.value
    ) {
      const formValue = this.patientForm.getRawValue();
      const patient: Patient = {
        name: formValue.name,
        dob: formValue.dob || undefined,
        countryCode: formValue.countryCode || undefined,
        phone: formValue.phone || undefined,
        whatsapp: formValue.whatsapp,
        email: formValue.email || undefined,
        address: formValue.address || undefined,
        appointments: [],
      };

      if (this.editPatientIdx !== null) {
        // Editing existing patient, keep their appointments
        patient.appointments = this.patients[this.editPatientIdx].appointments || [];
        this.patients[this.editPatientIdx] = { ...patient };
        this.editPatientIdx = null;
      } else {
        // Check if patient exists, update if so, else add
        const key = this.getPatientKey(patient.name, patient.whatsapp);
        const existingIdx = this.patients.findIndex(
          (p) => this.getPatientKey(p.name, p.whatsapp) === key
        );
        if (existingIdx >= 0) {
          patient.appointments = this.patients[existingIdx].appointments || [];
          this.patients[existingIdx] = { ...patient };
        } else {
          this.patients.push({ ...patient });
        }
      }
      this.savePatientsToStorage();
      this.loadPatientsFromStorage();
      this.patientForm.reset({ countryCode: '91' });
      this.patientForm.get('whatsapp')?.enable();
    }
  }

  editPatient(idx: number): void {
    this.editPatientIdx = idx;
    const patient: Patient = this.patients[idx];
    this.patientForm.reset({
      name: patient.name,
      dob: patient.dob ? this.toInputDate(patient.dob) : '',
      countryCode: patient.countryCode || '91',
      phone: patient.phone || '',
      whatsapp: patient.whatsapp,
      sameAsPhone: false,
      email: patient.email || '',
      address: patient.address || ''
    });
    this.patientForm.get('whatsapp')?.enable();
    this.selectedPatientIdx = null;
    this.cdr.detectChanges();
    // Scroll to patient form section after view updates
    setTimeout(() => {
      if (this.patientFormSection && this.patientFormSection.nativeElement) {
        this.patientFormSection.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  }

  cancelEditPatient(): void {
    this.editPatientIdx = null;
    this.patientForm.reset({ countryCode: '91' });
    this.patientForm.get('whatsapp')?.enable();
    this.cdr.detectChanges();
  }

  private toInputDate(d: Date | string | undefined): string {
    if (!d) return '';
    const dateObj: Date = typeof d === 'string' ? new Date(d) : d;
    const yyyy = dateObj.getFullYear();
    const mm = ('0' + (dateObj.getMonth() + 1)).slice(-2);
    const dd = ('0' + dateObj.getDate()).slice(-2);
    return `${yyyy}-${mm}-${dd}`;
  }

  selectPatient(idx: number): void {
    this.selectedPatientIdx = idx;
    this.appointmentForm.reset();
    this.editPatientIdx = null;
  }

  cancelAppointment(): void {
    this.selectedPatientIdx = null;
    this.appointmentForm.reset();
  }

  async addAppointment(): Promise<void> {
    if (this.selectedPatientIdx !== null && this.appointmentForm.valid) {
      const appointment: Appointment = {
        ...this.appointmentForm.value,
      };
      this.patients[this.selectedPatientIdx].appointments =
        this.patients[this.selectedPatientIdx].appointments || [];
      this.patients[this.selectedPatientIdx].appointments.push(appointment);
      this.savePatientsToStorage();
      this.loadPatientsFromStorage();
      this.selectedPatientIdx = null;
      this.appointmentForm.reset();
    }
  }

  /**
   * Returns all upcoming appointments (future date+time) sorted by datetime ascending.
   * Both date and time are considered for comparison.
   */
  get upcomingAppointments(): {
    patientName: string;
    appointment: Appointment;
    patient: Patient;
  }[] {
    const now: Date = new Date();
    return this.patients
      .reduce(
        (
          acc: {
            patientName: string;
            appointment: Appointment;
            patient: Patient;
          }[],
          patient: Patient
        ) => {
          const upcoming = (patient.appointments || [])
            .filter((app: Appointment) => {
              const dtString: string =
                typeof app.date === 'string'
                  ? app.date
                  : app.date instanceof Date
                  ? app.date.toISOString().slice(0, 10)
                  : '';
              const timeString: string = app.time || '00:00';
              // Combine date and time to a full ISO string
              const appointmentDateTime = new Date(dtString + 'T' + timeString);
              return appointmentDateTime.getTime() >= now.getTime();
            })
            .map((app: Appointment) => ({
              patientName: patient.name,
              appointment: app,
              patient: patient,
            }));
          return acc.concat(upcoming);
        },
        []
      )
      .sort((a, b) => {
        // Use both date and time for sorting
        const getDateTime = (app: Appointment): number => {
          const dtString: string =
            typeof app.date === 'string'
              ? app.date
              : app.date instanceof Date
              ? app.date.toISOString().slice(0, 10)
              : '';
          const timeString: string = app.time || '00:00';
          return new Date(dtString + 'T' + timeString).getTime();
        };
        return getDateTime(a.appointment) - getDateTime(b.appointment);
      });
  }

  onSearchTermChange(): void {
    this.updateFilteredPatients();
  }

  private updateFilteredPatients(): void {
    const term: string = this.searchTerm.trim().toLowerCase();
    if (!term) {
      this.filteredPatients = [...this.patients];
      this.filteredPatientIndices = this.patients.map((_p, i) => i);
    } else {
      this.filteredPatients = [];
      this.filteredPatientIndices = [];
      this.patients.forEach((patient: Patient, idx: number) => {
        if (
          patient.name.toLowerCase().includes(term) ||
          (patient.phone && patient.phone.toLowerCase().includes(term))
        ) {
          this.filteredPatients.push(patient);
          this.filteredPatientIndices.push(idx);
        }
      });
    }
  }

  getOriginalIndex(filteredIdx: number): number {
    return this.filteredPatientIndices[filteredIdx];
  }

  sendWhatsAppReminder(patient: Patient, appointment: Appointment): void {
    let phoneNumber: string = patient.whatsapp || '';
    let cleanPhoneNumber: string = phoneNumber.replace(/[^\d]/g, '');
    let countryCode: string = (patient.countryCode || '91').replace(
      /[^\d]/g,
      ''
    );
    cleanPhoneNumber = cleanPhoneNumber.replace(/^0+/, '');
    const phoneForWhatsApp = `${countryCode}${cleanPhoneNumber}`;
    const message: string =
      `Hi ${patient.name},\n` +
      `This is a reminder for your appointment at Swasthayu Clinic.\n` +
      `Date: ${this.formatDate(appointment.date)}\n` +
      `Time: ${this.formatTime12(appointment.time)}\n` +
      `Reason: ${appointment.reason}\n\n` +
      `Thank you. \nBest regards, \nSwasthayu Clinic, Ravet`;
    const encodedMessage: string = encodeURIComponent(message);
    const whatsappUrl: string = `https://wa.me/${phoneForWhatsApp}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  }

  private formatDate(date: Date | string): string {
    const d: Date = typeof date === 'string' ? new Date(date) : date;
    const day: string = ('0' + d.getDate()).slice(-2);
    const month: string = ('0' + (d.getMonth() + 1)).slice(-2);
    const year: string = d.getFullYear().toString();
    return `${day}/${month}/${year}`;
  }

  formatTime12(time24: string): string {
    if (!time24) return '';
    const [hourStr, minStr] = time24.split(':');
    let hour: number = parseInt(hourStr, 10);
    const minute: string = minStr || '00';
    const ampm: string = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    if (hour === 0) hour = 12;
    return `${hour}:${minute} ${ampm}`;
  }

  // --- Backup & Restore Functionality ---

  /** Download all patient data as .txt file using parent's componentDataDownloader */
  async backupData(): Promise<void> {
    this.componentDataDownloader({ patients: this.patients });
  }

  /** Restore all patient data from uploaded .txt file using parent's componentDataUploader */
  async restoreData(event: Event): Promise<void> {
    try {
      const result = await this.componentDataUploader(event);
      if (result && Array.isArray(result.patients)) {
        this.patients = result.patients as Patient[];
        this.savePatientsToStorage();
        this.loadPatientsFromStorage();
        this.cdr.detectChanges();
      }
    } catch (err) {
      // Optionally show error to user
    }
  }

  // --- Delete Appointment Functionality ---
  deleteAppointment(patient: Patient, appointment: Appointment): void {
    if (!patient || !appointment) return;
    const idx = this.patients.findIndex(
      (p) =>
        this.getPatientKey(p.name, p.whatsapp) ===
        this.getPatientKey(patient.name, patient.whatsapp)
    );
    if (idx >= 0) {
      const apps = this.patients[idx].appointments || [];
      const appIdx = apps.indexOf(appointment);
      if (appIdx >= 0) {
        apps.splice(appIdx, 1);
        this.patients[idx].appointments = [...apps];
        this.savePatientsToStorage();
        this.loadPatientsFromStorage();
        this.cdr.detectChanges();
      }
    }
  }
}