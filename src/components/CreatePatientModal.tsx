import { useState } from 'react';
import { UserPlus, X, HeartPulse, ShieldAlert, CheckCircle2, Phone, User } from 'lucide-react';
import type { Patient, Hospital } from '../types/ehr';

interface CreatePatientModalProps {
  currentHospital: Hospital;
  onSavePatient: (patient: Patient) => void;
  onClose: () => void;
}

const COMMON_ALLERGIES = [
  'Penicillin',
  'Sulfa Drugs',
  'Aspirin / NSAIDs',
  'Latex',
  'Cephalosporins',
  'Codeine',
  'Peanuts',
  'Iodine / Contrast Dye',
];

const COMMON_CONDITIONS = [
  'Hypertension',
  'Type-2 Diabetes',
  'Bronchial Asthma',
  'Coronary Artery Disease',
  'Chronic Kidney Disease',
  'Hepatitis B/C',
];

export const CreatePatientModal: React.FC<CreatePatientModalProps> = ({
  currentHospital,
  onSavePatient,
  onClose,
}) => {
  const [name, setName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [age, setAge] = useState<number>(35);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [bloodGroup, setBloodGroup] = useState('B Positive (B+)');
  const [phone, setPhone] = useState('+92 300 ');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('Spouse');
  const [emergencyPhone, setEmergencyPhone] = useState('+92 321 ');
  const [accessPin, setAccessPin] = useState(Math.floor(1000 + Math.random() * 9000).toString());

  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [customAllergy, setCustomAllergy] = useState('');
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [customCondition, setCustomCondition] = useState('');

  const toggleAllergy = (allergy: string) => {
    if (selectedAllergies.includes(allergy)) {
      setSelectedAllergies(selectedAllergies.filter((a) => a !== allergy));
    } else {
      setSelectedAllergies([...selectedAllergies, allergy]);
    }
  };

  const addCustomAllergy = () => {
    if (customAllergy.trim() && !selectedAllergies.includes(customAllergy.trim())) {
      setSelectedAllergies([...selectedAllergies, customAllergy.trim()]);
      setCustomAllergy('');
    }
  };

  const toggleCondition = (cond: string) => {
    if (selectedConditions.includes(cond)) {
      setSelectedConditions(selectedConditions.filter((c) => c !== cond));
    } else {
      setSelectedConditions([...selectedConditions, cond]);
    }
  };

  const addCustomCondition = () => {
    if (customCondition.trim() && !selectedConditions.includes(customCondition.trim())) {
      setSelectedConditions([...selectedConditions, customCondition.trim()]);
      setCustomCondition('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !nationalId.trim()) {
      alert('Please fill out Patient Full Name and CNIC / National ID.');
      return;
    }

    const patientId = `PAT-${Math.floor(1000 + Math.random() * 9000)}`;
    const qrPayload = `EHR:PK:${patientId}:SEC-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const newPatient: Patient = {
      id: patientId,
      nationalId,
      name,
      age: Number(age),
      gender,
      bloodGroup,
      phone,
      email,
      address,
      emergencyContact: {
        name: emergencyName || 'Next of Kin',
        relation: emergencyRelation,
        phone: emergencyPhone,
      },
      primaryHospitalId: currentHospital.id,
      allergies: selectedAllergies,
      chronicConditions: selectedConditions,
      registeredDate: new Date().toISOString().split('T')[0],
      qrPayload,
      accessPin,
    };

    onSavePatient(newPatient);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-0 sm:p-3 md:p-6 overflow-y-auto">
      <div className="bg-white rounded-none sm:rounded-3xl w-full sm:max-w-2xl md:max-w-3xl h-full sm:h-auto max-h-screen sm:max-h-[92vh] flex flex-col shadow-2xl border-0 sm:border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Sticky Header */}
        <div className="bg-gradient-to-r from-teal-700 to-teal-900 px-4 sm:px-6 py-3.5 sm:py-4 text-white flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shrink-0">
              <UserPlus className="w-5 h-5 text-teal-200" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base md:text-lg font-bold leading-tight">New Patient Enrollment & QR Card Issue</h3>
              <p className="text-[10px] sm:text-xs text-teal-100 truncate max-w-xs sm:max-w-md">
                Registering at {currentHospital.name} (National Exchange Registry)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-teal-200 hover:text-white p-2 rounded-xl bg-teal-800/60 hover:bg-teal-800 cursor-pointer transition shrink-0"
            title="Close Form"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} id="create-patient-form" className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-4 sm:space-y-5">
          {/* 1. Personal Information */}
          <div className="bg-slate-50/70 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80">
            <h4 className="text-xs font-bold text-teal-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-teal-700" />
              1. Patient Demographics
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kamran Ahmed"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-teal-700"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">CNIC / National ID *</label>
                <input
                  type="text"
                  required
                  placeholder="37405-XXXXXXX-X"
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 font-mono outline-none focus:ring-2 focus:ring-teal-700"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Age</label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-teal-700"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-2 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-teal-700 cursor-pointer"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                  <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
                  Blood Group *
                </label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 font-bold outline-none focus:ring-2 focus:ring-teal-700 cursor-pointer"
                >
                  <option value="A Positive (A+)">A Positive (A+)</option>
                  <option value="A Negative (A-)">A Negative (A-)</option>
                  <option value="B Positive (B+)">B Positive (B+)</option>
                  <option value="B Negative (B-)">B Negative (B-)</option>
                  <option value="O Positive (O+)">O Positive (O+)</option>
                  <option value="O Negative (O-)">O Negative (O-)</option>
                  <option value="AB Positive (AB+)">AB Positive (AB+)</option>
                  <option value="AB Negative (AB-)">AB Negative (AB-)</option>
                </select>
              </div>
            </div>
          </div>

          {/* 2. Contact Details */}
          <div className="bg-slate-50/70 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80">
            <h4 className="text-xs font-bold text-teal-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-teal-700" />
              2. Contact & Emergency Next of Kin
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Mobile Phone (For OTP) *</label>
                <input
                  type="text"
                  required
                  placeholder="+92 300 1234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 font-mono outline-none focus:ring-2 focus:ring-teal-700"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="patient@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-teal-700"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="font-semibold text-slate-700 block mb-1">Residential Address</label>
                <input
                  type="text"
                  placeholder="House, Street, Sector, City"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-teal-700"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Emergency Contact Person & Relation</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Contact Name"
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                    className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-teal-700"
                  />
                  <select
                    value={emergencyRelation}
                    onChange={(e) => setEmergencyRelation(e.target.value)}
                    className="w-24 sm:w-28 bg-white border border-slate-300 rounded-xl px-2 py-2 text-slate-900 text-xs"
                  >
                    <option value="Spouse">Spouse</option>
                    <option value="Parent">Parent</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Child">Child</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Emergency Contact Phone</label>
                <input
                  type="text"
                  placeholder="+92 321 7654321"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 font-mono outline-none focus:ring-2 focus:ring-teal-700"
                />
              </div>
              <div className="sm:col-span-2 p-3 bg-amber-50 rounded-xl border border-amber-200">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-amber-900 block text-xs">Patient Kiosk Self-Access PIN *</label>
                  <span className="text-[10px] text-amber-800">Used by patient to view reports</span>
                </div>
                <input
                  type="text"
                  maxLength={4}
                  value={accessPin}
                  onChange={(e) => setAccessPin(e.target.value)}
                  className="w-32 mt-1.5 bg-white border border-amber-300 rounded-xl px-3 py-1.5 text-center text-base font-mono font-bold text-amber-950 outline-none focus:ring-2 focus:ring-teal-700"
                />
              </div>
            </div>
          </div>

          {/* 3. Allergies Alert */}
          <div className="p-3.5 sm:p-4 bg-rose-50/70 border border-rose-200/80 rounded-2xl">
            <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              3. Documented Drug & Medical Allergies
            </h4>
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {COMMON_ALLERGIES.map((allergy) => {
                const isSelected = selectedAllergies.includes(allergy);
                return (
                  <button
                    key={allergy}
                    type="button"
                    onClick={() => toggleAllergy(allergy)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                      isSelected
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:border-rose-400'
                    }`}
                  >
                    {allergy} {isSelected && '✓'}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Add other specific allergy..."
                value={customAllergy}
                onChange={(e) => setCustomAllergy(e.target.value)}
                className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
              />
              <button
                type="button"
                onClick={addCustomAllergy}
                className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold cursor-pointer shrink-0"
              >
                Add
              </button>
            </div>
          </div>

          {/* 4. Chronic Conditions */}
          <div className="p-3.5 sm:p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              4. Pre-Existing Chronic Conditions
            </h4>
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {COMMON_CONDITIONS.map((cond) => {
                const isSelected = selectedConditions.includes(cond);
                return (
                  <button
                    key={cond}
                    type="button"
                    onClick={() => toggleCondition(cond)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                      isSelected
                        ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:border-teal-500'
                    }`}
                  >
                    {cond} {isSelected && '✓'}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Add other medical condition..."
                value={customCondition}
                onChange={(e) => setCustomCondition(e.target.value)}
                className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
              />
              <button
                type="button"
                onClick={addCustomCondition}
                className="px-3.5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-semibold cursor-pointer shrink-0"
              >
                Add
              </button>
            </div>
          </div>
        </form>

        {/* Sticky Footer Action Bar */}
        <div className="px-4 sm:px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 sm:flex-initial px-4 py-3 sm:py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs sm:text-sm font-bold hover:bg-white transition cursor-pointer text-center"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="create-patient-form"
            className="flex-1 sm:flex-initial px-5 sm:px-6 py-3 sm:py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-teal-700/20 transition cursor-pointer active:scale-98 text-center"
          >
            <CheckCircle2 className="w-4 h-4" />
            Generate QR & Register
          </button>
        </div>
      </div>
    </div>
  );
};
