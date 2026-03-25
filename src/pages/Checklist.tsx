import { useState, useMemo } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { ChecklistItem } from '../components/ChecklistItem';
import { KeyboardHints } from '../components/KeyboardHints';
import styles from './Checklist.module.css';
import { ChevronLeft, ChevronDown, ChevronRight, RotateCcw, Download, Pencil, Plus, X, Printer, ArrowUp, ArrowDown } from 'lucide-react';
import { useFleet } from '../hooks/useFleet';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useConfirm } from '../hooks/useConfirm';
import type { PlaneChecklist } from '../data/types';

export function Checklist() {
  const { planeId } = useParams();
  const { planes, checklists, updateChecklist, loading, getProgress, setProgress } = useFleet();
  const { confirm, ConfirmDialog } = useConfirm();
  const [isEditing, setIsEditing] = useState(false);
  const [insertAt, setInsertAt] = useState<{ phaseId: string; index: number } | null>(null);
  const [newLabel, setNewLabel] = useState('');
  const [newState, setNewState] = useState('');
  const [collapsedPhases, setCollapsedPhases] = useState<Record<string, boolean>>({});
  const [isAddingPhase, setIsAddingPhase] = useState(false);
  const [newPhaseTitle, setNewPhaseTitle] = useState('');

  const plane = planes.find(p => p.id === planeId);
  const checklist = planeId ? checklists[planeId] : null;
  const checkedItems = planeId ? getProgress(planeId) : {};
  const setCheckedItems = (updater: Record<string, boolean> | ((prev: Record<string, boolean>) => Record<string, boolean>)) => {
    if (!planeId) return;
    const newValue = typeof updater === 'function' ? updater(checkedItems) : updater;
    setProgress(planeId, newValue);
  };

  const downloadCsv = () => {
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
  }), [isEditing, plane, checklist]));

  if (!plane || !checklist) {
    return <Navigate to="/" replace />;
  }

  const toggleItem = (itemId: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
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
      setCheckedItems({});
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
          </div>
        </div>

        {/* Overall progress */}
        <div className={styles.overallProgress}>
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

      <div className={styles.phases}>
        {checklist.phases.map(phase => {
          const progress = calculateProgress(phase.items.map(i => i.id));
          const isCollapsed = collapsedPhases[phase.id];
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
    </div>
  );
}
