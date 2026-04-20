import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { useParams, Navigate, Link, useNavigate } from 'react-router-dom';
import { ChecklistItem } from '../components/ChecklistItem';
import { Timer } from '../components/Timer';
import styles from './Checklist.module.css';
import { ChevronLeft, ChevronDown, ChevronRight, RotateCcw, Pencil, Plus, X, ArrowUp, ArrowDown, CheckCheck, Volume2, VolumeX, Search, GripVertical, Share2, Mic, MicOff, NotebookPen } from 'lucide-react';
import { dispatchScratchpadEvent } from '../hooks/useScratchpad';
import { subscribeScratchpadEvents } from '../hooks/useScratchpad';
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
import { CategorySelector } from '../components/CategorySelector';
import { AddReferenceTableModal } from '../components/AddReferenceTableModal';
import { Toast } from '../components/Toast';
import { encodeChecklist } from '../utils/shareCodec';
import type { PlaneChecklist } from '../data/types';

export function Checklist() {
  console.log('>>>> CHECKLIST COMPONENT MOUNTED, planeId from params:', typeof window !== 'undefined' ? window.location.pathname : 'unknown');
  const { planeId, categoryName: rawCategoryName } = useParams();
  const activeCategory = rawCategoryName ?? 'Standard';
  const navigate = useNavigate();
  const { planes, checklists, loading, updateChecklist, getProgress, setProgress, trackRecentUse, getNote, setNote, getTimerData, saveTimerBest, getCategories, addCategory, deleteCategory } = useFleet();

  // Force console log
  console.log('>>>> CHECKLIST planeId=', planeId, 'checklist keys count=', Object.keys(checklists).length, 'key test=', planeId ? (checklists[planeId] ? 'FOUND' : 'NOT FOUND') : 'no id');

  useEffect(() => {
    if (planeId) trackRecentUse(planeId);
  }, [planeId, trackRecentUse]);

  // Compute these early — needed both by voice hook (below) and normal render logic.
  const categoryKey = activeCategory !== 'Standard' && planeId ? `${planeId}::${activeCategory}` : null;
  const baseChecklist = planeId ? checklists[planeId] : null;
  console.log('[Checklist] baseChecklist for key', planeId, ':', baseChecklist ? 'found with ' + baseChecklist.phases.length + ' phases' : 'NOT FOUND');
  console.log('[Checklist] planeId:', planeId, 'categoryKey:', categoryKey, 'checklists keys (sample):', Object.keys(checklists).slice(0, 20), 'baseChecklist found:', !!baseChecklist, 'baseChecklist phases:', baseChecklist?.phases.length);
  const checklist = (categoryKey ? checklists[categoryKey] : null) ?? baseChecklist;
  console.log('[Checklist] final checklist:', !!checklist, 'phases:', checklist?.phases.length);
  const checkedItems = planeId ? getProgress(planeId, activeCategory) : {};

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

  const voiceCategoryNavigateRef = useRef<(category: string) => void>(() => {});
  const stableNavigateCategory = useCallback((category: string) => {
    voiceCategoryNavigateRef.current(category);
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
    readAnnotations,
    toggleReadAnnotations,
  } = useVoiceChecklist({
    phases: checklist?.phases ?? [],
    checkedItems,
    onCheckItem: stableVoiceCheck,
    onCompletePhase: stableCompletePhase,
    onNavigateCategory: stableNavigateCategory,
  });

  const { user, isAdmin } = useAuth();
  const { confirm, ConfirmDialog } = useConfirm();
  const { playCheck, isMuted, toggleMute } = useSound();
  const { toast, show: showToast, dismiss: dismissToast } = useToast();

  // Track scratchpad open state so the button can show active styling
  const [showScratchpad, setShowScratchpad] = useState(false);
  useEffect(() => {
    return subscribeScratchpadEvents(action => {
      if (action === 'toggle') setShowScratchpad(s => !s);
    });
  }, []);
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
  const [phaseContextMenu, setPhaseContextMenu] = useState<{ phaseId: string; x: number; y: number } | null>(null);
  const plane = planes.find(p => p.id === planeId);
  const categories = planeId ? getCategories(planeId) : ['Standard'];
  const setCheckedItems = (updater: Record<string, boolean> | ((prev: Record<string, boolean>) => Record<string, boolean>)) => {
    if (!planeId) return;
    const newValue = typeof updater === 'function' ? updater(checkedItems) : updater;
    setProgress(planeId, newValue, activeCategory);
  };

  const handleDuplicateCategory = () => {
    if (!planeId || !checklist) return;
    const name = prompt('Enter sub-checklist name:');
    if (!name?.trim()) return;
    addCategory(planeId, name.trim(), checklist);
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
    const key = categoryKey ?? plane.id;
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
  }, [checklist, plane, categoryKey, updateChecklist]);

  const reorderPhases = useCallback((fromIndex: number, toIndex: number) => {
    if (!checklist || !plane) return;
    const key = categoryKey ?? plane.id;
    const phases = [...checklist.phases];
    const [moved] = phases.splice(fromIndex, 1);
    phases.splice(toIndex, 0, moved);
    updateChecklist(key, { ...checklist, phases });
  }, [checklist, plane, categoryKey, updateChecklist]);

  const { handleDragStart, handleDragEnd, handleDragOver, handleDropItem, handleDropPhase: _handleDropPhase } = useDragReorder(reorderItems, reorderPhases);
  void _handleDropPhase; // phases use up/down arrows instead of DnD

  const downloadCsv = useCallback(() => {
    if (!plane || !checklist) return;
    const quote = (s: string) => `"${s.replace(/"/g, '""')}"`;
    const header = 'name,category,phase,item,expectedState,reference';
    const allChecklists: Array<{ checklist: PlaneChecklist; category: string }> = [
      { checklist, category: activeCategory === 'Standard' ? '' : activeCategory },
    ];
    const planeCategories = planeId ? getCategories(planeId) : ['Standard'];
    for (const c of planeCategories) {
      if (c === activeCategory) continue;
      const key = c === 'Standard' ? planeId! : `${planeId}::${c}`;
      const cl = checklists[key];
      if (cl) allChecklists.push({ checklist: cl, category: c === 'Standard' ? '' : c });
    }
    const rows = allChecklists.flatMap(({ checklist: cl, category }) =>
      cl.phases.flatMap(phase =>
        phase.items.map(item =>
          [
            quote(plane.name),
            quote(category),
            quote(phase.title),
            quote(item.label),
            quote(item.expectedState ?? ''),
            quote(item.reference ?? ''),
          ].join(',')
        )
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
  }, [plane, checklist, activeCategory, planeId, checklists, getCategories]);

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

  console.log('[Checklist] loading:', loading, 'plane:', !!plane, 'checklist:', !!checklist);

  if (loading) {
    return <div className={styles.container}><p>Loading...</p></div>;
  }

  if (!plane || !checklist) {
    console.log('[Checklist] Redirecting - !plane:', !plane, '!checklist:', !checklist);
    return <Navigate to="/" replace />;
  }

  if (rawCategoryName && !categories.includes(rawCategoryName)) {
    return <Navigate to={`/checklist/${planeId}`} replace />;
  }

  const checklistKey = categoryKey ?? (plane?.id || '');
  const isReferenceCategory = activeCategory === 'Reference Tables';

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

  // Wire voice category navigation commands.
  voiceCategoryNavigateRef.current = (category: string) => {
    if (!planeId) return;
    if (category === 'Standard') {
      navigate(`/checklist/${planeId}`);
    } else {
      navigate(`/checklist/${planeId}/${encodeURIComponent(category)}`);
    }
  };

  // Wire voice "next phase" — bulk-checks all supplied IDs in one state update.
  voiceCompletePhaseRef.current = (itemIds: string[]) => {
    if (!planeId || itemIds.length === 0) return;
    const updated = { ...checkedItems };
    for (const id of itemIds) updated[id] = true;
    setProgress(planeId, updated, activeCategory);
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
          items: [...phase.items, { id: itemId, label: label || 'Reference Image', reference: dataUrl }],
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

  /**
   * Move a phase to a different category checklist (Normal / Emergency / Abnormal / etc.).
   * Removes it from the current checklist and appends it to the target.
   * "Normal" corresponds to the Standard (base) checklist (key = planeId).
   */
  const movePhaseToCategory = (phaseId: string, targetCategory: string) => {
    if (!planeId) return;
    const phase = checklist.phases.find(p => p.id === phaseId);
    if (!phase) return;

    // Remove from current checklist
    const updatedCurrent: PlaneChecklist = {
      ...checklist,
      phases: checklist.phases.filter(p => p.id !== phaseId),
    };
    updateChecklist(checklistKey, updatedCurrent);

    // Add to target checklist
    const targetKey = targetCategory === 'Standard' ? planeId : `${planeId}::${targetCategory}`;
    const targetChecklist: PlaneChecklist = checklists[targetKey] ?? { planeId, phases: [] };
    const updatedTarget: PlaneChecklist = {
      ...targetChecklist,
      planeId,
      phases: [...targetChecklist.phases, phase],
    };
    updateChecklist(targetKey, updatedTarget);

    // If target category doesn't exist yet, register it
    if (!(targetKey in checklists) && targetCategory !== 'Standard') {
      addCategory(planeId, targetCategory, updatedTarget);
    }

    showToast(`Phase moved to ${targetCategory}`);
    setPhaseContextMenu(null);
    if (targetCategory === 'Standard') {
      navigate(`/checklist/${planeId}`);
    } else {
      navigate(`/checklist/${planeId}/${encodeURIComponent(targetCategory)}`);
    }
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
        <Link to={activeCategory !== 'Standard' ? `/checklist/${planeId}` : '/'} className={styles.backLink}>
          <ChevronLeft /> {activeCategory !== 'Standard' ? 'Back to Checklist' : 'Back to Fleet'}
        </Link>
        <div className={styles.headerContent}>
          <div>
            <h1 className={styles.title}>
              {plane.name} {activeCategory !== 'Standard' ? `— ${activeCategory}` : 'Checklist'}
            </h1>
            <span className={styles.subtitle}>{plane.manufacturer}</span>
            <CategorySelector
              planeId={planeId!}
              categories={categories}
              activeCategory={activeCategory}
              onDuplicate={handleDuplicateCategory}
              onDelete={(v) => {
                if (planeId) deleteCategory(planeId, v);
                if (v === activeCategory) navigate(`/checklist/${planeId}`);
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
              <button
                onClick={() => dispatchScratchpadEvent('toggle')}
                className={showScratchpad ? styles.voiceTabActive : styles.voiceTab}
                title={showScratchpad ? 'Hide notepad' : 'Open notepad'}
                data-testid="notepad-button"
              >
                <NotebookPen size={12} />
                Notepad
              </button>
              {!isReferenceCategory && (
                <button
                  onClick={toggleMute}
                  className={styles.voiceTab}
                  title={isMuted ? 'Unmute sounds' : 'Mute sounds'}
                  data-testid="mute-button"
                >
                  {isMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
                </button>
              )}
              {!isReferenceCategory && (
                <button
                  onClick={resetChecklist}
                  className={styles.voiceTab}
                  title="Reset checklist"
                >
                  <RotateCcw size={12} />
                  Reset
                </button>
              )}
            </CategorySelector>
          </div>
          <div className={styles.headerActions}>
            {user && !isReferenceCategory && (
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
              </>
            )}
            {user && isReferenceCategory && (
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
            <button
              onClick={toggleReadAnnotations}
              className={styles.readStateBtn}
              title={readAnnotations ? 'Currently reading caution/note/warnings — click to skip them' : 'Currently skipping caution/note/warnings — click to read them'}
            >
              {readAnnotations ? 'Notes on' : 'Notes off'}
            </button>
            <span className={styles.voiceHints}>
              "check" · "next" · "back" · "repeat" · "stop" · "go normal/abnormal/emergency/reference" · "notepad/scratchpad" · "dictate" · "erase"
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
            <div
              key={phase.id}
              className={`${styles.phase} ${phaseComplete ? styles.phaseComplete : ''}`}
              onContextMenu={e => {
                e.preventDefault();
                setPhaseContextMenu({ phaseId: phase.id, x: e.clientX, y: e.clientY });
              }}
            >
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
                  {!isReferenceCategory && <div className={styles.progressWrapper}>
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
                {!isEditing && !isReferenceCategory && phase.items.length > 0 && (
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
                            isAdmin && item.reference?.startsWith('data:table/json,')
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
                {user && isReferenceCategory && !isCollapsed && (
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
      {ConfirmDialog}
      {toast && <Toast message={toast.message} action={toast.action} onDismiss={dismissToast} />}
      {/* Phase right-click context menu */}
      {phaseContextMenu && planeId && (() => {
        const ctxPhase = checklist.phases.find(p => p.id === phaseContextMenu.phaseId);
        if (!ctxPhase) return null;
        const checkableItems = ctxPhase.items.filter(i => !i.annotationType);
        const phaseIsComplete = checkableItems.length > 0 && checkableItems.every(i => checkedItems[i.id]);
        const phaseIdx = checklist.phases.indexOf(ctxPhase);
        const MOVE_CATEGORIES = ['Standard', 'Emergency', 'Abnormal'];
        const currentCat = activeCategory;
        const moveTargets = MOVE_CATEGORIES.filter(c => c !== currentCat);
        return (
          <>
            <div
              className={styles.contextMenuBackdrop}
              onClick={() => setPhaseContextMenu(null)}
              onContextMenu={e => { e.preventDefault(); setPhaseContextMenu(null); }}
            />
            <div
              className={styles.phaseContextMenu}
              style={{ top: phaseContextMenu.y, left: phaseContextMenu.x }}
              role="menu"
            >
              <div className={styles.phaseContextMenuHeader}>{ctxPhase.title}</div>
              {!isReferenceCategory && checkableItems.length > 0 && (
                <button
                  className={styles.phaseContextMenuItem}
                  role="menuitem"
                  onClick={() => {
                    toggleAllPhaseItems(checkableItems.map(i => i.id), !phaseIsComplete);
                    setPhaseContextMenu(null);
                  }}
                >
                  {phaseIsComplete ? <RotateCcw size={14} /> : <CheckCheck size={14} />}
                  {phaseIsComplete ? 'Uncheck all items' : 'Complete phase'}
                </button>
              )}
              {checklist.phases.length > 1 && (
                <>
                  <div className={styles.phaseContextMenuDivider} />
                  <button
                    className={styles.phaseContextMenuItem}
                    role="menuitem"
                    disabled={phaseIdx === 0}
                    onClick={() => { movePhase(ctxPhase.id, 'up'); setPhaseContextMenu(null); }}
                  >
                    <ArrowUp size={14} />
                    Move up
                  </button>
                  <button
                    className={styles.phaseContextMenuItem}
                    role="menuitem"
                    disabled={phaseIdx === checklist.phases.length - 1}
                    onClick={() => { movePhase(ctxPhase.id, 'down'); setPhaseContextMenu(null); }}
                  >
                    <ArrowDown size={14} />
                    Move down
                  </button>
                </>
              )}
              {user && moveTargets.length > 0 && (
                <>
                  <div className={styles.phaseContextMenuDivider} />
                  <div className={styles.phaseContextMenuLabel}>Move to…</div>
                  {moveTargets.map(cat => (
                    <button
                      key={cat}
                      className={styles.phaseContextMenuItem}
                      role="menuitem"
                      onClick={() => movePhaseToCategory(ctxPhase.id, cat)}
                    >
                      <span className={`${styles.phaseContextMenuDot} ${styles[`dot${cat}`]}`} />
                      {cat}
                    </button>
                  ))}
                </>
              )}
            </div>
          </>
        );
      })()}

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
