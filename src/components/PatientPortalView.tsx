import { useState } from 'react';
import {
  FileText,
  Pill,
  ShieldCheck,
  Lock,
  Calendar,
  Building2,
  Stethoscope,
  HeartPulse,
  AlertTriangle,
  QrCode,
  LogOut,
  Clock,
  Printer,
  Plus,
} from 'lucide-react';
import type { Patient, MedicalRecord, AccessLog, Appointment, Hospital } from '../types/ehr';
import { CameraQRScanner } from './CameraQRScanner';
import { QRCodeSVG } from 'qrcode.react';
import { BookAppointmentModal } from './BookAppointmentModal';

interface PatientPortalViewProps {
  patients: Patient[];
  records: MedicalRecord[];
  accessLogs: AccessLog[];
  appointments?: Appointment[];
  hospitals?: Hospital[];
  onLogAccess: (patient: Patient, type: AccessLog['accessType'], notes: string) => void;
  onBookAppointment?: (appointment: Appointment) => void;
}

export const PatientPortalView: React.FC<PatientPortalViewProps> = ({
  patients,
  records,
  accessLogs,
  appointments = [],
  hospitals = [],
  onLogAccess,
  onBookAppointment,
}) => {
  const [authenticatedPatient, setAuthenticatedPatient] = useState<Patient | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [pinPromptPatient, setPinPromptPatient] = useState<Patient | null>(null);
  const [pinError, setPinError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'REPORTS' | 'APPOINTMENTS' | 'PRESCRIPTIONS' | 'QR_CARD' | 'ACCESS_HISTORY'>('REPORTS');
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);

  // Handle QR Scan from Customer
  const handleCustomerQRScan = (decodedText: string) => {
    const found = patients.find(
      (p) => p.qrPayload.toLowerCase() === decodedText.toLowerCase() || p.id.toLowerCase() === decodedText.toLowerCase()
    );

    if (found) {
      setPinPromptPatient(found);
      setPinInput(found.accessPin); // pre-populate for demo ease
      setPinError(null);
    } else {
      alert('Card not recognized in the National Health Exchange Network.');
    }
  };

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinPromptPatient) return;

    if (pinInput === pinPromptPatient.accessPin) {
      setAuthenticatedPatient(pinPromptPatient);
      setPinPromptPatient(null);
      setPinError(null);
      onLogAccess(
        pinPromptPatient,
        'PATIENT_SELF_ACCESS',
        'Patient accessed personal medical records & lab reports via Patient Self-Service Kiosk.'
      );
    } else {
      setPinError('Incorrect 4-digit PIN. Please re-enter your secret PIN.');
    }
  };

  const handleLogout = () => {
    setAuthenticatedPatient(null);
    setPinPromptPatient(null);
    setPinInput('');
  };

  const patientRecords = authenticatedPatient
    ? records.filter((r) => r.patientId === authenticatedPatient.id)
    : [];

  const myAppointments = authenticatedPatient
    ? appointments.filter(
        (a) =>
          a.patientCnic === authenticatedPatient.nationalId ||
          a.patientName.toLowerCase() === authenticatedPatient.name.toLowerCase()
      )
    : [];

  const patientLogs = authenticatedPatient
    ? accessLogs.filter((l) => l.patientId === authenticatedPatient.id)
    : [];

  // All active medications
  const allMedications = patientRecords.flatMap((r) =>
    r.medications.map((m) => ({ ...m, prescribedBy: r.doctorName, hospital: r.hospitalName, date: r.date }))
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* If Not Authenticated: Customer Only Scanner Kiosk */}
      {!authenticatedPatient ? (
        <div className="space-y-6">
          {/* Welcoming Patient Banner */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xl shadow-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-teal-50 to-transparent rounded-full -mr-20 -mt-20 pointer-events-none"></div>

            <div className="relative z-10 max-w-xl">
              <span className="px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 mb-3">
                <ShieldCheck className="w-4 h-4 text-teal-700" />
                Patient Self-Service Health Kiosk
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
                Scan Your Health Card to Access Your Medical Reports
              </h2>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Apna printed ya digital health QR code webcam/phone camera ke samnay layein. National Health Network se aapki reports, prescriptions aur lab findings instant display ho jayengi.
              </p>
            </div>

            <div className="bg-teal-700 text-white p-5 rounded-2xl shadow-lg shadow-teal-700/20 text-center shrink-0 w-full md:w-64 border border-teal-600">
              <QrCode className="w-12 h-12 mx-auto text-teal-200 mb-2" />
              <p className="text-xs font-semibold uppercase tracking-wider text-teal-100">Zero Password Hassle</p>
              <p className="text-[11px] text-teal-200 mt-1">100% Encrypted & Consent Secured</p>
            </div>
          </div>

          {/* Camera Scanner for Customer */}
          <CameraQRScanner onScanSuccess={handleCustomerQRScan} patients={patients} />

          {/* PIN Verification Modal */}
          {pinPromptPatient && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 text-center">
                <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center mx-auto text-teal-700 mb-4">
                  <Lock className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Verify Your Identity</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Card scanned for <span className="font-semibold text-slate-900">{pinPromptPatient.name}</span>.
                  Enter your 4-digit security PIN to unlock your personal health records.
                </p>

                <form onSubmit={handleVerifyPin} className="mt-5 space-y-4">
                  {pinError && (
                    <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded-lg">{pinError}</p>
                  )}
                  <input
                    type="password"
                    maxLength={4}
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl py-3 text-center text-2xl font-mono tracking-widest text-teal-900 outline-none focus:ring-2 focus:ring-teal-700"
                    placeholder="••••"
                    autoFocus
                  />
                  <div className="text-[11px] text-slate-500">
                    (Demo PIN is: <span className="font-mono font-bold text-teal-700">{pinPromptPatient.accessPin}</span>)
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPinPromptPatient(null)}
                      className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold shadow-md shadow-teal-700/20"
                    >
                      Access Reports
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Authenticated Customer View */
        <div className="space-y-6">
          {/* Customer Top Bar */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-700 to-teal-900 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-teal-700/20">
                {authenticatedPatient.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xl font-bold text-slate-800">{authenticatedPatient.name}</h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-1">
                    <HeartPulse className="w-3.5 h-3.5" />
                    {authenticatedPatient.bloodGroup}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-mono font-medium">
                    {authenticatedPatient.id}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  CNIC: <span className="text-slate-700 font-mono">{authenticatedPatient.nationalId}</span> • Age: {authenticatedPatient.age} Yrs • Phone: {authenticatedPatient.phone}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end md:self-center">
              <button
                onClick={() => window.print()}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Reports
              </button>
              <button
                onClick={handleLogout}
                className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Exit Portal
              </button>
            </div>
          </div>

          {/* Quick Sub-navigation */}
          <div className="flex space-x-1.5 overflow-x-auto border-b border-slate-200 pb-2 scrollbar-none w-full">
            <button
              onClick={() => setActiveTab('REPORTS')}
              className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shrink-0 min-h-[40px] ${
                activeTab === 'REPORTS'
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Medical Records & Lab Reports ({patientRecords.length})
            </button>
            <button
              onClick={() => setActiveTab('APPOINTMENTS')}
              className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shrink-0 min-h-[40px] ${
                activeTab === 'APPOINTMENTS'
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Doctor Appointments ({myAppointments.length})
            </button>
            <button
              onClick={() => setActiveTab('PRESCRIPTIONS')}
              className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shrink-0 min-h-[40px] ${
                activeTab === 'PRESCRIPTIONS'
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Pill className="w-3.5 h-3.5" />
              Prescriptions & Medications ({allMedications.length})
            </button>
            <button
              onClick={() => setActiveTab('QR_CARD')}
              className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shrink-0 min-h-[40px] ${
                activeTab === 'QR_CARD'
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              My Digital Health Card
            </button>
            <button
              onClick={() => setActiveTab('ACCESS_HISTORY')}
              className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shrink-0 min-h-[40px] ${
                activeTab === 'ACCESS_HISTORY'
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Who Viewed My Records ({patientLogs.length})
            </button>
          </div>

          {/* TAB 1: REPORTS */}
          {activeTab === 'REPORTS' && (
            <div className="space-y-4">
              {patientRecords.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-slate-500">
                  No medical reports found.
                </div>
              ) : (
                patientRecords.map((rec) => (
                  <div
                    key={rec.id}
                    className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5" />
                          {rec.hospitalName}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
                          {rec.type}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {rec.date} • {rec.id}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <Stethoscope className="w-4 h-4 text-teal-700" />
                        Attending Doctor: <span className="font-semibold text-slate-800">{rec.doctorName}</span> ({rec.doctorSpecialty})
                      </div>
                      <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">
                          Diagnosis & Clinical Finding:
                        </span>
                        <p className="text-sm font-semibold text-slate-800">{rec.diagnosis}</p>
                        {rec.doctorNotes && (
                          <p className="text-xs text-slate-600 italic mt-1.5">"{rec.doctorNotes}"</p>
                        )}
                      </div>
                    </div>

                    {/* Lab findings */}
                    {rec.labFindings && rec.labFindings.length > 0 && (
                      <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-100 text-xs">
                        <span className="font-bold text-teal-900 block mb-1">Official Lab Test Findings:</span>
                        <ul className="list-disc list-inside text-slate-700 space-y-0.5">
                          {rec.labFindings.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB: SCHEDULED DOCTOR APPOINTMENTS */}
          {activeTab === 'APPOINTMENTS' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-slate-200">
                <div>
                  <h4 className="text-base font-bold text-slate-900">My Doctor Appointments</h4>
                  <p className="text-xs text-slate-500">
                    Confirmed consultation slots across multi-hospital network
                  </p>
                </div>
                <button
                  onClick={() => setIsBookModalOpen(true)}
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-[#f37335] hover:from-orange-600 text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  Book New Doctor
                </button>
              </div>

              {myAppointments.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 space-y-2">
                  <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="font-semibold text-sm">No scheduled appointments found.</p>
                  <p className="text-xs text-slate-400">Click "Book New Doctor" to schedule a visit with any hospital specialist.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myAppointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <span className="font-mono text-xs font-bold text-slate-900">
                          {apt.appointmentNumber}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          {apt.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-white border border-slate-200 rounded-xl">
                          <QRCodeSVG value={apt.qrPayload} size={54} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-bold text-slate-900 text-sm truncate">{apt.doctorName}</h5>
                          <p className="text-xs text-sky-700 font-medium truncate">{apt.doctorSpecialty}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{apt.hospitalName} • {apt.department}</p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1 font-semibold text-slate-700">
                          <Calendar className="w-3.5 h-3.5 text-orange-500" />
                          <span>{apt.date}</span>
                        </div>
                        <div className="flex items-center gap-1 font-bold text-orange-600">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{apt.timeSlot}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PRESCRIPTIONS */}
          {activeTab === 'PRESCRIPTIONS' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <h4 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Pill className="w-5 h-5 text-teal-700" />
                Active Medicines & Prescriptions Across All Hospitals
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {allMedications.map((med, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h5 className="font-bold text-slate-800 text-sm">{med.name}</h5>
                        <p className="text-xs text-teal-800 font-medium">{med.frequency} • {med.duration}</p>
                      </div>
                      <span className="px-2 py-0.5 bg-white border border-slate-200 rounded text-xs font-mono font-bold text-slate-700">
                        {med.dosage}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 border-t border-slate-200/60 pt-2 flex justify-between">
                      <span>Prescribed at: {med.hospital.split(' ')[0]}</span>
                      <span>By: {med.prescribedBy}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: QR CARD */}
          {activeTab === 'QR_CARD' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-6">
              <div className="bg-white p-4 rounded-2xl border-2 border-teal-600 shadow-md shrink-0">
                <QRCodeSVG value={authenticatedPatient.qrPayload} size={180} level="H" />
                <p className="text-[10px] text-center font-mono font-bold text-slate-700 mt-2">
                  {authenticatedPatient.id}
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="text-lg font-bold text-slate-800">Your Official Health QR Code</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Jab bhi aap kisi bhi registered hospital (Shifa, Aga Khan, Mayo, etc.) jayein, reception ya doctor ko yeh QR code scan karwayein. Aapki medical summary foran unlock ho jaye gi.
                </p>
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                  <span className="font-bold flex items-center gap-1 mb-0.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    Security Reminder:
                  </span>
                  Kisi anjan shakhs ke sath apna 4-digit PIN share na karein.
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ACCESS HISTORY */}
          {activeTab === 'ACCESS_HISTORY' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div>
                <h4 className="text-base font-bold text-slate-800">Who Accessed My Medical Records?</h4>
                <p className="text-xs text-slate-500">
                  Transparency log showing hospitals and doctors who viewed or updated your health profile
                </p>
              </div>
              <div className="divide-y divide-slate-100">
                {patientLogs.map((log) => (
                  <div key={log.id} className="py-3 flex items-start justify-between gap-4 text-xs">
                    <div>
                      <p className="font-semibold text-slate-800">
                        {log.hospitalName} ({log.doctorName})
                      </p>
                      <p className="text-slate-500 text-[11px] mt-0.5">{log.notes}</p>
                    </div>
                    <span className="font-mono text-slate-400 shrink-0">{log.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Book Appointment Modal for Patient */}
          {isBookModalOpen && (
            <BookAppointmentModal
              hospitals={hospitals}
              onBookAppointment={(apt) => {
                onBookAppointment?.(apt);
                setIsBookModalOpen(false);
              }}
              onClose={() => setIsBookModalOpen(false)}
            />
          )}
        </div>
      )}
    </div>
  );
};
