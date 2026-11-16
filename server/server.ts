import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, isDbConnected } from './db';
import { PatientModel } from './models/Patient';
import { TokenModel } from './models/Token';
import { MedicalRecordModel } from './models/MedicalRecord';
import { AppointmentModel } from './models/Appointment';
import { ReceiptModel } from './models/Receipt';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Initialize MongoDB and seed billing records if needed
connectDB().then(async () => {
  try {
    const count = await ReceiptModel.countDocuments();
    if (count < 4) {
      const initialSeedReceipts = [
        {
          receiptNumber: 'REC-2026-9021',
          tokenNumber: 'CARDIO-108',
          patientId: 'PAT-9021',
          patientName: 'Muhammad Tariq Khan',
          patientCnic: '37405-1234567-1',
          patientPhone: '+92 300 1234567',
          accountNumber: 'ACC-491028',
          hospitalId: 'hosp-shifa',
          hospitalName: 'Shifa International Hospital',
          doctorId: 'doc-salman',
          doctorName: 'Prof. Dr. Salman Qureshi',
          doctorSpecialty: 'Chief Consultant Cardiologist',
          department: 'Cardiology',
          appointmentNumber: 'APT-2026-881',
          appointmentDate: new Date().toISOString().split('T')[0],
          appointmentTime: '11:00 AM',
          consultationFee: 3500,
          serviceCharge: 0,
          totalAmount: 3500,
          paymentMethod: 'JazzCash',
          paymentStatus: 'PAID',
          transactionId: 'TXN-940212',
          qrPayload: 'RECEIPT:REC-2026-9021|TOKEN:CARDIO-108|PAT:Muhammad Tariq Khan|CNIC:37405-1234567-1|ACC:ACC-491028|DOC:Prof. Dr. Salman Qureshi|FEE:PKR 3500|STATUS:VERIFIED_PAID|TXN:TXN-940212',
          issuedAt: new Date().toLocaleString(),
        },
        {
          receiptNumber: 'REC-2026-7355',
          tokenNumber: 'ORTHO-244',
          patientId: 'PAT-7355',
          patientName: 'Zainab Bibi',
          patientCnic: '35202-9988776-3',
          patientPhone: '+92 321 9876543',
          accountNumber: 'ACC-712839',
          hospitalId: 'hosp-mayo',
          hospitalName: 'Mayo Hospital & KEMU',
          doctorId: 'doc-irfan',
          doctorName: 'Prof. Dr. Irfan Malik',
          doctorSpecialty: 'Consultant Orthopedic Surgeon',
          department: 'Orthopedics',
          appointmentNumber: 'APT-2026-612',
          appointmentDate: new Date().toISOString().split('T')[0],
          appointmentTime: '10:00 AM',
          consultationFee: 2500,
          serviceCharge: 0,
          totalAmount: 2500,
          paymentMethod: 'EasyPaisa',
          paymentStatus: 'PAID',
          transactionId: 'TXN-735591',
          qrPayload: 'RECEIPT:REC-2026-7355|TOKEN:ORTHO-244|PAT:Zainab Bibi|CNIC:35202-9988776-3|ACC:ACC-712839|DOC:Prof. Dr. Irfan Malik|FEE:PKR 2500|STATUS:VERIFIED_PAID|TXN:TXN-735591',
          issuedAt: new Date().toLocaleString(),
        },
        {
          receiptNumber: 'REC-2026-4180',
          tokenNumber: 'NEURO-115',
          patientId: 'PAT-4180',
          patientName: 'Dr. Fatima Zahra',
          patientCnic: '42201-8765432-8',
          patientPhone: '+92 333 8765432',
          accountNumber: 'ACC-390142',
          hospitalId: 'hosp-aku',
          hospitalName: 'Aga Khan University Hospital',
          doctorId: 'doc-asad',
          doctorName: 'Dr. Asad Mehmood',
          doctorSpecialty: 'Consultant Neurosurgeon',
          department: 'Neurology',
          appointmentNumber: 'APT-2026-440',
          appointmentDate: new Date().toISOString().split('T')[0],
          appointmentTime: '02:30 PM',
          consultationFee: 4000,
          serviceCharge: 0,
          totalAmount: 4000,
          paymentMethod: 'Bank Transfer (HBL)',
          paymentStatus: 'PAID',
          transactionId: 'TXN-418088',
          qrPayload: 'RECEIPT:REC-2026-4180|TOKEN:NEURO-115|PAT:Dr. Fatima Zahra|CNIC:42201-8765432-8|ACC:ACC-390142|DOC:Dr. Asad Mehmood|FEE:PKR 4000|STATUS:VERIFIED_PAID|TXN:TXN-418088',
          issuedAt: new Date().toLocaleString(),
        },
        {
          receiptNumber: 'REC-2026-5521',
          tokenNumber: 'RAD-092',
          patientId: 'PAT-5521',
          patientName: 'Bilal Ahmed',
          patientCnic: '37405-5544332-1',
          patientPhone: '+92 301 5544332',
          accountNumber: 'ACC-883192',
          hospitalId: 'hosp-shifa',
          hospitalName: 'Shifa International Hospital',
          doctorId: 'doc-rad',
          doctorName: 'Dr. Tariq Aziz',
          doctorSpecialty: 'Radiology & Imaging',
          department: 'Radiology',
          appointmentNumber: 'APT-2026-921',
          appointmentDate: new Date().toISOString().split('T')[0],
          appointmentTime: '03:00 PM',
          consultationFee: 15000,
          serviceCharge: 0,
          totalAmount: 15000,
          paymentMethod: 'Debit Card (Visa)',
          paymentStatus: 'PAID',
          transactionId: 'TXN-552199',
          qrPayload: 'RECEIPT:REC-2026-5521|PAT:Bilal Ahmed|CNIC:37405-5544332-1|ACC:ACC-883192|FEE:PKR 15000|SERVICE:MRI Brain Scan|STATUS:VERIFIED_PAID|TXN:TXN-552199',
          issuedAt: new Date().toLocaleString(),
        },
      ];
      await ReceiptModel.insertMany(initialSeedReceipts);
      console.log('[MongoDB] Seeded cross-hospital billing receipts successfully.');
    }
  } catch (seedErr) {
    console.warn('[MongoDB] Receipt seeding warning:', seedErr);
  }
});

// 1. System Status
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'MedPulse Hospital Management & Patient Bank API',
    database: isDbConnected() ? 'CONNECTED_MONGODB' : 'IN_MEMORY_FALLBACK',
    timestamp: new Date().toISOString(),
  });
});

// 2. Patient Data Bank Routes
app.get('/api/patients', async (req, res) => {
  try {
    if (isDbConnected()) {
      const patients = await PatientModel.find().sort({ createdAt: -1 });
      return res.json(patients);
    }
  } catch (err) {
    console.warn('MongoDB query fallback:', err);
  }
  res.json([]);
});

app.post('/api/patients', async (req, res) => {
  try {
    const patientData = req.body;
    if (isDbConnected()) {
      const created = await PatientModel.create(patientData);
      return res.status(201).json(created);
    }
    return res.status(201).json({ ...patientData, _id: Date.now().toString() });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// 2b. Check Patient by CNIC or Phone
app.get('/api/patients/check', async (req, res) => {
  const { cnic, phone } = req.query;
  try {
    if (isDbConnected()) {
      const query: any = [];
      if (cnic) query.push({ nationalId: cnic });
      if (phone) query.push({ phone });

      if (query.length > 0) {
        const found = await PatientModel.findOne({ $or: query });
        if (found) {
          return res.json({ exists: true, patient: found });
        }
      }
    }
  } catch (err) {
    console.warn('Patient check fallback:', err);
  }
  res.json({ exists: false, patient: null });
});

// 2c. Upsert Patient Profile During Appointment Booking
app.post('/api/patients/upsert-for-booking', async (req, res) => {
  const { nationalId, phone, name, age, gender, hospitalId } = req.body;
  try {
    if (isDbConnected()) {
      const existing = await PatientModel.findOne({
        $or: [{ nationalId }, { phone }],
      });

      if (existing) {
        if (name) existing.name = name;
        if (age) existing.age = age;
        if (gender) existing.gender = gender;
        if (!existing.accountNumber) {
          existing.accountNumber = `ACC-${Math.floor(100000 + Math.random() * 900000)}`;
        }
        await existing.save();
        return res.json({ isExisting: true, patient: existing });
      }

      // Create new patient profile
      const newPatientId = `PAT-${Math.floor(1000 + Math.random() * 9000)}`;
      const newAccountNo = `ACC-${Math.floor(100000 + Math.random() * 900000)}`;
      const newPin = `${Math.floor(1000 + Math.random() * 9000)}`;
      const newQrPayload = `PAT:${newPatientId}|${nationalId}|${name}`;

      const created = await PatientModel.create({
        patientId: newPatientId,
        nationalId,
        name,
        age: age || 30,
        gender: gender || 'Male',
        bloodGroup: 'B+',
        phone,
        primaryHospitalId: hospitalId || 'hosp-aku',
        accountNumber: newAccountNo,
        accountBalance: 0,
        accessPin: newPin,
        qrPayload: newQrPayload,
        allergies: [],
        chronicConditions: [],
      });

      return res.status(201).json({ isExisting: false, patient: created });
    }

    // In-memory fallback
    const mockId = `PAT-${Math.floor(1000 + Math.random() * 9000)}`;
    const mockAcc = `ACC-${Math.floor(100000 + Math.random() * 900000)}`;
    return res.status(201).json({
      isExisting: false,
      patient: {
        patientId: mockId,
        nationalId,
        name,
        phone,
        accountNumber: mockAcc,
        accountBalance: 0,
        accessPin: '1234',
        qrPayload: `PAT:${mockId}|${nationalId}|${name}`,
      },
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// 3. OPD Departmental Tokens (Orthopedics, Cardiology, Neurology, etc.)
app.get('/api/tokens', async (req, res) => {
  const { department, status, hospitalId } = req.query;
  const filter: any = {};
  if (department && department !== 'ALL') filter.department = department;
  if (status && status !== 'ALL') filter.status = status;
  if (hospitalId) filter.hospitalId = hospitalId;

  try {
    if (isDbConnected()) {
      const tokens = await TokenModel.find(filter).sort({ createdAt: -1 });
      return res.json(tokens);
    }
  } catch (err) {
    console.warn('MongoDB token query fallback:', err);
  }
  res.json([]);
});

app.post('/api/tokens', async (req, res) => {
  try {
    const tokenData = req.body;
    if (isDbConnected()) {
      const created = await TokenModel.create(tokenData);
      return res.status(201).json(created);
    }
    return res.status(201).json({ ...tokenData, _id: Date.now().toString() });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.patch('/api/tokens/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    if (isDbConnected()) {
      const updated = await TokenModel.findByIdAndUpdate(id, { status }, { new: true });
      return res.json(updated);
    }
    return res.json({ id, status });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// 4. Medical Records
app.get('/api/records', async (req, res) => {
  const { patientId } = req.query;
  const filter: any = {};
  if (patientId) filter.patientId = patientId;

  try {
    if (isDbConnected()) {
      const records = await MedicalRecordModel.find(filter).sort({ date: -1 });
      return res.json(records);
    }
  } catch (err) {
    console.warn('MongoDB record query fallback:', err);
  }
  res.json([]);
});

app.post('/api/records', async (req, res) => {
  try {
    const recordData = req.body;
    if (isDbConnected()) {
      const created = await MedicalRecordModel.create(recordData);
      return res.status(201).json(created);
    }
    return res.status(201).json({ ...recordData, _id: Date.now().toString() });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// 5. Appointments Booking (Patient Doctor Booking & Hospital Scheduling)
app.get('/api/appointments', async (req, res) => {
  const { hospitalId, doctorId, date, status } = req.query;
  const filter: any = {};
  if (hospitalId && hospitalId !== 'ALL') filter.hospitalId = hospitalId;
  if (doctorId && doctorId !== 'ALL') filter.doctorId = doctorId;
  if (date) filter.date = date;
  if (status && status !== 'ALL') filter.status = status;

  try {
    if (isDbConnected()) {
      const appointments = await AppointmentModel.find(filter).sort({ createdAt: -1 });
      return res.json(appointments);
    }
  } catch (err) {
    console.warn('MongoDB appointment query fallback:', err);
  }
  res.json([]);
});

app.post('/api/appointments', async (req, res) => {
  try {
    const appointmentData = req.body;
    if (isDbConnected()) {
      const created = await AppointmentModel.create(appointmentData);
      return res.status(201).json(created);
    }
    return res.status(201).json({ ...appointmentData, _id: Date.now().toString() });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.patch('/api/appointments/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    if (isDbConnected()) {
      const updated = await AppointmentModel.findByIdAndUpdate(id, { status }, { new: true });
      return res.json(updated);
    }
    return res.json({ id, status });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// 6. Process Payment, Add Money & Generate Official Receipt with QR
app.post('/api/payments/process', async (req, res) => {
  const {
    patientId,
    patientName,
    patientCnic,
    patientPhone,
    accountNumber,
    hospitalId,
    hospitalName,
    doctorId,
    doctorName,
    doctorSpecialty,
    department,
    appointmentNumber,
    appointmentDate,
    appointmentTime,
    consultationFee,
    paymentMethod,
    amountPaid,
    tokenNumber: customTokenNumber,
  } = req.body;

  try {
    const fee = Number(consultationFee) || 3000;
    const paid = Number(amountPaid) || fee;
    const receiptNum = `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const txnId = `TXN-${Date.now().toString().slice(-6)}`;

    // Generate OPD Token based on department
    const deptPrefixMap: Record<string, string> = {
      Orthopedics: 'ORTHO',
      Cardiology: 'CARDIO',
      Neurology: 'NEURO',
      'General Medicine': 'MED',
      Pediatrics: 'PED',
      'General Surgery': 'SURG',
      Surgery: 'SURG',
      Dermatology: 'DERM',
      Gynecology: 'GYNAE',
      Emergency: 'EMRG',
    };
    const deptCode = deptPrefixMap[department] || 'OPD';
    const finalTokenNumber = customTokenNumber || `${deptCode}-${Math.floor(100 + Math.random() * 900)}`;

    const qrPayload = `RECEIPT:${receiptNum}|TOKEN:${finalTokenNumber}|PAT:${patientName}|CNIC:${patientCnic}|ACC:${accountNumber}|DOC:${doctorName}|FEE:PKR ${paid}|STATUS:VERIFIED_PAID|TXN:${txnId}`;

    let createdToken: any = null;

    if (isDbConnected()) {
      // 1. Update patient balance
      if (patientCnic) {
        await PatientModel.findOneAndUpdate(
          { nationalId: patientCnic },
          { $inc: { accountBalance: paid } }
        );
      }

      // 2. Issue OPD Token in MongoDB
      createdToken = await TokenModel.create({
        tokenNumber: finalTokenNumber,
        department: department || 'General Medicine',
        departmentCode: deptCode,
        patientId: patientId || 'PAT-AUTO',
        patientName: patientName || 'Patient',
        patientPhone: patientPhone || '',
        assignedDoctor: doctorName || 'Attending Physician',
        roomNumber: 'OPD-102',
        status: 'WAITING',
        priority: 'NORMAL',
        issueTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        estimatedWaitMinutes: 15,
        hospitalId: hospitalId || 'hosp-shifa',
        notes: `Appointment ${appointmentNumber || ''} consultation with ${doctorName || ''}`,
      });

      // 3. Create Receipt document
      const receipt = await ReceiptModel.create({
        receiptNumber: receiptNum,
        tokenNumber: finalTokenNumber,
        patientId: patientId || 'PAT-AUTO',
        patientName,
        patientCnic,
        patientPhone,
        accountNumber: accountNumber || `ACC-${Math.floor(100000 + Math.random() * 900000)}`,
        hospitalId,
        hospitalName,
        doctorId,
        doctorName,
        doctorSpecialty,
        department,
        appointmentNumber: appointmentNumber || `APT-${Date.now().toString().slice(-4)}`,
        appointmentDate: appointmentDate || new Date().toISOString().split('T')[0],
        appointmentTime: appointmentTime || '10:00 AM',
        consultationFee: fee,
        serviceCharge: 0,
        totalAmount: paid,
        paymentMethod: paymentMethod || 'Bank Transfer',
        paymentStatus: 'PAID',
        transactionId: txnId,
        qrPayload,
        issuedAt: new Date().toLocaleString(),
      });

      // 4. Update Appointment status to CONFIRMED and link tokenNumber
      if (appointmentNumber) {
        await AppointmentModel.findOneAndUpdate(
          { appointmentNumber },
          { status: 'CONFIRMED', tokenNumber: finalTokenNumber }
        );
      }

      return res.status(201).json({ success: true, receipt, token: createdToken });
    }

    // In-memory fallback
    const fallbackToken = {
      id: `TOK-${Date.now()}`,
      tokenNumber: finalTokenNumber,
      department: department || 'General Medicine',
      departmentCode: deptCode,
      patientId: patientId || 'PAT-AUTO',
      patientName: patientName || 'Patient',
      patientPhone: patientPhone || '',
      assignedDoctor: doctorName || 'Attending Physician',
      roomNumber: 'OPD-102',
      status: 'WAITING',
      priority: 'NORMAL',
      issueTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      estimatedWaitMinutes: 15,
      hospitalId: hospitalId || 'hosp-shifa',
      notes: `Consultation with ${doctorName}`,
    };

    const fallbackReceipt = {
      receiptNumber: receiptNum,
      tokenNumber: finalTokenNumber,
      patientId: patientId || 'PAT-AUTO',
      patientName,
      patientCnic,
      patientPhone,
      accountNumber: accountNumber || `ACC-${Math.floor(100000 + Math.random() * 900000)}`,
      hospitalId,
      hospitalName,
      doctorId,
      doctorName,
      doctorSpecialty,
      department,
      appointmentNumber: appointmentNumber || `APT-${Date.now().toString().slice(-4)}`,
      appointmentDate: appointmentDate || new Date().toISOString().split('T')[0],
      appointmentTime: appointmentTime || '10:00 AM',
      consultationFee: fee,
      serviceCharge: 0,
      totalAmount: paid,
      paymentMethod: paymentMethod || 'Bank Transfer',
      paymentStatus: 'PAID',
      transactionId: txnId,
      qrPayload,
      issuedAt: new Date().toLocaleString(),
    };
    return res.status(201).json({ success: true, receipt: fallbackReceipt, token: fallbackToken });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/receipts', async (req, res) => {
  const { hospitalId, search } = req.query;
  const filter: any = {};
  if (hospitalId && hospitalId !== 'ALL') {
    filter.hospitalId = hospitalId;
  }
  if (search && typeof search === 'string') {
    const s = search.trim();
    filter.$or = [
      { receiptNumber: new RegExp(s, 'i') },
      { patientName: new RegExp(s, 'i') },
      { patientCnic: new RegExp(s, 'i') },
      { transactionId: new RegExp(s, 'i') },
      { accountNumber: new RegExp(s, 'i') },
    ];
  }

  try {
    if (isDbConnected()) {
      const receipts = await ReceiptModel.find(filter).sort({ createdAt: -1 });
      return res.json(receipts);
    }
  } catch (err) {
    console.warn('Receipt query fallback:', err);
  }
  res.json([]);
});

// 7. Direct Clinical Settlement (Pharmacy, Labs, Radiology, Diagnostics, Inpatient)
app.post('/api/billing/settle', async (req, res) => {
  const {
    patientId,
    patientName,
    patientCnic,
    patientPhone,
    accountNumber,
    hospitalId,
    hospitalName,
    department,
    serviceDescription,
    amount,
    paymentMethod,
  } = req.body;

  try {
    const total = Number(amount) || 2500;
    const receiptNum = `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const txnId = `TXN-${Date.now().toString().slice(-6)}`;
    const billNum = `BILL-${Date.now().toString().slice(-4)}`;
    const finalAccountNo = accountNumber || `ACC-${Math.floor(100000 + Math.random() * 900000)}`;
    const qrPayload = `RECEIPT:${receiptNum}|PAT:${patientName}|CNIC:${patientCnic}|ACC:${finalAccountNo}|HOSP:${hospitalName}|FEE:PKR ${total}|SERVICE:${serviceDescription || 'Clinical Care'}|STATUS:VERIFIED_PAID|TXN:${txnId}`;

    if (isDbConnected()) {
      if (patientCnic) {
        await PatientModel.findOneAndUpdate(
          { nationalId: patientCnic },
          { $inc: { accountBalance: total } }
        );
      }

      const receipt = await ReceiptModel.create({
        receiptNumber: receiptNum,
        tokenNumber: '',
        patientId: patientId || 'PAT-AUTO',
        patientName: patientName || 'Walk-in Patient',
        patientCnic: patientCnic || 'N/A',
        patientPhone: patientPhone || '',
        accountNumber: finalAccountNo,
        hospitalId: hospitalId || 'hosp-aku',
        hospitalName: hospitalName || 'Aga Khan University Hospital',
        doctorId: 'DOC-GENERAL',
        doctorName: serviceDescription || 'Clinical Care Service',
        doctorSpecialty: department || 'Finance & Accounts',
        department: department || 'General OPD',
        appointmentNumber: billNum,
        appointmentDate: new Date().toISOString().split('T')[0],
        appointmentTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        consultationFee: total,
        serviceCharge: 0,
        totalAmount: total,
        paymentMethod: paymentMethod || 'Cash at Counter',
        paymentStatus: 'PAID',
        transactionId: txnId,
        qrPayload,
        issuedAt: new Date().toLocaleString(),
      });

      return res.status(201).json({ success: true, receipt });
    }

    const fallbackReceipt = {
      receiptNumber: receiptNum,
      patientName,
      patientCnic,
      accountNumber: finalAccountNo,
      hospitalName,
      totalAmount: total,
      paymentMethod,
      transactionId: txnId,
      qrPayload,
      issuedAt: new Date().toLocaleString(),
    };
    return res.status(201).json({ success: true, receipt: fallbackReceipt });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// 8. Top Up Patient Hospital Deposit Account
app.post('/api/patients/deposit', async (req, res) => {
  const { nationalId, amount, hospitalId, method } = req.body;
  const depositAmount = Number(amount) || 0;

  try {
    if (isDbConnected()) {
      const patient = await PatientModel.findOneAndUpdate(
        { nationalId },
        { $inc: { accountBalance: depositAmount } },
        { new: true }
      );
      if (patient) {
        // Also record receipt
        const receiptNum = `REC-DEP-${Math.floor(1000 + Math.random() * 9000)}`;
        const txnId = `TXN-${Date.now().toString().slice(-6)}`;
        await ReceiptModel.create({
          receiptNumber: receiptNum,
          tokenNumber: '',
          patientId: patient.patientId || patient.id,
          patientName: patient.name,
          patientCnic: patient.nationalId,
          patientPhone: patient.phone,
          accountNumber: patient.accountNumber || `ACC-${Math.floor(100000 + Math.random() * 900000)}`,
          hospitalId: hospitalId || 'hosp-aku',
          hospitalName: 'Hospital Account Deposit',
          doctorId: 'FINANCE-DESK',
          doctorName: 'Cashier / Financial Desk',
          doctorSpecialty: 'Account Deposit',
          department: 'Finance & Accounts',
          appointmentNumber: `DEP-${Date.now().toString().slice(-4)}`,
          appointmentDate: new Date().toISOString().split('T')[0],
          appointmentTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          consultationFee: depositAmount,
          serviceCharge: 0,
          totalAmount: depositAmount,
          paymentMethod: method || 'Cash Deposit',
          paymentStatus: 'PAID',
          transactionId: txnId,
          qrPayload: `DEPOSIT:${receiptNum}|PAT:${patient.name}|ACC:${patient.accountNumber}|AMT:PKR ${depositAmount}|TXN:${txnId}`,
          issuedAt: new Date().toLocaleString(),
        });

        return res.json({ success: true, patient });
      }
    }
    return res.json({ success: true, nationalId, depositAmount });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`[Express API Server] Running on http://127.0.0.1:${PORT}`);
});
