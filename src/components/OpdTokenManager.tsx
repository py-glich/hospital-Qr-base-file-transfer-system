import { useState } from 'react';
import {
  Ticket,
  Printer,
  Plus,
  Volume2,
  X,
  Stethoscope,
  Bone,
  Heart,
  Brain,
  Baby,
  Activity,
} from 'lucide-react';
import type { OpdToken, DepartmentKey, Patient, Hospital } from '../types/ehr';
import { DEPARTMENTS_LIST } from '../data/mockData';
import { QRCodeSVG } from 'qrcode.react';

interface OpdTokenManagerProps {
  tokens: OpdToken[];
  patients: Patient[];
  currentHospital: Hospital;
  onIssueToken: (token: OpdToken) => void;
  onUpdateTokenStatus: (tokenId: string, status: OpdToken['status']) => void;
}

export const OpdTokenManager: React.FC<OpdTokenManagerProps> = ({
  tokens,
  patients,
  currentHospital,
  onIssueToken,
  onUpdateTokenStatus,
}) => {
  const [selectedDept, setSelectedDept] = useState<DepartmentKey>('Orthopedics');
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || '');
  const [customPatientName, setCustomPatientName] = useState('');
  const [customPatientPhone, setCustomPatientPhone] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('Dr. Paul Ford');
  const [priority, setPriority] = useState<OpdToken['priority']>('NORMAL');
  const [tokenNotes, setTokenNotes] = useState('');
  const [printedToken, setPrintedToken] = useState<OpdToken | null>(null);

  // Play audio announcement bell when calling a token
  const playChime = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch {
      // audio block fallback
    }
  };

  const handleCallToken = (token: OpdToken) => {
    playChime();
    onUpdateTokenStatus(token.id, 'CALLED');
  };

  const handleCreateToken = (e: React.FormEvent) => {
    e.preventDefault();
    const deptInfo = DEPARTMENTS_LIST.find((d) => d.key === selectedDept)!;
    const existingPatient = patients.find((p) => p.id === selectedPatientId);

    const patName = existingPatient ? existingPatient.name : customPatientName || 'Walk-in Patient';
    const patPhone = existingPatient ? existingPatient.phone : customPatientPhone || '+92 300 0000000';
    const patId = existingPatient ? existingPatient.id : `WALK-${Math.floor(100 + Math.random() * 900)}`;

    const deptTokens = tokens.filter((t) => t.department === selectedDept);
    const tokenSeq = 101 + deptTokens.length;
    const tokenNumber = `${deptInfo.code}-${tokenSeq}`;

    const newToken: OpdToken = {
      id: `TOK-${Date.now().toString().slice(-5)}`,
      tokenNumber,
      department: selectedDept,
      departmentCode: deptInfo.code,
      patientId: patId,
      patientName: patName,
      patientPhone: patPhone,
      assignedDoctor: selectedDoctor || deptInfo.headDoctor,
      roomNumber: deptInfo.roomNumber,
      status: 'WAITING',
      priority,
      issueTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      estimatedWaitMinutes: deptInfo.currentWaitMinutes,
      hospitalId: currentHospital.id,
      notes: tokenNotes,
    };

    onIssueToken(newToken);
    setPrintedToken(newToken);
    setIsIssueModalOpen(false);
    setTokenNotes('');
  };

  const filteredTokens = tokens.filter((t) => t.department === selectedDept);
  const callingToken = filteredTokens.find((t) => t.status === 'CALLED');
  const inConsultationToken = filteredTokens.find((t) => t.status === 'IN_CONSULTATION');
  const waitingTokens = filteredTokens.filter((t) => t.status === 'WAITING');

  const currentDeptInfo = DEPARTMENTS_LIST.find((d) => d.key === selectedDept)!;

  const getDeptIcon = (key: DepartmentKey) => {
    switch (key) {
      case 'Orthopedics':
        return <Bone className="w-5 h-5 text-amber-600" />;
      case 'Cardiology':
        return <Heart className="w-5 h-5 text-rose-600" />;
      case 'Neurology':
        return <Brain className="w-5 h-5 text-indigo-600" />;
      case 'Pediatrics':
        return <Baby className="w-5 h-5 text-teal-600" />;
      default:
        return <Activity className="w-5 h-5 text-cyan-600" />;
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Top Department Selector & Bar */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200/90 shadow-xl shadow-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-50 text-teal-700">
              <Ticket className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black text-slate-800">OPD Departmental Token Queue System</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time OPD token dispenser, queue status board, and consultation dispatchers for all hospital sections
          </p>
        </div>

        <button
          onClick={() => setIsIssueModalOpen(true)}
          className="px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 transition cursor-pointer active:scale-98 shrink-0 min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          + Issue New OPD Token
        </button>
      </div>

      {/* Department Tabs Pills */}
      <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-none w-full">
        {DEPARTMENTS_LIST.map((dept) => {
          const isSelected = dept.key === selectedDept;
          const deptCount = tokens.filter((t) => t.department === dept.key && t.status !== 'COMPLETED').length;
          return (
            <button
              key={dept.key}
              onClick={() => setSelectedDept(dept.key)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 shrink-0 border cursor-pointer ${
                isSelected
                  ? 'bg-teal-700 text-white border-teal-700 shadow-md shadow-teal-700/20'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {getDeptIcon(dept.key)}
              <span>{dept.name.split('&')[0]}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {deptCount} Active
              </span>
            </button>
          );
        })}
      </div>

      {/* Department Live Info Banner */}
      <div className="bg-gradient-to-r from-teal-50 to-slate-50 border border-teal-200/80 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white border border-teal-200 flex items-center justify-center text-teal-800 shadow-xs shrink-0">
            {getDeptIcon(selectedDept)}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-slate-900">{currentDeptInfo.name}</h3>
              <span className="px-2 py-0.5 rounded-md bg-teal-100 text-teal-900 text-xs font-mono font-bold">
                {currentDeptInfo.roomNumber}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Head Consultant: <span className="font-semibold text-slate-800">{currentDeptInfo.headDoctor}</span> ({currentDeptInfo.doctorSpecialty})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-600 shrink-0">
          <div className="bg-white px-3 py-2 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Clinic Hours</span>
            <span className="font-bold text-slate-800">{currentDeptInfo.openHours}</span>
          </div>
          <div className="bg-white px-3 py-2 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Avg. Wait</span>
            <span className="font-bold text-amber-600">{currentDeptInfo.currentWaitMinutes} Mins</span>
          </div>
        </div>
      </div>

      {/* Main Queue Screen: Split Display */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: Live Calling Board (Electronic Counter Style) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl border border-slate-800 relative overflow-hidden text-center">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                LIVE COUNTER DISPLAY
              </span>
              <span>{currentDeptInfo.roomNumber}</span>
            </div>

            <div className="py-6">
              <span className="text-xs uppercase font-bold text-amber-400 tracking-widest block mb-2">
                Now Calling Patient
              </span>
              <div className="text-4xl sm:text-5xl font-black font-mono tracking-wider text-emerald-400 bg-slate-950 py-4 px-6 rounded-2xl border border-emerald-500/30 inline-block shadow-inner">
                {callingToken ? callingToken.tokenNumber : inConsultationToken ? inConsultationToken.tokenNumber : '---'}
              </div>
              <div className="mt-4">
                <p className="text-lg font-bold text-white">
                  {callingToken ? callingToken.patientName : inConsultationToken ? inConsultationToken.patientName : 'No active token'}
                </p>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Assigned: {currentDeptInfo.headDoctor} • {currentDeptInfo.roomNumber}
                </p>
              </div>
            </div>

            {callingToken && (
              <div className="pt-4 border-t border-slate-800 flex items-center justify-center gap-2">
                <button
                  onClick={() => playChime()}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition"
                >
                  <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                  Re-Announce
                </button>
                <button
                  onClick={() => onUpdateTokenStatus(callingToken.id, 'IN_CONSULTATION')}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer transition"
                >
                  Start Consultation
                </button>
              </div>
            )}

            {inConsultationToken && !callingToken && (
              <div className="pt-4 border-t border-slate-800 flex items-center justify-center gap-2">
                <button
                  onClick={() => onUpdateTokenStatus(inConsultationToken.id, 'COMPLETED')}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold cursor-pointer transition shadow-md shadow-teal-600/20"
                >
                  Complete Consultation & Call Next
                </button>
              </div>
            )}
          </div>

          {/* Quick Doctor Desk Calling Console */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Stethoscope className="w-4 h-4 text-teal-700" />
              Doctor Station Call Controller:
            </h4>
            {waitingTokens.length > 0 ? (
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Next In Line</span>
                  <p className="font-mono font-bold text-slate-900 text-base">{waitingTokens[0].tokenNumber}</p>
                  <p className="text-xs text-slate-600 font-medium">{waitingTokens[0].patientName}</p>
                </div>
                <button
                  onClick={() => handleCallToken(waitingTokens[0])}
                  className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl shadow-md shadow-teal-700/20 flex items-center gap-1.5 transition cursor-pointer active:scale-98"
                >
                  <Volume2 className="w-4 h-4" />
                  Call Next Patient
                </button>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic text-center py-2">
                No patients waiting in queue for {selectedDept}.
              </p>
            )}
          </div>
        </div>

        {/* RIGHT: Live Queue List & Token Management */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xl shadow-slate-100 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h4 className="font-bold text-slate-800 text-base">
                {selectedDept} Queue Register ({filteredTokens.length})
              </h4>
              <p className="text-xs text-slate-400">Tokens issued today for this clinical desk</p>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 border border-teal-200">
              {waitingTokens.length} In Waiting
            </span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[460px] overflow-y-auto">
            {filteredTokens.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No tokens issued for {selectedDept} yet today. Click "+ Issue New OPD Token" above.
              </div>
            ) : (
              filteredTokens.map((t) => (
                <div key={t.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition p-2 rounded-xl">
                  <div className="flex items-start gap-3">
                    <span className="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-mono font-bold text-sm tracking-wide shrink-0">
                      {t.tokenNumber}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-800 text-sm">{t.patientName}</span>
                        {t.priority === 'URGENT' && (
                          <span className="px-2 py-0.5 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-bold">
                            URGENT
                          </span>
                        )}
                        <span className="text-[11px] font-mono text-slate-400">({t.patientId})</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Issued: {t.issueTime} • Doctor: {t.assignedDoctor}
                      </p>
                      {t.notes && <p className="text-[11px] text-slate-600 italic mt-0.5">"{t.notes}"</p>}
                    </div>
                  </div>

                  {/* Actions & Status */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {t.status === 'WAITING' && (
                      <button
                        onClick={() => handleCallToken(t)}
                        className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-xl text-xs font-bold cursor-pointer transition"
                      >
                        Call
                      </button>
                    )}
                    {t.status === 'CALLED' && (
                      <span className="px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-1 animate-pulse">
                        <Volume2 className="w-3.5 h-3.5" />
                        Calling
                      </span>
                    )}
                    {t.status === 'IN_CONSULTATION' && (
                      <button
                        onClick={() => onUpdateTokenStatus(t.id, 'COMPLETED')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer transition shadow-xs"
                      >
                        Done
                      </button>
                    )}
                    {t.status === 'COMPLETED' && (
                      <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-600 text-xs font-medium">
                        Completed
                      </span>
                    )}

                    <button
                      onClick={() => setPrintedToken(t)}
                      title="Print Token Slip"
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl cursor-pointer transition"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* MODAL 1: ISSUE NEW OPD TOKEN */}
      {isIssueModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-hidden">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full max-h-[94vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-5 py-4 text-white flex items-center justify-between shrink-0 shadow-xs">
              <div className="flex items-center gap-3">
                <Ticket className="w-6 h-6 text-amber-200" />
                <div>
                  <h3 className="text-base sm:text-lg font-bold">Issue OPD Consultation Token</h3>
                  <p className="text-xs text-amber-100">Generating queue ticket for {currentHospital.name}</p>
                </div>
              </div>
              <button
                onClick={() => setIsIssueModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-xl bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateToken} className="p-5 sm:p-6 space-y-4 text-xs flex-1 overflow-y-auto">
              {/* Select Department */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Select Clinical Department / Section *</label>
                <select
                  value={selectedDept}
                  onChange={(e) => {
                    const dKey = e.target.value as DepartmentKey;
                    setSelectedDept(dKey);
                    const found = DEPARTMENTS_LIST.find((d) => d.key === dKey);
                    if (found) setSelectedDoctor(found.headDoctor);
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 font-bold outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                >
                  {DEPARTMENTS_LIST.map((d) => (
                    <option key={d.key} value={d.key}>
                      {d.name} ({d.roomNumber})
                    </option>
                  ))}
                </select>
              </div>

              {/* Patient Selection */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Select Registered Patient *</label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 font-semibold outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.id}) — CNIC: {p.nationalId} [{p.bloodGroup}]
                    </option>
                  ))}
                  <option value="WALK_IN">+ New / Unregistered Walk-in Patient</option>
                </select>
              </div>

              {selectedPatientId === 'WALK_IN' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Walk-in Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Asif Raza"
                      value={customPatientName}
                      onChange={(e) => setCustomPatientName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Phone Number</label>
                    <input
                      type="text"
                      placeholder="+92 300 1234567"
                      value={customPatientPhone}
                      onChange={(e) => setCustomPatientPhone(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900"
                    />
                  </div>
                </div>
              )}

              {/* Priority */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Queue Priority</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['NORMAL', 'URGENT', 'EMERGENCY'] as const).map((pri) => (
                    <button
                      key={pri}
                      type="button"
                      onClick={() => setPriority(pri)}
                      className={`py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        priority === pri
                          ? pri === 'EMERGENCY'
                            ? 'bg-rose-600 text-white border-rose-600'
                            : 'bg-amber-600 text-white border-amber-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {pri}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Reason / Symptoms for Visit</label>
                <input
                  type="text"
                  placeholder="e.g. Joint swelling, severe shoulder pain, fracture checkup"
                  value={tokenNotes}
                  onChange={(e) => setTokenNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsIssueModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-md shadow-amber-600/20 cursor-pointer active:scale-98"
                >
                  <Ticket className="w-4 h-4" />
                  Print & Dispense Token
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: PRINTABLE THERMAL TOKEN SLIP */}
      {printedToken && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center animate-in fade-in zoom-in-95 relative">
            <button
              onClick={() => setPrintedToken(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-xl bg-slate-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Thermal Slip Styling */}
            <div className="p-5 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50/50 text-slate-800 space-y-3 font-mono">
              <div className="border-b border-slate-300 pb-2">
                <h4 className="font-bold font-sans text-sm tracking-tight">{currentHospital.name}</h4>
                <p className="text-[10px] text-slate-500">{currentHospital.address}</p>
                <p className="text-[10px] font-bold text-amber-700 uppercase mt-0.5">
                  OPD CONSULTATION SLIP
                </p>
              </div>

              <div className="py-2">
                <span className="text-xs text-slate-500 uppercase block">Your Queue Token</span>
                <span className="text-3xl font-black text-slate-900 tracking-wider block my-1">
                  {printedToken.tokenNumber}
                </span>
                <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                  {printedToken.department}
                </span>
              </div>

              <div className="text-left text-xs space-y-1 border-t border-b border-slate-200 py-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Patient:</span>
                  <span className="font-bold text-slate-900">{printedToken.patientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Doctor:</span>
                  <span className="font-bold text-slate-800">{printedToken.assignedDoctor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Location:</span>
                  <span className="font-bold text-teal-900">{printedToken.roomNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Time:</span>
                  <span>{printedToken.issueTime}</span>
                </div>
              </div>

              <div className="pt-1 flex flex-col items-center">
                <QRCodeSVG value={`TOKEN:${printedToken.tokenNumber}:${printedToken.patientId}`} size={90} />
                <span className="text-[9px] text-slate-400 mt-1">Scan to track queue on your mobile</span>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Slip
              </button>
              <button
                onClick={() => setPrintedToken(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
