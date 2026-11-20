import { useState } from 'react';
import { X, Plus, Trash2, FileText, CheckCircle2, AlertTriangle, PackageCheck } from 'lucide-react';
import type { Patient, Hospital, MedicalRecord, Medication, PharmacyItem } from '../types/ehr';

interface AddRecordModalProps {
  patient: Patient;
  hospital: Hospital;
  pharmacyItems?: PharmacyItem[];
  onSaveRecord: (record: MedicalRecord) => void;
  onClose: () => void;
}

export const AddRecordModal: React.FC<AddRecordModalProps> = ({
  patient,
  hospital,
  pharmacyItems = [],
  onSaveRecord,
  onClose,
}) => {
  const [doctorName, setDoctorName] = useState('Dr. Hamza Siddiqui');
  const [doctorSpecialty, setDoctorSpecialty] = useState('Consultant Physician');
  const [recordType, setRecordType] = useState<MedicalRecord['type']>('OPD Consultation');
  const [diagnosis, setDiagnosis] = useState('');
  const [symptomsInput, setSymptomsInput] = useState('');
  const [bp, setBp] = useState('125/82 mmHg');
  const [hr, setHr] = useState('74 bpm');
  const [temp, setTemp] = useState('98.6 °F');
  const [spo2, setSpo2] = useState('99%');
  const [doctorNotes, setDoctorNotes] = useState('');

  const [medications, setMedications] = useState<Medication[]>([
    { name: '', dosage: '', frequency: '', duration: '' },
  ]);

  const addMedRow = () => {
    setMedications([...medications, { name: '', dosage: '', frequency: '', duration: '' }]);
  };

  const removeMedRow = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const updateMed = (index: number, field: keyof Medication, val: string) => {
    const updated = [...medications];
    updated[index][field] = val;
    setMedications(updated);
  };

  const checkPharmacyStock = (medName: string) => {
    if (!medName || !medName.trim() || !pharmacyItems || pharmacyItems.length === 0) return null;
    const term = medName.toLowerCase().trim();
    const found = pharmacyItems.find((p) => {
      const pName = p.name.toLowerCase();
      return pName.includes(term) || term.includes(pName.split(' ')[0]) || pName.split(' ')[0] === term.split(' ')[0];
    });
    if (!found) {
      return { found: false, inStock: false, name: medName };
    }
    return { found: true, inStock: found.stock > 0, stock: found.stock, unit: found.unit, name: found.name };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!diagnosis.trim()) {
      alert('Please enter a clinical diagnosis.');
      return;
    }

    const filteredMeds = medications.filter((m) => m.name.trim() !== '');

    const newRecord: MedicalRecord = {
      id: `REC-${Date.now().toString().slice(-4)}`,
      patientId: patient.id,
      hospitalId: hospital.id,
      hospitalName: hospital.name,
      doctorName,
      doctorSpecialty,
      date: new Date().toISOString().split('T')[0],
      type: recordType,
      diagnosis,
      symptoms: symptomsInput ? symptomsInput.split(',').map((s) => s.trim()) : ['Clinical examination'],
      vitals: {
        bloodPressure: bp,
        heartRate: hr,
        temperature: temp,
        spO2: spo2,
      },
      medications: filteredMeds,
      doctorNotes,
    };

    onSaveRecord(newRecord);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-hidden">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Sticky Header */}
        <div className="bg-gradient-to-r from-teal-700 to-teal-900 px-4 sm:px-6 py-4 text-white flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-teal-200 shrink-0 border border-white/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold leading-tight">Add Clinical Encounter & Prescription</h3>
              <p className="text-[11px] sm:text-xs text-teal-100 truncate max-w-xs sm:max-w-md">
                For {patient.name} ({patient.id}) • Syncs to All Connected Hospitals
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-teal-200 hover:text-white p-1.5 rounded-xl bg-teal-800/60 hover:bg-teal-800 cursor-pointer transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} id="add-record-form" className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Current Facility</label>
              <input
                type="text"
                disabled
                value={hospital.name}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 font-bold"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Encounter Type</label>
              <select
                value={recordType}
                onChange={(e) => setRecordType(e.target.value as any)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-teal-700 cursor-pointer"
              >
                <option value="OPD Consultation">OPD Consultation</option>
                <option value="Emergency">Emergency</option>
                <option value="Lab Report">Lab Report</option>
                <option value="Surgery / Procedure">Surgery / Procedure</option>
                <option value="Discharge Summary">Discharge Summary</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Attending Clinician *</label>
              <input
                type="text"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                required
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-teal-700"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Clinical Specialty *</label>
              <input
                type="text"
                value={doctorSpecialty}
                onChange={(e) => setDoctorSpecialty(e.target.value)}
                required
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-teal-700"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Clinical Diagnosis *</label>
            <input
              type="text"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="e.g. Acute Bronchitis, Type-2 Diabetes quarterly review"
              required
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-teal-700"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Symptoms (comma separated)</label>
            <input
              type="text"
              value={symptomsInput}
              onChange={(e) => setSymptomsInput(e.target.value)}
              placeholder="e.g. Mild headache, chest tightness, sore throat"
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-teal-700"
            />
          </div>

          {/* Vitals */}
          <div className="bg-slate-50/70 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-2">
              Patient Vitals
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <label className="text-[10px] text-slate-500 block">BP</label>
                <input
                  type="text"
                  value={bp}
                  onChange={(e) => setBp(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-slate-900 font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block">Pulse</label>
                <input
                  type="text"
                  value={hr}
                  onChange={(e) => setHr(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-slate-900 font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block">Temp</label>
                <input
                  type="text"
                  value={temp}
                  onChange={(e) => setTemp(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-slate-900 font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block">SpO2</label>
                <input
                  type="text"
                  value={spo2}
                  onChange={(e) => setSpo2(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-slate-900 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Prescriptions */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-slate-700">Prescribed Medications</label>
              <button
                type="button"
                onClick={addMedRow}
                className="text-xs text-teal-700 hover:text-teal-800 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Medication
              </button>
            </div>
            <div className="space-y-2.5">
              {medications.map((med, index) => {
                const stockInfo = checkPharmacyStock(med.name);
                return (
                  <div key={index} className="flex flex-col gap-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <input
                        type="text"
                        placeholder="Medicine Name (e.g. Augmentin 625mg, Paracetamol)"
                        value={med.name}
                        onChange={(e) => updateMed(index, 'name', e.target.value)}
                        className="flex-2 bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium"
                      />
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          placeholder="Dosage (500mg)"
                          value={med.dosage}
                          onChange={(e) => updateMed(index, 'dosage', e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-2 text-slate-900"
                        />
                        <input
                          type="text"
                          placeholder="Freq (TDS)"
                          value={med.frequency}
                          onChange={(e) => updateMed(index, 'frequency', e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-2 text-slate-900"
                        />
                        {medications.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeMedRow(index)}
                            className="text-rose-500 hover:text-rose-700 p-2 cursor-pointer shrink-0"
                            title="Remove Medication"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Real-time Pharmacy Stock Check Badge */}
                    {med.name.trim().length > 1 && stockInfo && (
                      <div className="flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-lg transition-all">
                        {stockInfo.inStock ? (
                          <div className="text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-md flex items-center gap-1.5 w-full">
                            <PackageCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>
                              <b>In Pharmacy Stock:</b> {stockInfo.stock} {stockInfo.unit} available ({stockInfo.name})
                            </span>
                          </div>
                        ) : (
                          <div className="text-rose-800 bg-rose-50 border border-rose-300 px-2.5 py-1 rounded-md flex items-center gap-1.5 w-full animate-pulse">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                            <span>
                              <b>⚠️ Pharmacy Stockout:</b> "{med.name}" is {stockInfo.found ? '0 in stock' : 'not listed in pharmacy'}! An urgent replenishment notification will be sent to pharmacy staff upon saving.
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Doctor's Clinical Notes</label>
            <textarea
              rows={2}
              value={doctorNotes}
              onChange={(e) => setDoctorNotes(e.target.value)}
              placeholder="Clinical recommendations, lifestyle advice, next follow-up..."
              className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-900 outline-none focus:ring-2 focus:ring-teal-700"
            />
          </div>
        </form>

        {/* Sticky Footer */}
        <div className="px-4 sm:px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="add-record-form"
            className="px-5 sm:px-6 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-teal-700/20 cursor-pointer active:scale-98"
          >
            <CheckCircle2 className="w-4 h-4" />
            Save & Sync Record
          </button>
        </div>
      </div>
    </div>
  );
};
