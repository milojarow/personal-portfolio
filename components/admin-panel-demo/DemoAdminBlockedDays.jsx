'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Loader2, Check, Save, Clock, Ban } from 'lucide-react';
import { ADMIN } from './admin-constants';
import { useDemoToast } from './demo-toast';
import { getInitialBlockedDays } from '../../lib/admin-panel-demo/fixtures';

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const WEEKDAY_HEADERS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

const TIME_SLOTS = [
  '09:00', '09:45', '10:30', '11:15',
  '12:00', '12:45', '13:30', '14:15',
  '15:00', '15:45', '16:30',
];

function formatSlotLabel(slot) {
  const [h, m] = slot.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${displayH}:${String(m).padStart(2, '0')} ${period}`;
}

function toDateString(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function getTodayString() {
  const now = new Date();
  return toDateString(now.getFullYear(), now.getMonth(), now.getDate());
}

function buildMonthGrid(year, month) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dow = date.getDay();
    const col = dow === 0 ? 6 : dow - 1;
    cells.push({ day, col, dateString: toDateString(year, month, day), isSunday: dow === 0 });
  }
  return cells;
}

function buildWeekRows(cells) {
  const weeks = [];
  let currentWeek = [];
  let lastCol = -1;
  for (const cell of cells) {
    if (cell.col <= lastCol) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(cell);
    lastCol = cell.col;
  }
  if (currentWeek.length > 0) weeks.push(currentWeek);
  return weeks;
}

function getDateRange(dateA, dateB) {
  const start = dateA < dateB ? dateA : dateB;
  const end = dateA < dateB ? dateB : dateA;
  const dates = [];
  const current = new Date(start + 'T00:00:00');
  const endDate = new Date(end + 'T00:00:00');
  while (current <= endDate) {
    const dow = current.getDay();
    if (dow !== 0) {
      dates.push(toDateString(current.getFullYear(), current.getMonth(), current.getDate()));
    }
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

const keyframes = `
@keyframes abd-fade-in {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes abd-saved-fade {
  0% { opacity: 1; }
  70% { opacity: 1; }
  100% { opacity: 0; }
}
`;

export default function DemoAdminBlockedDays() {
  const { showToast } = useDemoToast();
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const [apiBlocked, setApiBlocked] = useState(() => {
    const map = new Map();
    for (const entry of getInitialBlockedDays()) {
      map.set(entry.date, { timeSlots: entry.timeSlots || null });
    }
    return map;
  });

  const [localChanges, setLocalChanges] = useState(new Map());
  const [selectedDays, setSelectedDays] = useState(new Set());
  const [lastClickedDay, setLastClickedDay] = useState(null);
  const isDragging = useRef(false);
  const dragStartDay = useRef(null);

  const [slotMode, setSlotMode] = useState('full');
  const [selectedSlots, setSelectedSlots] = useState(new Set());

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const savedTimeout = useRef(null);

  const todayString = useMemo(() => getTodayString(), []);
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const cells = useMemo(() => buildMonthGrid(year, month), [year, month]);
  const rows = useMemo(() => buildWeekRows(cells), [cells]);

  const getEffectiveState = useCallback((dateString) => {
    const localChange = localChanges.get(dateString);
    if (localChange === 'unblock') return 'unblocking';
    if (localChange) {
      return localChange.timeSlots ? 'blocked-partial' : 'blocked-full';
    }
    const apiEntry = apiBlocked.get(dateString);
    if (apiEntry) {
      return apiEntry.timeSlots ? 'blocked-partial' : 'blocked-full';
    }
    return null;
  }, [localChanges, apiBlocked]);

  function isApiBlocked(dateString) {
    return apiBlocked.has(dateString);
  }

  function handleDayClick(dateString, e) {
    if (e.shiftKey && lastClickedDay) {
      const range = getDateRange(lastClickedDay, dateString);
      setSelectedDays(prev => {
        const next = new Set(prev);
        for (const d of range) next.add(d);
        return next;
      });
    } else if (e.ctrlKey || e.metaKey) {
      setSelectedDays(prev => {
        const next = new Set(prev);
        if (next.has(dateString)) next.delete(dateString);
        else next.add(dateString);
        return next;
      });
    } else {
      setSelectedDays(prev => {
        if (prev.size === 1 && prev.has(dateString)) return new Set();
        return new Set([dateString]);
      });
    }
    setLastClickedDay(dateString);
  }

  function handleDayMouseDown(dateString, e) {
    if (e.button !== 0 || e.shiftKey || e.ctrlKey || e.metaKey) return;
    isDragging.current = true;
    dragStartDay.current = dateString;
  }

  function handleDayMouseEnter(dateString) {
    if (!isDragging.current || !dragStartDay.current) return;
    const range = getDateRange(dragStartDay.current, dateString);
    setSelectedDays(new Set(range));
  }

  function handleMouseUp() {
    if (isDragging.current && dragStartDay.current) {
      setLastClickedDay(null);
    }
    isDragging.current = false;
    dragStartDay.current = null;
  }

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  function applyBlockToSelected() {
    setLocalChanges(prev => {
      const next = new Map(prev);
      for (const dateString of selectedDays) {
        if (slotMode === 'full') {
          next.set(dateString, { timeSlots: null });
        } else {
          const slots = Array.from(selectedSlots).sort();
          if (slots.length > 0) {
            next.set(dateString, { timeSlots: slots });
          }
        }
      }
      return next;
    });
    setSelectedDays(new Set());
    setSelectedSlots(new Set());
    setSlotMode('full');
  }

  function unblockSelected() {
    setLocalChanges(prev => {
      const next = new Map(prev);
      for (const dateString of selectedDays) {
        if (isApiBlocked(dateString)) {
          next.set(dateString, 'unblock');
        } else {
          next.delete(dateString);
        }
      }
      return next;
    });
    setSelectedDays(new Set());
  }

  const selectionHasBlocked = useMemo(() => {
    for (const d of selectedDays) {
      const state = getEffectiveState(d);
      if (state === 'blocked-full' || state === 'blocked-partial') return true;
    }
    return false;
  }, [selectedDays, getEffectiveState]);

  const hasChanges = localChanges.size > 0;

  function handleSave() {
    if (!hasChanges || saving) return;
    setSaving(true);

    const addDays = [];
    const removeDays = [];
    for (const [dateString, change] of localChanges) {
      if (change === 'unblock') {
        removeDays.push(dateString);
      } else {
        addDays.push({ date: dateString, timeSlots: change.timeSlots });
      }
    }

    setTimeout(() => {
      const newApiBlocked = new Map(apiBlocked);
      for (const date of removeDays) newApiBlocked.delete(date);
      for (const entry of addDays) {
        newApiBlocked.set(entry.date, { timeSlots: entry.timeSlots });
      }
      setApiBlocked(newApiBlocked);
      setLocalChanges(new Map());
      setSaved(true);
      if (savedTimeout.current) clearTimeout(savedTimeout.current);
      savedTimeout.current = setTimeout(() => setSaved(false), 2000);
      setSaving(false);
      showToast(`Demo — cambios guardados (${addDays.length} bloqueados, ${removeDays.length} desbloqueados).`);
    }, 500);
  }

  function navigate(dir) {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + dir, 1));
  }

  return (
    <div
      onMouseUp={handleMouseUp}
      style={{ userSelect: 'none' }}
    >
      <style dangerouslySetInnerHTML={{ __html: keyframes }} />

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
      }}>
        <button
          onClick={() => navigate(-1)}
          aria-label="Mes anterior"
          style={{
            background: 'none',
            border: `1px solid ${ADMIN.border}`,
            borderRadius: '8px',
            padding: '6px',
            cursor: 'pointer',
            color: ADMIN.primary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s ease',
          }}
        >
          <ChevronLeft size={18} />
        </button>

        <span style={{
          fontFamily: 'var(--rf-font-display)',
          fontSize: '16px',
          fontWeight: 600,
          color: 'var(--rf-text)',
        }}>
          {MONTH_NAMES[month]} {year}
        </span>

        <button
          onClick={() => navigate(1)}
          aria-label="Mes siguiente"
          style={{
            background: 'none',
            border: `1px solid ${ADMIN.border}`,
            borderRadius: '8px',
            padding: '6px',
            cursor: 'pointer',
            color: ADMIN.primary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s ease',
          }}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '4px',
        marginBottom: '8px',
      }}>
        {WEEKDAY_HEADERS.map((label, i) => (
          <div key={i} style={{
            textAlign: 'center',
            fontFamily: 'var(--rf-font-body)',
            fontSize: '12px',
            fontWeight: 600,
            color: i === 6 ? 'var(--rf-text-muted)' : ADMIN.primary,
            padding: '4px 0',
            opacity: i === 6 ? 0.5 : 0.7,
          }}>
            {label}
          </div>
        ))}
      </div>

      <div>
        {rows.map((week, wi) => (
          <div key={wi} style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '4px',
            marginBottom: '4px',
          }}>
            {week.length > 0 && Array.from({ length: week[0].col }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {week.map(({ day, dateString, isSunday }) => {
              const isPast = dateString < todayString;
              const isSelected = selectedDays.has(dateString);
              const effectiveState = getEffectiveState(dateString);
              const isBlocked = effectiveState === 'blocked-full' || effectiveState === 'blocked-partial';
              const isUnblocking = effectiveState === 'unblocking';
              const isFromApi = isApiBlocked(dateString);
              const isLocallyChanged = localChanges.has(dateString);

              let bg = 'transparent';
              let color = 'var(--rf-text)';
              let border = '1.5px solid transparent';
              let textDecoration = 'none';

              if (isSunday) {
                color = 'var(--rf-text-muted)';
              } else if (isSelected) {
                bg = ADMIN.primary;
                color = '#fff';
                border = `1.5px solid ${ADMIN.primary}`;
              } else if (isUnblocking) {
                bg = 'rgba(178, 8, 145, 0.08)';
                color = 'var(--rf-text-muted)';
                border = '1.5px solid rgba(178, 8, 145, 0.3)';
                textDecoration = 'line-through';
              } else if (isBlocked && isFromApi && !isLocallyChanged) {
                bg = ADMIN.accent;
                color = '#fff';
                border = `1.5px solid ${ADMIN.accent}`;
              } else if (isBlocked && isLocallyChanged) {
                bg = ADMIN.primary;
                color = '#fff';
                border = `1.5px solid ${ADMIN.primary}`;
              } else if (isBlocked) {
                bg = ADMIN.accent;
                color = '#fff';
                border = `1.5px solid ${ADMIN.accent}`;
              }

              const isClickable = !isSunday;
              const isToday = dateString === todayString;

              return (
                <button
                  key={day}
                  onClick={(e) => isClickable && handleDayClick(dateString, e)}
                  onMouseDown={(e) => isClickable && handleDayMouseDown(dateString, e)}
                  onMouseEnter={() => isClickable && handleDayMouseEnter(dateString)}
                  disabled={isSunday}
                  aria-label={`${day} de ${MONTH_NAMES[month]}${isBlocked ? ' (bloqueado)' : ''}${isUnblocking ? ' (desbloqueando)' : ''}`}
                  style={{
                    width: '100%',
                    aspectRatio: '1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--rf-font-body)',
                    fontSize: '14px',
                    fontWeight: isSelected || isToday || isBlocked ? 600 : 400,
                    border,
                    borderRadius: '8px',
                    cursor: isClickable ? 'pointer' : 'default',
                    transition: 'all 0.12s ease',
                    background: bg,
                    color,
                    opacity: isSunday ? 0.3 : isPast ? 0.5 : 1,
                    textDecoration,
                    position: 'relative',
                    outline: isToday && !isSelected ? `2px solid ${ADMIN.primary}` : 'none',
                    outlineOffset: '-2px',
                  }}
                >
                  {day}
                  {effectiveState === 'blocked-partial' && !isSelected && (
                    <span style={{
                      position: 'absolute',
                      bottom: '3px',
                      right: '3px',
                      width: '5px',
                      height: '5px',
                      borderRadius: '50%',
                      backgroundColor: '#fff',
                      opacity: 0.8,
                    }} />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        marginTop: '16px',
        paddingTop: '12px',
        borderTop: `1px solid ${ADMIN.border}`,
      }}>
        <LegendItem color={ADMIN.accent} label="Bloqueado (guardado)" />
        <LegendItem color={ADMIN.primary} label="Bloqueado (nuevo)" />
        <LegendItem color="var(--rf-text-muted)" label="Desbloqueando" strikethrough />
      </div>

      {selectedDays.size > 0 && (
        <div style={{
          marginTop: '20px',
          padding: '20px',
          borderRadius: '10px',
          backgroundColor: ADMIN.surface,
          border: `1px solid ${ADMIN.border}`,
          animation: 'abd-fade-in 0.2s ease-out',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px',
          }}>
            <Clock size={16} style={{ color: ADMIN.primary }} />
            <span style={{
              fontFamily: 'var(--rf-font-display)',
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--rf-text)',
            }}>
              {selectedDays.size === 1
                ? `1 día seleccionado`
                : `${selectedDays.size} días seleccionados`}
            </span>
          </div>

          <p style={{
            fontFamily: 'var(--rf-font-body)',
            fontSize: '13px',
            color: 'var(--rf-text-muted)',
            margin: '0 0 16px',
          }}>
            Bloquear horarios específicos o día completo
          </p>

          <div style={{
            display: 'flex',
            gap: '4px',
            marginBottom: '16px',
            backgroundColor: 'var(--rf-card-bg)',
            borderRadius: '8px',
            padding: '4px',
            border: '1px solid var(--rf-border)',
          }}>
            <button
              onClick={() => setSlotMode('full')}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '6px',
                fontFamily: 'var(--rf-font-body)',
                fontSize: '13px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                backgroundColor: slotMode === 'full' ? ADMIN.primary : 'transparent',
                color: slotMode === 'full' ? '#fff' : 'var(--rf-text-muted)',
              }}
            >
              Día completo
            </button>
            <button
              onClick={() => setSlotMode('specific')}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '6px',
                fontFamily: 'var(--rf-font-body)',
                fontSize: '13px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                backgroundColor: slotMode === 'specific' ? ADMIN.primary : 'transparent',
                color: slotMode === 'specific' ? '#fff' : 'var(--rf-text-muted)',
              }}
            >
              Horarios específicos
            </button>
          </div>

          {slotMode === 'specific' && (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              marginBottom: '16px',
              animation: 'abd-fade-in 0.2s ease-out',
            }}>
              {TIME_SLOTS.map(slot => {
                const isActive = selectedSlots.has(slot);
                return (
                  <button
                    key={slot}
                    onClick={() => {
                      setSelectedSlots(prev => {
                        const next = new Set(prev);
                        if (next.has(slot)) next.delete(slot);
                        else next.add(slot);
                        return next;
                      });
                    }}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontFamily: 'var(--rf-font-body)',
                      fontSize: '13px',
                      fontWeight: 500,
                      border: `1.5px solid ${isActive ? ADMIN.primary : ADMIN.border}`,
                      backgroundColor: isActive ? ADMIN.primary : 'var(--rf-card-bg)',
                      color: isActive ? '#fff' : 'var(--rf-text)',
                      cursor: 'pointer',
                      transition: 'all 0.12s ease',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {formatSlotLabel(slot)}
                  </button>
                );
              })}
            </div>
          )}

          <div style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
          }}>
            <button
              onClick={applyBlockToSelected}
              disabled={slotMode === 'specific' && selectedSlots.size === 0}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontFamily: 'var(--rf-font-body)',
                fontSize: '13px',
                fontWeight: 600,
                color: '#fff',
                backgroundColor: (slotMode === 'specific' && selectedSlots.size === 0)
                  ? 'var(--rf-border)' : ADMIN.primary,
                border: 'none',
                borderRadius: '8px',
                padding: '10px 18px',
                cursor: (slotMode === 'specific' && selectedSlots.size === 0)
                  ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Ban size={14} />
              Bloquear
            </button>

            {selectionHasBlocked && (
              <button
                onClick={unblockSelected}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontFamily: 'var(--rf-font-body)',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: ADMIN.accent,
                  backgroundColor: 'transparent',
                  border: `1.5px solid ${ADMIN.accent}`,
                  borderRadius: '8px',
                  padding: '10px 18px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                Desbloquear
              </button>
            )}

            <button
              onClick={() => {
                setSelectedDays(new Set());
                setSelectedSlots(new Set());
                setSlotMode('full');
              }}
              style={{
                fontFamily: 'var(--rf-font-body)',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--rf-text-muted)',
                backgroundColor: 'transparent',
                border: `1px solid var(--rf-border)`,
                borderRadius: '8px',
                padding: '10px 18px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: '12px',
        marginTop: '20px',
        paddingTop: '16px',
        borderTop: `1px solid ${ADMIN.border}`,
      }}>
        {saved && (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontFamily: 'var(--rf-font-body)',
            fontSize: '13px',
            fontWeight: 600,
            color: '#059669',
            animation: 'abd-saved-fade 2s ease-out forwards',
          }}>
            <Check size={14} />
            Guardado
          </span>
        )}

        {hasChanges && (
          <span style={{
            fontFamily: 'var(--rf-font-body)',
            fontSize: '12px',
            color: 'var(--rf-text-muted)',
          }}>
            {localChanges.size} {localChanges.size === 1 ? 'cambio' : 'cambios'} pendiente{localChanges.size === 1 ? '' : 's'}
          </span>
        )}

        <button
          onClick={handleSave}
          disabled={!hasChanges || saving}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontFamily: 'var(--rf-font-body)',
            fontSize: '13px',
            fontWeight: 600,
            color: '#fff',
            backgroundColor: (!hasChanges || saving) ? 'var(--rf-border)' : ADMIN.primary,
            border: 'none',
            borderRadius: '8px',
            padding: '10px 20px',
            cursor: (!hasChanges || saving) ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          {saving ? (
            <Loader2 size={14} style={{ animation: 'rf-spin 1s linear infinite' }} />
          ) : (
            <Save size={14} />
          )}
          Guardar cambios
        </button>
      </div>
    </div>
  );
}

function LegendItem({ color, label, strikethrough }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <span style={{
        width: '12px',
        height: '12px',
        borderRadius: '3px',
        backgroundColor: strikethrough ? 'transparent' : color,
        border: strikethrough ? `1.5px solid ${color}` : 'none',
        flexShrink: 0,
      }} />
      <span style={{
        fontFamily: 'var(--rf-font-body)',
        fontSize: '11px',
        color: 'var(--rf-text-muted)',
        textDecoration: strikethrough ? 'line-through' : 'none',
      }}>
        {label}
      </span>
    </div>
  );
}
