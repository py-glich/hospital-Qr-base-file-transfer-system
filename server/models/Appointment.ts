import mongoose, { Schema, Document } from 'mongoose';

export interface IAppointment extends Document {
  appointmentNumber: string;
  patientId?: string;
  patientName: string;
  patientPhone: string;
  patientCnic: string;
  patientGender?: string;
  patientAge?: number;
  hospitalId: string;
  hospitalName: string;
  department: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  date: string;
  timeSlot: string;
  reasonForVisit: string;
  status: string;
  tokenNumber?: string;
  qrPayload: string;
  createdAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    appointmentNumber: { type: String, required: true, unique: true },
    patientId: { type: String },
    patientName: { type: String, required: true },
    patientPhone: { type: String, required: true },
    patientCnic: { type: String, required: true },
    patientGender: { type: String, default: 'Male' },
    patientAge: { type: Number },
    hospitalId: { type: String, required: true },
    hospitalName: { type: String, required: true },
    department: { type: String, required: true },
    doctorId: { type: String, required: true },
    doctorName: { type: String, required: true },
    doctorSpecialty: { type: String, required: true },
    date: { type: String, required: true },
    timeSlot: { type: String, required: true },
    reasonForVisit: { type: String, default: 'General Consultation' },
    status: {
      type: String,
      enum: ['CONFIRMED', 'CHECKED_IN', 'COMPLETED', 'CANCELLED'],
      default: 'CONFIRMED',
    },
    tokenNumber: { type: String, default: '' },
    qrPayload: { type: String, required: true },
  },
  { timestamps: true }
);

export const AppointmentModel = mongoose.model<IAppointment>('Appointment', AppointmentSchema);
