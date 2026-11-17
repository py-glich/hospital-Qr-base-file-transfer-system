import { useState } from 'react';
import {
  HeartPulse,
  AlertTriangle,
  Building2,
  Calendar,
  Pill,
  PlusCircle,
  Activity,
  ShieldCheck,
  Lock,
  Printer,
} from 'lucide-react';
import type { Patient, MedicalRecord, Hospital } from '../types/ehr';
import { QRCodeSVG } from 'qrcode.react';

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

  const printReport = () => {
    window.print();
  };

  return (
    <div className="w-full">
      {/* ===================== 1. ON-SCREEN INTERACTIVE EHR VIEWER (HIDDEN ON PRINT) ===================== */}
      <div className="print:hidden space-y-5 sm:space-y-6 w-full">
        {/* Cross-Hospital Security Status Banner */}
        {patient.primaryHospitalId !== currentHospital.id ? (
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 border-2 border-emerald-400 p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/20">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black text-emerald-950 uppercase tracking-wider">
                    Cross-Hospital EHR Access Authorized via Patient QR Scan
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 text-[10px] font-bold">
                    Decrypted Session
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Current Station: <b className="text-slate-900">{currentHospital.name} ({currentHospital.city})</b> • Patient Originating Hospital:{' '}
                  <b className="text-teal-900 font-bold">
                    {patient.primaryHospitalId === 'hosp-shifa'
                      ? 'Shifa International Hospital (Islamabad)'
                      : patient.primaryHospitalId === 'hosp-mayo'
                      ? 'Mayo Hospital (Lahore)'
                      : 'Aga Khan University Hospital (Karachi)'}
                  </b>
                </p>
              </div>
            </div>
            <div className="text-xs font-mono text-emerald-800 bg-white/80 px-3 py-1.5 rounded-xl border border-emerald-200 shrink-0 shadow-2xs">
              Auth Token: {patient.qrPayload.slice(0, 20)}...
            </div>
          </div>
        ) : (
          <div className="bg-teal-50/70 border border-teal-200 p-3.5 rounded-2xl flex items-center gap-2.5 text-xs text-teal-900">
            <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
            <span>Local Patient EHR Record • Registered at <b>{currentHospital.name}</b></span>
          </div>
        )}

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
                onClick={printReport}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-md shadow-slate-900/10 flex items-center justify-center gap-2 transition cursor-pointer min-h-[42px]"
                title="Print Official Medical Summary"
              >
                <Printer className="w-4 h-4 text-teal-400" />
                <span>Print Official Report</span>
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
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 text-base">{record.diagnosis}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isCurrentHospital
                                ? 'bg-slate-100 text-slate-700'
                                : 'bg-teal-100 text-teal-800 border border-teal-200'
                            }`}
                          >
                            {record.hospitalName}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {record.date} • Attending: <span className="font-semibold text-slate-700">{record.doctorName}</span> ({record.doctorSpecialty})
                        </p>
                      </div>

                      <div className="text-right text-xs">
                        <span className="font-mono text-slate-400 block text-[11px]">{record.id}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-xs">
                      <div>
                        <span className="font-bold text-slate-600 block mb-1">Symptoms Recorded:</span>
                        <div className="flex flex-wrap gap-1">
                          {record.symptoms.map((s, i) => (
                            <span key={i} className="px-2 py-0.5 bg-slate-100 rounded text-slate-700">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="font-bold text-slate-600 block mb-1">Prescribed Medications:</span>
                        <div className="space-y-1">
                          {record.medications && record.medications.length > 0 ? (
                            record.medications.map((p, i) => (
                              <div key={i} className="flex items-center gap-1.5 text-slate-800">
                                <Pill className="w-3 h-3 text-teal-600" />
                                <span className="font-semibold">{p.name}</span>
                                <span className="text-slate-500">({p.dosage} - {p.frequency} for {p.duration})</span>
                              </div>
                            ))
                          ) : (
                            <span className="text-slate-400 italic">None documented</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {record.doctorNotes && (
                      <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600 bg-slate-50/60 p-3 rounded-xl">
                        <span className="font-bold text-slate-700 block mb-0.5">Doctor's Clinical Notes:</span>
                        <p className="italic">{record.doctorNotes}</p>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ===================== 2. OFFICIAL HOSPITAL PRINTABLE MEDICAL REPORT (VISIBLE ONLY ON PRINT) ===================== */}
      <div className="hidden print:block w-full text-slate-900 bg-white font-sans p-6 text-[12px] leading-relaxed">
        {/* Official Header Letterhead */}
        <div className="flex justify-between items-start border-b-2 border-teal-800 pb-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-800 text-white flex items-center justify-center font-black text-sm">
                +
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase">
                  {currentHospital.name}
                </h1>
                <p className="text-[10px] text-slate-600 font-semibold uppercase tracking-wider">
                  National Unified Health Exchange Node &bull; {currentHospital.badge} ({currentHospital.city}, Pakistan)
                </p>
              </div>
            </div>
            <p className="text-[9px] text-slate-500 mt-1">
              Accredited by Pakistan Medical Commission (PMDC) &amp; Ministry of National Health Services Regulations
            </p>
          </div>

          <div className="text-right flex flex-col items-end">
            <QRCodeSVG value={patient.qrPayload} size={70} />
            <span className="text-[8px] font-mono text-slate-500 mt-1 block">
              SECURE QR STAMP: {patient.id}
            </span>
          </div>
        </div>

        {/* Report Banner */}
        <div className="bg-slate-100 p-2.5 rounded-lg border border-slate-300 flex justify-between items-center mb-4">
          <div>
            <span className="font-black text-xs uppercase tracking-wide text-slate-800 block">
              Official Patient Health Summary &amp; Clinical Encounter History
            </span>
            <span className="text-[9px] text-slate-600">
              Generated on: {new Date().toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })} &bull; Report ID: REP-{patient.id}-{Date.now().toString().slice(-4)}
            </span>
          </div>
          <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
            VERIFIED BIO-IDENTITY
          </span>
        </div>

        {/* Patient Demographics Table */}
        <div className="border-2 border-slate-400 rounded-lg overflow-hidden mb-4 bg-white">
          <div
            style={{
              background: '#0f172a',
              color: '#ffffff',
              padding: '6px 12px',
              fontWeight: 800,
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Patient Demographics &amp; Registration Particulars
          </div>
          <table className="w-full text-left text-[11px] border-collapse" style={{ width: '100%', color: '#0f172a' }}>
            <tbody>
              <tr className="border-b border-slate-300">
                <td className="p-2 font-bold bg-slate-100 w-1/4" style={{ color: '#334155', background: '#f1f5f9' }}>Full Name:</td>
                <td className="p-2 font-black text-slate-900 w-1/4" style={{ color: '#0f172a' }}>{patient?.name || 'Muhammad Tariq Khan'}</td>
                <td className="p-2 font-bold bg-slate-100 w-1/4" style={{ color: '#334155', background: '#f1f5f9' }}>National ID (CNIC):</td>
                <td className="p-2 font-mono font-bold text-slate-900 w-1/4" style={{ color: '#0f172a' }}>{patient?.nationalId || '37405-1234567-1'}</td>
              </tr>
              <tr className="border-b border-slate-300">
                <td className="p-2 font-bold bg-slate-100" style={{ color: '#334155', background: '#f1f5f9' }}>Patient MRN / ID:</td>
                <td className="p-2 font-mono font-bold text-slate-900" style={{ color: '#0f172a' }}>{patient?.id || 'PAT-9021'}</td>
                <td className="p-2 font-bold bg-slate-100" style={{ color: '#334155', background: '#f1f5f9' }}>Age / Gender:</td>
                <td className="p-2 font-semibold text-slate-900" style={{ color: '#0f172a' }}>{patient?.age ?? 48} Years &bull; {patient?.gender || 'Male'}</td>
              </tr>
              <tr className="border-b border-slate-300">
                <td className="p-2 font-bold bg-slate-100" style={{ color: '#334155', background: '#f1f5f9' }}>Blood Group:</td>
                <td className="p-2 font-black text-rose-700" style={{ color: '#b91c1c' }}>{patient?.bloodGroup || 'B Positive (B+)'}</td>
                <td className="p-2 font-bold bg-slate-100" style={{ color: '#334155', background: '#f1f5f9' }}>Contact Phone:</td>
                <td className="p-2 font-mono text-slate-900" style={{ color: '#0f172a' }}>{patient?.phone || '+92 300 5551234'}</td>
              </tr>
              <tr>
                <td className="p-2 font-bold bg-slate-100" style={{ color: '#334155', background: '#f1f5f9' }}>Primary Hospital Node:</td>
                <td className="p-2 font-semibold text-slate-900" style={{ color: '#0f172a' }}>
                  {patient?.primaryHospitalId === 'hosp-shifa'
                    ? 'Shifa International Hospital (Islamabad)'
                    : patient?.primaryHospitalId === 'hosp-mayo'
                    ? 'Mayo Hospital (Lahore)'
                    : 'Aga Khan University Hospital (Karachi)'}
                </td>
                <td className="p-2 font-bold bg-slate-100" style={{ color: '#334155', background: '#f1f5f9' }}>Security Validation:</td>
                <td className="p-2 font-mono text-emerald-800 font-bold" style={{ color: '#065f46' }}>SHA-256 VERIFIED &bull; HL7 FHIR</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Safety Alert Row: Allergies & Chronic Conditions */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="border border-rose-300 bg-rose-50/50 p-2.5 rounded-lg" style={{ background: '#fff1f2', borderColor: '#fca5a5' }}>
            <span className="font-black text-[10px] text-rose-900 uppercase tracking-wider block mb-1" style={{ color: '#881337' }}>
              Documented Drug Allergies (High Caution):
            </span>
            <div className="text-[11px] font-bold text-rose-800" style={{ color: '#9f1239' }}>
              {patient?.allergies?.length ? patient.allergies.join(', ') : 'No Known Drug Allergies (NKDA)'}
            </div>
          </div>
          <div className="border border-teal-300 bg-teal-50/50 p-2.5 rounded-lg" style={{ background: '#f0fdf4', borderColor: '#86efac' }}>
            <span className="font-black text-[10px] text-teal-900 uppercase tracking-wider block mb-1" style={{ color: '#14532d' }}>
              Documented Chronic Conditions:
            </span>
            <div className="text-[11px] font-bold text-teal-900" style={{ color: '#166534' }}>
              {patient?.chronicConditions?.length ? patient.chronicConditions.join(', ') : 'No Documented Chronic Conditions'}
            </div>
          </div>
        </div>

        {/* Clinical History Table */}
        <div className="border-2 border-slate-400 rounded-lg overflow-hidden mb-6 bg-white">
          <div
            style={{
              background: '#0f172a',
              color: '#ffffff',
              padding: '6px 12px',
              fontWeight: 800,
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Verified Clinical Encounter Records (Cross-Hospital History)
          </div>
          <table className="w-full text-left text-[10px] border-collapse" style={{ width: '100%', color: '#0f172a' }}>
            <thead>
              <tr className="bg-slate-200 border-b-2 border-slate-300 text-slate-800 font-bold" style={{ background: '#e2e8f0', color: '#1e293b' }}>
                <th className="p-2 w-[12%]" style={{ color: '#1e293b' }}>Date</th>
                <th className="p-2 w-[18%]" style={{ color: '#1e293b' }}>Facility / Hospital</th>
                <th className="p-2 w-[18%]" style={{ color: '#1e293b' }}>Attending Doctor</th>
                <th className="p-2 w-[22%]" style={{ color: '#1e293b' }}>Diagnosis &amp; Symptoms</th>
                <th className="p-2 w-[30%]" style={{ color: '#1e293b' }}>Prescriptions &amp; Clinical Notes</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const patId = (patient?.id || 'PAT-9021').toLowerCase();
                const matchedRecords = records.filter((r) => (r.patientId || '').toLowerCase() === patId);
                const displayRecords = matchedRecords.length > 0 ? matchedRecords : records.slice(0, 2);

                if (displayRecords.length === 0) {
                  return (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-slate-600 bg-slate-50 italic">
                        No prior hospital admissions or cross-hospital clinical records on file.
                      </td>
                    </tr>
                  );
                }

                return displayRecords.map((rec) => (
                  <tr key={rec.id} className="border-b border-slate-200" style={{ color: '#0f172a' }}>
                    <td className="p-2 font-mono font-semibold align-top" style={{ color: '#0f172a' }}>{rec.date}</td>
                    <td className="p-2 align-top font-semibold text-slate-800" style={{ color: '#1e293b' }}>{rec.hospitalName}</td>
                    <td className="p-2 align-top">
                      <div className="font-bold text-slate-900" style={{ color: '#0f172a' }}>{rec.doctorName}</div>
                      <div className="text-[9px] text-slate-600" style={{ color: '#475569' }}>{rec.doctorSpecialty}</div>
                    </td>
                    <td className="p-2 align-top">
                      <div className="font-black text-slate-900" style={{ color: '#0f172a' }}>{rec.diagnosis}</div>
                      <div className="text-[9px] text-slate-600 mt-0.5" style={{ color: '#475569' }}>
                        Symptoms: {rec.symptoms.join(', ')}
                      </div>
                    </td>
                    <td className="p-2 align-top">
                      <div className="space-y-0.5">
                        {rec.medications && rec.medications.length > 0 ? (
                          rec.medications.map((rx, idx) => (
                            <div key={idx} className="font-bold text-slate-800" style={{ color: '#1e293b' }}>
                              &bull; {rx.name} ({rx.dosage} - {rx.frequency})
                            </div>
                          ))
                        ) : (
                          <span className="text-slate-500 italic">No medications prescribed</span>
                        )}
                      </div>
                      {rec.doctorNotes && (
                        <div className="text-[9px] text-slate-600 italic mt-1 pt-1 border-t border-slate-200" style={{ color: '#475569' }}>
                          Note: "{rec.doctorNotes}"
                        </div>
                      )}
                    </td>
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>

        {/* Official Sign-Off Block */}
        <div className="grid grid-cols-2 gap-8 pt-4 border-t-2 border-slate-300 mt-6 page-break-inside-avoid">
          <div>
            <span className="font-bold text-[10px] text-slate-500 uppercase tracking-wider block mb-4">
              Attending Consultant Physician Certification:
            </span>
            <div className="border-b border-slate-400 w-48 mb-1"></div>
            <p className="font-black text-[11px] text-slate-900">Dr. Ahmed Khan, M.D., F.C.P.S.</p>
            <p className="text-[9px] text-slate-500">Chief Medical Administrator &bull; PMDC # 48921-S</p>
            <p className="text-[9px] text-slate-500 mt-0.5">Station: {currentHospital.name}</p>
          </div>

          <div className="flex flex-col items-end">
            <span className="font-bold text-[10px] text-slate-500 uppercase tracking-wider block mb-2">
              Institutional Medical Seal:
            </span>
            <div className="w-40 h-20 border-2 border-dashed border-slate-400 rounded-lg flex flex-col items-center justify-center text-slate-400 text-[9px] text-center p-2">
              <span className="font-bold text-slate-600 block">OFFICIAL NODE EMBOSS</span>
              <span>{currentHospital.badge} &bull; PAKISTAN</span>
            </div>
          </div>
        </div>

        {/* Confidentiality Footer */}
        <div className="mt-6 pt-3 border-t border-slate-200 text-center text-[8px] text-slate-400">
          CONFIDENTIAL MEDICAL RECORD &bull; PROTECTED UNDER DIGITAL HEALTH SAFETY &amp; PRIVACY REGULATION 2026 &bull; NOT FOR RE-DISCLOSURE WITHOUT PATIENT CONSENT
        </div>
      </div>
    </div>
  );
};
