'use client';

import { useState, useMemo } from 'react';
import { Mail, RefreshCw } from 'lucide-react';
import { ADMIN } from './admin-constants';
import { useDemoToast } from './demo-toast';
import {
  getInitialEmailConfig,
  getInitialEmailStats,
  getInitialEmailQueue,
  getInitialEmailLog,
  getEmailDetailStub,
} from '../../lib/admin-panel-demo/fixtures';

export default function DemoAdminEmail() {
  const { showToast } = useDemoToast();
  const [config, setConfig] = useState(() => getInitialEmailConfig());
  const [stats] = useState(() => getInitialEmailStats());
  const [queue, setQueue] = useState(() => getInitialEmailQueue());
  const [log] = useState(() => getInitialEmailLog());
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [detailId, setDetailId] = useState(null);

  function patchConfig(patch) {
    setConfig(prev => ({ ...prev, ...patch }));
    if ('auto_send_enabled' in patch) {
      showToast(
        patch.auto_send_enabled
          ? 'Demo — auto-responder ACTIVADO. En producción, el pipeline vuelve a enviar.'
          : 'Demo — auto-responder PAUSADO. En producción, todo se va a la queue pre-classifier.'
      );
    } else {
      showToast('Demo — configuración actualizada (confianza mínima / rate-limit).');
    }
  }

  function sendFromQueue(id) {
    setQueue(prev => prev.filter(q => q.queue_id !== id));
    showToast('Demo — respuesta enviada. En producción dispara SMTP send + registro en email_outbound.');
  }

  function dismissFromQueue(id) {
    setQueue(prev => prev.filter(q => q.queue_id !== id));
    showToast('Demo — item descartado de la queue.');
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <Mail size={20} style={{ color: ADMIN.primary }} />
        <h2 style={{
          fontFamily: 'var(--rf-font-display)', fontSize: '16px',
          fontWeight: 600, color: 'var(--rf-text)', margin: 0,
        }}>
          Email — info@example.com
        </h2>
        <button
          onClick={() => showToast('Demo — en producción refrescaría config, queue y stats.')}
          style={{
            marginLeft: 'auto',
            padding: '6px 10px', borderRadius: '6px', border: `1px solid ${ADMIN.border}`,
            background: 'transparent', color: ADMIN.primary, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px',
          }}
        >
          <RefreshCw size={12} />
          Actualizar
        </button>
      </div>

      <KillSwitchStrip
        config={config}
        onToggle={v => patchConfig({ auto_send_enabled: v })}
        onOpenConfig={() => setConfigModalOpen(true)}
      />

      {configModalOpen && (
        <ConfigModal
          config={config}
          onClose={() => setConfigModalOpen(false)}
          onSave={patchConfig}
        />
      )}

      <StatsStrip stats={stats} />

      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontFamily: 'var(--rf-font-display)', fontSize: 14, fontWeight: 600, margin: '0 0 10px' }}>
          Review Queue {queue.length > 0 ? `(${queue.length})` : ''}
        </h3>
        {queue.length === 0 ? (
          <div style={{
            padding: '20px', textAlign: 'center', color: 'var(--rf-text-muted)',
            border: `1px dashed ${ADMIN.border}`, borderRadius: 8,
            fontSize: 13,
          }}>
            Sin emails pendientes de revisión.
          </div>
        ) : (
          queue.map(item => (
            <QueueCard
              key={item.queue_id}
              item={item}
              onSend={sendFromQueue}
              onDismiss={dismissFromQueue}
            />
          ))
        )}
      </div>

      <LogTable log={log} onRowClick={setDetailId} />

      {detailId && <DetailModal id={detailId} onClose={() => setDetailId(null)} />}
    </div>
  );
}

function KillSwitchStrip({ config, onToggle, onOpenConfig }) {
  const enabled = !!config?.auto_send_enabled;
  const minConf = config?.min_confidence_to_send ?? 0.75;
  const rateLimit = config?.rate_limit_per_sender_per_hour ?? 5;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap',
      padding: '14px 18px', marginBottom: '20px',
      borderRadius: '10px',
      background: enabled ? 'rgba(34, 197, 94, 0.08)' : 'rgba(220, 38, 38, 0.08)',
      border: `1px solid ${enabled ? 'rgba(34, 197, 94, 0.3)' : 'rgba(220, 38, 38, 0.3)'}`,
    }}>
      <button
        onClick={() => onToggle(!enabled)}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '8px 14px', borderRadius: '20px',
          border: 'none', cursor: 'pointer',
          fontFamily: 'var(--rf-font-body)', fontSize: '13px', fontWeight: 700,
          color: 'white',
          background: enabled ? '#16a34a' : '#dc2626',
        }}
      >
        <span style={{
          display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
          background: 'white',
        }} />
        {enabled ? 'Auto-respuestas ACTIVADAS' : 'Auto-respuestas PAUSADAS'}
      </button>

      <div style={{ display: 'flex', gap: '8px', fontFamily: 'var(--rf-font-body)', fontSize: '12px', color: 'var(--rf-text-muted)' }}>
        <span style={{ padding: '4px 8px', borderRadius: '6px', background: 'var(--rf-card-bg)', border: `1px solid ${ADMIN.border}` }}>
          confidence ≥ {minConf}
        </span>
        <span style={{ padding: '4px 8px', borderRadius: '6px', background: 'var(--rf-card-bg)', border: `1px solid ${ADMIN.border}` }}>
          rate-limit {rateLimit}/h
        </span>
      </div>

      <button
        onClick={onOpenConfig}
        style={{
          marginLeft: 'auto',
          padding: '6px 10px', borderRadius: '6px',
          border: `1px solid ${ADMIN.border}`,
          background: 'transparent', color: ADMIN.primary, cursor: 'pointer',
          fontSize: '12px', fontWeight: 600,
        }}
      >
        ⚙ Configurar
      </button>
    </div>
  );
}

function ConfigModal({ config, onClose, onSave }) {
  const [minConf, setMinConf] = useState(config?.min_confidence_to_send ?? 0.75);
  const [rateLimit, setRateLimit] = useState(config?.rate_limit_per_sender_per_hour ?? 5);
  const [saving, setSaving] = useState(false);

  function handleSave() {
    setSaving(true);
    setTimeout(() => {
      onSave({
        min_confidence_to_send: Number(minConf),
        rate_limit_per_sender_per_hour: parseInt(rateLimit),
      });
      setSaving(false);
      onClose();
    }, 300);
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 420,
          background: 'var(--rf-card-bg)',
          border: `1px solid ${ADMIN.border}`,
          borderRadius: 12,
          padding: 24,
        }}
      >
        <h3 style={{ fontFamily: 'var(--rf-font-display)', fontSize: 16, fontWeight: 600, margin: '0 0 16px', color: ADMIN.primary }}>
          Configuración del responder
        </h3>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 12, color: 'var(--rf-text-muted)', marginBottom: 6 }}>
            Confianza mínima para auto-responder (0.0 – 1.0)
          </label>
          <input
            type="number" step="0.05" min="0" max="1"
            value={minConf}
            onChange={e => setMinConf(e.target.value)}
            style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: `1px solid ${ADMIN.border}`, background: 'transparent', color: 'var(--rf-text)' }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 12, color: 'var(--rf-text-muted)', marginBottom: 6 }}>
            Rate-limit por sender por hora
          </label>
          <input
            type="number" step="1" min="0" max="1000"
            value={rateLimit}
            onChange={e => setRateLimit(e.target.value)}
            style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: `1px solid ${ADMIN.border}`, background: 'transparent', color: 'var(--rf-text)' }}
          />
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose}
            style={{ padding: '8px 14px', borderRadius: 6, border: `1px solid ${ADMIN.border}`, background: 'transparent', color: 'var(--rf-text)', cursor: 'pointer' }}>
            Cancelar
          </button>
          <button onClick={handleSave} disabled={saving}
            style={{ padding: '8px 14px', borderRadius: 6, border: 'none', background: ADMIN.primary, color: 'white', cursor: saving ? 'wait' : 'pointer' }}>
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatsStrip({ stats }) {
  const [period, setPeriod] = useState('24h');
  const s = stats?.[period] || {};

  const metrics = [
    { label: 'Recibidos', value: Number(s.received || 0) },
    { label: 'Auto', value: Number(s.auto_replied || 0),
      suffix: s.received ? ` (${Math.round(100 * Number(s.auto_replied || 0) / Number(s.received))}%)` : '' },
    { label: 'Queue', value: Number(s.queue_pending || 0) },
    { label: 'Dismissed', value: Number(s.dismissed || 0) },
    { label: 'Latencia', value: s.avg_latency_sec ? `${Math.round(Number(s.avg_latency_sec))}s` : '—' },
    { label: 'Costo', value: `$${Number(s.cost_usd || 0).toFixed(4)}` },
  ];

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
        {['24h', '7d', '30d'].map(p => (
          <button key={p} onClick={() => setPeriod(p)}
            style={{
              padding: '4px 10px', borderRadius: 6,
              border: `1px solid ${ADMIN.border}`,
              background: period === p ? ADMIN.surface : 'transparent',
              color: period === p ? ADMIN.primary : 'var(--rf-text-muted)',
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}>
            {p}
          </button>
        ))}
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
        gap: 8,
      }}>
        {metrics.map(m => (
          <div key={m.label} style={{
            padding: '10px 12px', borderRadius: 8,
            background: 'var(--rf-card-bg)',
            border: `1px solid ${ADMIN.border}`,
          }}>
            <div style={{ fontSize: 11, color: 'var(--rf-text-muted)' }}>{m.label}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: ADMIN.primary }}>
              {m.value}{m.suffix || ''}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const REASON_CONFIG = {
  low_confidence:     { label: 'Low confidence', color: '#f59e0b' },
  off_topic:          { label: 'Off-topic',       color: '#6b7280' },
  injection_markers:  { label: 'Injection',       color: '#dc2626' },
  validator_rejected: { label: 'Validator',       color: '#dc2626' },
  kill_switch:        { label: 'Kill switch',     color: '#1976d2' },
  rate_limited:       { label: 'Rate limit',      color: '#f59e0b' },
  api_error:          { label: 'API error',       color: '#dc2626' },
  smtp_failed:        { label: 'SMTP failed',     color: '#dc2626' },
};

function QueueCard({ item, onSend, onDismiss }) {
  const [expanded, setExpanded] = useState(false);
  const [draft, setDraft] = useState(item.suggested_reply || '');
  const [busy, setBusy] = useState(false);

  const rc = REASON_CONFIG[item.reason] || { label: item.reason, color: '#6b7280' };

  function doSend() {
    if (!draft.trim()) return;
    setBusy(true);
    setTimeout(() => {
      onSend(item.queue_id, draft);
      setBusy(false);
    }, 350);
  }

  function doDismiss() {
    setBusy(true);
    setTimeout(() => {
      onDismiss(item.queue_id);
      setBusy(false);
    }, 300);
  }

  return (
    <div style={{
      padding: '14px 16px', marginBottom: 10,
      borderRadius: 10,
      background: 'var(--rf-card-bg)',
      border: `1px solid ${ADMIN.border}`,
    }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
        <span style={{
          padding: '2px 8px', borderRadius: 4,
          background: rc.color + '22', color: rc.color,
          fontSize: 11, fontWeight: 700,
        }}>
          {rc.label}
        </span>
        <span style={{ fontSize: 11, color: 'var(--rf-text-muted)' }}>
          {new Date(item.queued_at).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })}
        </span>
      </div>

      <div style={{ fontFamily: 'var(--rf-font-body)', fontSize: 13, marginBottom: 4 }}>
        <strong>{item.sender_name || item.sender_email}</strong>
        {' '}
        <span style={{ color: 'var(--rf-text-muted)' }}>&lt;{item.sender_email}&gt;</span>
      </div>
      <div style={{ fontFamily: 'var(--rf-font-body)', fontSize: 13, marginBottom: 10, fontWeight: 600 }}>
        {item.subject || '(sin asunto)'}
      </div>

      <button onClick={() => setExpanded(e => !e)}
        style={{ fontSize: 12, color: ADMIN.primary, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 8 }}>
        {expanded ? '▾ Ocultar email original' : '▸ Ver email original'}
      </button>

      {expanded && (
        <div style={{ marginBottom: 10, padding: 10, background: 'rgba(0,0,0,0.04)', borderRadius: 6, fontSize: 12, whiteSpace: 'pre-wrap', fontFamily: 'var(--rf-font-body)' }}>
          {item.body_text || '(cuerpo vacío)'}
          {item.classification && (
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px dashed ${ADMIN.border}`, fontSize: 11, color: 'var(--rf-text-muted)' }}>
              Classification: <code>{JSON.stringify(item.classification)}</code>
            </div>
          )}
          {item.reason_detail && (
            <div style={{ marginTop: 6, fontSize: 11, color: 'var(--rf-text-muted)' }}>
              Detail: <code>{item.reason_detail}</code>
            </div>
          )}
        </div>
      )}

      <textarea
        value={draft}
        onChange={e => setDraft(e.target.value)}
        placeholder={item.suggested_reply ? '' : 'Redacta tu respuesta…'}
        rows={6}
        style={{
          width: '100%', padding: 10,
          borderRadius: 6, border: `1px solid ${ADMIN.border}`,
          background: 'transparent', color: 'var(--rf-text)',
          fontFamily: 'var(--rf-font-body)', fontSize: 13,
          resize: 'vertical',
        }}
      />

      <div style={{ display: 'flex', gap: 8, marginTop: 10, justifyContent: 'flex-end' }}>
        <button onClick={doDismiss} disabled={busy}
          style={{ padding: '6px 12px', borderRadius: 6, border: `1px solid ${ADMIN.border}`, background: 'transparent', color: 'var(--rf-text)', cursor: busy ? 'wait' : 'pointer', fontSize: 12 }}>
          Descartar
        </button>
        <button onClick={doSend} disabled={busy || !draft.trim()}
          style={{ padding: '6px 12px', borderRadius: 6, border: 'none', background: ADMIN.primary, color: 'white', cursor: (busy || !draft.trim()) ? 'wait' : 'pointer', fontSize: 12, fontWeight: 600 }}>
          Enviar
        </button>
      </div>
    </div>
  );
}

const LOG_PAGE_SIZE = 10;

function LogTable({ log, onRowClick }) {
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState({ status: '', sender: '' });

  const filtered = useMemo(() => {
    return log.filter(row => {
      if (filter.status && row.status !== filter.status) return false;
      if (filter.sender && !row.sender_email.toLowerCase().includes(filter.sender.toLowerCase())) return false;
      return true;
    });
  }, [log, filter]);

  const total = filtered.length;
  const items = filtered.slice(page * LOG_PAGE_SIZE, (page + 1) * LOG_PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(total / LOG_PAGE_SIZE));

  return (
    <div>
      <h3 style={{ fontFamily: 'var(--rf-font-display)', fontSize: 14, fontWeight: 600, margin: '0 0 10px' }}>
        Log
      </h3>

      <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
        <select
          value={filter.status}
          onChange={e => { setFilter(f => ({ ...f, status: e.target.value })); setPage(0); }}
          style={{ padding: '6px 10px', borderRadius: 6, border: `1px solid ${ADMIN.border}`, background: 'transparent', color: 'var(--rf-text)', fontSize: 12 }}
        >
          <option value="">Todos los status</option>
          {['received','classifying','classified','replying','replied','queued','failed','dismissed'].map(s =>
            <option key={s} value={s}>{s}</option>
          )}
        </select>
        <input
          placeholder="sender contiene..."
          value={filter.sender}
          onChange={e => { setFilter(f => ({ ...f, sender: e.target.value })); setPage(0); }}
          style={{ padding: '6px 10px', borderRadius: 6, border: `1px solid ${ADMIN.border}`, background: 'transparent', color: 'var(--rf-text)', fontSize: 12, flex: 1, minWidth: 160 }}
        />
      </div>

      <div style={{ overflowX: 'auto', border: `1px solid ${ADMIN.border}`, borderRadius: 8 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--rf-font-body)', fontSize: 12 }}>
          <thead>
            <tr style={{ background: 'var(--rf-card-bg)', textAlign: 'left' }}>
              {['Fecha', 'Sender', 'Subject', 'Status', 'Latencia', 'Costo', ''].map(h =>
                <th key={h} style={{ padding: '8px 10px', borderBottom: `1px solid ${ADMIN.border}`, color: 'var(--rf-text-muted)', fontWeight: 600 }}>{h}</th>
              )}
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: 20, textAlign: 'center', color: 'var(--rf-text-muted)' }}>Sin resultados.</td></tr>
            ) : items.map(row => (
              <tr key={row.id} style={{ cursor: 'pointer' }}
                  onClick={() => onRowClick(row.id)}>
                <td style={{ padding: '8px 10px', borderBottom: `1px solid ${ADMIN.border}` }}>
                  {new Date(row.received_at).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })}
                </td>
                <td style={{ padding: '8px 10px', borderBottom: `1px solid ${ADMIN.border}` }}>{row.sender_email}</td>
                <td style={{ padding: '8px 10px', borderBottom: `1px solid ${ADMIN.border}`, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.subject || '(sin asunto)'}</td>
                <td style={{ padding: '8px 10px', borderBottom: `1px solid ${ADMIN.border}` }}>{row.status}</td>
                <td style={{ padding: '8px 10px', borderBottom: `1px solid ${ADMIN.border}` }}>{row.latency_sec ? `${Math.round(Number(row.latency_sec))}s` : '—'}</td>
                <td style={{ padding: '8px 10px', borderBottom: `1px solid ${ADMIN.border}` }}>${Number(row.estimated_cost_usd || 0).toFixed(4)}</td>
                <td style={{ padding: '8px 10px', borderBottom: `1px solid ${ADMIN.border}`, color: ADMIN.primary }}>Ver</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 10, alignItems: 'center' }}>
        <button disabled={page === 0} onClick={() => setPage(p => Math.max(0, p - 1))}
          style={{ padding: '6px 10px', borderRadius: 6, border: `1px solid ${ADMIN.border}`, background: 'transparent', cursor: page === 0 ? 'not-allowed' : 'pointer', fontSize: 12 }}>
          ← Anterior
        </button>
        <span style={{ fontSize: 12, color: 'var(--rf-text-muted)' }}>
          Página {page + 1} de {totalPages} ({total} total)
        </span>
        <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}
          style={{ padding: '6px 10px', borderRadius: 6, border: `1px solid ${ADMIN.border}`, background: 'transparent', cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer', fontSize: 12 }}>
          Siguiente →
        </button>
      </div>
    </div>
  );
}

function DetailModal({ id, onClose }) {
  const detail = useMemo(() => getEmailDetailStub(id), [id]);

  return (
    <div onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={e => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 760, maxHeight: '90vh', overflow: 'auto', background: 'var(--rf-card-bg)', border: `1px solid ${ADMIN.border}`, borderRadius: 12, padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ margin: 0, fontFamily: 'var(--rf-font-display)', fontSize: 15, fontWeight: 600 }}>Detalle del email</h3>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', fontSize: 18, cursor: 'pointer', color: 'var(--rf-text-muted)' }}>×</button>
        </div>

        <div style={{ fontFamily: 'var(--rf-font-body)', fontSize: 13, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <section>
            <h4 style={{ fontSize: 12, color: 'var(--rf-text-muted)', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: 0.5 }}>Inbound</h4>
            <div><strong>From:</strong> {detail.inbound.sender_name ? `${detail.inbound.sender_name} <${detail.inbound.sender_email}>` : detail.inbound.sender_email}</div>
            <div><strong>Subject:</strong> {detail.inbound.subject}</div>
            <div><strong>Received:</strong> {new Date(detail.inbound.received_at).toLocaleString('es-MX')}</div>
            <div><strong>Status:</strong> {detail.inbound.status}</div>
            <pre style={{ marginTop: 8, padding: 10, background: 'rgba(0,0,0,0.04)', borderRadius: 6, whiteSpace: 'pre-wrap', fontSize: 12 }}>{detail.inbound.body_text || '(vacío)'}</pre>
          </section>

          {detail.inbound.classification && (
            <section>
              <h4 style={{ fontSize: 12, color: 'var(--rf-text-muted)', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: 0.5 }}>Classification</h4>
              <pre style={{ padding: 10, background: 'rgba(0,0,0,0.04)', borderRadius: 6, fontSize: 12 }}>{JSON.stringify(detail.inbound.classification, null, 2)}</pre>
            </section>
          )}

          {Array.isArray(detail.outbound) && detail.outbound.length > 0 && (
            <section>
              <h4 style={{ fontSize: 12, color: 'var(--rf-text-muted)', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: 0.5 }}>Outbound</h4>
              {detail.outbound.map(o => (
                <div key={o.id} style={{ marginBottom: 10 }}>
                  <div><strong>Sent at:</strong> {new Date(o.sent_at).toLocaleString('es-MX')} · source: {o.source}</div>
                  <pre style={{ marginTop: 6, padding: 10, background: 'rgba(0,0,0,0.04)', borderRadius: 6, whiteSpace: 'pre-wrap', fontSize: 12 }}>{o.body_text}</pre>
                </div>
              ))}
            </section>
          )}

          {Array.isArray(detail.rag_chunks) && detail.rag_chunks.length > 0 && (
            <section>
              <h4 style={{ fontSize: 12, color: 'var(--rf-text-muted)', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: 0.5 }}>RAG chunks</h4>
              {detail.rag_chunks.map((c, i) => (
                <pre key={i} style={{ padding: 10, background: 'rgba(0,0,0,0.04)', borderRadius: 6, fontSize: 12, whiteSpace: 'pre-wrap', marginBottom: 6 }}>
                  [{c.id}] {c.content}
                </pre>
              ))}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
