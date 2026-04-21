'use client';

import { useState } from 'react';
import { RefreshCw, Loader2, GitMerge, Check, X } from 'lucide-react';
import { ADMIN } from './admin-constants';
import { useDemoToast } from './demo-toast';
import { getInitialMergeRequests } from '../../lib/admin-panel-demo/fixtures';

export default function DemoAdminMergeContacts() {
  const { showToast } = useDemoToast();
  const [mergeRequests, setMergeRequests] = useState(() => getInitialMergeRequests());
  const [mergeSelections, setMergeSelections] = useState({});
  const [mergeActionLoading, setMergeActionLoading] = useState(null);

  function selectField(mergeId, field, choice) {
    setMergeSelections(prev => ({
      ...prev,
      [mergeId]: { ...(prev[mergeId] || {}), [field]: choice },
    }));
  }

  function executeMerge(mergeId) {
    setMergeActionLoading(mergeId);
    setTimeout(() => {
      setMergeRequests(prev => prev.filter(r => r._id !== mergeId));
      setMergeSelections(prev => {
        const next = { ...prev };
        delete next[mergeId];
        return next;
      });
      setMergeActionLoading(null);
      showToast('Demo — usuarios fusionados. En producción, dispara n8n admin service con los valores elegidos.');
    }, 500);
  }

  function dismissMerge(mergeId) {
    setMergeActionLoading(mergeId);
    setTimeout(() => {
      setMergeRequests(prev => prev.filter(r => r._id !== mergeId));
      setMergeActionLoading(null);
      showToast('Demo — solicitud descartada. En producción marca el merge request como ignorado.');
    }, 400);
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
        <GitMerge size={20} style={{ color: ADMIN.accent }} />
        <h2 style={{
          fontFamily: 'var(--rf-font-display)', fontSize: '16px',
          fontWeight: 600, color: 'var(--rf-text)', margin: 0,
        }}>
          Solicitudes de Merge
        </h2>
        <button
          onClick={() => showToast('Demo — en producción refrescaría las solicitudes pendientes.')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
            color: ADMIN.accent, display: 'flex',
          }}>
          <RefreshCw size={14} />
        </button>
      </div>
      <p style={{
        fontFamily: 'var(--rf-font-body)', fontSize: '13px',
        color: 'var(--rf-text-muted)', margin: '0 0 20px', lineHeight: 1.5,
      }}>
        Cuando se detecta un email en común entre usuarios de distintos canales, aparece aquí para que decidas cómo fusionar sus datos.
      </p>

      {mergeRequests.length === 0 ? (
        <p style={{
          fontFamily: 'var(--rf-font-body)', fontSize: '14px',
          color: 'var(--rf-text-muted)', textAlign: 'center', padding: '32px 0',
        }}>
          No hay solicitudes de merge pendientes
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {mergeRequests.map(req => {
            const selections = mergeSelections[req._id] || {};
            const allConflictsResolved = req.conflicts.every(c => selections[c.field]);
            return (
              <div key={req._id} style={{
                padding: '16px', borderRadius: '10px',
                backgroundColor: ADMIN.surface,
                border: `1px solid ${ADMIN.border}`,
              }}>
                <div style={{ marginBottom: '12px' }}>
                  <p style={{
                    fontFamily: 'var(--rf-font-display)', fontSize: '14px',
                    fontWeight: 600, color: 'var(--rf-text)', margin: '0 0 4px',
                  }}>
                    Posible cuenta duplicada
                  </p>
                  <p style={{
                    fontFamily: 'var(--rf-font-body)', fontSize: '13px',
                    color: 'var(--rf-text-muted)', margin: 0,
                  }}>
                    Email en común: <strong style={{ color: ADMIN.primary }}>{req.matchedValue}</strong>
                  </p>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <span style={{
                      fontFamily: 'var(--rf-font-body)', fontSize: '11px', fontWeight: 600,
                      color: ADMIN.primary, backgroundColor: 'rgba(8,145,178,0.1)',
                      padding: '2px 8px', borderRadius: '4px',
                    }}>
                      A: {req.sourceA || 'website'}
                    </span>
                    <span style={{
                      fontFamily: 'var(--rf-font-body)', fontSize: '11px', fontWeight: 600,
                      color: ADMIN.accent, backgroundColor: 'rgba(178,8,145,0.1)',
                      padding: '2px 8px', borderRadius: '4px',
                    }}>
                      B: {req.sourceB || 'instagram'}
                    </span>
                  </div>
                </div>

                {req.conflicts.length > 0 && (
                  <div style={{ marginBottom: '12px' }}>
                    <p style={{
                      fontFamily: 'var(--rf-font-body)', fontSize: '12px', fontWeight: 600,
                      color: 'var(--rf-text)', margin: '0 0 8px',
                    }}>
                      Campos en conflicto — elige cuál prevalece:
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {req.conflicts.map(conflict => (
                        <div key={conflict.field} style={{
                          display: 'flex', alignItems: 'center', gap: '8px',
                          padding: '8px 10px', borderRadius: '6px',
                          backgroundColor: 'var(--rf-card-bg)',
                          border: '1px solid var(--rf-border)',
                        }}>
                          <span style={{
                            fontFamily: 'var(--rf-font-body)', fontSize: '12px', fontWeight: 600,
                            color: 'var(--rf-text-muted)', width: '100px', flexShrink: 0,
                          }}>
                            {conflict.field}
                          </span>
                          <button
                            onClick={() => selectField(req._id, conflict.field, 'A')}
                            style={{
                              flex: 1, padding: '6px 10px', borderRadius: '4px',
                              fontFamily: 'var(--rf-font-body)', fontSize: '12px',
                              border: `2px solid ${selections[conflict.field] === 'A' ? ADMIN.primary : 'transparent'}`,
                              backgroundColor: selections[conflict.field] === 'A' ? 'rgba(8,145,178,0.1)' : 'var(--rf-surface)',
                              color: 'var(--rf-text)', cursor: 'pointer',
                              textAlign: 'left', transition: 'all 0.15s ease',
                            }}
                          >
                            {String(conflict.valueA ?? 'null')}
                          </button>
                          <button
                            onClick={() => selectField(req._id, conflict.field, 'B')}
                            style={{
                              flex: 1, padding: '6px 10px', borderRadius: '4px',
                              fontFamily: 'var(--rf-font-body)', fontSize: '12px',
                              border: `2px solid ${selections[conflict.field] === 'B' ? ADMIN.accent : 'transparent'}`,
                              backgroundColor: selections[conflict.field] === 'B' ? 'rgba(178,8,145,0.1)' : 'var(--rf-surface)',
                              color: 'var(--rf-text)', cursor: 'pointer',
                              textAlign: 'left', transition: 'all 0.15s ease',
                            }}
                          >
                            {String(conflict.valueB ?? 'null')}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {req.autoMerge?.length > 0 && (
                  <div style={{ marginBottom: '12px' }}>
                    <p style={{
                      fontFamily: 'var(--rf-font-body)', fontSize: '11px',
                      color: 'var(--rf-text-muted)', margin: '0 0 4px',
                    }}>
                      Auto-merge (sin conflicto):
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {req.autoMerge.map(field => (
                        <span key={field} style={{
                          fontFamily: 'var(--rf-font-body)', fontSize: '11px',
                          color: 'var(--rf-text-muted)', backgroundColor: 'var(--rf-surface)',
                          padding: '2px 8px', borderRadius: '4px',
                        }}>
                          {field}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => dismissMerge(req._id)}
                    disabled={mergeActionLoading === req._id}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      fontFamily: 'var(--rf-font-body)', fontSize: '12px', fontWeight: 600,
                      color: 'var(--rf-text-muted)', backgroundColor: 'transparent',
                      border: '1px solid var(--rf-border)', borderRadius: '6px',
                      padding: '8px 16px', cursor: 'pointer',
                    }}
                  >
                    <X size={12} /> Descartar
                  </button>
                  <button
                    onClick={() => executeMerge(req._id)}
                    disabled={mergeActionLoading === req._id || (req.conflicts.length > 0 && !allConflictsResolved)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      fontFamily: 'var(--rf-font-body)', fontSize: '12px', fontWeight: 600,
                      color: 'white',
                      backgroundColor: (req.conflicts.length > 0 && !allConflictsResolved) ? 'var(--rf-border)' : ADMIN.accent,
                      border: 'none', borderRadius: '6px',
                      padding: '8px 16px', cursor: (req.conflicts.length > 0 && !allConflictsResolved) ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {mergeActionLoading === req._id ? (
                      <Loader2 size={12} style={{ animation: 'rf-spin 1s linear infinite' }} />
                    ) : (
                      <><Check size={12} /> Fusionar</>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
