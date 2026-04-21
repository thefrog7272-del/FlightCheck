import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Plus, Database, Loader, ArrowLeft } from 'lucide-react';
import { AdminPlaneList } from '../components/admin/AdminPlaneList';
import { AdminPlaneForm } from '../components/admin/AdminPlaneForm';
import { planes as staticPlanes } from '../data/planes';
import { checklists as staticChecklists } from '../data/checklists';
import {
  listSharedPlanes, listAllSharedChecklists,
  createSharedPlane, createSharedChecklist,
  updateSharedPlane, updateSharedChecklist,
  deleteSharedPlane, deleteSharedChecklist,
  listPendingSubmissions, deletePendingSubmission,
  type SharedPlaneRecord, type SharedChecklistRecord,
  type PendingSubmissionRecord,
} from '../api/sharedPlanes';
import { useConfirm } from '../hooks/useConfirm';
import type { Plane, PlaneChecklist } from '../data/types';
import styles from './AdminDashboard.module.css';

type View = 'list' | 'add' | 'edit' | 'seed';

export function AdminDashboard() {
  const { user, handleSignOut } = useAuth();
  const { confirm, ConfirmDialog } = useConfirm();

  const [planes, setPlanes] = useState<SharedPlaneRecord[]>([]);
  const [checklists, setChecklists] = useState<SharedChecklistRecord[]>([]);
  const [pendingSubmissions, setPendingSubmissions] = useState<PendingSubmissionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>('list');
  const [editingPlane, setEditingPlane] = useState<SharedPlaneRecord | null>(null);
  const [editingChecklist, setEditingChecklist] = useState<PlaneChecklist | null>(null);

  // Seed state
  const [seeding, setSeeding] = useState(false);
  const [seedProgress, setSeedProgress] = useState('');
  const [replacing, setReplacing] = useState(false);

  const refreshData = useCallback(async () => {
    setLoading(true);
    const [p, c, ps] = await Promise.all([listSharedPlanes(), listAllSharedChecklists(), listPendingSubmissions()]);
    setPlanes(p);
    setChecklists(c);
    setPendingSubmissions(ps);
    setLoading(false);
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleAdd = async (plane: Plane, checklist: PlaneChecklist) => {
    const created = await createSharedPlane({
      plane_id: plane.id,
      name: plane.name,
      manufacturer: plane.manufacturer,
      image: plane.image,
      type: plane.type,
      sim: plane.sim || null,
      sort_order: planes.length,
    });
    if (!created) throw new Error('Failed to create plane record.');

    const clCreated = await createSharedChecklist({
      plane_id: plane.id,
      category: 'normal',
      phases: JSON.stringify(checklist.phases),
    });
    if (!clCreated) throw new Error('Plane created but failed to create checklist record.');

    await refreshData();
    setView('list');
  };

  const handleEdit = async (plane: Plane, checklist: PlaneChecklist) => {
    if (!editingPlane) return;

    const planeOk = await updateSharedPlane(editingPlane.id, {
      plane_id: plane.id,
      name: plane.name,
      manufacturer: plane.manufacturer,
      image: plane.image,
      type: plane.type,
      sim: plane.sim || null,
    });
    if (!planeOk) throw new Error('Failed to update plane record.');

    const existingCl = checklists.find(c => c.plane_id === editingPlane.plane_id && c.category.toLowerCase() === 'normal');
    if (existingCl) {
      const clOk = await updateSharedChecklist(existingCl.id, JSON.stringify(checklist.phases));
      if (!clOk) throw new Error('Plane updated but failed to update checklist.');
    } else {
      const clCreated = await createSharedChecklist({
        plane_id: plane.id,
        category: 'normal',
        phases: JSON.stringify(checklist.phases),
      });
      if (!clCreated) throw new Error('Plane updated but failed to create checklist.');
    }

    await refreshData();
    setView('list');
    setEditingPlane(null);
    setEditingChecklist(null);
  };

  const handleStartEdit = (plane: SharedPlaneRecord) => {
    const cl = checklists.find(c => c.plane_id === plane.plane_id && c.category.toLowerCase() === 'normal');
    let parsedChecklist: PlaneChecklist | null = null;
    if (cl) {
      try {
        parsedChecklist = { planeId: cl.plane_id, phases: JSON.parse(cl.phases) };
      } catch { /* ignore parse error */ }
    }
    setEditingPlane(plane);
    setEditingChecklist(parsedChecklist);
    setView('edit');
  };

  const handleDelete = async (plane: SharedPlaneRecord) => {
    const confirmed = await confirm(
      'Delete Plane',
      `Are you sure you want to delete "${plane.name}"? This will also remove its checklists. This action cannot be undone.`,
      { destructive: true, confirmLabel: 'Delete' }
    );
    if (!confirmed) return;

    const planeChecklists = checklists.filter(c => c.plane_id === plane.plane_id);
    for (const cl of planeChecklists) {
      await deleteSharedChecklist(cl.id);
    }
    await deleteSharedPlane(plane.id);
    await refreshData();
  };

  const handleReplaceAllStatic = async () => {
    const confirmed = await confirm(
      'Replace Static with Shared',
      `This will replace the ${staticPlanes.length} built-in aircraft with their shared database versions. You currently have ${planes.length} shared planes and will keep all ${planes.length} after this operation.`,
      { destructive: true, confirmLabel: 'Replace' }
    );
    if (!confirmed) return;

    setReplacing(true);
    setSeedProgress('Replacing static planes with shared versions...');

    try {
      let updated = 0;
      let created = 0;
      let checklistsUpdated = 0;

      for (let i = 0; i < staticPlanes.length; i++) {
        const plane = staticPlanes[i];
        setSeedProgress(`Syncing ${plane.name}... ${i + 1}/${staticPlanes.length}`);

        // Check if plane exists in shared DB
        const existing = planes.find(p => p.plane_id === plane.id);

        if (existing) {
          // Update existing shared plane with fresh copy from static
          await updateSharedPlane(existing.id, {
            plane_id: plane.id,
            name: plane.name,
            manufacturer: plane.manufacturer,
            image: plane.image,
            type: plane.type,
            sim: plane.sim || null,
          });
          updated++;
        } else {
          // Create new shared plane from static
          await createSharedPlane({
            plane_id: plane.id,
            name: plane.name,
            manufacturer: plane.manufacturer,
            image: plane.image,
            type: plane.type,
            sim: plane.sim || null,
            sort_order: i,
          });
          created++;
        }

        // Sync checklists
        for (const [clKey, checklist] of Object.entries(staticChecklists)) {
          if (!clKey.startsWith(plane.id)) continue;

          const parts = clKey.split('::');
          const categoryName = parts[1] || 'normal';

          const existingCl = checklists.find(c => c.plane_id === plane.id && c.category === categoryName);
          if (existingCl) {
            await updateSharedChecklist(existingCl.id, JSON.stringify(checklist.phases));
          } else {
            await createSharedChecklist({
              plane_id: plane.id,
              category: categoryName,
              phases: JSON.stringify(checklist.phases),
            });
          }
          checklistsUpdated++;
        }
      }

      setSeedProgress(`Done! Replaced ${staticPlanes.length} static planes with shared versions (${updated} updated, ${created} created, ${checklistsUpdated} checklists synced). Total shared planes: ${planes.length}.`);
      await refreshData();
    } catch (err) {
      setSeedProgress(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setReplacing(false);
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    setSeedProgress('Checking existing planes...');

    try {
      const existing = await listSharedPlanes();
      const existingIds = new Set(existing.map(p => p.plane_id));
      const existingChecklists = await listAllSharedChecklists();
      const existingClKeys = new Set(existingChecklists.map(c => {
        if (c.category && c.category !== 'normal') {
          return `${c.plane_id}::${c.category}`;
        }
        return c.plane_id;
      }));

      let created = 0;
      let checklistsCreated = 0;

      for (let i = 0; i < staticPlanes.length; i++) {
        const plane = staticPlanes[i];
        if (existingIds.has(plane.id)) {
          setSeedProgress(`Skipping ${plane.name} (already exists)... ${i + 1}/${staticPlanes.length}`);
        } else {
          setSeedProgress(`Creating ${plane.name}... ${i + 1}/${staticPlanes.length}`);

          await createSharedPlane({
            plane_id: plane.id,
            name: plane.name,
            manufacturer: plane.manufacturer,
            image: plane.image,
            type: plane.type,
            sim: plane.sim || null,
            sort_order: i,
          });
          created++;
        }

        // Find all checklists for this plane (including categories like ::Emergency)
        for (const [clKey, checklist] of Object.entries(staticChecklists)) {
          if (!clKey.startsWith(plane.id)) continue;
          if (existingClKeys.has(clKey)) {
            setSeedProgress(`Skipping checklist ${clKey} (already exists)...`);
            continue;
          }

          setSeedProgress(`Creating checklist ${clKey}...`);

          const parts = clKey.split('::');
          const categoryName = parts[1] || 'normal';

          await createSharedChecklist({
            plane_id: plane.id,
            category: categoryName,
            phases: JSON.stringify(checklist.phases),
          });
          checklistsCreated++;
        }
      }

      setSeedProgress(`Done! Created ${created} new plane(s) and ${checklistsCreated} checklist(s).`);
      await refreshData();
    } catch (err) {
      setSeedProgress(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setSeeding(false);
    }
  };

  const handleApproveSubmission = async (submission: PendingSubmissionRecord) => {
    const planeId = submission.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const planeResult = await createSharedPlane({
      plane_id: planeId,
      name: submission.name,
      manufacturer: submission.manufacturer,
      image: submission.image || '',
      type: submission.type,
      sim: submission.sim || null,
      sort_order: null,
    });
    if (planeResult) {
      await createSharedChecklist({
        plane_id: planeId,
        category: 'normal',
        phases: submission.phases,
      });
    }
    await deletePendingSubmission(submission.id);
    await refreshData();
  };

  const handleRejectSubmission = async (submission: PendingSubmissionRecord) => {
    const confirmed = await confirm(
      'Reject Submission',
      `Reject "${submission.name}" submitted by ${submission.submitted_by || 'anonymous'}?`,
      { destructive: true, confirmLabel: 'Reject' }
    );
    if (!confirmed) return;
    await deletePendingSubmission(submission.id);
    await refreshData();
  };

  const renderContent = () => {
    if (loading && view === 'list') {
      return (
        <div className={styles.loadingWrap}>
          <Loader size={24} className={styles.spinner} />
          <span>Loading shared planes...</span>
        </div>
      );
    }

    switch (view) {
      case 'add':
        return (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Add New Plane</h2>
            <AdminPlaneForm
              onSubmit={handleAdd}
              onCancel={() => setView('list')}
              submitLabel="Create Plane"
            />
          </div>
        );

      case 'edit':
        return (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Edit Plane</h2>
            {editingPlane && (
              <AdminPlaneForm
                initialPlane={editingPlane}
                initialChecklist={editingChecklist || undefined}
                onSubmit={handleEdit}
                onCancel={() => { setView('list'); setEditingPlane(null); setEditingChecklist(null); }}
                submitLabel="Save Changes"
              />
            )}
          </div>
        );

      case 'seed':
        return (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Seed Database</h2>
            <p className={styles.sectionDesc}>
              Populate the shared planes database with the {staticPlanes.length} built-in aircraft and their checklists.
              This is safe to run multiple times — existing planes will be skipped.
            </p>
            <button
              className={styles.seedButton}
              onClick={handleSeed}
              disabled={seeding}
            >
              {seeding ? <Loader size={16} className={styles.spinner} /> : <Database size={16} />}
              {seeding ? 'Seeding...' : 'Seed Database'}
            </button>
            {seedProgress && (
              <p className={styles.seedProgress}>{seedProgress}</p>
            )}
          </div>
        );

      default:
        return (
          <>
            {pendingSubmissions.length > 0 && (
              <div className={styles.pendingSection}>
                <h2 className={styles.pendingSectionTitle}>Pending Submissions ({pendingSubmissions.length})</h2>
                <div className={styles.pendingList}>
                  {pendingSubmissions.map(sub => {
                    let phaseCount = 0;
                    try { phaseCount = JSON.parse(sub.phases).length; } catch { /* */ }
                    return (
                      <div key={sub.id} className={styles.pendingCard}>
                        <div className={styles.pendingInfo}>
                          <span className={styles.pendingName}>{sub.name}</span>
                          <span className={styles.pendingMeta}>
                            {sub.manufacturer} &middot; {sub.type} &middot; {phaseCount} phase{phaseCount !== 1 ? 's' : ''}
                          </span>
                          {sub.submitted_by && (
                            <span className={styles.pendingMeta}>by {sub.submitted_by}</span>
                          )}
                        </div>
                        <div className={styles.pendingActions}>
                          <button className={styles.approveBtn} onClick={() => handleApproveSubmission(sub)}>
                            Approve
                          </button>
                          <button className={styles.rejectBtn} onClick={() => handleRejectSubmission(sub)}>
                            Reject
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            <div className={styles.toolbar}>
              <button className={styles.addBtn} onClick={() => setView('add')}>
                <Plus size={16} /> Add Plane
              </button>
              <button className={styles.seedLink} onClick={() => setView('seed')}>
                <Database size={14} /> Seed Database
              </button>
              {planes.length > 0 && (
                <button className={styles.replaceLink} onClick={handleReplaceAllStatic} disabled={replacing}>
                  {replacing ? <Loader size={14} className={styles.spinner} /> : <Database size={14} />}
                  {replacing ? 'Replacing...' : 'Replace Static with Shared'}
                </button>
              )}
            </div>
            <AdminPlaneList
              planes={planes}
              checklists={checklists}
              onEdit={handleStartEdit}
              onDelete={handleDelete}
            />
          </>
        );
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          {view !== 'list' && (
            <button className={styles.backBtn} onClick={() => { setView('list'); setEditingPlane(null); setEditingChecklist(null); }}>
              <ArrowLeft size={16} />
            </button>
          )}
          <h1 className={styles.title}>Admin Dashboard</h1>
        </div>
        <div className={styles.userInfo}>
          <span className={styles.email}>{user?.email}</span>
          <button className={styles.signOut} onClick={handleSignOut}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </div>
      <div className={styles.content}>
        {renderContent()}
      </div>
      {ConfirmDialog}
    </div>
  );
}
