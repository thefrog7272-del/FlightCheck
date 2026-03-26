import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { ChecklistItem } from '../components/ChecklistItem';
import { KeyboardHints } from '../components/KeyboardHints';
import styles from './Checklist.module.css';
import { ChevronLeft, ChevronDown, ChevronRight, RotateCcw, Download, Pencil, Plus, X, Printer, ArrowUp, ArrowDown, CheckCheck, Volume2, VolumeX, Search } from 'lucide-react';
import clsx from 'clsx';
import { useFleet } from '../hooks/useFleet';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useChecklistNavigation } from '../hooks/useChecklistNavigation';
import { useConfirm } from '../hooks/useConfirm';
import { useSound } from '../hooks/useSound';
import { useToast } from '../hooks/useToast';
import { Toast } from '../components/Toast';
import type { PlaneChecklist } from '../data/types';

export function Checklist() {
  const { planeId } = useParams();
  const { planes, checklists, updateChecklist, getProgress, setProgress, trackRecentUse, getNote, setNote } = useFleet();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (planeId) trackRecentUse(planeId);
  }, [planeId]);
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

  const plane = planes.find(p => p.id === planeId);
  const checklist = planeId ? checklists[planeId] : null;
  const checkedItems = planeId ? getProgress(planeId) : {};
  const setCheckedItems = (updater: Record<string, boolean> | ((prev: Record<string, boolean>) => Record<string, boolean>)) => {
    if (!planeId) return;
    const newValue = typeof updater === 'function' ? updater(checkedItems) : updater;
    setProgress(planeId, newValue);
  };

  const prevCheckedRef = useRef<Record<string, boolean>>({});

  const downloadCsv = useCallback(() => {
    if (!plane || !checklist) return;
    const quote = (s: string) => `"${s.replace(/"/g, '""')}"`;
    const header = 'name,manufacturer,type,image,phase,item,expectedState';
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

  if (!plane || !checklist) {
    return <Navigate to="/" replace />;
  }

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

    updateChecklist(plane.id, updated);
    setInsertAt(null);
    setNewLabel('');
    setNewState('');
  };

  const deleteItem = (phaseId: string, itemId: string) => {
    const updated: PlaneChecklist = {
      ...checklist,
      phases: checklist.phases.map(phase => {
        if (phase.id !== phaseId) return phase;
        return { ...phase, items: phase.items.filter(i => i.id !== itemId) };
      }),
    };
    updateChecklist(plane.id, updated);
  };

  const addPhase = () => {
    if (!newPhaseTitle.trim()) return;
    const phaseId = `phase-${newPhaseTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`;
    const updated: PlaneChecklist = {
      ...checklist,
      phases: [...checklist.phases, { id: phaseId, title: newPhaseTitle.trim(), items: [] }],
    };
    updateChecklist(plane.id, updated);
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
    updateChecklist(plane.id, updated);
  };

  const movePhase = (phaseId: string, direction: 'up' | 'down') => {
    const idx = checklist.phases.findIndex(p => p.id === phaseId);
    if (idx < 0) return;
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= checklist.phases.length) return;
    const phases = [...checklist.phases];
    [phases[idx], phases[newIdx]] = [phases[newIdx], phases[idx]];
    const updated: PlaneChecklist = { ...checklist, phases };
    updateChecklist(plane.id, updated);
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
        <Link to="/" className={styles.backLink}>
          <ChevronLeft /> Back to Fleet
        </Link>
        <div className={styles.headerContent}>
          <div>
            <h1 className={styles.title}>{plane.name} Checklist</h1>
            <span className={styles.subtitle}>{plane.manufacturer}</span>
          </div>
          <div className={styles.headerActions}>
            <button
              onClick={() => { setIsEditing(!isEditing); setInsertAt(null); }}
              className={isEditing ? styles.editButtonActive : styles.resetButton}
            >
              <Pencil className={styles.resetIcon} />
              {isEditing ? 'Done' : 'Edit'}
            </button>
            <button onClick={downloadCsv} className={styles.resetButton}>
              <Download className={styles.resetIcon} />
              Download CSV
            </button>
            <button onClick={() => window.print()} className={styles.resetButton}>
              <Printer className={styles.resetIcon} />
              Print
            </button>
            <button onClick={resetChecklist} className={styles.resetButton}>
              <RotateCcw className={styles.resetIcon} />
              Reset
            </button>
            <button onClick={toggleMute} className={styles.resetButton} title={isMuted ? 'Unmute sounds' : 'Mute sounds'}>
              {isMuted ? <VolumeX className={styles.resetIcon} /> : <Volume2 className={styles.resetIcon} />}
            </button>
          </div>
        </div>

        {/* Overall progress */}
        <div className={clsx(styles.overallProgress, overallProgress === 100 && styles.overallComplete)}>
          <div className={styles.overallProgressInfo}>
            <span className={styles.overallLabel}>Overall Progress</span>
            <span className={styles.overallCount}>
              {completedItems} / {totalItems} items
            </span>
          </div>
          <div className={styles.overallBar}>
            <div
              className={styles.overallFill}
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <span className={styles.overallPercent}>{Math.round(overallProgress)}%</span>
        </div>
      </div>

      <div className={styles.searchBar}>
        <Search className={styles.searchIcon} size={18} />
        <input
          type="text"
          placeholder="Search checklist items..."
          className={styles.searchInput}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button className={styles.searchClear} onClick={() => setSearchQuery('')}>
            <X size={16} />
          </button>
        )}
      </div>
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
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); togglePhase(phase.id); } }}
                >
                  <div className={styles.phaseHeaderLeft}>
                    {isCollapsed ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
                    <h2 className={styles.phaseTitle}>{phase.title}</h2>
                  </div>
                  <div className={styles.progressWrapper}>
                    <div className={styles.progressBar}>
                      <div
                        className={styles.progressFill}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className={styles.progressText}>
                      {Math.round(progress)}%
                    </span>
                  </div>
                </div>
                {!isEditing && phase.items.length > 0 && (
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
                    <div key={item.id}>
                      <div className={styles.editableRow}>
                        <ChecklistItem
                          item={item}
                          checked={!!checkedItems[item.id]}
                          onToggle={() => toggleItem(item.id)}
                          note={getNote(item.id)}
                          onNoteChange={(text) => setNote(item.id, text)}
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
    </div>
  );
}
