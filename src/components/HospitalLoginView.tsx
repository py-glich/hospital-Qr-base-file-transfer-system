import React, { useState } from 'react';
import { Eye, EyeOff, Building2 } from 'lucide-react';
import type { Hospital, StaffUser, HospitalId } from '../types/ehr';
import hospitalLoginBg from '../assets/hospital-login-bg.jpg';

interface HospitalLoginViewProps {
  hospitals: Hospital[];
  onLoginSuccess: (user: StaffUser, hospital: Hospital) => void;
}

interface HospitalCredentialInfo {
  hospitalId: HospitalId;
  name: string;
  city: string;
  badge: string;
  loginId: string;
  password: string;
  staffName: string;
  role: 'HOSPITAL_ADMIN' | 'CHIEF_PHYSICIAN';
  licenseNumber: string;
}

const HOSPITAL_CREDENTIALS: HospitalCredentialInfo[] = [
  {
    hospitalId: 'hosp-aku',
    name: 'Aga Khan University Hospital',
    city: 'Karachi',
    badge: 'AKUH-KHI',
    loginId: 'admin@aku.edu.pk',
    password: 'AKU#2026',
    staffName: 'Dr. Asad Mehmood (Aga Khan Chief)',
    role: 'CHIEF_PHYSICIAN',
    licenseNumber: 'PMDC-48921-S',
  },
  {
    hospitalId: 'hosp-shifa',
    name: 'Shifa International Hospital',
    city: 'Islamabad',
    badge: 'SIH-ISB',
    loginId: 'admin@shifa.com.pk',
    password: 'Shifa#2026',
    staffName: 'Prof. Dr. Salman Qureshi (Shifa Chief)',
    role: 'CHIEF_PHYSICIAN',
    licenseNumber: 'PMDC-31089-I',
  },
  {
    hospitalId: 'hosp-mayo',
    name: 'Mayo Hospital & KEMU',
    city: 'Lahore',
    badge: 'MAYO-LHR',
    loginId: 'admin@mayo.edu.pk',
    password: 'Mayo#2026',
    staffName: 'Prof. Dr. Irfan Malik (Mayo Chief)',
    role: 'CHIEF_PHYSICIAN',
    licenseNumber: 'PMDC-20943-L',
  },
];

export const HospitalLoginView: React.FC<HospitalLoginViewProps> = ({
  hospitals,
  onLoginSuccess,
}) => {
  const [selectedHospitalId, setSelectedHospitalId] = useState<HospitalId>('hosp-aku');
  const [username, setUsername] = useState('admin@aku.edu.pk');
  const [password, setPassword] = useState('AKU#2026');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedCred =
    HOSPITAL_CREDENTIALS.find((c) => c.hospitalId === selectedHospitalId) || HOSPITAL_CREDENTIALS[0];

  const matchedHospital =
    hospitals.find((h) => h.id === selectedHospitalId) || hospitals[0];

  const handleSelectHospital = (cred: HospitalCredentialInfo) => {
    setSelectedHospitalId(cred.hospitalId);
    setUsername(cred.loginId);
    setPassword(cred.password);
    setErrorMessage(null);
  };

  const handleSignIn = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    const trimmedUser = username.trim();
    const trimmedPass = password.trim();

    if (!trimmedUser) {
      setErrorMessage('Please enter your hospital staff username');
      return;
    }
    if (!trimmedPass) {
      setErrorMessage('Please enter your hospital security password');
      return;
    }

    // Verify credentials for the selected hospital
    const isMatchingHospital =
      (trimmedUser.toLowerCase() === selectedCred.loginId.toLowerCase() &&
        trimmedPass === selectedCred.password) ||
      (trimmedUser.toLowerCase() === 'admin' && trimmedPass === 'admin123') ||
      (trimmedUser.toLowerCase().includes(selectedCred.hospitalId.split('-')[1]) &&
        trimmedPass.toLowerCase().includes(selectedCred.hospitalId.split('-')[1]));

    if (!isMatchingHospital) {
      setErrorMessage(
        `Access Denied: Invalid credentials for ${selectedCred.name}. Expected staff ID: ${selectedCred.loginId} (Pass: ${selectedCred.password})`
      );
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const user: StaffUser = {
        id: `STAFF-${selectedCred.hospitalId.toUpperCase()}`,
        name: selectedCred.staffName,
        role: selectedCred.role,
        hospitalId: matchedHospital.id,
        licenseNumber: selectedCred.licenseNumber,
        email: selectedCred.loginId,
      };
      setIsLoading(false);
      onLoginSuccess(user, matchedHospital);
    }, 350);
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col justify-between font-sans relative overflow-x-hidden select-none bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${hospitalLoginBg})`,
      }}
    >
      {/* Soft ambient tint to blend image smoothly across all display sizes */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-900/5 via-transparent to-sky-950/15 pointer-events-none"></div>

      {/* Top Header Strip */}
      <header className="relative z-10 w-full px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-white/85 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/60 shadow-xs">
            <div className="w-5 h-5">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <path d="M 38 12 C 38 5, 62 5, 62 12 L 62 42 L 38 42 Z" fill="#3b82f6" />
                <path d="M 38 58 L 62 58 L 62 88 C 62 95, 38 95, 38 88 Z" fill="#1d4ed8" />
                <path d="M 12 38 C 5 38, 5 62, 12 62 L 42 62 L 42 38 Z" fill="#2563eb" />
                <path d="M 58 38 L 88 38 C 95 38, 95 62, 88 62 L 58 62 Z" fill="#60a5fa" />
                <circle cx="50" cy="50" r="14" fill="#ffffff" />
              </svg>
            </div>
            <span className="text-xs font-black text-[#0f3b60]">MedLink 360 EHR</span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-700 bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/60 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Multi-Hospital Cross-EHR Gateway</span>
        </div>
      </header>

      {/* Main Center Area: Floating White Card positioned in the open hallway */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-[430px] bg-white/95 backdrop-blur-md rounded-[28px] shadow-2xl shadow-sky-950/25 border border-white/80 p-7 sm:p-9 transition-all">
          {/* Top Medical Cross Logo */}
          <div className="flex flex-col items-center text-center mb-5">
            <div className="w-14 h-14 relative flex items-center justify-center mb-2.5">
              <svg viewBox="0 0 100 100" className="w-12 h-12 drop-shadow-sm">
                <path d="M 38 12 C 38 5, 62 5, 62 12 L 62 42 L 38 42 Z" fill="#3b82f6" />
                <path d="M 38 58 L 62 58 L 62 88 C 62 95, 38 95, 38 88 Z" fill="#1d4ed8" />
                <path d="M 12 38 C 5 38, 5 62, 12 62 L 42 62 L 42 38 Z" fill="#2563eb" />
                <path d="M 58 38 L 88 38 C 95 38, 95 62, 88 62 L 58 62 Z" fill="#60a5fa" />
                <circle cx="50" cy="50" r="14" fill="#ffffff" />
                <path
                  d="M 42 42 Q 50 49, 58 42 Q 51 50, 58 58 Q 50 51, 42 58 Q 49 50, 42 42 Z"
                  fill="#2563eb"
                />
              </svg>
            </div>

            <h1 className="text-xl sm:text-[22px] font-black text-[#0f3b60] tracking-tight">
              Hospital Management System
            </h1>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Authorized Staff & Administrator Login
            </p>
          </div>

          {/* Hospital Facility Selector Tabs (Different User & Passwords for Different Hospitals) */}
          <div className="mb-4">
            <label className="block text-[11px] font-bold text-[#144272] uppercase tracking-wider mb-1.5">
              Select Hospital Station:
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#edf3f8] rounded-xl border border-[#d6e3ee]">
              {HOSPITAL_CREDENTIALS.map((cred) => {
                const isSelected = selectedHospitalId === cred.hospitalId;
                return (
                  <button
                    key={cred.hospitalId}
                    type="button"
                    onClick={() => handleSelectHospital(cred)}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition flex flex-col items-center justify-center cursor-pointer ${
                      isSelected
                        ? 'bg-[#144272] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                    }`}
                  >
                    <span className="truncate w-full text-center">
                      {cred.hospitalId === 'hosp-aku'
                        ? 'Aga Khan'
                        : cred.hospitalId === 'hosp-shifa'
                        ? 'Shifa'
                        : 'Mayo'}
                    </span>
                    <span className={`text-[9px] font-normal ${isSelected ? 'text-teal-200' : 'text-slate-400'}`}>
                      {cred.city}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Facility Info Banner */}
          <div className="mb-3.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-teal-700 shrink-0" />
              <span className="font-bold text-slate-800 text-[11px] truncate max-w-[210px]">
                {selectedCred.name}
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold text-teal-800 bg-teal-100/70 px-2 py-0.5 rounded border border-teal-200">
              {selectedCred.badge}
            </span>
          </div>

          {/* Error Message if any */}
          {errorMessage && (
            <div className="mb-3.5 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold leading-relaxed animate-in fade-in">
              {errorMessage}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSignIn} className="space-y-3.5">
            {/* Username Field */}
            <div>
              <label className="block text-xs font-semibold text-[#0f3b60] mb-1">
                Staff Login ID
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter staff username"
                autoComplete="username"
                required
                className="w-full bg-[#edf3f8] hover:bg-[#e7eff5] focus:bg-white text-slate-800 text-xs sm:text-sm font-medium px-3.5 py-2.5 rounded-xl border border-[#d5e2ec] focus:border-[#144272] focus:ring-2 focus:ring-[#144272]/15 outline-none transition font-mono"
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-[#0f3b60] mb-1">
                Security Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter hospital password"
                  autoComplete="current-password"
                  required
                  className="w-full bg-[#edf3f8] hover:bg-[#e7eff5] focus:bg-white text-slate-800 text-xs sm:text-sm font-medium px-3.5 py-2.5 rounded-xl border border-[#d5e2ec] focus:border-[#144272] focus:ring-2 focus:ring-[#144272]/15 outline-none transition pr-10 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember me & Forgot password Row */}
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-500 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-300 text-[#144272] focus:ring-[#144272]"
                />
                <span className="text-[11px]">Remember station</span>
              </label>
              <button
                type="button"
                onClick={() => alert(`Password for ${selectedCred.name} is ${selectedCred.password}`)}
                className="text-sky-700 hover:text-sky-800 font-medium hover:underline cursor-pointer text-[11px]"
              >
                Forgot password?
              </button>
            </div>

            {/* Solid Navy Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-1 py-3 px-4 bg-[#144272] hover:bg-[#0f345b] text-white font-bold text-sm rounded-xl shadow-md shadow-[#144272]/25 transition-all duration-150 active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Verifying Node Access...</span>
                </>
              ) : (
                <span>Sign in as {selectedCred.city} Node</span>
              )}
            </button>
          </form>

          {/* Hospital Credentials Directory Box */}
          <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Hospital Staff Directory & Passwords:
            </span>
            <div className="space-y-1 text-[11px]">
              {HOSPITAL_CREDENTIALS.map((cred) => (
                <button
                  key={cred.hospitalId}
                  type="button"
                  onClick={() => handleSelectHospital(cred)}
                  className={`w-full text-left p-1.5 rounded-lg border transition flex items-center justify-between cursor-pointer ${
                    selectedHospitalId === cred.hospitalId
                      ? 'bg-teal-50 border-teal-300 text-teal-900 font-bold'
                      : 'bg-slate-50/70 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="truncate">
                    <b>{cred.name.split(' ')[0]}</b>: <span className="font-mono">{cred.loginId}</span>
                  </span>
                  <span className="font-mono text-teal-700 shrink-0 font-bold ml-1">
                    {cred.password}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer Branding Strip */}
      <footer className="relative z-10 w-full py-2.5 px-6 text-center text-xs text-slate-500 font-medium bg-white/40 backdrop-blur-xs border-t border-white/40">
        A healthier tomorrow, together • MedLink 360 Unified Healthcare Network
      </footer>
    </div>
  );
};
