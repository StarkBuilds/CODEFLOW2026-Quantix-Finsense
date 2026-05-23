import { useState, useCallback, useRef } from 'react';
import { SAMPLE_CSV } from '../../utils/constants.js';
import { downloadFile } from '../../utils/helpers.js';
import './UploadSection.css';

const FEATURES = [
  { icon: '📁', title: 'PDF & CSV',        desc: 'Auto-extract from any format'  },
  { icon: '🏷️', title: '15+ Categories',   desc: 'Smart auto-categorisation'     },
  { icon: '🔁', title: 'Recurring Detection', desc: 'Subscriptions & EMIs'       },
  { icon: '🤖', title: 'AI Insights',      desc: 'Personalised recommendations'  },
];

export default function UploadSection({ onFileSelect, error }) {
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) onFileSelect(file);
    },
    [onFileSelect]
  );

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) onFileSelect(file);
  };

  const handleDownloadSample = () => {
    downloadFile(SAMPLE_CSV, 'sample_bank_statement.csv', 'text/csv');
  };

  return (
    <div className="upload-section">
      {/* ── Logo ─────────────────────────────────────────────────────────── */}
      <div className="upload-logo">
        <div className="upload-logo__icon">₹</div>
        <div>
          <h1 className="upload-logo__title">
            FinSight <span className="upload-logo__accent">AI</span>
          </h1>
          <p className="upload-logo__sub">AI-powered Indian bank statement analyser</p>
        </div>
      </div>

      {/* ── Drop zone ────────────────────────────────────────────────────── */}
      <div
        className={`upload-zone ${dragOver ? 'upload-zone--active' : ''}`}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => fileRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Upload bank statement"
        onKeyDown={(e) => e.key === 'Enter' && fileRef.current?.click()}
      >
        <span className="upload-zone__icon">📊</span>
        <h2 className="upload-zone__title">Drop your bank statement here</h2>
        <p className="upload-zone__sub">or click to browse</p>

        <div className="upload-zone__badges">
          <span className="upload-badge upload-badge--primary">PDF</span>
          <span className="upload-badge upload-badge--primary">CSV</span>
          <span className="upload-badge upload-badge--neutral">Any Indian bank</span>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.csv"
          className="upload-zone__input"
          onChange={handleChange}
        />
      </div>

      {/* ── Error ────────────────────────────────────────────────────────── */}
      {error && (
        <div className="upload-error" role="alert">
          ⚠️ {error}
        </div>
      )}

      {/* ── Sample download ──────────────────────────────────────────────── */}
      <button className="upload-sample-btn" onClick={handleDownloadSample}>
        ↓ Download sample CSV to test
      </button>

      {/* ── Feature grid ─────────────────────────────────────────────────── */}
      <div className="upload-features">
        {FEATURES.map(({ icon, title, desc }) => (
          <div key={title} className="upload-feature-card">
            <span className="upload-feature-card__icon">{icon}</span>
            <p className="upload-feature-card__title">{title}</p>
            <p className="upload-feature-card__desc">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}