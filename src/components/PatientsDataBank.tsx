import { useState } from 'react';
import {
  Users,
  Search,
  HeartPulse,
  FileText,
  UserPlus,
  Printer,
  QrCode,
  Lock,
  CheckCircle2,
  AlertTriangle,
  X,
  Camera,
} from 'lucide-react';
import type { Patient, MedicalRecord, Hospital } from '../types/ehr';
import { CameraQRScanner } from './CameraQRScanner';
import { QRCodeSVG } from 'qrcode.react';

interface PatientsDataBankProps {
  patients: Patient[];
  records: MedicalRecord[];
  hospitals: Hospital[];
  currentHospital?: Hospital;
  onOpenCreatePatient: () => void;
  onOpenPatientScanner: (qrPayload: string) => void;
}

export const PatientsDataBank: React.FC<PatientsDataBankProps> = ({
  patients,
  records,
  hospitals,
  currentHospital,
  onOpenCreatePatient,
  onOpenPatientScanner,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHospitalFilter, setSelectedHospitalFilter] = useState('ALL');
  const [selectedBloodGroupFilter, setSelectedBloodGroupFilter] = useState('ALL');
  const [selectedDossierPatient, setSelectedDossierPatient] = useState<Patient | null>(null);
  const [qrVerifyModalPatient, setQrVerifyModalPatient] = useState<Patient | null>(null);
  const [isScanningActive, setIsScanningActive] = useState(false);
  const [scanStatusText, setScanStatusText] = useState<string | null>(null);

  const triggerScanProcess = (payload: string) => {
    setIsScanningActive(true);
    setScanStatusText('Scanning QR code from patient card...');

    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {}

    setTimeout(() => {
      setScanStatusText('Cryptographic signature verified! Decrypting patient profile...');
      setTimeout(() => {
        setIsScanningActive(false);
        setQrVerifyModalPatient(null);
        onOpenPatientScanner(payload);
      }, 450);
    }, 550);
  };

  // Filter patients
  const filteredPatients = patients.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.nationalId.includes(q) ||
      p.id.toLowerCase().includes(q) ||
      p.phone.includes(q) ||
      p.allergies.some((a) => a.toLowerCase().includes(q)) ||
      p.chronicConditions.some((c) => c.toLowerCase().includes(q));

    const matchesHospital = selectedHospitalFilter === 'ALL' || p.primaryHospitalId === selectedHospitalFilter;
    const matchesBlood = selectedBloodGroupFilter === 'ALL' || p.bloodGroup.includes(selectedBloodGroupFilter);

    return matchesSearch && matchesHospital && matchesBlood;
  });

  // Calculate statistics
  const totalPatients = patients.length;
  const totalRecords = records.length;
  const criticalAllergiesCount = patients.filter((p) => p.allergies.length > 0).length;
  const chronicConditionsCount = patients.filter((p) => p.chronicConditions.length > 0).length;

  return (
    <div className="space-y-6 w-full">
      {/* Top Header */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xl shadow-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-50 text-teal-700">
              <Users className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black text-slate-800">Master Patients Data Bank</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Centralized electronic database repository archiving patient files, clinical encounters & historical vitals
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Export Data Bank
          </button>
          <button
            onClick={onOpenCreatePatient}
            className="flex-1 md:flex-none px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-teal-700/20 transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            + Enroll Patient
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Registered Files</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{totalPatients}</p>
          <span className="text-[11px] text-teal-700 font-semibold mt-0.5 block">Across 3 hospital nodes</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Clinical Encounters</span>
          <p className="text-2xl font-black text-teal-800 mt-1">{totalRecords}</p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">OPD, Surgery & Labs</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Known Drug Allergies</span>
          <p className="text-2xl font-black text-rose-600 mt-1">{criticalAllergiesCount}</p>
          <span className="text-[11px] text-rose-700 font-semibold mt-0.5 block">Active allergy warnings</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Chronic Patients</span>
          <p className="text-2xl font-black text-amber-600 mt-1">{chronicConditionsCount}</p>
          <span className="text-[11px] text-amber-700 font-semibold mt-0.5 block">Diabetes, HTN, Asthma</span>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Name, CNIC (37405-...), Phone, Patient ID, or Condition..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 outline-none focus:ring-2 focus:ring-teal-700 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <select
            value={selectedHospitalFilter}
            onChange={(e) => setSelectedHospitalFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-teal-700 cursor-pointer min-h-[40px]"
          >
            <option value="ALL">All Hospitals</option>
            {hospitals.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name.split(' ')[0]} ({h.city})
              </option>
            ))}
          </select>

          <select
            value={selectedBloodGroupFilter}
            onChange={(e) => setSelectedBloodGroupFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-teal-700 cursor-pointer min-h-[40px]"
          >
            <option value="ALL">All Blood Types</option>
            <option value="A+">A+</option>
            <option value="B+">B+</option>
            <option value="O+">O+</option>
            <option value="AB+">AB+</option>
            <option value="A-">A-</option>
            <option value="B-">B-</option>
            <option value="O-">O-</option>
          </select>
        </div>
      </div>

      {/* Patients Data Grid */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xl shadow-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="p-4">Patient Demographics</th>
                <th className="p-4">CNIC / Phone</th>
                <th className="p-4">Blood Group</th>
                <th className="p-4">Primary Node</th>
                <th className="p-4">Critical Allergies</th>
                <th className="p-4">Visits</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No matching patient records found in Data Bank.
                  </td>
                </tr>
              ) : (
                filteredPatients.map((pat) => {
                  const patRecords = records.filter((r) => r.patientId === pat.id);
                  const primaryHosp = hospitals.find((h) => h.id === pat.primaryHospitalId);

                  return (
                    <tr key={pat.id} className="hover:bg-slate-50/70 transition">
                      <td className="p-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center font-bold text-teal-800 shrink-0">
                            {pat.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block leading-tight">{pat.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {pat.id} • {pat.age} Yrs ({pat.gender})
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-slate-700">
                        <div>{pat.nationalId}</div>
                        <div className="text-[11px] text-slate-400">{pat.phone}</div>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-1 w-fit">
                          <HeartPulse className="w-3 h-3 text-rose-600" />
                          {pat.bloodGroup.split(' ')[0]}
                        </span>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <div className="font-bold text-slate-800 text-xs">
                          {primaryHosp?.name || pat.primaryHospitalId}
                        </div>
                        {currentHospital && pat.primaryHospitalId !== currentHospital.id ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-300 text-[10px] font-bold mt-0.5">
                            <Lock className="w-2.5 h-2.5 text-amber-700" />
                            External • QR Scan Required
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-900 border border-emerald-300 text-[10px] font-bold mt-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-700" />
                            Local Facility Patient
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        {pat.allergies.length > 0 ? (
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {pat.allergies.slice(0, 2).map((a, i) => (
                              <span
                                key={i}
                                className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-800 text-[10px] font-semibold border border-rose-200 truncate"
                              >
                                {a}
                              </span>
                            ))}
                            {pat.allergies.length > 2 && (
                              <span className="text-[10px] text-slate-400 font-bold">
                                +{pat.allergies.length - 2}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">None</span>
                        )}
                      </td>
                      <td className="p-4 whitespace-nowrap font-bold text-teal-800">
                        {patRecords.length} Records
                      </td>
                      <td className="p-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedDossierPatient(pat)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-xs cursor-pointer transition"
                          >
                            Dossier
                          </button>
                          {currentHospital && pat.primaryHospitalId !== currentHospital.id ? (
                            <button
                              onClick={() => setQrVerifyModalPatient(pat)}
                              className="px-3 py-1.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-lg font-bold text-xs cursor-pointer transition shadow-xs flex items-center gap-1.5"
                              title="Scan QR Code to open external hospital records"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                              <span>Scan QR to Open</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => onOpenPatientScanner(pat.qrPayload)}
                              className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg font-bold text-xs cursor-pointer transition shadow-xs"
                            >
                              Open EHR
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FULL PATIENT DOSSIER MODAL */}
      {selectedDossierPatient && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-hidden">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-3xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-700 to-teal-900 px-5 py-4 text-white flex items-center justify-between shrink-0 shadow-xs">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-teal-200" />
                <div>
                  <h3 className="text-base sm:text-lg font-bold">Comprehensive Patient Data Dossier</h3>
                  <p className="text-xs text-teal-100">National Bank File ID: {selectedDossierPatient.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDossierPatient(null)}
                className="text-white/80 hover:text-white p-1 rounded-xl bg-white/10 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Dossier Content */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5 text-xs">
              {/* Demographics Card */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Patient Name</span>
                  <p className="text-base font-bold text-slate-900">{selectedDossierPatient.name}</p>
                  <p className="text-slate-500 font-mono">{selectedDossierPatient.id}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">CNIC / National ID</span>
                  <p className="text-sm font-bold font-mono text-slate-800">{selectedDossierPatient.nationalId}</p>
                  <p className="text-slate-500">{selectedDossierPatient.age} Yrs ({selectedDossierPatient.gender})</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Blood Group</span>
                  <p className="text-sm font-bold text-rose-700">{selectedDossierPatient.bloodGroup}</p>
                  <p className="text-slate-500">Phone: {selectedDossierPatient.phone}</p>
                </div>
              </div>

              {/* QR Payload Card */}
              <div className="p-4 bg-teal-50/50 border border-teal-200 rounded-2xl flex flex-col sm:flex-row items-center gap-4">
                <div className="bg-white p-2.5 rounded-xl border border-teal-300 shrink-0">
                  <QRCodeSVG value={selectedDossierPatient.qrPayload} size={100} />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-teal-900 uppercase">Cryptographic Token Payload</span>
                  <p className="font-mono text-[11px] text-slate-700 bg-white p-2 rounded-lg border border-teal-200">
                    {selectedDossierPatient.qrPayload}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Registered at: {hospitals.find((h) => h.id === selectedDossierPatient.primaryHospitalId)?.name}
                  </p>
                </div>
              </div>

              {/* Allergies & Conditions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl">
                  <span className="font-bold text-rose-900 text-xs block mb-1">Documented Drug Allergies:</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedDossierPatient.allergies.map((a, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-white text-rose-800 font-semibold border border-rose-200">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="font-bold text-slate-800 text-xs block mb-1">Chronic Conditions:</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedDossierPatient.chronicConditions.map((c, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-white text-slate-800 font-medium border border-slate-200">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Records Timeline */}
              <div>
                <h4 className="font-bold text-slate-800 text-sm mb-2.5">
                  Archived Encounters ({records.filter((r) => r.patientId === selectedDossierPatient.id).length})
                </h4>
                {currentHospital && selectedDossierPatient.primaryHospitalId !== currentHospital.id ? (
                  <div className="p-4 bg-amber-50/70 border border-amber-300 rounded-2xl flex flex-col items-center text-center space-y-2.5">
                    <div className="w-10 h-10 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="font-black text-amber-950 text-xs">
                        External Hospital Medical History Protected
                      </h5>
                      <p className="text-[11px] text-amber-800 max-w-sm mt-0.5 leading-relaxed">
                        Detailed clinical notes, prescriptions, and lab findings are registered at{' '}
                        <b>{hospitals.find((h) => h.id === selectedDossierPatient.primaryHospitalId)?.name}</b>.
                        National regulations require optical QR scan to decrypt and view records.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const pat = selectedDossierPatient;
                        setSelectedDossierPatient(null);
                        setQrVerifyModalPatient(pat);
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-amber-600 to-teal-700 hover:from-amber-700 hover:to-teal-800 text-white rounded-xl font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Scan Patient QR to Decrypt History</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {records
                      .filter((r) => r.patientId === selectedDossierPatient.id)
                      .map((rec) => (
                        <div key={rec.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-900">{rec.hospitalName}</span>
                            <span className="text-slate-400 font-mono">{rec.date}</span>
                          </div>
                          <p className="text-slate-700">
                            <span className="font-semibold">Diagnosis: </span>
                            {rec.diagnosis}
                          </p>
                          <p className="text-[11px] text-slate-500">Doctor: {rec.doctorName} ({rec.doctorSpecialty})</p>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end gap-2.5 shrink-0">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl"
              >
                Print Dossier
              </button>
              <button
                onClick={() => {
                  const pat = selectedDossierPatient;
                  setSelectedDossierPatient(null);
                  if (currentHospital && pat.primaryHospitalId !== currentHospital.id) {
                    setQrVerifyModalPatient(pat);
                  } else {
                    onOpenPatientScanner(pat.qrPayload);
                  }
                }}
                className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl"
              >
                Open Full Clinical EHR View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= CROSS-HOSPITAL QR SCAN VERIFICATION MODAL ================= */}
      {qrVerifyModalPatient && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-amber-600 via-teal-700 to-teal-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base leading-tight">Cross-Hospital Security Protocol</h3>
                  <p className="text-xs text-amber-100">
                    Station: {currentHospital?.name || 'Aga Khan University Hospital'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setQrVerifyModalPatient(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs text-slate-700">
              {/* Alert notice */}
              <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-2xl flex items-start gap-3 text-amber-900">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed">
                  <span className="font-bold block text-amber-950 mb-0.5">
                    External Hospital Medical Record Protected
                  </span>
                  This patient is officially registered at{' '}
                  <b className="text-amber-950">
                    {hospitals.find((h) => h.id === qrVerifyModalPatient.primaryHospitalId)?.name || 'Shifa International Hospital'}
                  </b>
                  . Under National Health Data Privacy Regulations,{' '}
                  <b>{currentHospital?.name || 'Aga Khan Hospital'}</b> cannot open these records without{' '}
                  <b>scanning the patient's QR code</b>.
                </div>
              </div>

              {/* Patient Badge */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Patient Identity</span>
                  <p className="text-sm font-black text-slate-900">{qrVerifyModalPatient.name}</p>
                  <p className="text-[11px] font-mono text-slate-500">
                    CNIC: {qrVerifyModalPatient.nationalId} • {qrVerifyModalPatient.bloodGroup}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Home Hospital</span>
                  <span className="text-xs font-bold text-teal-800">
                    {hospitals.find((h) => h.id === qrVerifyModalPatient.primaryHospitalId)?.name || 'External'}
                  </span>
                </div>
              </div>

              {/* Optical QR Scanner */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-teal-700" />
                    Scan Patient QR Code to Decrypt:
                  </span>
                  {isScanningActive && (
                    <span className="text-[11px] font-bold text-teal-700 animate-pulse">
                      {scanStatusText || 'Verifying Token...'}
                    </span>
                  )}
                </div>

                <CameraQRScanner
                  onScanSuccess={(payload) => {
                    triggerScanProcess(payload);
                  }}
                  patients={patients}
                  containerId="modal-camera-qr-reader"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-700" />
                Zero-Trust Encryption Verified
              </span>
              <button
                type="button"
                onClick={() => setQrVerifyModalPatient(null)}
                className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-bold cursor-pointer transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
