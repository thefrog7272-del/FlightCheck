import { generateClient } from 'aws-amplify/data';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GqlResult = { data: Record<string, any> };

const client = generateClient();

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
  try {
    const result = await client.graphql({
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
    return (result as GqlResult).data.listSharedPlanes.items;
  } catch (err) {
    console.error('Failed to fetch shared planes:', err);
    return [];
  }
}

export async function getSharedChecklist(planeId: string): Promise<SharedChecklistRecord | null> {
  try {
    const result = await client.graphql({
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
    const result = await client.graphql({
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
    return (result as GqlResult).data.listSharedChecklists.items;
  } catch (err) {
    console.error('Failed to fetch shared checklists:', err);
    return [];
  }
}

// Admin-only mutations (requires Cognito auth)
export async function createSharedPlane(plane: Omit<SharedPlaneRecord, 'id'>): Promise<SharedPlaneRecord | null> {
  try {
    const result = await client.graphql({
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
    return (result as GqlResult).data.createSharedPlane;
  } catch (err) {
    console.error('Failed to create shared plane:', err);
    return null;
  }
}

export async function createSharedChecklist(checklist: Omit<SharedChecklistRecord, 'id'>): Promise<SharedChecklistRecord | null> {
  try {
    const result = await client.graphql({
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
    return (result as GqlResult).data.createSharedChecklist;
  } catch (err) {
    console.error('Failed to create shared checklist:', err);
    return null;
  }
}

export async function deleteSharedPlane(id: string): Promise<boolean> {
  try {
    await client.graphql({
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

export async function deleteSharedChecklist(id: string): Promise<boolean> {
  try {
    await client.graphql({
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
