'use client';

import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Loader2, Image, Play, Pause, RotateCcw, Clock, CheckCircle, XCircle, AlertCircle, Send, Sparkles, Copy, X } from 'lucide-react';
import { ADMIN } from './admin-constants';
import { useDemoToast } from './demo-toast';
import { getInitialPosts } from '../../lib/admin-panel-demo/fixtures';

const STATUS_CONFIG = {
  draft: { label: 'Borrador', color: ADMIN.primary, icon: AlertCircle },
  scheduled: { label: 'Programado', color: ADMIN.secondary, icon: Clock },
  published: { label: 'Publicado', color: '#16a34a', icon: CheckCircle },
  failed: { label: 'Fallido', color: '#dc2626', icon: XCircle },
  paused: { label: 'Pausado', color: ADMIN.accent, icon: Pause },
};

function pad2(n) { return String(n).padStart(2, '0'); }

function fromLocalInputValue(localStr) {
  if (!localStr) return null;
  const d = new Date(localStr);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

function todayLocalDate() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function toLocalDateString(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function toLocalTimeString(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  if (Number.isNaN(d.getTime())) return '';
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function useIsNarrow(breakpoint) {
  const [isNarrow, setIsNarrow] = useState(false);
  useEffect(() => {
    const check = () => setIsNarrow(window.innerWidth < breakpoint);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [breakpoint]);
  return isNarrow;
}

function SchedulePicker({ post, disabled, onCommit }) {
  const initialDate = post.scheduled_for ? toLocalDateString(post.scheduled_for) : todayLocalDate();
  const initialTime = post.scheduled_for ? toLocalTimeString(post.scheduled_for) : '';
  const [dateVal, setDateVal] = useState(initialDate);
  const [timeVal, setTimeVal] = useState(initialTime);

  function tryCommit(newDate, newTime) {
    if (!newDate || !newTime) {
      onCommit(null);
      return;
    }
    onCommit(`${newDate}T${newTime}`);
  }

  return (
    <>
      <input
        type="date"
        value={dateVal}
        min={todayLocalDate()}
        onChange={e => {
          const v = e.target.value;
          setDateVal(v);
          tryCommit(v, timeVal);
        }}
        disabled={disabled}
        style={{
          fontFamily: 'inherit', fontSize: '11px',
          color: 'var(--rf-text)', backgroundColor: 'var(--rf-card-bg)',
          border: '1px solid var(--rf-border)', borderRadius: '4px',
          padding: '2px 6px',
        }}
      />
      <input
        type="time"
        step="60"
        value={timeVal}
        onChange={e => {
          const v = e.target.value;
          setTimeVal(v);
          tryCommit(dateVal, v);
        }}
        disabled={disabled}
        style={{
          fontFamily: 'inherit', fontSize: '11px',
          color: 'var(--rf-text)', backgroundColor: 'var(--rf-card-bg)',
          border: '1px solid var(--rf-border)', borderRadius: '4px',
          padding: '2px 6px',
          marginLeft: '4px',
        }}
      />
      {post.scheduled_for && (
        <span
          title="Programado — en cola para publicar"
          style={{
            display: 'inline-flex', alignItems: 'center',
            marginLeft: '6px', color: '#16a34a',
          }}
        >
          <CheckCircle size={14} strokeWidth={2.5} />
        </span>
      )}
    </>
  );
}

function uuidShort(uuid) {
  if (!uuid || typeof uuid !== 'string') return '';
  return uuid.slice(0, 8);
}

export default function DemoAdminPosts() {
  const { showToast } = useDemoToast();
  const [posts, setPosts] = useState(() => getInitialPosts());
  const [regenDialog, setRegenDialog] = useState(null);
  const [regenLoading, setRegenLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [regenerating, setRegenerating] = useState({});
  const [publishing, setPublishing] = useState({});
  const [generating, setGenerating] = useState(false);
  const [copiedUuid, setCopiedUuid] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const isMobile = useIsNarrow(768);

  useEffect(() => {
    function onBgUpdated(e) {
      const { postUuid, bgUrl } = e.detail || {};
      if (!postUuid || !bgUrl) return;
      setPosts(prev => prev.map(p =>
        String(p.uuid) === String(postUuid)
          ? { ...p, bg_image_url: bgUrl, updated_at: new Date().toISOString() }
          : p
      ));
    }
    window.addEventListener('apd-bg-updated', onBgUpdated);
    return () => window.removeEventListener('apd-bg-updated', onBgUpdated);
  }, []);

  function handlePausePost(postUuid) {
    setPosts(prev => prev.map(p =>
      String(p.uuid) === String(postUuid)
        ? { ...p, status: 'paused', updated_at: new Date().toISOString() }
        : p
    ));
    showToast('Demo — pausado. En producción, el train lo saltaría hasta reanudar.');
  }

  function handleResumePost(postUuid) {
    setPosts(prev => prev.map(p =>
      String(p.uuid) === String(postUuid)
        ? { ...p, status: 'draft', updated_at: new Date().toISOString() }
        : p
    ));
    showToast('Demo — reanudado. El post vuelve a estar elegible para el train.');
  }

  function handlePublish(postUuid) {
    setErrors(prev => ({ ...prev, [postUuid]: null }));
    setPublishing(prev => ({ ...prev, [postUuid]: true }));
    showToast('Demo — en producción esto dispara la publicación (upload-post a FB + IG) ahora mismo.');

    setTimeout(() => {
      setPosts(prev => prev.map(p => {
        if (String(p.uuid) !== String(postUuid)) return p;
        const platforms = p.target_platforms || [];
        const status = {};
        for (const pl of platforms) {
          status[pl] = {
            status: 'published',
            post_url: pl === 'facebook'
              ? `https://facebook.com/demo/post/${p.uuid.slice(0, 6)}`
              : `https://instagram.com/p/demo_${p.uuid.slice(0, 6)}`,
            request_id: `${pl}_demo_${p.uuid.slice(0, 6)}`,
          };
        }
        return {
          ...p,
          status: 'published',
          platform_status: status,
          updated_at: new Date().toISOString(),
        };
      }));
      setPublishing(prev => {
        const next = { ...prev };
        delete next[postUuid];
        return next;
      });
    }, 1800);
  }

  function openRegenDialog(postUuid) {
    setRegenDialog(postUuid);
  }

  function handleRegenerate(keepBackground) {
    if (!regenDialog) return;
    const postUuid = regenDialog;
    setRegenLoading(true);
    setRegenerating(prev => ({ ...prev, [postUuid]: true }));
    showToast(
      keepBackground
        ? 'Demo — regenerando texto (manteniendo background).'
        : 'Demo — regenerando texto + background. Usa Claude + DALL-E en producción.'
    );

    setTimeout(() => {
      setPosts(prev => prev.map(p =>
        String(p.uuid) === String(postUuid)
          ? {
              ...p,
              post_text: p.post_text + '\n\n(regenerado — demo)',
              updated_at: new Date().toISOString(),
            }
          : p
      ));
      setRegenerating(prev => {
        const next = { ...prev };
        delete next[postUuid];
        return next;
      });
      setRegenLoading(false);
      setRegenDialog(null);
    }, 1500);
  }

  function handleGenerate(count = 3) {
    setGenerating(true);
    showToast(`Demo — en producción invoca un workflow de n8n que genera ${count} borradores con Claude + DALL-E (~3min).`);

    setTimeout(() => {
      const thumbs = [
        '/admin-panel-demo/thumbnails/post-sample-1.svg',
        '/admin-panel-demo/thumbnails/post-sample-2.svg',
        '/admin-panel-demo/thumbnails/post-sample-3.svg',
      ];
      const sampleContent = [
        {
          headline: 'Protege lo que más quieres sin complicaciones',
          product: 'Seguro de Vida',
          text: 'Un trámite 100% digital, sin exámenes, con cobertura hasta 2M.',
        },
        {
          headline: 'Tu salud es lo primero — cúbrela bien',
          product: 'Seguro Médico',
          text: 'Acceso a hospitales de primer nivel y sin deducibles ocultos.',
        },
        {
          headline: 'La mejor herencia que puedes dejar es educación',
          product: 'Becas',
          text: 'Un plan de becas educativas que crece con tu hijo hasta la universidad.',
        },
      ];
      const seed = Date.now();
      const newOnes = Array.from({ length: count }, (_, i) => {
        const c = sampleContent[i % sampleContent.length];
        return {
          uuid: `demo-gen-${seed}-${i}-${Math.random().toString(16).slice(2, 8)}`,
          headline: c.headline,
          product: c.product,
          post_text: c.text,
          status: 'draft',
          scheduled_for: null,
          target_platforms: ['facebook', 'instagram'],
          bg_image_url: thumbs[i % thumbs.length],
          platform_status: {},
          updated_at: new Date().toISOString(),
        };
      });
      setPosts(prev => [...newOnes, ...prev]);
      setGenerating(false);
    }, 1500);
  }

  function handlePlatformsChange(postUuid, nextPlatforms) {
    setPosts(prev => prev.map(p =>
      String(p.uuid) === String(postUuid)
        ? { ...p, target_platforms: nextPlatforms, updated_at: new Date().toISOString() }
        : p
    ));
  }

  function handleScheduleChange(postUuid, localValue) {
    setErrors(prev => ({ ...prev, [postUuid]: null }));
    const scheduledFor = fromLocalInputValue(localValue);
    if (scheduledFor && new Date(scheduledFor).getTime() < Date.now() - 60_000) {
      setErrors(prev => ({ ...prev, [postUuid]: 'No se puede programar en el pasado' }));
      return;
    }
    setPosts(prev => prev.map(p =>
      String(p.uuid) === String(postUuid)
        ? { ...p, scheduled_for: scheduledFor, updated_at: new Date().toISOString() }
        : p
    ));
  }

  function handleDelete() {
    if (!deleteDialog) return;
    const postUuid = deleteDialog;
    setDeleteLoading(true);
    setTimeout(() => {
      setPosts(prev => prev.filter(p => String(p.uuid) !== String(postUuid)));
      setDeleteLoading(false);
      setDeleteDialog(null);
      showToast('Demo — post eliminado (también borraría el blob de Luna en producción).');
    }, 400);
  }

  const copyUuid = useCallback(async (uuid) => {
    try {
      await navigator.clipboard.writeText(uuid);
      setCopiedUuid(uuid);
      setTimeout(() => setCopiedUuid(null), 1500);
    } catch {}
  }, []);

  useEffect(() => {
    const timers = [];
    for (const [postUuid, msg] of Object.entries(errors)) {
      if (!msg) continue;
      const t = setTimeout(() => {
        setErrors(prev => (prev[postUuid] === msg ? { ...prev, [postUuid]: null } : prev));
      }, 6000);
      timers.push(t);
    }
    return () => timers.forEach(clearTimeout);
  }, [errors]);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
        <Image size={20} style={{ color: ADMIN.primary }} />
        <h2 style={{
          fontFamily: 'var(--rf-font-display)', fontSize: '16px',
          fontWeight: 600, color: 'var(--rf-text)', margin: 0,
        }}>
          Posts de Facebook + Instagram
        </h2>
        <button
          onClick={() => showToast('Demo — en producción refrescaría la lista desde la DB.')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
            color: ADMIN.primary, display: 'flex',
          }}>
          <RefreshCw size={14} />
        </button>

        <button
          onClick={() => handleGenerate(3)}
          disabled={generating}
          style={{
            marginLeft: 'auto',
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            fontFamily: 'var(--rf-font-body)', fontSize: '12px', fontWeight: 700,
            color: 'white', backgroundColor: '#1877F2',
            border: 'none', borderRadius: '6px',
            padding: '8px 14px',
            cursor: generating ? 'not-allowed' : 'pointer',
            opacity: generating ? 0.7 : 1,
          }}
        >
          {generating ? (
            <>
              <Loader2 size={12} style={{ animation: 'rf-spin 1s linear infinite' }} />
              Generando…
            </>
          ) : (
            <>
              <Sparkles size={12} /> Generar 3 posts nuevos
            </>
          )}
        </button>
      </div>
      <p style={{
        fontFamily: 'var(--rf-font-body)', fontSize: '13px',
        color: 'var(--rf-text-muted)', margin: '0 0 20px', lineHeight: 1.5,
      }}>
        Posts generados para redes sociales. Asigna una hora de publicación o presiona &quot;Postear ya&quot; para publicar de inmediato.
      </p>

      {posts.length === 0 ? (
        <p style={{
          fontFamily: 'var(--rf-font-body)', fontSize: '14px',
          color: 'var(--rf-text-muted)', textAlign: 'center', padding: '32px 0',
        }}>
          No hay posts pendientes. Presiona &quot;Generar 3 posts nuevos&quot; para crear contenido.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {posts.map(post => {
              const statusCfg = STATUS_CONFIG[post.status] || STATUS_CONFIG.draft;
              const StatusIcon = statusCfg.icon;

              const isBusy = Boolean(regenerating[post.uuid] || publishing[post.uuid]);
              const busyLabel = publishing[post.uuid] ? 'Publicando…' : 'Regenerando…';
              const errorMsg = errors[post.uuid];
              const shortId = uuidShort(post.uuid);
              const thumbnail = post.bg_image_url || '/admin-panel-demo/thumbnails/post-sample-1.svg';

              return (
                <div key={post.uuid} style={{
                  padding: '16px', borderRadius: '10px',
                  backgroundColor: ADMIN.surface,
                  border: `1px solid ${ADMIN.border}`,
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: '16px',
                  position: 'relative',
                }}>
                  <button
                    onClick={() => setDeleteDialog(post.uuid)}
                    disabled={isBusy}
                    title="Eliminar post"
                    aria-label="Eliminar post"
                    style={{
                      position: 'absolute', top: '8px', right: '8px',
                      width: '22px', height: '22px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      backgroundColor: 'rgba(220, 38, 38, 0.08)',
                      color: 'rgba(220, 38, 38, 0.55)',
                      border: '1px solid rgba(220, 38, 38, 0.25)',
                      borderRadius: '50%', cursor: isBusy ? 'not-allowed' : 'pointer',
                      padding: 0,
                      zIndex: 4,
                      transition: 'all 150ms',
                    }}
                  >
                    <X size={12} strokeWidth={2.5} />
                  </button>
                  <div style={{
                    width: isMobile ? '100%' : '160px',
                    height: isMobile ? 'auto' : '200px',
                    aspectRatio: isMobile ? '4 / 5' : undefined,
                    maxHeight: isMobile ? '260px' : 'none',
                    flexShrink: 0,
                    borderRadius: '8px', overflow: 'hidden',
                    backgroundColor: 'var(--rf-card-bg)',
                    border: '1px solid var(--rf-border)',
                  }}>
                    <img
                      src={thumbnail}
                      alt={post.headline}
                      width={160}
                      height={200}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>

                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        fontFamily: 'var(--rf-font-body)', fontSize: '11px', fontWeight: 600,
                        color: statusCfg.color, backgroundColor: `${statusCfg.color}15`,
                        padding: '2px 8px', borderRadius: '4px',
                      }}>
                        <StatusIcon size={10} />
                        {statusCfg.label}
                      </span>

                      <button
                        onClick={() => copyUuid(post.uuid)}
                        title={`Copiar UUID: ${post.uuid}`}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          fontFamily: 'var(--rf-font-mono, monospace)', fontSize: '10px', fontWeight: 600,
                          color: 'var(--rf-text-muted)', backgroundColor: 'var(--rf-card-bg)',
                          border: '1px solid var(--rf-border)', borderRadius: '4px',
                          padding: '2px 6px', cursor: 'pointer',
                        }}
                      >
                        <Copy size={9} />
                        #{shortId}
                        {copiedUuid === post.uuid && <span style={{ color: '#16a34a' }}>copiado</span>}
                      </button>

                      <label style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        fontFamily: 'var(--rf-font-body)', fontSize: '11px',
                        color: 'var(--rf-text-muted)',
                      }}>
                        <Clock size={10} />
                        <SchedulePicker
                          key={`${post.uuid}-${post.scheduled_for || 'null'}`}
                          post={post}
                          disabled={isBusy || post.status === 'published'}
                          onCommit={localValue => handleScheduleChange(post.uuid, localValue)}
                        />
                      </label>

                      <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                        fontFamily: 'var(--rf-font-body)', fontSize: '11px',
                        color: 'var(--rf-text-muted)',
                      }}>
                        <label style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <input
                            type="checkbox"
                            checked={post.target_platforms?.includes('facebook') ?? false}
                            disabled={isBusy || post.status === 'published'}
                            onChange={(e) => {
                              const current = post.target_platforms || [];
                              const next = e.target.checked
                                ? [...new Set([...current, 'facebook'])]
                                : current.filter(p => p !== 'facebook');
                              handlePlatformsChange(post.uuid, next);
                            }}
                            style={{ cursor: 'pointer', margin: 0 }}
                          />
                          FB
                        </label>
                        <label style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <input
                            type="checkbox"
                            checked={post.target_platforms?.includes('instagram') ?? false}
                            disabled={isBusy || post.status === 'published'}
                            onChange={(e) => {
                              const current = post.target_platforms || [];
                              const next = e.target.checked
                                ? [...new Set([...current, 'instagram'])]
                                : current.filter(p => p !== 'instagram');
                              handlePlatformsChange(post.uuid, next);
                            }}
                            style={{ cursor: 'pointer', margin: 0 }}
                          />
                          IG
                        </label>
                      </div>

                      {post.platform_status && (() => {
                        const entries = Object.entries(post.platform_status);
                        const items = entries.map(([platform, val]) => {
                          const state = typeof val === 'string' ? val : val?.status;
                          const postUrl = typeof val === 'object' ? val?.post_url : null;
                          return { platform, state, postUrl };
                        });
                        const hasNonPublished = items.some(i => i.state && i.state !== 'published');
                        if (!hasNonPublished && items.length === 0) return null;
                        return items.map(({ platform, state, postUrl }) => {
                          const isPublished = state === 'published';
                          const isPending = state === 'pending';
                          const bg = isPublished
                            ? 'rgba(22, 163, 74, 0.12)'
                            : isPending
                              ? 'rgba(234, 179, 8, 0.14)'
                              : 'rgba(220, 38, 38, 0.12)';
                          const color = isPublished
                            ? '#16a34a'
                            : isPending
                              ? '#b45309'
                              : '#dc2626';
                          const icon = isPublished ? '✓' : isPending ? '⏳' : '✗';
                          const label = platform === 'facebook' ? 'FB' : platform === 'instagram' ? 'IG' : platform;
                          const content = (
                            <span style={{
                              fontSize: '10px', padding: '1px 6px', borderRadius: '3px',
                              backgroundColor: bg, color, fontWeight: 600, textTransform: 'uppercase',
                              display: 'inline-flex', alignItems: 'center', gap: '3px',
                            }}>
                              {label} {icon}
                            </span>
                          );
                          if (postUrl) {
                            return (
                              <a
                                key={platform}
                                onClick={(e) => { e.preventDefault(); showToast('Demo — este link apuntaría al post real en FB/IG.'); }}
                                href="#"
                                style={{ textDecoration: 'none' }}
                              >
                                {content}
                              </a>
                            );
                          }
                          return <span key={platform}>{content}</span>;
                        });
                      })()}
                    </div>

                    <span style={{
                      fontFamily: 'var(--rf-font-body)', fontSize: '11px', fontWeight: 600,
                      color: ADMIN.primary, textTransform: 'uppercase', letterSpacing: '1px',
                    }}>
                      {post.product}
                    </span>

                    <p style={{
                      fontFamily: 'var(--rf-font-display)', fontSize: '14px',
                      fontWeight: 600, color: 'var(--rf-text)', margin: 0, lineHeight: 1.3,
                    }}>
                      {post.headline}
                    </p>

                    <p style={{
                      fontFamily: 'var(--rf-font-body)', fontSize: '12px',
                      color: 'var(--rf-text-muted)', margin: 0, lineHeight: 1.4,
                      whiteSpace: 'pre-wrap',
                    }}>
                      {post.post_text}
                    </p>

                    <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', flexWrap: 'wrap' }}>
                      {(() => {
                        const hasPlatforms = (post.target_platforms?.length || 0) > 0;
                        const publishDisabled = isBusy || !hasPlatforms || post.status === 'published';
                        return (
                          <button
                            onClick={() => handlePublish(post.uuid)}
                            disabled={publishDisabled}
                            title={!hasPlatforms ? 'Activa al menos una plataforma' : undefined}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: '6px',
                              fontFamily: 'var(--rf-font-body)', fontSize: '12px', fontWeight: 700,
                              color: 'white', backgroundColor: '#1877F2',
                              border: 'none', borderRadius: '6px',
                              padding: '6px 14px',
                              cursor: publishDisabled ? 'not-allowed' : 'pointer',
                              opacity: publishDisabled ? 0.5 : 1,
                              animation: publishDisabled ? 'none' : 'fb-glow-pulse 2.5s ease-in-out infinite',
                            }}
                          >
                            <Send size={12} /> Postear ya
                          </button>
                        );
                      })()}
                      {post.status === 'draft' && (
                        <button
                          onClick={() => handlePausePost(post.uuid)}
                          disabled={isBusy}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            fontFamily: 'var(--rf-font-body)', fontSize: '12px', fontWeight: 600,
                            color: ADMIN.accent, backgroundColor: 'transparent',
                            border: `1px solid ${ADMIN.accent}`, borderRadius: '6px',
                            padding: '6px 14px',
                            cursor: isBusy ? 'not-allowed' : 'pointer',
                            opacity: isBusy ? 0.5 : 1,
                          }}
                        >
                          <Pause size={12} /> Pausar
                        </button>
                      )}
                      {post.status === 'paused' && (
                        <button
                          onClick={() => handleResumePost(post.uuid)}
                          disabled={isBusy}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            fontFamily: 'var(--rf-font-body)', fontSize: '12px', fontWeight: 600,
                            color: 'white', backgroundColor: ADMIN.secondary,
                            border: 'none', borderRadius: '6px',
                            padding: '6px 14px',
                            cursor: isBusy ? 'not-allowed' : 'pointer',
                            opacity: isBusy ? 0.5 : 1,
                          }}
                        >
                          <Play size={12} /> Reanudar
                        </button>
                      )}
                      <button
                        onClick={() => openRegenDialog(post.uuid)}
                        disabled={isBusy || post.status === 'published'}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '6px',
                          fontFamily: 'var(--rf-font-body)', fontSize: '12px', fontWeight: 600,
                          color: 'var(--rf-text-muted)', backgroundColor: 'transparent',
                          border: '1px solid var(--rf-border)', borderRadius: '6px',
                          padding: '6px 14px',
                          cursor: (isBusy || post.status === 'published') ? 'not-allowed' : 'pointer',
                          opacity: (isBusy || post.status === 'published') ? 0.5 : 1,
                        }}
                      >
                        <RotateCcw size={12} /> Regenerar
                      </button>
                    </div>

                    {errorMsg && (
                      <p style={{
                        fontFamily: 'var(--rf-font-body)', fontSize: '11px',
                        color: '#dc2626', margin: '8px 0 0',
                        padding: '6px 10px', lineHeight: 1.4,
                        backgroundColor: 'rgba(220, 38, 38, 0.08)',
                        borderRadius: '4px',
                        border: '1px solid rgba(220, 38, 38, 0.25)',
                      }}>
                        {errorMsg}
                      </p>
                    )}
                  </div>

                  {isBusy && (
                    <div style={{
                      position: 'absolute', inset: 0,
                      backgroundColor: 'rgba(0, 0, 0, 0.65)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexDirection: 'column', gap: '8px',
                      borderRadius: '10px',
                      zIndex: 5,
                      backdropFilter: 'blur(1px)',
                    }}>
                      <Loader2 size={24} style={{ color: ADMIN.primary, animation: 'rf-spin 1s linear infinite' }} />
                      <span style={{
                        fontFamily: 'var(--rf-font-body)', fontSize: '12px',
                        fontWeight: 600, color: 'white',
                      }}>
                        {busyLabel}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}

      {deleteDialog && (
        <div style={{
          position: 'fixed', inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
        }} onClick={() => !deleteLoading && setDeleteDialog(null)}>
          <div
            onClick={e => e.stopPropagation()}
            style={{
              backgroundColor: 'var(--rf-card-bg)',
              border: `1px solid ${ADMIN.border}`,
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '400px',
              width: '90%',
            }}
          >
            <h3 style={{
              fontFamily: 'var(--rf-font-display)', fontSize: '16px',
              fontWeight: 600, color: 'var(--rf-text)', margin: '0 0 8px',
            }}>
              ¿Eliminar este post?
            </h3>
            <p style={{
              fontFamily: 'var(--rf-font-body)', fontSize: '13px',
              color: 'var(--rf-text-muted)', margin: '0 0 20px', lineHeight: 1.5,
            }}>
              Esta acción es permanente. El post se borra de la base de datos y no se puede recuperar.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  fontFamily: 'var(--rf-font-body)', fontSize: '13px', fontWeight: 700,
                  color: 'white', backgroundColor: '#dc2626',
                  border: 'none', borderRadius: '8px',
                  padding: '12px 16px', cursor: deleteLoading ? 'not-allowed' : 'pointer',
                  opacity: deleteLoading ? 0.7 : 1,
                }}
              >
                {deleteLoading ? <Loader2 size={14} style={{ animation: 'rf-spin 1s linear infinite' }} /> : <X size={14} />}
                Sí, eliminar
              </button>
              <button
                onClick={() => setDeleteDialog(null)}
                disabled={deleteLoading}
                style={{
                  fontFamily: 'var(--rf-font-body)', fontSize: '13px',
                  color: 'var(--rf-text-muted)', backgroundColor: 'transparent',
                  border: 'none', padding: '8px', cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {regenDialog && (
        <div style={{
          position: 'fixed', inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
        }} onClick={() => !regenLoading && setRegenDialog(null)}>
          <div
            onClick={e => e.stopPropagation()}
            style={{
              backgroundColor: 'var(--rf-card-bg)',
              border: `1px solid ${ADMIN.border}`,
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '400px',
              width: '90%',
            }}
          >
            <h3 style={{
              fontFamily: 'var(--rf-font-display)', fontSize: '16px',
              fontWeight: 600, color: 'var(--rf-text)', margin: '0 0 8px',
            }}>
              Regenerar post
            </h3>
            <p style={{
              fontFamily: 'var(--rf-font-body)', fontSize: '13px',
              color: 'var(--rf-text-muted)', margin: '0 0 20px', lineHeight: 1.5,
            }}>
              ¿Quieres conservar la imagen de background actual?
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={() => handleRegenerate(true)}
                disabled={regenLoading}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  fontFamily: 'var(--rf-font-body)', fontSize: '13px', fontWeight: 600,
                  color: ADMIN.primary, backgroundColor: ADMIN.surface,
                  border: `1px solid ${ADMIN.border}`, borderRadius: '8px',
                  padding: '12px 16px', cursor: 'pointer', textAlign: 'left',
                }}
              >
                {regenLoading ? <Loader2 size={14} style={{ animation: 'rf-spin 1s linear infinite' }} /> : <Image size={14} />}
                Sí, solo regenerar texto
              </button>
              <button
                onClick={() => handleRegenerate(false)}
                disabled={regenLoading}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  fontFamily: 'var(--rf-font-body)', fontSize: '13px', fontWeight: 600,
                  color: ADMIN.accent, backgroundColor: 'transparent',
                  border: `1px solid ${ADMIN.accent}`, borderRadius: '8px',
                  padding: '12px 16px', cursor: 'pointer', textAlign: 'left',
                }}
              >
                {regenLoading ? <Loader2 size={14} style={{ animation: 'rf-spin 1s linear infinite' }} /> : <RotateCcw size={14} />}
                No, regenerar todo
              </button>
              <button
                onClick={() => setRegenDialog(null)}
                disabled={regenLoading}
                style={{
                  fontFamily: 'var(--rf-font-body)', fontSize: '13px',
                  color: 'var(--rf-text-muted)', backgroundColor: 'transparent',
                  border: 'none', padding: '8px', cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
