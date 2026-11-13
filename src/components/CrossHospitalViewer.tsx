import { useState } from 'react';
import {
  HeartPulse,
  AlertTriangle,
  Building2,
  Calendar,
  Stethoscope,
  Pill,
  PlusCircle,
  Activity,
  ShieldCheck,
  Lock,
  Printer,
} from 'lucide-react';
import type { Patient, MedicalRecord, Hospital } from '../types/ehr';

interface CrossHospitalViewerProps {
  patient: Patient;
  records: MedicalRecord[];
  currentHospital: Hospital;
  onOpenAddRecord: () => void;
  onLockSession: () => void;
}

export const CrossHospitalViewer: React.FC<CrossHospitalViewerProps> = ({
  patient,
  records,
  currentHospital,
  onOpenAddRecord,
  onLockSession,
}) => {
  const [selectedHospitalFilter, setSelectedHospitalFilter] = useState<string>('ALL');

  const filteredRecords = records
    .filter((r) => r.patientId === patient.id)
    .filter((r) => (selectedHospitalFilter === 'ALL' ? true : r.hospitalId === selectedHospitalFilter))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const visitedHospitals = Array.from(
    new Set(records.filter((r) => r.patientId === patient.id).map((r) => r.hospitalName))
  );

  return (
    <div className="space-y-5 sm:space-y-6 w-full">
      {/* Patient Header Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xl shadow-slate-100 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
          <div className="flex items-start sm:items-center gap-3.5 sm:gap-4">
            <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-teal-700 to-teal-900 flex items-center justify-center text-white text-xl sm:text-2xl font-black shadow-md shadow-teal-700/20 shrink-0">
              {patient.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
            </div>
            <div>
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black text-slate-800">{patient.name}</h2>
                <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-1.5">
                  <HeartPulse className="w-3.5 h-3.5" />
                  {patient.bloodGroup}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-mono font-medium">
                  {patient.id}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                CNIC: <span className="text-slate-800 font-mono font-medium">{patient.nationalId}</span> • {patient.age} Yrs ({patient.gender}) • Phone: {patient.phone}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap w-full sm:w-auto">
            <button
              onClick={onOpenAddRecord}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs rounded-xl shadow-md shadow-teal-700/20 flex items-center justify-center gap-2 transition cursor-pointer min-h-[42px]"
            >
              <PlusCircle className="w-4 h-4" />
              Add Consultation
            </button>
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer min-h-[42px]"
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </button>
            <button
              onClick={onLockSession}
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 flex items-center justify-center gap-1.5 transition cursor-pointer min-h-[42px]"
            >
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              Close
            </button>
          </div>
        </div>

        {/* Safety Alert Banners: Allergies & Chronic Conditions */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 pt-5 border-t border-slate-100">
          <div className="p-4 bg-rose-50/70 border border-rose-200/80 rounded-2xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-rose-900 uppercase tracking-wide">
                Documented Drug Allergies (Active Warning):
              </span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {patient.allergies.map((allergy, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-0.5 rounded-lg bg-rose-100 text-rose-800 text-xs font-semibold border border-rose-200"
                  >
                    {allergy}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 bg-teal-50/70 border border-teal-200/80 rounded-2xl flex items-start gap-3">
            <Activity className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-teal-900 uppercase tracking-wide">
                Chronic Medical Conditions:
              </span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {patient.chronicConditions.map((cond, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-0.5 rounded-lg bg-teal-100/70 text-teal-900 text-xs font-medium border border-teal-200"
                  >
                    {cond}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cross Hospital Records & Timeline Filter */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-5 border-b border-slate-100 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-teal-700" />
              <h3 className="text-lg font-bold text-slate-800">Unified Medical History (Cross-Hospital)</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Securely shared across {visitedHospitals.length} healthcare facilities
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-500 font-medium">Filter By Hospital:</span>
            <select
              value={selectedHospitalFilter}
              onChange={(e) => setSelectedHospitalFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-teal-700 cursor-pointer"
            >
              <option value="ALL">All Hospitals Combined ({records.filter((r) => r.patientId === patient.id).length})</option>
              <option value="hosp-shifa">Shifa Int'l (Islamabad)</option>
              <option value="hosp-aku">Aga Khan (Karachi)</option>
              <option value="hosp-mayo">Mayo Hospital (Lahore)</option>
            </select>
          </div>
        </div>

        {/* Timeline of Clinical Encounters */}
        <div className="mt-6 space-y-4">
          {filteredRecords.length === 0 ? (
            <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">
              No medical records found under this filter.
            </div>
          ) : (
            filteredRecords.map((record) => {
              const isCurrentHospital = record.hospitalId === currentHospital.id;
              return (
                <div
                  key={record.id}
                  className={`p-6 rounded-2xl border transition-all ${
                    isCurrentHospital
                      ? 'bg-white border-slate-200 shadow-sm'
                      : 'bg-teal-50/20 border-teal-200/80 shadow-sm'
                  }`}
                >
                  {/* Top record meta bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
                          isCurrentHospital
                            ? 'bg-slate-100 text-slate-800 border border-slate-200'
                            : 'bg-teal-100 text-teal-900 border border-teal-200'
                        }`}
                      >
                        <Building2 className="w-3.5 h-3.5" />
                        {record.hospitalName}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-xs font-medium text-slate-700">
                        {record.type}
                      </span>
                      {!isCurrentHospital && (
                        <span className="text-[11px] text-teal-800 font-mono px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 flex items-center gap-1 font-semibold">
                          <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                          Interoperable QR Sync
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {record.date} • {record.id}
                    </div>
                  </div>

                  {/* Doctor Info & Diagnosis */}
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 space-y-2">
                      <div className="flex items-center gap-2 text-xs text-slate-700">
                        <Stethoscope className="w-4 h-4 text-teal-700 shrink-0" />
                        <span className="font-bold text-slate-900">{record.doctorName}</span>
                        <span className="text-slate-500">({record.doctorSpecialty})</span>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">
                          Clinical Diagnosis
                        </span>
                        <p className="text-sm font-bold text-slate-800">{record.diagnosis}</p>
                        {record.symptoms && record.symptoms.length > 0 && (
                          <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs text-slate-500 font-medium">Symptoms:</span>
                            {record.symptoms.map((sym, sIdx) => (
                              <span
                                key={sIdx}
                                className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 text-xs"
                              >
                                {sym}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {record.doctorNotes && (
                        <p className="text-xs text-slate-600 italic bg-amber-50/50 p-3 rounded-xl border border-amber-100">
                          "{record.doctorNotes}"
                        </p>
                      )}
                    </div>

                    {/* Vitals sidebox */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col justify-between">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                        Vitals at Visit
                      </span>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-white p-2.5 rounded-xl border border-slate-200/60">
                          <span className="text-[10px] text-slate-500 block">BP</span>
                          <span className="font-bold font-mono text-teal-900">{record.vitals.bloodPressure}</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-slate-200/60">
                          <span className="text-[10px] text-slate-500 block">Pulse</span>
                          <span className="font-bold font-mono text-teal-900">{record.vitals.heartRate}</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-slate-200/60">
                          <span className="text-[10px] text-slate-500 block">Temp</span>
                          <span className="font-bold font-mono text-slate-700">{record.vitals.temperature}</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-slate-200/60">
                          <span className="text-[10px] text-slate-500 block">SpO2</span>
                          <span className="font-bold font-mono text-teal-800">{record.vitals.spO2}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Medications */}
                  {record.medications && record.medications.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5 mb-2">
                        <Pill className="w-3.5 h-3.5 text-teal-700" />
                        Prescribed Medications ({record.medications.length})
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {record.medications.map((med, mIdx) => (
                          <div
                            key={mIdx}
                            className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                          >
                            <div>
                              <p className="font-bold text-slate-800">{med.name}</p>
                              <p className="text-[11px] text-slate-500">{med.frequency} • {med.duration}</p>
                            </div>
                            <span className="px-2 py-0.5 bg-teal-50 border border-teal-200 rounded text-xs font-mono font-bold text-teal-800">
                              {med.dosage}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Lab Findings */}
                  {record.labFindings && record.labFindings.length > 0 && (
                    <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                      <span className="font-bold text-slate-800">Lab & Diagnostics: </span>
                      <span className="text-slate-600">{record.labFindings.join(' | ')}</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
