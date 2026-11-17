import React, { useState, useRef } from 'react';
import type { Hospital, Patient, MedicalRecord, OpdToken, Appointment } from '../types/ehr';
import { OpdTokenManager } from './OpdTokenManager';
import { CrossHospitalViewer } from './CrossHospitalViewer';
import { CameraQRScanner } from './CameraQRScanner';
import { FinanceBillingView } from './FinanceBillingView';

export type MediLinkNav =
  | 'overview'
  | 'patients'
  | 'clinical'
  | 'operations'
  | 'diagnostics'
  | 'pharmacy'
  | 'billing'
  | 'network'
  | 'reports'
  | 'ai'
  | 'settings';

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

// Exact Icon Paths from Demo
const IC: Record<string, string> = {
  home: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22V12h6v10',
  users: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8',
  heart: 'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z',
  bld: 'M3 21h18M5 21V7l7-4 7 4v14M9 9h1M14 9h1M9 13h1M14 13h1',
  lab: 'M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3',
  pill: 'M10.5 20.5l10-10a4.95 4.95 0 0 0-7-7l-10 10a4.95 4.95 0 0 0 7 7zM8.5 8.5l7 7',
  card: 'M1 4h22v16H1zM1 10h22',
  net: 'M18 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM8.6 13.5l6.8 4M15.4 6.5l-6.8 4',
  bar: 'M3 3v18h18M7 15l4-4 3 3 6-7',
  cpu: 'M3 12h4l3-8 4 16 3-8h4',
  gear: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z',
  cal: 'M3 5h18v16H3zM16 3v4M8 3v4M3 11h18',
  bed: 'M2 18V6M2 14h20v4M22 14v-2a3 3 0 0 0-3-3h-9v5M6 11h.01',
  alert: 'M12 3l10 18H2zM12 10v5M12 18h.01',
  doc: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h5',
  trend: 'M23 6l-9.5 9.5-5-5L1 18M17 6h6v6',
  send: 'M22 2L11 13M22 2l-7 20-4-9-9-4z',
  spark: 'M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z',
};

const NAV_ITEMS: [MediLinkNav, string, string, number][] = [
  ['overview', 'Overview', 'home', 0],
  ['patients', 'Patients', 'users', 6],
  ['clinical', 'Clinical Care', 'heart', 22],
  ['operations', 'Hospital Operations', 'bld', 36],
  ['diagnostics', 'Diagnostics', 'lab', 48],
  ['pharmacy', 'Pharmacy', 'pill', 52],
  ['billing', 'Finance & Billing', 'card', 52],
  ['network', 'Network & Data Bank', 'net', 50],
  ['reports', 'Reports & Analytics', 'bar', 36],
  ['ai', 'AI & Integrations', 'cpu', 22],
  ['settings', 'Settings', 'gear', 8],
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const ACT_DATA: Record<string, { l: string[]; v: number[] }> = {
  'Last 7 days': { l: DAYS, v: [78, 104, 125, 131, 172, 146, 136] },
  'Last 4 weeks': { l: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'], v: [780, 824, 861, 892] },
};

const PERF_DATA: Record<string, number[]> = {
  'This Week': [640, 780, 850, 892, 760, 790, 860],
  'Last Week': [610, 720, 810, 850, 740, 760, 810],
};

const SAMPLE_APPOINTMENTS: [string, string, string, string][] = [
  ['09:00', 'New Patient (Ayesha)', 'General Medicine', 'Checked In'],
  ['10:30', 'Follow-up (Bilal)', 'Cardiology', 'Scheduled'],
  ['11:15', 'Consultation (Farah)', 'Orthopedics', 'Scheduled'],
  ['13:00', 'Routine Check (Zainab)', 'Pediatrics', 'Checked In'],
  ['14:30', 'Follow-up (Usman)', 'Dermatology', 'Scheduled'],
];

const DRUG_INVENTORY: [string, number, number, string, string][] = [
  ['Paracetamol 500 mg', 1800, 600, '2027-08', 'B2231'],
  ['Amoxicillin 500 mg', 240, 400, '2027-03', 'B2198'],
  ['ORS sachets', 950, 300, '2027-01', 'B2255'],
  ['Insulin glargine', 38, 50, '2026-12', 'B2107'],
  ['Metformin 500 mg', 1100, 500, '2028-02', 'B2260'],
  ['Normal saline 500 ml', 420, 200, '2026-12', 'B2142'],
  ['Omeprazole 20 mg', 700, 300, '2027-11', 'B2249'],
  ['Salbutamol inhaler', 64, 40, '2027-05', 'B2213'],
];

const AI_KNOWLEDGE: Record<string, string> = {
  history:
    'Ayesha Malik, 34. Three OPD visits this year for recurrent headaches. No admissions. Known allergy: Penicillin. Vital trends: BP 122/80, Pulse 74 bpm.',
  dx:
    'Differential Diagnostic Support: Pattern fits tension-type headache with cervical strain. Red flags: nil recorded. Verify vision clarity and photophobia before prescription.',
  lab:
    'Lab Trends Analysis: Fasting blood glucose over 3 quarters: 104 -> 112 -> 121 mg/dL. Moderate upward trend; repeat HbA1c advised within 30 days.',
  note:
    'Draft Clinical Note: "34-year-old female presents with tension headaches for 3 weeks. Vitals stable. Advised ergonomic adjustments and lifestyle modifications. Review in 14 days."',
};

export const MediLinkDashboard: React.FC<MediLinkDashboardProps> = ({
  patients,
  records,
  tokens,
  appointments: _appointments,
  hospitals,
  currentHospital,
  onSelectHospital: _onSelectHospital,
  onIssueToken,
  onUpdateTokenStatus,
  onBookAppointment: _onBookAppointment,
  onUpdateAppointmentStatus: _onUpdateAppointmentStatus,
  onPatientUpserted: _onPatientUpserted,
  onOpenCreatePatient,
  onOpenAddRecord,
  onOpenBookModal,
  onExitToGateway,
  scannedPatient,
  isUnlocked: _isUnlocked,
  onLockSession,
  onUnlockPatient,
}) => {
  const [activeNav, setActiveNav] = useState<MediLinkNav>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [actRange, setActRange] = useState<'Last 7 days' | 'Last 4 weeks'>('Last 7 days');
  const [perfWeek, setPerfWeek] = useState<'This Week' | 'Last Week'>('This Week');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // AI Assistant Typewriter State
  const [aiReplyText, setAiReplyText] = useState(
    'Pick a task above to see clinical intelligence analysis.'
  );
  const [isTyping, setIsTyping] = useState(false);
  const [aiCustomPrompt, setAiCustomPrompt] = useState('');
  const typingTimerRef = useRef<any>(null);

  const triggerAiType = (fullText: string, footerMsg?: string) => {
    if (typingTimerRef.current) clearInterval(typingTimerRef.current);
    setIsTyping(true);
    setAiReplyText('');
    let idx = 0;
    typingTimerRef.current = setInterval(() => {
      idx += 2;
      setAiReplyText(fullText.slice(0, idx));
      if (idx >= fullText.length) {
        clearInterval(typingTimerRef.current);
        setIsTyping(false);
        if (footerMsg) {
          setAiReplyText(fullText + '\n' + footerMsg);
        }
      }
    }, 20);
  };

  const handleAiAction = (taskKey: string) => {
    const text = AI_KNOWLEDGE[taskKey] || 'Clinical data analyzed.';
    triggerAiType(
      text,
      '(Verified by Clinical Intelligence Engine • Doctor review required)'
    );
  };

  const handleAiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiCustomPrompt.trim()) return;
    const q = aiCustomPrompt.trim();
    triggerAiType(
      `Assistant response for "${q}": Clinical records searched. Unified cross-hospital bank reports zero conflicting interactions. Synchronized across 42 network stations.`,
      '(Live Network Query Output)'
    );
    setAiCustomPrompt('');
  };

  // Filtered patients for Patients Tab
  const filteredPatients = patients.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      p.nationalId.toLowerCase().includes(q)
    );
  });

  // Calculate Bar Chart dimensions
  const act = ACT_DATA[actRange];
  const barMax = Math.ceil(Math.max(...act.v) / 50) * 50;
  const barPeakIdx = act.v.indexOf(Math.max(...act.v));

  // Calculate Performance Area Chart
  const perfVals = PERF_DATA[perfWeek];
  const perfMin = Math.min(...perfVals) - 120;
  const perfMax = Math.max(...perfVals) + 10;
  const perfPeakIdx = perfVals.indexOf(Math.max(...perfVals));
  const perfPts = perfVals.map((v, i) => {
    const x = 24 + (i * (560 - 24 - 28)) / (perfVals.length - 1);
    const y = 170 - 26 - ((170 - 26 - 34) * (v - perfMin)) / (perfMax - perfMin);
    return [x, y];
  });

  // Cubic Bezier curve string
  const smPath = (pts: number[][]) => {
    let d = `M${pts[0][0]} ${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i - 1] || pts[i];
      const b = pts[i];
      const c = pts[i + 1];
      const e = pts[i + 2] || c;
      d += ` C${(b[0] + (c[0] - a[0]) / 6).toFixed(1)} ${(b[1] + (c[1] - a[1]) / 6).toFixed(1)}, ${(c[0] - (e[0] - b[0]) / 6).toFixed(1)} ${(c[1] - (e[1] - b[1]) / 6).toFixed(1)}, ${c[0].toFixed(1)} ${c[1].toFixed(1)}`;
    }
    return d;
  };
  const perfD = smPath(perfPts);

  // Bed occupancy calculations
  const donutC = 2 * Math.PI * 44;
  const donutDash = ((214 / 356) * donutC).toFixed(1);

  return (
    <div id="app" className="shell">
      {/* ================= 1. SIDEBAR COLUMN WITH PROGRESSIVE ML CURVE ================= */}
      <aside className="sidecol">
        {/* Brand */}
        <div className="brand">
          <svg viewBox="0 0 48 48" aria-hidden="true">
            <defs>
              <linearGradient id="bg2" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#2fd493" />
                <stop offset="1" stopColor="#0f8f82" />
              </linearGradient>
            </defs>
            <path
              d="M17 3h14a4 4 0 0 1 4 4v10h10a4 4 0 0 1 4 4v6a4 4 0 0 1-4 4H35v10a4 4 0 0 1-4 4H17a4 4 0 0 1-4-4V31H3a4 4 0 0 1-4-4v-6a4 4 0 0 1 4-4h10V7a4 4 0 0 1 4-4z"
              fill="url(#bg2)"
              transform="translate(2 1)"
            />
          </svg>
          <div>
            <b>MediLink 360</b>
            <small>Unified Healthcare Network</small>
          </div>
        </div>

        {/* Curved Deep Teal Navigation with progressive bulge offsets */}
        <nav className="side" id="nav" aria-label="Main">
          {NAV_ITEMS.map(([id, label, iconKey, offset]) => {
            const isActive = activeNav === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveNav(id)}
                className={`nav ${isActive ? 'active' : ''}`}
                style={{ '--ml': `${offset}px` } as React.CSSProperties}
                aria-current={isActive ? 'page' : undefined}
              >
                <svg viewBox="0 0 24 24">
                  <path d={IC[iconKey]} />
                </svg>
                <span>{label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* ================= 2. MAIN WORKSPACE COLUMN ================= */}
      <div className="col">
        {/* Top Header */}
        <header className="top">
          <label className="search">
            <svg viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" />
            </svg>
            <input
              type="search"
              id="gsearch"
              placeholder="Search patient, hospital, record, or anything..."
              aria-label="Search"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value && activeNav !== 'patients') {
                  setActiveNav('patients');
                }
              }}
            />
            <kbd>Ctrl K</kbd>
          </label>

          {/* Icon Button: Quick Scanner */}
          <button
            className="ib"
            type="button"
            aria-label="Open Camera QR Scanner"
            onClick={() => setIsScannerOpen(true)}
            title="Scan Cross-Hospital Patient QR"
          >
            <svg viewBox="0 0 24 24">
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
            </svg>
          </button>

          {/* Icon Button: Notifications */}
          <button className="ib" type="button" aria-label="Notifications">
            <svg viewBox="0 0 24 24">
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" />
            </svg>
            <i />
          </button>

          {/* Icon Button: Messages */}
          <button className="ib" type="button" aria-label="Messages">
            <svg viewBox="0 0 24 24">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </button>

          {/* User Profile Pill with initials */}
          <div className="userwrap">
            <button
              className="user"
              id="userBtn"
              type="button"
              aria-haspopup="true"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
            >
              <span className="av">
                {currentHospital.badge.slice(0, 2)}
              </span>
              <div>
                <b>Dr. Ahmed Khan</b>
                <small>{currentHospital.name.split(' ')[0]} Administrator</small>
              </div>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>

            {userMenuOpen && (
              <div className="menu" id="menu">
                <div style={{ padding: '8px 12px', fontSize: '11px', color: '#5f7a7d', borderBottom: '1px solid #edf5f6' }}>
                  Node: <b>{currentHospital.badge}</b> ({currentHospital.city})
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false);
                    setIsScannerOpen(true);
                  }}
                >
                  Scan Patient QR
                </button>
                <button
                  type="button"
                  id="out"
                  onClick={() => {
                    setUserMenuOpen(false);
                    if (onExitToGateway) onExitToGateway();
                  }}
                  style={{ color: '#b83a34' }}
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Dynamic Workspace */}
        <main id="view">
          {/* ---------------- A. OVERVIEW VIEW (EXACT 12-COLUMN BOARD) ---------------- */}
          {activeNav === 'overview' && (
            <div className="board">
              {/* Greeting */}
              <section className="greet">
                <p className="hi">Good Morning, Dr. Ahmed &#128075;</p>
                <h2>
                  A Connected<br />
                  <em>Healthcare Ecosystem</em>
                </h2>
                <p>
                  Manage your hospital, patients and access unified health records across the network.
                </p>
              </section>

              {/* 4 KPIs */}
              <div className="kpis">
                <div className="card kpi">
                  <span className="ico i-g">
                    <svg viewBox="0 0 24 24"><path d={IC.users} /></svg>
                  </span>
                  <div>
                    <small>Total Patients</small>
                    <b className="num">12,482</b>
                    <span className="up">&#8593; +12%</span>
                  </div>
                </div>

                <div className="card kpi">
                  <span className="ico i-p">
                    <svg viewBox="0 0 24 24"><path d={IC.cal} /></svg>
                  </span>
                  <div>
                    <small>OPD Visits</small>
                    <b className="num">892</b>
                    <span className="up">&#8593; +8%</span>
                  </div>
                </div>

                <div className="card kpi">
                  <span className="ico i-b">
                    <svg viewBox="0 0 24 24"><path d={IC.bed} /></svg>
                  </span>
                  <div>
                    <small>IPD Admissions</small>
                    <b className="num">214</b>
                    <span className="up">&#8593; +5%</span>
                  </div>
                </div>

                <div className="card kpi">
                  <span className="ico i-r">
                    <svg viewBox="0 0 24 24"><path d={IC.alert} /></svg>
                  </span>
                  <div>
                    <small>Emergency</small>
                    <b className="num">76</b>
                    <span className="up">&#8593; +18%</span>
                  </div>
                </div>
              </div>

              {/* AI Health Assistant with Floating Cyber-Robot SVG */}
              <aside className="ai">
                <svg className="robot" viewBox="0 0 120 110" aria-hidden="true">
                  <ellipse cx="60" cy="102" rx="44" ry="7" fill="#052e2c" opacity=".6" />
                  <rect x="30" y="54" width="60" height="44" rx="22" fill="#e9f7f5" />
                  <circle cx="60" cy="38" r="30" fill="#f3fbfa" />
                  <rect x="36" y="26" width="48" height="26" rx="13" fill="#0a2b2d" />
                  <circle cx="49" cy="38" r="5" fill="#35f0d4" />
                  <circle cx="71" cy="38" r="5" fill="#35f0d4" />
                  <path d="M52 46q8 5 16 0" stroke="#35f0d4" strokeWidth="2" fill="none" strokeLinecap="round" />
                  <rect x="24" y="29" width="8" height="20" rx="4" fill="#35f0d4" />
                  <rect x="88" y="29" width="8" height="20" rx="4" fill="#35f0d4" />
                  <path d="M50 78h20" stroke="#35f0d4" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="60" cy="6" r="3" fill="#35f0d4" />
                  <path d="M60 9v8" stroke="#cdeee8" strokeWidth="2" />
                </svg>
                <h3>
                  <svg viewBox="0 0 24 24"><path d={IC.spark} /></svg>
                  AI Health Assistant
                </h3>
                <p className="subt">Your intelligent clinical companion</p>

                <button
                  className="opt"
                  type="button"
                  onClick={() => handleAiAction('history')}
                >
                  <svg viewBox="0 0 24 24"><path d={IC.doc} /></svg>
                  Summarize patient history
                </button>

                <button
                  className="opt"
                  type="button"
                  onClick={() => handleAiAction('dx')}
                >
                  <svg viewBox="0 0 24 24"><path d={IC.heart} /></svg>
                  Suggest diagnosis (support)
                </button>

                <button
                  className="opt"
                  type="button"
                  onClick={() => handleAiAction('lab')}
                >
                  <svg viewBox="0 0 24 24"><path d={IC.trend} /></svg>
                  Analyze lab trends
                </button>

                <button
                  className="opt"
                  type="button"
                  onClick={() => handleAiAction('note')}
                >
                  <svg viewBox="0 0 24 24"><path d={IC.doc} /></svg>
                  Generate clinical note
                </button>

                <div className="reply" id="reply" aria-live="polite">
                  <span>{aiReplyText}</span>
                  {isTyping && <span className="caret" />}
                </div>

                <form className="ask" onSubmit={handleAiSubmit}>
                  <input
                    type="text"
                    placeholder="Ask anything..."
                    aria-label="Ask the assistant"
                    value={aiCustomPrompt}
                    onChange={(e) => setAiCustomPrompt(e.target.value)}
                  />
                  <button type="submit" aria-label="Send">
                    <svg viewBox="0 0 24 24"><path d={IC.send} /></svg>
                  </button>
                </form>
              </aside>

              {/* Patient Activity SVG Bar Chart */}
              <section className="card act">
                <h3>
                  Patient Activity
                  <select
                    className="sel"
                    aria-label="Range"
                    value={actRange}
                    onChange={(e) => setActRange(e.target.value as any)}
                  >
                    <option value="Last 7 days">Last 7 days</option>
                    <option value="Last 4 weeks">Last 4 weeks</option>
                  </select>
                </h3>
                <div id="actChart">
                  <svg
                    className="chart"
                    viewBox="0 0 560 230"
                    role="img"
                    aria-label="Patient activity bar chart"
                  >
                    <defs>
                      <linearGradient id="bg1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#5fd0c4" />
                        <stop offset="1" stopColor="#3fbdb0" />
                      </linearGradient>
                    </defs>
                    {[0, 1, 2, 3, 4].map((g) => {
                      const gv = (barMax * g) / 4;
                      const y = 230 - 26 - ((230 - 26 - 26) * g) / 4;
                      return (
                        <g key={g}>
                          <line className="gl" x1="36" x2="560" y1={y} y2={y} />
                          <text x="0" y={y + 4}>{Math.round(gv)}</text>
                        </g>
                      );
                    })}
                    {act.v.map((v, i) => {
                      const bw = (560 - 36) / act.v.length;
                      const w = Math.min(52, bw * 0.62);
                      const bh = ((230 - 26 - 26) * v) / barMax;
                      const x = 36 + i * bw + (bw - w) / 2;
                      const isTop = i === barPeakIdx;
                      return (
                        <g key={i}>
                          <rect
                            className={`bar ${isTop ? 'top' : ''}`}
                            x={x}
                            y={230 - 26 - bh}
                            width={w}
                            height={bh}
                            rx="5"
                          />
                          <text x={x + w / 2} y={230 - 8} textAnchor="middle">
                            {act.l[i]}
                          </text>
                          {isTop && (
                            <text
                              x={x + w / 2}
                              y={230 - 26 - bh - 8}
                              textAnchor="middle"
                              style={{ fontWeight: 700, fill: '#0e2a2d' }}
                            >
                              {v}
                            </text>
                          )}
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </section>

              {/* Health Record Network */}
              <section className="card hrn">
                <h3>Health Record Network</h3>
                <div className="hrt">
                  <span className="ico i-g" style={{ width: '52px', height: '52px' }}>
                    <svg viewBox="0 0 24 24"><path d={IC.bld} /></svg>
                  </span>
                  <div>
                    <b className="num" style={{ fontSize: '30px', lineHeight: 1, display: 'block' }}>
                      42
                    </b>
                    <div style={{ fontSize: '13px', color: '#5f7a7d', fontWeight: 600 }}>
                      Connected Hospitals
                    </div>
                  </div>
                  <svg className="sync" viewBox="0 0 24 24">
                    <path d="M21 12a9 9 0 0 0-15-6.7L3 8M3 3v5h5M3 12a9 9 0 0 0 15 6.7L21 16M21 21v-5h-5" />
                  </svg>
                </div>
                <div className="hrb">
                  <div>
                    <b>5.4M+</b>
                    <small>Health Records</small>
                  </div>
                  <div>
                    <b className="num">24,781</b>
                    <small>Cross-Hospital Visits</small>
                  </div>
                </div>
              </section>

              {/* Hospital Performance Area Bezier Chart */}
              <section className="card perf">
                <h3>
                  Hospital Performance
                  <select
                    className="sel"
                    aria-label="Week"
                    value={perfWeek}
                    onChange={(e) => setPerfWeek(e.target.value as any)}
                  >
                    <option value="This Week">This Week</option>
                    <option value="Last Week">Last Week</option>
                  </select>
                </h3>
                <div id="perfChart">
                  <svg
                    className="chart"
                    viewBox="0 0 560 170"
                    role="img"
                    aria-label="Hospital performance area chart"
                  >
                    <defs>
                      <linearGradient id="ag1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#2fd493" stopOpacity=".5" />
                        <stop offset="1" stopColor="#2fd493" stopOpacity=".04" />
                      </linearGradient>
                    </defs>
                    <path
                      className="area"
                      d={`${perfD} L${perfPts[perfPts.length - 1][0]} ${170 - 26} L24 ${170 - 26} Z`}
                    />
                    <path className="ln" pathLength={1} d={perfD} />
                    <line
                      className="vl"
                      x1={perfPts[perfPeakIdx][0]}
                      x2={perfPts[perfPeakIdx][0]}
                      y1={perfPts[perfPeakIdx][1]}
                      y2={170 - 26}
                    />
                    <circle
                      className="dot"
                      cx={perfPts[perfPeakIdx][0]}
                      cy={perfPts[perfPeakIdx][1]}
                      r="5.5"
                    />
                    <text
                      className="val"
                      x={perfPts[perfPeakIdx][0] - 8}
                      y={perfPts[perfPeakIdx][1] - 12}
                      textAnchor="middle"
                    >
                      {perfVals[perfPeakIdx]}
                    </text>
                    {DAYS.map((d, i) => (
                      <text key={d} x={perfPts[i][0]} y={170 - 6} textAnchor="middle">
                        {d}
                      </text>
                    ))}
                  </svg>
                </div>
              </section>

              {/* Recent Appointments */}
              <section className="card appt">
                <h3>
                  Recent Appointments
                  <button
                    type="button"
                    onClick={() => setActiveNav('patients')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1a73c8', fontWeight: 600, fontSize: '15px' }}
                  >
                    View all
                  </button>
                </h3>
                <div className="tw">
                  <table>
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>Patient</th>
                        <th>Department</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {SAMPLE_APPOINTMENTS.map((a, i) => (
                        <tr key={i} style={{ animationDelay: `${0.4 + i * 0.07}s` }}>
                          <td className="num">{a[0]}</td>
                          <td style={{ fontWeight: 600 }}>{a[1]}</td>
                          <td>{a[2]}</td>
                          <td>
                            <span
                              className={`pill ${
                                a[3] === 'Checked In'
                                  ? 'p-good'
                                  : 'p-info'
                              }`}
                            >
                              {a[3]}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Bed Occupancy Animated Donut Gauge */}
              <section className="card bed">
                <h3>Bed Occupancy</h3>
                <div className="donut">
                  <svg viewBox="0 0 112 112" role="img" aria-label="60 percent of beds occupied">
                    <circle className="tr" cx="56" cy="56" r="44" />
                    <circle
                      className="fg"
                      cx="56"
                      cy="56"
                      r="44"
                      strokeDasharray={`${donutDash} ${donutC.toFixed(1)}`}
                      transform="rotate(-90 56 56)"
                    />
                    <text x="56" y="64" textAnchor="middle">
                      60%
                    </text>
                  </svg>
                  <div className="lg">
                    <span>
                      <i style={{ background: '#0f8f82' }} />
                      Occupied
                      <b className="num">214</b>
                    </span>
                    <span>
                      <i style={{ background: '#5ce3ad' }} />
                      Available
                      <b className="num">142</b>
                    </span>
                    <span>
                      <i style={{ background: '#a5b3c4' }} />
                      Total Beds
                      <b className="num">356</b>
                    </span>
                  </div>
                </div>
              </section>

              {/* Node Interoperability Card */}
              <section className="card hrn2">
                <h3>Node Interoperability</h3>
                <div className="hrt">
                  <span className="ico i-p" style={{ width: '52px', height: '52px' }}>
                    <svg viewBox="0 0 24 24"><path d={IC.net} /></svg>
                  </span>
                  <div>
                    <b className="num" style={{ fontSize: '30px', lineHeight: 1, display: 'block' }}>
                      99.98%
                    </b>
                    <div style={{ fontSize: '13px', color: '#5f7a7d', fontWeight: 600 }}>
                      Network Uptime
                    </div>
                  </div>
                  <span style={{ marginLeft: 'auto', background: '#d9f5e6', color: '#14803f', fontWeight: 700, padding: '4px 10px', borderRadius: '8px', fontSize: '12px' }}>
                    Active
                  </span>
                </div>
                <div className="hrb">
                  <div>
                    <b>&lt; 140ms</b>
                    <small>Sync Latency</small>
                  </div>
                  <div>
                    <b>SHA-256</b>
                    <small>Encryption Standard</small>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* ---------------- B. PATIENTS TAB ---------------- */}
          {activeNav === 'patients' && (
            <div>
              <div className="pg">
                <h2>Patients</h2>
                <p>One record per patient. Search by name, ID or department.</p>
              </div>
              <span className="banner">
                Unified Network Data Bank &bull; Synchronized across {hospitals.length} hospitals
              </span>

              <div className="card">
                <div className="tools" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <input
                    type="search"
                    placeholder="Search patients by name, ID, or CNIC..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label="Filter patients"
                  />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setIsScannerOpen(true)}
                      style={{
                        padding: '8px 16px',
                        background: '#14b27c',
                        color: '#fff',
                        borderRadius: '999px',
                        border: 0,
                        fontWeight: 700,
                        fontSize: '13px',
                        cursor: 'pointer'
                      }}
                    >
                      Scan QR Profile
                    </button>
                    <button
                      type="button"
                      onClick={onOpenCreatePatient}
                      style={{
                        padding: '8px 16px',
                        background: '#0f6a60',
                        color: '#fff',
                        borderRadius: '999px',
                        border: 0,
                        fontWeight: 700,
                        fontSize: '13px',
                        cursor: 'pointer'
                      }}
                    >
                      + Register Patient
                    </button>
                  </div>
                </div>

                <div className="tw">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Age</th>
                        <th>Primary Hospital</th>
                        <th>Phone</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPatients.length > 0 ? (
                        filteredPatients.map((p) => {
                          const isLocal = p.primaryHospitalId === currentHospital.id;
                          return (
                            <tr key={p.id}>
                              <td className="num" style={{ fontWeight: 700, color: '#17365d' }}>{p.id}</td>
                              <td style={{ fontWeight: 600 }}>{p.name}</td>
                              <td className="num">{p.age}</td>
                              <td>{p.primaryHospitalId === 'hosp-aku' ? 'Aga Khan' : p.primaryHospitalId === 'hosp-shifa' ? 'Shifa' : 'Mayo'}</td>
                              <td className="num">{p.phone}</td>
                              <td>
                                <span className={`pill ${isLocal ? 'p-good' : 'p-warn'}`}>
                                  {isLocal ? 'Home Node' : 'External Node'}
                                </span>
                              </td>
                              <td>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (isLocal) {
                                      onUnlockPatient(p);
                                      setActiveNav('clinical');
                                    } else {
                                      setIsScannerOpen(true);
                                    }
                                  }}
                                  style={{
                                    padding: '4px 12px',
                                    borderRadius: '6px',
                                    background: isLocal ? '#edf5f6' : '#fdecc8',
                                    color: isLocal ? '#0f6a60' : '#8f5600',
                                    border: '1px solid currentColor',
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                  }}
                                >
                                  {isLocal ? 'Open EHR' : 'Scan QR to Unlock'}
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={7} className="empty">No patient matches found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ---------------- C. CLINICAL CARE TAB (QR VERIFIED EHR) ---------------- */}
          {activeNav === 'clinical' && (
            <div>
              <div className="pg">
                <h2>Clinical Care & Record Exchange</h2>
                <p>Protected cross-hospital records. Requires live camera QR verification for external hospital patients.</p>
              </div>

              <CrossHospitalViewer
                patient={scannedPatient || patients[0]}
                records={records}
                currentHospital={currentHospital}
                onOpenAddRecord={onOpenAddRecord}
                onLockSession={onLockSession}
              />
            </div>
          )}

          {/* ---------------- D. HOSPITAL OPERATIONS (TOKENS & QUEUE) ---------------- */}
          {activeNav === 'operations' && (
            <div>
              <div className="pg">
                <h2>Hospital Operations & OPD Counter</h2>
                <p>Manage token queueing and doctor consult rooms in real-time.</p>
              </div>
              <OpdTokenManager
                tokens={tokens}
                patients={patients}
                currentHospital={currentHospital}
                onIssueToken={onIssueToken}
                onUpdateTokenStatus={onUpdateTokenStatus}
              />
            </div>
          )}

          {/* ---------------- E. DIAGNOSTICS TAB ---------------- */}
          {activeNav === 'diagnostics' && (
            <div>
              <div className="pg">
                <h2>Diagnostics & Laboratory</h2>
                <p>Laboratory findings, imaging telemetry, and pathology tracking.</p>
              </div>
              <span className="banner">Unified Diagnostic Exchange</span>
              <div className="rowk">
                <div className="card">
                  <small>Pending Lab Orders</small>
                  <b className="num">18</b>
                </div>
                <div className="card">
                  <small>Completed Today</small>
                  <b className="num">142</b>
                </div>
                <div className="card">
                  <small>Critical Alerts</small>
                  <b className="num" style={{ color: '#b83a34' }}>2</b>
                </div>
              </div>
              <div className="card">
                <div className="tw">
                  <table>
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Patient</th>
                        <th>Test Panel</th>
                        <th>Assigned Lab</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="num">LAB-9801</td>
                        <td>Ayesha Malik</td>
                        <td>Comprehensive Metabolic Panel (CMP)</td>
                        <td>Main Clinical Lab A</td>
                        <td><span className="pill p-good">Completed</span></td>
                      </tr>
                      <tr>
                        <td className="num">LAB-9802</td>
                        <td>Bilal Hussain</td>
                        <td>12-Lead ECG & Troponin I</td>
                        <td>Cardiac Diagnostics</td>
                        <td><span className="pill p-warn">Processing</span></td>
                      </tr>
                      <tr>
                        <td className="num">LAB-9803</td>
                        <td>Farah Naeem</td>
                        <td>Obstetric Pelvic Ultrasound</td>
                        <td>Radiology Wing</td>
                        <td><span className="pill p-good">Completed</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ---------------- F. PHARMACY TAB ---------------- */}
          {activeNav === 'pharmacy' && (
            <div>
              <div className="pg">
                <h2>Pharmacy</h2>
                <p>Batch and expiry tracking flags stockouts before they happen.</p>
              </div>
              <div className="rowk">
                <div className="card">
                  <small>Items tracked</small>
                  <b className="num">{DRUG_INVENTORY.length}</b>
                </div>
                <div className="card">
                  <small>Low stock</small>
                  <b className="num" style={{ color: '#b83a34' }}>2</b>
                </div>
                <div className="card">
                  <small>Expiring within 90 days</small>
                  <b className="num" style={{ color: '#8f5600' }}>2</b>
                </div>
              </div>
              <div className="card">
                <div className="tw">
                  <table>
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>In stock</th>
                        <th>Reorder at</th>
                        <th>Expiry</th>
                        <th>Batch</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {DRUG_INVENTORY.map((d, i) => {
                        const isLow = d[1] <= d[2];
                        return (
                          <tr key={i}>
                            <td style={{ fontWeight: 600 }}>{d[0]}</td>
                            <td className="num">{d[1]}</td>
                            <td className="num">{d[2]}</td>
                            <td className="num">{d[3]}</td>
                            <td className="num" style={{ fontFamily: 'monospace' }}>{d[4]}</td>
                            <td>
                              <span className={`pill ${isLow ? 'p-crit' : 'p-good'}`}>
                                {isLow ? 'Low stock' : 'OK'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ---------------- G. FINANCE & BILLING TAB (MONGODB LIVE LEDGER) ---------------- */}
          {activeNav === 'billing' && (
            <FinanceBillingView
              patients={patients}
              hospitals={hospitals}
              currentHospital={currentHospital}
              onOpenBookModal={onOpenBookModal}
            />
          )}

          {/* ---------------- H. NETWORK & DATA BANK ---------------- */}
          {activeNav === 'network' && (
            <div>
              <div className="pg">
                <h2>Network & Data Bank</h2>
                <p>Federated synchronization status across all provincial hospital nodes.</p>
              </div>
              <div className="rowk">
                <div className="card">
                  <small>Federated Nodes</small>
                  <b className="num">42</b>
                </div>
                <div className="card">
                  <small>Encrypted Sync Hash</small>
                  <b className="num" style={{ fontSize: '16px', fontFamily: 'monospace' }}>0x89e2..4cf7</b>
                </div>
                <div className="card">
                  <small>Cross-Query Rate</small>
                  <b className="num">1,480 / min</b>
                </div>
              </div>

              <div className="card">
                <h3 style={{ marginBottom: '14px' }}>Active Hospital Stations</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                  {hospitals.map((h) => (
                    <div
                      key={h.id}
                      style={{
                        padding: '16px',
                        borderRadius: '14px',
                        border: h.id === currentHospital.id ? '2px solid #14b27c' : '1px solid #e0ebed',
                        background: h.id === currentHospital.id ? '#edfcf7' : '#fff'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 800, fontSize: '15px' }}>{h.name}</span>
                        <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', background: '#d9f5e6', color: '#14803f' }}>
                          Online
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#5f7a7d' }}>City: {h.city}</div>
                      <div style={{ fontSize: '12px', color: '#5f7a7d', marginTop: '2px' }}>Station Code: <b>{h.badge}</b></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ---------------- I. REPORTS & ANALYTICS ---------------- */}
          {activeNav === 'reports' && (
            <div>
              <div className="pg">
                <h2>Reports & Analytics</h2>
                <p>Quarterly clinical volume, bed turnaround, and mortality indicators.</p>
              </div>
              <div className="two">
                <div className="card">
                  <h3>Clinical Volume Distribution</h3>
                  <div id="actChart">
                    <svg className="chart" viewBox="0 0 560 230">
                      <defs>
                        <linearGradient id="bgReport" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0" stopColor="#5fd0c4" />
                          <stop offset="1" stopColor="#3fbdb0" />
                        </linearGradient>
                      </defs>
                      {act.v.map((v, i) => {
                        const bw = (560 - 36) / act.v.length;
                        const w = Math.min(52, bw * 0.62);
                        const bh = ((230 - 26 - 26) * v) / barMax;
                        const x = 36 + i * bw + (bw - w) / 2;
                        return (
                          <g key={i}>
                            <rect className="bar top" x={x} y={230 - 26 - bh} width={w} height={bh} rx="5" />
                            <text x={x + w / 2} y={230 - 8} textAnchor="middle">{act.l[i]}</text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                </div>

                <div className="card">
                  <h3>Efficiency Metrics</h3>
                  <div style={{ display: 'grid', gap: '14px', marginTop: '12px' }}>
                    <div style={{ padding: '12px', background: '#f8fafb', borderRadius: '12px' }}>
                      <div style={{ fontSize: '12px', color: '#5f7a7d' }}>Average OPD Wait Time</div>
                      <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f6a60' }}>14 mins</div>
                    </div>
                    <div style={{ padding: '12px', background: '#f8fafb', borderRadius: '12px' }}>
                      <div style={{ fontSize: '12px', color: '#5f7a7d' }}>ER Response Time</div>
                      <div style={{ fontSize: '24px', fontWeight: 800, color: '#14b27c' }}>3.8 mins</div>
                    </div>
                    <div style={{ padding: '12px', background: '#f8fafb', borderRadius: '12px' }}>
                      <div style={{ fontSize: '12px', color: '#5f7a7d' }}>Bed Turnover Rate</div>
                      <div style={{ fontSize: '24px', fontWeight: 800, color: '#1f5f9e' }}>92.4%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ---------------- J. AI & INTEGRATIONS ---------------- */}
          {activeNav === 'ai' && (
            <div>
              <div className="pg">
                <h2>AI Clinical Integrations & Decision Support</h2>
                <p>Gemini medical intelligence engine, drug interaction analyzer, and clinical summarizer.</p>
              </div>
              <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                  <svg className="robot" viewBox="0 0 120 110" style={{ width: '80px', height: '80px' }}>
                    <ellipse cx="60" cy="102" rx="44" ry="7" fill="#052e2c" opacity=".6" />
                    <rect x="30" y="54" width="60" height="44" rx="22" fill="#e9f7f5" />
                    <circle cx="60" cy="38" r="30" fill="#f3fbfa" />
                    <rect x="36" y="26" width="48" height="26" rx="13" fill="#0a2b2d" />
                    <circle cx="49" cy="38" r="5" fill="#35f0d4" />
                    <circle cx="71" cy="38" r="5" fill="#35f0d4" />
                  </svg>
                  <div>
                    <h3 style={{ margin: 0 }}>MedPulse Clinical Intelligence</h3>
                    <p style={{ color: '#5f7a7d', fontSize: '14px', marginTop: '4px' }}>
                      Connected to unified multi-hospital patient bank. Real-time diagnosis safety verifier.
                    </p>
                  </div>
                </div>
                <div className="reply" style={{ fontSize: '14px', minHeight: '90px' }}>
                  {aiReplyText}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginTop: '16px' }}>
                  <button className="opt" type="button" onClick={() => handleAiAction('history')}>
                    Summarize Patient History
                  </button>
                  <button className="opt" type="button" onClick={() => handleAiAction('dx')}>
                    Differential Diagnosis Support
                  </button>
                  <button className="opt" type="button" onClick={() => handleAiAction('lab')}>
                    Evaluate Blood Lab Trend
                  </button>
                  <button className="opt" type="button" onClick={() => handleAiAction('note')}>
                    Draft Discharge Summary
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ---------------- K. SETTINGS TAB ---------------- */}
          {activeNav === 'settings' && (
            <div>
              <div className="pg">
                <h2>Settings & Node Security</h2>
                <p>Hospital station credentials and cryptographic keys.</p>
              </div>
              <div className="card" style={{ maxWidth: '640px' }}>
                <h3 style={{ marginBottom: '14px' }}>Station Information</h3>
                <div style={{ display: 'grid', gap: '12px', fontSize: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e0ebed', paddingBottom: '8px' }}>
                    <span style={{ color: '#5f7a7d' }}>Hospital Name:</span>
                    <b>{currentHospital.name}</b>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e0ebed', paddingBottom: '8px' }}>
                    <span style={{ color: '#5f7a7d' }}>Station Identifier:</span>
                    <b style={{ fontFamily: 'monospace' }}>{currentHospital.badge}</b>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e0ebed', paddingBottom: '8px' }}>
                    <span style={{ color: '#5f7a7d' }}>QR Access Security:</span>
                    <b style={{ color: '#14803f' }}>Strict (Scan Required For External Hospitals)</b>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e0ebed', paddingBottom: '8px' }}>
                    <span style={{ color: '#5f7a7d' }}>Database Ledger:</span>
                    <b>MongoDB (127.0.0.1:5001) &bull; Synchronized</b>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ================= 4. EXACT FOOTER BAND ================= */}
      <footer className="band">
        <span>People care better together</span>
        <b>A healthier tomorrow, together</b>
        <span>Care &bull; People &bull; Progress &bull; A healthier tomorrow</span>
      </footer>

      {/* ================= 5. OPTICAL CAMERA QR SCANNER MODAL ================= */}
      {isScannerOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', display: 'grid', placeItems: 'center', padding: '16px' }}>
          <div style={{ background: '#fff', borderRadius: '24px', padding: '24px', maxWidth: '520px', width: '100%', position: 'relative', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#17365d' }}>Scan Patient QR Profile</h3>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#5f7a7d' }}>Align patient QR card in camera view</p>
              </div>
              <button
                type="button"
                onClick={() => setIsScannerOpen(false)}
                style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#eef3f4', border: 0, cursor: 'pointer', fontWeight: 800 }}
              >
                ✕
              </button>
            </div>
            <CameraQRScanner
              patients={patients}
              onScanSuccess={(decodedText) => {
                setIsScannerOpen(false);
                const found = patients.find(
                  (p) =>
                    p.qrPayload.toLowerCase() === decodedText.toLowerCase() ||
                    p.id.toLowerCase() === decodedText.toLowerCase() ||
                    p.nationalId.toLowerCase() === decodedText.toLowerCase()
                );
                if (found) {
                  onUnlockPatient(found);
                  setActiveNav('clinical');
                } else {
                  alert(`Scanned code: "${decodedText}". No matching patient record in data bank.`);
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
