import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  Wallet,
  CheckCircle2,
  Printer,
  RefreshCw,
  ShieldCheck,
  Calendar,
  Eye,
  TrendingUp,
  Receipt,
  X,
  Banknote,
} from 'lucide-react';
import type { Hospital, Patient, PaymentReceipt } from '../types/ehr';
import { PaymentReceiptModal } from './PaymentReceiptModal';

interface FinanceBillingViewProps {
  patients: Patient[];
  hospitals: Hospital[];
  currentHospital: Hospital;
  onOpenBookModal: () => void;
  onPatientUpdated?: (patient: Patient) => void;
}

export const FinanceBillingView: React.FC<FinanceBillingViewProps> = ({
  patients,
  hospitals,
  currentHospital,
  onOpenBookModal,
  onPatientUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'RECEIPTS' | 'ACCOUNTS'>('RECEIPTS');
  const [receipts, setReceipts] = useState<PaymentReceipt[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHospitalFilter, setSelectedHospitalFilter] = useState<string>('ALL');
  const [selectedMethodFilter, setSelectedMethodFilter] = useState<string>('ALL');

  // Modal States
  const [selectedReceiptForModal, setSelectedReceiptForModal] = useState<PaymentReceipt | null>(null);
  const [isDirectBillingOpen, setIsDirectBillingOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);

  // Direct Billing Form State
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || '');
  const [directBillingName, setDirectBillingName] = useState(patients[0]?.name || '');
  const [directBillingCnic, setDirectBillingCnic] = useState(patients[0]?.nationalId || '');
  const [directBillingPhone, setDirectBillingPhone] = useState(patients[0]?.phone || '');
  const [directDepartment, setDirectDepartment] = useState('Cardiology');
  const [directService, setDirectService] = useState('Specialist Doctor Consultation');
  const [directAmount, setDirectAmount] = useState('3500');
  const [directPaymentMethod, setDirectPaymentMethod] = useState('Cash at Desk');
  const [isSubmittingBill, setIsSubmittingBill] = useState(false);

  // Deposit Form State
  const [depositPatientCnic, setDepositPatientCnic] = useState(patients[0]?.nationalId || '');
  const [depositAmount, setDepositAmount] = useState('5000');
  const [depositMethod, setDepositMethod] = useState('JazzCash');
  const [isSubmittingDeposit, setIsSubmittingDeposit] = useState(false);

  // Fetch receipts from MongoDB
  const fetchReceipts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:5001/api/receipts');
      const data = await res.json();
      if (Array.isArray(data)) {
        // Map _id to id if needed
        const formatted: PaymentReceipt[] = data.map((r: any) => ({
          ...r,
          id: r.id || r._id || `REC-${Date.now()}`,
        }));
        setReceipts(formatted);
      }
    } catch (err) {
      console.warn('Failed to fetch receipts from MongoDB:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, []);

  // Update direct billing inputs when selecting patient
  const handleSelectPatientForBilling = (patId: string) => {
    setSelectedPatientId(patId);
    const pat = patients.find((p) => p.id === patId);
    if (pat) {
      setDirectBillingName(pat.name);
      setDirectBillingCnic(pat.nationalId);
      setDirectBillingPhone(pat.phone);
    }
  };

  // Submit direct billing to MongoDB
  const handleSettleDirectBill = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingBill(true);

    const pat = patients.find((p) => p.nationalId === directBillingCnic || p.id === selectedPatientId);
    const payload = {
      patientId: pat?.id || selectedPatientId || 'PAT-AUTO',
      patientName: directBillingName.trim() || 'Walk-in Patient',
      patientCnic: directBillingCnic.trim() || 'N/A',
      patientPhone: directBillingPhone.trim() || '',
      accountNumber: pat?.accountNumber || `ACC-${Math.floor(100000 + Math.random() * 900000)}`,
      hospitalId: currentHospital.id,
      hospitalName: currentHospital.name,
      department: directDepartment,
      serviceDescription: directService,
      amount: Number(directAmount) || 2500,
      paymentMethod: directPaymentMethod,
    };

    try {
      const res = await fetch('http://127.0.0.1:5001/api/billing/settle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.receipt) {
        const newReceipt: PaymentReceipt = {
          ...data.receipt,
          id: data.receipt._id || data.receipt.id || `REC-${Date.now()}`,
        };
        setReceipts((prev) => [newReceipt, ...prev]);
        setSelectedReceiptForModal(newReceipt);
        setIsDirectBillingOpen(false);

        // Update local patient balance if matched
        if (pat && onPatientUpdated) {
          onPatientUpdated({
            ...pat,
            accountBalance: (pat.accountBalance || 0) + (Number(directAmount) || 0),
          });
        }
      }
    } catch (err) {
      console.error('Error settling direct bill:', err);
      alert('Could not connect to MongoDB backend.');
    } finally {
      setIsSubmittingBill(false);
    }
  };

  // Submit patient account deposit
  const handleDepositToAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingDeposit(true);

    try {
      const res = await fetch('http://127.0.0.1:5001/api/patients/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nationalId: depositPatientCnic,
          amount: Number(depositAmount) || 0,
          hospitalId: currentHospital.id,
          method: depositMethod,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setIsDepositModalOpen(false);
        fetchReceipts();

        const pat = patients.find((p) => p.nationalId === depositPatientCnic);
        if (pat && onPatientUpdated) {
          onPatientUpdated({
            ...pat,
            accountBalance: (pat.accountBalance || 0) + (Number(depositAmount) || 0),
          });
        }
      }
    } catch (err) {
      console.error('Error depositing to account:', err);
    } finally {
      setIsSubmittingDeposit(false);
    }
  };

  // Filter receipts
  const filteredReceipts = receipts.filter((rec) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      rec.receiptNumber.toLowerCase().includes(q) ||
      rec.patientName.toLowerCase().includes(q) ||
      rec.patientCnic.toLowerCase().includes(q) ||
      rec.transactionId?.toLowerCase().includes(q) ||
      rec.department?.toLowerCase().includes(q) ||
      rec.doctorName?.toLowerCase().includes(q);

    const matchesHospital = selectedHospitalFilter === 'ALL' || rec.hospitalId === selectedHospitalFilter;
    const matchesMethod = selectedMethodFilter === 'ALL' || rec.paymentMethod?.toLowerCase().includes(selectedMethodFilter.toLowerCase());

    return matchesSearch && matchesHospital && matchesMethod;
  });

  // Calculate KPIs
  const totalRevenue = receipts.reduce((sum, r) => sum + (Number(r.totalAmount) || 0), 0);
  const todayStr = new Date().toISOString().split('T')[0];
  const todayReceipts = receipts.filter((r) => r.appointmentDate === todayStr || r.issuedAt?.includes(todayStr));
  const todayRevenue = todayReceipts.reduce((sum, r) => sum + (Number(r.totalAmount) || 0), 0);
  const totalAccountBalances = patients.reduce((sum, p) => sum + (p.accountBalance || 0), 0);

  return (
    <div className="space-y-6 w-full animate-in fade-in">
      {/* Top Header Strip */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xl shadow-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-2xl bg-orange-50 text-orange-600 border border-orange-200/60 shadow-xs">
              <CreditCard className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-800 tracking-tight">Finance, Billing & Accounts</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  MongoDB Atlas Live
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Multi-hospital unified billing ledger, QR-verifiable tax invoices, and patient deposit accounts
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          <button
            onClick={fetchReceipts}
            disabled={isLoading}
            className="flex-1 sm:flex-none px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
            title="Refresh from MongoDB"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-teal-700' : ''}`} />
            <span>{isLoading ? 'Syncing...' : 'Sync MongoDB'}</span>
          </button>

          <button
            onClick={() => setIsDepositModalOpen(true)}
            className="flex-1 sm:flex-none px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Wallet className="w-3.5 h-3.5 text-emerald-700" />
            <span>+ Deposit</span>
          </button>

          <button
            onClick={() => setIsDirectBillingOpen(true)}
            className="flex-1 sm:flex-none px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-teal-400" />
            <span>+ Settle Bill</span>
          </button>

          <button
            onClick={onOpenBookModal}
            className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-orange-500 to-[#f37335] hover:from-orange-600 hover:to-[#e06324] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/20 transition cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span>+ Book Voucher</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Card 1: Total Revenue */}
        <div className="p-4 sm:p-5 bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
              Total Network Revenue
            </span>
            <span className="p-1.5 rounded-xl bg-emerald-50 text-emerald-700">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-2 font-mono">
            PKR {totalRevenue.toLocaleString()}
          </p>
          <span className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            {receipts.length} Settled Invoices
          </span>
        </div>

        {/* Card 2: Today's Revenue */}
        <div className="p-4 sm:p-5 bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
              Today's Collections
            </span>
            <span className="p-1.5 rounded-xl bg-orange-50 text-orange-600">
              <Banknote className="w-4 h-4" />
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-orange-600 mt-2 font-mono">
            PKR {todayRevenue.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {todayReceipts.length} Transactions Today
          </span>
        </div>

        {/* Card 3: Active Patient Accounts */}
        <div className="p-4 sm:p-5 bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
              Patient Account Ledgers
            </span>
            <span className="p-1.5 rounded-xl bg-teal-50 text-teal-700">
              <Wallet className="w-4 h-4" />
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-teal-800 mt-2 font-mono">
            {patients.length} Ledgers
          </p>
          <span className="text-[11px] text-teal-700 font-semibold mt-1 block">
            Balance Held: PKR {totalAccountBalances.toLocaleString()}
          </span>
        </div>

        {/* Card 4: Current Facility Station */}
        <div className="p-4 sm:p-5 bg-gradient-to-br from-slate-900 to-[#0f3b60] text-white rounded-2xl sm:rounded-3xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-teal-300 uppercase font-bold tracking-wider">
              Active Facility Station
            </span>
            <span className="px-2 py-0.5 rounded-full bg-teal-400/20 text-teal-200 text-[10px] font-mono font-bold">
              {currentHospital.badge}
            </span>
          </div>
          <p className="text-sm font-black text-white mt-2 truncate">
            {currentHospital.name}
          </p>
          <span className="text-[11px] text-slate-300 mt-1 block">
            Node: {currentHospital.city} • PMDC Certified
          </span>
        </div>
      </div>

      {/* Tabs & Filter Control Strip */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          {/* Main Tab Switcher */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 p-1 bg-slate-100 rounded-2xl w-full sm:w-fit">
            <button
              onClick={() => setActiveTab('RECEIPTS')}
              className={`flex-1 sm:flex-none px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === 'RECEIPTS'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Receipt className="w-3.5 h-3.5 text-orange-600" />
              <span>Paid Invoices ({receipts.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('ACCOUNTS')}
              className={`flex-1 sm:flex-none px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === 'ACCOUNTS'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Wallet className="w-3.5 h-3.5 text-teal-700" />
              <span>Patient Accounts ({patients.length})</span>
            </button>
          </div>

          {/* Quick Print/Export Action */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Export Ledger</span>
            </button>
          </div>
        </div>

        {/* Filter Inputs (For Receipts Tab) */}
        {activeTab === 'RECEIPTS' && (
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="sm:col-span-6 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Receipt #, Patient Name, CNIC, or Transaction ID..."
                className="w-full bg-slate-50 pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-700/20"
              />
            </div>

            {/* Hospital Filter */}
            <div className="sm:col-span-3">
              <select
                value={selectedHospitalFilter}
                onChange={(e) => setSelectedHospitalFilter(e.target.value)}
                className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none"
              >
                <option value="ALL">All Hospital Nodes</option>
                {hospitals.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Method Filter */}
            <div className="sm:col-span-3">
              <select
                value={selectedMethodFilter}
                onChange={(e) => setSelectedMethodFilter(e.target.value)}
                className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none"
              >
                <option value="ALL">All Payment Methods</option>
                <option value="Cash">Cash at Counter</option>
                <option value="JazzCash">JazzCash</option>
                <option value="EasyPaisa">EasyPaisa</option>
                <option value="Bank">Bank Transfer / 1Link</option>
                <option value="Card">Visa / Debit Card</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* ================= VIEW A: RECEIPTS & INVOICES LEDGER ================= */}
      {activeTab === 'RECEIPTS' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th className="p-4">Receipt # & QR</th>
                  <th className="p-4">Patient Demographics</th>
                  <th className="p-4">Department / Service</th>
                  <th className="p-4">Facility Station</th>
                  <th className="p-4">Amount Paid</th>
                  <th className="p-4">Method & Status</th>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReceipts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      No matching financial invoices or receipts found in MongoDB.
                    </td>
                  </tr>
                ) : (
                  filteredReceipts.map((rec) => {
                    const hosp = hospitals.find((h) => h.id === rec.hospitalId);

                    return (
                      <tr key={rec.id} className="hover:bg-slate-50/70 transition">
                        {/* Receipt # */}
                        <td className="p-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600 shrink-0">
                              <Receipt className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="font-mono font-bold text-slate-900 block">
                                {rec.receiptNumber}
                              </span>
                              {rec.tokenNumber && (
                                <span className="text-[10px] font-mono text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200 inline-block mt-0.5">
                                  Token: {rec.tokenNumber}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Patient Demographics */}
                        <td className="p-4">
                          <span className="font-bold text-slate-900 block leading-tight">
                            {rec.patientName}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono block">
                            CNIC: {rec.patientCnic}
                          </span>
                          {rec.accountNumber && (
                            <span className="text-[10px] text-slate-500 font-mono block">
                              Acc: {rec.accountNumber}
                            </span>
                          )}
                        </td>

                        {/* Department / Doctor */}
                        <td className="p-4">
                          <span className="font-bold text-slate-800 block text-xs">
                            {rec.department || 'Clinical Care'}
                          </span>
                          <span className="text-[11px] text-slate-500 block truncate max-w-[180px]">
                            {rec.doctorName}
                          </span>
                        </td>

                        {/* Hospital Facility */}
                        <td className="p-4 whitespace-nowrap">
                          <span className="font-bold text-slate-800 text-xs block truncate max-w-[160px]">
                            {hosp?.name || rec.hospitalName}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 inline-block mt-0.5">
                            {hosp?.badge || rec.hospitalId}
                          </span>
                        </td>

                        {/* Amount */}
                        <td className="p-4 whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono font-black text-xs inline-block">
                            PKR {(rec.totalAmount || 0).toLocaleString()}
                          </span>
                        </td>

                        {/* Payment Method & Status */}
                        <td className="p-4 whitespace-nowrap">
                          <span className="font-semibold text-slate-800 block text-xs">
                            {rec.paymentMethod || 'Cash at Desk'}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 mt-0.5">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            PAID (Verified)
                          </span>
                        </td>

                        {/* Date */}
                        <td className="p-4 whitespace-nowrap font-mono text-[11px] text-slate-500">
                          <div>{rec.appointmentDate || rec.issuedAt?.split(',')[0]}</div>
                          <div className="text-[10px] text-slate-400">{rec.appointmentTime || 'Completed'}</div>
                        </td>

                        {/* Actions */}
                        <td className="p-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => setSelectedReceiptForModal(rec)}
                            className="px-3 py-1.5 bg-gradient-to-r from-orange-500 to-[#f37335] hover:from-orange-600 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 ml-auto cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Receipt</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= VIEW B: PATIENT ACCOUNTS LEDGER ================= */}
      {activeTab === 'ACCOUNTS' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th className="p-4">Account Number</th>
                  <th className="p-4">Patient Name & ID</th>
                  <th className="p-4">CNIC / Phone</th>
                  <th className="p-4">Primary Hospital Node</th>
                  <th className="p-4">Current Balance (PKR)</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {patients.map((pat) => {
                  const hosp = hospitals.find((h) => h.id === pat.primaryHospitalId);
                  return (
                    <tr key={pat.id} className="hover:bg-slate-50/70 transition">
                      <td className="p-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 inline-block">
                          {pat.accountNumber || `ACC-${Math.floor(100000 + Math.random() * 900000)}`}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-slate-900 block leading-tight">{pat.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{pat.id}</span>
                      </td>
                      <td className="p-4 font-mono text-slate-700">
                        <div>{pat.nationalId}</div>
                        <div className="text-[11px] text-slate-400">{pat.phone}</div>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <span className="font-bold text-slate-800 text-xs block">
                          {hosp?.name || pat.primaryHospitalId}
                        </span>
                        <span className="text-[10px] font-mono text-teal-700 font-bold">
                          {hosp?.city || 'Pakistan'} Node
                        </span>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <span className="px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono font-black text-sm inline-block">
                          PKR {(pat.accountBalance || 0).toLocaleString()}
                        </span>
                      </td>
                      <td className="p-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => {
                            setDepositPatientCnic(pat.nationalId);
                            setIsDepositModalOpen(true);
                          }}
                          className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 ml-auto cursor-pointer"
                        >
                          <Wallet className="w-3.5 h-3.5" />
                          <span>+ Add Funds</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= MODAL 1: VIEW OFFICIAL RECEIPT WITH QR ================= */}
      {selectedReceiptForModal && (
        <PaymentReceiptModal
          receipt={selectedReceiptForModal}
          hospital={hospitals.find((h) => h.id === selectedReceiptForModal.hospitalId) || currentHospital}
          onClose={() => setSelectedReceiptForModal(null)}
        />
      )}

      {/* ================= MODAL 2: DIRECT BILLING SETTLEMENT ================= */}
      {isDirectBillingOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-slate-900 to-[#0f3b60] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-teal-300">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base leading-tight">Direct Clinical Billing Settlement</h3>
                  <p className="text-xs text-teal-200">
                    Station: {currentHospital.name} ({currentHospital.badge})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDirectBillingOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSettleDirectBill} className="p-6 space-y-4 text-xs text-slate-700">
              {/* Select Existing Patient or Type Walk-in */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Select Registered Patient:
                </label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => handleSelectPatientForBilling(e.target.value)}
                  className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 font-medium outline-none focus:border-teal-600"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.nationalId}) - {p.id}
                    </option>
                  ))}
                </select>
              </div>

              {/* Patient Name & CNIC row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Patient Name</label>
                  <input
                    type="text"
                    value={directBillingName}
                    onChange={(e) => setDirectBillingName(e.target.value)}
                    required
                    className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">CNIC / ID</label>
                  <input
                    type="text"
                    value={directBillingCnic}
                    onChange={(e) => setDirectBillingCnic(e.target.value)}
                    required
                    className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs font-mono font-medium outline-none"
                  />
                </div>
              </div>

              {/* Department & Service */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Department</label>
                  <select
                    value={directDepartment}
                    onChange={(e) => setDirectDepartment(e.target.value)}
                    className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs outline-none"
                  >
                    <option value="Cardiology">Cardiology</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Neurology">Neurology</option>
                    <option value="General Medicine">General Medicine</option>
                    <option value="Radiology">Radiology & Imaging</option>
                    <option value="Pathology">Pathology & Lab</option>
                    <option value="Pharmacy">Pharmacy Dispensation</option>
                    <option value="Emergency">Emergency Care</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Service / Bill Item</label>
                  <select
                    value={directService}
                    onChange={(e) => {
                      setDirectService(e.target.value);
                      if (e.target.value.includes('Consultation')) setDirectAmount('3500');
                      else if (e.target.value.includes('MRI')) setDirectAmount('15000');
                      else if (e.target.value.includes('CBC')) setDirectAmount('1800');
                      else if (e.target.value.includes('Pharmacy')) setDirectAmount('4200');
                      else if (e.target.value.includes('Inpatient')) setDirectAmount('6000');
                    }}
                    className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs outline-none"
                  >
                    <option value="Specialist Doctor Consultation">Specialist Consultation (PKR 3,500)</option>
                    <option value="CBC & Blood Chemistry">CBC & Blood Chemistry (PKR 1,800)</option>
                    <option value="MRI Brain Scan with Contrast">MRI Brain Scan (PKR 15,000)</option>
                    <option value="Pharmacy Prescription Refill">Pharmacy Medications (PKR 4,200)</option>
                    <option value="Inpatient Bed Admission / Day">Inpatient Bed Charge (PKR 6,000)</option>
                  </select>
                </div>
              </div>

              {/* Amount & Payment Method */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Amount (PKR)</label>
                  <input
                    type="number"
                    value={directAmount}
                    onChange={(e) => setDirectAmount(e.target.value)}
                    required
                    min={100}
                    className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold text-emerald-800 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Payment Method</label>
                  <select
                    value={directPaymentMethod}
                    onChange={(e) => setDirectPaymentMethod(e.target.value)}
                    className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs outline-none"
                  >
                    <option value="Cash at Desk">Cash at Desk</option>
                    <option value="JazzCash">JazzCash</option>
                    <option value="EasyPaisa">EasyPaisa</option>
                    <option value="Bank Transfer (1Link)">Bank Transfer (1Link/Raast)</option>
                    <option value="Visa / Debit Card">Visa / Debit Card</option>
                  </select>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingBill}
                  className="w-full py-3 bg-gradient-to-r from-orange-500 to-[#f37335] hover:from-orange-600 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>
                    {isSubmittingBill
                      ? 'Processing in MongoDB...'
                      : `Settle Bill (PKR ${Number(directAmount).toLocaleString()}) & Issue QR Receipt`}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: TOP UP PATIENT DEPOSIT ================= */}
      {isDepositModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col animate-in zoom-in-95">
            <div className="p-5 bg-gradient-to-r from-teal-800 to-teal-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Add Funds to Hospital Account</h3>
                  <p className="text-[11px] text-teal-200">Pre-fund patient medical ledger</p>
                </div>
              </div>
              <button
                onClick={() => setIsDepositModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleDepositToAccount} className="p-5 space-y-4 text-xs text-slate-700">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Select Patient:</label>
                <select
                  value={depositPatientCnic}
                  onChange={(e) => setDepositPatientCnic(e.target.value)}
                  className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs outline-none"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.nationalId}>
                      {p.name} - CNIC: {p.nationalId} (Balance: PKR {(p.accountBalance || 0).toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Deposit Amount (PKR)</label>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    required
                    min={500}
                    className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold text-teal-800 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Funding Method</label>
                  <select
                    value={depositMethod}
                    onChange={(e) => setDepositMethod(e.target.value)}
                    className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs outline-none"
                  >
                    <option value="Cash Deposit">Cash Deposit at Cashier</option>
                    <option value="JazzCash">JazzCash</option>
                    <option value="EasyPaisa">EasyPaisa</option>
                    <option value="Bank Transfer (1Link/Raast)">Bank Transfer (1Link/Raast)</option>
                    <option value="Debit Card">Debit / ATM Card</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmittingDeposit}
                className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Wallet className="w-4 h-4" />
                <span>
                  {isSubmittingDeposit
                    ? 'Updating MongoDB Ledger...'
                    : `Deposit PKR ${Number(depositAmount).toLocaleString()} into Account`}
                </span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
