/**
 * permissions.js — role-based access (#17).
 *
 * The client's Admin Panel will assign roles and their permissions; until it
 * exists, these are the defaults from the 6 Oct 2026 review:
 *  - CP / Freelancer / Influencer: view-only access to their own leads,
 *    project visits and project information (#2, #4).
 *  - Sales / Front Office staff: add, edit and delete leads and project
 *    visits on a CP's behalf, and update visit status (#3).
 *
 * Screens never check a role name; they ask `can('lead.add')`, so moving
 * to server-defined permissions only means replacing ROLE_PERMISSIONS.
 */

export const ROLES = {
  associate: { id: 'associate', label: 'CP / Freelancer / Influencer' },
  staff: { id: 'staff', label: 'Sales / Front Office Staff' },
};

export const ROLE_PERMISSIONS = {
  associate: [
    'lead.view.own',
    'visit.view.own',
    'project.view',
    'inventory.view',
    'document.view',
  ],
  staff: [
    'lead.view.all',
    'lead.add',
    'lead.edit',
    'lead.delete',
    'visit.view.all',
    'visit.add',
    'visit.updateStatus',
    'project.view',
    'inventory.view',
    'document.view',
    'document.share',
    'registration.view',
    'mis.view',
    'greeting.send',
  ],
};

export const hasPermission = (role, permission) =>
  (ROLE_PERMISSIONS[role] || []).includes(permission);
