import { useState } from 'react';
import { Upload, FileText, AlertCircle, Check } from 'lucide-react';
import { extractFileText, parseChecklistText } from '../utils/checklistFileParser';
import styles from './FileImportModal.module.css';
import type { Plane, PlaneChecklist } from '../data/types';

interface FileImportModalProps {
  onImport: (plane: Plane, checklist: PlaneChecklist) => void;
  onClose: () => void;
}

type Step = 'upload' | 'parsing' | 'preview' | 'error';

export function FileImportModal({ onImport, onClose }: FileImportModalProps) {
  const [step, setStep] = useState<Step>('upload');
  const [error, setError] = useState('');
  const [rawText, setRawText] = useState('');
  const [planeName, setPlaneName] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [result, setResult] = useState<{ plane: Plane; checklist: PlaneChecklist } | null>(null);

  const handleFile = async (file: File) => {
    setStep('parsing');
    setError('');
    try {
      const text = await extractFileText(file);
      setRawText(text);
      // Try to guess plane name from filename
      const baseName = file.name.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' ');
      setPlaneName(baseName);
      setStep('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to read file');
      setStep('error');
    }
  };

  const handleParse = () => {
    if (!planeName.trim() || !manufacturer.trim()) return;
    try {
      const parsed = parseChecklistText(rawText, planeName.trim(), manufacturer.trim());
      setResult(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse checklist');
      setResult(null);
    }
  };

  const handleImport = () => {
    if (result) {
      onImport(result.plane, result.checklist);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>Import Checklist from File</h2>

        {step === 'upload' && (
          <div className={styles.uploadArea}>
            <Upload size={32} className={styles.uploadIcon} />
            <p className={styles.uploadText}>
              Upload a PDF, DOCX, or TXT file containing a checklist
            </p>
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
              className={styles.fileInput}
            />
            <p className={styles.hint}>
              The parser will extract phases (headers) and items (label + expected state) from the document.
            </p>
          </div>
        )}

        {step === 'parsing' && (
          <div className={styles.center}>
            <FileText size={32} className={styles.spinner} />
            <p>Extracting text from file...</p>
          </div>
        )}

        {step === 'error' && (
          <div className={styles.center}>
            <AlertCircle size={32} className={styles.errorIcon} />
            <p className={styles.errorText}>{error}</p>
            <button className={styles.retryButton} onClick={() => setStep('upload')}>
              Try another file
            </button>
          </div>
        )}

        {step === 'preview' && (
          <div className={styles.previewArea}>
            <div className={styles.fields}>
              <div className={styles.field}>
                <label className={styles.label}>Aircraft Name:</label>
                <input
                  className={styles.input}
                  value={planeName}
                  onChange={(e) => { setPlaneName(e.target.value); setResult(null); }}
                  placeholder="e.g. Cessna 208B"
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Manufacturer:</label>
                <input
                  className={styles.input}
                  value={manufacturer}
                  onChange={(e) => { setManufacturer(e.target.value); setResult(null); }}
                  placeholder="e.g. Cessna"
                />
              </div>
              <button
                className={styles.parseButton}
                onClick={handleParse}
                disabled={!planeName.trim() || !manufacturer.trim()}
              >
                Parse Checklist
              </button>
            </div>

            {error && <p className={styles.errorText}>{error}</p>}

            {result && (
              <div className={styles.resultPreview}>
                <div className={styles.resultHeader}>
                  <Check size={16} className={styles.successIcon} />
                  <span>
                    Found {result.checklist.phases.length} phase{result.checklist.phases.length !== 1 ? 's' : ''},{' '}
                    {result.checklist.phases.reduce((sum, p) => sum + p.items.length, 0)} items
                  </span>
                </div>
                <div className={styles.phaseList}>
                  {result.checklist.phases.map(phase => (
                    <div key={phase.id} className={styles.phasePreview}>
                      <strong>{phase.title}</strong>
                      <span className={styles.itemCount}>{phase.items.length} items</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <details className={styles.rawTextDetails}>
              <summary>View extracted text</summary>
              <pre className={styles.rawText}>{rawText.slice(0, 3000)}{rawText.length > 3000 ? '\n...(truncated)' : ''}</pre>
            </details>
          </div>
        )}

        <div className={styles.actions}>
          <button className={styles.cancelButton} onClick={onClose}>
            Cancel
          </button>
          {result && (
            <button className={styles.importButton} onClick={handleImport}>
              Import Checklist
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
