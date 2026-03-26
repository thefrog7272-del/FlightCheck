import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  SharedPlane: a.model({
    planeId: a.string().required(),
    name: a.string().required(),
    manufacturer: a.string().required(),
    image: a.string().required(),
    type: a.string().required(),
    sim: a.string(),
    sortOrder: a.integer(),
  }).authorization((allow) => [
    allow.guest().to(['read']),
    allow.group('admin'),
  ]),

  SharedChecklist: a.model({
    planeId: a.string().required(),
    phases: a.string().required(), // JSON-stringified ChecklistPhase[]
  }).authorization((allow) => [
    allow.guest().to(['read']),
    allow.group('admin'),
  ]),

  PendingSubmission: a.model({
    name: a.string().required(),
    manufacturer: a.string().required(),
    image: a.string(),
    type: a.string().required(),
    sim: a.string(),
    phases: a.string().required(), // JSON-stringified ChecklistPhase[]
    submittedBy: a.string(), // optional identifier
    status: a.string().required(), // 'pending' | 'approved' | 'rejected'
  }).authorization((allow) => [
    allow.guest().to(['create', 'read']), // Anyone can submit and read their own
    allow.group('admin'), // Admins can read all, update, delete
  ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'identityPool',
  },
});
