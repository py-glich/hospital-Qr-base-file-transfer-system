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
  RefreshCw,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import type { Hospital, Patient, MedicalRecord, OpdToken, Appointment } from '../types/ehr';
import { OpdTokenManager } from './OpdTokenManager';
import { AppointmentsListView } from './AppointmentsListView';
import { PatientsDataBank } from './PatientsDataBank';
import { CrossHospitalViewer } from './CrossHospitalViewer';
import { CameraQRScanner } from './CameraQRScanner';
import { FinanceBillingView } from './FinanceBillingView';

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
  const [centerStageMode, setCenterStageMode] = useState<'ACTIVITY' | 'HOLOGRAM'>('ACTIVITY');
  const [activityTimeframe, setActivityTimeframe] = useState<'Last 7 days' | 'Last 30 days'>('Last 7 days');
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
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 px-3.5 sm:px-6 py-2.5 flex items-center justify-between gap-2.5 sm:gap-4 shadow-xs">
        {/* Logo, Brand & Mobile Menu Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
            title="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-[#008f7a] to-[#20c997] flex items-center justify-center text-white shadow-md shadow-teal-500/20 shrink-0">
            {/* Medical Cross Graphic */}
            <div className="relative flex items-center justify-center">
              <div className="w-4 sm:w-5 h-1.5 sm:h-2 bg-white rounded-xs"></div>
              <div className="h-4 sm:h-5 w-1.5 sm:w-2 bg-white rounded-xs absolute"></div>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-lg font-black text-slate-900 tracking-tight">MediLink 360</span>
            </div>
            <p className="text-[9px] sm:text-[10px] text-slate-400 font-semibold tracking-wider uppercase -mt-0.5 sm:-mt-1">
              Unified Healthcare Network
            </p>
          </div>
        </div>

        {/* Global Floating Search Bar */}
        <div className="flex-1 max-w-xs md:max-w-md lg:max-w-xl mx-2 sm:mx-6 hidden sm:block">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patient, hospital, record, or anything..."
              className="w-full bg-[#f4f7f9] hover:bg-[#eef3f6] focus:bg-white text-xs sm:text-sm text-slate-800 pl-11 pr-16 py-2 rounded-full border border-slate-200/80 outline-none focus:ring-2 focus:ring-teal-500/30 transition shadow-inner"
            />
            <span className="absolute right-3 px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-mono font-bold text-slate-400 shadow-2xs pointer-events-none hidden md:inline">
              Ctrl K
            </span>
          </div>
        </div>

        {/* Top Right Controls & Staff Profile */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <button
            onClick={() => triggerNotice('Alerts: All 4 hospital database connections are optimal.')}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-600 transition relative cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 right-1.5 sm:top-2 sm:right-2 ring-2 ring-white"></span>
          </button>

          <button
            onClick={() => setActiveNav('AI_INTEGRATIONS')}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200/80 hidden xs:flex items-center justify-center text-slate-600 transition cursor-pointer"
            title="Messages"
          >
            <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          <button
            onClick={() => setActiveNav('OVERVIEW')}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200/80 hidden sm:flex items-center justify-center text-slate-600 transition cursor-pointer"
            title="Applications Menu"
          >
            <Grid className="w-4 h-4" />
          </button>

          {/* User Profile Pill */}
          <div className="flex items-center gap-2 pl-1.5 sm:pl-3 border-l border-slate-200">
            <img
              src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=150&q=80"
              alt="Dr. Ahmed Khan"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover ring-2 ring-teal-500/40 shadow-xs shrink-0"
            />
            <div className="hidden xl:block text-left">
              <span className="text-xs font-black text-slate-900 block leading-tight">Dr. Ahmed Khan</span>
              <span className="text-[10px] text-slate-400 font-medium block">Hospital Administrator</span>
            </div>
          </div>

          {/* Exit / Return to Patient Page Button */}
          {onExitToGateway && (
            <button
              onClick={onExitToGateway}
              className="px-2.5 sm:px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0"
              title="Exit to Patient First Page"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-600" />
              <span className="hidden md:inline">Exit</span>
            </button>
          )}
        </div>
      </header>

      {/* Floating Notice Toast */}
      {actionNotice && (
        <div className="fixed top-16 right-4 sm:right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-in slide-in-from-top-4 duration-200 max-w-[90vw]">
          <Sparkles className="w-4 h-4 text-teal-400 shrink-0" />
          <span className="truncate">{actionNotice}</span>
          <button onClick={() => setActionNotice(null)} className="ml-2 text-slate-400 hover:text-white shrink-0">
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
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden"
          ></div>
        )}

        {/* ================= A. CURVED DEEP TEAL SIDEBAR ================= */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-50 lg:z-30 w-72 lg:w-64 bg-gradient-to-b from-[#092b2c] via-[#051f20] to-[#021314] text-white flex flex-col justify-between shrink-0 shadow-2xl transition-transform duration-300 border-r border-teal-500/20 ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          {/* Subtle Cyber Glow Wave Edge */}
          <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-teal-400/0 via-emerald-400/40 to-teal-400/0 pointer-events-none"></div>

          {/* Mobile Drawer Header */}
          <div className="p-4 flex items-center justify-between border-b border-teal-500/20 lg:hidden">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#008f7a] to-[#20c997] flex items-center justify-center text-white shadow-md">
                <div className="relative flex items-center justify-center">
                  <div className="w-4 h-1.5 bg-white rounded-xs"></div>
                  <div className="h-4 w-1.5 bg-white rounded-xs absolute"></div>
                </div>
              </div>
              <div>
                <span className="text-sm font-black text-white block">MediLink 360</span>
                <span className="text-[10px] text-teal-300/80">Unified Healthcare</span>
              </div>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

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

              {/* ================= STAGE SWITCHER TABS: [PATIENT ACTIVITY & NETWORK] vs [3D HOLOGRAM] ================= */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCenterStageMode('ACTIVITY')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      centerStageMode === 'ACTIVITY'
                        ? 'bg-[#0f3b60] text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Activity className="w-3.5 h-3.5" />
                    Patient Activity & Network View
                  </button>
                  <button
                    onClick={() => setCenterStageMode('HOLOGRAM')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      centerStageMode === 'HOLOGRAM'
                        ? 'bg-[#0f3b60] text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Network className="w-3.5 h-3.5" />
                    3D National Hologram Pedestal
                  </button>
                </div>
                <span className="hidden sm:inline text-xs text-slate-400 font-medium">
                  MediLink 360 Unified Architecture
                </span>
              </div>

              {/* ================= MIDDLE SECTION: PATIENT ACTIVITY / HOLOGRAM + AI ASSISTANT ================= */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                {/* LEFT & CENTER COLS (Span 8) */}
                <div className="lg:col-span-8 flex flex-col gap-5">
                  {centerStageMode === 'ACTIVITY' ? (
                    /* VIEW A: PATIENT ACTIVITY BAR CHART + HEALTH RECORD NETWORK CARD MATCHING IMAGE 1 */
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                      {/* CARD 1: Patient Activity Bar Chart (Col 7) */}
                      <div className="md:col-span-7 bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-sm font-black text-slate-900 tracking-tight">Patient Activity</h3>
                          <button
                            onClick={() =>
                              setActivityTimeframe((prev) =>
                                prev === 'Last 7 days' ? 'Last 30 days' : 'Last 7 days'
                              )
                            }
                            className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-[11px] font-bold text-slate-700 flex items-center gap-1 cursor-pointer transition"
                          >
                            <span>{activityTimeframe}</span>
                            <ChevronDown className="w-3 h-3 text-slate-500" />
                          </button>
                        </div>

                        {/* Bar Chart Canvas with Y-Axis and Grid */}
                        <div className="relative pt-6 pb-2">
                          {/* Y-Axis Guidelines & Numbers */}
                          <div className="absolute left-0 top-0 bottom-6 w-8 flex flex-col justify-between text-[10px] font-bold text-slate-400 pointer-events-none select-none">
                            <span>200</span>
                            <span>150</span>
                            <span>100</span>
                            <span>50</span>
                            <span>0</span>
                          </div>

                          {/* Bars Container */}
                          <div className="ml-9 h-44 flex items-end justify-between gap-2 border-b border-slate-200 px-2 relative">
                            {/* Horizontal guide lines */}
                            <div className="absolute inset-x-0 top-0 border-b border-dashed border-slate-100 pointer-events-none"></div>
                            <div className="absolute inset-x-0 top-1/4 border-b border-dashed border-slate-100 pointer-events-none"></div>
                            <div className="absolute inset-x-0 top-2/4 border-b border-dashed border-slate-100 pointer-events-none"></div>
                            <div className="absolute inset-x-0 top-3/4 border-b border-dashed border-slate-100 pointer-events-none"></div>

                            {/* Mon (65) */}
                            <div className="flex-1 flex flex-col items-center gap-1 group relative">
                              <div
                                style={{ height: '33%' }}
                                className="w-full max-w-[32px] bg-gradient-to-t from-[#38bdf8] to-[#4fd1c5] rounded-t-lg transition-all duration-300 group-hover:brightness-110"
                              ></div>
                              <span className="text-[10px] font-bold text-slate-500 group-hover:text-slate-900">
                                Mon
                              </span>
                            </div>

                            {/* Tue (95) */}
                            <div className="flex-1 flex flex-col items-center gap-1 group relative">
                              <div
                                style={{ height: '48%' }}
                                className="w-full max-w-[32px] bg-gradient-to-t from-[#38bdf8] to-[#4fd1c5] rounded-t-lg transition-all duration-300 group-hover:brightness-110"
                              ></div>
                              <span className="text-[10px] font-bold text-slate-500 group-hover:text-slate-900">
                                Tue
                              </span>
                            </div>

                            {/* Wed (125) */}
                            <div className="flex-1 flex flex-col items-center gap-1 group relative">
                              <div
                                style={{ height: '62%' }}
                                className="w-full max-w-[32px] bg-gradient-to-t from-[#38bdf8] to-[#4fd1c5] rounded-t-lg transition-all duration-300 group-hover:brightness-110"
                              ></div>
                              <span className="text-[10px] font-bold text-slate-500 group-hover:text-slate-900">
                                Wed
                              </span>
                            </div>

                            {/* Thu (110) */}
                            <div className="flex-1 flex flex-col items-center gap-1 group relative">
                              <div
                                style={{ height: '55%' }}
                                className="w-full max-w-[32px] bg-gradient-to-t from-[#38bdf8] to-[#4fd1c5] rounded-t-lg transition-all duration-300 group-hover:brightness-110"
                              ></div>
                              <span className="text-[10px] font-bold text-slate-500 group-hover:text-slate-900">
                                Thu
                              </span>
                            </div>

                            {/* Fri (170 with floating '130' tag matching image) */}
                            <div className="flex-1 flex flex-col items-center gap-1 group relative">
                              {/* Floating Badge Tag matching image Fri bar */}
                              <div className="absolute -top-6 bg-slate-900 text-white font-mono font-bold text-[10px] px-2 py-0.5 rounded-md shadow-md animate-bounce">
                                130
                              </div>
                              <div
                                style={{ height: '80%' }}
                                className="w-full max-w-[32px] bg-gradient-to-t from-[#008f7a] to-[#2dd4bf] rounded-t-lg shadow-sm transition-all duration-300 group-hover:brightness-110"
                              ></div>
                              <span className="text-[10px] font-black text-teal-800">Fri</span>
                            </div>

                            {/* Sat (135) */}
                            <div className="flex-1 flex flex-col items-center gap-1 group relative">
                              <div
                                style={{ height: '68%' }}
                                className="w-full max-w-[32px] bg-gradient-to-t from-[#38bdf8] to-[#4fd1c5] rounded-t-lg transition-all duration-300 group-hover:brightness-110"
                              ></div>
                              <span className="text-[10px] font-bold text-slate-500 group-hover:text-slate-900">
                                Sat
                              </span>
                            </div>

                            {/* Sun (90) */}
                            <div className="flex-1 flex flex-col items-center gap-1 group relative">
                              <div
                                style={{ height: '45%' }}
                                className="w-full max-w-[32px] bg-gradient-to-t from-[#38bdf8] to-[#4fd1c5] rounded-t-lg transition-all duration-300 group-hover:brightness-110"
                              ></div>
                              <span className="text-[10px] font-bold text-slate-500 group-hover:text-slate-900">
                                Sun
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* CARD 2: Health Record Network Card (Col 5) */}
                      <div className="md:col-span-5 bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <h3 className="text-sm font-black text-slate-900 tracking-tight">Health Record Network</h3>
                            <button
                              onClick={() => triggerNotice('Syncing all 42 nationwide hospital EHR nodes...')}
                              className="w-7 h-7 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 flex items-center justify-center transition cursor-pointer"
                              title="Sync Network"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Top stat: 42 Connected Hospitals */}
                          <div className="mt-4 flex items-center gap-3.5 p-3.5 bg-gradient-to-r from-teal-50/80 to-sky-50/50 rounded-2xl border border-teal-100">
                            <div className="w-11 h-11 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs shrink-0">
                              <Building2 className="w-6 h-6" />
                            </div>
                            <div>
                              <div className="text-2xl font-black text-slate-900 font-mono leading-none">42</div>
                              <span className="text-xs font-bold text-slate-600 mt-0.5 block">Connected Hospitals</span>
                            </div>
                          </div>

                          {/* Bottom 2 mini metrics matching Image 1 */}
                          <div className="grid grid-cols-2 gap-3 mt-3">
                            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                              <div className="flex items-center gap-1.5 text-emerald-600 mb-1">
                                <FileText className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-bold uppercase">Records</span>
                              </div>
                              <span className="text-base font-black text-slate-900 font-mono block">5.4M+</span>
                              <span className="text-[10px] text-slate-500 font-medium">Health Records</span>
                            </div>

                            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                              <div className="flex items-center gap-1.5 text-teal-600 mb-1">
                                <ArrowLeftRight className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-bold uppercase">Visits</span>
                              </div>
                              <span className="text-base font-black text-slate-900 font-mono block">24,781</span>
                              <span className="text-[10px] text-slate-500 font-medium">Cross-Hospital Visits</span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-100 text-center">
                          <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200/60 inline-flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            All nodes operational
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* VIEW B: 3D HOLOGRAPHIC PEDESTAL (Original Pedestal Mode) */
                    <div className="bg-gradient-to-b from-[#e8f4f8] via-[#e2eef2] to-[#d6e7ec] rounded-3xl p-6 sm:p-8 border border-white/80 shadow-inner relative overflow-hidden flex flex-col items-center justify-center min-h-[380px]">
                      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#008f7a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

                      <div className="w-full max-w-2xl relative z-10 flex flex-col items-center justify-center">
                        {/* Top Nodes */}
                        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 mb-3 sm:mb-4">
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

                        {/* Pedestal QR Hologram */}
                        <div className="relative my-2 flex flex-col items-center">
                          <div className="absolute -inset-10 bg-cyan-400/20 rounded-full blur-2xl pointer-events-none animate-pulse"></div>
                          <div className="relative z-20 w-52 sm:w-60 bg-gradient-to-br from-cyan-400/25 via-teal-900/60 to-slate-950/85 backdrop-blur-xl border-2 border-cyan-300/80 rounded-3xl p-4 shadow-2xl text-center text-white transform -rotate-1 hover:rotate-0 transition duration-300">
                            <div className="w-9 h-9 rounded-full bg-cyan-400/30 border border-cyan-300 flex items-center justify-center mx-auto mb-1 text-cyan-200">
                              <Users className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-200 block">
                              Patient Health ID
                            </span>
                            <span className="text-sm font-black font-mono text-white tracking-wider block mt-0.5">
                              {selectedPedestalPatient.nationalId || 'PK-HR-784512'}
                            </span>
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

                          <div className="mt-3 bg-gradient-to-r from-teal-900 via-cyan-900 to-teal-900 text-cyan-200 px-6 py-2 rounded-full border-2 border-cyan-400/60 shadow-[0_0_25px_rgba(6,182,212,0.5)] flex items-center gap-2 text-xs font-bold tracking-wide">
                            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                            <span>National Patient Health Data Bank</span>
                          </div>
                        </div>

                        {/* Bottom Nodes */}
                        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 mt-3 sm:mt-4">
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
                  )}
                </div>

                {/* RIGHT AI HEALTH ASSISTANT PANEL (Col 4) */}
                <div className="lg:col-span-4 bg-gradient-to-b from-[#062524] via-[#041a1a] to-[#021111] rounded-3xl p-5 border border-teal-500/30 text-white shadow-xl flex flex-col justify-between min-h-[380px] relative overflow-hidden">
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
                    <div className="max-h-24 overflow-y-auto space-y-2 pr-1 scrollbar-none text-[11px]">
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
                  <button
                    onClick={onOpenCreatePatient}
                    className="bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl p-3 flex flex-col items-center text-center transition cursor-pointer shadow-2xs group hover:-translate-y-0.5"
                  >
                    <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-teal-50 text-slate-700 group-hover:text-teal-700 flex items-center justify-center transition mb-1.5">
                      <UserPlus className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 leading-tight">Register Patient</span>
                  </button>

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

                  <button
                    onClick={onOpenBookModal}
                    className="bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl p-3 flex flex-col items-center text-center transition cursor-pointer shadow-2xs group hover:-translate-y-0.5"
                  >
                    <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-1.5">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 leading-tight">New Appointment</span>
                  </button>

                  <button
                    onClick={onOpenAddRecord}
                    className="bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl p-3 flex flex-col items-center text-center transition cursor-pointer shadow-2xs group hover:-translate-y-0.5"
                  >
                    <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-1.5 font-bold font-serif">
                      ℞
                    </div>
                    <span className="text-xs font-bold text-slate-800 leading-tight">Create Prescription</span>
                  </button>

                  <button
                    onClick={() => triggerNotice('Lab Order Form Opened: Diagnostics catalog synchronized.')}
                    className="bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl p-3 flex flex-col items-center text-center transition cursor-pointer shadow-2xs group hover:-translate-y-0.5"
                  >
                    <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-1.5">
                      <FlaskConical className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 leading-tight">Order Lab Test</span>
                  </button>

                  <button
                    onClick={() => triggerNotice('Radiology Order Opened: X-Ray, CT, MRI and Ultrasound scheduling.')}
                    className="bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl p-3 flex flex-col items-center text-center transition cursor-pointer shadow-2xs group hover:-translate-y-0.5"
                  >
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-1.5">
                      <Activity className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 leading-tight">Order Imaging</span>
                  </button>

                  <button
                    onClick={() => triggerNotice('IPD Bed Admission: 142 beds currently available in General & ICU.')}
                    className="bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl p-3 flex flex-col items-center text-center transition cursor-pointer shadow-2xs group hover:-translate-y-0.5"
                  >
                    <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-1.5">
                      <Bed className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 leading-tight">Admit Patient</span>
                  </button>

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

              {/* ================= BOTTOM ANALYTICS & APPOINTMENTS ROW MATCHING EXACT IMAGE 1 ================= */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5">
                {/* CARD 1: Hospital Performance (Area Chart) - Col 4 on laptop, Col 6 on tablet */}
                <div className="md:col-span-6 lg:col-span-4 bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-slate-900">Hospital Performance</h4>
                    <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-[11px] font-bold text-slate-700 flex items-center gap-1 cursor-pointer">
                      This Week <ChevronDown className="w-3 h-3 text-slate-500" />
                    </span>
                  </div>

                  <div className="relative pt-4">
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
                      <path
                        d="M 10 75 Q 40 70, 70 65 T 130 55 T 160 25 T 200 45 T 250 35 T 310 65 L 310 85 L 10 85 Z"
                        fill="url(#performanceGrad)"
                      />
                      <path
                        d="M 10 75 Q 40 70, 70 65 T 130 55 T 160 25 T 200 45 T 250 35 T 310 65"
                        fill="none"
                        stroke="#008f7a"
                        strokeWidth="2.5"
                      />
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

                {/* CARD 2: Bed Occupancy (Donut Gauge) - Col 3 on laptop, Col 6 on tablet */}
                <div className="md:col-span-6 lg:col-span-3 bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
                  <h4 className="text-sm font-bold text-slate-900 mb-2">Bed Occupancy</h4>

                  <div className="flex items-center justify-between gap-3">
                    <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-slate-100"
                          strokeWidth="3.8"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
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
                        <span className="text-[7px] text-slate-400 font-bold uppercase">Occupied</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs flex-1">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-slate-600 text-[10px]">
                          <span className="w-2 h-2 rounded-full bg-teal-700"></span> Occupied
                        </span>
                        <span className="font-mono font-bold text-slate-900 text-xs">214</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-slate-600 text-[10px]">
                          <span className="w-2 h-2 rounded-full bg-teal-300"></span> Available
                        </span>
                        <span className="font-mono font-bold text-slate-900 text-xs">142</span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                        <span className="flex items-center gap-1.5 text-slate-400 text-[10px]">
                          <span className="w-2 h-2 rounded-full bg-slate-300"></span> Total Beds
                        </span>
                        <span className="font-mono font-bold text-slate-700 text-xs">356</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CARD 3: Recent Appointments Table - Col 5 on laptop, Col 12 on tablet */}
                <div className="md:col-span-12 lg:col-span-5 bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h4 className="text-sm font-black text-slate-900 tracking-tight">Recent Appointments</h4>
                    <button
                      onClick={() => setActiveNav('HOSPITAL_OPERATIONS')}
                      className="text-xs font-bold text-[#008f7a] hover:underline cursor-pointer"
                    >
                      View all
                    </button>
                  </div>

                  <div className="overflow-x-auto scrollbar-none mt-2">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                          <th className="pb-1.5 font-bold">Time</th>
                          <th className="pb-1.5 font-bold">Patient</th>
                          <th className="pb-1.5 font-bold">Department</th>
                          <th className="pb-1.5 font-bold text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 text-[11px]">
                        {[
                          { time: '09:00', patient: 'New Patient', dept: 'General Medicine', status: 'Checked In', isGreen: true },
                          { time: '10:30', patient: 'Follow-up', dept: 'Cardiology', status: 'Scheduled', isGreen: false },
                          { time: '11:15', patient: 'Consultation', dept: 'Orthopedics', status: 'Scheduled', isGreen: false },
                          { time: '13:00', patient: 'Routine Check', dept: 'Pediatrics', status: 'Checked In', isGreen: true },
                          { time: '14:30', patient: 'Follow-up', dept: 'Dermatology', status: 'Scheduled', isGreen: false },
                        ].map((row, i) => (
                          <tr key={i} className="hover:bg-slate-50/80 transition">
                            <td className="py-2 font-mono font-bold text-slate-700">{row.time}</td>
                            <td className="py-2 font-semibold text-slate-900">{row.patient}</td>
                            <td className="py-2 text-slate-500">{row.dept}</td>
                            <td className="py-2 text-right">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-block ${
                                  row.isGreen
                                    ? 'bg-[#d1fae5] text-[#065f46] border border-emerald-200'
                                    : 'bg-[#e0f2fe] text-[#0369a1] border border-sky-200'
                                }`}
                              >
                                {row.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
                currentHospital={currentHospital}
                onOpenCreatePatient={onOpenCreatePatient}
                onOpenPatientScanner={(payload: string) => {
                  const p = patients.find((pat) => pat.qrPayload === payload || pat.nationalId === payload);
                  if (p) {
                    setSelectedPedestalPatient(p);
                    onUnlockPatient(p);
                    setActiveNav('CLINICAL_CARE');
                    triggerNotice(`Cross-Hospital QR Verified: Unlocked external records for ${p.name}`);
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
                    Cross-hospital longitudinal EHR timeline, doctor diagnoses, medications, lab findings & emergency vitals
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {isUnlocked && scannedPatient && (
                    <button
                      onClick={onLockSession}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      Scan Another Patient QR
                    </button>
                  )}
                  <button
                    onClick={onOpenAddRecord}
                    className="px-4 py-2 bg-gradient-to-r from-orange-500 to-[#f37335] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    + Create Clinical Record
                  </button>
                </div>
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
                /* CROSS-HOSPITAL QR SCANNING TERMINAL (ENFORCES QR SCAN FOR EXTERNAL PATIENTS) */
                <div className="space-y-5">
                  {/* Top Policy Banner */}
                  <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-50 via-teal-50 to-sky-50 border-2 border-amber-300 rounded-3xl shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
                        <QrCode className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-black text-slate-900">
                            Cross-Hospital EHR Decryption Protocol Active
                          </h3>
                          <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-bold">
                            Station: {currentHospital.name}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                          To view patient reports, prescriptions, or diagnostics from other hospitals (such as{' '}
                          <b>Shifa International Hospital</b> or <b>Mayo Hospital</b>), doctors at{' '}
                          <b>{currentHospital.name}</b> must scan the patient's Universal Health QR Code to authorize cross-hospital access.
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase">
                        Current Facility Node
                      </span>
                      <span className="text-xs font-mono font-bold text-teal-800 bg-teal-100/80 px-2.5 py-1 rounded-lg inline-block mt-0.5">
                        {currentHospital.badge}
                      </span>
                    </div>
                  </div>

                  {/* Dual Grid: Live Camera Scanner + Hospital Security & Decryption Protocol */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                    {/* Left: Camera QR Scanner (Span 7) */}
                    <div className="lg:col-span-7 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <span>📷</span>
                        <span>Optical QR Health Card Scanner</span>
                      </h4>
                      <CameraQRScanner
                        onScanSuccess={(decodedText) => {
                          const p = patients.find(
                            (pat) =>
                              pat.qrPayload === decodedText ||
                              pat.nationalId === decodedText ||
                              decodedText.includes(pat.id) ||
                              decodedText.includes(pat.nationalId)
                          );
                          if (p) {
                            setSelectedPedestalPatient(p);
                            onUnlockPatient(p);
                            const isCross = p.primaryHospitalId !== currentHospital.id;
                            const originName = hospitals.find((h) => h.id === p.primaryHospitalId)?.name || 'External Hospital';
                            triggerNotice(
                              isCross
                                ? `QR Scan Verified: Decrypted cross-hospital records for ${p.name} from ${originName}`
                                : `QR Scan Verified: Opened local health record for ${p.name}`
                            );
                          } else {
                            triggerNotice('❌ Unrecognized QR code. Please scan a valid registered Health Card.');
                          }
                        }}
                        patients={patients}
                      />
                    </div>

                    {/* Right: Hospital Security & Decryption Policy Terminal (Span 5) */}
                    <div className="lg:col-span-5 space-y-4">
                      {/* Security Status Box */}
                      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                          <div>
                            <span className="text-[10px] font-mono font-bold text-teal-700 uppercase tracking-wider block">
                              National Health Data Exchange
                            </span>
                            <h4 className="text-sm font-black text-slate-900 mt-0.5">
                              Zero-Bypass Access Security
                            </h4>
                          </div>
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            Enforced
                          </span>
                        </div>

                        {/* Strict Rule Notice */}
                        <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-950 text-xs leading-relaxed space-y-1.5">
                          <div className="flex items-center gap-1.5 font-bold text-amber-900">
                            <Lock className="w-3.5 h-3.5 text-amber-700" />
                            <span>Strict Multi-Hospital Sovereignty</span>
                          </div>
                          <p className="text-[11px] text-amber-900/90">
                            Patient records originating from other hospitals (such as <b>Shifa International</b> or <b>Mayo Hospital</b>) are strictly encrypted. No physician or hospital can view or open external patient histories without scanning the patient's authenticated QR code.
                          </p>
                        </div>

                        {/* Scanning Step-by-Step Instructions */}
                        <div className="space-y-3 pt-1">
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                            Cross-Hospital Decryption Steps:
                          </span>

                          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                            <div className="w-6 h-6 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                              1
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 text-xs">Patient Presents Health Card</p>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                Ask the patient for their Universal Health Card (physical card or mobile QR on their phone).
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                            <div className="w-6 h-6 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                              2
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 text-xs">Optical Camera or File Upload</p>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                Activate the camera feed to scan the QR code live, or upload a digital health card screenshot.
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                            <div className="w-6 h-6 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                              3
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 text-xs">Cryptographic Decryption</p>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                The system verifies the digital token, logs access in the immutable audit trail, and unlocks the full longitudinal EHR.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Node details */}
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                          <span>Active Station: <b>{currentHospital.name}</b></span>
                          <span className="font-mono font-bold text-teal-700">{currentHospital.city} Node</span>
                        </div>
                      </div>
                    </div>
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
            <FinanceBillingView
              patients={patients}
              hospitals={hospitals}
              currentHospital={currentHospital}
              onOpenBookModal={onOpenBookModal}
            />
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

      {/* ================= 3. BOTTOM BANNER STRIP MATCHING REFERENCE IMAGE ================= */}
      <footer className="w-full bg-[#d0e5f2] border-t border-slate-300/80 px-4 sm:px-8 py-3 flex flex-col md:flex-row items-center justify-between gap-2 text-xs select-none shrink-0 z-30 text-center md:text-left">
        <div className="text-[10px] sm:text-[11px] font-black text-[#144272] tracking-wider uppercase font-mono">
          PEOPLE CARE BETTER TOGETHER
        </div>
        <div className="text-sm sm:text-base font-black text-[#0f3b60] tracking-tight">
          A healthier tomorrow, together
        </div>
        <div className="text-[10px] sm:text-[11px] font-bold text-[#144272] tracking-wider uppercase font-mono">
          CARE PEOPLE PROGRESS • A HEALTHIER TOMORROW
        </div>
      </footer>
    </div>
  );
};
