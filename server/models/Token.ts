import mongoose, { Schema, Document } from 'mongoose';

export type DepartmentKey =
  | 'Orthopedics'
  | 'Cardiology'
  | 'Neurology'
  | 'General Medicine'
  | 'Pediatrics'
  | 'Surgery'
  | 'Dermatology'
  | 'Gynecology'
  | 'Emergency';

export type TokenStatus = 'WAITING' | 'CALLED' | 'IN_CONSULTATION' | 'COMPLETED' | 'CANCELLED';

export interface IToken extends Document {
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
  hospitalId: string;
  notes?: string;
}

const TokenSchema: Schema = new Schema(
  {
    tokenNumber: { type: String, required: true, index: true },
    department: { type: String, required: true, index: true },
    departmentCode: { type: String, required: true },
    patientId: { type: String, required: true, index: true },
    patientName: { type: String, required: true },
    patientPhone: { type: String, required: true },
    assignedDoctor: { type: String, required: true },
    roomNumber: { type: String, required: true },
    status: {
      type: String,
      enum: ['WAITING', 'CALLED', 'IN_CONSULTATION', 'COMPLETED', 'CANCELLED'],
      default: 'WAITING',
      index: true,
    },
    priority: { type: String, enum: ['NORMAL', 'URGENT', 'EMERGENCY'], default: 'NORMAL' },
    issueTime: { type: String, default: () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    estimatedWaitMinutes: { type: Number, default: 15 },
    hospitalId: { type: String, required: true },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

export const TokenModel = mongoose.models.Token || mongoose.model<IToken>('Token', TokenSchema);
