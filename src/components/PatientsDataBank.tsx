import { useState } from 'react';
import {
  Users,
  Search,
  HeartPulse,
  FileText,
  UserPlus,
  Printer,
} from 'lucide-react';
import type { Patient, MedicalRecord, Hospital } from '../types/ehr';
import { QRCodeSVG } from 'qrcode.react';

interface PatientsDataBankProps {
  patients: Patient[];
  records: MedicalRecord[];
  hospitals: Hospital[];
  onOpenCreatePatient: () => void;
  onOpenPatientScanner: (qrPayload: string) => void;
}

export const PatientsDataBank: React.FC<PatientsDataBankProps> = ({
  patients,
  records,
  hospitals,
  onOpenCreatePatient,
  onOpenPatientScanner,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHospitalFilter, setSelectedHospitalFilter] = useState('ALL');
  const [selectedBloodGroupFilter, setSelectedBloodGroupFilter] = useState('ALL');
  const [selectedDossierPatient, setSelectedDossierPatient] = useState<Patient | null>(null);

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
                      <td className="p-4 whitespace-nowrap font-medium text-slate-800">
                        {primaryHosp?.name.split(' ')[0]}
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
                          <button
                            onClick={() => onOpenPatientScanner(pat.qrPayload)}
                            className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg font-bold text-xs cursor-pointer transition shadow-xs"
                          >
                            Open EHR
                          </button>
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
                  setSelectedDossierPatient(null);
                  onOpenPatientScanner(selectedDossierPatient.qrPayload);
                }}
                className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl"
              >
                Open Full Clinical EHR View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
