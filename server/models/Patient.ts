import mongoose, { Schema, Document } from 'mongoose';

export interface IPatient extends Document {
  patientId: string;
  nationalId: string;
  name: string;
  age: number;
  gender: string;
  bloodGroup: string;
  phone: string;
  email?: string;
  address?: string;
  emergencyContact: {
    name: string;
    relation: string;
    phone: string;
  };
  primaryHospitalId: string;
  allergies: string[];
  chronicConditions: string[];
  qrPayload: string;
  accessPin: string;
  accountNumber: string;
  accountBalance: number;
  registeredDate: string;
  clinicalStatus?: string;
  assignedRoom?: string;
  attendingDoctor?: string;
  clinicalDiagnosis?: string;
  dischargeNotes?: string;
  dischargeMedications?: any[];
  admissionReason?: string;
}

const PatientSchema: Schema = new Schema(
  {
    patientId: { type: String, required: true, unique: true, index: true },
    nationalId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    bloodGroup: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, default: '' },
    address: { type: String, default: '' },
    emergencyContact: {
      name: { type: String, default: '' },
      relation: { type: String, default: '' },
      phone: { type: String, default: '' },
    },
    primaryHospitalId: { type: String, required: true },
    allergies: { type: [String], default: [] },
    chronicConditions: { type: [String], default: [] },
    qrPayload: { type: String, required: true, unique: true },
    accessPin: { type: String, required: true, default: '1234' },
    accountNumber: { type: String, default: () => `ACC-${Math.floor(100000 + Math.random() * 900000)}` },
    accountBalance: { type: Number, default: 0 },
    registeredDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
    clinicalStatus: { type: String, default: 'OUTPATIENT' },
    assignedRoom: { type: String, default: '' },
    attendingDoctor: { type: String, default: '' },
    clinicalDiagnosis: { type: String, default: '' },
    dischargeNotes: { type: String, default: '' },
    dischargeMedications: { type: [Schema.Types.Mixed], default: [] },
    admissionReason: { type: String, default: '' },
  },
  { timestamps: true }
);

export const PatientModel = mongoose.models.Patient || mongoose.model<IPatient>('Patient', PatientSchema);
