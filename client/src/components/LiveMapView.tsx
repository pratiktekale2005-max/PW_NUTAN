import React from 'react';
import type { CertifiedFacility } from '../types/index.js';
import { Navigation, Truck, Building2, Radio, Shield } from 'lucide-react';

interface LiveMapViewProps {
  facilities: CertifiedFacility[];
}

export const LiveMapView: React.FC<LiveMapViewProps> = ({ facilities }) => {
  return (
    <div className="panel" style={{ height: '100%' }}>
      <div className="panel-header">
        <div className="panel-title">
          <Navigation size={18} color="#06b6d4" />
          <span>Google Maps Geospatial Bio-Routing & Cryogenic Network</span>
        </div>
        <div className="status-pill" style={{ background: 'rgba(6, 182, 212, 0.1)', color: '#22d3ee', borderColor: 'rgba(6, 182, 212, 0.3)' }}>
          <Radio size={12} className="pulse-dot" style={{ backgroundColor: '#22d3ee', color: '#22d3ee' }} />
          <span>GPS & SENSOR TELEMETRY LIVE</span>
        </div>
      </div>

      <div style={{ marginBottom: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
        Real-time geospatial coordination grid monitoring temperature-controlled pharmaceutical fleets and cryogenic trauma centers powered by Google Maps Distance Matrix.
      </div>

      {/* Visual Map Canvas Representation */}
      <div 
        role="region"
        aria-label="Interactive Geospatial Bio-Routing Map"
        style={{ 
        position: 'relative', 
        height: '360px', 
        background: 'radial-gradient(ellipse at center, #0f1c3f 0%, #080c16 100%)', 
        borderRadius: 'var(--radius-lg)', 
        border: '1px solid rgba(6, 182, 212, 0.25)',
        overflow: 'hidden',
        boxShadow: 'inset 0 0 50px rgba(0,0,0,0.8), 0 0 25px rgba(6, 182, 212, 0.15)'
      }}>
        {/* Grid lines simulating map coordinate overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          opacity: 0.8
        }}></div>

        {/* Dynamic emergency route polyline */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          <defs>
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>
          <path 
            d="M 120 190 Q 260 90 440 140 T 720 220" 
            fill="none" 
            stroke="url(#routeGradient)" 
            strokeWidth="4" 
            strokeDasharray="8 4"
            style={{ filter: 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.6))' }}
          />
        </svg>

        {/* Facility Node 1: Apex Cryogenic Hub */}
        <div style={{ position: 'absolute', top: '120px', left: '720px', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
          <div style={{ 
            width: '42px', 
            height: '42px', 
            borderRadius: '50%', 
            background: 'rgba(16, 185, 129, 0.2)', 
            border: '2px solid #10b981', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 6px',
            boxShadow: '0 0 20px #10b981'
          }}>
            <Building2 size={20} color="#10b981" />
          </div>
          <div style={{ background: 'rgba(7, 10, 18, 0.9)', padding: '0.3rem 0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16, 185, 129, 0.4)', fontSize: '0.72rem', fontWeight: 700, color: '#34d399' }}>
            Apex Cryogenic Hub (-80°C)
          </div>
          <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Capacity: 8,500 L Available</div>
        </div>

        {/* Facility Node 2: St. Jude Trauma */}
        <div style={{ position: 'absolute', top: '80px', left: '440px', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
          <div style={{ 
            width: '38px', 
            height: '38px', 
            borderRadius: '50%', 
            background: 'rgba(99, 102, 241, 0.2)', 
            border: '2px solid #6366f1', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 6px'
          }}>
            <Shield size={18} color="#818cf8" />
          </div>
          <div style={{ background: 'rgba(7, 10, 18, 0.9)', padding: '0.25rem 0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(99, 102, 241, 0.4)', fontSize: '0.72rem', fontWeight: 600, color: '#c7d2fe' }}>
            St. Jude Trauma Center
          </div>
          <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>8 ICU Beds Free</div>
        </div>

        {/* Mobile Vehicle Node: Mobile Reefer Van 04 */}
        <div style={{ position: 'absolute', top: '190px', left: '120px', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
          <div style={{ 
            width: '42px', 
            height: '42px', 
            borderRadius: '50%', 
            background: 'rgba(239, 68, 68, 0.25)', 
            border: '2px solid #ef4444', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 6px',
            boxShadow: '0 0 25px rgba(239, 68, 68, 0.6)',
            animation: 'pulseAnimation 1.5s infinite'
          }}>
            <Truck size={20} color="#f87171" />
          </div>
          <div style={{ background: 'rgba(7, 10, 18, 0.95)', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(239, 68, 68, 0.4)', fontSize: '0.74rem', fontWeight: 700, color: '#f87171' }}>
            Mobile Reefer #AZ-409 [THERMAL EXCURSION]
          </div>
          <div style={{ fontSize: '0.7rem', color: '#fed7aa', fontWeight: 600 }}>Chamber: -14.2°C • Diverting (ETA: 11 min)</div>
        </div>

        {/* Live GPS Telemetry Box Overlay */}
        <div style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(8px)',
          padding: '0.65rem 1rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          fontSize: '0.75rem',
          color: '#cbd5e1',
          display: 'flex',
          gap: '1.25rem'
        }}>
          <div><strong>Origin Coordinates:</strong> 18.5312° N, 73.8445° E</div>
          <div><strong>Distance to Cryo Hub:</strong> 14.8 km</div>
          <div><strong>Google Maps Traffic Clearance:</strong> <span style={{ color: '#34d399' }}>SIREN GREEN CORRIDOR</span></div>
        </div>
      </div>

      {/* Facilities Table */}
      <div style={{ marginTop: '1.75rem' }}>
        <h4 style={{ fontSize: '0.95rem', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <Building2 size={16} color="#6366f1" />
          <span>Regional Certified Bio-Facilities Directory</span>
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {facilities.map((fac) => (
            <div key={fac.id} style={{ 
              background: 'rgba(255, 255, 255, 0.02)', 
              border: '1px solid var(--border-subtle)', 
              borderRadius: 'var(--radius-md)', 
              padding: '1rem' 
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#ffffff' }}>{fac.name}</span>
                <span className="badge badge-resolved" style={{ fontSize: '0.68rem' }}>
                  {fac.coldChainTier}
                </span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.65rem' }}>
                {fac.address}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <span>Storage Cap: <strong style={{ color: '#38bdf8' }}>{fac.availableCapacityLiters} L</strong></span>
                <span>ICU Beds: <strong style={{ color: '#34d399' }}>{fac.icuBedsAvailable}</strong></span>
                <span>Radio: <strong>{fac.contactRadio}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
