import { useState } from 'react';
import { ShieldAlert, KeyRound, CheckCircle, Flame, X, Lock } from 'lucide-react';
import type { Patient, Hospital } from '../types/ehr';

interface ConsentModalProps {
  patient: Patient;
  currentHospital: Hospital;
  onGrantConsent: (type: 'STANDARD' | 'EMERGENCY_OVERRIDE') => void;
  onClose: () => void;
}

export const ConsentModal: React.FC<ConsentModalProps> = ({
  patient,
  currentHospital,
  onGrantConsent,
  onClose,
}) => {
  const [otpInput, setOtpInput] = useState('4829');
  const [emergencyReason, setEmergencyReason] = useState('');
  const [mode, setMode] = useState<'STANDARD' | 'EMERGENCY'>('STANDARD');

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-hidden">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full max-h-[94vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Sticky Header */}
        <div className="bg-gradient-to-r from-teal-700 to-teal-900 px-4 sm:px-6 py-4 text-white flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-teal-200 shrink-0 border border-white/20">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold leading-tight">Cross-Hospital Consent</h3>
              <p className="text-[11px] sm:text-xs text-teal-100 truncate max-w-xs">
                Verifying authorization for {patient.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-teal-200 hover:text-white p-1.5 rounded-xl bg-teal-800/60 hover:bg-teal-800 cursor-pointer transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Info Box */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Patient Identity:</span>
              <span className="font-bold text-slate-800">{patient.name} ({patient.id})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Requesting Facility:</span>
              <span className="font-bold text-teal-800">{currentHospital.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Registered Phone:</span>
              <span className="font-mono text-slate-700 font-semibold">{patient.phone}</span>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              onClick={() => setMode('STANDARD')}
              className={`py-2 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                mode === 'STANDARD'
                  ? 'bg-white text-teal-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5 text-teal-700" />
              Standard OTP
            </button>
            <button
              onClick={() => setMode('EMERGENCY')}
              className={`py-2 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                mode === 'EMERGENCY'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-rose-700'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              Break-Glass
            </button>
          </div>

          {mode === 'STANDARD' ? (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                4-digit verification code sent to patient's registered mobile number{' '}
                <span className="font-mono text-teal-800 font-bold">{patient.phone}</span>.
              </p>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Enter 4-Digit Patient OTP:</label>
                <input
                  type="text"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  maxLength={6}
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-center text-xl font-mono tracking-widest text-teal-900 outline-none focus:ring-2 focus:ring-teal-700"
                  placeholder="4829"
                />
              </div>

              <button
                onClick={() => onGrantConsent('STANDARD')}
                className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs rounded-xl shadow-md shadow-teal-700/20 flex items-center justify-center gap-2 transition cursor-pointer active:scale-98"
              >
                <CheckCircle className="w-4 h-4" />
                Verify & Unlock Full EHR Records
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs">
                <span className="font-bold flex items-center gap-1 mb-1">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  Emergency Protocol Notice
                </span>
                Use this ONLY if patient is unconscious, in severe trauma, or unable to give OTP.
                This action triggers an immediate forensic audit log.
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Clinical Emergency Justification:</label>
                <textarea
                  value={emergencyReason}
                  onChange={(e) => setEmergencyReason(e.target.value)}
                  placeholder="e.g. Unconscious patient, road traffic trauma triage, immediate blood group & allergy review."
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-rose-600"
                />
              </div>

              <button
                onClick={() => onGrantConsent('EMERGENCY_OVERRIDE')}
                className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-rose-600/20 flex items-center justify-center gap-2 transition cursor-pointer active:scale-98"
              >
                <Flame className="w-4 h-4" />
                Authorize Emergency Break-Glass Access
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
