'use client';

import { createContext, useCallback, useContext, useRef, useState, useEffect } from 'react';
import { Info } from 'lucide-react';
import { ADMIN } from './admin-constants';

const ToastContext = createContext(null);

let nextId = 0;

export function DemoToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const showToast = useCallback((message, opts = {}) => {
    const id = ++nextId;
    const ttl = opts.ttl ?? 3200;
    setToasts(prev => [...prev, { id, message }]);
    const timer = setTimeout(() => dismiss(id), ttl);
    timers.current.set(id, timer);
    return id;
  }, [dismiss]);

  useEffect(() => () => {
    for (const t of timers.current.values()) clearTimeout(t);
    timers.current.clear();
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, dismiss }}>
      {children}
      <div style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        display: 'flex',
        flexDirection: 'column-reverse',
        gap: '10px',
        zIndex: 99999,
        pointerEvents: 'none',
        maxWidth: '420px',
      }}>
        {toasts.map(t => (
          <div
            key={t.id}
            onClick={() => dismiss(t.id)}
            style={{
              pointerEvents: 'auto',
              padding: '12px 16px',
              borderRadius: '10px',
              backgroundColor: '#0c1d24',
              color: '#e6f4f7',
              border: `1px solid ${ADMIN.border}`,
              boxShadow: '0 12px 32px rgba(0,0,0,0.32)',
              fontFamily: 'var(--apd-font-body)',
              fontSize: '13px',
              fontWeight: 500,
              lineHeight: 1.45,
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              cursor: 'pointer',
              animation: 'apd-toast-in 200ms ease-out',
            }}
          >
            <Info size={15} style={{ color: ADMIN.primary, flexShrink: 0, marginTop: '1px' }} />
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useDemoToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return { showToast: () => {}, dismiss: () => {} };
  }
  return ctx;
}
