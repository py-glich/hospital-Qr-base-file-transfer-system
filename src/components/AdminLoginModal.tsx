import { useState } from 'react';
import { ShieldCheck, Lock, User, Key, CheckCircle, AlertCircle } from 'lucide-react';
import type { StaffUser, Hospital } from '../types/ehr';
import { DEMO_STAFF_USERS } from '../data/mockData';

interface AdminLoginModalProps {
  hospitals: Hospital[];
  onLoginSuccess: (user: StaffUser) => void;
  onCancel: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  hospitals,
  onLoginSuccess,
  onCancel,
}) => {
  const [selectedStaff, setSelectedStaff] = useState<StaffUser>(DEMO_STAFF_USERS[0]);
  const [password, setPassword] = useState('Hospital@Secure2026');
  const [twoFactorCode, setTwoFactorCode] = useState('849201');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Please provide your hospital authorized security key.');
      return;
    }
    onLoginSuccess(selectedStaff);
  };

  const getHospitalName = (hId: string) => {
    return hospitals.find((h) => h.id === hId)?.name || hId;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Top Header with Comforting Hospital Teal */}
        <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 px-6 py-6 text-white relative">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-md">
              <ShieldCheck className="w-6 h-6 text-teal-200" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight">Clinical & Admin Portal</h3>
              <p className="text-xs text-teal-100/80">Authorized Hospital Staff Authentication</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-[11px] text-teal-200/90 bg-teal-900/40 px-3 py-1 rounded-lg border border-teal-600/30">
            <Lock className="w-3.5 h-3.5" />
            End-to-End Encrypted HIPAA Compliant Session
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-teal-700" />
              Select Authorized Staff Identity:
            </label>
            <select
              value={selectedStaff.id}
              onChange={(e) => {
                const found = DEMO_STAFF_USERS.find((s) => s.id === e.target.value);
                if (found) setSelectedStaff(found);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition cursor-pointer"
            >
              {DEMO_STAFF_USERS.map((staff) => (
                <option key={staff.id} value={staff.id}>
                  {staff.name} — {staff.role.replace('_', ' ')} ({staff.licenseNumber})
                </option>
              ))}
            </select>
          </div>

          <div className="p-3 bg-teal-50/70 rounded-xl border border-teal-100 text-xs space-y-1">
            <div className="flex justify-between text-slate-600">
              <span>Assigned Facility:</span>
              <span className="font-semibold text-teal-900">{getHospitalName(selectedStaff.hospitalId)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Medical License:</span>
              <span className="font-mono text-slate-800">{selectedStaff.licenseNumber}</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-teal-700" />
              Institutional Passcode:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition"
              placeholder="••••••••••••"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
              2FA Authenticator Token (Simulation):
            </label>
            <input
              type="text"
              value={twoFactorCode}
              onChange={(e) => setTwoFactorCode(e.target.value)}
              maxLength={6}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-center text-sm font-mono tracking-widest text-teal-800 outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition"
            />
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold shadow-md shadow-teal-700/20 flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              Secure Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
