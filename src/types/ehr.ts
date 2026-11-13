export type HospitalId = 'hosp-shifa' | 'hosp-aku' | 'hosp-mayo';

export interface Hospital {
  id: HospitalId;
  name: string;
  city: string;
  badge: string;
  code: string;
  color: string;
  address: string;
  phone: string;
  adminLoginId: string;
  specificPassword: string;
  allowedStaff: {
    loginId: string;
    password: string;
    name: string;
    role: 'HOSPITAL_ADMIN' | 'CHIEF_PHYSICIAN' | 'TRIAGE_OFFICER';
    licenseNumber: string;
  }[];
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  hospitalId: HospitalId;
  hospitalName: string;
  doctorName: string;
  doctorSpecialty: string;
  date: string;
  type: 'OPD Consultation' | 'Emergency' | 'Lab Report' | 'Surgery / Procedure' | 'Discharge Summary';
  diagnosis: string;
  symptoms: string[];
  vitals: {
    bloodPressure: string;
    heartRate: string;
    temperature: string;
    spO2: string;
  };
  medications: Medication[];
  labFindings?: string[];
  allergiesObserved?: string[];
  doctorNotes: string;
}

export interface Patient {
  id: string;
  nationalId: string; // CNIC / National ID
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: string;
  phone: string;
  email?: string;
  address?: string;
  emergencyContact: {
    name: string;
    relation: string;
    phone: string;
  };
  primaryHospitalId: HospitalId;
  allergies: string[];
  chronicConditions: string[];
  registeredDate: string;
  qrPayload: string;
  accessPin: string; // 4-digit PIN for patient self-access
}

export interface AccessLog {
  id: string;
  patientId: string;
  patientName: string;
  hospitalId: HospitalId;
  hospitalName: string;
  doctorName: string;
  timestamp: string;
  accessType: 'QR_CAMERA_SCAN' | 'EMERGENCY_OVERRIDE' | 'CONSENT_OTP_VERIFIED' | 'RECORD_ADDED' | 'PATIENT_SELF_ACCESS';
  notes: string;
}

export interface StaffUser {
  id: string;
  name: string;
  role: 'HOSPITAL_ADMIN' | 'CHIEF_PHYSICIAN' | 'TRIAGE_OFFICER';
  hospitalId: HospitalId;
  licenseNumber: string;
  email: string;
}
