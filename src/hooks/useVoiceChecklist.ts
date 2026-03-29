import { useState, useCallback, useRef, useEffect, useMemo } from 'react';

// ── Local Web Speech API types ────────────────────────────────────────────────
// TypeScript's DOM lib has partial Speech Recognition coverage; we define the
// minimal surface we need here to avoid "Cannot find name" errors.

interface WSAAlternative { readonly transcript: string }
interface WSAResult {
  readonly isFinal: boolean;
  readonly length: number;
  [index: number]: WSAAlternative;
}
interface WSAResultList {
  readonly length: number;
  [index: number]: WSAResult;
}
interface WSAEvent extends Event { readonly results: WSAResultList }
interface WSAErrorEvent extends Event { readonly error: string }
interface WSARecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: ((ev: Event) => void) | null;
  onend: ((ev: Event) => void) | null;
  onerror: ((ev: WSAErrorEvent) => void) | null;
  onresult: ((ev: WSAEvent) => void) | null;
  start(): void;
  stop(): void;
}
type WSARecognitionCtor = new () => WSARecognition;

// ─────────────────────────────────────────────────────────────────────────────

type PhaseItem = {
  id: string;
  label: string;
  expectedState?: string;
  phaseTitle: string;
};

interface UseVoiceChecklistProps {
  phases: Array<{
    id: string;
    title: string;
    items: Array<{ id: string; label: string; expectedState?: string }>;
  }>;
  checkedItems: Record<string, boolean>;
  onCheckItem: (itemId: string) => void;
}

export interface VoiceChecklistReturn {
  isVoiceMode: boolean;
  isListening: boolean;
  isSupported: boolean;
  currentItemId: string | null;
  lastTranscript: string;
  recognitionError: string;
  toggleVoiceMode: () => void;
}

/** Returns the browser's SpeechRecognition constructor (handles webkit prefix). */
function getRecognitionClass(): WSARecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    SpeechRecognition?: WSARecognitionCtor;
    webkitSpeechRecognition?: WSARecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/**
 * Voice-driven checklist mode.
 *
 * TTS reads each item aloud; speech recognition responds to:
 *   "check" / "yes" / "confirmed" / "roger"  → check current item + advance
 *   "next"  / "skip" / "pass"                → advance without checking
 *   "back"  / "previous"                     → go to previous item
 *   "repeat" / "again"                       → re-read current item
 *   "stop"  / "exit" / "cancel"              → exit voice mode
 */
export function useVoiceChecklist({
  phases,
  checkedItems,
  onCheckItem,
}: UseVoiceChecklistProps): VoiceChecklistReturn {
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentItemId, setCurrentItemId] = useState<string | null>(null);
  const [lastTranscript, setLastTranscript] = useState('');
  const [recognitionError, setRecognitionError] = useState('');

  const RecognitionClass = useMemo(getRecognitionClass, []);
  const isSupported =
    !!RecognitionClass &&
    typeof window !== 'undefined' &&
    'speechSynthesis' in window;

  // ── Refs for volatile data (avoids stale closures inside recognition effect) ──
  const currentItemIdRef = useRef<string | null>(null);
  const checkedItemsRef = useRef(checkedItems);
  const onCheckItemRef = useRef(onCheckItem);
  const allItemsRef = useRef<PhaseItem[]>([]);

  const allItems = useMemo(
    (): PhaseItem[] =>
      phases.flatMap(phase =>
        phase.items.map(item => ({ ...item, phaseTitle: phase.title })),
      ),
    [phases],
  );

  useEffect(() => { currentItemIdRef.current = currentItemId; }, [currentItemId]);
  useEffect(() => { checkedItemsRef.current = checkedItems; }, [checkedItems]);
  useEffect(() => { onCheckItemRef.current = onCheckItem; }, [onCheckItem]);
  useEffect(() => { allItemsRef.current = allItems; }, [allItems]);

  const toggleVoiceMode = useCallback(() => {
    setIsVoiceMode(prev => !prev);
  }, []);

  // ── Core effect: set up recognition + TTS whenever voice mode toggles ──────
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!isVoiceMode || !RecognitionClass) return;

    let shouldListen = true;
    let speaking = false;
    const rec = new RecognitionClass();
    rec.continuous = false; // non-continuous is more reliable; onend restart handles looping
    rec.interimResults = true;
    rec.lang = 'en-US';

    function stopRec() {
      try { rec.stop(); } catch { /* already stopped */ }
    }
    function startRec() {
      if (!shouldListen || speaking) return;
      try { rec.start(); } catch { /* already running */ }
    }

    // Shared TTS fallback timer — cancelled whenever a new speakText call
    // begins, so the old timer never fires into a new utterance.
    let ttsTimer: ReturnType<typeof setTimeout> | null = null;

    function speakText(text: string, onEnd?: () => void) {
      if (!('speechSynthesis' in window)) return;
      window.speechSynthesis.cancel();
      stopRec();
      speaking = true;

      // Cancel any previous fallback timer before setting a new one
      if (ttsTimer) clearTimeout(ttsTimer);

      const utt = new SpeechSynthesisUtterance(text);
      utt.rate = 0.88;
      utt.pitch = 1.0;

      // Chrome bug: SpeechSynthesisUtterance.onend sometimes never fires.
      // Fallback: force-release the speaking lock after an estimated duration.
      const fallbackMs = text.length * 80 + 1200;
      ttsTimer = setTimeout(() => {
        if (speaking) {
          speaking = false;
          startRec();
          onEnd?.();
        }
      }, fallbackMs);

      utt.onend = () => {
        if (ttsTimer) clearTimeout(ttsTimer);
        speaking = false;
        startRec();
        onEnd?.();
      };
      window.speechSynthesis.speak(utt);
    }

    function itemText(item: PhaseItem): string {
      return item.expectedState
        ? `${item.label}... ${item.expectedState}`
        : item.label;
    }

    function navigateTo(itemId: string | null) {
      if (!itemId) {
        setCurrentItemId(null);
        speakText('Checklist complete. Well done!');
        return;
      }
      const prevPhase = allItemsRef.current.find(
        i => i.id === currentItemIdRef.current,
      )?.phaseTitle;
      const next = allItemsRef.current.find(i => i.id === itemId);
      setCurrentItemId(itemId);
      if (next && prevPhase !== next.phaseTitle) {
        speakText(`${next.phaseTitle}. ${itemText(next)}`);
      } else if (next) {
        speakText(itemText(next));
      }
    }

    function getNext(): string | null {
      const items = allItemsRef.current;
      const cur = currentItemIdRef.current;
      const idx = cur ? items.findIndex(i => i.id === cur) : -1;
      return items[idx + 1]?.id ?? null;
    }

    function getPrev(): string | null {
      const items = allItemsRef.current;
      const cur = currentItemIdRef.current;
      const idx = cur ? items.findIndex(i => i.id === cur) : items.length;
      return items[idx - 1]?.id ?? null;
    }

    // Chrome silently pauses speechSynthesis after ~15 s; resume() keeps it alive.
    const keepAlive = setInterval(() => {
      if (window.speechSynthesis.speaking && window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    }, 10_000);

    rec.onstart = () => { setIsListening(true); };
    rec.onend = () => {
      setIsListening(false);
      if (shouldListen && !speaking) setTimeout(startRec, 200);
    };
    rec.onerror = (e: WSAErrorEvent) => {
      setRecognitionError(e.error);
      if (e.error !== 'no-speech') console.warn('[Voice] recognition error:', e.error);
    };
    // All command keywords in one flat list for quick lookup
    const COMMAND_WORDS = [
      'stop', 'exit', 'quit', 'cancel', 'voice off',
      'repeat', 'again', 'say again', 'what',
      'check', 'yes', 'confirmed', 'confirm', 'roger', 'affirmative',
      'done', 'complete', 'correct', 'checked', 'good',
      'next', 'skip', 'pass', 'continue', 'move on',
      'back', 'previous', 'go back',
    ];

    // Timestamp of the last fired command — prevents double-firing when
    // Chrome emits both interim and final results for the same utterance.
    let lastCommandAt = 0;

    function executeCommand(raw: string) {
      const cmd = raw.toLowerCase().trim();
      const cur = currentItemIdRef.current;

      if (['stop', 'exit', 'quit', 'cancel', 'voice off'].some(w => cmd.includes(w))) {
        shouldListen = false;
        setIsVoiceMode(false);

      } else if (['repeat', 'again', 'say again', 'what'].some(w => cmd.includes(w))) {
        const item = allItemsRef.current.find(i => i.id === cur);
        if (item) speakText(itemText(item));

      } else if (
        ['check', 'yes', 'confirmed', 'confirm', 'roger', 'affirmative',
          'done', 'complete', 'correct', 'checked', 'good'].some(w => cmd.includes(w))
      ) {
        if (cur && !checkedItemsRef.current[cur]) {
          onCheckItemRef.current(cur);
        }
        navigateTo(getNext());

      } else if (['next', 'skip', 'pass', 'continue', 'move on'].some(w => cmd.includes(w))) {
        navigateTo(getNext());

      } else if (['back', 'previous', 'go back'].some(w => cmd.includes(w))) {
        const p = getPrev();
        if (p) navigateTo(p);
      }
    }

    rec.onresult = (e: WSAEvent) => {
      const result = e.results[e.results.length - 1];
      const raw = result[0].transcript;

      // Always show live transcript so user can confirm mic is working
      setLastTranscript(raw);
      setRecognitionError(''); // clear any previous error — speech is being heard

      const cmd = raw.toLowerCase().trim();

      // Ignore long transcripts — voice commands are always short phrases.
      // This prevents background speech / ambient audio from accidentally
      // matching a command word buried in a longer sentence.
      if (cmd.split(/\s+/).length > 6) return;

      // Fire as soon as a command word appears in the transcript — don't
      // wait for isFinal (Chrome continuous mode often never sends it).
      // The 1.5 s cooldown stops the same utterance firing twice when
      // Chrome does emit both an interim and a final result.
      if (!COMMAND_WORDS.some(w => cmd.includes(w))) return;

      const now = Date.now();
      if (now - lastCommandAt < 1500) return;
      lastCommandAt = now;

      executeCommand(raw);
    };

    // Find first unchecked item (or fall back to first item)
    const first =
      allItemsRef.current.find(i => !checkedItemsRef.current[i.id]) ??
      allItemsRef.current[0] ??
      null;

    setCurrentItemId(first?.id ?? null);

    const intro = first
      ? `Voice checklist active. ${first.phaseTitle}. ${itemText(first)}`
      : 'Voice checklist active. No items found.';
    speakText(intro);

    return () => {
      shouldListen = false;
      if (ttsTimer) clearTimeout(ttsTimer);
      clearInterval(keepAlive);
      window.speechSynthesis?.cancel();
      stopRec();
      rec.onend = null;
      rec.onresult = null;
      setIsListening(false);
      setCurrentItemId(null);
      setLastTranscript('');
      setRecognitionError('');
    };
  }, [isVoiceMode]); // RecognitionClass is stable (memo on []); all volatile data via refs

  return { isVoiceMode, isListening, isSupported, currentItemId, lastTranscript, recognitionError, toggleVoiceMode };
}
