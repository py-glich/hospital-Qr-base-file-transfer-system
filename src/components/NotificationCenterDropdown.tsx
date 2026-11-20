import React, { useState } from 'react';
import {
  Bell,
  Check,
  X,
  CheckCircle2,
  Eye,
} from 'lucide-react';
import type { HospitalNotification, Hospital } from '../types/ehr';

interface NotificationCenterDropdownProps {
  notifications: HospitalNotification[];
  currentHospital: Hospital;
  onClose: () => void;
  onGrantPermission: (patientId: string, requestingHospitalId: string, notificationId: string) => void;
  onDeclinePermission: (notificationId: string) => void;
  onSelectPatientDossier?: (patientId: string) => void;
  onNavigateToPharmacy?: (medicineName?: string) => void;
}

export const NotificationCenterDropdown: React.FC<NotificationCenterDropdownProps> = ({
  notifications,
  currentHospital,
  onClose,
  onGrantPermission,
  onDeclinePermission,
  onSelectPatientDossier,
  onNavigateToPharmacy,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'EMERGENCY' | 'TRANSFER' | 'PERMISSION' | 'PHARMACY'>('ALL');

  // Filter notifications relevant to current hospital
  const hospitalNotifications = notifications.filter(
    (n) => n.targetHospitalId === currentHospital.id
  );

  const filtered = hospitalNotifications.filter((n) => {
    if (filter === 'EMERGENCY') return n.type === 'EMERGENCY_QR_ACCESS';
    if (filter === 'TRANSFER') return n.type === 'PATIENT_ASSIGNED';
    if (filter === 'PERMISSION') return n.type === 'PERMISSION_REQUEST' || n.type === 'PERMISSION_GRANTED';
    if (filter === 'PHARMACY') return n.type === 'PHARMACY_STOCKOUT';
    return true;
  });

  return (
    <div
      style={{
        position: 'absolute',
        top: '60px',
        right: '65px',
        width: '420px',
        maxWidth: '92vw',
        background: '#ffffff',
        borderRadius: '20px',
        boxShadow: '0 16px 48px rgba(15, 23, 42, 0.22)',
        border: '1.5px solid #e2e8f0',
        zIndex: 100,
        overflow: 'hidden',
        animation: 'fade 0.2s ease-out',
      }}
    >
      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)',
          color: '#ffffff',
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              background: 'rgba(255,255,255,0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Bell size={17} color="#ffffff" />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800 }}>
              Hospital Station Alerts
            </h4>
            <span style={{ fontSize: '11px', opacity: 0.85 }}>
              {currentHospital.name} Node
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 800,
              background: 'rgba(255,255,255,0.2)',
              padding: '3px 8px',
              borderRadius: '999px',
            }}
          >
            {hospitalNotifications.length} Total
          </span>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 0,
              color: '#ffffff',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
            }}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid #f1f5f9',
          background: '#f8fafc',
          padding: '6px 12px',
          gap: '6px',
          fontSize: '11px',
          overflowX: 'auto',
        }}
      >
        {[
          { key: 'ALL', label: 'All Alerts' },
          { key: 'EMERGENCY', label: '🚨 Emergency Access' },
          { key: 'TRANSFER', label: '📥 Patient Transfers' },
          { key: 'PERMISSION', label: '🛡️ Permissions' },
          { key: 'PHARMACY', label: '💊 Pharmacy Stockouts' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilter(tab.key as any)}
            style={{
              padding: '5px 10px',
              borderRadius: '8px',
              border: 0,
              background: filter === tab.key ? '#0f766e' : 'transparent',
              color: filter === tab.key ? '#ffffff' : '#64748b',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div
        style={{
          maxHeight: '410px',
          overflowY: 'auto',
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        {filtered.length > 0 ? (
          filtered.map((n) => {
            const isEmergency = n.type === 'EMERGENCY_QR_ACCESS';
            const isTransfer = n.type === 'PATIENT_ASSIGNED';
            const isRequest = n.type === 'PERMISSION_REQUEST';
            const isStockout = n.type === 'PHARMACY_STOCKOUT';

            const borderColor = isEmergency
              ? '#fca5a5'
              : isTransfer
              ? '#5eead4'
              : isRequest
              ? '#fcd34d'
              : isStockout
              ? '#fca5a5'
              : '#86efac';

            const bgLight = isEmergency
              ? '#fff1f2'
              : isTransfer
              ? '#f0fdfa'
              : isRequest
              ? '#fffbeb'
              : isStockout
              ? '#fff1f2'
              : '#f0fdf4';

            return (
              <div
                key={n.id}
                style={{
                  padding: '12px 14px',
                  borderRadius: '14px',
                  border: `1.5px solid ${borderColor}`,
                  background: bgLight,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <b style={{ fontSize: '12.5px', color: '#0f2f33', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {n.title}
                  </b>
                  <span style={{ fontSize: '10px', color: '#64748b' }}>{n.timestamp}</span>
                </div>

                <p style={{ margin: 0, fontSize: '11.5px', color: '#334155', lineHeight: '1.4' }}>
                  {n.message}
                </p>

                {/* Patient Tag */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '3px' }}>
                  <span
                    style={{
                      fontSize: '10.5px',
                      fontWeight: 700,
                      color: '#0f766e',
                      background: '#ffffff',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      border: '1px solid #ccfbf1',
                    }}
                  >
                    Patient: {n.patientName} ({n.patientId})
                  </span>

                  {onSelectPatientDossier && (
                    <button
                      type="button"
                      onClick={() => {
                        onSelectPatientDossier(n.patientId);
                        onClose();
                      }}
                      style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        fontSize: '10.5px',
                        fontWeight: 700,
                        color: '#475569',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Eye size={12} /> View File
                    </button>
                  )}
                </div>

                {/* Interactive Action for Permission Request */}
                {isRequest && (
                  <div
                    style={{
                      marginTop: '6px',
                      paddingTop: '8px',
                      borderTop: '1px solid #fde68a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: '8px',
                    }}
                  >
                    {n.status === 'GRANTED' ? (
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          color: '#15803d',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <CheckCircle2 size={14} /> Permission Granted
                      </span>
                    ) : n.status === 'DECLINED' ? (
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#b91c1c' }}>
                        Declined
                      </span>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => onDeclinePermission(n.id)}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            background: '#ffffff',
                            color: '#64748b',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          Decline
                        </button>
                        <button
                          type="button"
                          onClick={() => onGrantPermission(n.patientId, n.fromHospitalId, n.id)}
                          style={{
                            padding: '4px 12px',
                            borderRadius: '8px',
                            border: 0,
                            background: '#0f766e',
                            color: '#ffffff',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            boxShadow: '0 2px 6px rgba(15,118,110,0.2)',
                          }}
                        >
                          <Check size={13} /> Grant Edit Permission
                        </button>
                      </>
                    )}
                  </div>
                )}

                {/* Interactive Action for Pharmacy Stockout Requisition */}
                {isStockout && (
                  <div
                    style={{
                      marginTop: '6px',
                      paddingTop: '8px',
                      borderTop: '1px solid #fecaca',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px',
                    }}
                  >
                    <span style={{ fontSize: '10.5px', color: '#b91c1c', fontWeight: 700 }}>
                      🚨 Needs Immediate Restock
                    </span>
                    {onNavigateToPharmacy && (
                      <button
                        type="button"
                        onClick={() => {
                          onNavigateToPharmacy(n.medicineName);
                          onClose();
                        }}
                        style={{
                          padding: '4px 12px',
                          borderRadius: '8px',
                          border: 0,
                          background: '#be123c',
                          color: '#ffffff',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          boxShadow: '0 2px 6px rgba(190,18,60,0.25)',
                        }}
                      >
                        📦 Fill Up in Pharmacy
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div
            style={{
              padding: '30px 20px',
              textAlign: 'center',
              color: '#94a3b8',
              fontSize: '12.5px',
            }}
          >
            <CheckCircle2 size={32} color="#cbd5e1" style={{ margin: '0 auto 8px' }} />
            <b>No active station alerts</b>
            <p style={{ margin: '4px 0 0', fontSize: '11.5px' }}>
              Your hospital network node is fully synchronized and secure.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
