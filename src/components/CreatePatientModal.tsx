import { useState, useEffect } from 'react';
import { UserPlus, X, ShieldAlert, Phone, User, RefreshCw } from 'lucide-react';
import type { Patient, Hospital } from '../types/ehr';

interface CreatePatientModalProps {
  currentHospital: Hospital;
  patients?: Patient[];
  hospitals?: Hospital[];
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
  patients = [],
  hospitals = [],
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
  const [accessPin] = useState(Math.floor(1000 + Math.random() * 9000).toString());

  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [customAllergy, setCustomAllergy] = useState('');
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [customCondition, setCustomCondition] = useState('');

  // Existing Patient Detection (Cross-Hospital Check)
  const [existingPatient, setExistingPatient] = useState<Patient | null>(null);

  // Check if patient exists across any hospital in data bank
  useEffect(() => {
    const cleanCnic = nationalId.replace(/\D/g, '');
    const cleanPhone = phone.replace(/\D/g, '');

    if (cleanCnic.length >= 8 || cleanPhone.length >= 10) {
      const match = patients.find((p) => {
        const pCnic = (p.nationalId || '').replace(/\D/g, '');
        const pPhone = (p.phone || '').replace(/\D/g, '');
        return (cleanCnic.length >= 8 && pCnic === cleanCnic) || (cleanPhone.length >= 10 && pPhone === cleanPhone);
      });

      if (match) {
        setExistingPatient(match);
      } else {
        setExistingPatient(null);
      }
    } else {
      setExistingPatient(null);
    }
  }, [nationalId, phone, patients]);

  const handleAutoFillExisting = () => {
    if (!existingPatient) return;
    setName(existingPatient.name);
    setAge(existingPatient.age);
    setGender(existingPatient.gender);
    setBloodGroup(existingPatient.bloodGroup);
    setPhone(existingPatient.phone);
    if (existingPatient.email) setEmail(existingPatient.email);
    if (existingPatient.address) setAddress(existingPatient.address);
    if (existingPatient.emergencyContact) {
      setEmergencyName(existingPatient.emergencyContact.name);
      setEmergencyRelation(existingPatient.emergencyContact.relation);
      setEmergencyPhone(existingPatient.emergencyContact.phone);
    }
    if (existingPatient.allergies) setSelectedAllergies(existingPatient.allergies);
    if (existingPatient.chronicConditions) setSelectedConditions(existingPatient.chronicConditions);
  };

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

    if (existingPatient) {
      // UPDATE EXISTING UNIVERSAL PROFILE (NO DUPLICATE CREATION!)
      const updatedPatient: Patient = {
        ...existingPatient,
        name,
        age: Number(age),
        gender,
        bloodGroup,
        phone,
        email: email || existingPatient.email,
        address: address || existingPatient.address,
        emergencyContact: {
          name: emergencyName || existingPatient.emergencyContact?.name || 'Next of Kin',
          relation: emergencyRelation || existingPatient.emergencyContact?.relation || 'Spouse',
          phone: emergencyPhone || existingPatient.emergencyContact?.phone || phone,
        },
        allergies: Array.from(new Set([...(existingPatient.allergies || []), ...selectedAllergies])),
        chronicConditions: Array.from(new Set([...(existingPatient.chronicConditions || []), ...selectedConditions])),
      };

      onSavePatient(updatedPatient);
      return;
    }

    // NEW PATIENT ENROLLMENT
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

  const existingOriginHosp = existingPatient
    ? hospitals.find((h) => h.id === existingPatient.primaryHospitalId)?.name || 'Network Hospital'
    : '';

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
              <h3 className="text-sm sm:text-base md:text-lg font-bold leading-tight">
                {existingPatient ? 'Update Existing Universal Patient Profile' : 'New Patient Enrollment & QR Card Issue'}
              </h3>
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

        {/* Existing Patient Detected Alert Banner */}
        {existingPatient && (
          <div className="bg-amber-50 border-b border-amber-200 p-4 px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs animate-in fade-in">
            <div className="flex items-start gap-3">
              <RefreshCw className="w-5 h-5 text-amber-700 shrink-0 mt-0.5 animate-spin-slow" />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-extrabold text-amber-950 uppercase tracking-wide">
                    Patient Already Registered in Universal Network!
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-bold text-[10px]">
                    Universal ID: {existingPatient.id}
                  </span>
                </div>
                <p className="text-amber-800 mt-0.5">
                  Originating Node: <strong>{existingOriginHosp}</strong> &bull; CNIC: <strong>{existingPatient.nationalId}</strong>. MedPulse will update this universal record instead of creating a duplicate profile.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAutoFillExisting}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs shrink-0 shadow-sm cursor-pointer transition flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Auto-Fill Records
            </button>
          </div>
        )}

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} id="create-patient-form" className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-4 sm:space-y-5">
          {/* 1. Personal Information */}
          <div className="bg-slate-50/70 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80">
            <h4 className="text-xs font-bold text-teal-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-teal-700" />
              1. Patient Demographics & Identification
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
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-700"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  National CNIC / ID (Cross-Hospital Key) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 37405-1234567-1"
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                  className={`w-full p-2.5 bg-white border rounded-xl outline-none focus:ring-2 font-mono ${
                    existingPatient ? 'border-amber-400 focus:ring-amber-500 bg-amber-50/30' : 'border-slate-200 focus:ring-teal-700'
                  }`}
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Age (Years) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={120}
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-700"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Gender *</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-700"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Blood Group *</label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-700 font-medium text-teal-900"
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

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  placeholder="+92 300 1234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-700"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-semibold text-slate-700 block mb-1">Permanent Residential Address</label>
                <input
                  type="text"
                  placeholder="e.g. House 42, Sector F-8/2, Islamabad"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-700"
                />
              </div>
            </div>
          </div>

          {/* 2. Medical Safety: Allergies & Chronic Conditions */}
          <div className="bg-slate-50/70 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 space-y-3">
            <h4 className="text-xs font-bold text-teal-900 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              2. Critical Safety Allergies & Chronic Conditions
            </h4>

            {/* Drug Allergies */}
            <div>
              <span className="font-semibold text-slate-700 text-xs block mb-1.5">
                Known Drug / Environmental Allergies:
              </span>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {COMMON_ALLERGIES.map((allergy) => {
                  const isChecked = selectedAllergies.includes(allergy);
                  return (
                    <button
                      key={allergy}
                      type="button"
                      onClick={() => toggleAllergy(allergy)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition cursor-pointer ${
                        isChecked
                          ? 'bg-rose-100 text-rose-900 border-rose-300 font-bold'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {isChecked ? '✓ ' : '+ '}
                      {allergy}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add other specific drug allergy..."
                  value={customAllergy}
                  onChange={(e) => setCustomAllergy(e.target.value)}
                  className="flex-1 p-2 bg-white border border-slate-200 rounded-xl text-xs outline-none"
                />
                <button
                  type="button"
                  onClick={addCustomAllergy}
                  className="px-3 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold hover:bg-slate-900 cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Chronic Conditions */}
            <div className="pt-2 border-t border-slate-200">
              <span className="font-semibold text-slate-700 text-xs block mb-1.5">
                Pre-Existing Chronic Conditions:
              </span>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {COMMON_CONDITIONS.map((cond) => {
                  const isChecked = selectedConditions.includes(cond);
                  return (
                    <button
                      key={cond}
                      type="button"
                      onClick={() => toggleCondition(cond)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition cursor-pointer ${
                        isChecked
                          ? 'bg-teal-100 text-teal-900 border-teal-300 font-bold'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {isChecked ? '✓ ' : '+ '}
                      {cond}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add another chronic condition..."
                  value={customCondition}
                  onChange={(e) => setCustomCondition(e.target.value)}
                  className="flex-1 p-2 bg-white border border-slate-200 rounded-xl text-xs outline-none"
                />
                <button
                  type="button"
                  onClick={addCustomCondition}
                  className="px-3 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold hover:bg-slate-900 cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* 3. Emergency Contact */}
          <div className="bg-slate-50/70 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80">
            <h4 className="text-xs font-bold text-teal-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-teal-700" />
              3. Next of Kin / Emergency Contact
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Contact Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sadia Tariq"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Relationship</label>
                <select
                  value={emergencyRelation}
                  onChange={(e) => setEmergencyRelation(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl outline-none"
                >
                  <option value="Spouse">Spouse</option>
                  <option value="Parent">Parent</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Child">Child</option>
                  <option value="Guardian">Guardian</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Emergency Phone</label>
                <input
                  type="text"
                  placeholder="+92 321 9876543"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl outline-none"
                />
              </div>
            </div>
          </div>

          {/* Modal Action Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-6 py-2.5 rounded-xl text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-2 ${
                existingPatient
                  ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
                  : 'bg-teal-700 hover:bg-teal-800 shadow-teal-700/20'
              }`}
            >
              {existingPatient ? (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Update Existing Universal Profile ({existingPatient.id})
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Enroll Patient & Issue Universal QR
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
