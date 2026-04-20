import { useState, useRef, useEffect, useCallback } from 'react';
import type { MutableRefObject } from 'react';
import { X, Minus, Mic, MicOff, NotebookPen, Trash2 } from 'lucide-react';
import styles from './Scratchpad.module.css';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { dispatchScratchpadEvent } from '../hooks/useScratchpad';

interface Props {
  onClose: () => void;
  onEraseRef?: MutableRefObject<(() => void) | null>;
  onDictateRef?: MutableRefObject<(() => void) | null>;
  currentChecklistId?: string | null;
}

type WSAResult = { isFinal: boolean; 0: { transcript: string } };
type WSAEvent = Event & { results: ArrayLike<WSAResult>; resultIndex: number };
type WSAErrorEvent = Event & { error: string };
type WSARecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((e: WSAEvent) => void) | null;
  onerror: ((e: WSAErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
};
type WSARecognitionCtor = new () => WSARecognition;

function getRecognitionClass(): WSARecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    SpeechRecognition?: WSARecognitionCtor;
    webkitSpeechRecognition?: WSARecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

function defaultPos() {
  return { x: Math.max(0, window.innerWidth - 400), y: Math.max(0, window.innerHeight - 440) };
}

function getChecklistDefaultPos() {
  // Position in upper right, below header and aligned with timer/search bar right edge
  const header = document.querySelector('header');
  const timerOrSearch = document.querySelector('[class*="timer"]') || document.querySelector('[class*="search"]');

  if (!header) return defaultPos();

  const headerRect = header.getBoundingClientRect();
  const headerBottom = headerRect.bottom;

  // Align with the right side of the timer/search area, or use right edge with padding
  let x = window.innerWidth - 360 - 16; // Right aligned with 16px padding from edge

  if (timerOrSearch) {
    const timerRect = timerOrSearch.getBoundingClientRect();
    x = timerRect.right - 360 + 16; // Align right edge of notepad with right edge of timer area
  }

  const y = headerBottom + 8; // 8px below header

  return {
    x: Math.max(0, Math.min(x, window.innerWidth - 360)),
    y: Math.max(0, y),
  };
}

export function Scratchpad({ onClose, onEraseRef, onDictateRef, currentChecklistId }: Props) {
  const [text, setText] = useLocalStorage<string>('scratchpad_text', '');

  // Always use global position key (don't persist checklist-specific positions)
  const [posFromStorage, setPos] = useLocalStorage<{ x: number; y: number }>('scratchpad_pos', defaultPos());

  // While on a checklist, use local state for position (don't save to localStorage)
  const [localPos, setLocalPos] = useState<{ x: number; y: number } | null>(null);
  const pos = currentChecklistId && localPos ? localPos : posFromStorage;

  const handleSetPos = useCallback((newPos: { x: number; y: number }) => {
    if (currentChecklistId) {
      // On a checklist — update local state only (don't persist)
      setLocalPos(newPos);
    } else {
      // Not on a checklist — update localStorage
      setPos(newPos);
    }
  }, [currentChecklistId, setPos]);

  const [minimized, setMinimized] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);

  const panelRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<WSARecognition | null>(null);
  const dragState = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const prevChecklistIdRef = useRef(currentChecklistId);
  const posRef = useRef(pos);
  useEffect(() => { posRef.current = pos; }, [pos]);

  // Position the notepad when on a checklist or when checklist changes
  useEffect(() => {
    if (currentChecklistId) {
      // On a checklist — position next to mute button (in local state, not persisted)
      // Small delay to ensure DOM is ready and mute button is rendered
      const timer = setTimeout(() => {
        const newPos = getChecklistDefaultPos();
        setLocalPos(newPos);
      }, 50);
      prevChecklistIdRef.current = currentChecklistId;
      return () => clearTimeout(timer);
    } else if (!currentChecklistId && prevChecklistIdRef.current) {
      // Navigated away from checklist — clear local state, revert to saved position
      setLocalPos(null);
      prevChecklistIdRef.current = null;
    }
  }, [currentChecklistId]);

  // Track isListening in a ref so recognition callbacks don't get stale closures
  const isListeningRef = useRef(false);
  useEffect(() => { isListeningRef.current = isListening; }, [isListening]);
  // Keep a stable ref to current text so toggleMic doesn't capture a stale value
  const textRef = useRef(text);
  useEffect(() => { textRef.current = text; }, [text]);

  const doClear = useCallback(() => {
    setText('');
    committedBaseRef.current = '';
  }, [setText]);

  // Register erase callback so the voice hook can call it via the ref
  useEffect(() => {
    if (onEraseRef) onEraseRef.current = doClear;
    return () => { if (onEraseRef) onEraseRef.current = null; };
  }, [onEraseRef, doClear]);

  // Clamp position when window resizes
  useEffect(() => {
    const clamp = () => {
      const el = panelRef.current;
      if (!el) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      handleSetPos({
        x: Math.max(0, Math.min(posRef.current.x, w - el.offsetWidth)),
        y: Math.max(0, Math.min(posRef.current.y, h - el.offsetHeight)),
      });
    };
    window.addEventListener('resize', clamp);
    return () => window.removeEventListener('resize', clamp);
  }, [handleSetPos]);

  // ── Drag ──────────────────────────────────────────────────────────────────
  const onDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    const client = 'touches' in e ? e.touches[0] : e;
    dragState.current = {
      startX: client.clientX,
      startY: client.clientY,
      origX: posRef.current.x,
      origY: posRef.current.y,
    };
    e.preventDefault();
  };

  useEffect(() => {
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!dragState.current) return;
      const client = 'touches' in e ? (e as TouchEvent).touches[0] : (e as MouseEvent);
      const dx = client.clientX - dragState.current.startX;
      const dy = client.clientY - dragState.current.startY;
      const el = panelRef.current;
      const newX = Math.max(0, Math.min(dragState.current.origX + dx, window.innerWidth - (el?.offsetWidth ?? 360)));
      const newY = Math.max(0, Math.min(dragState.current.origY + dy, window.innerHeight - (el?.offsetHeight ?? 80)));
      handleSetPos({ x: newX, y: newY });
    };
    const onUp = () => { dragState.current = null; };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [handleSetPos]);

  // ── Speech recognition ────────────────────────────────────────────────────
  const stopListening = useCallback(() => {
    startListeningRef.current = null;
    isListeningRef.current = false;
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsListening(false);
  }, []);

  // Keep a stable ref to the start function so onend can call it to create
  // a fresh instance — the Web Speech API doesn't allow restarting a used instance.
  const startListeningRef = useRef<(() => void) | null>(null);
  const suppressUntilRef = useRef<number>(0);
  // Tracks the committed (finalised) text at the point dictation started so
  // interim results can be previewed without duplicating finalised words.
  const committedBaseRef = useRef<string>('');

  const toggleMic = useCallback(() => {
    if (isListeningRef.current) { stopListening(); return; }

    const Ctor = getRecognitionClass();
    if (!Ctor) { setMicError('Speech recognition not supported in this browser'); return; }

    suppressUntilRef.current = 0;

    function startSession() {
      if (!isListeningRef.current && recognitionRef.current !== null) return; // was stopped

      const rec = new Ctor!();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onresult = (e: WSAEvent) => {
        if (Date.now() < suppressUntilRef.current) return;

        let finalChunk = '';
        let interimChunk = '';

        for (let i = e.resultIndex; i < e.results.length; i++) {
          const t = e.results[i][0].transcript;
          if (e.results[i].isFinal) finalChunk += t;
          else interimChunk += t;
        }

        if (finalChunk) {
          // Check stop commands on final results only
          const lower = finalChunk.trim().toLowerCase();
          if (lower === 'stop dictating' || lower === 'stop dictate' || lower === 'stop') {
            stopListening();
            return;
          }
          // Update committedBaseRef synchronously so the next interim/final
          // result from a new session reads the correct base immediately.
          const base = committedBaseRef.current;
          const sep = base.trim().length > 0 && !base.endsWith('\n') ? ' ' : '';
          const committed = base + sep + finalChunk.trim();
          committedBaseRef.current = committed;
          setText(committed);
        } else if (interimChunk) {
          // Show interim preview — replace everything after the committed base
          const base = committedBaseRef.current;
          const sep = base.trim().length > 0 && !base.endsWith('\n') ? ' ' : '';
          setText(base + sep + interimChunk.trim());
        }

        if (textareaRef.current) {
          textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
        }
      };

      rec.onerror = (e: WSAErrorEvent) => {
        if (e.error === 'aborted' || e.error === 'no-speech') return;
        setMicError(`Mic error: ${e.error}`);
        stopListening();
      };

      rec.onend = () => {
        // Only restart if we're still in listening mode — create a NEW instance
        // because the Web Speech API does not support restarting a used instance.
        if (isListeningRef.current) {
          startListeningRef.current?.();
        }
      };

      recognitionRef.current = rec;
      try {
        rec.start();
      } catch {
        setMicError('Could not start microphone');
      }
    }

    // eslint-disable-next-line react-hooks/immutability
    startListeningRef.current = startSession;
    setMicError(null);
    setIsListening(true);
    isListeningRef.current = true;
    // Seed the committed base with the current text (use ref to avoid stale closure)
    // eslint-disable-next-line react-hooks/immutability
    committedBaseRef.current = textRef.current;
    // Stop checklist voice recognition — Chrome only allows one instance at a time
    dispatchScratchpadEvent('stop-voice');
    startSession();
  }, [stopListening, setText]);

  // Register dictate toggle ref — after toggleMic is defined
  useEffect(() => {
    if (onDictateRef) onDictateRef.current = toggleMic;
    return () => { if (onDictateRef) onDictateRef.current = null; };
  }, [onDictateRef, toggleMic]);

  // Stop mic on unmount
  useEffect(() => () => { recognitionRef.current?.stop(); }, []);

  const handleClear = () => {
    doClear();
  };

  return (
    <div
      ref={panelRef}
      className={`${styles.panel} ${minimized ? styles.minimized : ''}`}
      style={{ left: pos.x, top: pos.y }}
      role="dialog"
      aria-label="Scratchpad"
    >
      {/* Title bar — drag handle */}
      <div
        className={styles.titleBar}
        onMouseDown={onDragStart}
        onTouchStart={onDragStart}
      >
        <NotebookPen size={14} className={styles.titleIcon} />
        <span className={styles.titleText}>Scratchpad</span>
        <div className={styles.titleActions}>
          <button
            className={styles.titleBtn}
            onClick={() => setMinimized(m => !m)}
            title={minimized ? 'Restore' : 'Minimise'}
          >
            <Minus size={13} />
          </button>
          <button
            className={styles.titleBtn}
            onClick={() => { stopListening(); onClose(); }}
            title="Close"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {!minimized && (
        <>
          <textarea
            ref={textareaRef}
            className={styles.textarea}
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Type notes here, or press the mic to dictate…"
            spellCheck
          />
          <div className={styles.footer}>
            {micError && <span className={styles.micError}>{micError}</span>}
            <span className={styles.charCount}>{text.length} chars</span>
            <button
              className={styles.footerBtn}
              onClick={handleClear}
              title="Clear notes"
              disabled={!text.trim()}
            >
              <Trash2 size={14} />
            </button>
            <button
              className={`${styles.footerBtn} ${isListening ? styles.micActive : ''}`}
              onClick={toggleMic}
              title={isListening ? 'Stop dictating' : 'Dictate notes'}
            >
              {isListening ? <MicOff size={14} /> : <Mic size={14} />}
              {isListening ? 'Stop' : 'Dictate'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
