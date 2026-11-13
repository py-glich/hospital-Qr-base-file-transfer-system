# MedPulse - QR-Based Multi-Hospital Enterprise EHR Platform

A complete federated electronic health records (EHR) network with **Live Camera QR Code Scanning** that enables real-time, consent-gated patient medical history sharing across multiple hospitals.

## Key Capabilities

1. **Live Camera QR Code Scanner (`html5-qrcode`)**:
   - Accesses webcam/phone camera (`navigator.mediaDevices.getUserMedia`).
   - Interactive camera viewfinder with laser targeting line and auto-decode.
   - Front/Back environment camera switching.
   - Fallback options: QR image file upload and 1-click simulation test buttons.

2. **Cross-Hospital Interoperability**:
   - Switch between **Shifa International Hospital (Islamabad)**, **Aga Khan University Hospital (Karachi)**, and **Mayo Hospital (Lahore)**.
   - Demonstrates patient registered at Hospital A being scanned and treated at Hospital B with complete clinical timeline.

3. **Consent & Emergency Break-Glass Protocols**:
   - Standard OPD: Requires 4-digit patient OTP verification before record unlock.
   - Emergency Break-Glass: Immediate bypass for unconscious trauma cases with high-priority audit alerts.

4. **Synchronized Prescription & Medical Consultation**:
   - Doctors at Hospital B can add new diagnoses, vitals, and medications which sync immediately to the patient's record across all hospitals.

5. **Tamper-Proof Access Audit Ledger**:
   - Logs every scan, emergency override, and consultation with timestamp, doctor name, and hospital node.

## Running Locally

```bash
npm install
npm run dev
```
Open [http://127.0.0.1:5173/](http://127.0.0.1:5173/) in your web browser.
