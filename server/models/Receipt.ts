import mongoose, { Schema, Document } from 'mongoose';

export interface IReceipt extends Document {
  receiptNumber: string;
  tokenNumber?: string;
  patientId: string;
  patientName: string;
  patientCnic: string;
  patientPhone: string;
  accountNumber: string;
  hospitalId: string;
  hospitalName: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  department: string;
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
  createdAt: Date;
}

const ReceiptSchema = new Schema<IReceipt>(
  {
    receiptNumber: { type: String, required: true, unique: true, index: true },
    tokenNumber: { type: String, default: '' },
    patientId: { type: String, required: true },
    patientName: { type: String, required: true },
    patientCnic: { type: String, required: true },
    patientPhone: { type: String, required: true },
    accountNumber: { type: String, required: true },
    hospitalId: { type: String, required: true },
    hospitalName: { type: String, required: true },
    doctorId: { type: String, required: true },
    doctorName: { type: String, required: true },
    doctorSpecialty: { type: String, required: true },
    department: { type: String, required: true },
    appointmentNumber: { type: String, required: true },
    appointmentDate: { type: String, required: true },
    appointmentTime: { type: String, required: true },
    consultationFee: { type: Number, required: true },
    serviceCharge: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, default: 'Cash at Counter' },
    paymentStatus: { type: String, enum: ['PAID', 'PENDING'], default: 'PAID' },
    transactionId: { type: String, required: true },
    qrPayload: { type: String, required: true },
    issuedAt: { type: String, default: () => new Date().toLocaleString() },
  },
  { timestamps: true }
);

export const ReceiptModel = mongoose.models.Receipt || mongoose.model<IReceipt>('Receipt', ReceiptSchema);
