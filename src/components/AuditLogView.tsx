import { ShieldCheck, Flame, Camera, KeyRound, Building2, Clock, CheckCircle, UserCheck } from 'lucide-react';
import type { AccessLog } from '../types/ehr';

interface AuditLogViewProps {
  logs: AccessLog[];
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ logs }) => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-100">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-5 border-b border-slate-100 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-700" />
            <h2 className="text-xl font-black text-slate-800">Immutable Access Audit Trail</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time compliance ledger recording every camera scan, consent verification, and record exchange
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
          HIPAA & FHIR Interoperability Standard
        </span>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 text-slate-700 uppercase tracking-wider text-[10px] font-bold">
            <tr>
              <th className="p-3.5 rounded-l-xl">Log ID & Time</th>
              <th className="p-3.5">Patient</th>
              <th className="p-3.5">Hospital Node</th>
              <th className="p-3.5">Initiator / Staff</th>
              <th className="p-3.5">Access Protocol</th>
              <th className="p-3.5 rounded-r-xl">Audit Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.map((log) => {
              const isEmergency = log.accessType === 'EMERGENCY_OVERRIDE';
              return (
                <tr key={log.id} className="hover:bg-slate-50/70 transition">
                  <td className="p-3.5 whitespace-nowrap">
                    <div className="font-mono text-slate-800 font-bold">{log.id}</div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {log.timestamp}
                    </div>
                  </td>
                  <td className="p-3.5 whitespace-nowrap">
                    <span className="font-bold text-slate-800">{log.patientName}</span>
                    <span className="text-[10px] text-slate-400 block font-mono">{log.patientId}</span>
                  </td>
                  <td className="p-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-teal-900 font-semibold">
                      <Building2 className="w-3.5 h-3.5 shrink-0 text-teal-700" />
                      {log.hospitalName}
                    </div>
                  </td>
                  <td className="p-3.5 whitespace-nowrap text-slate-700 font-medium">
                    {log.doctorName}
                  </td>
                  <td className="p-3.5 whitespace-nowrap">
                    {isEmergency ? (
                      <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5 w-fit">
                        <Flame className="w-3.5 h-3.5 text-rose-600" />
                        Break-Glass Override
                      </span>
                    ) : log.accessType === 'PATIENT_SELF_ACCESS' ? (
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold flex items-center gap-1.5 w-fit">
                        <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                        Patient Self-Access
                      </span>
                    ) : log.accessType === 'QR_CAMERA_SCAN' ? (
                      <span className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 text-xs font-bold flex items-center gap-1.5 w-fit">
                        <Camera className="w-3.5 h-3.5 text-teal-700" />
                        Camera QR Scan
                      </span>
                    ) : log.accessType === 'CONSENT_OTP_VERIFIED' ? (
                      <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold flex items-center gap-1.5 w-fit">
                        <KeyRound className="w-3.5 h-3.5 text-blue-700" />
                        Patient OTP Consent
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold flex items-center gap-1.5 w-fit">
                        <CheckCircle className="w-3.5 h-3.5 text-slate-600" />
                        Record Synced
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 text-slate-600 max-w-xs truncate">
                    {log.notes}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
