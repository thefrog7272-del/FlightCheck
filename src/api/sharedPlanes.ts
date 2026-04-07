import { supabase } from '../lib/supabase';

export interface SharedPlaneRecord {
  id: string;
  plane_id: string;
  name: string;
  manufacturer: string;
  image: string;
  type: string;
  sim?: string | null;
  sort_order?: number | null;
}

export interface SharedChecklistRecord {
  id: string;
  plane_id: string;
  variant_name: string;
  category: string;
  phases: string;
}

export interface PendingSubmissionRecord {
  id: string;
  name: string;
  manufacturer: string;
  image?: string | null;
  type: string;
  sim?: string | null;
  phases: string;
  submitted_by?: string | null;
  status: string;
  created_at?: string;
}

export async function listSharedPlanes(): Promise<SharedPlaneRecord[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('shared_planes')
      .select('*')
      .order('sort_order', { ascending: true, nullsFirst: false });
    if (error) throw error;
    return data ?? [];
  } catch (err) {
    console.error('[FlightCheck API] listSharedPlanes FAILED:', err);
    return [];
  }
}

export async function getSharedChecklist(planeId: string): Promise<SharedChecklistRecord | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('shared_checklists')
      .select('*')
      .eq('plane_id', planeId)
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('[FlightCheck API] getSharedChecklist FAILED:', err);
    return null;
  }
}

export async function listAllSharedChecklists(): Promise<SharedChecklistRecord[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('shared_checklists')
      .select('*');
    if (error) throw error;
    return data ?? [];
  } catch (err) {
    console.error('[FlightCheck API] listAllSharedChecklists FAILED:', err);
    return [];
  }
}

export async function createSharedPlane(plane: Omit<SharedPlaneRecord, 'id'>): Promise<SharedPlaneRecord | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('shared_planes')
      .insert([{
        plane_id: plane.plane_id,
        name: plane.name,
        manufacturer: plane.manufacturer,
        image: plane.image,
        type: plane.type,
        sim: plane.sim,
        sort_order: plane.sort_order,
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('[FlightCheck API] createSharedPlane FAILED:', err);
    return null;
  }
}

export async function createSharedChecklist(checklist: Omit<SharedChecklistRecord, 'id'>): Promise<SharedChecklistRecord | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('shared_checklists')
      .insert([{
        plane_id: checklist.plane_id,
        variant_name: checklist.variant_name,
        category: checklist.category,
        phases: checklist.phases,
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('[FlightCheck API] createSharedChecklist FAILED:', err);
    return null;
  }
}

export async function deleteSharedPlane(id: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('shared_planes').delete().eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('[FlightCheck API] deleteSharedPlane FAILED:', err);
    return false;
  }
}

export async function updateSharedPlane(id: string, plane: Partial<Omit<SharedPlaneRecord, 'id'>>): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('shared_planes')
      .update({
        ...(plane.plane_id !== undefined && { plane_id: plane.plane_id }),
        ...(plane.name !== undefined && { name: plane.name }),
        ...(plane.manufacturer !== undefined && { manufacturer: plane.manufacturer }),
        ...(plane.image !== undefined && { image: plane.image }),
        ...(plane.type !== undefined && { type: plane.type }),
        ...(plane.sim !== undefined && { sim: plane.sim }),
        ...(plane.sort_order !== undefined && { sort_order: plane.sort_order }),
      })
      .eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('[FlightCheck API] updateSharedPlane FAILED:', err);
    return false;
  }
}

export async function updateSharedChecklist(id: string, phases: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('shared_checklists').update({ phases }).eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('[FlightCheck API] updateSharedChecklist FAILED:', err);
    return false;
  }
}

export async function deleteSharedChecklist(id: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('shared_checklists').delete().eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('[FlightCheck API] deleteSharedChecklist FAILED:', err);
    return false;
  }
}

export async function createPendingSubmission(submission: {
  name: string;
  manufacturer: string;
  image?: string | null;
  type: string;
  sim?: string | null;
  phases: string;
  submitted_by?: string | null;
  status: string;
}): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('pending_submissions').insert([{
      name: submission.name,
      manufacturer: submission.manufacturer,
      image: submission.image,
      type: submission.type,
      sim: submission.sim,
      phases: submission.phases,
      submitted_by: submission.submitted_by,
      status: submission.status,
    }]);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('[FlightCheck API] createPendingSubmission FAILED:', err);
    return false;
  }
}

export async function listPendingSubmissions(): Promise<PendingSubmissionRecord[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('pending_submissions')
      .select('*')
      .eq('status', 'pending');
    if (error) throw error;
    return data ?? [];
  } catch (err) {
    console.error('[FlightCheck API] listPendingSubmissions FAILED:', err);
    return [];
  }
}

export async function deletePendingSubmission(id: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('pending_submissions').delete().eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('[FlightCheck API] deletePendingSubmission FAILED:', err);
    return false;
  }
}
