import { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Building2,
  Key,
  QrCode,
  Camera,
  AlertCircle,
  ArrowRight,
  HeartPulse,
  UserCheck,
} from 'lucide-react';
import type { Hospital, StaffUser } from '../types/ehr';

interface LandingGatewayProps {
  hospitals: Hospital[];
  onStaffLogin: (user: StaffUser, hospital: Hospital) => void;
  onPatientPortalEnter: () => void;
}

export const LandingGateway: React.FC<LandingGatewayProps> = ({
  hospitals,
  onStaffLogin,
  onPatientPortalEnter,
}) => {
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>(hospitals[0].id);
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const currentHospital = hospitals.find((h) => h.id === selectedHospitalId) || hospitals[0];

  const handleHospitalChange = (hId: string) => {
    setSelectedHospitalId(hId);
    setErrorMsg(null);
    setPassword('');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (loginId.trim() === currentHospital.adminLoginId && password.trim() === currentHospital.specificPassword) {
      const staffUser: StaffUser = {
        id: `STAFF-${currentHospital.badge}`,
        name: `${currentHospital.name.split(' ')[0]} Administrator`,
        role: 'HOSPITAL_ADMIN',
        hospitalId: currentHospital.id,
        licenseNumber: currentHospital.code,
        email: loginId.trim(),
      };
      onStaffLogin(staffUser, currentHospital);
      return;
    }

    const matchedStaff = currentHospital.allowedStaff.find(
      (s) => s.loginId.toLowerCase() === loginId.trim().toLowerCase() && s.password === password.trim()
    );

    if (matchedStaff) {
      const staffUser: StaffUser = {
        id: `STAFF-${matchedStaff.licenseNumber}`,
        name: matchedStaff.name,
        role: matchedStaff.role,
        hospitalId: currentHospital.id,
        licenseNumber: matchedStaff.licenseNumber,
        email: matchedStaff.loginId,
      };
      onStaffLogin(staffUser, currentHospital);
      return;
    }

    setErrorMsg(
      `Access Denied: Invalid credentials for ${currentHospital.name}. Please enter the correct Login ID and specific password assigned to this facility.`
    );
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-50 via-teal-50/20 to-slate-100 flex flex-col justify-between p-3 sm:p-6 lg:p-8 overflow-y-auto pb-24">
      {/* Top Banner */}
      <div className="max-w-6xl w-full mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-teal-700 to-teal-900 flex items-center justify-center text-white shadow-md shadow-teal-700/20 shrink-0">
            <HeartPulse className="w-6 h-6 sm:w-7 sm:h-7 text-teal-200" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-tight">MedPulse Health Network</h1>
            <p className="text-[11px] sm:text-xs text-slate-500">Universal QR Electronic Health Record & Interoperability</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-teal-800 bg-white px-3.5 py-1.5 rounded-full border border-teal-200/80 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Connected: 3 Major Hospital Hubs Live
        </div>
      </div>

      {/* Main Gateway Split View */}
      <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch my-auto py-2 sm:py-4">
        {/* LEFT / PRIMARY SECTION: HOSPITAL STAFF & ADMIN LOGIN */}
        <div className="lg:col-span-7 bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-slate-200 shadow-xl shadow-slate-100/70 flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center gap-3 pb-4 sm:pb-5 border-b border-slate-100">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">Hospital Staff & Admin Gateway</h2>
                <p className="text-[11px] sm:text-xs text-slate-500">
                  Select your hospital facility and enter institutional credentials
                </p>
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl sm:rounded-2xl flex items-start gap-2.5 text-xs text-rose-800">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLoginSubmit} className="mt-5 space-y-4">
              {/* 1. Select Hospital */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-teal-700" />
                  1. Select Hospital Facility Node:
                </label>
                <select
                  value={selectedHospitalId}
                  onChange={(e) => handleHospitalChange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 font-bold outline-none focus:ring-2 focus:ring-teal-700 focus:bg-white cursor-pointer transition min-h-[44px]"
                >
                  {hospitals.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} — {h.city} ({h.badge})
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Login ID */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-teal-700" />
                  2. Hospital Staff Login ID:
                </label>
                <input
                  type="text"
                  required
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  placeholder="e.g. admin@aku.edu.pk or doctor email"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 outline-none focus:ring-2 focus:ring-teal-700 focus:bg-white transition min-h-[44px]"
                />
              </div>

              {/* 3. Specific Password */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-teal-700" />
                  3. Specific Password for {currentHospital.name.split(' ')[0]}:
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter hospital-specific password"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 outline-none focus:ring-2 focus:ring-teal-700 focus:bg-white transition min-h-[44px]"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full mt-2 py-3 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md shadow-teal-700/20 flex items-center justify-center gap-2 cursor-pointer transition active:scale-98 min-h-[46px]"
              >
                <ShieldCheck className="w-4 h-4" />
                Authenticate & Access {currentHospital.badge} System
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT SECTION: PATIENT SELF-SERVICE QR SCANNER (CUSTOMER ONLY) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-teal-800 to-slate-900 rounded-2xl sm:rounded-3xl p-5 sm:p-8 text-white shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-600/20 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10">
            <span className="px-3 py-1 rounded-full bg-teal-700/50 border border-teal-500/40 text-teal-200 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 mb-3 sm:mb-4">
              <QrCode className="w-3.5 h-3.5 text-teal-300" />
              For Patients & Customers Only
            </span>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
              Are You a Patient? Scan Your QR Code Here
            </h2>

            <p className="text-xs text-teal-100/80 mt-2.5 leading-relaxed">
              No login ID or complicated passwords needed. Simply point your Universal Health QR Card to the camera to view:
            </p>

            <ul className="mt-3.5 space-y-2 text-xs text-teal-100">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0"></span>
                Official Diagnostic & Lab Reports from all hospitals
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0"></span>
                Active Doctor Prescriptions & Dosage instructions
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0"></span>
                Digital Health ID Card for next clinical visit
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0"></span>
                Full privacy protected with your secret 4-digit PIN
              </li>
            </ul>
          </div>

          <div className="relative z-10 mt-6 sm:mt-8 pt-5 border-t border-teal-700/50">
            <button
              onClick={onPatientPortalEnter}
              className="w-full py-3.5 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-slate-950 font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2.5 cursor-pointer transition active:scale-98 min-h-[46px]"
            >
              <Camera className="w-4 h-4 text-slate-950" />
              Open Camera Scanner to View My Reports
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>
            <p className="text-[10px] sm:text-[11px] text-teal-200/70 text-center mt-2.5">
              Secure patient self-service kiosk mode • Encrypted QR access
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-6xl w-full mx-auto text-center pt-4 sm:pt-6 text-[11px] text-slate-400 flex flex-col sm:flex-row items-center justify-between border-t border-slate-200 gap-2">
        <span>© 2026 MedPulse National Health Interoperability Infrastructure. All rights reserved.</span>
        <span className="font-medium">Standards: HL7 FHIR Interoperability • AES-256 Storage Encryption</span>
      </div>
    </div>
  );
};
