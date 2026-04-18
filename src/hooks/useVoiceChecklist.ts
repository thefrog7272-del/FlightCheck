import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { dispatchScratchpadEvent, subscribeScratchpadEvents } from './useScratchpad';

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
  isAnnotation?: boolean;
  annotationType?: 'caution' | 'note' | 'warning';
};

interface UseVoiceChecklistProps {
  phases: Array<{
    id: string;
    title: string;
    items: Array<{ id: string; label: string; expectedState?: string }>;
    annotations?: Array<{ type: 'caution' | 'note' | 'warning'; text: string }>;
  }>;
  checkedItems: Record<string, boolean>;
  onCheckItem: (itemId: string) => void;
  /** Called with all unchecked item IDs in the current phase when the user says "next phase". */
  onCompletePhase?: (itemIds: string[]) => void;
  /** Called with a category name ('Standard', 'Abnormal', 'Emergency', 'Reference Tables') when user says a navigation command. */
  onNavigateCategory?: (category: string) => void;
}

export interface VoiceChecklistReturn {
  isVoiceMode: boolean;
  isListening: boolean;
  isSupported: boolean;
  currentItemId: string | null;
  lastTranscript: string;
  recognitionError: string;
  toggleVoiceMode: () => void;
  readExpectedState: boolean;
  toggleReadExpectedState: () => void;
  readAnnotations: boolean;
  toggleReadAnnotations: () => void;
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
 *   "notepad" / "open notepad"               → toggle scratchpad
 *   "erase"  / "clear notes"                 → erase scratchpad
 */
export function useVoiceChecklist({
  phases,
  checkedItems,
  onCheckItem,
  onCompletePhase,
  onNavigateCategory,
}: UseVoiceChecklistProps): VoiceChecklistReturn {
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentItemId, setCurrentItemId] = useState<string | null>(null);
  const [lastTranscript, setLastTranscript] = useState('');
  const [recognitionError, setRecognitionError] = useState('');
  const [readExpectedState, setReadExpectedState] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('voice_read_expected_state');
      return stored === null ? false : stored === 'true';
    } catch { return false; }
  });

  const [readAnnotations, setReadAnnotations] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('voice_read_annotations');
      return stored === null ? true : stored === 'true';
    } catch { return true; }
  });

  // eslint-disable-next-line react-hooks/use-memo
  const RecognitionClass = useMemo(getRecognitionClass, []);
  const isSupported =
    !!RecognitionClass &&
    typeof window !== 'undefined' &&
    'speechSynthesis' in window;

  // Listen for hotkey toggle from the Chrome extension (works when browser is not focused)
  useEffect(() => {
    if (!isSupported) return;
    function handleMessage(e: MessageEvent) {
      if (e.data?.type === 'FLIGHTCHECK_TOGGLE_VOICE') {
        console.log('[FlightCheck] postMessage received — toggling voice mode');
        setIsVoiceMode(prev => !prev);
      }
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isSupported]);

  // Listen for hardware play/pause media key via Media Session API
  // Works when the browser tab is in the background.
  // playbackState must be non-'none' AND metadata must be set for the browser
  // to route hardware media key events to this page.
  useEffect(() => {
    if (!isSupported || !('mediaSession' in navigator)) return;
    const toggle = () => setIsVoiceMode(prev => !prev);
    navigator.mediaSession.metadata = new MediaMetadata({
      title: 'FlightCheck',
      artist: 'Voice Checklist',
    });
    navigator.mediaSession.playbackState = 'paused';
    navigator.mediaSession.setActionHandler('play', toggle);
    navigator.mediaSession.setActionHandler('pause', toggle);
    return () => {
      navigator.mediaSession.setActionHandler('play', null);
      navigator.mediaSession.setActionHandler('pause', null);
      navigator.mediaSession.playbackState = 'none';
      navigator.mediaSession.metadata = null;
    };
  }, [isSupported]);

  // ── Refs for volatile data (avoids stale closures inside recognition effect) ──
  const currentItemIdRef = useRef<string | null>(null);
  const checkedItemsRef = useRef(checkedItems);
  const onCheckItemRef = useRef(onCheckItem);
  const onCompletePhaseRef = useRef(onCompletePhase);
  const onNavigateCategoryRef = useRef(onNavigateCategory);
  const phasesRef = useRef(phases);
  const allItemsRef = useRef<PhaseItem[]>([]);

  const readAnnotationsRef = useRef(readAnnotations);
  useEffect(() => { readAnnotationsRef.current = readAnnotations; }, [readAnnotations]);

  const allItems = useMemo(
    (): PhaseItem[] =>
      phases.flatMap(phase =>
        phase.items.map(item => ({
          ...item,
          phaseTitle: phase.title,
          isAnnotation: !!item.annotationType,
          annotationType: item.annotationType,
        })),
      ),
    [phases],
  );

  useEffect(() => { currentItemIdRef.current = currentItemId; }, [currentItemId]);
  useEffect(() => { checkedItemsRef.current = checkedItems; }, [checkedItems]);
  useEffect(() => { onCheckItemRef.current = onCheckItem; }, [onCheckItem]);
  useEffect(() => { onCompletePhaseRef.current = onCompletePhase; }, [onCompletePhase]);
  useEffect(() => { onNavigateCategoryRef.current = onNavigateCategory; }, [onNavigateCategory]);
  useEffect(() => { phasesRef.current = phases; }, [phases]);
  useEffect(() => { allItemsRef.current = allItems; }, [allItems]);

  const toggleVoiceMode = useCallback(() => {
    setIsVoiceMode(prev => !prev);
  }, []);

  // When scratchpad dictation starts, turn off checklist voice mode so both
  // don't compete for the microphone.
  useEffect(() => {
    return subscribeScratchpadEvents(action => {
      if (action === 'stop-voice') setIsVoiceMode(false);
    });
  }, []);

  const toggleReadExpectedState = useCallback(() => {
    setReadExpectedState(prev => {
      const next = !prev;
      try { localStorage.setItem('voice_read_expected_state', String(next)); } catch { /* quota */ }
      return next;
    });
  }, []);

  const toggleReadAnnotations = useCallback(() => {
    setReadAnnotations(prev => {
      const next = !prev;
      try { localStorage.setItem('voice_read_annotations', String(next)); } catch { /* quota */ }
      return next;
    });
  }, []);

  const readExpectedStateRef = useRef(readExpectedState);
  useEffect(() => { readExpectedStateRef.current = readExpectedState; }, [readExpectedState]);

  // ── Core effect: set up recognition + TTS whenever voice mode toggles ──────
   
  useEffect(() => {
    if (!isVoiceMode || !RecognitionClass) return;

    let shouldListen = true;
    let speaking = false;

    // Play a silent looping audio so Chrome routes hardware media keys to this
    // page. Without active audio Chrome ignores media key handlers.
    let audioCtx: AudioContext | null = null;
    let silentSource: AudioBufferSourceNode | null = null;
    try {
      audioCtx = new AudioContext();
      const buf = audioCtx.createBuffer(1, audioCtx.sampleRate, audioCtx.sampleRate);
      silentSource = audioCtx.createBufferSource();
      silentSource.buffer = buf;
      silentSource.loop = true;
      silentSource.connect(audioCtx.destination);
      silentSource.start();
      if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing';
    } catch { /* started outside a user gesture — media keys may not work */ }
    const rec = new RecognitionClass();
    rec.continuous = false; // non-continuous is more reliable; onend restart handles looping
    rec.interimResults = true;
    rec.lang = 'en-GB';

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

    // Debounce timer for voice commands — prevents multi-word commands like
    // "check all" or "next phase" from firing on the first interim word alone.
    let commandTimer: ReturnType<typeof setTimeout> | null = null;

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
      // Prefer a British English voice if available
      const voices = window.speechSynthesis.getVoices();
      const gbVoice = voices.find(v => v.lang === 'en-GB') ?? voices.find(v => v.lang.startsWith('en-GB'));
      if (gbVoice) utt.voice = gbVoice;

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
      if (item.isAnnotation) {
        const prefix = item.annotationType ? item.annotationType.toUpperCase() : 'NOTE';
        return `${prefix}: ${item.label}`;
      }
      return item.expectedState && readExpectedStateRef.current
        ? `${item.label}... ${item.expectedState}`
        : item.label;
    }

    function navigateTo(itemId: string | null) {
      const prevPhase = allItemsRef.current.find(
        i => i.id === currentItemIdRef.current,
      )?.phaseTitle;
      const next = itemId ? allItemsRef.current.find(i => i.id === itemId) : null;

      // Whenever we leave the current phase (including finishing the checklist),
      // check off any non-annotation items that were left unchecked in the departing phase.
      if (prevPhase && (!next || prevPhase !== next.phaseTitle)) {
        allItemsRef.current
          .filter(i => i.phaseTitle === prevPhase && !i.isAnnotation && !checkedItemsRef.current[i.id])
          .forEach(i => onCheckItemRef.current(i.id));
      }

      if (!itemId) {
        setCurrentItemId(null);
        speakText('Checklist complete. Well done!');
        return;
      }

      setCurrentItemId(itemId);
      if (next?.isAnnotation) {
        // Annotation: speak it then auto-advance to next real item
        const text = prevPhase !== next.phaseTitle
          ? `${next.phaseTitle}. ${itemText(next)}`
          : itemText(next);
        speakText(text, () => navigateTo(getNextFrom(itemId)));
      } else if (next && prevPhase !== next.phaseTitle) {
        speakText(`${next.phaseTitle}. ${itemText(next)}`);
      } else if (next) {
        speakText(itemText(next));
      }
    }

    function getNextFrom(fromId: string): string | null {
      const items = allItemsRef.current;
      const checked = checkedItemsRef.current;
      const idx = items.findIndex(i => i.id === fromId);
      for (let i = idx + 1; i < items.length; i++) {
        if (items[i].isAnnotation) {
          // Include annotation items only when readAnnotations is on
          if (readAnnotationsRef.current) return items[i].id;
          continue;
        }
        if (!checked[items[i].id]) return items[i].id;
      }
      return null;
    }

    function getNext(): string | null {
      const items = allItemsRef.current;
      const cur = currentItemIdRef.current;
      const checked = checkedItemsRef.current;
      const idx = cur ? items.findIndex(i => i.id === cur) : -1;
      for (let i = idx + 1; i < items.length; i++) {
        if (items[i].isAnnotation) {
          if (readAnnotationsRef.current) return items[i].id;
          continue;
        }
        if (!checked[items[i].id]) return items[i].id;
      }
      return null;
    }

    function getPrev(): string | null {
      const items = allItemsRef.current;
      const cur = currentItemIdRef.current;
      const checked = checkedItemsRef.current;
      const idx = cur ? items.findIndex(i => i.id === cur) : items.length;
      for (let i = idx - 1; i >= 0; i--) {
        if (items[i].isAnnotation) continue; // skip annotations when going back
        if (!checked[items[i].id]) return items[i].id;
      }
      return null;
    }

    function jumpToNextPhase() {
      const cur = currentItemIdRef.current;
      const phasesList = phasesRef.current;
      const currentPhase = phasesList.find(p => p.items.some(i => i.id === cur));
      if (!currentPhase) return;

      // Bulk-check all unchecked non-annotation items in the current phase in one state update.
      // We bypass navigateTo here to avoid its per-item onCheckItemRef loop, which
      // reads a stale checkedItems snapshot and causes only the last item to be saved.
      const unchecked = currentPhase.items
        .filter(i => !checkedItemsRef.current[i.id])
        .map(i => i.id);
      if (unchecked.length > 0 && onCompletePhaseRef.current) {
        onCompletePhaseRef.current(unchecked);
      }

      // Navigate directly — set state + speak without going through navigateTo
      const phaseIdx = phasesList.findIndex(p => p.id === currentPhase.id);
      const nextPhase = phasesList[phaseIdx + 1];
      if (nextPhase && nextPhase.items.length > 0) {
        const nextItemId = nextPhase.items[0].id;
        const nextItem = allItemsRef.current.find(i => i.id === nextItemId);
        setCurrentItemId(nextItemId);
        if (nextItem) speakText(`${nextItem.phaseTitle}. ${itemText(nextItem)}`);
      } else {
        setCurrentItemId(null);
        speakText('Checklist complete. Well done!');
      }
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
    // NOTE: multi-word phrases must appear BEFORE their single-word substrings
    // so the debounce captures the full phrase before the shorter one fires.
    const COMMAND_WORDS = [
      'stop', 'exit', 'quit', 'cancel', 'voice off',
      'repeat', 'again', 'say again', 'what',
      'check', 'yes', 'confirmed', 'confirm', 'roger', 'affirmative',
      'done', 'complete', 'correct', 'checked', 'good',
      'next section', 'next phase', 'complete phase', 'finish phase', 'phase complete', 'jump',
      'next', 'skip', 'pass', 'continue', 'move on',
      'back', 'previous', 'go back',
      // Category navigation — no "checklist" suffix (contains "check" substring, would match check handler)
      // Multi-word phrases listed before bare words so debounce captures full phrase first
      'go normal', 'open normal', 'normal',
      'go abnormal', 'open abnormal', 'abnormal',
      'go emergency', 'open emergency', 'emergency',
      'reference tables', 'go reference', 'open reference', 'reference',
      'open notepad', 'notepad', 'note pad', 'scratchpad', 'scratch pad',
      'clear notes', 'erase notes', 'erase',
      'dictate',
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

      } else if (['next section', 'next phase', 'complete phase', 'finish phase', 'phase complete', 'jump'].some(w => cmd.includes(w))) {
        jumpToNextPhase();

      // Category navigation — checked before 'check'/'go back' to avoid substring matches.
      // 'abnormal' before 'normal' because 'abnormal'.includes('normal') === true.
      } else if (['abnormal', 'go abnormal', 'open abnormal'].some(w => cmd.includes(w))) {
        onNavigateCategoryRef.current?.('Abnormal');
      } else if (['normal', 'go normal', 'open normal'].some(w => cmd.includes(w))) {
        onNavigateCategoryRef.current?.('Standard');
      } else if (['emergency', 'go emergency', 'open emergency'].some(w => cmd.includes(w))) {
        onNavigateCategoryRef.current?.('Emergency');
      } else if (['reference', 'reference tables', 'go reference', 'open reference'].some(w => cmd.includes(w))) {
        onNavigateCategoryRef.current?.('Reference Tables');

      } else if (
        ['check', 'yes', 'confirmed', 'confirm', 'roger', 'affirmative',
          'done', 'complete', 'correct', 'checked', 'good'].some(w => cmd.includes(w))
      ) {
        const curItem = cur ? allItemsRef.current.find(i => i.id === cur) : null;
        if (cur && !curItem?.isAnnotation && !checkedItemsRef.current[cur]) {
          onCheckItemRef.current(cur);
        }
        navigateTo(getNext());

      } else if (['next', 'skip', 'pass', 'continue', 'move on'].some(w => cmd.includes(w))) {
        navigateTo(getNext());

      } else if (['back', 'previous', 'go back'].some(w => cmd.includes(w))) {
        const p = getPrev();
        if (p) navigateTo(p);

      } else if (['open notepad', 'notepad', 'note pad', 'scratchpad', 'scratch pad'].some(w => cmd.includes(w))) {
        dispatchScratchpadEvent('toggle');

      } else if (['clear notes', 'erase notes', 'erase'].some(w => cmd.includes(w))) {
        dispatchScratchpadEvent('erase');

      } else if (cmd.includes('dictate')) {
        // Stop checklist mic first (Chrome allows only one SpeechRecognition at a time),
        // then open scratchpad and start dictation
        setIsVoiceMode(false);
        setTimeout(() => dispatchScratchpadEvent('dictate'), 400);
      }
    }

    function scheduleCommand(raw: string, isFinal: boolean) {
      // Always cancel any pending debounce — new audio is still arriving
      if (commandTimer) { clearTimeout(commandTimer); commandTimer = null; }

      const fire = () => {
        const now = Date.now();
        if (now - lastCommandAt < 1500) {
          console.log('[Voice] command blocked by 1500ms cooldown:', raw);
          return;
        }
        lastCommandAt = now;
        console.log('[Voice] executing command:', raw);
        executeCommand(raw);
      };

      if (isFinal) {
        // Final result — act immediately
        fire();
      } else {
        // Interim result — wait 400 ms in case more words are coming
        commandTimer = setTimeout(fire, 400);
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

      // Check if the transcript matches the current item's expectedState —
      // e.g. saying "full" when the item expects "FULL" counts as a check.
      const currentItem = allItemsRef.current.find(i => i.id === currentItemIdRef.current);
      const expectedState = currentItem?.expectedState?.toLowerCase().trim();
      if (expectedState && cmd.includes(expectedState)) {
        scheduleCommand('check', result.isFinal);
        return;
      }

      if (!COMMAND_WORDS.some(w => cmd.includes(w))) return;

      console.log('[Voice] command word matched:', cmd, '| isFinal:', result.isFinal);
      scheduleCommand(raw, result.isFinal);
    };

    // Voices load asynchronously in Chrome — wait for them before the first
    // utterance, otherwise the browser default (often en-US) is used.
    let voicesChangedHandler: (() => void) | null = null;
    let voicesFallbackTimer: ReturnType<typeof setTimeout> | null = null;

    function speakFirst(text: string) {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        speakText(text);
        return;
      }
      // Voices not ready yet — wait for the voiceschanged event
      voicesChangedHandler = () => {
        window.speechSynthesis.removeEventListener('voiceschanged', voicesChangedHandler!);
        voicesChangedHandler = null;
        if (voicesFallbackTimer) { clearTimeout(voicesFallbackTimer); voicesFallbackTimer = null; }
        speakText(text);
      };
      window.speechSynthesis.addEventListener('voiceschanged', voicesChangedHandler);
      // Safety net: if voiceschanged never fires, speak after 2s anyway
      voicesFallbackTimer = setTimeout(() => {
        if (voicesChangedHandler) {
          window.speechSynthesis.removeEventListener('voiceschanged', voicesChangedHandler);
          voicesChangedHandler = null;
        }
        voicesFallbackTimer = null;
        if (speaking) return; // already spoken
        speakText(text);
      }, 2000);
    }

    // Find first unchecked item (or fall back to first item)
    const first =
      allItemsRef.current.find(i => !checkedItemsRef.current[i.id]) ??
      allItemsRef.current[0] ??
      null;

    setCurrentItemId(first?.id ?? null);

    const intro = first
      ? `${first.phaseTitle}. ${itemText(first)}`
      : 'No items found.';
    speakFirst(intro);

    return () => {
      shouldListen = false;
      if (ttsTimer) clearTimeout(ttsTimer);
      if (commandTimer) clearTimeout(commandTimer);
      if (voicesFallbackTimer) clearTimeout(voicesFallbackTimer);
      if (voicesChangedHandler) {
        window.speechSynthesis.removeEventListener('voiceschanged', voicesChangedHandler);
      }
      clearInterval(keepAlive);
      window.speechSynthesis?.cancel();
      stopRec();
      rec.onend = null;
      rec.onresult = null;
      silentSource?.stop();
      audioCtx?.close().catch(() => {});
      if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused';
      setIsListening(false);
      setCurrentItemId(null);
      setLastTranscript('');
      setRecognitionError('');
    };
  }, [isVoiceMode]); // RecognitionClass is stable (memo on []); all volatile data via refs

  return { isVoiceMode, isListening, isSupported, currentItemId, lastTranscript, recognitionError, toggleVoiceMode, readExpectedState, toggleReadExpectedState, readAnnotations, toggleReadAnnotations };
}
