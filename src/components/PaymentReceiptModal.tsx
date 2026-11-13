import React from 'react';
import {
  X,
  Printer,
  Download,
  Building2,
  Calendar,
  Clock,
  User,
  ShieldCheck,
  CreditCard,
  Phone,
  Cross,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import type { PaymentReceipt, Hospital } from '../types/ehr';

interface PaymentReceiptModalProps {
  receipt: PaymentReceipt;
  hospital?: Hospital;
  onClose: () => void;
}

export const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({
  receipt,
  hospital,
  onClose,
}) => {
  const handlePrintOrPdf = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[96vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden print:border-none print:shadow-none print:max-h-none print:rounded-none">
        {/* Modal Top Bar (Hidden in Print) */}
        <div className="bg-slate-900 text-white px-5 sm:px-6 py-3.5 flex items-center justify-between print:hidden shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Official Hospital Payment & Appointment Receipt
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintOrPdf}
              className="px-3 py-1.5 bg-gradient-to-r from-orange-500 to-[#f37335] hover:from-orange-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF / Print</span>
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Receipt Body (Target for Print/PDF) */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 print:p-6" id="printable-receipt">
          {/* 1. Header with Hospital Branding */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-6 border-b-2 border-slate-200 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-sky-600 flex items-center justify-center text-white shadow-md shrink-0">
                <Cross className="w-7 h-7 rotate-45" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black text-sky-950 tracking-tight">MED CENTER</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    PAID VERIFIED
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-800 mt-0.5">
                  {receipt.hospitalName}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {hospital?.address || 'Healthcare Interoperability Node'} • Tel: {hospital?.phone || '+1 800 852 3456'}
                </p>
              </div>
            </div>

            <div className="sm:text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                Receipt Number
              </span>
              <span className="text-base font-mono font-black text-slate-900 block">
                {receipt.receiptNumber}
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                Issued: {receipt.issuedAt}
              </span>
            </div>
          </div>

          {/* 2. Patient & Account Info Banner */}
          <div className="bg-sky-50/70 border border-sky-200/80 rounded-2xl p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 block mb-1">
                Patient Demographics
              </span>
              <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-sky-700" />
                {receipt.patientName}
              </p>
              <p className="text-[11px] text-slate-600 mt-0.5 font-mono">
                CNIC / ID: {receipt.patientCnic}
              </p>
              <p className="text-[11px] text-slate-600 flex items-center gap-1 mt-0.5">
                <Phone className="w-3 h-3 text-slate-400" />
                {receipt.patientPhone}
              </p>
            </div>

            <div className="sm:border-l sm:border-sky-200 sm:pl-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 block mb-1">
                Patient Hospital Account
              </span>
              <div className="bg-white px-3 py-1.5 rounded-xl border border-sky-200 inline-block font-mono font-black text-sky-950 text-sm shadow-xs">
                {receipt.accountNumber}
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Universal Medical Account ID for wallet deposits & billing history
              </p>
            </div>
          </div>

          {/* 3. Appointment & Doctor Details */}
          <div className="border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Appointment & Consultation Details
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Appointment No:</span>
                <span className="font-mono font-bold text-slate-900 text-xs sm:text-sm">
                  {receipt.appointmentNumber}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Consultant Doctor:</span>
                <span className="font-bold text-slate-900">{receipt.doctorName}</span>
                <span className="text-[10px] text-sky-700 block">{receipt.doctorSpecialty}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Department:</span>
                <span className="font-bold text-slate-800">{receipt.department}</span>
                <span className="text-[10px] text-slate-500 block">Room / Counter confirmed</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Date & Schedule:</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3 h-3 text-orange-500" />
                  {receipt.appointmentDate}
                </span>
                <span className="font-bold text-orange-600 text-[11px] flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3" />
                  {receipt.appointmentTime}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Hospital Node:</span>
                <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                  <Building2 className="w-3 h-3 text-slate-400" />
                  {receipt.hospitalName}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Payment Method:</span>
                <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                  <CreditCard className="w-3 h-3 text-emerald-600" />
                  {receipt.paymentMethod}
                </span>
              </div>
            </div>
          </div>

          {/* 4. Financial Breakdown Table & QR Code */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center pt-2">
            {/* Table */}
            <div className="sm:col-span-8">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 text-[10px] uppercase">
                    <th className="text-left pb-2">Description</th>
                    <th className="text-right pb-2">Amount (PKR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr>
                    <td className="py-2 font-medium">Doctor Specialist Consultation Fee</td>
                    <td className="py-2 text-right font-mono font-bold">
                      PKR {receipt.consultationFee.toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2">Universal Health Card & Records Processing</td>
                    <td className="py-2 text-right font-mono text-emerald-600 font-bold">
                      FREE (PKR 0)
                    </td>
                  </tr>
                  <tr className="border-t-2 border-slate-300 font-black text-slate-900 text-sm">
                    <td className="pt-2">Total Amount Paid:</td>
                    <td className="pt-2 text-right font-mono text-emerald-700">
                      PKR {receipt.totalAmount.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="mt-3 p-2 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
                <span>Transaction Ref: <span className="font-mono font-bold">{receipt.transactionId}</span></span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Mongoose DB Recorded
                </span>
              </div>
            </div>

            {/* QR Code Validation */}
            <div className="sm:col-span-4 flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
              <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-xs mb-2">
                <QRCodeSVG value={receipt.qrPayload} size={110} level="M" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Official Validation QR
              </span>
              <span className="text-[9px] text-slate-400 mt-0.5">
                Scan at hospital cashier or triage counter
              </span>
            </div>
          </div>

          {/* 5. Legal / Hospital Footer */}
          <div className="pt-6 border-t border-slate-200 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-400 gap-2">
            <span>Computer generated official electronic health receipt. No physical signature required.</span>
            <span>HL7 FHIR & Encrypted QR Medical Exchange</span>
          </div>
        </div>

        {/* Modal Bottom Actions (Hidden in Print) */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 print:hidden shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintOrPdf}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Receipt
            </button>
            <button
              onClick={handlePrintOrPdf}
              className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-[#f37335] hover:from-orange-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-orange-500/25"
            >
              <Download className="w-3.5 h-3.5" />
              Save / Export as PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
