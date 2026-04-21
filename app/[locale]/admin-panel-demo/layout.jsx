import { ArrowLeft } from 'lucide-react';

const styles = `
.admin-panel-demo-root {
  --rf-bg: #F7F5F0;
  --rf-text: #1A1A2E;
  --rf-text-muted: #5A6478;
  --rf-border: #D6D0C4;
  --rf-card-bg: #FFFFFF;
  --rf-surface: #EFEBE3;
  --rf-font-display: var(--font-display);
  --rf-font-body: var(--font-body);

  position: fixed;
  inset: 0;
  z-index: 100;
  overflow-y: auto;
  background: var(--rf-bg);
  color: var(--rf-text);
  font-family: var(--rf-font-body);
  -webkit-font-smoothing: antialiased;
}

.admin-panel-demo-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 72px 32px 48px;
}

.admin-panel-demo-topbar {
  position: sticky;
  top: 0;
  z-index: 10;
  background: rgba(247, 245, 240, 0.9);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--rf-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
}

.admin-panel-demo-backlink {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #0891B2;
  text-decoration: none;
  padding: 6px 10px;
  border-radius: 6px;
  transition: background 0.15s ease;
}

.admin-panel-demo-backlink:hover {
  background: rgba(8, 145, 178, 0.08);
}

.admin-panel-demo-badge {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: #B20891;
  padding: 4px 10px;
  border: 1px solid rgba(178, 8, 145, 0.3);
  border-radius: 4px;
  background: rgba(178, 8, 145, 0.06);
}

@media (max-width: 700px) {
  .admin-panel-demo-inner {
    padding: 56px 16px 32px;
  }
  .admin-panel-demo-topbar {
    padding: 10px 16px;
  }
}

@keyframes rf-spin {
  to { transform: rotate(360deg); }
}

@keyframes fb-glow-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(24, 119, 242, 0); }
  50% { box-shadow: 0 0 0 6px rgba(24, 119, 242, 0.25); }
}

@keyframes apd-toast-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
`;

export const metadata = {
  title: 'Admin Panel — Demo · Rolando Ahuja',
  description: 'Interactive demo of an admin panel built for a real insurance client project.',
  robots: { index: false, follow: false },
};

export default function AdminPanelDemoLayout({ children }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="admin-panel-demo-root">
        <div className="admin-panel-demo-topbar">
          <a
            href="/"
            target="_top"
            className="admin-panel-demo-backlink"
          >
            <ArrowLeft size={14} />
            Volver al portafolio
          </a>
          <span className="admin-panel-demo-badge">Demo · no funcional</span>
        </div>
        <div className="admin-panel-demo-inner">
          {children}
        </div>
      </div>
    </>
  );
}
