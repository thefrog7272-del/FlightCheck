import { useState } from 'react';
import { Upload, FileText, AlertCircle, Check, AlertTriangle, Info } from 'lucide-react';
import { extractFileText, parseChecklistText } from '../utils/checklistFileParser';
import { validateChecklist, type ImportWarning } from '../utils/checklistValidator';
import styles from './FileImportModal.module.css';
import type { Plane, PlaneChecklist } from '../data/types';

interface FileImportModalProps {
  onImport: (plane: Plane, checklist: PlaneChecklist, variants?: Record<string, PlaneChecklist>) => Promise<void>;
  onClose: () => void;
}

type Step = 'upload' | 'parsing' | 'preview' | 'error';

const PDF_CONVERTER_URL = import.meta.env.VITE_PDF_CONVERTER_URL as string | undefined;

export function FileImportModal({ onImport, onClose }: FileImportModalProps) {
  const [step, setStep] = useState<Step>('upload');
  const [error, setError] = useState('');
  const [rawText, setRawText] = useState('');
  const [planeName, setPlaneName] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [result, setResult] = useState<{ plane: Plane; checklist: PlaneChecklist; variants?: Record<string, PlaneChecklist> } | null>(null);
  const [warnings, setWarnings] = useState<ImportWarning[]>([]);
  const [importing, setImporting] = useState(false);

  const handleFile = async (file: File) => {
    setStep('parsing');
    setError('');

    const isPdf = file.name.toLowerCase().endsWith('.pdf');

    // For PDFs, try the Lambda converter first
    if (isPdf && PDF_CONVERTER_URL) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
        const response = await fetch(PDF_CONVERTER_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pdf: base64, filename: file.name }),
        });
        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(body.error || `Server error ${response.status}`);
        }
        const data = await response.json();
        const { plane, checklist, variants } = data as {
          plane: Plane;
          checklist: PlaneChecklist;
          variants: Record<string, PlaneChecklist>;
        };
        setPlaneName(plane.name);
        setManufacturer(plane.manufacturer || '');
        setResult({ plane, checklist, variants });
        setWarnings(validateChecklist(checklist, plane));
        setStep('preview');
        return;
      } catch (err) {
        console.warn('[FlightCheck] Lambda converter failed, falling back to local parser:', err);
        // Fall through to local pdfjs parsing
      }
    }

    // Local fallback: pdfjs text extraction
    try {
      const text = await extractFileText(file);
      setRawText(text);
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
      setWarnings(validateChecklist(parsed.checklist, parsed.plane));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse checklist');
      setResult(null);
      setWarnings([]);
    }
  };

  // Re-parse when name/manufacturer change (local fallback path only)
  const handleNameChange = (name: string) => {
    setPlaneName(name);
    if (result && !PDF_CONVERTER_URL) {
      setResult(null);
      setWarnings([]);
    } else if (result) {
      // Update plane name in the Lambda result
      const updatedId = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      setResult(prev => prev ? {
        ...prev,
        plane: { ...prev.plane, name, id: updatedId },
        checklist: { ...prev.checklist, planeId: updatedId },
        variants: prev.variants ? Object.fromEntries(
          Object.entries(prev.variants).map(([k, v]) => [k, { ...v, planeId: updatedId }])
        ) : undefined,
      } : null);
    }
  };

  const handleManufacturerChange = (mfr: string) => {
    setManufacturer(mfr);
    if (result) {
      setResult(prev => prev ? { ...prev, plane: { ...prev.plane, manufacturer: mfr } } : null);
    }
  };

  const handleImport = async () => {
    if (!result) return;
    setImporting(true);
    try {
      await onImport(result.plane, result.checklist, result.variants);
    } finally {
      setImporting(false);
    }
  };

  // Whether we're in the Lambda-parsed path (name/manufacturer already set)
  const isLambdaResult = !!result;
  const needsManualParse = !isLambdaResult && !!rawText;

  const totalItems = result?.checklist.phases.reduce((s, p) => s + p.items.length, 0) ?? 0;
  const variantNames = result?.variants ? Object.keys(result.variants) : [];

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
              {PDF_CONVERTER_URL
                ? 'PDFs will be parsed automatically using the cloud converter.'
                : 'The parser will extract phases and items from the document.'}
            </p>
          </div>
        )}

        {step === 'parsing' && (
          <div className={styles.center}>
            <FileText size={32} className={styles.spinner} />
            <p>{PDF_CONVERTER_URL ? 'Converting PDF…' : 'Extracting text from file…'}</p>
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
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Cessna 208B"
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Manufacturer:</label>
                <input
                  className={styles.input}
                  value={manufacturer}
                  onChange={(e) => handleManufacturerChange(e.target.value)}
                  placeholder="e.g. Cessna"
                />
              </div>
              {needsManualParse && (
                <button
                  className={styles.parseButton}
                  onClick={handleParse}
                  disabled={!planeName.trim() || !manufacturer.trim()}
                >
                  Parse Checklist
                </button>
              )}
            </div>

            {error && <p className={styles.errorText}>{error}</p>}

            {result && (
              <div className={styles.resultPreview}>
                <div className={styles.resultHeader}>
                  <Check size={16} className={styles.successIcon} />
                  <span>
                    Found {result.checklist.phases.length} phase{result.checklist.phases.length !== 1 ? 's' : ''},{' '}
                    {totalItems} items
                    {variantNames.length > 0 && ` + ${variantNames.join(', ')}`}
                  </span>
                </div>
                <div className={styles.phaseList}>
                  {result.checklist.phases.map(phase => (
                    <div key={phase.id} className={styles.phasePreview}>
                      <strong>{phase.title}</strong>
                      <span className={styles.itemCount}>{phase.items.length} items</span>
                    </div>
                  ))}
                  {variantNames.map(name => (
                    <div key={name} className={styles.phasePreview} style={{ opacity: 0.7 }}>
                      <strong>{name} (sub-checklist)</strong>
                      <span className={styles.itemCount}>
                        {result.variants![name].phases.reduce((s, p) => s + p.items.length, 0)} items
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {warnings.length > 0 && (
              <div className={styles.warningsList}>
                {warnings.map((w, i) => (
                  <div key={i} className={`${styles.warningItem} ${styles[w.level]}`}>
                    {w.level === 'error' ? <AlertCircle size={14} /> :
                     w.level === 'warning' ? <AlertTriangle size={14} /> :
                     <Info size={14} />}
                    <span>{w.message}</span>
                  </div>
                ))}
              </div>
            )}

            {rawText && (
              <details className={styles.rawTextDetails}>
                <summary>View extracted text</summary>
                <pre className={styles.rawText}>{rawText.slice(0, 3000)}{rawText.length > 3000 ? '\n...(truncated)' : ''}</pre>
              </details>
            )}
          </div>
        )}

        <div className={styles.actions}>
          <button className={styles.cancelButton} onClick={onClose}>
            Cancel
          </button>
          {result && (
            <button className={styles.importButton} onClick={handleImport} disabled={importing}>
              {importing ? 'Importing…' : 'Import Checklist'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
