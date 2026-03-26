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
      planeId: plane.id,
      name: plane.name,
      manufacturer: plane.manufacturer,
      image: plane.image,
      type: plane.type,
      sim: plane.sim || null,
      sortOrder: planes.length,
    });
    if (!created) throw new Error('Failed to create plane record.');

    const clCreated = await createSharedChecklist({
      planeId: plane.id,
      phases: JSON.stringify(checklist.phases),
    });
    if (!clCreated) throw new Error('Plane created but failed to create checklist record.');

    await refreshData();
    setView('list');
  };

  const handleEdit = async (plane: Plane, checklist: PlaneChecklist) => {
    if (!editingPlane) return;

    const planeOk = await updateSharedPlane(editingPlane.id, {
      planeId: plane.id,
      name: plane.name,
      manufacturer: plane.manufacturer,
      image: plane.image,
      type: plane.type,
      sim: plane.sim || null,
    });
    if (!planeOk) throw new Error('Failed to update plane record.');

    const existingCl = checklists.find(c => c.planeId === editingPlane.planeId);
    if (existingCl) {
      const clOk = await updateSharedChecklist(existingCl.id, JSON.stringify(checklist.phases));
      if (!clOk) throw new Error('Plane updated but failed to update checklist.');
    } else {
      const clCreated = await createSharedChecklist({
        planeId: plane.id,
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
    const cl = checklists.find(c => c.planeId === plane.planeId);
    let parsedChecklist: PlaneChecklist | null = null;
    if (cl) {
      try {
        parsedChecklist = { planeId: cl.planeId, phases: JSON.parse(cl.phases) };
      } catch { /* ignore parse error */ }
    }
    setEditingPlane(plane);
    setEditingChecklist(parsedChecklist);
    setView('edit');
  };

  const handleDelete = async (plane: SharedPlaneRecord) => {
    const confirmed = await confirm(
      'Delete Plane',
      `Are you sure you want to delete "${plane.name}"? This will also remove its checklist. This action cannot be undone.`,
      { destructive: true, confirmLabel: 'Delete' }
    );
    if (!confirmed) return;

    const cl = checklists.find(c => c.planeId === plane.planeId);
    if (cl) {
      await deleteSharedChecklist(cl.id);
    }
    await deleteSharedPlane(plane.id);
    await refreshData();
  };

  const handleSeed = async () => {
    setSeeding(true);
    setSeedProgress('Checking existing planes...');

    try {
      const existing = await listSharedPlanes();
      const existingIds = new Set(existing.map(p => p.planeId));

      let created = 0;
      for (let i = 0; i < staticPlanes.length; i++) {
        const plane = staticPlanes[i];
        if (existingIds.has(plane.id)) {
          setSeedProgress(`Skipping ${plane.name} (already exists)... ${i + 1}/${staticPlanes.length}`);
          continue;
        }

        setSeedProgress(`Creating ${plane.name}... ${i + 1}/${staticPlanes.length}`);

        await createSharedPlane({
          planeId: plane.id,
          name: plane.name,
          manufacturer: plane.manufacturer,
          image: plane.image,
          type: plane.type,
          sim: plane.sim || null,
          sortOrder: i,
        });

        const checklist = staticChecklists[plane.id];
        if (checklist) {
          await createSharedChecklist({
            planeId: plane.id,
            phases: JSON.stringify(checklist.phases),
          });
        }

        created++;
      }

      setSeedProgress(`Done! Created ${created} new plane(s). ${existingIds.size} already existed.`);
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
      planeId,
      name: submission.name,
      manufacturer: submission.manufacturer,
      image: submission.image || '',
      type: submission.type,
      sim: submission.sim || null,
      sortOrder: null,
    });
    if (planeResult) {
      await createSharedChecklist({
        planeId,
        phases: submission.phases,
      });
    }
    await deletePendingSubmission(submission.id);
    await refreshData();
  };

  const handleRejectSubmission = async (submission: PendingSubmissionRecord) => {
    const confirmed = await confirm(
      'Reject Submission',
      `Reject "${submission.name}" submitted by ${submission.submittedBy || 'anonymous'}?`,
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
                          {sub.submittedBy && (
                            <span className={styles.pendingMeta}>by {sub.submittedBy}</span>
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
          <span className={styles.email}>{user?.signInDetails?.loginId}</span>
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
