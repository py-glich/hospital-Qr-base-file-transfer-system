import React, { useState } from 'react';
import { Building2, ArrowRight, UserCheck, X, Send } from 'lucide-react';
import type { Patient, Hospital, MedicalRecord, HospitalId } from '../types/ehr';

interface AssignPatientModalProps {
  patient: Patient;
  currentHospital: Hospital;
  hospitals: Hospital[];
  onClose: () => void;
  onAssignPatient: (
    patientId: string,
    targetHospitalId: HospitalId,
    targetHospitalName: string,
    transferData: {
      transferReason: string;
      handoverDoctor: string;
      targetDepartment: string;
    },
    generatedRecord: MedicalRecord
  ) => void;
}

const COMMON_TRANSFER_REASONS = [
  'Specialized Tertiary Care Referral (Cardiothoracic / Neuro)',
  'Inpatient ICU / Ventilator Bed Escalation',
  'Patient Geographical Relocation & Home Node Transfer',
  'Advanced Diagnostics / Oncology Specialized Management',
  'Orthopedic Trauma & Joint Reconstruction Referral',
];

export const AssignPatientModal: React.FC<AssignPatientModalProps> = ({
  patient,
  currentHospital,
  hospitals,
  onClose,
  onAssignPatient,
}) => {
  // Candidate destination hospitals (excluding current)
  const candidateHospitals = hospitals.filter((h) => h.id !== currentHospital.id);

  const [selectedTargetHospId, setSelectedTargetHospId] = useState<HospitalId>(
    (candidateHospitals[0]?.id as HospitalId) || 'hosp-aku'
  );
  const [targetDepartment, setTargetDepartment] = useState('Cardiology & Heart Center');
  const [transferReason, setTransferReason] = useState(COMMON_TRANSFER_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [handoverDoctor, setHandoverDoctor] = useState(
    currentHospital.id.includes('aku')
      ? 'Dr. Emma Scott'
      : currentHospital.id.includes('shifa')
      ? 'Prof. Dr. Salman Qureshi'
      : 'Dr. Paul Ford'
  );
  const [clinicalNotes, setClinicalNotes] = useState(
    'Formal clinical handover executed. Transferring complete universal electronic health dossier and active medications list to receiving hospital.'
  );

  const targetHospitalObj = hospitals.find((h) => h.id === selectedTargetHospId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetHospitalObj) return;

    const finalReason = customReason.trim() || transferReason;
    const timestamp = new Date().toISOString().split('T')[0];

    const generatedRecord: MedicalRecord = {
      id: `REC-TRANS-${Date.now().toString().slice(-4)}`,
      patientId: patient.id,
      hospitalId: currentHospital.id,
      hospitalName: currentHospital.name,
      doctorName: handoverDoctor,
      doctorSpecialty: 'Consultant Incharge (Handover)',
      date: timestamp,
      type: 'Discharge Summary',
      diagnosis: `Inter-Hospital Patient Transfer: ${finalReason} → ${targetHospitalObj.name}`,
      symptoms: ['Patient Transfer Authorized', 'Full Record Dossier Forwarded', 'Target: ' + targetHospitalObj.name],
      vitals: {
        bloodPressure: '125/82 mmHg',
        heartRate: '78 bpm',
        temperature: '98.6 °F',
        spO2: '98% room air',
      },
      medications: (patient.dischargeMedications as any) || [],
      labFindings: [`Patient transferred to ${targetHospitalObj.name}. Receiving station notified in real-time.`],
      allergiesObserved: patient.allergies || [],
      doctorNotes: `OFFICIAL CLINICAL TRANSFER: Patient ${patient.name} (${patient.id}) transferred from ${currentHospital.name} to ${targetHospitalObj.name} (${targetDepartment}). Reason: ${finalReason}. Handover Physician: ${handoverDoctor}. Notes: ${clinicalNotes}`,
    };

    onAssignPatient(
      patient.id,
      selectedTargetHospId,
      targetHospitalObj.name,
      {
        transferReason: finalReason,
        handoverDoctor,
        targetDepartment,
      },
      generatedRecord
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-teal-800 via-teal-900 to-slate-900 px-6 py-4 text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shrink-0">
              <Building2 className="w-5 h-5 text-teal-200" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold leading-tight">
                Transfer & Assign Patient to Another Hospital
              </h3>
              <p className="text-xs text-teal-200/90">
                Origin Node: {currentHospital.name} &bull; Cross-Hospital Patient Handover
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

        {/* Patient Summary Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-700 text-white font-black flex items-center justify-center text-xs">
              {patient.name.charAt(0)}
            </div>
            <div>
              <div className="font-bold text-slate-800 text-sm">{patient.name}</div>
              <div className="text-slate-500 font-mono text-[11px]">
                {patient.id} &bull; CNIC: {patient.nationalId} &bull; Blood: <b className="text-teal-800">{patient.bloodGroup}</b>
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-slate-500 text-[10.5px] block font-semibold">Current Home Station:</span>
            <span className="font-bold text-teal-900 bg-teal-100/70 px-2 py-0.5 rounded-md text-[11px]">
              {patient.primaryHospitalId === 'hosp-aku'
                ? 'Aga Khan'
                : patient.primaryHospitalId === 'hosp-shifa'
                ? 'Shifa'
                : 'Mayo'}
            </span>
          </div>
        </div>

        {/* Transfer Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs overflow-y-auto max-h-[75vh]">
          {/* Visual Route Indicator */}
          <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-2xl p-4 flex items-center justify-between gap-3">
            <div className="flex-1 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Transferring From</span>
              <b className="text-xs text-teal-950 font-black">{currentHospital.name}</b>
            </div>
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-teal-700 text-white shrink-0 shadow-sm">
              <ArrowRight className="w-4 h-4" />
            </div>
            <div className="flex-1 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Receiving Hospital</span>
              <b className="text-xs text-emerald-900 font-black">
                {targetHospitalObj?.name || 'Selected Hospital'}
              </b>
            </div>
          </div>

          {/* 1. Destination Hospital Select */}
          <div>
            <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              1. Select Destination Hospital Station *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {candidateHospitals.map((hosp) => {
                const isSelected = selectedTargetHospId === hosp.id;
                return (
                  <div
                    key={hosp.id}
                    onClick={() => setSelectedTargetHospId(hosp.id as HospitalId)}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition flex items-center gap-3 ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50/70 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        isSelected ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {hosp.badge.slice(0, 2)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-slate-900 text-xs truncate">{hosp.name}</div>
                      <div className="text-[10.5px] text-slate-500">
                        {hosp.city} &bull; Station Code: <span className="font-mono">{hosp.badge}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Target Department & Handover Doctor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Target Department / Ward *</label>
              <select
                value={targetDepartment}
                onChange={(e) => setTargetDepartment(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 outline-none font-medium"
              >
                <option value="Cardiology & Heart Center">Cardiology & Heart Center</option>
                <option value="Inpatient Monitored Ward 3">Inpatient Monitored Ward 3</option>
                <option value="ICU Critical Care Resuscitation Bay">ICU Critical Care Resuscitation Bay</option>
                <option value="Emergency Trauma & Resus Unit">Emergency Trauma & Resus Unit</option>
                <option value="Orthopedic & Spine Surgery">Orthopedic & Spine Surgery</option>
                <option value="Pulmonology & Respiratory Care">Pulmonology & Respiratory Care</option>
                <option value="Nephrology & Dialysis Ward">Nephrology & Dialysis Ward</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Handover Attending Doctor *</label>
              <input
                type="text"
                required
                value={handoverDoctor}
                onChange={(e) => setHandoverDoctor(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 outline-none font-medium"
                placeholder="Doctor executing handover"
              />
            </div>
          </div>

          {/* 3. Reason for Inter-Hospital Transfer */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Transfer & Referral Reason *</label>
            <select
              value={transferReason}
              onChange={(e) => setTransferReason(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 outline-none font-medium mb-1.5"
            >
              {COMMON_TRANSFER_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
              <option value="OTHER">Other Custom Clinical Reason...</option>
            </select>

            {transferReason === 'OTHER' && (
              <input
                type="text"
                placeholder="Specify specific clinical reason for transfer..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-800 outline-none mt-1"
                required
              />
            )}
          </div>

          {/* 4. Clinical Notes */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Clinical Handover Summary & Instructions</label>
            <textarea
              rows={3}
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 outline-none font-medium"
              placeholder="Clinical instructions for destination hospital..."
            />
          </div>

          {/* Real-time Notification Guarantee Box */}
          <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 flex items-start gap-2.5 text-sky-900 text-[11px]">
            <Send className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            <div>
              <b className="text-sky-950">Automated Cross-Hospital Notification:</b>
              <p className="mt-0.5 text-sky-800">
                Submitting this transfer will immediately notify <b>{targetHospitalObj?.name}</b> in their Notification Center.
                The receiving hospital will be granted clinical management and promotion authority for this patient.
              </p>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-md shadow-teal-700/20 transition cursor-pointer flex items-center gap-2"
            >
              <UserCheck className="w-4 h-4" />
              Transfer & Notify {targetHospitalObj?.badge || 'Hospital'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
