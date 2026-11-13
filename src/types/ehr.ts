export type HospitalId = 'hosp-shifa' | 'hosp-aku' | 'hosp-mayo';

export type DepartmentKey =
  | 'Orthopedics'
  | 'Cardiology'
  | 'Neurology'
  | 'General Medicine'
  | 'Pediatrics'
  | 'General Surgery'
  | 'Dermatology'
  | 'Gynecology'
  | 'Emergency';

export interface DepartmentInfo {
  key: DepartmentKey;
  name: string;
  code: string;
  headDoctor: string;
  doctorSpecialty: string;
  roomNumber: string;
  openHours: string;
  currentWaitMinutes: number;
  description: string;
}

export type TokenStatus = 'WAITING' | 'CALLED' | 'IN_CONSULTATION' | 'COMPLETED' | 'CANCELLED';

export interface OpdToken {
  id: string;
  tokenNumber: string; // e.g. "ORTHO-101"
  department: DepartmentKey;
  departmentCode: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  assignedDoctor: string;
  roomNumber: string;
  status: TokenStatus;
  priority: 'NORMAL' | 'URGENT' | 'EMERGENCY';
  issueTime: string;
  estimatedWaitMinutes: number;
  hospitalId: HospitalId;
  notes?: string;
}

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
  accountNumber?: string; // Patient Hospital Billing Account Number
  accountBalance?: number; // Patient Digital Wallet Balance
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

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  department: DepartmentKey;
  experienceYears: number;
  hospitalId: HospitalId;
  hospitalName: string;
  availableHours: string;
  availableDays: string[];
  rating: number;
  reviewCount: number;
  consultationFee: number;
  imageUrl: string;
  roomNumber: string;
}

export type AppointmentStatus = 'CONFIRMED' | 'CHECKED_IN' | 'COMPLETED' | 'CANCELLED';

export interface Appointment {
  id: string;
  appointmentNumber: string;
  patientId?: string;
  patientName: string;
  patientPhone: string;
  patientCnic: string;
  patientGender?: 'Male' | 'Female' | 'Other';
  patientAge?: number;
  hospitalId: HospitalId;
  hospitalName: string;
  department: DepartmentKey;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  date: string;
  timeSlot: string;
  reasonForVisit: string;
  status: AppointmentStatus;
  tokenNumber?: string; // Generated OPD Queue Token after payment
  qrPayload: string;
  createdAt: string;
}

export interface PaymentReceipt {
  id: string;
  receiptNumber: string;
  tokenNumber?: string; // Issued OPD Queue Token (e.g. CARDIO-204)
  patientId: string;
  patientName: string;
  patientCnic: string;
  patientPhone: string;
  accountNumber: string;
  hospitalId: HospitalId;
  hospitalName: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  department: string;
  roomNumber?: string;
  appointmentNumber: string;
  appointmentDate: string;
  appointmentTime: string;
  consultationFee: number;
  serviceCharge: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: 'PAID' | 'PENDING';
  transactionId: string;
  qrPayload: string;
  issuedAt: string;
}
