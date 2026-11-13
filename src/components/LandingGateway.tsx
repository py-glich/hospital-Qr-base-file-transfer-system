import React, { useState } from 'react';
import {
  Lock,
  Building2,
  Key,
  QrCode,
  AlertCircle,
  ArrowRight,
  UserCheck,
  Clock,
  Phone,
  Cross,
  Star,
  ShieldCheck,
  Stethoscope,
  Activity,
  Calendar,
  HeartPulse,
  Brain,
  Baby,
  CheckCircle2,
  Home,
  Search,
  Filter,
  ArrowLeft,
} from 'lucide-react';
import type { Hospital, StaffUser, Appointment, Doctor, Patient, DepartmentInfo } from '../types/ehr';
import { DOCTORS_CATALOG, DEPARTMENTS_LIST } from '../data/mockData';
import { MedCenterFooter } from './MedCenterFooter';
import { BookAppointmentModal } from './BookAppointmentModal';

export type LandingPage = 'HOME' | 'DEPARTMENTS' | 'DOCTORS' | 'STAFF_LOGIN' | 'BOOK_APPOINTMENT';

interface LandingGatewayProps {
  hospitals: Hospital[];
  onStaffLogin: (user: StaffUser, hospital: Hospital) => void;
  onPatientPortalEnter: () => void;
  onBookAppointment: (appointment: Appointment) => void;
  onPatientUpserted?: (patient: Patient) => void;
}

export const LandingGateway: React.FC<LandingGatewayProps> = ({
  hospitals,
  onStaffLogin,
  onPatientPortalEnter,
  onBookAppointment,
  onPatientUpserted,
}) => {
  // Navigation State between distinct pages
  const [currentPage, setCurrentPage] = useState<LandingPage>('HOME');

  // Pre-selected filters when navigating to booking
  const [bookingDoctor, setBookingDoctor] = useState<Doctor | null>(null);
  const [bookingDepartment, setBookingDepartment] = useState<string>('ALL');

  // Modal State (when booking is triggered via modal or inline)
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);

  // Staff Login Form States
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>(hospitals[0].id);
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filter states for Doctors & Departments pages
  const [deptSearchQuery, setDeptSearchQuery] = useState('');
  const [docHospitalFilter, setDocHospitalFilter] = useState<string>('ALL');
  const [docDeptFilter, setDocDeptFilter] = useState<string>('ALL');

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

  // Open booking with preselected doctor
  const handleOpenBookingDoctor = (doc: Doctor) => {
    setBookingDoctor(doc);
    setBookingDepartment(doc.department);
    setIsBookModalOpen(true);
  };

  // Open booking with preselected department
  const handleOpenBookingDepartment = (deptKey: string) => {
    setBookingDepartment(deptKey);
    const matchDoc = DOCTORS_CATALOG.find((d) => d.department === deptKey);
    setBookingDoctor(matchDoc || null);
    setIsBookModalOpen(true);
  };

  // Helper icon by department
  const getDeptIcon = (key: string) => {
    switch (key) {
      case 'Orthopedics':
        return <Activity className="w-5 h-5 text-sky-600" />;
      case 'Cardiology':
        return <HeartPulse className="w-5 h-5 text-rose-600" />;
      case 'Neurology':
        return <Brain className="w-5 h-5 text-indigo-600" />;
      case 'Pediatrics':
        return <Baby className="w-5 h-5 text-amber-600" />;
      case 'General Surgery':
        return <Stethoscope className="w-5 h-5 text-teal-600" />;
      default:
        return <Building2 className="w-5 h-5 text-sky-600" />;
    }
  };

  // Filtered Departments
  const filteredDepartments = DEPARTMENTS_LIST.filter((dept: DepartmentInfo) => {
    const q = deptSearchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      dept.name.toLowerCase().includes(q) ||
      dept.description.toLowerCase().includes(q) ||
      dept.headDoctor.toLowerCase().includes(q) ||
      dept.key.toLowerCase().includes(q)
    );
  });

  // Filtered Doctors
  const filteredDoctors = DOCTORS_CATALOG.filter((doc: Doctor) => {
    const matchHosp = docHospitalFilter === 'ALL' || doc.hospitalId === docHospitalFilter;
    const matchDept = docDeptFilter === 'ALL' || doc.department === docDeptFilter;
    return matchHosp && matchDept;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* 1. TOP NOTIFICATION STRIP - Exact Match to Med Center Design */}
      <div className="bg-[#0b2545] text-slate-300 text-[11px] sm:text-xs py-2 px-4 sm:px-8 border-b border-sky-950 flex flex-col sm:flex-row items-center justify-between gap-1.5 z-50">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span>Open hours: 08:00 AM - 08:00 PM • 24/7 Emergency Care</span>
        </div>
        <div className="flex items-center gap-4 text-slate-200 font-medium">
          <a href="tel:+18008523456" className="flex items-center gap-1.5 hover:text-sky-300 transition">
            <Phone className="w-3.5 h-3.5 text-sky-400" />
            <span>+1 800 852 3456</span>
          </a>
          <span className="text-slate-500 hidden sm:inline">|</span>
          <a href="tel:+18006359645" className="flex items-center gap-1.5 hover:text-sky-300 transition hidden sm:flex">
            <span>+1 800 635 9645</span>
          </a>
        </div>
      </div>

      {/* 2. MAIN HEADER WITH MULTI-PAGE NAVIGATION BAR */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          {/* Logo (Clicks to Home) */}
          <button
            onClick={() => setCurrentPage('HOME')}
            className="flex items-center gap-2.5 shrink-0 text-left cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-600 flex items-center justify-center text-white shadow-md shadow-sky-600/30">
              <Cross className="w-6 h-6 rotate-45" />
            </div>
            <div className="leading-tight">
              <span className="text-xl font-black text-sky-950 tracking-tight block">MED</span>
              <span className="text-xs font-bold text-sky-700 tracking-wider block -mt-1">CENTER</span>
            </div>
          </button>

          {/* Clean Functional Navigation Links between Pages */}
          <nav className="hidden md:flex items-center gap-2 lg:gap-3 text-xs sm:text-sm font-semibold">
            <button
              onClick={() => setCurrentPage('HOME')}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                currentPage === 'HOME'
                  ? 'bg-sky-50 text-sky-800 font-bold'
                  : 'text-slate-700 hover:text-sky-700 hover:bg-slate-100'
              }`}
            >
              <Home className="w-4 h-4 text-sky-600" />
              <span>Home</span>
            </button>

            <button
              onClick={() => setCurrentPage('DEPARTMENTS')}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                currentPage === 'DEPARTMENTS'
                  ? 'bg-sky-50 text-sky-800 font-bold'
                  : 'text-slate-700 hover:text-sky-700 hover:bg-slate-100'
              }`}
            >
              <Building2 className="w-4 h-4 text-sky-600" />
              <span>Departments</span>
            </button>

            <button
              onClick={() => setCurrentPage('DOCTORS')}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                currentPage === 'DOCTORS'
                  ? 'bg-sky-50 text-sky-800 font-bold'
                  : 'text-slate-700 hover:text-sky-700 hover:bg-slate-100'
              }`}
            >
              <Stethoscope className="w-4 h-4 text-sky-600" />
              <span>Doctors</span>
            </button>

            <button
              onClick={() => setCurrentPage('STAFF_LOGIN')}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                currentPage === 'STAFF_LOGIN'
                  ? 'bg-sky-50 text-sky-800 font-bold'
                  : 'text-slate-700 hover:text-sky-700 hover:bg-slate-100'
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>Staff Login</span>
            </button>

            <button
              onClick={onPatientPortalEnter}
              className="px-3 py-1.5 rounded-xl text-teal-800 hover:bg-teal-50 font-bold transition cursor-pointer flex items-center gap-1.5 border border-teal-200"
            >
              <QrCode className="w-4 h-4 text-teal-600" />
              <span>Patient Kiosk</span>
            </button>
          </nav>

          {/* Primary Action Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setBookingDoctor(null);
                setBookingDepartment('ALL');
                setIsBookModalOpen(true);
              }}
              className="px-4 sm:px-5 py-2.5 bg-gradient-to-r from-orange-500 to-[#f37335] hover:from-orange-600 hover:to-orange-700 text-white font-bold text-xs sm:text-sm rounded-full shadow-md shadow-orange-500/25 flex items-center gap-2 transition cursor-pointer active:scale-95"
            >
              <span>Make an appointment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Horizontal Sub-Navigation Bar */}
        <div className="md:hidden flex items-center gap-1 overflow-x-auto px-4 py-2 bg-slate-50 border-t border-slate-200 scrollbar-none text-xs font-semibold">
          <button
            onClick={() => setCurrentPage('HOME')}
            className={`px-3 py-1.5 rounded-lg shrink-0 ${
              currentPage === 'HOME' ? 'bg-sky-600 text-white' : 'bg-white text-slate-700 border border-slate-200'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => setCurrentPage('DEPARTMENTS')}
            className={`px-3 py-1.5 rounded-lg shrink-0 ${
              currentPage === 'DEPARTMENTS' ? 'bg-sky-600 text-white' : 'bg-white text-slate-700 border border-slate-200'
            }`}
          >
            Departments
          </button>
          <button
            onClick={() => setCurrentPage('DOCTORS')}
            className={`px-3 py-1.5 rounded-lg shrink-0 ${
              currentPage === 'DOCTORS' ? 'bg-sky-600 text-white' : 'bg-white text-slate-700 border border-slate-200'
            }`}
          >
            Doctors
          </button>
          <button
            onClick={() => setCurrentPage('STAFF_LOGIN')}
            className={`px-3 py-1.5 rounded-lg shrink-0 ${
              currentPage === 'STAFF_LOGIN' ? 'bg-sky-600 text-white' : 'bg-white text-slate-700 border border-slate-200'
            }`}
          >
            Staff Login
          </button>
          <button
            onClick={onPatientPortalEnter}
            className="px-3 py-1.5 rounded-lg shrink-0 bg-teal-700 text-white"
          >
            Patient Kiosk
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 3. DISTINCT PAGE VIEWS (NO OVERCROWDING, CLEAN & PURPOSE-BUILT)           */}
      {/* ========================================================================= */}

      {/* PAGE 1: HOME PAGE (CLEAN, WELCOMING & SPACIOUS) */}
      {currentPage === 'HOME' && (
        <main className="flex-1 animate-in fade-in duration-200">
          {/* Spacious Welcome Hero */}
          <section className="bg-gradient-to-b from-sky-50/70 via-white to-slate-50 py-12 sm:py-20 border-b border-slate-200">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
              <span className="px-3.5 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 mb-4">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
                Aga Khan • Shifa • Mayo Interoperable Health Network
              </span>

              <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto">
                Modern Hospital Management & Universal Health Records
              </h1>

              <p className="text-sm sm:text-base text-slate-600 mt-4 max-w-2xl mx-auto leading-relaxed">
                Connect directly with certified specialist doctors, book clinical appointments with instant QR passes, and securely manage your medical profile across leading facilities.
              </p>

              {/* 3 Main Clear Path Tiles */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 text-left">
                {/* Tile 1: Departments */}
                <div
                  onClick={() => setCurrentPage('DEPARTMENTS')}
                  className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-sky-300 transition cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 mb-5 group-hover:scale-105 transition">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-sky-700 transition">
                      Clinical Departments
                    </h3>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      Explore our 8 specialized medical sections including Orthopedics, Cardiology, Neurology, and Surgery.
                    </p>
                  </div>
                  <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-sky-700">
                    <span>Explore Departments</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                  </div>
                </div>

                {/* Tile 2: Doctors */}
                <div
                  onClick={() => setCurrentPage('DOCTORS')}
                  className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-sky-300 transition cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 mb-5 group-hover:scale-105 transition">
                      <Stethoscope className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-700 transition">
                      Specialist Doctors
                    </h3>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      Consult with chief physicians and surgeons. Review clinic timings, ratings, fees, and schedule visits.
                    </p>
                  </div>
                  <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-teal-700">
                    <span>View Doctors Catalog</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                  </div>
                </div>

                {/* Tile 3: Book Appointment */}
                <div
                  onClick={() => {
                    setBookingDoctor(null);
                    setBookingDepartment('ALL');
                    setIsBookModalOpen(true);
                  }}
                  className="bg-gradient-to-br from-orange-500 to-[#f37335] text-white p-7 rounded-3xl shadow-lg hover:shadow-xl transition cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white mb-5 group-hover:scale-105 transition">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Book an Appointment</h3>
                    <p className="text-xs text-orange-100 mt-2 leading-relaxed">
                      Instant database patient lookup, automated account number generation, and verified payment QR receipt.
                    </p>
                  </div>
                  <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-white">
                    <span>Book Consultation Now</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                  </div>
                </div>
              </div>

              {/* Quick Jump Bar for Staff & Patient Kiosk */}
              <div className="mt-10 p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 max-w-4xl mx-auto text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <span className="font-bold text-slate-800 block">Are you a Doctor or Hospital Staff?</span>
                    <span className="text-slate-500 text-[11px]">Access hospital queues, OPD tokens, and patient bank</span>
                  </div>
                </div>
                <button
                  onClick={() => setCurrentPage('STAFF_LOGIN')}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition cursor-pointer shrink-0"
                >
                  Staff Portal Sign In →
                </button>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* PAGE 2: DEPARTMENTS (DEDICATED FULL PAGE) */}
      {currentPage === 'DEPARTMENTS' && (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-in fade-in duration-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage('HOME')}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition cursor-pointer"
                  title="Back to Home"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Hospital Clinical Departments
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Select any medical specialty below to schedule an appointment with its consulting specialist.
              </p>
            </div>

            {/* Department Search */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={deptSearchQuery}
                onChange={(e) => setDeptSearchQuery(e.target.value)}
                placeholder="Search Orthopedics, Cardiology..."
                className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs outline-none focus:ring-2 focus:ring-sky-600 transition"
              />
            </div>
          </div>

          {/* Departments Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredDepartments.map((dept: DepartmentInfo) => (
              <div
                key={dept.key}
                className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-sky-300 hover:shadow-lg transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center shadow-xs">
                      {getDeptIcon(dept.key)}
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-mono">
                      {dept.code}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base">{dept.name}</h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">{dept.description}</p>

                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Chief Doctor:</span>
                      <span className="font-semibold text-slate-800">{dept.headDoctor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Clinic Counter:</span>
                      <span className="font-semibold text-slate-800">{dept.roomNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Open Hours:</span>
                      <span className="font-semibold text-sky-700">{dept.openHours}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenBookingDepartment(dept.key)}
                  className="mt-6 w-full py-2.5 bg-gradient-to-r from-orange-500 to-[#f37335] hover:from-orange-600 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-98"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book {dept.key} Appointment</span>
                </button>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* PAGE 3: DOCTORS (DEDICATED FULL PAGE) */}
      {currentPage === 'DOCTORS' && (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-in fade-in duration-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage('HOME')}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition cursor-pointer"
                  title="Back to Home"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Specialist Doctors Directory
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Consult with verified medical council chief physicians and surgeons across partner facilities.
              </p>
            </div>

            {/* Filter by Hospital & Department */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={docHospitalFilter}
                  onChange={(e) => setDocHospitalFilter(e.target.value)}
                  className="bg-transparent font-semibold text-slate-800 outline-none"
                >
                  <option value="ALL">All Hospitals</option>
                  {hospitals.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={docDeptFilter}
                  onChange={(e) => setDocDeptFilter(e.target.value)}
                  className="bg-transparent font-semibold text-slate-800 outline-none"
                >
                  <option value="ALL">All Departments</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="General Surgery">General Surgery</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Dermatology">Dermatology</option>
                </select>
              </div>
            </div>
          </div>

          {/* Doctors Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doc: Doctor) => (
              <div
                key={doc.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition flex flex-col justify-between"
              >
                <div>
                  {/* Photo Header */}
                  <div className="h-64 w-full bg-slate-100 relative overflow-hidden">
                    <img
                      src={doc.imageUrl}
                      alt={doc.name}
                      className="w-full h-full object-cover object-top"
                    />
                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-sky-900 shadow-xs border border-slate-100">
                      {doc.department}
                    </div>
                  </div>

                  {/* Doctor Info */}
                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{doc.name}</h3>
                      <p className="text-xs text-slate-600 mt-0.5">{doc.specialty}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-600">
                      <div className="flex items-center gap-1 text-slate-500">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{doc.availableHours}</span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-500 font-semibold justify-end">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{doc.rating} ({doc.reviewCount} reviews)</span>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Hospital Node:</span>
                        <span className="font-semibold text-slate-800">{doc.hospitalName.split(' ')[0]}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Consultation Fee:</span>
                        <span className="font-black text-slate-900 text-sm">PKR {doc.consultationFee.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-5 pb-5">
                  <button
                    type="button"
                    onClick={() => handleOpenBookingDoctor(doc)}
                    className="w-full py-3 bg-gradient-to-r from-orange-500 to-[#f37335] hover:from-orange-600 text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 transition cursor-pointer active:scale-98"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Book with {doc.name.split(' ')[1] || doc.name}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* PAGE 4: STAFF LOGIN (DEDICATED FULL PAGE - CLEAN & NON-CONFUSING) */}
      {currentPage === 'STAFF_LOGIN' && (
        <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-16 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700 shrink-0">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-slate-900">Hospital Staff Institutional Login</h1>
                  <p className="text-xs text-slate-500">
                    Sign in to access OPD Queue Tokens, Patients Data Bank & Clinical Records
                  </p>
                </div>
              </div>

              <button
                onClick={() => setCurrentPage('HOME')}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
                title="Back to Home"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-800">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* 1. Select Hospital */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-sky-700" />
                  1. Select Hospital Facility Node:
                </label>
                <select
                  value={selectedHospitalId}
                  onChange={(e) => handleHospitalChange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-3 text-xs sm:text-sm text-slate-900 font-bold outline-none focus:ring-2 focus:ring-sky-600 focus:bg-white cursor-pointer transition min-h-[46px]"
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
                <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-sky-700" />
                  2. Hospital Staff Login ID:
                </label>
                <input
                  type="text"
                  required
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  placeholder="e.g. admin@aku.edu.pk or doctor email"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-3 text-xs sm:text-sm text-slate-900 outline-none focus:ring-2 focus:ring-sky-600 focus:bg-white transition min-h-[46px]"
                />
              </div>

              {/* 3. Specific Password */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-sky-700" />
                  3. Specific Password for {currentHospital.name.split(' ')[0]}:
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter hospital-specific password"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-3 text-xs sm:text-sm text-slate-900 outline-none focus:ring-2 focus:ring-sky-600 focus:bg-white transition min-h-[46px]"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-3 py-3.5 bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-sky-700/20 flex items-center justify-center gap-2 cursor-pointer transition active:scale-98 min-h-[48px]"
              >
                <ShieldCheck className="w-4 h-4" />
                Authenticate & Access {currentHospital.badge} System
              </button>
            </form>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>National Health Interoperability Node: {currentHospital.code}</span>
              <button
                type="button"
                onClick={() => setCurrentPage('HOME')}
                className="text-sky-700 font-bold hover:underline"
              >
                ← Back to Home
              </button>
            </div>
          </div>
        </main>
      )}

      {/* 4. MED CENTER FOOTER */}
      <MedCenterFooter
        onSelectDepartment={(dept) => {
          handleOpenBookingDepartment(dept);
        }}
      />

      {/* 5. MODAL: APPOINTMENT BOOKING WITH DB CHECK & ACCOUNT NO */}
      {isBookModalOpen && (
        <BookAppointmentModal
          hospitals={hospitals}
          initialDoctor={bookingDoctor}
          initialDepartment={bookingDepartment}
          initialHospitalId={selectedHospitalId}
          onBookAppointment={(apt) => {
            onBookAppointment(apt);
          }}
          onPatientUpserted={onPatientUpserted}
          onClose={() => {
            setIsBookModalOpen(false);
            setBookingDoctor(null);
            setBookingDepartment('ALL');
          }}
        />
      )}
    </div>
  );
};
