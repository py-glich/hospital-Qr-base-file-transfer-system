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
    <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl shadow-xl shadow-slate-100 p-4 sm:p-8 w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 sm:pb-6 border-b border-slate-100 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-teal-500 animate-pulse"></span>
            <h3 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">Optical QR Health Card Scanner</h3>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1">
            Place patient digital or physical Health Card in front of your device camera
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {cameras.length > 1 && (
            <select
              value={selectedCameraId}
              onChange={(e) => {
                setSelectedCameraId(e.target.value);
                if (isScanning) startCameraScanner(e.target.value);
              }}
              className="bg-slate-50 border border-slate-200 text-xs text-slate-700 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-teal-700 min-h-[42px]"
            >
              {cameras.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          )}

          {!isScanning ? (
            <button
              onClick={() => startCameraScanner()}
              disabled={scannerStarting}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs rounded-xl shadow-md shadow-teal-700/20 active:scale-95 disabled:opacity-60 cursor-pointer transition min-h-[42px]"
            >
              <Camera className="w-4 h-4" />
              {scannerStarting ? 'Connecting...' : 'Activate Camera'}
            </button>
          ) : (
            <button
              onClick={stopCameraScanner}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-rose-600/20 active:scale-95 cursor-pointer transition min-h-[42px]"
            >
              <CameraOff className="w-4 h-4" />
              Stop Camera
            </button>
          )}
        </div>
      </div>

      {/* Camera Viewport */}
      <div className="mt-5 sm:mt-6 flex flex-col items-center">
        <div className="relative w-full max-w-xs sm:max-w-md aspect-square bg-slate-900 border-4 border-slate-100 rounded-2xl sm:rounded-3xl overflow-hidden flex items-center justify-center shadow-inner">
          <div
            id={scannerContainerId}
            className="w-full h-full flex items-center justify-center text-slate-400 [&_video]:object-cover [&_video]:w-full [&_video]:h-full"
          >
            {!isScanning && (
              <div className="flex flex-col items-center p-6 text-center">
                <div className="w-18 h-18 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-teal-400 mb-4 shadow-lg">
                  <Camera className="w-8 h-8" />
                </div>
                <p className="text-sm font-bold text-slate-200">Camera Feed is Inactive</p>
                <p className="text-xs text-slate-400 max-w-xs mt-1.5 leading-relaxed">
                  Click <span className="text-teal-400 font-semibold">"Activate Camera"</span> above to allow browser access and scan patient cards directly.
                </p>
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

        {/* Alternative options */}
        <div className="mt-6 w-full max-w-2xl border-t border-slate-100 pt-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div className="flex items-center gap-2.5 text-xs text-slate-600">
              <div className="w-8 h-8 rounded-xl bg-teal-100/80 text-teal-800 flex items-center justify-center shrink-0">
                <Upload className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-xs">Have a QR Card image or digital export?</p>
                <p className="text-[11px] text-slate-500">Upload a photo, screenshot, or downloaded health card to scan</p>
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
              className="w-full sm:w-auto px-4 py-2.5 text-xs bg-white hover:bg-slate-100 text-slate-800 font-bold rounded-xl border border-slate-200 shadow-2xs flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-teal-700" />
              Select QR Image
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
