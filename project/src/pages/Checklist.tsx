import { useParams, Navigate, Link } from 'react-router-dom';
import { ChecklistItem } from '../components/ChecklistItem';
import styles from './Checklist.module.css';
import { ChevronLeft, RotateCcw } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useFleet } from '../hooks/useFleet';

export function Checklist() {
  const { planeId } = useParams();
  const { planes, checklists } = useFleet();
  
  const plane = planes.find(p => p.id === planeId);
  const checklist = planeId ? checklists[planeId] : null;

  // State to track checked items: { [itemId]: boolean }
  const [checkedItems, setCheckedItems] = useLocalStorage<Record<string, boolean>>(
    `checklist_progress_${planeId}`, 
    {}
  );

  if (!plane || !checklist) {
    return <Navigate to="/" replace />;
  }

  const toggleItem = (itemId: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const resetChecklist = () => {
    if (confirm('Are you sure you want to reset all checklist items?')) {
      setCheckedItems({});
    }
  };

  const calculateProgress = (phaseItems: string[]) => {
    if (phaseItems.length === 0) return 0;
    const checkedCount = phaseItems.filter(id => checkedItems[id]).length;
    return (checkedCount / phaseItems.length) * 100;
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
          <button onClick={resetChecklist} className={styles.resetButton}>
            <RotateCcw className={styles.resetIcon} />
            Reset
          </button>
        </div>
      </div>

      <div className={styles.phases}>
        {checklist.phases.map(phase => {
          const progress = calculateProgress(phase.items.map(i => i.id));
          
          return (
            <div key={phase.id} className={styles.phase}>
              <div className={styles.phaseHeader}>
                <h2 className={styles.phaseTitle}>{phase.title}</h2>
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
              <div className={styles.items}>
                {phase.items.map(item => (
                  <ChecklistItem
                    key={item.id}
                    item={item}
                    checked={!!checkedItems[item.id]}
                    onToggle={() => toggleItem(item.id)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
