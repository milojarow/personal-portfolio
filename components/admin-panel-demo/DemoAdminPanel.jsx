'use client';

import { useState, useEffect, useCallback } from 'react';
import { MessageCircle, GitMerge, CalendarDays, Image, Mail } from 'lucide-react';
import { ADMIN } from './admin-constants';
import DemoAdminPosts from './DemoAdminPosts';
import DemoAdminPostsUpload from './DemoAdminPostsUpload';
import DemoAdminChatbot from './DemoAdminChatbot';
import DemoAdminMergeContacts from './DemoAdminMergeContacts';
import DemoAdminBlockedDays from './DemoAdminBlockedDays';
import DemoAdminEmail from './DemoAdminEmail';
import { DemoToastProvider } from './demo-toast';

const TABS = [
  { id: 'posts', label: 'Posts', icon: Image },
  { id: 'chatbot', label: 'Chatbot', icon: MessageCircle },
  { id: 'merge', label: 'Merge', icon: GitMerge },
  { id: 'citas', label: 'Citas', icon: CalendarDays },
  { id: 'email', label: 'Email', icon: Mail },
];

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

function readInitialTab() {
  if (typeof window === 'undefined') return 'posts';
  const params = new URLSearchParams(window.location.search);
  const t = params.get('tab');
  return TABS.some(x => x.id === t) ? t : 'posts';
}

export default function DemoAdminPanel() {
  const [activeTab, setActiveTab] = useState('posts');
  const isNarrow = useIsNarrow(1024);
  const isMobile = useIsNarrow(768);

  useEffect(() => {
    setActiveTab(readInitialTab());
  }, []);

  const switchTab = useCallback((tab) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `?tab=${tab}`);
    }
  }, []);

  return (
    <DemoToastProvider>
      <div>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{
            fontFamily: 'var(--rf-font-display)',
            fontSize: 'clamp(22px, 4vw, 28px)',
            fontWeight: 600,
            color: ADMIN.primary,
            margin: '0 0 4px',
          }}>
            Panel de Administración
          </h1>
          <p style={{
            fontFamily: 'var(--rf-font-body)',
            fontSize: '14px',
            color: 'var(--rf-text-muted)',
            margin: 0,
          }}>
            Herramientas exclusivas para administradores
          </p>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: '24px',
          minHeight: '500px',
        }}>
          <nav style={{
            display: 'flex',
            flexDirection: isMobile ? 'row' : 'column',
            gap: '4px',
            flexShrink: 0,
            width: isMobile ? '100%' : '160px',
            overflowX: isMobile ? 'auto' : 'visible',
          }}>
            {TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => switchTab(tab.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '12px 16px', borderRadius: '8px',
                    fontFamily: 'var(--rf-font-body)', fontSize: '13px', fontWeight: 600,
                    color: isActive ? ADMIN.primary : 'var(--rf-text-muted)',
                    backgroundColor: isActive ? ADMIN.surface : 'transparent',
                    border: isActive ? `1px solid ${ADMIN.border}` : '1px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    textAlign: 'left',
                  }}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {activeTab === 'posts' ? (
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: isNarrow ? 'column' : 'row',
              gap: '24px',
              minWidth: 0,
            }}>
              <div style={{
                flex: '1 1 0%',
                backgroundColor: 'var(--rf-card-bg)',
                border: `1px solid ${ADMIN.border}`,
                borderRadius: '12px',
                padding: '24px',
                minWidth: 0,
              }}>
                <DemoAdminPosts />
              </div>
              <div style={{
                flex: '1 1 0%',
                backgroundColor: 'var(--rf-card-bg)',
                border: `1px solid ${ADMIN.border}`,
                borderRadius: '12px',
                padding: '24px',
                minWidth: 0,
                ...(isNarrow ? {} : {
                  alignSelf: 'flex-start',
                  position: 'sticky',
                  top: '24px',
                }),
              }}>
                <DemoAdminPostsUpload />
              </div>
            </div>
          ) : (
            <div style={{
              flex: 1,
              backgroundColor: 'var(--rf-card-bg)',
              border: `1px solid ${ADMIN.border}`,
              borderRadius: '12px',
              padding: '24px',
              minWidth: 0,
              maxWidth: '900px',
            }}>
              {activeTab === 'chatbot' && <DemoAdminChatbot />}
              {activeTab === 'merge' && <DemoAdminMergeContacts />}
              {activeTab === 'citas' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <CalendarDays size={20} style={{ color: ADMIN.primary }} />
                    <h2 style={{
                      fontFamily: 'var(--rf-font-display)', fontSize: '16px',
                      fontWeight: 600, color: 'var(--rf-text)', margin: 0,
                    }}>
                      Gestión de Disponibilidad
                    </h2>
                  </div>
                  <p style={{
                    fontFamily: 'var(--rf-font-body)', fontSize: '13px',
                    color: 'var(--rf-text-muted)', margin: '0 0 20px', lineHeight: 1.5,
                  }}>
                    Marca los días o horarios en los que no se atenderán citas. Los prospectos verán estos días como no disponibles.
                  </p>
                  <DemoAdminBlockedDays />
                </div>
              )}
              {activeTab === 'email' && <DemoAdminEmail />}
            </div>
          )}
        </div>
      </div>
    </DemoToastProvider>
  );
}
