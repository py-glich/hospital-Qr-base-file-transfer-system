import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import type { Hospital, StaffUser, HospitalId } from '../types/ehr';

interface HospitalLoginViewProps {
  hospitals: Hospital[];
  onLoginSuccess: (user: StaffUser, hospital: Hospital) => void;
}

interface HospitalCredentialInfo {
  hospitalId: HospitalId;
  name: string;
  city: string;
  badge: string;
  loginId: string;
  password: string;
  staffName: string;
  role: 'HOSPITAL_ADMIN' | 'CHIEF_PHYSICIAN';
  licenseNumber: string;
}

const HOSPITAL_CREDENTIALS: HospitalCredentialInfo[] = [
  {
    hospitalId: 'hosp-aku',
    name: 'Aga Khan University Hospital',
    city: 'Karachi',
    badge: 'AKUH-KHI',
    loginId: 'admin@aku.edu.pk',
    password: 'AKU#2026',
    staffName: 'Dr. Asad Mehmood (Aga Khan Chief)',
    role: 'CHIEF_PHYSICIAN',
    licenseNumber: 'PMDC-48921-S',
  },
  {
    hospitalId: 'hosp-shifa',
    name: 'Shifa International Hospital',
    city: 'Islamabad',
    badge: 'SIH-ISB',
    loginId: 'admin@shifa.com.pk',
    password: 'Shifa#2026',
    staffName: 'Prof. Dr. Salman Qureshi (Shifa Chief)',
    role: 'CHIEF_PHYSICIAN',
    licenseNumber: 'PMDC-31089-I',
  },
  {
    hospitalId: 'hosp-mayo',
    name: 'Mayo Hospital & KEMU',
    city: 'Lahore',
    badge: 'MAYO-LHR',
    loginId: 'admin@mayo.edu.pk',
    password: 'Mayo#2026',
    staffName: 'Prof. Dr. Irfan Malik (Mayo Chief)',
    role: 'CHIEF_PHYSICIAN',
    licenseNumber: 'PMDC-20943-L',
  },
];

export const HospitalLoginView: React.FC<HospitalLoginViewProps> = ({
  hospitals,
  onLoginSuccess,
}) => {
  const [selectedHospitalId, setSelectedHospitalId] = useState<HospitalId>('hosp-aku');
  const [username, setUsername] = useState('admin@aku.edu.pk');
  const [password, setPassword] = useState('AKU#2026');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedCred =
    HOSPITAL_CREDENTIALS.find((c) => c.hospitalId === selectedHospitalId) || HOSPITAL_CREDENTIALS[0];

  const matchedHospital =
    hospitals.find((h) => h.id === selectedHospitalId) || hospitals[0];

  const handleSelectHospital = (cred: HospitalCredentialInfo) => {
    setSelectedHospitalId(cred.hospitalId);
    setUsername(cred.loginId);
    setPassword(cred.password);
    setErrorMessage(null);
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedUser = username.trim();
    const trimmedPass = password.trim();

    if (!trimmedUser) {
      setErrorMessage('Please enter your hospital staff username');
      return;
    }
    if (!trimmedPass) {
      setErrorMessage('Please enter your hospital security password');
      return;
    }

    // Verify credentials for the selected hospital (or allow demo override if typed)
    const isMatchingHospital =
      (trimmedUser.toLowerCase() === selectedCred.loginId.toLowerCase() &&
        trimmedPass === selectedCred.password) ||
      (trimmedUser.toLowerCase() === 'admin' && trimmedPass === 'admin123') ||
      (trimmedUser.toLowerCase().includes(selectedCred.hospitalId.split('-')[1]) &&
        trimmedPass.toLowerCase().includes(selectedCred.hospitalId.split('-')[1]));

    if (!isMatchingHospital) {
      setErrorMessage(
        `Access Denied: Invalid credentials for ${selectedCred.name}. Login: ${selectedCred.loginId} (Pass: ${selectedCred.password})`
      );
      return;
    }

    const user: StaffUser = {
      id: `STAFF-${selectedCred.hospitalId.toUpperCase()}`,
      name: selectedCred.staffName,
      role: selectedCred.role,
      hospitalId: matchedHospital.id,
      licenseNumber: selectedCred.licenseNumber,
      email: selectedCred.loginId,
    };
    onLoginSuccess(user, matchedHospital);
  };

  return (
    <section id="login" className="login" aria-label="Sign in">
      {/* Exact Vector Scene from MediLink 360 Demo */}
      <svg
        className="scene"
        viewBox="0 0 1366 768"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="wall" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#e8eef5" />
            <stop offset="1" stopColor="#dbe5f0" />
          </linearGradient>
          <linearGradient id="pil" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#6f97b2" />
            <stop offset="1" stopColor="#9bbacd" />
          </linearGradient>
          <linearGradient id="flr" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#e6ecf2" />
            <stop offset="1" stopColor="#f6f8fa" />
          </linearGradient>
          <linearGradient id="cnt" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#c3c8cc" />
            <stop offset="1" stopColor="#a9aeb2" />
          </linearGradient>
          <filter id="b2">
            <feGaussianBlur stdDeviation="2" />
          </filter>
          <filter id="b6">
            <feGaussianBlur stdDeviation="6" />
          </filter>
          <filter id="b16">
            <feGaussianBlur stdDeviation="16" />
          </filter>
        </defs>
        <rect width="1366" height="768" fill="url(#wall)" />
        <rect x="0" y="0" width="470" height="560" fill="#eef3f8" opacity=".8" />
        <g className="lamp">
          <rect x="470" y="40" width="190" height="480" fill="#fff6e4" filter="url(#b16)" />
        </g>
        <g filter="url(#b6)" opacity=".55">
          <rect x="500" y="60" width="6" height="440" fill="#c9bfa8" />
          <rect x="575" y="60" width="6" height="440" fill="#c9bfa8" />
          <rect x="640" y="60" width="6" height="440" fill="#c9bfa8" />
        </g>
        <rect x="646" y="0" width="204" height="560" fill="url(#pil)" />
        <polygon points="1366,200 1366,768 700,768 880,560 1100,420" fill="#c9daee" opacity=".7" />
        <polygon points="1366,420 1366,768 960,768 1160,600" fill="#b6cde6" opacity=".7" />
        <rect x="0" y="545" width="850" height="223" fill="url(#flr)" />
        <ellipse cx="560" cy="640" rx="330" ry="22" fill="#fff" opacity=".85" filter="url(#b6)" />
        <g filter="url(#b2)">
          <rect x="0" y="462" width="270" height="306" fill="url(#cnt)" />
          <rect x="270" y="462" width="140" height="250" fill="#a9aeb2" />
          <polygon points="0,444 410,444 410,468 0,468" fill="#eceef0" />
          <ellipse cx="300" cy="738" rx="90" ry="12" fill="#cfd4d8" />
        </g>
        <g
          fontFamily="Inter,sans-serif"
          fontStyle="italic"
          fontWeight="600"
          fontSize="26"
          fill="#58789f"
          letterSpacing="3"
        >
          <g transform="translate(70 556) rotate(-8)">
            <text>PEOPLE</text>
          </g>
          <g transform="translate(78 594) rotate(-8)">
            <text>CARE</text>
          </g>
          <g transform="translate(82 632) rotate(-8)">
            <text>BETTER</text>
          </g>
          <g transform="translate(86 670) rotate(-8)">
            <text>TOGETHER</text>
          </g>
        </g>
        <line x1="82" y1="706" x2="116" y2="706" stroke="#58789f" stroke-width="3" />
        <g filter="url(#b2)">
          <ellipse cx="30" cy="350" rx="26" ry="62" fill="#4f9a6a" transform="rotate(-14 30 350)" />
          <ellipse cx="78" cy="372" rx="20" ry="56" fill="#6fb383" transform="rotate(26 78 372)" />
          <ellipse cx="14" cy="392" rx="18" ry="40" fill="#3f8a5c" />
          <rect x="0" y="418" width="66" height="30" rx="4" fill="#f1f3f4" />
        </g>
        <g filter="url(#b2)">
          <ellipse cx="760" cy="420" rx="22" ry="66" fill="#5aa574" transform="rotate(-18 760 420)" />
          <ellipse cx="822" cy="430" rx="20" ry="58" fill="#4f9a6a" transform="rotate(22 822 430)" />
          <ellipse cx="790" cy="440" rx="18" ry="50" fill="#79bd8d" />
          <rect x="712" y="474" width="124" height="104" rx="6" fill="#eff1f3" />
        </g>
        <g className="walk" filter="url(#b2)">
          <circle cx="460" cy="334" r="12" fill="#6b4630" />
          <path d="M450 330q-14 22-4 44" stroke="#6b4630" strokeWidth="9" fill="none" strokeLinecap="round" />
          <rect x="436" y="354" width="48" height="86" rx="14" fill="#4f9ecb" />
          <rect x="440" y="436" width="18" height="84" rx="8" fill="#3c86b4" />
          <rect x="462" y="436" width="18" height="84" rx="8" fill="#3c86b4" />
        </g>
        <g className="walk2" filter="url(#b2)">
          <circle cx="566" cy="326" r="12" fill="#2a2320" />
          <rect x="530" y="344" width="70" height="120" rx="14" fill="#f3f5f7" />
          <rect x="538" y="460" width="22" height="64" rx="8" fill="#2c4d78" />
          <rect x="568" y="460" width="22" height="64" rx="8" fill="#2c4d78" />
        </g>
        <g
          fontFamily="Inter,sans-serif"
          fontWeight="500"
          fontSize="19"
          fill="#d3e2ec"
          letterSpacing="3.5"
          opacity=".95"
        >
          <text x="678" y="78">CARE</text>
          <text x="678" y="110">PEOPLE</text>
          <text x="678" y="141">PROGRESS</text>
          <text x="678" y="173">A HEALTHIER</text>
          <text x="678" y="205">TOMORROW</text>
        </g>
        <line x1="680" y1="240" x2="706" y2="240" stroke="#d3e2ec" strokeWidth="3" />
      </svg>

      {/* Hero Left Column */}
      <div className="hero">
        <small>Hospital</small>
        <h1>Management<br />System</h1>
        <p>For a healthier tomorrow</p>
      </div>

      {/* Login Card Right Column */}
      <form className="lcard" onSubmit={handleSignIn} autoComplete="off">
        {/* Emblem Blue Cross Logo */}
        <svg className="llogo" viewBox="0 0 100 100" aria-hidden="true">
          <defs>
            <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#4a90cf" />
              <stop offset="1" stopColor="#2d6fae" />
            </linearGradient>
          </defs>
          <path
            d="M36 6h28a6 6 0 0 1 6 6v22h22a6 6 0 0 1 6 6v20a6 6 0 0 1-6 6H70v22a6 6 0 0 1-6 6H36a6 6 0 0 1-6-6V66H8a6 6 0 0 1-6-6V40a6 6 0 0 1 6-6h22V12a6 6 0 0 1 6-6z"
            fill="url(#lg)"
          />
          <path
            d="M50 28c15 9 15 35 0 44-15-9-15-35 0-44z"
            fill="#eef5fb"
            opacity=".88"
            transform="rotate(38 50 50)"
          />
        </svg>

        <h2>Hospital Management System</h2>
        <p className="sub">Administrator Login</p>

        {/* Hospital Station Selector (Multi-Hospital with different passwords) */}
        <div style={{ marginTop: '16px', marginBottom: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#17365d', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
            Select Hospital Station:
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
            {HOSPITAL_CREDENTIALS.map((cred) => {
              const isSelected = selectedHospitalId === cred.hospitalId;
              return (
                <button
                  key={cred.hospitalId}
                  type="button"
                  onClick={() => handleSelectHospital(cred)}
                  style={{
                    padding: '8px 4px',
                    borderRadius: '8px',
                    border: isSelected ? '2px solid #1f5f9e' : '1px solid #d5e0ec',
                    background: isSelected ? '#17365d' : '#f0f5fa',
                    color: isSelected ? '#ffffff' : '#33585b',
                    fontWeight: 700,
                    fontSize: '11px',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div>{cred.hospitalId === 'hosp-aku' ? 'Aga Khan' : cred.hospitalId === 'hosp-shifa' ? 'Shifa' : 'Mayo'}</div>
                  <div style={{ fontSize: '9px', fontWeight: 500, color: isSelected ? '#7af0cc' : '#7a9ac4' }}>{cred.city}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div
            style={{
              padding: '10px 12px',
              borderRadius: '8px',
              backgroundColor: '#fbdedb',
              color: '#b83a34',
              fontSize: '12px',
              fontWeight: 600,
              margin: '12px 0'
            }}
          >
            {errorMessage}
          </div>
        )}

        <label className="f" htmlFor="user">Username</label>
        <input
          id="user"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="admin@aku.edu.pk"
          aria-label="Username"
          required
        />

        <label className="f" htmlFor="pass">Password</label>
        <div style={{ position: 'relative' }}>
          <input
            id="pass"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="AKU#2026"
            aria-label="Password"
            style={{ paddingRight: '44px' }}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: '#7a9ac4',
              cursor: 'pointer'
            }}
            title={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div className="lrow">
          <label className="chk">
            <input
              type="checkbox"
              id="rem"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <span />
            Remember me
          </label>
          <a
            href="#forgot"
            id="forgot"
            onClick={(e) => {
              e.preventDefault();
              alert(`Credentials for ${selectedCred.name}:\nUsername: ${selectedCred.loginId}\nPassword: ${selectedCred.password}`);
            }}
          >
            Forgot password
          </a>
        </div>

        <button className="lbtn" type="submit">Sign in</button>
        <p className="lnote" id="msg" role="status">
          Selected Node: {selectedCred.badge} &bull; Pass: {selectedCred.password}
        </p>
      </form>
    </section>
  );
};
