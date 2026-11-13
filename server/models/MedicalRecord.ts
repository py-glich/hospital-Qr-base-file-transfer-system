import mongoose, { Schema, Document } from 'mongoose';

export interface IMedicalRecord extends Document {
  recordId: string;
  patientId: string;
  hospitalId: string;
  hospitalName: string;
  doctorName: string;
  doctorSpecialty: string;
  date: string;
  type: string;
  diagnosis: string;
  symptoms: string[];
  vitals: {
    bloodPressure: string;
    heartRate: string;
    temperature: string;
    spO2: string;
  };
  medications: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }[];
  labFindings: string[];
  allergiesObserved: string[];
  doctorNotes: string;
}

const MedicalRecordSchema: Schema = new Schema(
  {
    recordId: { type: String, required: true, unique: true, index: true },
    patientId: { type: String, required: true, index: true },
    hospitalId: { type: String, required: true },
    hospitalName: { type: String, required: true },
    doctorName: { type: String, required: true },
    doctorSpecialty: { type: String, required: true },
    date: { type: String, default: () => new Date().toISOString().split('T')[0] },
    type: { type: String, required: true },
    diagnosis: { type: String, required: true },
    symptoms: { type: [String], default: [] },
    vitals: {
      bloodPressure: { type: String, default: '120/80 mmHg' },
      heartRate: { type: String, default: '72 bpm' },
      temperature: { type: String, default: '98.6 °F' },
      spO2: { type: String, default: '98%' },
    },
    medications: [
      {
        name: { type: String, required: true },
        dosage: { type: String, default: '' },
        frequency: { type: String, default: '' },
        duration: { type: String, default: '' },
      },
    ],
    labFindings: { type: [String], default: [] },
    allergiesObserved: { type: [String], default: [] },
    doctorNotes: { type: String, default: '' },
  },
  { timestamps: true }
);

export const MedicalRecordModel =
  mongoose.models.MedicalRecord || mongoose.model<IMedicalRecord>('MedicalRecord', MedicalRecordSchema);
