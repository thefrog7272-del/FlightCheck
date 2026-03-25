import { useState, useEffect, useRef } from 'react';
import styles from './ImageEditModal.module.css';

interface ImageEditModalProps {
  planeName: string;
  currentImage: string;
  onSave: (newImage: string) => void;
  onCancel: () => void;
}

export function ImageEditModal({
  planeName,
  currentImage,
  onSave,
  onCancel,
}: ImageEditModalProps) {
  const [urlValue, setUrlValue] = useState(currentImage);
  const [previewSrc, setPreviewSrc] = useState(currentImage);
  const [imgError, setImgError] = useState(false);

  const urlInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const saveRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Focus the URL input on mount
  useEffect(() => {
    urlInputRef.current?.focus();
  }, []);

  // Close on Escape + focus trap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
        return;
      }

      if (e.key === 'Tab') {
        const focusable = [
          urlInputRef.current,
          fileInputRef.current,
          cancelRef.current,
          saveRef.current,
        ].filter(Boolean) as HTMLElement[];
        if (focusable.length === 0) return;

        const currentIndex = focusable.indexOf(document.activeElement as HTMLElement);

        if (e.shiftKey) {
          e.preventDefault();
          const prev = currentIndex <= 0 ? focusable.length - 1 : currentIndex - 1;
          focusable[prev].focus();
        } else {
          e.preventDefault();
          const next = currentIndex >= focusable.length - 1 ? 0 : currentIndex + 1;
          focusable[next].focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUrlValue(value);
    setPreviewSrc(value);
    setImgError(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setUrlValue(dataUrl);
        setPreviewSrc(dataUrl);
        setImgError(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSave(urlValue);
  };

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div
        className={styles.modal}
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="image-edit-title"
      >
        <h2 className={styles.title} id="image-edit-title">
          Edit Image — {planeName}
        </h2>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="image-url-input">
            Image URL
          </label>
          <input
            ref={urlInputRef}
            id="image-url-input"
            type="text"
            className={styles.urlInput}
            value={urlValue}
            onChange={handleUrlChange}
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div className={styles.divider}>or</div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="image-file-input">
            Upload File
          </label>
          <input
            ref={fileInputRef}
            id="image-file-input"
            type="file"
            accept="image/*"
            className={styles.fileInput}
            onChange={handleFileChange}
          />
        </div>

        <div className={styles.previewWrapper}>
          <span className={styles.previewLabel}>Preview</span>
          {previewSrc && !imgError ? (
            <img
              src={previewSrc}
              alt="Preview"
              className={styles.previewImage}
              onError={() => setImgError(true)}
            />
          ) : (
            <div className={styles.previewPlaceholder}>
              {imgError ? 'Failed to load image' : 'No image to preview'}
            </div>
          )}
        </div>

        <div className={styles.actions}>
          <button
            ref={cancelRef}
            className={styles.cancelButton}
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            ref={saveRef}
            className={styles.saveButton}
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
