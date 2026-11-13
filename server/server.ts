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

// Initialize MongoDB
connectDB();

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
  try {
    if (isDbConnected()) {
      const receipts = await ReceiptModel.find().sort({ createdAt: -1 });
      return res.json(receipts);
    }
  } catch (err) {
    console.warn('Receipt query fallback:', err);
  }
  res.json([]);
});

app.listen(PORT, () => {
  console.log(`[Express API Server] Running on http://127.0.0.1:${PORT}`);
});
