import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Bed,
  Stethoscope,
  Pill,
  X,
  Plus,
  Trash2,
} from 'lucide-react';
import type { Patient, Hospital, MedicalRecord } from '../types/ehr';

interface PromotePatientStatusModalProps {
  patient: Patient;
  currentHospital: Hospital;
  hospitals?: Hospital[];
  onClose: () => void;
  onPromoteStatus: (
    patientId: string,
    statusData: Partial<Patient>,
    generatedRecord: MedicalRecord,
    bedOccupancyChange: number
  ) => void;
}

const DOCTOR_ROSTER = [
  { name: 'Prof. Dr. Salman Qureshi', specialty: 'Consultant Cardiologist & Internist', hospId: 'hosp-shifa' },
  { name: 'Dr. Asad Mehmood', specialty: 'Emergency Medicine Consultant', hospId: 'hosp-aku' },
  { name: 'Prof. Dr. Tariq Sohail', specialty: 'Spine & Orthopedic Surgeon', hospId: 'hosp-mayo' },
  { name: 'Dr. Emma Scott', specialty: 'Internal Medicine & Hematology', hospId: 'hosp-aku' },
  { name: 'Dr. Nida Haroon', specialty: 'Pulmonologist & Immunologist', hospId: 'hosp-aku' },
  { name: 'Dr. Maria Qadir', specialty: 'Consultant Nephrologist & Internist', hospId: 'hosp-shifa' },
  { name: 'Dr. Paul Ford', specialty: 'Senior Chest Physician & ER', hospId: 'hosp-mayo' },
  { name: 'Prof. Dr. Irfan Malik', specialty: 'Interventional Cardiologist', hospId: 'hosp-mayo' },
  { name: 'Dr. Tariq Aziz', specialty: 'Radiology & Imaging', hospId: 'hosp-shifa' },
];

const ROOM_OPTIONS = [
  'ICU Critical Care - Bed #01 (Ventilator Bay)',
  'ICU Critical Care - Bed #02',
  'ICU Critical Care - Bed #03',
  'Inpatient Monitored Ward 3 - Bed #204',
  'Inpatient Monitored Ward 3 - Bed #208',
  'ER Resuscitation Trauma Bay 1',
  'ER Acute Observation Bed #04',
  'Cardiology HDU Bed #08',
  'Private Deluxe Suite #405',
];

const COMMON_DISCHARGE_MEDS = [
  { name: 'Panadol (Paracetamol)', dosage: '500mg', frequency: '1 tab TDS PRN', duration: '5 Days' },
  { name: 'Augmentin (Co-Amoxiclav)', dosage: '625mg', frequency: '1 tab Twice Daily', duration: '7 Days' },
  { name: 'Omeprazole (Risek)', dosage: '20mg', frequency: '1 cap Before Breakfast', duration: '14 Days' },
  { name: 'Salbutamol Inhaler (Ventolin)', dosage: '2 Puffs', frequency: 'PRN for wheezing', duration: '14 Days' },
  { name: 'Ciprofloxacin (Ciproxin)', dosage: '500mg', frequency: '1 tab Twice Daily', duration: '5 Days' },
  { name: 'Montelukast (Singulair)', dosage: '10mg', frequency: '1 tab at Bedtime', duration: '30 Days' },
];

const COMMON_EMERGENCY_MEDS = [
  { name: 'IV Ringers Lactate', dosage: '1000ml', frequency: 'Stat Infusion', duration: 'Emergency' },
  { name: 'IV Lasix (Furosemide)', dosage: '40mg', frequency: 'Stat IV Bolus', duration: 'Emergency' },
  { name: 'Oxygen via Venturi Mask', dosage: '40% FiO2', frequency: 'Continuous Titrated', duration: 'Inpatient' },
  { name: 'IV Hydrocortisone', dosage: '100mg', frequency: 'Stat IV Dose', duration: 'Emergency' },
  { name: 'IV Tramadol', dosage: '50mg', frequency: 'Slow Infusion PRN', duration: '24 Hours' },
];

export const PromotePatientStatusModal: React.FC<PromotePatientStatusModalProps> = ({
  patient,
  currentHospital,
  hospitals: _hospitals,
  onClose,
  onPromoteStatus,
}) => {
  const [careAction, setCareAction] = useState<'TREATMENT_COMPLETE' | 'SERIOUS_SHIFT_ROOM'>('TREATMENT_COMPLETE');

  // Treatment Complete State
  const [selectedDoctor, setSelectedDoctor] = useState(DOCTOR_ROSTER[0].name);
  const [customDoctor, setCustomDoctor] = useState('');
  const [dischargeDiagnosis, setDischargeDiagnosis] = useState(
    patient.chronicConditions && patient.chronicConditions.length > 0
      ? `${patient.chronicConditions[0]} - Controlled & Stabilized`
      : 'Clinical Treatment Completed & Vitals Normal'
  );
  const [dischargeNotes, setDischargeNotes] = useState(
    'Patient successfully treated and clinically afebrile. Prescribed home discharge medications. Advised oral hydration and regular follow-up if symptoms recur.'
  );
  const [dischargeMeds, setDischargeMeds] = useState([
    { name: 'Panadol (Paracetamol)', dosage: '500mg', frequency: '1 tab TDS PRN', duration: '5 Days' },
    { name: 'Augmentin (Co-Amoxiclav)', dosage: '625mg', frequency: '1 tab Twice Daily', duration: '7 Days' },
  ]);

  // Serious Condition / Shift to Room State
  const [severity, setSeverity] = useState<'CRITICAL_ICU' | 'URGENT_TRAUMA' | 'INPATIENT_WARD'>('CRITICAL_ICU');
  const [assignedRoom, setAssignedRoom] = useState(ROOM_OPTIONS[0]);
  const [customRoom, setCustomRoom] = useState('');
  const [admissionReason, setAdmissionReason] = useState(
    'Acute condition deterioration requiring immediate monitored bed admission and specialist intervention.'
  );
  const [emergencyMeds, setEmergencyMeds] = useState([
    { name: 'IV Ringers Lactate', dosage: '1000ml', frequency: 'Stat Infusion', duration: 'Emergency' },
    { name: 'Oxygen via Venturi Mask', dosage: '40% FiO2', frequency: 'Continuous Titrated', duration: 'Inpatient' },
  ]);

  // Add / Remove Medicine Helper
  const handleAddMedicine = (isEmergency: boolean) => {
    if (isEmergency) {
      setEmergencyMeds([...emergencyMeds, { name: '', dosage: '', frequency: '', duration: '' }]);
    } else {
      setDischargeMeds([...dischargeMeds, { name: '', dosage: '', frequency: '', duration: '' }]);
    }
  };

  const handleQuickAddMed = (med: typeof COMMON_DISCHARGE_MEDS[0], isEmergency: boolean) => {
    if (isEmergency) {
      setEmergencyMeds([...emergencyMeds, { ...med }]);
    } else {
      setDischargeMeds([...dischargeMeds, { ...med }]);
    }
  };

  const handleUpdateMed = (
    idx: number,
    field: 'name' | 'dosage' | 'frequency' | 'duration',
    val: string,
    isEmergency: boolean
  ) => {
    if (isEmergency) {
      const updated = [...emergencyMeds];
      updated[idx][field] = val;
      setEmergencyMeds(updated);
    } else {
      const updated = [...dischargeMeds];
      updated[idx][field] = val;
      setDischargeMeds(updated);
    }
  };

  const handleRemoveMed = (idx: number, isEmergency: boolean) => {
    if (isEmergency) {
      setEmergencyMeds(emergencyMeds.filter((_, i) => i !== idx));
    } else {
      setDischargeMeds(dischargeMeds.filter((_, i) => i !== idx));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const activeDoctorName = customDoctor.trim() || selectedDoctor;
    const docObj = DOCTOR_ROSTER.find((d) => d.name === activeDoctorName);
    const doctorSpecialty = docObj?.specialty || 'Attending Clinical Specialist';

    const timestamp = new Date().toISOString().split('T')[0];

    if (careAction === 'TREATMENT_COMPLETE') {
      const generatedRecord: MedicalRecord = {
        id: `REC-DISCHARGE-${Date.now().toString().slice(-4)}`,
        patientId: patient.id,
        hospitalId: currentHospital.id,
        hospitalName: currentHospital.name,
        doctorName: activeDoctorName,
        doctorSpecialty,
        date: timestamp,
        type: 'Discharge Summary',
        diagnosis: dischargeDiagnosis,
        symptoms: ['Treatment Completed', 'Vitals Stabilized'],
        vitals: {
          bloodPressure: '120/80 mmHg',
          heartRate: '72 bpm',
          temperature: '98.4 °F',
          spO2: '99% on room air',
        },
        medications: dischargeMeds.filter((m) => m.name.trim() !== ''),
        labFindings: ['Discharge surveillance normal. All clinical endpoints achieved.'],
        allergiesObserved: patient.allergies || [],
        doctorNotes: `${dischargeNotes} Attending Physician: ${activeDoctorName}. Official Discharge Complete.`,
      };

      const statusData: Partial<Patient> = {
        clinicalStatus: 'TREATMENT_COMPLETED',
        attendingDoctor: activeDoctorName,
        clinicalDiagnosis: dischargeDiagnosis,
        dischargeNotes,
        dischargeMedications: dischargeMeds.filter((m) => m.name.trim() !== ''),
        assignedRoom: '',
      };

      // Bed freed up (-1) if previously occupied
      const bedOccupancyChange = patient.clinicalStatus === 'SERIOUS_ADMITTED' ? -1 : 0;
      onPromoteStatus(patient.id, statusData, generatedRecord, bedOccupancyChange);
    } else {
      // SERIOUS_SHIFT_ROOM
      const finalRoom = customRoom.trim() || assignedRoom;
      const severityLabel =
        severity === 'CRITICAL_ICU'
          ? 'Critical Care (ICU Level 1)'
          : severity === 'URGENT_TRAUMA'
          ? 'Urgent Trauma / HDU'
          : 'Inpatient Medical Ward';

      const generatedRecord: MedicalRecord = {
        id: `REC-ADMIT-${Date.now().toString().slice(-4)}`,
        patientId: patient.id,
        hospitalId: currentHospital.id,
        hospitalName: currentHospital.name,
        doctorName: activeDoctorName,
        doctorSpecialty,
        date: timestamp,
        type: 'Emergency',
        diagnosis: `Serious Inpatient Admission: ${admissionReason} (${severityLabel})`,
        symptoms: ['Acute Condition Deterioration', 'High Urgency Admission', 'Room Assigned: ' + finalRoom],
        vitals: {
          bloodPressure: '145/95 mmHg',
          heartRate: '104 bpm',
          temperature: '99.8 °F',
          spO2: '92% (Administered O2)',
        },
        medications: emergencyMeds.filter((m) => m.name.trim() !== ''),
        labFindings: [`Shifted to ${finalRoom} under ${activeDoctorName}. Continuous telemetry monitoring initiated.`],
        allergiesObserved: patient.allergies || [],
        doctorNotes: `PATIENT CONDITION SERIOUS: Shifted immediately to ${finalRoom} in ${currentHospital.name}. Attending Doctor: ${activeDoctorName}. Immediate resuscitation protocol activated.`,
      };

      const statusData: Partial<Patient> = {
        clinicalStatus: 'SERIOUS_ADMITTED',
        assignedRoom: finalRoom,
        attendingDoctor: activeDoctorName,
        admissionReason,
        clinicalDiagnosis: `Serious Condition - Shifted to ${finalRoom}`,
      };

      // Bed occupied (+1)
      const bedOccupancyChange = patient.clinicalStatus === 'SERIOUS_ADMITTED' ? 0 : 1;
      onPromoteStatus(patient.id, statusData, generatedRecord, bedOccupancyChange);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Sticky Header */}
        <div className="bg-gradient-to-r from-teal-800 via-teal-900 to-slate-900 px-6 py-4 text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shrink-0">
              <Stethoscope className="w-5 h-5 text-teal-200" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold leading-tight">
                Promote Patient Clinical Status & Ward Transfer
              </h3>
              <p className="text-xs text-teal-200/90 truncate max-w-md">
                Active Station: {currentHospital.name} &bull; Universal EHR Link
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-teal-200 hover:text-white p-2 rounded-xl bg-white/10 hover:bg-white/20 cursor-pointer transition shrink-0"
            title="Close Form"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Patient Demographics Banner */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-700 text-white flex items-center justify-center font-bold text-sm">
              {patient.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">{patient.name}</span>
                <span className="px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 font-bold text-[11px]">
                  {patient.id}
                </span>
              </div>
              <span className="text-slate-500">
                {patient.age}y &bull; {patient.gender} &bull; Blood: <strong className="text-teal-800">{patient.bloodGroup}</strong> &bull; CNIC: {patient.nationalId}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Current Status:</span>
            <span
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                patient.clinicalStatus === 'SERIOUS_ADMITTED'
                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                  : patient.clinicalStatus === 'TREATMENT_COMPLETED'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-teal-100 text-teal-800 border border-teal-200'
              }`}
            >
              {patient.clinicalStatus === 'SERIOUS_ADMITTED'
                ? `⚠️ Admitted: ${patient.assignedRoom || 'Room'}`
                : patient.clinicalStatus === 'TREATMENT_COMPLETED'
                ? '✓ Treatment Completed'
                : 'Active Outpatient'}
            </span>
          </div>
        </div>

        {/* Cross-Hospital Context Notice */}
        {patient.primaryHospitalId !== currentHospital.id && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-start gap-3 text-xs text-blue-900">
            <span className="text-base leading-none mt-0.5">🌐</span>
            <div>
              <p className="font-bold text-blue-950 mb-0.5">
                Cross-Hospital Federation Action
              </p>
              <p className="text-blue-800 leading-relaxed">
                Patient's registered home node is <b>{patient.primaryHospitalId === 'hosp-shifa' ? 'Shifa International' : patient.primaryHospitalId === 'hosp-aku' ? 'Aga Khan' : 'Mayo Hospital'}</b>.
                You are updating their clinical status through <b>{currentHospital.name}</b>. The attending physician and inpatient bed allocation will be recorded under <b>{currentHospital.name}</b> and synced across the national healthcare network.
              </p>
            </div>
          </div>
        )}

        {/* Action Choice Selection */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2.5">
              Select Clinical Care Action:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option 1: Treatment Completed */}
              <div
                onClick={() => setCareAction('TREATMENT_COMPLETE')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition flex items-start gap-3.5 ${
                  careAction === 'TREATMENT_COMPLETE'
                    ? 'border-emerald-600 bg-emerald-50/60 shadow-md shadow-emerald-600/10'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    careAction === 'TREATMENT_COMPLETE'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Treatment Completed (Discharge)</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Patient stabilized & treated. Record attending doctor, prescribed medicines, and issue official Discharge Summary.
                  </p>
                </div>
              </div>

              {/* Option 2: Serious Condition / Shift to Room */}
              <div
                onClick={() => setCareAction('SERIOUS_SHIFT_ROOM')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition flex items-start gap-3.5 ${
                  careAction === 'SERIOUS_SHIFT_ROOM'
                    ? 'border-rose-600 bg-rose-50/60 shadow-md shadow-rose-600/10'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    careAction === 'SERIOUS_SHIFT_ROOM'
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Bed className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Patient Serious (Shift to Room / ICU)</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Condition critical or severe. Allocate an inpatient room/bed, assign emergency specialist, and occupy ward capacity.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* FLOW A: TREATMENT COMPLETED & DISCHARGE PRESCRIPTION                      */}
          {/* ========================================================================= */}
          {careAction === 'TREATMENT_COMPLETE' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Doctor Assignment */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5 text-teal-700" />
                  Attending Doctor Who Completed Treatment:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <select
                      value={selectedDoctor}
                      onChange={(e) => setSelectedDoctor(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 font-medium outline-none focus:ring-2 focus:ring-teal-700"
                    >
                      {DOCTOR_ROSTER.map((doc, i) => (
                        <option key={i} value={doc.name}>
                          {doc.name} ({doc.specialty})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Or enter custom doctor name / title..."
                      value={customDoctor}
                      onChange={(e) => setCustomDoctor(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 outline-none focus:ring-2 focus:ring-teal-700"
                    />
                  </div>
                </div>
              </div>

              {/* Diagnosis / Treatment Outcome */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Clinical Diagnosis & Treatment Resolution:
                </label>
                <input
                  type="text"
                  required
                  value={dischargeDiagnosis}
                  onChange={(e) => setDischargeDiagnosis(e.target.value)}
                  placeholder="e.g. Acute bronchitis resolved, Blood pressure stabilized"
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 font-medium outline-none focus:ring-2 focus:ring-teal-700"
                />
              </div>

              {/* Prescription / Medicines Section */}
              <div className="bg-teal-50/40 p-4 rounded-2xl border border-teal-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-teal-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Pill className="w-3.5 h-3.5 text-teal-700" />
                    Prescribed Discharge Medications:
                  </label>
                  <button
                    type="button"
                    onClick={() => handleAddMedicine(false)}
                    className="px-2.5 py-1 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition"
                  >
                    <Plus className="w-3 h-3" /> Add Medicine
                  </button>
                </div>

                {/* Quick Add Common Pills */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[11px] text-teal-800 font-bold">Quick Prescribe:</span>
                  {COMMON_DISCHARGE_MEDS.slice(0, 4).map((med, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleQuickAddMed(med, false)}
                      className="px-2 py-0.5 rounded-md bg-white border border-teal-300 text-teal-800 text-[11px] font-semibold hover:bg-teal-100/70 transition cursor-pointer"
                    >
                      + {med.name.split(' ')[0]} ({med.dosage})
                    </button>
                  ))}
                </div>

                {/* Medicine Items List */}
                <div className="space-y-2 mt-2">
                  {dischargeMeds.map((med, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-12 gap-2 bg-white p-2.5 rounded-xl border border-teal-200/60 items-center text-xs"
                    >
                      <div className="col-span-4">
                        <input
                          type="text"
                          placeholder="Medicine name..."
                          value={med.name}
                          onChange={(e) => handleUpdateMed(idx, 'name', e.target.value, false)}
                          className="w-full p-1.5 border border-slate-200 rounded-lg outline-none font-semibold text-slate-800"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="text"
                          placeholder="Dosage (500mg)"
                          value={med.dosage}
                          onChange={(e) => handleUpdateMed(idx, 'dosage', e.target.value, false)}
                          className="w-full p-1.5 border border-slate-200 rounded-lg outline-none text-slate-700"
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="text"
                          placeholder="Frequency (Twice daily)"
                          value={med.frequency}
                          onChange={(e) => handleUpdateMed(idx, 'frequency', e.target.value, false)}
                          className="w-full p-1.5 border border-slate-200 rounded-lg outline-none text-slate-700"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="text"
                          placeholder="Duration (7 Days)"
                          value={med.duration}
                          onChange={(e) => handleUpdateMed(idx, 'duration', e.target.value, false)}
                          className="w-full p-1.5 border border-slate-200 rounded-lg outline-none text-slate-700"
                        />
                      </div>
                      <div className="col-span-1 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveMed(idx, false)}
                          className="text-slate-400 hover:text-rose-600 transition p-1 cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Discharge Notes / Instructions */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Discharge Instructions & Follow-up Advice:
                </label>
                <textarea
                  rows={2}
                  value={dischargeNotes}
                  onChange={(e) => setDischargeNotes(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 outline-none focus:ring-2 focus:ring-teal-700"
                />
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* FLOW B: PATIENT CONDITION SERIOUS & SHIFT TO ROOM                         */}
          {/* ========================================================================= */}
          {careAction === 'SERIOUS_SHIFT_ROOM' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Severity Level Selector */}
              <div className="bg-rose-50/70 p-4 rounded-2xl border border-rose-200">
                <label className="text-xs font-bold text-rose-950 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  Clinical Urgency & Triage Severity:
                </label>
                <div className="grid grid-cols-3 gap-2.5 text-xs">
                  {[
                    { id: 'CRITICAL_ICU', label: '🔴 Critical / ICU Level 1', desc: 'Continuous vital monitoring' },
                    { id: 'URGENT_TRAUMA', label: '🟠 Urgent / Trauma HDU', desc: 'Acute stabilization' },
                    { id: 'INPATIENT_WARD', label: '🟡 Inpatient Medical Ward', desc: 'Bed admission' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSeverity(s.id as any)}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer transition ${
                        severity === s.id
                          ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="font-bold text-xs">{s.label}</div>
                      <div className={`text-[10px] mt-0.5 ${severity === s.id ? 'text-rose-100' : 'text-slate-400'}`}>
                        {s.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Room & Bed Allocation */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                  <Bed className="w-3.5 h-3.5 text-rose-700" />
                  Shift to Hospital Room / Bed Assignment:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <select
                      value={assignedRoom}
                      onChange={(e) => setAssignedRoom(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 font-bold outline-none focus:ring-2 focus:ring-rose-600"
                    >
                      {ROOM_OPTIONS.map((room, i) => (
                        <option key={i} value={room}>
                          {room}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Or enter custom Room / Bay number..."
                      value={customRoom}
                      onChange={(e) => setCustomRoom(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 outline-none focus:ring-2 focus:ring-rose-600"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  ℹ️ Shifting this patient will automatically increment the hospital's dynamic IPD bed occupancy count.
                </p>
              </div>

              {/* Attending Specialist Doctor */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5 text-rose-700" />
                  Attending Specialist Doctor On Call:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <select
                      value={selectedDoctor}
                      onChange={(e) => setSelectedDoctor(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 font-medium outline-none focus:ring-2 focus:ring-rose-600"
                    >
                      {DOCTOR_ROSTER.map((doc, i) => (
                        <option key={i} value={doc.name}>
                          {doc.name} ({doc.specialty})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Or custom physician name..."
                      value={customDoctor}
                      onChange={(e) => setCustomDoctor(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 outline-none focus:ring-2 focus:ring-rose-600"
                    />
                  </div>
                </div>
              </div>

              {/* Acute Symptoms & Reason for Admission */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Acute Symptoms & Critical Admission Reason:
                </label>
                <textarea
                  rows={2}
                  required
                  value={admissionReason}
                  onChange={(e) => setAdmissionReason(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 outline-none focus:ring-2 focus:ring-rose-600"
                  placeholder="e.g. Acute cardiac decompensation, respiratory exhaustion, severe trauma"
                />
              </div>

              {/* Emergency Medications Administered */}
              <div className="bg-rose-50/40 p-4 rounded-2xl border border-rose-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-rose-950 uppercase tracking-wider flex items-center gap-1.5">
                    <Pill className="w-3.5 h-3.5 text-rose-700" />
                    Immediate Emergency Medications & IV Therapy:
                  </label>
                  <button
                    type="button"
                    onClick={() => handleAddMedicine(true)}
                    className="px-2.5 py-1 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition"
                  >
                    <Plus className="w-3 h-3" /> Add IV Med
                  </button>
                </div>

                {/* Quick Add Emergency Meds */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[11px] text-rose-900 font-bold">Quick Order:</span>
                  {COMMON_EMERGENCY_MEDS.slice(0, 4).map((med, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleQuickAddMed(med, true)}
                      className="px-2 py-0.5 rounded-md bg-white border border-rose-300 text-rose-900 text-[11px] font-semibold hover:bg-rose-100/70 transition cursor-pointer"
                    >
                      + {med.name.split(' ')[1] || med.name.split(' ')[0]} ({med.dosage})
                    </button>
                  ))}
                </div>

                {/* Emergency Meds List */}
                <div className="space-y-2 mt-2">
                  {emergencyMeds.map((med, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-12 gap-2 bg-white p-2.5 rounded-xl border border-rose-200/60 items-center text-xs"
                    >
                      <div className="col-span-4">
                        <input
                          type="text"
                          placeholder="IV medication name..."
                          value={med.name}
                          onChange={(e) => handleUpdateMed(idx, 'name', e.target.value, true)}
                          className="w-full p-1.5 border border-slate-200 rounded-lg outline-none font-semibold text-slate-800"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="text"
                          placeholder="Dosage"
                          value={med.dosage}
                          onChange={(e) => handleUpdateMed(idx, 'dosage', e.target.value, true)}
                          className="w-full p-1.5 border border-slate-200 rounded-lg outline-none text-slate-700"
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="text"
                          placeholder="Route / Freq"
                          value={med.frequency}
                          onChange={(e) => handleUpdateMed(idx, 'frequency', e.target.value, true)}
                          className="w-full p-1.5 border border-slate-200 rounded-lg outline-none text-slate-700"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="text"
                          placeholder="Duration"
                          value={med.duration}
                          onChange={(e) => handleUpdateMed(idx, 'duration', e.target.value, true)}
                          className="w-full p-1.5 border border-slate-200 rounded-lg outline-none text-slate-700"
                        />
                      </div>
                      <div className="col-span-1 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveMed(idx, true)}
                          className="text-slate-400 hover:text-rose-600 transition p-1 cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-6 py-2.5 rounded-xl text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-2 ${
                careAction === 'TREATMENT_COMPLETE'
                  ? 'bg-emerald-700 hover:bg-emerald-800 shadow-emerald-700/20'
                  : 'bg-rose-700 hover:bg-rose-800 shadow-rose-700/20'
              }`}
            >
              {careAction === 'TREATMENT_COMPLETE' ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Save & Complete Treatment (Issue Discharge)
                </>
              ) : (
                <>
                  <Bed className="w-4 h-4" />
                  Shift Patient & Occupy Hospital Bed
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
