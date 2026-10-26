/**
 * permissions.js — role-based access (#17).
 *
 * The role comes from the signed-in user's `user_type`:
 *  - `frontend` (CP / Broker / Influencer / Freelancer): view-only access to
 *    their own leads, visits and project information (#2, #4). The backend
 *    already scopes leads and visits to the caller.
 *  - `backoffice` (Sales / Front Office staff, Admin): add and edit leads,
 *    schedule visits and mark them attended, register partners (#3).
 *
 * Screens never check a role name; they ask `can('lead.add')`.
 */

export const ROLES = {
  associate: { id: 'associate', label: 'CP / Broker / Influencer / Freelancer' },
  staff: { id: 'staff', label: 'Sales / Front Office Staff' },
};

export const ROLE_PERMISSIONS = {
  associate: ['lead.view.own', 'visit.view.own', 'project.view', 'inventory.view', 'document.view'],
  staff: [
    'lead.view.all',
    'lead.add',
    'lead.edit',
    'visit.view.all',
    'visit.add',
    'visit.updateStatus',
    'project.view',
    'inventory.view',
    'document.view',
    'document.share',
    'registration.view',
    'registration.add',
    'mis.view',
    'greeting.send',
  ],
};

export const roleForUser = (user) => (user?.user_type === 'backoffice' ? 'staff' : 'associate');

export const hasPermission = (role, permission) => (ROLE_PERMISSIONS[role] || []).includes(permission);
