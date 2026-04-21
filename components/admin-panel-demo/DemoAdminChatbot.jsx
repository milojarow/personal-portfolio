'use client';

import { useState } from 'react';
import { Pause, Play, RefreshCw, Loader2, MessageCircle } from 'lucide-react';
import { ADMIN } from './admin-constants';
import { useDemoToast } from './demo-toast';
import { getInitialSessions } from '../../lib/admin-panel-demo/fixtures';

export default function DemoAdminChatbot() {
  const { showToast } = useDemoToast();
  const [sessions, setSessions] = useState(() => getInitialSessions());
  const [actionLoading, setActionLoading] = useState(null);

  function togglePause(sessionId, currentlyPaused) {
    setActionLoading(sessionId);
    setTimeout(() => {
      setSessions(prev => prev.map(s =>
        s.sessionId === sessionId ? { ...s, paused: !currentlyPaused } : s
      ));
      setActionLoading(null);
      showToast(
        currentlyPaused
          ? 'Demo — bot reanudado para esta sesión (en producción, vuelve a responder automáticamente).'
          : 'Demo — bot pausado 24h para esta sesión (en producción, tú respondes personalmente).'
      );
    }, 400);
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
        <MessageCircle size={20} style={{ color: ADMIN.primary }} />
        <h2 style={{
          fontFamily: 'var(--rf-font-display)', fontSize: '16px',
          fontWeight: 600, color: 'var(--rf-text)', margin: 0,
        }}>
          Control del Chatbot de Instagram
        </h2>
        <button
          onClick={() => showToast('Demo — en producción refrescaría las sesiones activas.')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
            color: ADMIN.primary, display: 'flex',
          }}>
          <RefreshCw size={14} />
        </button>
      </div>
      <p style={{
        fontFamily: 'var(--rf-font-body)', fontSize: '13px',
        color: 'var(--rf-text-muted)', margin: '0 0 20px', lineHeight: 1.5,
      }}>
        Pausa el bot para conversaciones específicas cuando necesites responder personalmente. La pausa expira automáticamente después de 24 horas.
      </p>

      {sessions.length === 0 ? (
        <p style={{
          fontFamily: 'var(--rf-font-body)', fontSize: '14px',
          color: 'var(--rf-text-muted)', textAlign: 'center', padding: '32px 0',
        }}>
          No hay sesiones recientes de Instagram
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {sessions.map(session => (
            <div
              key={session.sessionId}
              style={{
                padding: '14px 16px', borderRadius: '8px',
                backgroundColor: session.paused ? 'rgba(178, 8, 145, 0.04)' : ADMIN.surface,
                border: `1px solid ${session.paused ? 'rgba(178, 8, 145, 0.2)' : ADMIN.border}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '10px' }}>
                <p style={{
                  fontFamily: 'var(--rf-font-body)', fontSize: '13px', fontWeight: 600,
                  color: 'var(--rf-text)', margin: 0,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  flex: 1, minWidth: 0,
                }}>
                  {session.sessionId}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  {session.paused && (
                    <span style={{
                      fontFamily: 'var(--rf-font-body)', fontSize: '11px',
                      color: ADMIN.accent, fontWeight: 600,
                    }}>
                      PAUSADO
                    </span>
                  )}
                  <button
                    onClick={() => togglePause(session.sessionId, session.paused)}
                    disabled={actionLoading === session.sessionId}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      fontFamily: 'var(--rf-font-body)', fontSize: '12px', fontWeight: 600,
                      color: session.paused ? ADMIN.secondary : ADMIN.accent,
                      backgroundColor: 'transparent',
                      border: `1px solid ${session.paused ? ADMIN.secondary : ADMIN.accent}`,
                      borderRadius: '6px', padding: '6px 12px', cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {actionLoading === session.sessionId ? (
                      <Loader2 size={12} style={{ animation: 'rf-spin 1s linear infinite' }} />
                    ) : session.paused ? (
                      <><Play size={12} /> Reanudar</>
                    ) : (
                      <><Pause size={12} /> Pausar</>
                    )}
                  </button>
                </div>
              </div>

              {session.messages?.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {session.messages.map((msg, i) => (
                    <div key={i} style={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                      <span style={{
                        fontFamily: 'var(--rf-font-body)', fontSize: '10px', fontWeight: 600,
                        color: msg.type === 'human' ? ADMIN.primary : 'var(--rf-text-muted)',
                        flexShrink: 0, marginTop: '2px', width: '28px',
                      }}>
                        {msg.type === 'human' ? 'USR' : 'BOT'}
                      </span>
                      <p style={{
                        fontFamily: 'var(--rf-font-body)', fontSize: '12px',
                        color: msg.type === 'human' ? 'var(--rf-text)' : 'var(--rf-text-muted)',
                        margin: 0, lineHeight: 1.4,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {msg.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
