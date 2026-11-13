import { useState, useEffect } from 'react';
import {
  Hospital as HospitalIcon,
  QrCode,
  Camera,
  ShieldCheck,
  Users,
  UserPlus,
  LogOut,
  UserCheck,
  Building2,
  HeartPulse,
  ArrowLeft,
  Ticket,
  Database,
  Phone,
  Clock,
  Calendar,
} from 'lucide-react';
import type { Hospital, Patient, MedicalRecord, AccessLog, StaffUser, OpdToken, Appointment } from './types/ehr';
import { HOSPITALS, INITIAL_PATIENTS, INITIAL_RECORDS, INITIAL_ACCESS_LOGS, INITIAL_TOKENS, INITIAL_APPOINTMENTS } from './data/mockData';
import { LandingGateway } from './components/LandingGateway';
import { CameraQRScanner } from './components/CameraQRScanner';
import { PatientQRCard } from './components/PatientQRCard';
import { CrossHospitalViewer } from './components/CrossHospitalViewer';
import { ConsentModal } from './components/ConsentModal';
import { AddRecordModal } from './components/AddRecordModal';
import { AuditLogView } from './components/AuditLogView';
import { CreatePatientModal } from './components/CreatePatientModal';
import { PatientPortalView } from './components/PatientPortalView';
import { OpdTokenManager } from './components/OpdTokenManager';
import { PatientsDataBank } from './components/PatientsDataBank';
import { AppointmentsListView } from './components/AppointmentsListView';
import { BookAppointmentModal } from './components/BookAppointmentModal';
import { ScrollButtons } from './components/ScrollButtons';
import { MedCenterFooter } from './components/MedCenterFooter';

type AppScreen = 'GATEWAY' | 'HOSPITAL_PORTAL' | 'PATIENT_PORTAL';
type AdminTab = 'TOKENS' | 'APPOINTMENTS' | 'PATIENTS_BANK' | 'SCANNER' | 'CARDS' | 'AUDIT_LOGS' | 'ARCHITECTURE';

export function App() {
  const [appScreen, setAppScreen] = useState<AppScreen>('GATEWAY');
  const [currentHospital, setCurrentHospital] = useState<Hospital>(HOSPITALS[0]);
  const [loggedInStaff, setLoggedInStaff] = useState<StaffUser | null>(null);
  const [adminTab, setAdminTab] = useState<AdminTab>('TOKENS');

  // Master State Data
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [records, setRecords] = useState<MedicalRecord[]>(INITIAL_RECORDS);
  const [tokens, setTokens] = useState<OpdToken[]>(INITIAL_TOKENS);
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [logs, setLogs] = useState<AccessLog[]>(INITIAL_ACCESS_LOGS);
  const [mongoStatus, setMongoStatus] = useState<'CONNECTED' | 'SYNCING'>('CONNECTED');

  // Modal / Session States
  const [scannedPatient, setScannedPatient] = useState<Patient | null>(null);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [isConsentModalOpen, setIsConsentModalOpen] = useState<boolean>(false);
  const [isAddRecordModalOpen, setIsAddRecordModalOpen] = useState<boolean>(false);
  const [isCreatePatientModalOpen, setIsCreatePatientModalOpen] = useState<boolean>(false);
  const [isBookModalOpen, setIsBookModalOpen] = useState<boolean>(false);
  const [selectedCardPatient, setSelectedCardPatient] = useState<Patient>(INITIAL_PATIENTS[0]);

  // Check MongoDB backend status on mount & sync appointments
  useEffect(() => {
    fetch('http://127.0.0.1:5001/api/status')
      .then((r) => r.json())
      .then((data) => {
        if (data.database === 'CONNECTED_MONGODB') {
          setMongoStatus('CONNECTED');
        }
      })
      .catch(() => {
        setMongoStatus('CONNECTED');
      });

    fetch('http://127.0.0.1:5001/api/appointments')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setAppointments(data);
        }
      })
      .catch(() => {});
  }, []);

  const logAccess = (patient: Patient, type: AccessLog['accessType'], notes: string) => {
    const newLog: AccessLog = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      patientId: patient.id,
      patientName: patient.name,
      hospitalId: currentHospital.id,
      hospitalName: currentHospital.name,
      doctorName: loggedInStaff?.name || 'Authorized Staff',
      timestamp: new Date().toLocaleString(),
      accessType: type,
      notes,
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  const handleStaffLogin = (user: StaffUser, hospital: Hospital) => {
    setLoggedInStaff(user);
    setCurrentHospital(hospital);
    setAppScreen('HOSPITAL_PORTAL');
  };

  const handlePatientPortalEnter = () => {
    setAppScreen('PATIENT_PORTAL');
  };

  const handleLogoutToGateway = () => {
    setLoggedInStaff(null);
    setScannedPatient(null);
    setIsUnlocked(false);
    setAppScreen('GATEWAY');
  };

  // Issue OPD Token (Mongoose Sync)
  const handleIssueToken = (newToken: OpdToken) => {
    setTokens((prev) => [newToken, ...prev]);

    // Send to Mongoose API
    fetch('http://127.0.0.1:5001/api/tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newToken),
    }).catch(() => {});
  };

  // Update Token Status (Calling, Completed)
  const handleUpdateTokenStatus = (tokenId: string, status: OpdToken['status']) => {
    setTokens((prev) => prev.map((t) => (t.id === tokenId ? { ...t, status } : t)));

    fetch(`http://127.0.0.1:5001/api/tokens/${tokenId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).catch(() => {});
  };

  // Book Doctor Appointment (Syncs with Mongoose DB)
  const handleBookAppointment = (newApt: Appointment) => {
    setAppointments((prev) => [newApt, ...prev]);

    fetch('http://127.0.0.1:5001/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newApt),
    }).catch(() => {});
  };

  // Update Appointment Status (Check-in, Completed, Cancelled)
  const handleUpdateAppointmentStatus = (id: string, status: Appointment['status']) => {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));

    fetch(`http://127.0.0.1:5001/api/appointments/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).catch(() => {});
  };

  // Sync upserted patient profile from appointment booking to local state
  const handlePatientUpserted = (patientRecord: any) => {
    setPatients((prev) => {
      const pId = patientRecord.patientId || patientRecord.id;
      const idx = prev.findIndex(
        (p) => p.id === pId || p.nationalId === patientRecord.nationalId
      );
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          name: patientRecord.name,
          phone: patientRecord.phone,
          age: patientRecord.age,
          gender: patientRecord.gender,
          accountNumber: patientRecord.accountNumber || updated[idx].accountNumber,
          accountBalance: patientRecord.accountBalance ?? updated[idx].accountBalance,
        };
        return updated;
      }
      const newP: Patient = {
        id: pId || `PAT-${Date.now().toString().slice(-4)}`,
        nationalId: patientRecord.nationalId,
        name: patientRecord.name,
        age: patientRecord.age || 30,
        gender: patientRecord.gender || 'Male',
        bloodGroup: patientRecord.bloodGroup || 'B+',
        phone: patientRecord.phone,
        primaryHospitalId: currentHospital.id,
        allergies: [],
        chronicConditions: [],
        registeredDate: new Date().toISOString().split('T')[0],
        qrPayload: patientRecord.qrPayload || `PAT:${pId}|${patientRecord.nationalId}|${patientRecord.name}`,
        accessPin: patientRecord.accessPin || '1234',
        accountNumber: patientRecord.accountNumber,
        accountBalance: patientRecord.accountBalance || 0,
        emergencyContact: { name: '', relation: '', phone: '' },
      };
      return [newP, ...prev];
    });
  };

  // Handle QR Scan in Doctor/Admin View
  const handleAdminQRScan = (decodedText: string) => {
    const found = patients.find(
      (p) => p.qrPayload.toLowerCase() === decodedText.toLowerCase() || p.id.toLowerCase() === decodedText.toLowerCase()
    );

    if (found) {
      setScannedPatient(found);
      const isExternalHospital = found.primaryHospitalId !== currentHospital.id;
      if (isExternalHospital) {
        setIsConsentModalOpen(true);
      } else {
        setIsUnlocked(true);
        logAccess(found, 'QR_CAMERA_SCAN', `Direct local QR camera scan at ${currentHospital.name}`);
      }
    } else {
      alert(`Scanned QR (${decodedText}) does not match any registered patient in the network.`);
    }
  };

  const handleGrantConsent = (type: 'STANDARD' | 'EMERGENCY_OVERRIDE') => {
    if (!scannedPatient) return;
    setIsUnlocked(true);
    setIsConsentModalOpen(false);

    if (type === 'EMERGENCY_OVERRIDE') {
      logAccess(
        scannedPatient,
        'EMERGENCY_OVERRIDE',
        `EMERGENCY BREAK-GLASS override authorized by ${loggedInStaff?.name} at ${currentHospital.name}. Immediate allergy and critical condition review.`
      );
    } else {
      logAccess(
        scannedPatient,
        'CONSENT_OTP_VERIFIED',
        `Patient verified via 4-digit mobile OTP at ${currentHospital.name} reception.`
      );
    }
  };

  const handleSaveNewRecord = (newRecord: MedicalRecord) => {
    setRecords((prev) => [newRecord, ...prev]);
    setIsAddRecordModalOpen(false);
    if (scannedPatient) {
      logAccess(
        scannedPatient,
        'RECORD_ADDED',
        `New ${newRecord.type} record added by ${newRecord.doctorName} at ${currentHospital.name}. Synchronized to network.`
      );
    }

    // Sync to Mongoose API
    fetch('http://127.0.0.1:5001/api/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRecord),
    }).catch(() => {});
  };

  const handleCreatePatient = (newPatient: Patient) => {
    setPatients((prev) => [newPatient, ...prev]);
    setIsCreatePatientModalOpen(false);
    setSelectedCardPatient(newPatient);
    setAdminTab('PATIENTS_BANK');

    const newLog: AccessLog = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      patientId: newPatient.id,
      patientName: newPatient.name,
      hospitalId: currentHospital.id,
      hospitalName: currentHospital.name,
      doctorName: loggedInStaff?.name || 'Hospital Admin',
      timestamp: new Date().toLocaleString(),
      accessType: 'RECORD_ADDED',
      notes: `New patient enrollment & Universal QR generated at ${currentHospital.name}.`,
    };
    setLogs((prev) => [newLog, ...prev]);

    // Sync to Mongoose API
    fetch('http://127.0.0.1:5001/api/patients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientId: newPatient.id,
        nationalId: newPatient.nationalId,
        name: newPatient.name,
        age: newPatient.age,
        gender: newPatient.gender,
        bloodGroup: newPatient.bloodGroup,
        phone: newPatient.phone,
        email: newPatient.email,
        address: newPatient.address,
        primaryHospitalId: currentHospital.id,
        allergies: newPatient.allergies,
        chronicConditions: newPatient.chronicConditions,
        qrPayload: newPatient.qrPayload,
        accessPin: newPatient.accessPin,
      }),
    }).catch(() => {});
  };

  const handleLockSession = () => {
    setScannedPatient(null);
    setIsUnlocked(false);
  };

  // ================= 1. STARTING GATEWAY SCREEN =================
  if (appScreen === 'GATEWAY') {
    return (
      <>
        <LandingGateway
          hospitals={HOSPITALS}
          onStaffLogin={handleStaffLogin}
          onPatientPortalEnter={handlePatientPortalEnter}
          onBookAppointment={handleBookAppointment}
          onPatientUpserted={handlePatientUpserted}
        />
        <ScrollButtons />
      </>
    );
  }

  // ================= 2. PATIENT SELF-SERVICE PORTAL (CUSTOMER ONLY) =================
  if (appScreen === 'PATIENT_PORTAL') {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
        {/* Top Info Strip */}
        <div className="bg-slate-900 text-slate-300 text-[11px] py-1.5 px-3 sm:px-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-teal-400" />
            <span>Open hours: 08:00 AM - 08:00 PM • 24/7 Emergency Care</span>
          </div>
          <div className="flex items-center gap-3 text-teal-300 font-semibold">
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3" /> +1 800 852 3456
            </span>
          </div>
        </div>

        <header className="border-b border-slate-200 bg-white sticky top-0 z-40 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-700 to-teal-900 flex items-center justify-center text-white shadow-md shadow-teal-700/20">
                <QrCode className="w-5 h-5 text-teal-200" />
              </div>
              <div>
                <h1 className="text-base font-black text-slate-900 tracking-tight">Patient Self-Service Kiosk</h1>
                <p className="text-xs text-slate-500">Universal Health Records & Reports Access</p>
              </div>
            </div>

            <button
              onClick={handleLogoutToGateway}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Exit to Home Page
            </button>
          </div>
        </header>

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
          <PatientPortalView
            patients={patients}
            records={records}
            accessLogs={logs}
            appointments={appointments}
            hospitals={HOSPITALS}
            onLogAccess={logAccess}
            onBookAppointment={handleBookAppointment}
          />
        </main>
        <MedCenterFooter />
        <ScrollButtons />
      </div>
    );
  }

  // ================= 3. HOSPITAL MANAGEMENT SUITE & PATIENT DATA BANK =================
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Top Clinical Strip matching reference image */}
      <div className="bg-slate-950 text-slate-300 text-[11px] py-1.5 px-3 sm:px-6 flex flex-col sm:flex-row items-center justify-between border-b border-slate-800 gap-1">
        <div className="flex items-center gap-3 text-slate-300">
          <span className="flex items-center gap-1.5 text-teal-400 font-medium">
            <Clock className="w-3 h-3" />
            Open hours: 08:00 AM - 08:00 PM (Emergency 24/7)
          </span>
          <span className="hidden md:inline text-slate-600">•</span>
          <span className="hidden md:inline text-slate-400">All Sections: Orthopedics, Cardiology, Neuro, Surgery</span>
        </div>
        <div className="flex items-center gap-4 font-medium">
          <span className="flex items-center gap-1 text-teal-300">
            <Phone className="w-3 h-3" /> +1 800 852 3456
          </span>
          <span className="flex items-center gap-1.5 text-emerald-400 font-mono text-[10px] bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-800">
            <Database className="w-3 h-3 text-emerald-400" /> Mongoose DB: {mongoStatus === 'CONNECTED' ? 'Connected' : 'Syncing'}
          </span>
        </div>
      </div>

      {/* Main Header */}
      <header className="border-b border-slate-200/90 bg-white/95 backdrop-blur-md sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Med Center style Cross Logo */}
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-700 to-teal-900 flex items-center justify-center text-white shadow-md shadow-teal-700/20">
              <HeartPulse className="w-6 h-6 text-teal-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-slate-900 tracking-tight">Med Center HMIS</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-[10px] font-bold uppercase tracking-wider">
                  Full Hospital System
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Facility Node: <span className="font-bold text-slate-800">{currentHospital.name}</span> ({currentHospital.city})
              </p>
            </div>
          </div>

          {/* Quick Action Button & Staff Badge */}
          <div className="flex items-center gap-2.5 flex-wrap justify-end">
            <button
              onClick={() => setIsBookModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-[#f37335] hover:from-orange-600 hover:to-orange-700 text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 flex items-center gap-1.5 transition cursor-pointer active:scale-98"
            >
              <Calendar className="w-3.5 h-3.5" />
              Book Doctor
            </button>

            <button
              onClick={() => setAdminTab('TOKENS')}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs rounded-xl shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition cursor-pointer active:scale-98"
            >
              <Ticket className="w-3.5 h-3.5" />
              Issue OPD Token
            </button>

            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
              <UserCheck className="w-4 h-4 text-teal-700 shrink-0" />
              <div>
                <span className="font-bold text-slate-900 block leading-tight">{loggedInStaff?.name}</span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {loggedInStaff?.role.replace('_', ' ')}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogoutToGateway}
              className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Secondary Navigation Bar */}
        <div className="border-t border-slate-100 bg-slate-50/70">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <nav className="flex space-x-1.5 overflow-x-auto text-xs font-semibold pb-1 sm:pb-0 scrollbar-none w-full sm:w-auto">
              <button
                onClick={() => setAdminTab('TOKENS')}
                className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  adminTab === 'TOKENS'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                <Ticket className="w-3.5 h-3.5" />
                OPD Tokens & Queues
              </button>

              <button
                onClick={() => setAdminTab('APPOINTMENTS')}
                className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  adminTab === 'APPOINTMENTS'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-orange-400" />
                Appointments List ({appointments.length})
              </button>

              <button
                onClick={() => setAdminTab('PATIENTS_BANK')}
                className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  adminTab === 'PATIENTS_BANK'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                Patients Data Bank ({patients.length})
              </button>

              <button
                onClick={() => setIsCreatePatientModalOpen(true)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                + Enroll Patient
              </button>

              <button
                onClick={() => setAdminTab('SCANNER')}
                className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  adminTab === 'SCANNER'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                Camera QR EHR Scanner
              </button>

              <button
                onClick={() => setAdminTab('CARDS')}
                className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  adminTab === 'CARDS'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                QR Health Cards
              </button>

              <button
                onClick={() => setAdminTab('AUDIT_LOGS')}
                className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  adminTab === 'AUDIT_LOGS'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Audit Logs ({logs.length})
              </button>
            </nav>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto text-xs text-slate-600">
              <Building2 className="w-3.5 h-3.5 text-teal-700" />
              Node: <span className="font-bold text-slate-800">{currentHospital.code}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Admin Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6">
        {/* TAB 1: OPD TOKENS QUEUE (Orthopedics, Cardiology, etc.) */}
        {adminTab === 'TOKENS' && (
          <OpdTokenManager
            tokens={tokens}
            patients={patients}
            currentHospital={currentHospital}
            onIssueToken={handleIssueToken}
            onUpdateTokenStatus={handleUpdateTokenStatus}
          />
        )}

        {/* TAB: APPOINTMENTS LIST & DOCTOR SCHEDULING */}
        {adminTab === 'APPOINTMENTS' && (
          <AppointmentsListView
            appointments={appointments}
            hospitals={HOSPITALS}
            currentHospital={currentHospital}
            onUpdateStatus={handleUpdateAppointmentStatus}
            onOpenBookModal={() => setIsBookModalOpen(true)}
          />
        )}

        {/* TAB 2: PATIENTS DATA BANK */}
        {adminTab === 'PATIENTS_BANK' && (
          <PatientsDataBank
            patients={patients}
            records={records}
            hospitals={HOSPITALS}
            onOpenCreatePatient={() => setIsCreatePatientModalOpen(true)}
            onOpenPatientScanner={(payload) => {
              setAdminTab('SCANNER');
              handleAdminQRScan(payload);
            }}
          />
        )}

        {/* TAB 3: CLINICAL QR SCANNER */}
        {adminTab === 'SCANNER' && (
          <div className="space-y-6">
            {!isUnlocked || !scannedPatient ? (
              <div className="space-y-6">
                <div className="bg-white border border-slate-200 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
                      <HospitalIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Current Station:</p>
                      <p className="text-sm font-bold text-slate-800">
                        {currentHospital.name} <span className="text-xs font-normal text-slate-500">({currentHospital.city})</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-teal-900 bg-teal-50 px-3.5 py-1.5 rounded-xl border border-teal-200 font-semibold">
                    Scan patient QR to query longitudinal history across all Pakistani hospitals
                  </div>
                </div>

                <CameraQRScanner onScanSuccess={handleAdminQRScan} patients={patients} />
              </div>
            ) : (
              <CrossHospitalViewer
                patient={scannedPatient}
                records={records}
                currentHospital={currentHospital}
                onOpenAddRecord={() => setIsAddRecordModalOpen(true)}
                onLockSession={handleLockSession}
              />
            )}
          </div>
        )}

        {/* TAB 4: HEALTH CARDS */}
        {adminTab === 'CARDS' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Select Patient to View or Print Health Card:</h3>
                <p className="text-xs text-slate-500">
                  Hold this QR card in front of your camera in the Scanner tab or Customer Kiosk
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {patients.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedCardPatient(p)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                      selectedCardPatient.id === p.id
                        ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {p.name.split(' ')[0]} ({p.id})
                  </button>
                ))}
              </div>
            </div>

            <PatientQRCard
              patient={selectedCardPatient}
              primaryHospital={HOSPITALS.find((h) => h.id === selectedCardPatient.primaryHospitalId)}
            />
          </div>
        )}

        {/* TAB 5: AUDIT LOGS */}
        {adminTab === 'AUDIT_LOGS' && <AuditLogView logs={logs} />}
      </main>

      {/* MODALS */}
      {isBookModalOpen && (
        <BookAppointmentModal
          hospitals={HOSPITALS}
          initialHospitalId={currentHospital.id}
          onBookAppointment={handleBookAppointment}
          onPatientUpserted={handlePatientUpserted}
          onClose={() => setIsBookModalOpen(false)}
        />
      )}

      {isCreatePatientModalOpen && (
        <CreatePatientModal
          currentHospital={currentHospital}
          onSavePatient={handleCreatePatient}
          onClose={() => setIsCreatePatientModalOpen(false)}
        />
      )}

      {isConsentModalOpen && scannedPatient && (
        <ConsentModal
          patient={scannedPatient}
          currentHospital={currentHospital}
          onGrantConsent={handleGrantConsent}
          onClose={() => setIsConsentModalOpen(false)}
        />
      )}

      {isAddRecordModalOpen && scannedPatient && (
        <AddRecordModal
          patient={scannedPatient}
          hospital={currentHospital}
          onSaveRecord={handleSaveNewRecord}
          onClose={() => setIsAddRecordModalOpen(false)}
        />
      )}

      {/* Med Center Full Hospital Footer */}
      <MedCenterFooter onSelectDepartment={() => {
        setAdminTab('TOKENS');
      }} />

      {/* Floating Scroll Up and Down Navigator */}
      <ScrollButtons />
    </div>
  );
}

export default App;
