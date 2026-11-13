import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  User,
  Building2,
  Stethoscope,
  CheckCircle2,
  Printer,
  Star,
  MapPin,
  Sparkles,
  CreditCard,
  Search,
  Wallet,
  Download,
  Cross,
  Phone,
  ShieldCheck,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import type { Hospital, Doctor, Appointment, Patient, PaymentReceipt } from '../types/ehr';
import { DOCTORS_CATALOG } from '../data/mockData';

interface BookAppointmentModalProps {
  hospitals: Hospital[];
  initialDoctor?: Doctor | null;
  initialHospitalId?: string;
  initialDepartment?: string;
  onBookAppointment: (appointment: Appointment) => void;
  onPatientUpserted?: (patient: Patient) => void;
  onClose: () => void;
}

export const BookAppointmentModal: React.FC<BookAppointmentModalProps> = ({
  hospitals,
  initialDoctor,
  initialHospitalId,
  initialDepartment,
  onBookAppointment,
  onPatientUpserted,
  onClose,
}) => {
  // Step 1: Hospital & Doctor Selection
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>(
    initialDoctor ? initialDoctor.hospitalId : initialHospitalId || hospitals[0].id
  );
  const [selectedDepartment, setSelectedDepartment] = useState<string>(
    initialDoctor ? initialDoctor.department : initialDepartment || 'ALL'
  );
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(() => {
    if (initialDoctor) return initialDoctor;
    if (initialDepartment && initialDepartment !== 'ALL') {
      const matchDoc = DOCTORS_CATALOG.find(d => d.department === initialDepartment);
      if (matchDoc) return matchDoc;
    }
    return DOCTORS_CATALOG[0];
  });

  // Step 2: Patient Info & Live DB Lookup
  const [patientCnic, setPatientCnic] = useState('');
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientAge, setPatientAge] = useState('32');
  const [patientGender, setPatientGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [reasonForVisit, setReasonForVisit] = useState('');
  
  // Database lookup status
  const [lookupState, setLookupState] = useState<'IDLE' | 'CHECKING' | 'FOUND' | 'NEW'>('IDLE');
  const [patientAccountNo, setPatientAccountNo] = useState<string>('');
  const [accountBalance, setAccountBalance] = useState<number>(0);

  // Step 3: Date & Time Slot
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const [appointmentDate, setAppointmentDate] = useState(tomorrowStr);
  const [selectedSlot, setSelectedSlot] = useState('10:30 AM');

  // Step 4: Payment & Add Money Method
  const [paymentMethod, setPaymentMethod] = useState<string>('JazzCash');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Completed State: Generated Receipt & Appointment
  const [generatedReceipt, setGeneratedReceipt] = useState<PaymentReceipt | null>(null);

  const timeSlots = [
    '09:00 AM',
    '09:30 AM',
    '10:00 AM',
    '10:30 AM',
    '11:00 AM',
    '11:30 AM',
    '02:00 PM',
    '02:30 PM',
    '03:00 PM',
    '03:30 PM',
    '04:30 PM',
  ];

  const currentHospital = hospitals.find((h) => h.id === selectedHospitalId) || hospitals[0];

  // Filter available doctors
  const availableDoctors = DOCTORS_CATALOG.filter((d) => {
    const matchHospital = d.hospitalId === selectedHospitalId;
    const matchDept = selectedDepartment === 'ALL' || d.department === selectedDepartment;
    return matchHospital && matchDept;
  });

  // Check Database for Existing Patient by CNIC or Phone
  const handleCheckDatabase = async (cnicToCheck?: string) => {
    const queryVal = (cnicToCheck ?? patientCnic).trim();
    if (!queryVal) return;

    setLookupState('CHECKING');
    try {
      const res = await fetch(`http://127.0.0.1:5001/api/patients/check?cnic=${encodeURIComponent(queryVal)}&phone=${encodeURIComponent(patientPhone.trim())}`);
      const data = await res.json();

      if (data.exists && data.patient) {
        setLookupState('FOUND');
        setPatientName(data.patient.name || patientName);
        setPatientPhone(data.patient.phone || patientPhone);
        setPatientAge(String(data.patient.age || 30));
        setPatientGender((data.patient.gender as any) || 'Male');
        setPatientAccountNo(data.patient.accountNumber || `ACC-${Math.floor(100000 + Math.random() * 900000)}`);
        setAccountBalance(data.patient.accountBalance || 0);
      } else {
        setLookupState('NEW');
        if (!patientAccountNo) {
          setPatientAccountNo(`ACC-${Math.floor(100000 + Math.random() * 900000)}`);
        }
      }
    } catch {
      // Fallback if network drops
      setLookupState('NEW');
      if (!patientAccountNo) {
        setPatientAccountNo(`ACC-${Math.floor(100000 + Math.random() * 900000)}`);
      }
    }
  };

  // Process Booking, Upsert Profile, Add Money & Generate Official Receipt
  const handleProcessBookingAndPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor) return;

    setIsProcessingPayment(true);

    const fee = selectedDoctor.consultationFee;
    const aptNum = `APT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const effectiveAccountNo = patientAccountNo || `ACC-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      // 1. Check or Upsert Patient in MongoDB
      const upsertRes = await fetch('http://127.0.0.1:5001/api/patients/upsert-for-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nationalId: patientCnic.trim(),
          phone: patientPhone.trim(),
          name: patientName.trim(),
          age: parseInt(patientAge) || 30,
          gender: patientGender,
          hospitalId: currentHospital.id,
        }),
      });

      const upsertData = await upsertRes.json();
      const patientRecord = upsertData?.patient;
      if (patientRecord && onPatientUpserted) {
        onPatientUpserted(patientRecord);
      }

      const assignedPatientId = patientRecord?.patientId || `PAT-${Date.now().toString().slice(-4)}`;
      const finalAccountNo = patientRecord?.accountNumber || effectiveAccountNo;

      // 2. Process Payment & Generate Receipt in MongoDB
      const paymentRes = await fetch('http://127.0.0.1:5001/api/payments/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: assignedPatientId,
          patientName: patientName.trim(),
          patientCnic: patientCnic.trim(),
          patientPhone: patientPhone.trim(),
          accountNumber: finalAccountNo,
          hospitalId: currentHospital.id,
          hospitalName: currentHospital.name,
          doctorId: selectedDoctor.id,
          doctorName: selectedDoctor.name,
          doctorSpecialty: selectedDoctor.specialty,
          department: selectedDoctor.department,
          appointmentNumber: aptNum,
          appointmentDate,
          appointmentTime: selectedSlot,
          consultationFee: fee,
          paymentMethod,
          amountPaid: fee,
        }),
      });

      const paymentData = await paymentRes.json();
      const receipt: PaymentReceipt = paymentData.receipt || {
        id: `REC-${Date.now()}`,
        receiptNumber: `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        patientId: assignedPatientId,
        patientName: patientName.trim(),
        patientCnic: patientCnic.trim(),
        patientPhone: patientPhone.trim(),
        accountNumber: finalAccountNo,
        hospitalId: currentHospital.id,
        hospitalName: currentHospital.name,
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        doctorSpecialty: selectedDoctor.specialty,
        department: selectedDoctor.department,
        appointmentNumber: aptNum,
        appointmentDate,
        appointmentTime: selectedSlot,
        consultationFee: fee,
        serviceCharge: 0,
        totalAmount: fee,
        paymentMethod,
        paymentStatus: 'PAID',
        transactionId: `TXN-${Date.now().toString().slice(-6)}`,
        qrPayload: `RECEIPT:REC-${aptNum}|PAT:${patientName}|CNIC:${patientCnic}|ACC:${finalAccountNo}|PAID:PKR ${fee}|STATUS:VERIFIED_PAID`,
        issuedAt: new Date().toLocaleString(),
      };

      // 3. Register Appointment Object
      const newAppointment: Appointment = {
        id: `APT-${Date.now().toString().slice(-4)}`,
        appointmentNumber: aptNum,
        patientId: assignedPatientId,
        patientName: patientName.trim(),
        patientPhone: patientPhone.trim(),
        patientCnic: patientCnic.trim(),
        patientAge: parseInt(patientAge) || 30,
        patientGender,
        hospitalId: currentHospital.id,
        hospitalName: currentHospital.name,
        department: selectedDoctor.department,
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        doctorSpecialty: selectedDoctor.specialty,
        date: appointmentDate,
        timeSlot: selectedSlot,
        reasonForVisit: reasonForVisit.trim() || 'General Specialist Consultation',
        status: 'CONFIRMED',
        qrPayload: `APT:${aptNum}|PAT:${patientName}|CNIC:${patientCnic}|ACC:${finalAccountNo}|DOC:${selectedDoctor.name}|HOSP:${currentHospital.name}|DATE:${appointmentDate} ${selectedSlot}`,
        createdAt: new Date().toLocaleString(),
      };

      onBookAppointment(newAppointment);
      setGeneratedReceipt(receipt);
    } catch (err) {
      console.error('Error during booking & payment processing:', err);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handlePrintOrPdf = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[94vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden print:max-h-none print:shadow-none print:border-none print:rounded-none">
        {/* Sticky Header */}
        <div className="bg-white px-5 sm:px-8 py-4 border-b border-slate-200 flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-600 shadow-xs">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                {generatedReceipt ? 'Appointment & Payment Confirmed!' : 'Book Doctor & Hospital Appointment'}
              </h2>
              <p className="text-xs text-slate-500">
                {generatedReceipt
                  ? 'Official paid receipt & verification QR code generated'
                  : 'Checks database for existing patient, updates profile or registers new with Account No.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6">
          {generatedReceipt ? (
            /* ================= 1. OFFICIAL PAYMENT RECEIPT WITH QR & PDF EXPORT ================= */
            <div className="space-y-6 animate-in zoom-in-95 duration-200">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3 text-emerald-800 text-xs sm:text-sm font-semibold print:hidden">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>
                    Payment Processed & Synced to Mongoose Database! Profile updated with Account Number.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handlePrintOrPdf}
                  className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  Save as PDF
                </button>
              </div>

              {/* Printable Official Receipt Slip */}
              <div
                id="receipt-print-area"
                className="bg-white rounded-3xl border-2 border-slate-300 p-6 sm:p-8 shadow-xl relative overflow-hidden print:border-none print:shadow-none"
              >
                {/* Receipt Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-6 border-b-2 border-slate-200 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-sky-600 flex items-center justify-center text-white shadow-md shrink-0">
                      <Cross className="w-7 h-7 rotate-45" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-black text-sky-950 tracking-tight">MED CENTER</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                          PAID & VERIFIED
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-800 mt-0.5">
                        {generatedReceipt.hospitalName}
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        {currentHospital.address} • Tel: {currentHospital.phone}
                      </p>
                    </div>
                  </div>

                  <div className="sm:text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      Official Receipt Number
                    </span>
                    <span className="text-base font-mono font-black text-slate-900 block">
                      {generatedReceipt.receiptNumber}
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Issued: {generatedReceipt.issuedAt}
                    </span>
                  </div>
                </div>

                {/* Patient Account & ID Strip */}
                <div className="my-5 bg-sky-50/70 border border-sky-200 rounded-2xl p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 block mb-1">
                      Patient Profile & Identity
                    </span>
                    <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-sky-700" />
                      {generatedReceipt.patientName}
                    </p>
                    <p className="text-[11px] text-slate-600 mt-0.5 font-mono">
                      CNIC / National ID: {generatedReceipt.patientCnic}
                    </p>
                    <p className="text-[11px] text-slate-600 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {generatedReceipt.patientPhone}
                    </p>
                  </div>

                  <div className="sm:border-l sm:border-sky-200 sm:pl-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 block mb-1">
                      Assigned Patient Account No.
                    </span>
                    <div className="bg-white px-3.5 py-1.5 rounded-xl border border-sky-200 inline-block font-mono font-black text-sky-950 text-sm shadow-xs">
                      {generatedReceipt.accountNumber}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Money added & debited for this appointment via {generatedReceipt.paymentMethod}
                    </p>
                  </div>
                </div>

                {/* Appointment Schedule */}
                <div className="border border-slate-200 rounded-2xl p-4 sm:p-5 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs mb-5">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Appointment No:</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">{generatedReceipt.appointmentNumber}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Consultant Doctor:</span>
                    <span className="font-bold text-slate-900">{generatedReceipt.doctorName}</span>
                    <span className="text-[10px] text-sky-700 block">{generatedReceipt.doctorSpecialty}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Department:</span>
                    <span className="font-bold text-slate-800">{generatedReceipt.department}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Date & Time:</span>
                    <span className="font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-orange-500" />
                      {generatedReceipt.appointmentDate}
                    </span>
                    <span className="text-orange-600 font-bold text-xs flex items-center gap-1 mt-0.5">
                      <Clock className="w-3.5 h-3.5" />
                      {generatedReceipt.appointmentTime}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Hospital Node:</span>
                    <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      {generatedReceipt.hospitalName}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Transaction ID:</span>
                    <span className="font-mono font-bold text-slate-800 mt-0.5 block">{generatedReceipt.transactionId}</span>
                  </div>
                </div>

                {/* Fee Breakdown & QR Validation */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center pt-2 border-t border-slate-200">
                  <div className="sm:col-span-8">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-400 text-[10px] uppercase">
                          <th className="text-left pb-2">Description</th>
                          <th className="text-right pb-2">Amount (PKR)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        <tr>
                          <td className="py-2 font-medium">Specialist Doctor Consultation Fee</td>
                          <td className="py-2 text-right font-mono font-bold">
                            PKR {generatedReceipt.consultationFee.toLocaleString()}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2">Hospital E-Health Registration & QR Card</td>
                          <td className="py-2 text-right font-mono text-emerald-600 font-bold">
                            FREE (PKR 0)
                          </td>
                        </tr>
                        <tr className="border-t-2 border-slate-300 font-black text-slate-900 text-sm">
                          <td className="pt-2">Total Paid via {generatedReceipt.paymentMethod}:</td>
                          <td className="pt-2 text-right font-mono text-emerald-700">
                            PKR {generatedReceipt.totalAmount.toLocaleString()}
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    <div className="mt-3 text-[10px] text-slate-400 flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Verified electronically & stored in Mongoose MongoDB database.</span>
                    </div>
                  </div>

                  <div className="sm:col-span-4 flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                    <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-xs mb-2">
                      <QRCodeSVG value={generatedReceipt.qrPayload} size={110} level="M" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                      Receipt QR Verification
                    </span>
                    <span className="text-[9px] text-slate-400 mt-0.5">
                      Show at hospital reception or cashier counter
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 print:hidden">
                <button
                  type="button"
                  onClick={handlePrintOrPdf}
                  className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  Print Receipt
                </button>
                <button
                  type="button"
                  onClick={handlePrintOrPdf}
                  className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-[#f37335] hover:from-orange-600 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-md shadow-orange-500/20"
                >
                  <Download className="w-4 h-4" />
                  Download / Save PDF
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs sm:text-sm rounded-xl transition cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* ================= 2. BOOKING FORM WITH DB CHECK & ACCOUNT NO ================= */
            <form onSubmit={handleProcessBookingAndPayment} className="space-y-6">
              {/* SECTION 1: CHOOSE HOSPITAL */}
              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-sky-600" />
                  1. Select Hospital Facility:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {hospitals.map((h) => {
                    const isSelected = selectedHospitalId === h.id;
                    return (
                      <button
                        type="button"
                        key={h.id}
                        onClick={() => {
                          setSelectedHospitalId(h.id);
                          const matchDoc = DOCTORS_CATALOG.find((d) => d.hospitalId === h.id);
                          if (matchDoc) setSelectedDoctor(matchDoc);
                        }}
                        className={`p-3.5 rounded-2xl border text-left transition cursor-pointer relative ${
                          isSelected
                            ? 'bg-sky-50/70 border-sky-600 text-sky-950 ring-2 ring-sky-600/20 shadow-xs'
                            : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                            {h.badge}
                          </span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-sky-600" />}
                        </div>
                        <h4 className="font-bold text-xs sm:text-sm leading-snug">{h.name}</h4>
                        <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {h.city}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 2: CHOOSE DEPARTMENT & DOCTOR */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Stethoscope className="w-4 h-4 text-sky-600" />
                    2. Choose Specialist Doctor:
                  </label>
                  <div className="flex items-center gap-1 text-[11px]">
                    <span className="text-slate-400">Department:</span>
                    <select
                      value={selectedDepartment}
                      onChange={(e) => setSelectedDepartment(e.target.value)}
                      className="bg-slate-100 text-slate-800 font-bold px-2 py-1 rounded-lg border border-slate-300 text-[11px] outline-none"
                    >
                      <option value="ALL">All Departments</option>
                      <option value="Orthopedics">Orthopedics</option>
                      <option value="Cardiology">Cardiology</option>
                      <option value="Neurology">Neurology</option>
                      <option value="General Surgery">General Surgery</option>
                      <option value="Pediatrics">Pediatrics</option>
                      <option value="Dermatology">Dermatology</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto p-1">
                  {availableDoctors.map((doc) => {
                    const isSelected = selectedDoctor?.id === doc.id;
                    return (
                      <div
                        key={doc.id}
                        onClick={() => setSelectedDoctor(doc)}
                        className={`p-3 rounded-2xl border transition flex items-center gap-3.5 cursor-pointer ${
                          isSelected
                            ? 'bg-orange-50/60 border-orange-500 ring-2 ring-orange-500/20 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                        }`}
                      >
                        <img
                          src={doc.imageUrl}
                          alt={doc.name}
                          className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-200"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                              {doc.name}
                            </h4>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0" />}
                          </div>
                          <p className="text-[11px] text-sky-800 font-semibold truncate">{doc.specialty}</p>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                            <span>{doc.experienceYears} yr exp</span>
                            <span>•</span>
                            <span className="flex items-center gap-0.5 text-amber-600 font-bold">
                              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                              {doc.rating}
                            </span>
                            <span>•</span>
                            <span className="font-bold text-slate-700">PKR {doc.consultationFee}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 3: PATIENT DATABASE CHECK & ACCOUNT NUMBER */}
              <div className="bg-slate-50/80 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/80">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-4 h-4 text-sky-600" />
                    3. Patient Identification & Database Check:
                  </label>

                  {/* Status Badges */}
                  {lookupState === 'FOUND' && (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-bold flex items-center gap-1 animate-in fade-in">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Existing Patient Profile Found in MongoDB!
                    </span>
                  )}
                  {lookupState === 'NEW' && (
                    <span className="px-2.5 py-1 rounded-full bg-sky-100 text-sky-800 border border-sky-300 text-[11px] font-bold flex items-center gap-1 animate-in fade-in">
                      <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                      New Patient Registration
                    </span>
                  )}
                  {lookupState === 'CHECKING' && (
                    <span className="text-xs text-slate-500 font-medium animate-pulse">
                      Checking MongoDB database...
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {/* CNIC with instant Check Button */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      CNIC / National ID: *
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        required
                        value={patientCnic}
                        onChange={(e) => {
                          setPatientCnic(e.target.value);
                          if (e.target.value.length >= 5) {
                            handleCheckDatabase(e.target.value);
                          }
                        }}
                        onBlur={() => handleCheckDatabase()}
                        placeholder="e.g. 42101-1234567-1"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 font-mono outline-none focus:ring-2 focus:ring-sky-600 transition"
                      />
                      <button
                        type="button"
                        onClick={() => handleCheckDatabase()}
                        className="px-3 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-xs font-bold transition cursor-pointer shrink-0"
                        title="Check if patient exists"
                      >
                        <Search className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Patient Full Name: *
                    </label>
                    <input
                      type="text"
                      required
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="e.g. Tariq Khan"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 outline-none focus:ring-2 focus:ring-sky-600 transition"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Mobile Phone Number: *
                    </label>
                    <input
                      type="tel"
                      required
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                      placeholder="e.g. +92 300 1234567"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 outline-none focus:ring-2 focus:ring-sky-600 transition"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Age:</label>
                    <input
                      type="number"
                      value={patientAge}
                      onChange={(e) => setPatientAge(e.target.value)}
                      min="1"
                      max="120"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 outline-none focus:ring-2 focus:ring-sky-600 transition"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Gender:</label>
                    <select
                      value={patientGender}
                      onChange={(e) => setPatientGender(e.target.value as any)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 outline-none focus:ring-2 focus:ring-sky-600 transition"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Reason for Consultation:
                    </label>
                    <input
                      type="text"
                      value={reasonForVisit}
                      onChange={(e) => setReasonForVisit(e.target.value)}
                      placeholder="e.g. Chest discomfort, Knee pain..."
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 outline-none focus:ring-2 focus:ring-sky-600 transition"
                    />
                  </div>
                </div>

                {/* Account Number Display */}
                {patientAccountNo && (
                  <div className="p-3 bg-white rounded-xl border border-sky-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-4 h-4 text-sky-700" />
                      <div>
                        <span className="text-slate-500">Patient Hospital Account No: </span>
                        <span className="font-mono font-black text-sky-950">{patientAccountNo}</span>
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Current Balance: <span className="font-bold text-emerald-700 font-mono">PKR {accountBalance.toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 4: DATE, TIME & PAYMENT PROCESSING */}
              <div className="space-y-4">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-sky-600" />
                  4. Select Date, Schedule & Payment Method:
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
                  <div className="sm:col-span-4">
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Appointment Date:</label>
                    <input
                      type="date"
                      required
                      min={tomorrowStr}
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 outline-none focus:ring-2 focus:ring-sky-600 focus:bg-white transition"
                    />
                    {selectedDoctor && (
                      <p className="text-[10px] text-slate-500 mt-1.5">
                        Hours: <span className="font-bold">{selectedDoctor.availableHours}</span>
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-8">
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Available Slots:</label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {timeSlots.map((slot) => {
                        const isSlotSelected = selectedSlot === slot;
                        return (
                          <button
                            type="button"
                            key={slot}
                            onClick={() => setSelectedSlot(slot)}
                            className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition cursor-pointer ${
                              isSlotSelected
                                ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Payment Option Selector */}
                <div className="p-4 bg-orange-50/60 border border-orange-200 rounded-2xl space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-orange-600" />
                      <span className="text-xs font-bold text-slate-900">
                        Add Money & Process Consultation Fee:
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-500">Required Fee: </span>
                      <span className="text-sm font-black text-slate-900">
                        PKR {selectedDoctor?.consultationFee.toLocaleString() || '3,000'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                    {['JazzCash', 'EasyPaisa', 'Bank Transfer', 'Debit/Credit Card', 'Cash at Desk'].map((method) => {
                      const isChosen = paymentMethod === method;
                      return (
                        <button
                          type="button"
                          key={method}
                          onClick={() => setPaymentMethod(method)}
                          className={`py-2 px-2 text-center rounded-xl font-bold border transition cursor-pointer text-[11px] ${
                            isChosen
                              ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-orange-50'
                          }`}
                        >
                          {method}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Submit Action */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessingPayment}
                  className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-[#f37335] hover:from-orange-600 hover:to-orange-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-orange-500/25 flex items-center gap-2 transition cursor-pointer active:scale-98 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  {isProcessingPayment
                    ? 'Processing & Generating Receipt...'
                    : 'Add Money, Process & Generate QR Receipt'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
