import { fetchAuthSession } from 'aws-amplify/auth';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GqlResult = { data: Record<string, any> };

const ENDPOINT = 'https://ep3mvuopvbh6rbznjkguq7i5b4.appsync-api.eu-west-2.amazonaws.com/graphql';
const API_KEY = 'da2-fk7wwxhihfhcfimzsma5gnsvxq';

async function gql(query: string, variables?: Record<string, unknown>, useUserPool = false): Promise<GqlResult> {
  const body = JSON.stringify({ query, variables });
  const headers: Record<string, string> = { 'content-type': 'application/json' };

  if (useUserPool) {
    // Admin writes: use Cognito ID token
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();
    if (token) headers['Authorization'] = token;
  } else {
    // Guest reads: use API key (no signing needed)
    headers['x-api-key'] = API_KEY;
  }

  const res = await fetch(ENDPOINT, { method: 'POST', headers, body });
  if (!res.ok) throw new Error(`GraphQL request failed: ${res.status}`);
  return res.json();
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
    const result = await gql(`query ListSharedPlanes {
      listSharedPlanes(limit: 100) {
        items {
          id planeId name manufacturer image type sim sortOrder
        }
      }
    }`);
    const items = result.data.listSharedPlanes.items;
    log('listSharedPlanes', `fetched ${items.length} planes`);
    return items;
  } catch (err) {
    logError('listSharedPlanes', err);
    return [];
  }
}

export async function getSharedChecklist(planeId: string): Promise<SharedChecklistRecord | null> {
  try {
    const result = await gql(
      `query ListSharedChecklists($filter: ModelSharedChecklistFilterInput) {
        listSharedChecklists(filter: $filter, limit: 1) {
          items { id planeId phases }
        }
      }`,
      { filter: { planeId: { eq: planeId } } },
    );
    const items = result.data.listSharedChecklists.items;
    return items.length > 0 ? items[0] : null;
  } catch (err) {
    console.error('Failed to fetch shared checklist:', err);
    return null;
  }
}

export async function listAllSharedChecklists(): Promise<SharedChecklistRecord[]> {
  try {
    const result = await gql(`query ListSharedChecklists {
      listSharedChecklists(limit: 100) {
        items { id planeId phases }
      }
    }`);
    const items = result.data.listSharedChecklists.items;
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
    const result = await gql(
      `mutation CreateSharedPlane($input: CreateSharedPlaneInput!) {
        createSharedPlane(input: $input) {
          id planeId name manufacturer image type sim sortOrder
        }
      }`,
      { input: plane },
      true,
    );
    const created = result.data.createSharedPlane;
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
    const result = await gql(
      `mutation CreateSharedChecklist($input: CreateSharedChecklistInput!) {
        createSharedChecklist(input: $input) {
          id planeId phases
        }
      }`,
      { input: checklist },
      true,
    );
    const created = result.data.createSharedChecklist;
    log('createSharedChecklist', 'SUCCESS', created.id);
    return created;
  } catch (err) {
    logError('createSharedChecklist', err);
    return null;
  }
}

export async function deleteSharedPlane(id: string): Promise<boolean> {
  try {
    await gql(
      `mutation DeleteSharedPlane($input: DeleteSharedPlaneInput!) {
        deleteSharedPlane(input: $input) { id }
      }`,
      { input: { id } },
      true,
    );
    return true;
  } catch (err) {
    console.error('Failed to delete shared plane:', err);
    return false;
  }
}

export async function updateSharedPlane(id: string, plane: Partial<Omit<SharedPlaneRecord, 'id'>>): Promise<boolean> {
  try {
    await gql(
      `mutation UpdateSharedPlane($input: UpdateSharedPlaneInput!) {
        updateSharedPlane(input: $input) { id }
      }`,
      { input: { id, ...plane } },
      true,
    );
    return true;
  } catch (err) {
    console.error('Failed to update shared plane:', err);
    return false;
  }
}

export async function updateSharedChecklist(id: string, phases: string): Promise<boolean> {
  try {
    await gql(
      `mutation UpdateSharedChecklist($input: UpdateSharedChecklistInput!) {
        updateSharedChecklist(input: $input) { id }
      }`,
      { input: { id, phases } },
      true,
    );
    return true;
  } catch (err) {
    console.error('Failed to update shared checklist:', err);
    return false;
  }
}

export async function deleteSharedChecklist(id: string): Promise<boolean> {
  try {
    await gql(
      `mutation DeleteSharedChecklist($input: DeleteSharedChecklistInput!) {
        deleteSharedChecklist(input: $input) { id }
      }`,
      { input: { id } },
      true,
    );
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
    await gql(
      `mutation CreatePendingSubmission($input: CreatePendingSubmissionInput!) {
        createPendingSubmission(input: $input) { id }
      }`,
      { input: submission },
    );
    return true;
  } catch (err) {
    console.error('Failed to create submission:', err);
    return false;
  }
}

export async function listPendingSubmissions(): Promise<PendingSubmissionRecord[]> {
  try {
    const result = await gql(
      `query ListPendingSubmissions($filter: ModelPendingSubmissionFilterInput) {
        listPendingSubmissions(filter: $filter, limit: 100) {
          items {
            id name manufacturer image type sim phases submittedBy status createdAt
          }
        }
      }`,
      { filter: { status: { eq: 'pending' } } },
      true,
    );
    return result.data.listPendingSubmissions.items;
  } catch (err) {
    console.error('Failed to list submissions:', err);
    return [];
  }
}

export async function updatePendingSubmission(id: string, status: string): Promise<boolean> {
  try {
    await gql(
      `mutation UpdatePendingSubmission($input: UpdatePendingSubmissionInput!) {
        updatePendingSubmission(input: $input) { id }
      }`,
      { input: { id, status } },
      true,
    );
    return true;
  } catch (err) {
    console.error('Failed to update submission:', err);
    return false;
  }
}

export async function deletePendingSubmission(id: string): Promise<boolean> {
  try {
    await gql(
      `mutation DeletePendingSubmission($input: DeletePendingSubmissionInput!) {
        deletePendingSubmission(input: $input) { id }
      }`,
      { input: { id } },
      true,
    );
    return true;
  } catch (err) {
    console.error('Failed to delete submission:', err);
    return false;
  }
}
