import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { useParams, Navigate, Link, useNavigate } from 'react-router-dom';
import { ChecklistItem } from '../components/ChecklistItem';
import { KeyboardHints } from '../components/KeyboardHints';
import { Timer } from '../components/Timer';
import styles from './Checklist.module.css';
import { ChevronLeft, ChevronDown, ChevronRight, RotateCcw, Download, Pencil, Plus, X, Printer, ArrowUp, ArrowDown, CheckCheck, Volume2, VolumeX, Search, GripVertical, Share2, Mic, MicOff } from 'lucide-react';
import { useVoiceChecklist } from '../hooks/useVoiceChecklist';
import { useFleet } from '../hooks/useFleet';
import { useAuth } from '../contexts/AuthContext';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useChecklistNavigation } from '../hooks/useChecklistNavigation';
import { useConfirm } from '../hooks/useConfirm';
import { useSound } from '../hooks/useSound';
import { useToast } from '../hooks/useToast';
import { useTimer } from '../hooks/useTimer';
import { useDragReorder } from '../hooks/useDragReorder';
import { VariantSelector } from '../components/VariantSelector';
import { AddReferenceTableModal } from '../components/AddReferenceTableModal';
import { Toast } from '../components/Toast';
import { encodeChecklist } from '../utils/shareCodec';
import type { PlaneChecklist } from '../data/types';

export function Checklist() {
  const { planeId, variantName: rawVariantName } = useParams();
  const activeVariant = rawVariantName ?? 'Standard';
  const navigate = useNavigate();
  const { planes, checklists, loading, updateChecklist, getProgress, setProgress, trackRecentUse, getNote, setNote, getTimerData, saveTimerBest, getVariants, addVariant, deleteVariant } = useFleet();

  useEffect(() => {
    if (planeId) trackRecentUse(planeId);
  }, [planeId, trackRecentUse]);

  // Compute these early — needed both by voice hook (below) and normal render logic.
  const variantKey = activeVariant !== 'Standard' && planeId ? `${planeId}::${activeVariant}` : null;
  const baseChecklist = planeId ? checklists[planeId] : null;
  const checklist = (variantKey ? checklists[variantKey] : null) ?? baseChecklist;
  const checkedItems = planeId ? getProgress(planeId, activeVariant) : {};

  // Voice checklist — hook must be called unconditionally (before any early return).
  // We use a stable wrapper + ref so toggleItem (defined after the guard clause)
  // is always called at its latest definition without re-creating the hook callback.
  const voiceCheckCallbackRef = useRef<(id: string) => void>(() => {});
  const stableVoiceCheck = useCallback((id: string) => {
    voiceCheckCallbackRef.current(id);
  }, []);

  const voiceCompletePhaseRef = useRef<(itemIds: string[]) => void>(() => {});
  const stableCompletePhase = useCallback((itemIds: string[]) => {
    voiceCompletePhaseRef.current(itemIds);
  }, []);

  const voiceNavigateVariantRef = useRef<(variant: string) => void>(() => {});
  const stableNavigateVariant = useCallback((variant: string) => {
    voiceNavigateVariantRef.current(variant);
  }, []);

  const {
    isVoiceMode,
    isListening,
    isSupported: isVoiceSupported,
    currentItemId: voiceItemId,
    lastTranscript,
    recognitionError,
    toggleVoiceMode,
    readExpectedState,
    toggleReadExpectedState,
  } = useVoiceChecklist({
    phases: checklist?.phases ?? [],
    checkedItems,
    onCheckItem: stableVoiceCheck,
    onCompletePhase: stableCompletePhase,
    onNavigateVariant: stableNavigateVariant,
  });

  const { user, isAdmin } = useAuth();
  const { confirm, ConfirmDialog } = useConfirm();
  const { playCheck, isMuted, toggleMute } = useSound();
  const { toast, show: showToast, dismiss: dismissToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  useChecklistNavigation(!isEditing);
  const [insertAt, setInsertAt] = useState<{ phaseId: string; index: number } | null>(null);
  const [newLabel, setNewLabel] = useState('');
  const [newState, setNewState] = useState('');
  const [collapsedPhases, setCollapsedPhases] = useState<Record<string, boolean>>({});
  const [isAddingPhase, setIsAddingPhase] = useState(false);
  const [newPhaseTitle, setNewPhaseTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [addImagePhaseId, setAddImagePhaseId] = useState<string | null>(null);
  const [addImageLabel, setAddImageLabel] = useState('');
  const [showAddTableModal, setShowAddTableModal] = useState(false);
  const plane = planes.find(p => p.id === planeId);
  const variants = planeId ? getVariants(planeId) : ['Standard'];
  const setCheckedItems = (updater: Record<string, boolean> | ((prev: Record<string, boolean>) => Record<string, boolean>)) => {
    if (!planeId) return;
    const newValue = typeof updater === 'function' ? updater(checkedItems) : updater;
    setProgress(planeId, newValue, activeVariant);
  };

  const handleDuplicateVariant = () => {
    if (!planeId || !checklist) return;
    const name = prompt('Enter sub-checklist name:');
    if (!name?.trim()) return;
    addVariant(planeId, name.trim(), checklist);
    navigate(`/checklist/${planeId}/${encodeURIComponent(name.trim())}`);
  };

  const prevCheckedRef = useRef<Record<string, boolean>>({});

  // Timer hook (must be before guard clause)
  const timer = useTimer();
  const timerBest = plane ? getTimerData(plane.id).completed : undefined;

  // Auto-stop timer when all items are complete
  useEffect(() => {
    if (!planeId || !checklist) return;
    const allIds = checklist.phases.flatMap(p => p.items.map(i => i.id));
    const total = allIds.length;
    if (total === 0) return;
    const completed = allIds.filter(id => checkedItems[id]).length;
    if (completed === total && timer.isRunning) {
      timer.pause();
      if (timer.elapsed > 0) {
        saveTimerBest(planeId, timer.elapsed);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkedItems]);

  // DnD reorder callbacks (must be before guard clause)
  const reorderItems = useCallback((phaseId: string, fromIndex: number, toIndex: number) => {
    if (!checklist || !plane) return;
    const key = variantKey ?? plane.id;
    const updated: PlaneChecklist = {
      ...checklist,
      phases: checklist.phases.map(phase => {
        if (phase.id !== phaseId) return phase;
        const items = [...phase.items];
        const [moved] = items.splice(fromIndex, 1);
        items.splice(toIndex, 0, moved);
        return { ...phase, items };
      }),
    };
    updateChecklist(key, updated);
  }, [checklist, plane, variantKey, updateChecklist]);

  const reorderPhases = useCallback((fromIndex: number, toIndex: number) => {
    if (!checklist || !plane) return;
    const key = variantKey ?? plane.id;
    const phases = [...checklist.phases];
    const [moved] = phases.splice(fromIndex, 1);
    phases.splice(toIndex, 0, moved);
    updateChecklist(key, { ...checklist, phases });
  }, [checklist, plane, variantKey, updateChecklist]);

  const { handleDragStart, handleDragEnd, handleDragOver, handleDropItem, handleDropPhase: _handleDropPhase } = useDragReorder(reorderItems, reorderPhases);
  void _handleDropPhase; // phases use up/down arrows instead of DnD

  const downloadCsv = useCallback(() => {
    if (!plane || !checklist) return;
    const quote = (s: string) => `"${s.replace(/"/g, '""')}"`;
    // category is empty for Standard, otherwise the variant name (e.g. "Reference Tables")
    const category = activeVariant === 'Standard' ? '' : activeVariant;
    const header = 'name,manufacturer,type,image,phase,item,expectedState,notes,category';
    const rows = checklist.phases.flatMap(phase =>
      phase.items.map(item =>
        [
          quote(plane.name),
          quote(plane.manufacturer),
          quote(plane.type),
          quote(plane.image),
          quote(phase.title),
          quote(item.label),
          quote(item.expectedState ?? ''),
          quote(item.notes ?? ''),
          quote(category),
        ].join(',')
      )
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${plane.id}-checklist.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [plane, checklist]);

  const handleShare = async () => {
    if (!plane || !checklist) return;
    try {
      const data = { plane, checklist };
      const encoded = await encodeChecklist(data);
      const url = `${window.location.origin}/share?data=${encoded}`;

      if (url.length > 2000) {
        // Too long for URL — copy JSON to clipboard instead
        await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
        showToast('Checklist copied to clipboard (too large for URL)');
      } else {
        await navigator.clipboard.writeText(url);
        showToast('Share link copied to clipboard!');
      }
    } catch {
      showToast('Failed to create share link');
    }
  };

  useKeyboardShortcuts(useMemo(() => ({
    onEscape: () => {
      if (isEditing) {
        setIsEditing(false);
        setInsertAt(null);
      }
    },
    onToggleEdit: () => {
      setIsEditing(prev => !prev);
      setInsertAt(null);
    },
    onDownloadCsv: downloadCsv,
    onPrint: () => window.print(),
  }), [isEditing, downloadCsv]));

  // Auto-scroll the currently active voice item into view (must be before guard clause).
  // Also ensures the containing phase is expanded so the item is actually in the DOM.
  useEffect(() => {
    if (!voiceItemId) return;
    // Expand the phase containing this item before scrolling.
    if (checklist) {
      const phase = checklist.phases.find(p => p.items.some(i => i.id === voiceItemId));
      if (phase) {
        setCollapsedPhases(prev => {
          if (!prev[phase.id]) return prev; // already expanded — no state change
          const next = { ...prev };
          delete next[phase.id];
          return next;
        });
      }
    }
    // Delay scroll so the phase expand can re-render first.
    const t = setTimeout(() => {
      document.querySelector(`[data-voice-id="${voiceItemId}"]`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
    return () => clearTimeout(t);
  }, [voiceItemId, checklist]);

  if (loading) {
    return <div className={styles.container}><p>Loading...</p></div>;
  }

  if (!plane || !checklist) {
    return <Navigate to="/" replace />;
  }

  if (rawVariantName && !variants.includes(rawVariantName)) {
    return <Navigate to={`/checklist/${planeId}`} replace />;
  }

  const checklistKey = variantKey ?? (plane?.id || '');
  const isReferenceVariant = activeVariant === 'Reference Tables';

  const autoAdvancePhase = (updatedItems: Record<string, boolean>) => {
    if (isEditing) return;
    for (const phase of checklist.phases) {
      const phaseItemIds = phase.items.map(i => i.id);
      if (phaseItemIds.length === 0) continue;
      const wasComplete = phaseItemIds.every(id => prevCheckedRef.current[id]);
      const isComplete = phaseItemIds.every(id => updatedItems[id]);
      if (isComplete && !wasComplete) {
        setCollapsedPhases(prev => {
          const next = { ...prev, [phase.id]: true };
          const phaseIdx = checklist.phases.indexOf(phase);
          for (let i = phaseIdx + 1; i < checklist.phases.length; i++) {
            const nextPhase = checklist.phases[i];
            const nextIds = nextPhase.items.map(item => item.id);
            const nextComplete = nextIds.length > 0 && nextIds.every(id => updatedItems[id]);
            if (!nextComplete) {
              next[nextPhase.id] = false;
              break;
            }
          }
          return next;
        });
      }
    }
    prevCheckedRef.current = { ...updatedItems };
  };

  const toggleItem = (itemId: string) => {
    const wasChecked = checkedItems[itemId];
    if (!wasChecked) playCheck();
    const updated = { ...checkedItems, [itemId]: !checkedItems[itemId] };
    setCheckedItems(updated);
    autoAdvancePhase(updated);

    const prevState = { ...checkedItems };
    showToast(
      wasChecked ? 'Item unchecked' : 'Item checked',
      { label: 'Undo', onClick: () => { setCheckedItems(prevState); prevCheckedRef.current = prevState; } }
    );
  };

  // Wire voice "check" to the real toggleItem (only checks, never unchecks).
  voiceCheckCallbackRef.current = (itemId: string) => {
    if (!checkedItems[itemId]) toggleItem(itemId);
  };

  // Wire voice variant navigation commands.
  voiceNavigateVariantRef.current = (variant: string) => {
    if (!planeId) return;
    if (variant === 'Standard') {
      navigate(`/checklist/${planeId}`);
    } else {
      navigate(`/checklist/${planeId}/${encodeURIComponent(variant)}`);
    }
  };

  // Wire voice "next phase" — bulk-checks all supplied IDs in one state update.
  voiceCompletePhaseRef.current = (itemIds: string[]) => {
    if (!planeId || itemIds.length === 0) return;
    const updated = { ...checkedItems };
    for (const id of itemIds) updated[id] = true;
    setProgress(planeId, updated, activeVariant);
  };

  const togglePhase = (phaseId: string) => {
    setCollapsedPhases(prev => ({ ...prev, [phaseId]: !prev[phaseId] }));
  };

  const resetChecklist = async () => {
    const confirmed = await confirm(
      'Reset Checklist',
      'Are you sure you want to reset all checklist items? Your progress will be lost.',
      { confirmLabel: 'Reset', destructive: true }
    );
    if (confirmed) {
      const prevState = { ...checkedItems };
      setCheckedItems({});
      showToast('Checklist reset', {
        label: 'Undo',
        onClick: () => { setCheckedItems(prevState); prevCheckedRef.current = prevState; }
      });
    }
  };

  const handleInsert = (phaseId: string, index: number) => {
    if (insertAt?.phaseId === phaseId && insertAt?.index === index) {
      setInsertAt(null);
    } else {
      setInsertAt({ phaseId, index });
      setNewLabel('');
      setNewState('');
    }
  };

  const submitInsert = () => {
    if (!insertAt || !newLabel.trim()) return;

    const itemId = `${insertAt.phaseId}-${newLabel.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`;
    const newItem = {
      id: itemId,
      label: newLabel.trim(),
      expectedState: newState.trim() || undefined,
    };

    const updated: PlaneChecklist = {
      ...checklist,
      phases: checklist.phases.map(phase => {
        if (phase.id !== insertAt.phaseId) return phase;
        const items = [...phase.items];
        items.splice(insertAt.index, 0, newItem);
        return { ...phase, items };
      }),
    };

    updateChecklist(checklistKey, updated);
    setInsertAt(null);
    setNewLabel('');
    setNewState('');
  };

  const handleAddRefImage = (phaseId: string, label: string, dataUrl: string) => {
    const itemId = `ref-img-${phaseId}-${Date.now()}`;
    const updated: PlaneChecklist = {
      ...checklist,
      phases: checklist.phases.map(phase =>
        phase.id !== phaseId ? phase : {
          ...phase,
          items: [...phase.items, { id: itemId, label: label || 'Reference Image', notes: dataUrl }],
        }
      ),
    };
    updateChecklist(checklistKey, updated);
    setAddImagePhaseId(null);
    setAddImageLabel('');
  };

  const deleteItem = (phaseId: string, itemId: string) => {
    const updated: PlaneChecklist = {
      ...checklist,
      phases: checklist.phases.map(phase => {
        if (phase.id !== phaseId) return phase;
        return { ...phase, items: phase.items.filter(i => i.id !== itemId) };
      }),
    };
    updateChecklist(checklistKey, updated);
  };

  const addPhase = () => {
    if (!newPhaseTitle.trim()) return;
    const phaseId = `phase-${newPhaseTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`;
    const updated: PlaneChecklist = {
      ...checklist,
      phases: [...checklist.phases, { id: phaseId, title: newPhaseTitle.trim(), items: [] }],
    };
    updateChecklist(checklistKey, updated);
    setNewPhaseTitle('');
    setIsAddingPhase(false);
  };

  const deletePhase = async (phaseId: string) => {
    const confirmed = await confirm(
      'Delete Phase',
      'Delete this phase and all its items?',
      { confirmLabel: 'Delete', destructive: true }
    );
    if (!confirmed) return;
    const updated: PlaneChecklist = {
      ...checklist,
      phases: checklist.phases.filter(p => p.id !== phaseId),
    };
    updateChecklist(checklistKey, updated);
  };

  const movePhase = (phaseId: string, direction: 'up' | 'down') => {
    const idx = checklist.phases.findIndex(p => p.id === phaseId);
    if (idx < 0) return;
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= checklist.phases.length) return;
    const phases = [...checklist.phases];
    [phases[idx], phases[newIdx]] = [phases[newIdx], phases[idx]];
    const updated: PlaneChecklist = { ...checklist, phases };
    updateChecklist(checklistKey, updated);
  };

  const toggleAllPhaseItems = (phaseItemIds: string[], checkAll: boolean) => {
    const updated = { ...checkedItems };
    for (const id of phaseItemIds) {
      updated[id] = checkAll;
    }
    setCheckedItems(updated);
    if (checkAll) playCheck();
    autoAdvancePhase(updated);
  };

  const calculateProgress = (phaseItems: string[]) => {
    if (phaseItems.length === 0) return 0;
    const checkedCount = phaseItems.filter(id => checkedItems[id]).length;
    return (checkedCount / phaseItems.length) * 100;
  };

  // Overall progress
  const allItemIds = checklist.phases.flatMap(p => p.items.map(i => i.id));
  const totalItems = allItemIds.length;
  const completedItems = allItemIds.filter(id => checkedItems[id]).length;
  const overallProgress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  const query = searchQuery.toLowerCase().trim();
  const displayPhases = query
    ? checklist.phases.map(phase => ({
        ...phase,
        items: phase.items.filter(item =>
          item.label.toLowerCase().includes(query) ||
          (item.expectedState && item.expectedState.toLowerCase().includes(query))
        ),
      })).filter(phase => phase.items.length > 0)
    : checklist.phases;

  const searchResultCount = query
    ? displayPhases.reduce((sum, p) => sum + p.items.length, 0)
    : 0;

  const insertionPoint = (phaseId: string, index: number) => {
    const isActive = insertAt?.phaseId === phaseId && insertAt?.index === index;
    return (
      <div key={`insert-${phaseId}-${index}`}>
        <button
          className={styles.insertButton}
          onClick={() => handleInsert(phaseId, index)}
          title="Insert item here"
        >
          <Plus size={14} />
        </button>
        {isActive && (
          <div className={styles.insertForm}>
            <input
              className={styles.insertInput}
              placeholder="Item label (e.g. Fuel Pump)"
              value={newLabel}
              onChange={e => setNewLabel(e.target.value)}
              autoFocus
              onKeyDown={e => { if (e.key === 'Enter') submitInsert(); }}
            />
            <input
              className={styles.insertInput}
              placeholder="Expected state (e.g. ON)"
              value={newState}
              onChange={e => setNewState(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') submitInsert(); }}
            />
            <div className={styles.insertFormActions}>
              <button className={styles.insertSubmit} onClick={submitInsert} disabled={!newLabel.trim()}>
                Add
              </button>
              <button className={styles.insertCancel} onClick={() => setInsertAt(null)}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link to={activeVariant !== 'Standard' ? `/checklist/${planeId}` : '/'} className={styles.backLink}>
          <ChevronLeft /> {activeVariant !== 'Standard' ? 'Back to Checklist' : 'Back to Fleet'}
        </Link>
        <div className={styles.headerContent}>
          <div>
            <h1 className={styles.title}>
              {plane.name} {activeVariant !== 'Standard' ? `— ${activeVariant}` : 'Checklist'}
            </h1>
            <span className={styles.subtitle}>{plane.manufacturer}</span>
            <VariantSelector
              planeId={planeId!}
              variants={variants}
              activeVariant={activeVariant}
              onDuplicate={handleDuplicateVariant}
              onDelete={(v) => {
                if (planeId) deleteVariant(planeId, v);
                if (v === activeVariant) navigate(`/checklist/${planeId}`);
              }}
              isEditing={isEditing}
            >
              {isVoiceSupported && (
                <button
                  onClick={toggleVoiceMode}
                  className={isVoiceMode ? styles.voiceTabActive : styles.voiceTab}
                  title={isVoiceMode ? 'Stop voice mode' : 'Start voice mode'}
                >
                  {isVoiceMode ? <MicOff size={12} /> : <Mic size={12} />}
                  {isVoiceMode ? 'Voice On' : 'Voice'}
                </button>
              )}
            </VariantSelector>
          </div>
          <div className={styles.headerActions}>
            {!isReferenceVariant && (
              <button
                onClick={() => { setIsEditing(!isEditing); setInsertAt(null); }}
                className={isEditing ? styles.editButtonActive : styles.resetButton}
              >
                <Pencil className={styles.resetIcon} />
                {isEditing ? 'Done' : 'Edit'}
              </button>
            )}
            {user && (
              <>
                <button onClick={handleShare} className={styles.resetButton} title="Share checklist">
                  <Share2 className={styles.resetIcon} />
                  Share
                </button>
                <button onClick={downloadCsv} className={styles.resetButton}>
                  <Download className={styles.resetIcon} />
                  Download CSV
                </button>
                <button onClick={() => window.print()} className={styles.resetButton}>
                  <Printer className={styles.resetIcon} />
                  Print
                </button>
              </>
            )}
            {!isReferenceVariant && (
              <button onClick={resetChecklist} className={styles.resetButton}>
                <RotateCcw className={styles.resetIcon} />
                Reset
              </button>
            )}
            {!isReferenceVariant && (
              <button onClick={toggleMute} className={styles.resetButton} title={isMuted ? 'Unmute sounds' : 'Mute sounds'}>
                {isMuted ? <VolumeX className={styles.resetIcon} /> : <Volume2 className={styles.resetIcon} />}
              </button>
            )}
            {user && isReferenceVariant && (
              <button
                onClick={() => setShowAddTableModal(true)}
                className={styles.resetButton}
                title="Add a reference table to this section"
              >
                <Plus className={styles.resetIcon} />
                Add Table
              </button>
            )}
          </div>
        </div>

        {isVoiceMode && (
          <div className={styles.voiceBar}>
            <span className={isListening ? styles.listeningDot : styles.listeningDotIdle} />
            <span>{isListening ? 'Listening…' : 'Speaking…'}</span>
            {recognitionError && (
              <span className={styles.voiceError}>
                {recognitionError === 'no-speech' && '🎤 Not hearing you — wrong mic? Check '}
                {recognitionError === 'network' && '⚠ No network — Chrome needs internet for speech recognition'}
                {recognitionError === 'not-allowed' && '⚠ Mic permission denied — click the 🔒 in the address bar'}
                {recognitionError === 'audio-capture' && '⚠ Mic not accessible — check OS audio settings'}
                {!['no-speech','network','not-allowed','audio-capture'].includes(recognitionError) && `⚠ ${recognitionError}`}
                {recognitionError === 'no-speech' && (
                  <a href="chrome://settings/content/microphone" target="_blank" rel="noreferrer" className={styles.voiceErrorLink}>
                    Chrome mic settings
                  </a>
                )}
              </span>
            )}
            {!recognitionError && lastTranscript && (
              <span className={styles.voiceTranscript}>"{lastTranscript}"</span>
            )}
            <button
              onClick={toggleReadExpectedState}
              className={styles.readStateBtn}
              title={readExpectedState ? 'Currently reading expected state — click to read item only' : 'Currently reading item only — click to also read expected state'}
            >
              {readExpectedState ? 'Label + state' : 'Label only'}
            </button>
            <span className={styles.voiceHints}>
              "check" · "next" · "back" · "repeat" · "stop" · "go normal/abnormal/emergency/reference"
            </span>
          </div>
        )}

        <Timer
          elapsed={timer.elapsed}
          isRunning={timer.isRunning}
          onStart={timer.start}
          onPause={timer.pause}
          onReset={timer.reset}
          bestTime={timerBest}
        />
      <div className={styles.searchBar}>
        <Search className={styles.searchIcon} size={18} />
        <input
          type="text"
          placeholder="Search checklist items..."
          className={styles.searchInput}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search checklist items"
        />
        {searchQuery && (
          <button className={styles.searchClear} onClick={() => setSearchQuery('')}>
            <X size={16} />
          </button>
        )}
      </div>
      </div>

      <span className={styles.srOnly} aria-live="polite">
        {Math.round(overallProgress)}% complete, {completedItems} of {totalItems} items
      </span>
      {query && (
        <span className={styles.searchResultCount}>
          {searchResultCount} item{searchResultCount !== 1 ? 's' : ''} found
        </span>
      )}

      <div className={styles.phases}>
        {displayPhases.map(phase => {
          const progress = calculateProgress(phase.items.map(i => i.id));
          const isCollapsed = query ? false : collapsedPhases[phase.id];
          const phaseComplete = progress === 100;

          return (
            <div key={phase.id} className={`${styles.phase} ${phaseComplete ? styles.phaseComplete : ''}`}>
              <div className={styles.phaseHeaderRow}>
                <div
                  className={styles.phaseHeader}
                  onClick={() => togglePhase(phase.id)}
                  role="button"
                  tabIndex={0}
                  aria-expanded={!isCollapsed}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); togglePhase(phase.id); } }}
                >
                  <div className={styles.phaseHeaderLeft}>
                    {isCollapsed ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
                    <h2 className={styles.phaseTitle}>{phase.title}</h2>
                  </div>
                  {!isReferenceVariant && <div className={styles.progressWrapper}>
                    <div className={styles.progressBar}>
                      <div
                        className={styles.progressFill}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className={styles.progressText}>
                      {Math.round(progress)}%
                    </span>
                  </div>}
                </div>
                {!isEditing && !isReferenceVariant && phase.items.length > 0 && (
                  <button
                    className={styles.toggleAllButton}
                    onClick={() => {
                      const ids = phase.items.map(i => i.id);
                      toggleAllPhaseItems(ids, !phaseComplete);
                    }}
                    title={phaseComplete ? 'Uncheck all items' : 'Check all items'}
                  >
                    {phaseComplete ? <RotateCcw size={16} /> : <CheckCheck size={16} />}
                  </button>
                )}
                {isEditing && (
                  <div className={styles.phaseActions}>
                    <button
                      className={styles.phaseActionButton}
                      onClick={() => movePhase(phase.id, 'up')}
                      disabled={checklist.phases.indexOf(phase) === 0}
                      title="Move phase up"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      className={styles.phaseActionButton}
                      onClick={() => movePhase(phase.id, 'down')}
                      disabled={checklist.phases.indexOf(phase) === checklist.phases.length - 1}
                      title="Move phase down"
                    >
                      <ArrowDown size={14} />
                    </button>
                    <button
                      className={styles.deletePhaseButton}
                      onClick={() => deletePhase(phase.id)}
                      title="Delete phase"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
              {!isCollapsed && (
                <div className={styles.items}>
                  {isEditing && insertionPoint(phase.id, 0)}
                  {phase.items.map((item, idx) => (
                    <div
                      key={item.id}
                      data-voice-id={item.id}
                      className={isVoiceMode && voiceItemId === item.id ? styles.voiceCurrentItem : undefined}
                    >
                      <div className={styles.editableRow}>
                        {isEditing && (
                          <div
                            className={styles.dragHandle}
                            draggable
                            onDragStart={handleDragStart('item', idx, phase.id)}
                            onDragEnd={handleDragEnd}
                            onDragOver={handleDragOver}
                            onDrop={handleDropItem(phase.id, idx)}
                            title="Drag to reorder"
                          >
                            <GripVertical size={14} />
                          </div>
                        )}
                        <ChecklistItem
                          item={item}
                          checked={!!checkedItems[item.id]}
                          onToggle={() => toggleItem(item.id)}
                          note={getNote(item.id)}
                          onNoteChange={(text) => setNote(item.id, text)}
                          onDeleteTable={
                            isAdmin && item.notes?.startsWith('data:table/json,')
                              ? async () => {
                                  const ok = await confirm(
                                    `Delete "${item.label}"?`,
                                    'This reference table will be permanently removed from the checklist.',
                                    { confirmLabel: 'Delete', destructive: true },
                                  );
                                  if (ok) deleteItem(phase.id, item.id);
                                }
                              : undefined
                          }
                        />
                        {isEditing && (
                          <button
                            className={styles.deleteItemButton}
                            onClick={() => deleteItem(phase.id, item.id)}
                            title="Remove item"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                      {isEditing && insertionPoint(phase.id, idx + 1)}
                    </div>
                  ))}
                {user && isReferenceVariant && !isCollapsed && (
                  <div className={styles.addRefImageRow}>
                    {addImagePhaseId === phase.id ? (
                      <div className={styles.insertForm}>
                        <input
                          className={styles.insertInput}
                          placeholder="Image label (e.g. Engine Diagram)"
                          value={addImageLabel}
                          onChange={e => setAddImageLabel(e.target.value)}
                          autoFocus
                        />
                        <div className={styles.insertFormActions}>
                          <label className={styles.insertSubmit}>
                            Choose Image
                            <input
                              type="file"
                              accept="image/*"
                              style={{ display: 'none' }}
                              onChange={e => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const reader = new FileReader();
                                reader.onload = ev => {
                                  const dataUrl = ev.target?.result as string;
                                  if (dataUrl) handleAddRefImage(phase.id, addImageLabel, dataUrl);
                                };
                                reader.readAsDataURL(file);
                              }}
                            />
                          </label>
                          <button
                            className={styles.insertCancel}
                            onClick={() => { setAddImagePhaseId(null); setAddImageLabel(''); }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        className={styles.addRefImageBtn}
                        onClick={() => setAddImagePhaseId(phase.id)}
                      >
                        <Plus size={14} /> Add Image
                      </button>
                    )}
                  </div>
                )}
                </div>
              )}
            </div>
          );
        })}
        {isEditing && !isAddingPhase && (
          <button
            className={styles.addPhaseButton}
            onClick={() => setIsAddingPhase(true)}
          >
            <Plus size={16} />
            Add Phase
          </button>
        )}
        {isEditing && isAddingPhase && (
          <div className={styles.addPhaseForm}>
            <input
              className={styles.insertInput}
              placeholder="Phase title (e.g. Before Takeoff)"
              value={newPhaseTitle}
              onChange={e => setNewPhaseTitle(e.target.value)}
              autoFocus
              onKeyDown={e => { if (e.key === 'Enter') addPhase(); if (e.key === 'Escape') { setIsAddingPhase(false); setNewPhaseTitle(''); } }}
            />
            <div className={styles.insertFormActions}>
              <button className={styles.insertSubmit} onClick={addPhase} disabled={!newPhaseTitle.trim()}>
                Add Phase
              </button>
              <button className={styles.insertCancel} onClick={() => { setIsAddingPhase(false); setNewPhaseTitle(''); }}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
      <KeyboardHints />
      {ConfirmDialog}
      {toast && <Toast message={toast.message} action={toast.action} onDismiss={dismissToast} />}
      {showAddTableModal && plane && (
        <AddReferenceTableModal
          planeName={plane.name}
          planeId={plane.id}
          existingChecklist={checklist}
          onSave={updated => {
            updateChecklist(checklistKey, updated);
            setShowAddTableModal(false);
          }}
          onCancel={() => setShowAddTableModal(false)}
        />
      )}
    </div>
  );
}
