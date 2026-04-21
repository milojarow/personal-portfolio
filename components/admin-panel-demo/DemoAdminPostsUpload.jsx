'use client';

import { useState, useRef } from 'react';
import { Upload, Loader2, X } from 'lucide-react';
import { ADMIN } from './admin-constants';
import { useDemoToast } from './demo-toast';
import { getInitialPosts } from '../../lib/admin-panel-demo/fixtures';

export default function DemoAdminPostsUpload() {
  const { showToast } = useDemoToast();
  const [preview, setPreview] = useState(null);
  const [fileDataUrl, setFileDataUrl] = useState(null);
  const [uploadingUuid, setUploadingUuid] = useState(null);
  const [draftPosts] = useState(() => getInitialPosts().filter(p => p.status === 'draft'));
  const fileInputRef = useRef(null);

  function handleFileSelect(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreview(ev.target.result);
      setFileDataUrl(ev.target.result);
    };
    reader.readAsDataURL(f);
  }

  function clearFile() {
    setPreview(null);
    setFileDataUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function applyBackground(postUuid) {
    if (!fileDataUrl) return;
    setUploadingUuid(postUuid);
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('apd-bg-updated', {
        detail: { postUuid, bgUrl: fileDataUrl },
      }));
      setUploadingUuid(null);
      clearFile();
      showToast('Demo — en producción subiría a Luna CDN y actualizaría el post.');
    }, 700);
  }

  return (
    <div>
      <h3 style={{
        fontFamily: 'var(--rf-font-display)', fontSize: '14px',
        fontWeight: 600, color: 'var(--rf-text)', margin: '0 0 8px',
      }}>
        Background personalizado
      </h3>
      <p style={{
        fontFamily: 'var(--rf-font-body)', fontSize: '11px',
        color: 'var(--rf-text-muted)', margin: '0 0 16px', lineHeight: 1.4,
      }}>
        Sube una foto para usarla como background en cualquier post. El texto y overlay se conservan.
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {preview ? (
        <div>
          <div style={{ position: 'relative', marginBottom: '12px' }}>
            <img
              src={preview}
              alt="Preview"
              style={{
                width: '100%', height: '160px', objectFit: 'cover',
                borderRadius: '8px', border: '1px solid var(--rf-border)',
              }}
            />
            <button
              onClick={clearFile}
              style={{
                position: 'absolute', top: '6px', right: '6px',
                width: '24px', height: '24px', borderRadius: '50%',
                backgroundColor: 'rgba(0,0,0,0.6)', border: 'none',
                color: 'white', cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <X size={14} />
            </button>
          </div>

          <p style={{
            fontFamily: 'var(--rf-font-body)', fontSize: '11px',
            color: 'var(--rf-text-muted)', margin: '0 0 8px',
          }}>
            Aplicar a:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {draftPosts.map(post => {
              const isThisUploading = uploadingUuid === post.uuid;
              const isAnyUploading = uploadingUuid !== null;
              return (
                <button
                  key={post.uuid}
                  onClick={() => applyBackground(post.uuid)}
                  disabled={isAnyUploading}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    fontFamily: 'var(--rf-font-body)', fontSize: '12px',
                    color: 'var(--rf-text)', backgroundColor: 'var(--rf-card-bg)',
                    border: '1px solid var(--rf-border)', borderRadius: '6px',
                    padding: '8px 12px',
                    cursor: isAnyUploading ? 'not-allowed' : 'pointer',
                    textAlign: 'left',
                    opacity: isAnyUploading && !isThisUploading ? 0.5 : 1,
                  }}
                >
                  {isThisUploading ? (
                    <Loader2 size={12} style={{ animation: 'rf-spin 1s linear infinite', flexShrink: 0 }} />
                  ) : (
                    <Upload size={12} style={{ flexShrink: 0 }} />
                  )}
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {post.headline}
                  </span>
                </button>
              );
            })}
            {draftPosts.length === 0 && (
              <p style={{
                fontFamily: 'var(--rf-font-body)', fontSize: '11px',
                color: 'var(--rf-text-muted)', margin: 0,
              }}>
                No hay posts en borrador
              </p>
            )}
          </div>
        </div>
      ) : (
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            width: '100%', padding: '32px 16px',
            border: `2px dashed ${ADMIN.border}`, borderRadius: '8px',
            backgroundColor: 'transparent', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
          }}
        >
          <Upload size={24} style={{ color: ADMIN.primary }} />
          <span style={{
            fontFamily: 'var(--rf-font-body)', fontSize: '12px',
            color: 'var(--rf-text-muted)',
          }}>
            Subir imagen
          </span>
        </button>
      )}
    </div>
  );
}
