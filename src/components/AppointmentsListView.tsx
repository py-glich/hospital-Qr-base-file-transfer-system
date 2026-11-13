import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Building2,
  Stethoscope,
  QrCode,
  User,
  Ticket,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import type { Appointment, Hospital, PaymentReceipt } from '../types/ehr';
import { DOCTORS_CATALOG } from '../data/mockData';
import { PaymentReceiptModal } from './PaymentReceiptModal';

interface AppointmentsListViewProps {
  appointments: Appointment[];
  hospitals: Hospital[];
  currentHospital?: Hospital;
  onUpdateStatus: (id: string, status: Appointment['status']) => void;
  onOpenBookModal?: () => void;
}

export const AppointmentsListView: React.FC<AppointmentsListViewProps> = ({
  appointments,
  hospitals,
  currentHospital,
  onUpdateStatus,
  onOpenBookModal: _onOpenBookModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHospitalFilter, setSelectedHospitalFilter] = useState<string>(
    currentHospital ? currentHospital.id : 'ALL'
  );
  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [qrModalAppointment, setQrModalAppointment] = useState<Appointment | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentReceipt | null>(null);

  const filteredAppointments = appointments.filter((apt) => {
    const matchHospital =
      selectedHospitalFilter === 'ALL' || apt.hospitalId === selectedHospitalFilter;
    const matchDoctor =
      selectedDoctorFilter === 'ALL' || apt.doctorId === selectedDoctorFilter;
    const matchStatus =
      selectedStatusFilter === 'ALL' || apt.status === selectedStatusFilter;

    const query = searchQuery.toLowerCase().trim();
    const matchSearch =
      !query ||
      apt.patientName.toLowerCase().includes(query) ||
      apt.patientCnic.toLowerCase().includes(query) ||
      apt.appointmentNumber.toLowerCase().includes(query) ||
      apt.doctorName.toLowerCase().includes(query);

    return matchHospital && matchDoctor && matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Hospital Appointments & Doctor Scheduling
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 text-[10px] font-bold uppercase tracking-wider">
              {filteredAppointments.length} Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time multi-hospital appointment booking, patient check-ins, and doctor schedule management
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-700 text-xs font-semibold shrink-0">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Staff Portal • View & Verification Only</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patient, CNIC, Apt #..."
            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs outline-none focus:ring-2 focus:ring-sky-600 focus:bg-white transition"
          />
        </div>

        {/* Hospital Filter */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5">
          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={selectedHospitalFilter}
            onChange={(e) => setSelectedHospitalFilter(e.target.value)}
            className="bg-transparent w-full outline-none font-semibold text-slate-800"
          >
            <option value="ALL">All Hospital Hubs</option>
            {hospitals.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
        </div>

        {/* Doctor Filter */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5">
          <Stethoscope className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={selectedDoctorFilter}
            onChange={(e) => setSelectedDoctorFilter(e.target.value)}
            className="bg-transparent w-full outline-none font-semibold text-slate-800"
          >
            <option value="ALL">All Consulting Doctors</option>
            {DOCTORS_CATALOG.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.department})
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="bg-transparent w-full outline-none font-semibold text-slate-800"
          >
            <option value="ALL">All Statuses</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CHECKED_IN">Checked-In</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Appointments Cards / Table */}
      {filteredAppointments.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-700">No Appointments Match Your Filters</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try clearing the search query or click "Book New Doctor Appointment" to schedule a patient visit.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAppointments.map((apt) => {
            const isConfirmed = apt.status === 'CONFIRMED';
            const isCheckedIn = apt.status === 'CHECKED_IN';
            const isCompleted = apt.status === 'COMPLETED';

            return (
              <div
                key={apt.id}
                className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar with Number and Status */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <span className="font-mono text-xs font-black text-slate-900 block">
                        {apt.appointmentNumber}
                      </span>
                      <span className="text-[10px] text-slate-400 block">{apt.createdAt}</span>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isConfirmed
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : isCheckedIn
                          ? 'bg-sky-100 text-sky-800 border border-sky-200'
                          : isCompleted
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {apt.status}
                    </span>
                  </div>

                  {/* Token Number if issued */}
                  {apt.tokenNumber && (
                    <div className="mt-2.5 px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-teal-800 flex items-center gap-1">
                        <Ticket className="w-3.5 h-3.5 text-teal-600" />
                        OPD Queue Token:
                      </span>
                      <span className="font-mono font-black text-xs text-teal-950">
                        {apt.tokenNumber}
                      </span>
                    </div>
                  )}

                  {/* Patient Info */}
                  <div className="py-3 border-b border-slate-100 flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{apt.patientName}</h4>
                      <p className="text-[11px] text-slate-500 font-mono">CNIC: {apt.patientCnic}</p>
                      <p className="text-[11px] text-slate-500">Phone: {apt.patientPhone}</p>
                    </div>
                  </div>

                  {/* Doctor & Hospital */}
                  <div className="py-3 border-b border-slate-100 space-y-1.5 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                      <Stethoscope className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                      <span>{apt.doctorName}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{apt.hospitalName} • {apt.department}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] pt-1">
                      <span className="flex items-center gap-1 font-semibold text-slate-700">
                        <Calendar className="w-3 h-3 text-orange-500" />
                        {apt.date}
                      </span>
                      <span className="flex items-center gap-1 font-bold text-orange-600">
                        <Clock className="w-3 h-3" />
                        {apt.timeSlot}
                      </span>
                    </div>
                  </div>

                  {/* Reason for visit */}
                  <div className="pt-2 text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-700">Reason: </span>
                    <span>{apt.reasonForVisit}</span>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setQrModalAppointment(apt)}
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                      title="View QR Code"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Pass</span>
                    </button>

                    <button
                      onClick={() => {
                        const r: PaymentReceipt = {
                          id: `REC-${apt.id}`,
                          receiptNumber: `REC-2026-${apt.appointmentNumber.slice(-4)}`,
                          tokenNumber: apt.tokenNumber,
                          patientId: apt.patientId || 'PAT-AUTO',
                          patientName: apt.patientName,
                          patientCnic: apt.patientCnic,
                          patientPhone: apt.patientPhone,
                          accountNumber: `ACC-${apt.patientCnic.replace(/\D/g, '').slice(-6) || '236306'}`,
                          hospitalId: apt.hospitalId,
                          hospitalName: apt.hospitalName,
                          doctorId: apt.doctorId,
                          doctorName: apt.doctorName,
                          doctorSpecialty: apt.doctorSpecialty,
                          department: apt.department,
                          appointmentNumber: apt.appointmentNumber,
                          appointmentDate: apt.date,
                          appointmentTime: apt.timeSlot,
                          consultationFee: 3000,
                          serviceCharge: 0,
                          totalAmount: 3000,
                          paymentMethod: 'JazzCash / Bank Transfer',
                          paymentStatus: 'PAID',
                          transactionId: `TXN-${apt.appointmentNumber.slice(-4)}`,
                          qrPayload: `RECEIPT:${apt.appointmentNumber}|PAT:${apt.patientName}|CNIC:${apt.patientCnic}|PAID:3000|STATUS:VERIFIED`,
                          issuedAt: apt.createdAt || new Date().toLocaleString(),
                        };
                        setSelectedReceipt(r);
                      }}
                      className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-1 transition cursor-pointer border border-emerald-200"
                      title="View Official Receipt & Export PDF"
                    >
                      <FileText className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Receipt / PDF</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {apt.status === 'CONFIRMED' && (
                      <button
                        onClick={() => onUpdateStatus(apt.id, 'CHECKED_IN')}
                        className="px-2.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        Check-In
                      </button>
                    )}

                    {apt.status === 'CHECKED_IN' && (
                      <button
                        onClick={() => onUpdateStatus(apt.id, 'COMPLETED')}
                        className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        Complete
                      </button>
                    )}

                    {apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED' && (
                      <button
                        onClick={() => onUpdateStatus(apt.id, 'CANCELLED')}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs transition cursor-pointer"
                        title="Cancel Appointment"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QR PASS MODAL */}
      {qrModalAppointment && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">
                Appointment QR Pass
              </span>
              <button
                onClick={() => setQrModalAppointment(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 inline-block shadow-inner">
              <QRCodeSVG value={qrModalAppointment.qrPayload} size={160} level="M" />
            </div>

            <div>
              <h4 className="font-black text-slate-900 text-base">
                {qrModalAppointment.appointmentNumber}
              </h4>
              <p className="text-xs font-bold text-slate-700">{qrModalAppointment.patientName}</p>
              <p className="text-[11px] text-slate-500">{qrModalAppointment.doctorName}</p>
              <p className="text-[11px] font-bold text-orange-600 mt-1">
                {qrModalAppointment.date} at {qrModalAppointment.timeSlot}
              </p>
            </div>

            <button
              onClick={() => window.print()}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Print Pass
            </button>
          </div>
        </div>
      )}

      {/* PAYMENT RECEIPT MODAL WITH QR & PDF EXPORT */}
      {selectedReceipt && (
        <PaymentReceiptModal
          receipt={selectedReceipt}
          hospital={hospitals.find((h) => h.id === selectedReceipt.hospitalId)}
          onClose={() => setSelectedReceipt(null)}
        />
      )}
    </div>
  );
};
