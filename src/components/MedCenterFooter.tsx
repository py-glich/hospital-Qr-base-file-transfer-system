import React from 'react';
import { Phone, Mail, Cross } from 'lucide-react';

interface MedCenterFooterProps {
  onSelectDepartment?: (dept: string) => void;
}

export const MedCenterFooter: React.FC<MedCenterFooterProps> = ({ onSelectDepartment }) => {
  const departments = [
    'Neurology',
    'Surgery',
    'Traumatology',
    'Oncology',
    'Orthopedics',
    'Urology',
    'Proctology',
    'Cardiology',
    'Dermatology',
    'Gynecology',
  ];

  const generalInfo = [
    'Doctors',
    'Single Doctor',
    'Contact',
    'Blog',
    'Patient Data Bank',
    'OPD Queue Tokens',
  ];

  return (
    <footer className="bg-white border-t border-slate-200 mt-auto text-slate-700 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Col 1: Med Center Branding & Social */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-lg bg-sky-600 flex items-center justify-center text-white shadow-md">
                <Cross className="w-6 h-6 rotate-45" />
              </div>
              <div className="leading-tight">
                <span className="text-xl font-black text-sky-900 tracking-tight block">MED</span>
                <span className="text-sm font-bold text-sky-700 tracking-wider block -mt-1">CENTER</span>
              </div>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed">
              Leading multi-hospital medical center providing advanced healthcare, interoperable electronic health records, and seamless patient-doctor care.
            </p>
            <div className="flex items-center gap-3 pt-2 text-sky-800">
              {/* YouTube SVG */}
              <a
                href="#youtube"
                aria-label="YouTube"
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-sky-50 hover:text-sky-600 flex items-center justify-center transition border border-slate-200"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              {/* Facebook SVG */}
              <a
                href="#facebook"
                aria-label="Facebook"
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-sky-50 hover:text-sky-600 flex items-center justify-center transition border border-slate-200"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              {/* Instagram SVG */}
              <a
                href="#instagram"
                aria-label="Instagram"
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-sky-50 hover:text-sky-600 flex items-center justify-center transition border border-slate-200"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Col 2: Contacts */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Contacts:</h4>
            <ul className="space-y-2.5 text-slate-600">
              <li className="flex items-center gap-2 hover:text-sky-700 transition">
                <Phone className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span className="font-semibold">+1 800 852 3456</span>
              </li>
              <li className="flex items-center gap-2 hover:text-sky-700 transition">
                <Phone className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span className="font-semibold">+1 800 635 9645</span>
              </li>
              <li className="flex items-center gap-2 hover:text-sky-700 transition">
                <Mail className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span>medcenter@email.com</span>
              </li>
              <li className="pt-2 text-[11px] text-slate-400">
                24/7 Emergency Care & Ambulance Response Network
              </li>
            </ul>
          </div>

          {/* Col 3: General Info */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">General Info</h4>
            <ul className="space-y-2 text-slate-600">
              {generalInfo.map((info) => (
                <li key={info}>
                  <a href={`#${info.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-sky-600 transition block">
                    {info}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Departments */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Departments</h4>
            <div className="grid grid-cols-2 gap-x-2 gap-y-2 text-slate-600">
              {departments.map((dept) => (
                <button
                  key={dept}
                  type="button"
                  onClick={() => onSelectDepartment?.(dept)}
                  className="text-left hover:text-sky-600 transition truncate cursor-pointer text-xs"
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-10 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-400 text-[11px]">
          <div>© {new Date().getFullYear()} Med Center Hospital Management System. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <span>HL7 FHIR Interoperable</span>
            <span>•</span>
            <span>Mongoose MongoDB Database</span>
            <span>•</span>
            <span>Universal QR Token Network</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
