import React, { useState } from 'react';
import {
  Home,
  Users,
  Stethoscope,
  Building2,
  Activity,
  Pill,
  CreditCard,
  Network,
  TrendingUp,
  Cpu,
  Settings,
  Search,
  Bell,
  MessageSquare,
  Grid,
  Calendar,
  Bed,
  AlertTriangle,
  QrCode,
  UserPlus,
  FileText,
  FlaskConical,
  ArrowLeftRight,
  Send,
  Sparkles,
  ChevronDown,
  X,
  LogOut,
  Menu,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import type { Hospital, Patient, MedicalRecord, OpdToken, Appointment } from '../types/ehr';
import { OpdTokenManager } from './OpdTokenManager';
import { AppointmentsListView } from './AppointmentsListView';
import { PatientsDataBank } from './PatientsDataBank';
import { CrossHospitalViewer } from './CrossHospitalViewer';

export type MediLinkNav =
  | 'OVERVIEW'
  | 'PATIENTS'
  | 'CLINICAL_CARE'
  | 'HOSPITAL_OPERATIONS'
  | 'DIAGNOSTICS'
  | 'PHARMACY'
  | 'FINANCE_BILLING'
  | 'NETWORK_DATA_BANK'
  | 'REPORTS_ANALYTICS'
  | 'AI_INTEGRATIONS'
  | 'SETTINGS';

interface MediLinkDashboardProps {
  patients: Patient[];
  records: MedicalRecord[];
  tokens: OpdToken[];
  appointments: Appointment[];
  hospitals: Hospital[];
  currentHospital: Hospital;
  onSelectHospital: (hospital: Hospital) => void;
  onIssueToken: (token: OpdToken) => void;
  onUpdateTokenStatus: (id: string, status: OpdToken['status']) => void;
  onBookAppointment: (appointment: Appointment) => void;
  onUpdateAppointmentStatus: (id: string, status: Appointment['status']) => void;
  onPatientUpserted?: (patient: any) => void;
  onOpenCreatePatient: () => void;
  onOpenAddRecord: () => void;
  onOpenBookModal: () => void;
  onExitToGateway?: () => void;
  scannedPatient: Patient | null;
  isUnlocked: boolean;
  onLockSession: () => void;
  onUnlockPatient: (patient: Patient) => void;
}

export const MediLinkDashboard: React.FC<MediLinkDashboardProps> = ({
  patients,
  records,
  tokens,
  appointments,
  hospitals,
  currentHospital,
  onSelectHospital,
  onIssueToken,
  onUpdateTokenStatus,
  onBookAppointment: _onBookAppointment,
  onUpdateAppointmentStatus,
  onPatientUpserted: _onPatientUpserted,
  onOpenCreatePatient,
  onOpenAddRecord,
  onOpenBookModal,
  onExitToGateway,
  scannedPatient,
  isUnlocked,
  onLockSession,
  onUnlockPatient,
}) => {
  const [activeNav, setActiveNav] = useState<MediLinkNav>('OVERVIEW');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPedestalPatient, setSelectedPedestalPatient] = useState<Patient>(
    patients[0] || {
      id: 'PAT-9021',
      nationalId: 'PK-HR-784512',
      name: 'Muhammad Tariq Khan',
      age: 48,
      gender: 'Male',
      bloodGroup: 'B+',
      phone: '+92 300 5551234',
      primaryHospitalId: 'hosp-aku',
      primaryHospitalName: 'Aga Khan Hospital',
      emergencyContact: { name: 'Sajid Khan', relation: 'Brother', phone: '+92 300 9998877' },
      allergies: ['Penicillin', 'Sulfa Drugs'],
      chronicConditions: ['Type 2 Diabetes', 'Hypertension'],
      qrPayload: 'EHR:PK-HR-784512|PAT-9021|B+|ALLERGY:PENICILLIN',
      accessPin: '2580',
    }
  );

  // AI Assistant Chat State
  const [aiChatInput, setAiChatInput] = useState('');
  const [aiMessages, setAiMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string }>>([
    {
      sender: 'ai',
      text: 'Hello Dr. Ahmed! I am your AI Health Assistant. Ask me to summarize patient records, verify drug interactions, or check hospital bed occupancy.',
    },
  ]);
  const [activeQuickAiPrompt, setActiveQuickAiPrompt] = useState<string>('Check drug interactions');

  // Quick Action Notification Toast
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const triggerNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleAiSend = (query?: string) => {
    const textToSend = (query || aiChatInput).trim();
    if (!textToSend) return;

    setAiMessages((prev) => [...prev, { sender: 'user', text: textToSend }]);
    setAiChatInput('');

    setTimeout(() => {
      let reply = `Analysis completed for: "${textToSend}". `;
      if (textToSend.toLowerCase().includes('drug') || textToSend.toLowerCase().includes('interaction')) {
        reply =
          'Cross-referencing active medications: Metformin (850mg) and Lisinopril (10mg) show NO adverse interaction. Monitor renal profile (GFR: 78 ml/min).';
      } else if (textToSend.toLowerCase().includes('summarize') || textToSend.toLowerCase().includes('history')) {
        reply = `Patient ${selectedPedestalPatient.name} has ${records.length} clinical records across 3 hospitals. Primary conditions: ${selectedPedestalPatient.chronicConditions.join(', ')}. Known allergies: ${selectedPedestalPatient.allergies.join(', ')}.`;
      } else if (textToSend.toLowerCase().includes('diagnosis')) {
        reply =
          'Differential Diagnostic Support: Symptoms align with Stage 1 Essential Hypertension with mild peripheral vascular strain. Recommended: 24h ambulatory BP log.';
      } else if (textToSend.toLowerCase().includes('lab')) {
        reply =
          'Recent Lab Trends: HbA1c is 7.1% (stable vs 7.4% last quarter), Total Cholesterol 185 mg/dL, Fasting Blood Glucose 118 mg/dL.';
      } else if (textToSend.toLowerCase().includes('clinical note')) {
        reply =
          'Clinical Note Drafted: "Patient presented for routine OPD consultation. Vitals stable. Advised continuation of lifestyle modifications and 6-month Echo review."';
      } else {
        reply = `Clinical Intelligence response: Network database is synchronized across 4 nodes. Current patient queue has ${tokens.filter((t) => t.status === 'WAITING').length} waiting in OPD.`;
      }

      setAiMessages((prev) => [...prev, { sender: 'ai', text: reply }]);
    }, 700);
  };

  // 4 Satellite Hospitals matching the image
  const satelliteHospitals = [
    {
      id: 'city-general',
      name: 'City General Hospital',
      city: 'Gujranwala',
      status: 'Online',
      color: 'bg-emerald-500',
      pos: 'top-left',
    },
    {
      id: 'hosp-aku',
      name: 'Aga Khan Hospital',
      city: 'Karachi',
      status: 'Active Node',
      color: 'bg-teal-500',
      pos: 'top-right',
    },
    {
      id: 'al-noor',
      name: 'Al-Noor Hospital',
      city: 'Lahore',
      status: 'Syncing',
      color: 'bg-sky-500',
      pos: 'bottom-left',
    },
    {
      id: 'hosp-shifa',
      name: 'Shifa Hospital',
      city: 'Islamabad',
      status: 'Active Node',
      color: 'bg-indigo-500',
      pos: 'bottom-right',
    },
  ];

  return (
    <div className="min-h-screen bg-[#edf3f6] text-slate-800 flex flex-col font-sans select-none antialiased">
      {/* ================= 1. SLEEK TOP APP BAR ================= */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4 shadow-xs">
        {/* Logo, Brand & Mobile Menu Toggle */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="sm:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
            title="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#008f7a] to-[#20c997] flex items-center justify-center text-white shadow-md shadow-teal-500/20 shrink-0">
            {/* Medical Cross Graphic */}
            <div className="relative flex items-center justify-center">
              <div className="w-5 h-2 bg-white rounded-xs"></div>
              <div className="h-5 w-2 bg-white rounded-xs absolute"></div>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-lg font-black text-slate-900 tracking-tight">MediLink 360</span>
            </div>
            <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase -mt-1">
              Unified Healthcare Network
            </p>
          </div>
        </div>

        {/* Global Floating Search Bar */}
        <div className="flex-1 max-w-xl mx-2 sm:mx-6 hidden md:block">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patient, hospital, record, or anything..."
              className="w-full bg-[#f4f7f9] hover:bg-[#eef3f6] focus:bg-white text-xs sm:text-sm text-slate-800 pl-11 pr-16 py-2 rounded-full border border-slate-200/80 outline-none focus:ring-2 focus:ring-teal-500/30 transition shadow-inner"
            />
            <span className="absolute right-3 px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-mono font-bold text-slate-400 shadow-2xs pointer-events-none">
              Ctrl K
            </span>
          </div>
        </div>

        {/* Top Right Controls & Staff Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={() => triggerNotice('Alerts: All 4 hospital database connections are optimal.')}
            className="w-9 h-9 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-600 transition relative cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-2 right-2 ring-2 ring-white"></span>
          </button>

          <button
            onClick={() => setActiveNav('AI_INTEGRATIONS')}
            className="w-9 h-9 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-600 transition cursor-pointer"
            title="Messages"
          >
            <MessageSquare className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveNav('OVERVIEW')}
            className="w-9 h-9 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-600 transition cursor-pointer"
            title="Applications Menu"
          >
            <Grid className="w-4 h-4" />
          </button>

          {/* User Profile Pill */}
          <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-slate-200">
            <img
              src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=150&q=80"
              alt="Dr. Ahmed Khan"
              className="w-9 h-9 rounded-full object-cover ring-2 ring-teal-500/40 shadow-xs"
            />
            <div className="hidden lg:block text-left">
              <span className="text-xs font-black text-slate-900 block leading-tight">Dr. Ahmed Khan</span>
              <span className="text-[10px] text-slate-400 font-medium block">Hospital Administrator</span>
            </div>
          </div>

          {/* Exit / Return to Patient Page Button */}
          {onExitToGateway && (
            <button
              onClick={onExitToGateway}
              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0"
              title="Exit to Patient First Page"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-600" />
              <span className="hidden sm:inline">Exit to Patient Page</span>
            </button>
          )}
        </div>
      </header>

      {/* Floating Notice Toast */}
      {actionNotice && (
        <div className="fixed top-16 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-in slide-in-from-top-4 duration-200">
          <Sparkles className="w-4 h-4 text-teal-400" />
          <span>{actionNotice}</span>
          <button onClick={() => setActionNotice(null)} className="ml-2 text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ================= 2. MAIN LAYOUT: SIDEBAR + CONTENT ================= */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Backdrop Overlay */}
        {isMobileMenuOpen && (
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 sm:hidden"
          ></div>
        )}

        {/* ================= A. CURVED DEEP TEAL SIDEBAR ================= */}
        <aside
          className={`fixed sm:static inset-y-0 left-0 z-50 sm:z-30 w-64 sm:w-60 bg-gradient-to-b from-[#092b2c] via-[#051f20] to-[#021314] text-white flex flex-col justify-between shrink-0 shadow-2xl transition-transform duration-300 border-r border-teal-500/20 ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'
          }`}
        >
          {/* Subtle Cyber Glow Wave Edge */}
          <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-teal-400/0 via-emerald-400/40 to-teal-400/0 pointer-events-none"></div>

          {/* Nav Links */}
          <div className="p-3 sm:p-4 space-y-1.5 overflow-y-auto scrollbar-none flex-1">
            {[
              { id: 'OVERVIEW', label: 'Overview', icon: Home },
              { id: 'PATIENTS', label: 'Patients', icon: Users },
              { id: 'CLINICAL_CARE', label: 'Clinical Care', icon: Stethoscope },
              { id: 'HOSPITAL_OPERATIONS', label: 'Hospital Operations', icon: Building2 },
              { id: 'DIAGNOSTICS', label: 'Diagnostics', icon: Activity },
              { id: 'PHARMACY', label: 'Pharmacy', icon: Pill },
              { id: 'FINANCE_BILLING', label: 'Finance & Billing', icon: CreditCard },
              { id: 'NETWORK_DATA_BANK', label: 'Network & Data Bank', icon: Network },
              { id: 'REPORTS_ANALYTICS', label: 'Reports & Analytics', icon: TrendingUp },
              { id: 'AI_INTEGRATIONS', label: 'AI & Integrations', icon: Cpu },
              { id: 'SETTINGS', label: 'Settings', icon: Settings },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveNav(item.id as MediLinkNav);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer relative group ${
                    isActive
                      ? 'bg-[#7df9c2] text-[#062422] shadow-lg shadow-teal-500/30 font-black'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                  title={item.label}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#062422]' : 'text-slate-400 group-hover:text-white'}`} />
                  <span className="truncate tracking-tight">{item.label}</span>
                  {isActive && (
                    <span className="absolute right-2.5 w-1.5 h-1.5 rounded-full bg-[#062422]"></span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Bottom Wave Graphic Effect */}
          <div className="p-3 sm:p-4 border-t border-teal-900/40 relative overflow-hidden shrink-0">
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/15 to-transparent pointer-events-none"></div>
            <div className="flex items-center gap-2 relative z-10 text-[11px] text-teal-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="hidden sm:inline font-mono font-bold">Node: {currentHospital.badge}</span>
            </div>
          </div>
        </aside>

        {/* ================= B. MAIN WORKSPACE ================= */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7 space-y-6">
          {/* ================= VIEW 1: OVERVIEW (EXACT PATTERN FROM IMAGE) ================= */}
          {activeNav === 'OVERVIEW' && (
            <div className="space-y-6">
              {/* TOP ROW: GREETING & 4 METRIC CARDS */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Greeting & Headline */}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold text-slate-600">Good Morning, Dr. Ahmed 👋</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
                    A Connected <span className="text-[#008f7a]">Healthcare Ecosystem</span>
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
                    Manage your hospital, patients and access unified health records across the network.
                  </p>
                </div>

                {/* 4 Stat Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
                  {/* Card 1: Total Patients */}
                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Total Patients
                      </span>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="text-base sm:text-lg font-black text-slate-900 font-mono">
                          {patients.length + 12470}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600">↑ +12%</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: OPD Visits */}
                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 shrink-0">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        OPD Visits
                      </span>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="text-base sm:text-lg font-black text-slate-900 font-mono">892</span>
                        <span className="text-[10px] font-bold text-purple-600">↑ +8%</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 3: IPD Admissions */}
                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 shrink-0">
                      <Bed className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        IPD Admissions
                      </span>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="text-base sm:text-lg font-black text-slate-900 font-mono">214</span>
                        <span className="text-[10px] font-bold text-sky-600">↑ +5%</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 4: Emergency */}
                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Emergency
                      </span>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="text-base sm:text-lg font-black text-slate-900 font-mono">76</span>
                        <span className="text-[10px] font-bold text-rose-600">↑ +18%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ================= MIDDLE SECTION: 3D HOLOGRAPHIC DATA BANK + AI ASSISTANT ================= */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                {/* 3D HOLOGRAPHIC DATA BANK STAGE (Col 8) */}
                <div className="lg:col-span-8 bg-gradient-to-b from-[#e8f4f8] via-[#e2eef2] to-[#d6e7ec] rounded-3xl p-6 sm:p-8 border border-white/80 shadow-inner relative overflow-hidden flex flex-col items-center justify-center min-h-[380px]">
                  {/* Subtle Grid Backdrop */}
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#008f7a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

                  {/* Connected Hospital Nodes around Pedestal */}
                  <div className="w-full max-w-2xl relative z-10 flex flex-col items-center justify-center">
                    {/* Top Row: City General & Aga Khan */}
                    <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 mb-3 sm:mb-4">
                      {/* Node 1: City General Hospital */}
                      <div
                        onClick={() => triggerNotice('Switched focus to City General Hospital (Gujranwala Node)')}
                        className="w-full sm:w-auto bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white shadow-md flex items-center gap-2.5 cursor-pointer hover:scale-105 transition"
                      >
                        <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                          🏥
                        </div>
                        <div>
                          <span className="text-xs font-black text-slate-900 block leading-tight">
                            City General Hospital
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">Gujranwala</span>
                        </div>
                      </div>

                      {/* Node 2: Aga Khan Hospital */}
                      <div
                        onClick={() => {
                          const aku = hospitals.find((h) => h.id === 'hosp-aku') || hospitals[0];
                          onSelectHospital(aku);
                          triggerNotice('Active Facility: Aga Khan University Hospital, Karachi');
                        }}
                        className={`w-full sm:w-auto bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border shadow-md flex items-center gap-2.5 cursor-pointer hover:scale-105 transition ${
                          currentHospital.id === 'hosp-aku' ? 'ring-2 ring-teal-500 border-teal-300' : 'border-white'
                        }`}
                      >
                        <div className="w-7 h-7 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs shrink-0">
                          🏥
                        </div>
                        <div>
                          <span className="text-xs font-black text-slate-900 block leading-tight">
                            Aga Khan Hospital
                          </span>
                          <span className="text-[10px] text-teal-700 font-bold">Karachi (Connected)</span>
                        </div>
                      </div>
                    </div>

                    {/* Central Glowing Pedestal with Holographic Card */}
                    <div className="relative my-2 flex flex-col items-center">
                      {/* Glowing Cyan Aura Rings */}
                      <div className="absolute -inset-10 bg-cyan-400/20 rounded-full blur-2xl pointer-events-none animate-pulse"></div>

                      {/* Holographic Glowing Glass Card */}
                      <div className="relative z-20 w-52 sm:w-60 bg-gradient-to-br from-cyan-400/25 via-teal-900/60 to-slate-950/85 backdrop-blur-xl border-2 border-cyan-300/80 rounded-3xl p-4 shadow-2xl text-center text-white transform -rotate-1 hover:rotate-0 transition duration-300">
                        {/* Top ID Badge */}
                        <div className="w-9 h-9 rounded-full bg-cyan-400/30 border border-cyan-300 flex items-center justify-center mx-auto mb-1 text-cyan-200">
                          <Users className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-200 block">
                          Patient Health ID
                        </span>
                        <span className="text-sm font-black font-mono text-white tracking-wider block mt-0.5">
                          {selectedPedestalPatient.nationalId || 'PK-HR-784512'}
                        </span>

                        {/* Real Functional Sharp QR Code */}
                        <div className="my-2.5 p-2 bg-white rounded-2xl inline-block shadow-lg">
                          <QRCodeSVG
                            value={selectedPedestalPatient.qrPayload || `EHR:${selectedPedestalPatient.nationalId}`}
                            size={105}
                            level="M"
                          />
                        </div>

                        <p className="text-[11px] font-bold text-cyan-100 truncate">{selectedPedestalPatient.name}</p>
                        <span className="text-[9px] text-cyan-300/80 font-mono">
                          Universal Nationwide Medical Access
                        </span>
                      </div>

                      {/* Circular Glowing 3D Base Platform */}
                      <div className="mt-3 bg-gradient-to-r from-teal-900 via-cyan-900 to-teal-900 text-cyan-200 px-6 py-2 rounded-full border-2 border-cyan-400/60 shadow-[0_0_25px_rgba(6,182,212,0.5)] flex items-center gap-2 text-xs font-bold tracking-wide">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                        <span>National Patient Health Data Bank</span>
                      </div>
                    </div>

                    {/* Bottom Row: Al-Noor & Shifa */}
                    <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 mt-3 sm:mt-4">
                      {/* Node 3: Al-Noor Hospital */}
                      <div
                        onClick={() => triggerNotice('Switched focus to Al-Noor Hospital (Lahore Node)')}
                        className="w-full sm:w-auto bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white shadow-md flex items-center gap-2.5 cursor-pointer hover:scale-105 transition"
                      >
                        <div className="w-7 h-7 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs shrink-0">
                          🏥
                        </div>
                        <div>
                          <span className="text-xs font-black text-slate-900 block leading-tight">Al-Noor Hospital</span>
                          <span className="text-[10px] text-slate-500 font-medium">Lahore</span>
                        </div>
                      </div>

                      {/* Node 4: Shifa Hospital */}
                      <div
                        onClick={() => {
                          const shifa = hospitals.find((h) => h.id === 'hosp-shifa') || hospitals[1];
                          onSelectHospital(shifa);
                          triggerNotice('Active Facility: Shifa International Hospital, Islamabad');
                        }}
                        className={`w-full sm:w-auto bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border shadow-md flex items-center gap-2.5 cursor-pointer hover:scale-105 transition ${
                          currentHospital.id === 'hosp-shifa'
                            ? 'ring-2 ring-indigo-500 border-indigo-300'
                            : 'border-white'
                        }`}
                      >
                        <div className="w-7 h-7 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                          🏥
                        </div>
                        <div>
                          <span className="text-xs font-black text-slate-900 block leading-tight">Shifa Hospital</span>
                          <span className="text-[10px] text-indigo-700 font-bold">Islamabad (Connected)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT AI HEALTH ASSISTANT PANEL (Col 4) */}
                <div className="lg:col-span-4 bg-gradient-to-b from-[#062524] via-[#041a1a] to-[#021111] rounded-3xl p-5 border border-teal-500/30 text-white shadow-xl flex flex-col justify-between min-h-[380px] relative overflow-hidden">
                  {/* Glowing Pulse Aura */}
                  <div className="absolute top-0 right-0 w-44 h-44 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

                  <div>
                    {/* 3D Robot Mascot & Title */}
                    <div className="flex items-center gap-3 pb-3 border-b border-teal-900/60">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 p-0.5 shadow-md shadow-teal-500/30">
                        <div className="w-full h-full bg-[#062524] rounded-[14px] flex items-center justify-center text-2xl">
                          🤖
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-[#7df9c2]" />
                          <h3 className="text-sm font-black text-white tracking-tight">AI Health Assistant</h3>
                        </div>
                        <p className="text-[10px] text-teal-300/80 font-medium">Your intelligent clinical companion</p>
                      </div>
                    </div>

                    {/* Interactive Prompt Pills */}
                    <div className="my-4 space-y-2 text-xs">
                      {[
                        'Summarize patient history',
                        'Check drug interactions',
                        'Suggest diagnosis (support)',
                        'Analyze lab trends',
                        'Generate clinical note',
                      ].map((promptText) => {
                        const isChosen = activeQuickAiPrompt === promptText;
                        return (
                          <button
                            key={promptText}
                            type="button"
                            onClick={() => {
                              setActiveQuickAiPrompt(promptText);
                              handleAiSend(promptText);
                            }}
                            className={`w-full text-left px-3.5 py-2 rounded-xl border transition flex items-center justify-between cursor-pointer text-xs ${
                              isChosen
                                ? 'bg-teal-500/20 border-teal-400/60 text-[#7df9c2] font-bold shadow-xs'
                                : 'bg-white/5 border-teal-900/40 text-slate-300 hover:bg-white/10 hover:text-white'
                            }`}
                          >
                            <span className="truncate">{promptText}</span>
                            <span
                              className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                                isChosen ? 'border-teal-400 text-teal-400' : 'border-slate-600 text-slate-500'
                              }`}
                            >
                              ✓
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* AI Chat History Mini Stream */}
                    <div className="max-h-28 overflow-y-auto space-y-2 pr-1 scrollbar-none text-[11px]">
                      {aiMessages.slice(-2).map((msg, idx) => (
                        <div
                          key={idx}
                          className={`p-2.5 rounded-xl ${
                            msg.sender === 'ai'
                              ? 'bg-teal-950/70 border border-teal-800/60 text-teal-100'
                              : 'bg-white/10 text-white ml-4 text-right'
                          }`}
                        >
                          {msg.text}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Chat Input Box */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleAiSend();
                    }}
                    className="mt-3 relative flex items-center"
                  >
                    <input
                      type="text"
                      value={aiChatInput}
                      onChange={(e) => setAiChatInput(e.target.value)}
                      placeholder="Ask anything..."
                      className="w-full bg-white/10 hover:bg-white/15 focus:bg-white/20 text-white placeholder-slate-400 text-xs pl-3.5 pr-10 py-2.5 rounded-full border border-teal-700/50 outline-none focus:ring-2 focus:ring-teal-400 transition"
                    />
                    <button
                      type="submit"
                      className="absolute right-1.5 w-7 h-7 rounded-full bg-[#20c997] hover:bg-[#1bb386] text-[#062524] flex items-center justify-center transition cursor-pointer shadow-xs"
                      title="Send prompt"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              </div>

              {/* ================= MIDDLE ACTION ROW: 8 QUICK-LAUNCH MODULE BUTTONS ================= */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Quick Clinical Actions & Modules
                  </span>
                  <span className="text-[11px] text-teal-700 font-bold">8 Live Hospital Workflows</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
                  {/* Action 1: Register Patient */}
                  <button
                    onClick={onOpenCreatePatient}
                    className="bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl p-3 flex flex-col items-center text-center transition cursor-pointer shadow-2xs group hover:-translate-y-0.5"
                  >
                    <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-teal-50 text-slate-700 group-hover:text-teal-700 flex items-center justify-center transition mb-1.5">
                      <UserPlus className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 leading-tight">Register Patient</span>
                  </button>

                  {/* Action 2: Scan QR (Access Records) -> High Visibility Mint Pill */}
                  <button
                    onClick={() => setActiveNav('CLINICAL_CARE')}
                    className="bg-[#d1fae5] hover:bg-[#bbf7d0] border-2 border-emerald-400 rounded-2xl p-3 flex flex-col items-center text-center transition cursor-pointer shadow-md group hover:-translate-y-0.5"
                  >
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs mb-1.5">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-black text-emerald-950 leading-tight">
                      Scan QR
                      <span className="block text-[9px] font-bold text-emerald-700">(Access Records)</span>
                    </span>
                  </button>

                  {/* Action 3: New Appointment */}
                  <button
                    onClick={onOpenBookModal}
                    className="bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl p-3 flex flex-col items-center text-center transition cursor-pointer shadow-2xs group hover:-translate-y-0.5"
                  >
                    <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-1.5">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 leading-tight">New Appointment</span>
                  </button>

                  {/* Action 4: Create Prescription */}
                  <button
                    onClick={onOpenAddRecord}
                    className="bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl p-3 flex flex-col items-center text-center transition cursor-pointer shadow-2xs group hover:-translate-y-0.5"
                  >
                    <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-1.5 font-bold font-serif">
                      ℞
                    </div>
                    <span className="text-xs font-bold text-slate-800 leading-tight">Create Prescription</span>
                  </button>

                  {/* Action 5: Order Lab Test */}
                  <button
                    onClick={() => triggerNotice('Lab Order Form Opened: Diagnostics catalog synchronized.')}
                    className="bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl p-3 flex flex-col items-center text-center transition cursor-pointer shadow-2xs group hover:-translate-y-0.5"
                  >
                    <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-1.5">
                      <FlaskConical className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 leading-tight">Order Lab Test</span>
                  </button>

                  {/* Action 6: Order Imaging */}
                  <button
                    onClick={() => triggerNotice('Radiology Order Opened: X-Ray, CT, MRI and Ultrasound scheduling.')}
                    className="bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl p-3 flex flex-col items-center text-center transition cursor-pointer shadow-2xs group hover:-translate-y-0.5"
                  >
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-1.5">
                      <Activity className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 leading-tight">Order Imaging</span>
                  </button>

                  {/* Action 7: Admit Patient */}
                  <button
                    onClick={() => triggerNotice('IPD Bed Admission: 142 beds currently available in General & ICU.')}
                    className="bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl p-3 flex flex-col items-center text-center transition cursor-pointer shadow-2xs group hover:-translate-y-0.5"
                  >
                    <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-1.5">
                      <Bed className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 leading-tight">Admit Patient</span>
                  </button>

                  {/* Action 8: Patient Transfer */}
                  <button
                    onClick={() => triggerNotice('Inter-hospital transfer gateway initiated.')}
                    className="bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl p-3 flex flex-col items-center text-center transition cursor-pointer shadow-2xs group hover:-translate-y-0.5"
                  >
                    <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center mb-1.5">
                      <ArrowLeftRight className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 leading-tight">Patient Transfer</span>
                  </button>
                </div>
              </div>

              {/* ================= BOTTOM ANALYTICS ROW: 3 CARDS MATCHING IMAGE ================= */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                {/* CARD 1: Hospital Performance (Area Chart) */}
                <div className="md:col-span-5 bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-slate-900">Hospital Performance</h4>
                    <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-[11px] font-bold text-slate-700 flex items-center gap-1 cursor-pointer">
                      This Week <ChevronDown className="w-3 h-3 text-slate-500" />
                    </span>
                  </div>

                  {/* SVG Wave Chart */}
                  <div className="relative pt-4">
                    {/* Tooltip Badge on Peak */}
                    <div className="absolute top-0 left-[48%] -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md">
                      892 Visits
                    </div>

                    <svg viewBox="0 0 320 90" className="w-full h-24 overflow-visible">
                      <defs>
                        <linearGradient id="performanceGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#20c997" stopOpacity="0.35" />
                          <stop offset="100%" stopColor="#20c997" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      {/* Area Fill */}
                      <path
                        d="M 10 75 Q 40 70, 70 65 T 130 55 T 160 25 T 200 45 T 250 35 T 310 65 L 310 85 L 10 85 Z"
                        fill="url(#performanceGrad)"
                      />
                      {/* Smooth Stroke Line */}
                      <path
                        d="M 10 75 Q 40 70, 70 65 T 130 55 T 160 25 T 200 45 T 250 35 T 310 65"
                        fill="none"
                        stroke="#008f7a"
                        strokeWidth="2.5"
                      />
                      {/* Peak Dot */}
                      <circle cx="160" cy="25" r="4.5" fill="#008f7a" stroke="#fff" strokeWidth="2" />
                    </svg>

                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mt-2 px-1">
                      <span>Mon</span>
                      <span>Tue</span>
                      <span>Wed</span>
                      <span className="text-teal-700 font-extrabold">Thu</span>
                      <span>Fri</span>
                      <span>Sat</span>
                      <span>Sun</span>
                    </div>
                  </div>
                </div>

                {/* CARD 2: Bed Occupancy (Donut Gauge) */}
                <div className="md:col-span-3 bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
                  <h4 className="text-sm font-bold text-slate-900 mb-2">Bed Occupancy</h4>

                  <div className="flex items-center justify-between gap-4">
                    {/* Circular Ring Gauge */}
                    <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        {/* Background track */}
                        <path
                          className="text-slate-100"
                          strokeWidth="3.8"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        {/* 60% Stroke */}
                        <path
                          className="text-teal-600"
                          strokeDasharray="60, 100"
                          strokeWidth="3.8"
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-sm font-black text-slate-900 font-mono">60%</span>
                        <span className="text-[8px] text-slate-400 font-bold uppercase">Occupied</span>
                      </div>
                    </div>

                    {/* Legend */}
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between gap-3">
                        <span className="flex items-center gap-1.5 text-slate-600 text-[11px]">
                          <span className="w-2 h-2 rounded-full bg-teal-700"></span> Occupied
                        </span>
                        <span className="font-mono font-bold text-slate-900">214</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="flex items-center gap-1.5 text-slate-600 text-[11px]">
                          <span className="w-2 h-2 rounded-full bg-teal-300"></span> Available
                        </span>
                        <span className="font-mono font-bold text-slate-900">142</span>
                      </div>
                      <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-100">
                        <span className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                          <span className="w-2 h-2 rounded-full bg-slate-300"></span> Total Beds
                        </span>
                        <span className="font-mono font-bold text-slate-700">356</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CARD 3: Health Record Network Stats */}
                <div className="md:col-span-4 bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-base">🎓</span>
                    <h4 className="text-sm font-bold text-slate-900">Health Record Network</h4>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center pt-2">
                    {/* Stat 1 */}
                    <div className="p-2 rounded-2xl bg-slate-50 border border-slate-100">
                      <Building2 className="w-4 h-4 text-teal-600 mx-auto mb-1" />
                      <span className="text-base sm:text-lg font-black text-slate-900 font-mono block">42</span>
                      <span className="text-[9px] font-bold text-slate-500 uppercase block">Connected Hospitals</span>
                    </div>

                    {/* Stat 2 */}
                    <div className="p-2 rounded-2xl bg-slate-50 border border-slate-100">
                      <FileText className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                      <span className="text-base sm:text-lg font-black text-slate-900 font-mono block">5.4M+</span>
                      <span className="text-[9px] font-bold text-slate-500 uppercase block">Health Records</span>
                    </div>

                    {/* Stat 3 */}
                    <div className="p-2 rounded-2xl bg-slate-50 border border-slate-100">
                      <ArrowLeftRight className="w-4 h-4 text-teal-600 mx-auto mb-1" />
                      <span className="text-base sm:text-lg font-black text-slate-900 font-mono block">24,781</span>
                      <span className="text-[9px] font-bold text-slate-500 uppercase block">Cross-Visits</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= VIEW 2: PATIENTS DATA BANK ================= */}
          {activeNav === 'PATIENTS' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">National Patients Data Bank</h2>
                  <p className="text-xs text-slate-500">
                    Comprehensive electronic health records, CNIC verification & hospital account balances
                  </p>
                </div>
                <button
                  onClick={onOpenCreatePatient}
                  className="px-4 py-2 bg-[#008f7a] hover:bg-[#007a68] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  Enroll New Patient
                </button>
              </div>

              <PatientsDataBank
                patients={patients}
                records={records}
                hospitals={hospitals}
                onOpenCreatePatient={onOpenCreatePatient}
                onOpenPatientScanner={(payload: string) => {
                  const p = patients.find((pat) => pat.qrPayload === payload || pat.nationalId === payload);
                  if (p) {
                    setSelectedPedestalPatient(p);
                    onUnlockPatient(p);
                    setActiveNav('CLINICAL_CARE');
                  }
                }}
              />
            </div>
          )}

          {/* ================= VIEW 3: CLINICAL CARE & CROSS-HOSPITAL RECORDS ================= */}
          {activeNav === 'CLINICAL_CARE' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Clinical Care & Medical Records</h2>
                  <p className="text-xs text-slate-500">
                    EHR timeline, doctor diagnoses, medications, lab findings & emergency vitals
                  </p>
                </div>
                <button
                  onClick={onOpenAddRecord}
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-[#f37335] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  + Create Clinical Record
                </button>
              </div>

              {isUnlocked && scannedPatient ? (
                <CrossHospitalViewer
                  patient={scannedPatient}
                  records={records}
                  currentHospital={currentHospital}
                  onOpenAddRecord={onOpenAddRecord}
                  onLockSession={onLockSession}
                />
              ) : (
                <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center mx-auto">
                    <QrCode className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Patient Session Locked</h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                      Scan patient QR code or select a patient from the Patients Data Bank to unlock confidential cross-hospital records.
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => onUnlockPatient(selectedPedestalPatient)}
                      className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      Unlock {selectedPedestalPatient.name}
                    </button>
                    <button
                      onClick={() => setActiveNav('PATIENTS')}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      Browse Patients Bank
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= VIEW 4: HOSPITAL OPERATIONS (OPD TOKENS & APPOINTMENTS) ================= */}
          {activeNav === 'HOSPITAL_OPERATIONS' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Hospital Operations & Appointments</h2>
                  <p className="text-xs text-slate-500">
                    OPD Departmental queues (Orthopedics, Cardiology, etc.), doctor schedules, and patient tokens
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={onOpenBookModal}
                    className="px-4 py-2 bg-gradient-to-r from-orange-500 to-[#f37335] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                  >
                    <Calendar className="w-4 h-4" />
                    Book Doctor Appointment
                  </button>
                </div>
              </div>

              {/* Departmental OPD Queue Manager */}
              <OpdTokenManager
                tokens={tokens}
                patients={patients}
                currentHospital={currentHospital}
                onIssueToken={onIssueToken}
                onUpdateTokenStatus={onUpdateTokenStatus}
              />

              {/* Appointments List View */}
              <AppointmentsListView
                appointments={appointments}
                hospitals={hospitals}
                currentHospital={currentHospital}
                onUpdateStatus={onUpdateAppointmentStatus}
                onOpenBookModal={onOpenBookModal}
              />
            </div>
          )}

          {/* ================= VIEW 5: DIAGNOSTICS & LABS ================= */}
          {activeNav === 'DIAGNOSTICS' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
                    <FlaskConical className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Diagnostics & Pathology Network</h3>
                    <p className="text-xs text-slate-500">Electronic test ordering, lab reports & automated barcode triage</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
                  LIS Sync Active
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {['Complete Blood Picture (CBC)', 'Fasting Blood Glucose & HbA1c', 'Lipid Profile', 'Liver Function Tests (LFT)', 'Renal Function Tests (RFT)', 'Cardiac Troponin-I'].map((test) => (
                  <div key={test} className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{test}</h4>
                      <span className="text-[10px] text-slate-500">Turnaround: 2-4 Hours</span>
                    </div>
                    <button
                      onClick={() => triggerNotice(`Test requested: ${test}`)}
                      className="px-2.5 py-1 bg-teal-700 text-white rounded-lg text-[10px] font-bold hover:bg-teal-800 cursor-pointer"
                    >
                      Order
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= VIEW 6: PHARMACY & PRESCRIPTIONS ================= */}
          {activeNav === 'PHARMACY' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <Pill className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Hospital Pharmacy & Drug Formulary</h3>
                    <p className="text-xs text-slate-500">Automated prescription dispensing & allergen cross-checking</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-bold">
                  2,840 Items in Stock
                </span>
              </div>

              <div className="p-4 bg-teal-50/60 rounded-2xl border border-teal-200 text-xs text-teal-900">
                <strong>Active Formulary:</strong> Connected to WHO Essential Medicines list. Zero contraindication alerts currently pending.
              </div>
            </div>
          )}

          {/* ================= VIEW 7: FINANCE & BILLING ================= */}
          {activeNav === 'FINANCE_BILLING' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Finance, Billing & Patient Accounts</h3>
                    <p className="text-xs text-slate-500">Automated receipts with QR verification & hospital account ledger</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-500">
                  Mongoose MongoDB Ledger Active
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                To generate an official paid receipt with QR code and OPD token, proceed through the{' '}
                <button onClick={onOpenBookModal} className="text-orange-600 font-bold underline cursor-pointer">
                  Appointment Booking
                </button>{' '}
                portal.
              </div>
            </div>
          )}

          {/* ================= VIEW 8: NETWORK & DATA BANK ================= */}
          {activeNav === 'NETWORK_DATA_BANK' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">National Network Nodes</h2>
                  <p className="text-xs text-slate-500">Cross-hospital data synchronization infrastructure</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {satelliteHospitals.map((hosp) => (
                  <div key={hosp.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-slate-400">Node: {hosp.id}</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        {hosp.status}
                      </span>
                    </div>
                    <h4 className="text-base font-black text-slate-900">{hosp.name}</h4>
                    <p className="text-xs text-slate-500">{hosp.city} Regional Healthcare Cluster</p>
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-400">Sync Latency: &lt; 40ms</span>
                      <button
                        onClick={() => triggerNotice(`Synchronized with ${hosp.name}`)}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 font-bold cursor-pointer"
                      >
                        Ping Node
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= VIEW 9: REPORTS & ANALYTICS ================= */}
          {activeNav === 'REPORTS_ANALYTICS' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
              <h3 className="text-base font-bold text-slate-900">Hospital Performance & Analytics Reports</h3>
              <p className="text-xs text-slate-500">Live operational throughput, token wait times, and bed utilization</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Avg OPD Wait Time</span>
                  <span className="text-xl font-black text-slate-900 block font-mono mt-1">11.4 Mins</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Bed Turnover Rate</span>
                  <span className="text-xl font-black text-slate-900 block font-mono mt-1">4.2 Days</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400">EHR QR Scan Success</span>
                  <span className="text-xl font-black text-emerald-700 block font-mono mt-1">99.8%</span>
                </div>
              </div>
            </div>
          )}

          {/* ================= VIEW 10: AI & INTEGRATIONS ================= */}
          {activeNav === 'AI_INTEGRATIONS' && (
            <div className="bg-gradient-to-b from-[#062524] to-[#021111] p-6 sm:p-8 rounded-3xl border border-teal-500/30 text-white space-y-5">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🤖</span>
                <div>
                  <h3 className="text-lg font-black text-white">Full AI Health Companion & Integrations</h3>
                  <p className="text-xs text-teal-300">Clinical decision support, drug-drug interaction checker, and diagnostic guidance</p>
                </div>
              </div>

              <div className="space-y-3">
                {aiMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl max-w-xl text-xs ${
                      msg.sender === 'ai'
                        ? 'bg-teal-950/80 border border-teal-800 text-teal-100'
                        : 'bg-teal-600 text-white ml-auto'
                    }`}
                  >
                    {msg.text}
                  </div>
                ))}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAiSend();
                }}
                className="flex items-center gap-2 pt-2"
              >
                <input
                  type="text"
                  value={aiChatInput}
                  onChange={(e) => setAiChatInput(e.target.value)}
                  placeholder="Ask the AI clinical companion..."
                  className="flex-1 bg-white/10 text-white text-xs px-4 py-3 rounded-2xl border border-teal-700 outline-none focus:ring-2 focus:ring-teal-400"
                />
                <button
                  type="submit"
                  className="px-5 py-3 bg-[#20c997] hover:bg-[#1bb386] text-[#062524] rounded-2xl text-xs font-black transition cursor-pointer"
                >
                  Ask AI
                </button>
              </form>
            </div>
          )}

          {/* ================= VIEW 11: SETTINGS ================= */}
          {activeNav === 'SETTINGS' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
              <h3 className="text-base font-bold text-slate-900">Facility & Network Settings</h3>
              <p className="text-xs text-slate-500">Configure current hospital node, database endpoints & staff licenses</p>
              <div className="space-y-3 max-w-md pt-2 text-xs">
                <div>
                  <label className="text-slate-600 font-bold block mb-1">Active Hospital Facility:</label>
                  <select
                    value={currentHospital.id}
                    onChange={(e) => {
                      const match = hospitals.find((h) => h.id === e.target.value);
                      if (match) onSelectHospital(match);
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 outline-none font-bold text-slate-800"
                  >
                    {hospitals.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name} ({h.city})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
