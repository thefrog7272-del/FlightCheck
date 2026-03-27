import { generateClient } from 'aws-amplify/data';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GqlResult = { data: Record<string, any> };

// Lazy-initialize client after Amplify.configure() has run
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _client: any = null;
function getClient() {
  if (!_client) {
    _client = generateClient({ authMode: 'iam' });
  }
  return _client;
}

function log(action: string, ...args: unknown[]) {
  console.log(`[FlightCheck API] ${action}`, ...args);
}

function logError(action: string, err: unknown) {
  console.error(`[FlightCheck API] ${action} FAILED:`, err);
}

export interface SharedPlaneRecord {
  id: string;
  planeId: string;
  name: string;
  manufacturer: string;
  image: string;
  type: string;
  sim?: string | null;
  sortOrder?: number | null;
}

export interface SharedChecklistRecord {
  id: string;
  planeId: string;
  phases: string; // JSON-stringified ChecklistPhase[]
}

export async function listSharedPlanes(): Promise<SharedPlaneRecord[]> {
  log('listSharedPlanes', 'fetching...');
  try {
    const result = await getClient().graphql({
      query: `query ListSharedPlanes {
        listSharedPlanes(limit: 100) {
          items {
            id
            planeId
            name
            manufacturer
            image
            type
            sim
            sortOrder
          }
        }
      }`,
    });
    const items = (result as GqlResult).data.listSharedPlanes.items;
    log('listSharedPlanes', `fetched ${items.length} planes`);
    return items;
  } catch (err) {
    logError('listSharedPlanes', err);
    return [];
  }
}

export async function getSharedChecklist(planeId: string): Promise<SharedChecklistRecord | null> {
  try {
    const result = await getClient().graphql({
      query: `query ListSharedChecklists($filter: ModelSharedChecklistFilterInput) {
        listSharedChecklists(filter: $filter, limit: 1) {
          items {
            id
            planeId
            phases
          }
        }
      }`,
      variables: {
        filter: { planeId: { eq: planeId } },
      },
    });
    const items = (result as GqlResult).data.listSharedChecklists.items;
    return items.length > 0 ? items[0] : null;
  } catch (err) {
    console.error('Failed to fetch shared checklist:', err);
    return null;
  }
}

export async function listAllSharedChecklists(): Promise<SharedChecklistRecord[]> {
  try {
    const result = await getClient().graphql({
      query: `query ListSharedChecklists {
        listSharedChecklists(limit: 100) {
          items {
            id
            planeId
            phases
          }
        }
      }`,
    });
    const items = (result as GqlResult).data.listSharedChecklists.items;
    log('listAllSharedChecklists', `fetched ${items.length} checklists`);
    return items;
  } catch (err) {
    logError('listAllSharedChecklists', err);
    return [];
  }
}

// Admin-only mutations (requires Cognito auth)
export async function createSharedPlane(plane: Omit<SharedPlaneRecord, 'id'>): Promise<SharedPlaneRecord | null> {
  log('createSharedPlane', plane.planeId, plane.name);
  try {
    const result = await getClient().graphql({
      query: `mutation CreateSharedPlane($input: CreateSharedPlaneInput!) {
        createSharedPlane(input: $input) {
          id
          planeId
          name
          manufacturer
          image
          type
          sim
          sortOrder
        }
      }`,
      variables: { input: plane },
      authMode: 'userPool',
    });
    const created = (result as GqlResult).data.createSharedPlane;
    log('createSharedPlane', 'SUCCESS', created.id);
    return created;
  } catch (err) {
    logError('createSharedPlane', err);
    return null;
  }
}

export async function createSharedChecklist(checklist: Omit<SharedChecklistRecord, 'id'>): Promise<SharedChecklistRecord | null> {
  log('createSharedChecklist', checklist.planeId, `phases: ${checklist.phases.length} chars`);
  try {
    const result = await getClient().graphql({
      query: `mutation CreateSharedChecklist($input: CreateSharedChecklistInput!) {
        createSharedChecklist(input: $input) {
          id
          planeId
          phases
        }
      }`,
      variables: { input: checklist },
      authMode: 'userPool',
    });
    const created = (result as GqlResult).data.createSharedChecklist;
    log('createSharedChecklist', 'SUCCESS', created.id);
    return created;
  } catch (err) {
    logError('createSharedChecklist', err);
    return null;
  }
}

export async function deleteSharedPlane(id: string): Promise<boolean> {
  try {
    await getClient().graphql({
      query: `mutation DeleteSharedPlane($input: DeleteSharedPlaneInput!) {
        deleteSharedPlane(input: $input) { id }
      }`,
      variables: { input: { id } },
      authMode: 'userPool',
    });
    return true;
  } catch (err) {
    console.error('Failed to delete shared plane:', err);
    return false;
  }
}

export async function updateSharedPlane(id: string, plane: Partial<Omit<SharedPlaneRecord, 'id'>>): Promise<boolean> {
  try {
    await getClient().graphql({
      query: `mutation UpdateSharedPlane($input: UpdateSharedPlaneInput!) {
        updateSharedPlane(input: $input) { id }
      }`,
      variables: { input: { id, ...plane } },
      authMode: 'userPool',
    });
    return true;
  } catch (err) {
    console.error('Failed to update shared plane:', err);
    return false;
  }
}

export async function updateSharedChecklist(id: string, phases: string): Promise<boolean> {
  try {
    await getClient().graphql({
      query: `mutation UpdateSharedChecklist($input: UpdateSharedChecklistInput!) {
        updateSharedChecklist(input: $input) { id }
      }`,
      variables: { input: { id, phases } },
      authMode: 'userPool',
    });
    return true;
  } catch (err) {
    console.error('Failed to update shared checklist:', err);
    return false;
  }
}

export async function deleteSharedChecklist(id: string): Promise<boolean> {
  try {
    await getClient().graphql({
      query: `mutation DeleteSharedChecklist($input: DeleteSharedChecklistInput!) {
        deleteSharedChecklist(input: $input) { id }
      }`,
      variables: { input: { id } },
      authMode: 'userPool',
    });
    return true;
  } catch (err) {
    console.error('Failed to delete shared checklist:', err);
    return false;
  }
}

// Pending submissions

export interface PendingSubmissionRecord {
  id: string;
  name: string;
  manufacturer: string;
  image?: string | null;
  type: string;
  sim?: string | null;
  phases: string;
  submittedBy?: string | null;
  status: string;
  createdAt?: string;
}

export async function createPendingSubmission(submission: {
  name: string;
  manufacturer: string;
  image?: string | null;
  type: string;
  sim?: string | null;
  phases: string;
  submittedBy?: string | null;
  status: string;
}): Promise<boolean> {
  try {
    await getClient().graphql({
      query: `mutation CreatePendingSubmission($input: CreatePendingSubmissionInput!) {
        createPendingSubmission(input: $input) { id }
      }`,
      variables: { input: submission },
    });
    return true;
  } catch (err) {
    console.error('Failed to create submission:', err);
    return false;
  }
}

export async function listPendingSubmissions(): Promise<PendingSubmissionRecord[]> {
  try {
    const result = await getClient().graphql({
      query: `query ListPendingSubmissions($filter: ModelPendingSubmissionFilterInput) {
        listPendingSubmissions(filter: $filter, limit: 100) {
          items {
            id name manufacturer image type sim phases submittedBy status createdAt
          }
        }
      }`,
      variables: { filter: { status: { eq: 'pending' } } },
      authMode: 'userPool',
    });
    return (result as GqlResult).data.listPendingSubmissions.items;
  } catch (err) {
    console.error('Failed to list submissions:', err);
    return [];
  }
}

export async function updatePendingSubmission(id: string, status: string): Promise<boolean> {
  try {
    await getClient().graphql({
      query: `mutation UpdatePendingSubmission($input: UpdatePendingSubmissionInput!) {
        updatePendingSubmission(input: $input) { id }
      }`,
      variables: { input: { id, status } },
      authMode: 'userPool',
    });
    return true;
  } catch (err) {
    console.error('Failed to update submission:', err);
    return false;
  }
}

export async function deletePendingSubmission(id: string): Promise<boolean> {
  try {
    await getClient().graphql({
      query: `mutation DeletePendingSubmission($input: DeletePendingSubmissionInput!) {
        deletePendingSubmission(input: $input) { id }
      }`,
      variables: { input: { id } },
      authMode: 'userPool',
    });
    return true;
  } catch (err) {
    console.error('Failed to delete submission:', err);
    return false;
  }
}
