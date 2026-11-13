import { useState } from 'react';
import {
  Hospital as HospitalIcon,
  QrCode,
  Camera,
  ShieldCheck,
  Users,
  Layers,
  UserPlus,
  LogOut,
  UserCheck,
  Building2,
  HeartPulse,
  ArrowLeft,
} from 'lucide-react';
import type { Hospital, Patient, MedicalRecord, AccessLog, StaffUser } from './types/ehr';
import { HOSPITALS, INITIAL_PATIENTS, INITIAL_RECORDS, INITIAL_ACCESS_LOGS } from './data/mockData';
import { LandingGateway } from './components/LandingGateway';
import { CameraQRScanner } from './components/CameraQRScanner';
import { PatientQRCard } from './components/PatientQRCard';
import { CrossHospitalViewer } from './components/CrossHospitalViewer';
import { ConsentModal } from './components/ConsentModal';
import { AddRecordModal } from './components/AddRecordModal';
import { AuditLogView } from './components/AuditLogView';
import { CreatePatientModal } from './components/CreatePatientModal';
import { PatientPortalView } from './components/PatientPortalView';
import { ScrollButtons } from './components/ScrollButtons';

type AppScreen = 'GATEWAY' | 'HOSPITAL_PORTAL' | 'PATIENT_PORTAL';
type AdminTab = 'SCANNER' | 'ALL_PATIENTS' | 'CARDS' | 'AUDIT_LOGS' | 'ARCHITECTURE';

export function App() {
  // Screen Router: Start on Landing Gateway by default
  const [appScreen, setAppScreen] = useState<AppScreen>('GATEWAY');

  // Authenticated Hospital & Staff state
  const [currentHospital, setCurrentHospital] = useState<Hospital>(HOSPITALS[0]);
  const [loggedInStaff, setLoggedInStaff] = useState<StaffUser | null>(null);

  // Admin Portal Tab
  const [adminTab, setAdminTab] = useState<AdminTab>('SCANNER');

  // Master State Data
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [records, setRecords] = useState<MedicalRecord[]>(INITIAL_RECORDS);
  const [logs, setLogs] = useState<AccessLog[]>(INITIAL_ACCESS_LOGS);

  // Clinical Consultation / Scan States
  const [scannedPatient, setScannedPatient] = useState<Patient | null>(null);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [isConsentModalOpen, setIsConsentModalOpen] = useState<boolean>(false);
  const [isAddRecordModalOpen, setIsAddRecordModalOpen] = useState<boolean>(false);
  const [isCreatePatientModalOpen, setIsCreatePatientModalOpen] = useState<boolean>(false);
  const [selectedCardPatient, setSelectedCardPatient] = useState<Patient>(INITIAL_PATIENTS[0]);

  // Log Access
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

  // Called when Admin successfully logs in from Gateway
  const handleStaffLogin = (user: StaffUser, hospital: Hospital) => {
    setLoggedInStaff(user);
    setCurrentHospital(hospital);
    setAppScreen('HOSPITAL_PORTAL');
  };

  // Called when Patient enters self-service portal
  const handlePatientPortalEnter = () => {
    setAppScreen('PATIENT_PORTAL');
  };

  // Logout back to Starting Gateway
  const handleLogoutToGateway = () => {
    setLoggedInStaff(null);
    setScannedPatient(null);
    setIsUnlocked(false);
    setAppScreen('GATEWAY');
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
  };

  const handleCreatePatient = (newPatient: Patient) => {
    setPatients((prev) => [newPatient, ...prev]);
    setIsCreatePatientModalOpen(false);
    setSelectedCardPatient(newPatient);
    setAdminTab('CARDS');

    // Add audit log
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
        />
        <ScrollButtons />
      </>
    );
  }

  // ================= 2. PATIENT SELF-SERVICE PORTAL (CUSTOMER ONLY) =================
  if (appScreen === 'PATIENT_PORTAL') {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
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
            onLogAccess={logAccess}
          />
        </main>
        <ScrollButtons />
      </div>
    );
  }

  // ================= 3. HOSPITAL CLINICAL & ADMIN SYSTEM =================
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Top Header */}
      <header className="border-b border-slate-200/90 bg-white/95 backdrop-blur-md sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-700 to-teal-900 flex items-center justify-center text-white shadow-md shadow-teal-700/20">
              <HeartPulse className="w-6 h-6 text-teal-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-slate-900 tracking-tight">MedPulse Health Network</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-[10px] font-bold uppercase tracking-wider">
                  Admin & Clinical Suite
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Connected Hospital: <span className="font-bold text-slate-800">{currentHospital.name}</span> ({currentHospital.city})
              </p>
            </div>
          </div>

          {/* Active Logged-in Staff Badge & Logout */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-100/90 px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs">
              <UserCheck className="w-4 h-4 text-teal-700 shrink-0" />
              <div>
                <span className="font-bold text-slate-900 block leading-tight">{loggedInStaff?.name}</span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {loggedInStaff?.role.replace('_', ' ')} • {currentHospital.badge}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogoutToGateway}
              className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              title="Logout from Hospital System"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
        </div>

        {/* Secondary Navigation Bar */}
        <div className="border-t border-slate-100 bg-slate-50/70">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <nav className="flex space-x-1.5 overflow-x-auto text-xs font-semibold pb-1 sm:pb-0 scrollbar-none w-full sm:w-auto">
              <button
                onClick={() => setAdminTab('SCANNER')}
                className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  adminTab === 'SCANNER'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                Clinical QR Scanner
              </button>

              <button
                onClick={() => setIsCreatePatientModalOpen(true)}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                + Register New Patient
              </button>

              <button
                onClick={() => setAdminTab('ALL_PATIENTS')}
                className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  adminTab === 'ALL_PATIENTS'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                Patient Directory ({patients.length})
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
                Access Audit Ledger ({logs.length})
              </button>

              <button
                onClick={() => setAdminTab('ARCHITECTURE')}
                className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  adminTab === 'ARCHITECTURE'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Enterprise Specs
              </button>
            </nav>

            {/* Facility Indicator */}
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto text-xs text-slate-600">
              <Building2 className="w-3.5 h-3.5 text-teal-700" />
              Node: <span className="font-bold text-slate-800">{currentHospital.code}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Admin Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6">
        {/* TAB 1: CLINICAL QR SCANNER */}
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

        {/* TAB 2: ALL PATIENTS DIRECTORY */}
        {adminTab === 'ALL_PATIENTS' && (
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-100">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-800">National Patient Directory</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Enterprise registry linking registered individuals across participating healthcare nodes
                </p>
              </div>
              <button
                onClick={() => setIsCreatePatientModalOpen(true)}
                className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-teal-700/20 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                Enroll New Patient
              </button>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {patients.map((pat) => {
                const patRecords = records.filter((r) => r.patientId === pat.id);
                const hospitalList = Array.from(new Set(patRecords.map((r) => r.hospitalName)));
                const primaryHosp = HOSPITALS.find((h) => h.id === pat.primaryHospitalId);

                return (
                  <div
                    key={pat.id}
                    className="bg-slate-50/70 border border-slate-200 rounded-2xl p-5 hover:border-teal-400 hover:bg-white transition flex flex-col justify-between shadow-xs"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-slate-900 text-base">{pat.name}</h4>
                          <span className="text-[11px] font-mono text-slate-500 block mt-0.5">
                            {pat.id} • CNIC: {pat.nationalId}
                          </span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 font-bold text-xs">
                          {pat.bloodGroup}
                        </span>
                      </div>

                      <div className="mt-4 space-y-2 text-xs">
                        <div className="flex justify-between text-slate-600">
                          <span>Base Hospital:</span>
                          <span className="text-slate-900 font-semibold">{primaryHosp?.name.split(' ')[0]}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>Cross-Hospital Encounters:</span>
                          <span className="text-teal-800 font-bold">{patRecords.length} Recorded Visits</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>Allergies:</span>
                          <span className="text-rose-700 font-semibold truncate max-w-[130px]">
                            {pat.allergies.length > 0 ? pat.allergies.join(', ') : 'None Reported'}
                          </span>
                        </div>
                      </div>

                      {hospitalList.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-200">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                            Hospitals Visited:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {hospitalList.map((hName, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] text-slate-700"
                              >
                                {hName.split(' ')[0]}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-200 flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedCardPatient(pat);
                          setAdminTab('CARDS');
                        }}
                        className="flex-1 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
                      >
                        View QR Card
                      </button>
                      <button
                        onClick={() => {
                          setAdminTab('SCANNER');
                          handleAdminQRScan(pat.qrPayload);
                        }}
                        className="flex-1 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
                      >
                        Scan File
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: HEALTH CARDS */}
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

        {/* TAB 4: AUDIT LOGS */}
        {adminTab === 'AUDIT_LOGS' && <AuditLogView logs={logs} />}

        {/* TAB 5: ARCHITECTURE */}
        {adminTab === 'ARCHITECTURE' && (
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-100 space-y-6">
            <div>
              <h2 className="text-xl font-black text-slate-800">Multi-Hospital Enterprise Architecture</h2>
              <p className="text-xs text-slate-500 mt-1">
                How QR codes securely link disparate hospital databases without exposing private patient health data
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                  1
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Decentralized Patient Identity (DID)</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  QR code mein direct raw patient medical data nahi hota. Yeh ek cryptographically signed token hota hai jo verified hospital staff ko time-bound scoped access grant karta hai.
                </p>
              </div>

              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                  2
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Customer vs Clinician Separation</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Patients self-service kiosk par sirf apna QR aur PIN scan karke apni reports dekh saktay hain. Hospital staff ko institutional 2FA credentials se full EMR timeline ka access milta hai.
                </p>
              </div>

              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                  3
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Federated FHIR & HL7 Exchange</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Shifa Hospital, Aga Khan aur Mayo Hospital ke local databases ko modify kiye baghair federated API layer se instant allergy, prescription aur diagnostic sync hota hai.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODALS */}
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

      {/* Floating Scroll Up and Down Navigator */}
      <ScrollButtons />
    </div>
  );
}

export default App;
