import React, { useState } from 'react';
import { Lock, ShieldAlert, Send, CheckCircle2, X } from 'lucide-react';
import type { Patient, Hospital } from '../types/ehr';

interface PromotionRestrictedModalProps {
  patient: Patient;
  currentHospital: Hospital;
  hospitals: Hospital[];
  onClose: () => void;
  onRequestPermission: (patient: Patient, reason: string) => void;
  onOpenAssignModal?: () => void;
}

export const PromotionRestrictedModal: React.FC<PromotionRestrictedModalProps> = ({
  patient,
  currentHospital,
  hospitals,
  onClose,
  onRequestPermission,
  onOpenAssignModal: _onOpenAssignModal,
}) => {
  const homeHospital = hospitals.find((h) => h.id === patient.primaryHospitalId) || {
    name: patient.primaryHospitalId === 'hosp-shifa' ? 'Shifa International' : patient.primaryHospitalId === 'hosp-aku' ? 'Aga Khan' : 'Mayo Hospital',
    badge: patient.primaryHospitalId === 'hosp-shifa' ? 'SIH-ISB' : patient.primaryHospitalId === 'hosp-aku' ? 'AKUH-KHI' : 'MAYO-LHE',
  };

  const [requestReason, setRequestReason] = useState(
    `Patient presenting at ${currentHospital.name} for urgent treatment. Requesting clinical update permission to manage encounter, add records, and promote status.`
  );
  const [isSent, setIsSent] = useState(false);

  const handleSend = () => {
    onRequestPermission(patient, requestReason);
    setIsSent(true);
    setTimeout(() => {
      onClose();
    }, 2200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-rose-700 px-6 py-4 text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shrink-0">
              <Lock className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h3 className="text-base font-bold leading-tight">
                Clinical Promotion Restricted
              </h3>
              <p className="text-xs text-amber-100">
                Patient Managed by {homeHospital.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-amber-200 hover:text-white p-2 rounded-xl bg-white/10 hover:bg-white/20 cursor-pointer transition shrink-0"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 text-xs">
          {/* Patient Info Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-800 text-sm">{patient.name}</div>
              <div className="text-slate-500 font-mono text-[11px]">
                {patient.id} &bull; CNIC: {patient.nationalId}
              </div>
            </div>
            <span className="bg-amber-100 text-amber-900 border border-amber-300 font-bold px-2.5 py-1 rounded-lg text-[11px]">
              Home: {homeHospital.name}
            </span>
          </div>

          {/* Explanation Alert */}
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-rose-950 space-y-2">
            <div className="flex items-center gap-2 font-bold text-xs text-rose-900">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Multi-Hospital EHR Governance Rule:</span>
            </div>
            <p className="text-rose-800 text-[11.5px] leading-relaxed">
              <b>{currentHospital.name}</b> cannot directly promote, discharge, or shift patients registered at <b>{homeHospital.name}</b>.
              To ensure medical accountability and avoid conflicting treatments, clinical management authority resides with the patient's home hospital.
            </p>
          </div>

          {!isSent ? (
            <div className="space-y-3 pt-1">
              <div className="font-bold text-slate-800 text-xs">
                How to obtain authorization for this patient:
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2.5">
                <label className="font-semibold text-slate-700 block">
                  Send Authorization Request to <b>{homeHospital.name}</b>:
                </label>
                <textarea
                  rows={2}
                  value={requestReason}
                  onChange={(e) => setRequestReason(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-white text-slate-800 text-xs outline-none"
                />
                <button
                  type="button"
                  onClick={handleSend}
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  Request Clinical Permission from {homeHospital.name}
                </button>
              </div>

              <div className="text-center text-slate-500 text-[11px] pt-1">
                Once {homeHospital.name} approves your request, this patient's promotion and consultation controls will unlock automatically.
              </div>
            </div>
          ) : (
            <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2 animate-in fade-in">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-emerald-950 text-sm">
                Authorization Request Dispatched!
              </h4>
              <p className="text-xs text-emerald-800">
                A high-priority notification was delivered to <b>{homeHospital.name}</b>. As soon as their staff grants permission, your station will receive an instant unlock alert.
              </p>
            </div>
          )}

          {/* Action Footer */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
