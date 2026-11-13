import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ShieldCheck, Printer, Copy, Check, HeartPulse, AlertTriangle, Hospital, Phone, Lock } from 'lucide-react';
import type { Patient, Hospital as HospitalType } from '../types/ehr';

interface PatientQRCardProps {
  patient: Patient;
  primaryHospital?: HospitalType;
}

export const PatientQRCard: React.FC<PatientQRCardProps> = ({ patient, primaryHospital }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(patient.qrPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-xl shadow-slate-100 relative overflow-hidden w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 sm:pb-5 border-b border-slate-100 gap-3">
        <div>
          <span className="text-xs font-bold text-teal-800 uppercase tracking-widest flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-teal-700" />
            National Healthcare Interoperability Network
          </span>
          <h2 className="text-lg sm:text-xl font-black text-slate-800 mt-1">Universal Patient QR Health Card</h2>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleCopyPayload}
            className="flex-1 sm:flex-none px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-200 transition cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-teal-700" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy Token'}
          </button>
          <button
            onClick={() => window.print()}
            className="flex-1 sm:flex-none px-3.5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm shadow-teal-700/20 transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Card
          </button>
        </div>
      </div>

      {/* The Printable / Scanable Smart Card */}
      <div className="mt-5 sm:mt-6 flex flex-col md:flex-row items-center gap-5 sm:gap-6 bg-gradient-to-br from-slate-50 to-teal-50/30 border border-teal-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm relative w-full">
        {/* Left Side: QR Code Area */}
        <div className="flex flex-col items-center bg-white p-4 sm:p-5 rounded-2xl shadow-md shrink-0 border-2 border-teal-600/30">
          <QRCodeSVG
            value={patient.qrPayload}
            size={160}
            level="H"
            includeMargin={true}
            className="w-36 h-36 sm:w-44 sm:h-44"
          />
          <div className="mt-2 text-center">
            <span className="text-xs font-mono font-bold text-slate-800 tracking-wider block">
              {patient.id}
            </span>
            <span className="text-[10px] text-slate-500 font-medium block">
              SCAN AT ANY PARTICIPATING HOSPITAL
            </span>
          </div>
        </div>

        {/* Right Side: Patient Demographics & Medical Flag */}
        <div className="flex-1 w-full space-y-4">
          <div className="flex items-start justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">{patient.name}</h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                CNIC / ID: <span className="text-slate-800 font-bold">{patient.nationalId}</span> • Age: {patient.age} Yrs ({patient.gender})
              </p>
            </div>
            <div className="px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-1.5">
              <HeartPulse className="w-3.5 h-3.5 text-rose-600" />
              {patient.bloodGroup}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Primary Facility</span>
              <div className="flex items-center gap-1.5 mt-1 font-semibold text-slate-800">
                <Hospital className="w-3.5 h-3.5 text-teal-700" />
                {primaryHospital?.name || 'Central Health Registry'}
              </div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Next of Kin Contact</span>
              <div className="flex items-center gap-1.5 mt-1 font-semibold text-slate-800">
                <Phone className="w-3.5 h-3.5 text-teal-700" />
                {patient.emergencyContact.name} ({patient.emergencyContact.phone})
              </div>
            </div>
          </div>

          {/* Allergies Highlight */}
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
            <div className="flex items-center gap-1.5 text-rose-800 text-xs font-bold mb-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              Documented Medical Allergies (System-Wide Critical Warning)
            </div>
            <div className="flex flex-wrap gap-1.5">
              {patient.allergies.map((allergy, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md bg-white text-rose-700 text-xs font-bold border border-rose-200"
                >
                  {allergy}
                </span>
              ))}
            </div>
          </div>

          {/* Secret PIN for self-service */}
          <div className="flex items-center justify-between p-3 bg-teal-50 rounded-xl border border-teal-200 text-xs">
            <span className="text-teal-900 font-semibold flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-teal-700" />
              Patient Self-Service Kiosk PIN:
            </span>
            <span className="font-mono font-bold text-sm text-teal-900 bg-white px-3 py-0.5 rounded-lg border border-teal-200">
              {patient.accessPin}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
