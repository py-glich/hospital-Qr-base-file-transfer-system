import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Camera, CameraOff, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { Patient } from '../types/ehr';

interface CameraQRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  patients?: Patient[];
  containerId?: string;
}

export const CameraQRScanner: React.FC<CameraQRScannerProps> = ({
  onScanSuccess,
  patients: _patients,
  containerId = 'hospital-qr-camera-reader',
}) => {
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [scannerStarting, setScannerStarting] = useState<boolean>(false);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = containerId;
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length > 0) {
          const formatted = devices.map((d, index) => ({
            id: d.id,
            label: d.label || `Camera ${index + 1}`,
          }));
          setCameras(formatted);
          setSelectedCameraId(formatted[0].id);
        }
      })
      .catch((err) => {
        console.warn('Camera enumeration waiting for user gesture:', err);
      });

    return () => {
      stopCameraScanner();
    };
  }, []);

  const startCameraScanner = async (cameraId?: string) => {
    setErrorMsg(null);
    setScannerStarting(true);

    try {
      if (scannerRef.current) {
        await stopCameraScanner();
      }

      const html5QrCode = new Html5Qrcode(scannerContainerId, {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false,
      });
      scannerRef.current = html5QrCode;

      const targetCamera = cameraId || selectedCameraId;
      const cameraConfig = targetCamera ? { deviceId: { exact: targetCamera } } : { facingMode: 'environment' };

      await html5QrCode.start(
        cameraConfig,
        {
          fps: 15,
          qrbox: { width: 260, height: 260 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          handleSuccessfulScan(decodedText);
        },
        () => {}
      );

      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length > 0) {
        setCameras(devices.map((d, i) => ({ id: d.id, label: d.label || `Camera ${i + 1}` })));
        if (!selectedCameraId && devices[0]) {
          setSelectedCameraId(devices[0].id);
        }
      }

      setIsScanning(true);
      setScannerStarting(false);
    } catch (err: any) {
      console.error('Camera Scanner start error:', err);
      setScannerStarting(false);
      setIsScanning(false);
      if (err?.name === 'NotAllowedError' || err?.message?.includes('Permission denied')) {
        setErrorMsg('Camera access was denied. Please click the camera icon in your browser address bar and choose "Allow".');
      } else if (err?.name === 'NotFoundError' || err?.message?.includes('devices not found')) {
        setErrorMsg('No physical camera detected. You can use the QR Image Upload or Quick Demo cards below.');
      } else {
        setErrorMsg(`Camera error: ${err?.message || 'Could not access camera feed.'}`);
      }
    }
  };

  const stopCameraScanner = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        await scannerRef.current.clear();
      } catch (err) {
        console.warn('Error stopping scanner:', err);
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
    setScannerStarting(false);
  };

  const handleSuccessfulScan = (code: string) => {
    setLastScanned(code);
    onScanSuccess(code);

    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {
      // AudioContext maybe blocked without gesture
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    try {
      let qrInstance = scannerRef.current;
      if (!qrInstance) {
        qrInstance = new Html5Qrcode(scannerContainerId, {
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          verbose: false,
        });
        scannerRef.current = qrInstance;
      }

      const decoded = await qrInstance.scanFile(file, true);
      handleSuccessfulScan(decoded);
    } catch {
      setErrorMsg('No QR code could be detected in this uploaded image. Please try a clearer QR picture.');
    }
  };

  return (
    <div className="w-full">
      {/* Action Controls & Sensor Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between pb-3 gap-2.5">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${isScanning ? 'bg-teal-500 animate-pulse' : 'bg-slate-400'}`}></span>
          <span className="text-xs font-bold text-slate-700">
            {isScanning ? 'Camera Scanner Live' : 'Optical QR Sensor Ready'}
          </span>
          {cameras.length > 1 && (
            <select
              value={selectedCameraId}
              onChange={(e) => {
                setSelectedCameraId(e.target.value);
                if (isScanning) startCameraScanner(e.target.value);
              }}
              className="bg-slate-50 border border-slate-200 text-xs text-slate-700 rounded-lg px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-teal-700 ml-2"
            >
              {cameras.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          {!isScanning ? (
            <button
              onClick={() => startCameraScanner()}
              disabled={scannerStarting}
              className="w-full sm:w-auto px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-md shadow-teal-700/20 active:scale-95 disabled:opacity-60 cursor-pointer transition flex items-center justify-center gap-2"
            >
              <Camera className="w-4 h-4" />
              {scannerStarting ? 'Connecting...' : 'Activate Camera'}
            </button>
          ) : (
            <button
              onClick={stopCameraScanner}
              className="w-full sm:w-auto px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-600/20 active:scale-95 cursor-pointer transition flex items-center justify-center gap-2"
            >
              <CameraOff className="w-4 h-4" />
              Stop Camera
            </button>
          )}
        </div>
      </div>

      {/* Camera Viewport (compact 100-110px display when inactive, optimal 260px when active) */}
      <div className="mt-2 flex flex-col items-center w-full">
        <div
          className={`relative w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-200/80 flex items-center justify-center shadow-inner transition-all duration-300 ${
            isScanning
              ? 'h-[250px] sm:h-[280px] max-w-sm sm:max-w-md'
              : 'h-[100px] sm:h-[110px] max-w-full'
          }`}
        >
          <div
            id={scannerContainerId}
            className="w-full h-full flex items-center justify-center text-slate-400 [&_video]:object-cover [&_video]:w-full [&_video]:h-full"
          >
            {!isScanning && (
              <div className="flex items-center justify-center gap-4 px-4 py-2 text-left w-full">
                <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-teal-400 shrink-0 shadow">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                    <p className="text-xs sm:text-sm font-bold text-slate-200">Camera Feed Inactive</p>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                    Click <span className="text-teal-400 font-semibold">"Activate Camera"</span> above to allow browser access and scan patient cards directly.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Calming Clinical HUD when active */}
          {isScanning && (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <div className="w-64 h-64 relative border-2 border-teal-400/40 rounded-2xl">
                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-teal-400 rounded-tl-lg"></div>
                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-teal-400 rounded-tr-lg"></div>
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-teal-400 rounded-bl-lg"></div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-teal-400 rounded-br-lg"></div>

                <div className="absolute left-3 right-3 h-0.5 bg-gradient-to-r from-transparent via-teal-300 to-transparent shadow-[0_0_10px_#2dd4bf] animate-[bounce_2s_infinite]"></div>
              </div>

              <div className="absolute bottom-4 px-3.5 py-1 rounded-full bg-slate-900/80 border border-teal-400/30 text-[11px] font-medium text-teal-200 backdrop-blur-md flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping"></span>
                AIM CAMERA AT PATIENT QR CODE
              </div>
            </div>
          )}
        </div>

        {/* Notices */}
        {errorMsg && (
          <div className="mt-4 w-full max-w-md p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Camera Access Assistance</p>
              <p className="text-rose-600 mt-0.5">{errorMsg}</p>
            </div>
          </div>
        )}

        {lastScanned && (
          <div className="mt-4 w-full max-w-md p-3 bg-teal-50 border border-teal-200 rounded-2xl flex items-center gap-3 text-teal-800 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-teal-600" />
            <span className="font-mono truncate font-semibold">Decoded Successfully: {lastScanned}</span>
          </div>
        )}

        {/* Alternative options: Upload Photo */}
        <div className="mt-4 w-full border-t border-slate-100 pt-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="flex items-center gap-2.5 text-xs text-slate-600">
              <div className="w-7 h-7 rounded-lg bg-teal-100/80 text-teal-800 flex items-center justify-center shrink-0">
                <Upload className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-xs">Have a QR Card image or digital export?</p>
                <p className="text-[10px] text-slate-500">Upload a photo or screenshot to scan</p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full sm:w-auto px-3.5 py-2 text-xs bg-white hover:bg-slate-100 text-slate-800 font-bold rounded-lg border border-slate-200 shadow-2xs flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-teal-700" />
              Select QR Image
            </button>
          </div>
        </div>

        {/* Quick Demo QR Test Profiles */}
        {_patients && _patients.length > 0 && (
          <div className="mt-3.5 w-full pt-3 border-t border-slate-100">
            <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Or Click Demo Card to Simulate Scan:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {_patients.slice(0, 3).map((pat) => (
                <button
                  key={pat.id}
                  type="button"
                  onClick={() => handleSuccessfulScan(pat.qrPayload)}
                  className="p-2 text-left bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 rounded-xl transition cursor-pointer group"
                  title={`Simulate scanning ${pat.name}'s QR health card`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 group-hover:text-teal-900 truncate">
                      {pat.name.split(' ')[0]} {pat.name.split(' ')[1] || ''}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-teal-100 text-teal-800 font-bold">
                      {pat.bloodGroup}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">
                    {pat.id} &bull; {pat.primaryHospitalId.split('-')[1].toUpperCase()}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
