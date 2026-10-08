import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
import * as data from './data';
import { ASSOCIATE_SOURCE } from './config';
import { hasPermission } from './permissions';

/**
 * In-memory app state. Stands in for the backend: new leads, visits and
 * profile edits are held here for the life of the session so every flow in
 * the app actually completes.
 */
const AppContext = createContext(null);

const clone = (v) => JSON.parse(JSON.stringify(v));

/** Fields a lead keeps from the New / Edit Lead form. */
function leadFields(form, associates) {
  const viaAssociate = form.source === ASSOCIATE_SOURCE;
  const associate = viaAssociate ? associates.find((a) => a.id === form.associateId) : null;
  return {
    name: form.name || 'New Lead',
    email: form.email || '',
    // #4: leads brought by a CP / Freelancer / Influencer never store the full number.
    phone: viaAssociate ? '' : form.phone || '',
    mobileLast4: viaAssociate ? form.mobileLast4 || '' : '',
    aadhaarLast4: viaAssociate ? form.aadhaarLast4 || '' : '',
    associateId: associate ? associate.id : null,
    associateName: associate ? associate.name : '',
    category: form.category || '',
    address: form.address || '',
    state: form.state || '',
    city: form.city || '',
    source: form.source || '',
    type: form.type || 'Warm',
    project: [form.interest?.Project || 'Affinity Belgravia', form.interest?.Configuration]
      .filter(Boolean)
      .join(' - '),
    // Only what was actually entered on the form.
    interest: { ...(form.interest || {}) },
    visitDate: form.visitDate || '',
    visitTime: form.visitTime || '',
    remarks: form.remarks || '',
  };
}

export function AppProvider({ children }) {
  const [leads, setLeads] = useState(data.leads);
  const [visits, setVisits] = useState(data.siteVisits);
  const [registrations, setRegistrations] = useState(data.registrations);
  const [notifications, setNotifications] = useState(data.notifications);
  const [associateProfile, setAssociateProfile] = useState(data.currentUser);
  const [staffProfile, setStaffProfile] = useState(data.staffUser);
  // No backend yet: the role is chosen with the "demo switch" on the Profile tab.
  const [role, setRole] = useState('associate');
  const [onboarding, setOnboarding] = useState({
    mobile: '',
    role: 'partner',
    basic: {},
    knowsEmployee: 'yes',
    employee: '',
    social: { facebook: '', instagram: '', youtube: '' },
    company: '',
    reraNumber: '',
    documents: data.uploadDocuments,
  });

  const isStaff = role === 'staff';
  const profile = isStaff ? staffProfile : associateProfile;
  const can = useCallback((permission) => hasPermission(role, permission), [role]);

  /** CP / Freelancer / Influencer directory (leads are sourced by and greetings sent to them). */
  const associates = useMemo(
    () => [
      {
        id: associateProfile.id,
        name: associateProfile.name,
        type: 'Partner',
        phone: associateProfile.phone,
        dob: associateProfile.dob,
        anniversary: associateProfile.anniversary || '',
      },
      ...registrations.map((r) => ({
        id: r.id,
        name: r.name,
        type: r.type,
        phone: r.phone,
        dob: r.personal?.['Date of Birth'] || '',
        anniversary: r.personal?.Anniversary || '',
      })),
    ],
    [associateProfile, registrations]
  );

  // #2/#4: an associate sees only the leads and visits brought in under their name.
  const visibleLeads = useMemo(
    () => (can('lead.view.all') ? leads : leads.filter((l) => l.associateId === associateProfile.id)),
    [can, leads, associateProfile.id]
  );
  const visibleVisits = useMemo(
    () => (can('visit.view.all') ? visits : visits.filter((v) => v.associateId === associateProfile.id)),
    [can, visits, associateProfile.id]
  );

  const unreadCount = useMemo(
    () => notifications.reduce((n, g) => n + g.items.filter((i) => i.unread).length, 0),
    [notifications]
  );

  const historyEntry = (title, detail, count) => ({
    id: `h${count + 1}-${Date.now()}`,
    date: 'Today',
    time: 'Just now',
    title,
    detail,
    by: profile.name,
  });

  const addLead = useCallback((form) => {
    const record = {
      id: `l${Date.now()}`,
      ...leadFields(form, associates),
      status: 'In Progress',
      assignedTo: profile.name,
      activeOn: form.visitDate || 'Today',
      followUpDate: form.visitDate || '—',
      note: form.remarks || 'No remarks added yet.',
      history: [
        {
          id: 'h1',
          date: 'Today',
          time: 'Just now',
          title: 'Lead Created',
          detail: `Lead created by ${profile.name}`,
          by: profile.name,
        },
      ],
    };
    setLeads((prev) => [record, ...prev]);
    return record;
  }, [associates, profile.name]);

  /** Staff edit of an existing lead from the Edit Lead form. */
  const editLead = useCallback((id, form) => {
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        const fields = leadFields(form, associates);
        return {
          ...l,
          ...fields,
          note: form.remarks || l.note,
          history: [...l.history, historyEntry('Lead Edited', 'Lead details updated', l.history.length)],
        };
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [associates, profile.name]);

  const updateLead = useCallback((id, patch) => {
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        const next = { ...l, ...patch };
        if (patch.note && patch.note !== l.note) {
          next.history = [...l.history, historyEntry('Lead Updated', patch.note, l.history.length)];
        }
        return next;
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.name]);

  const deleteLead = useCallback((id) => {
    setLeads((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const addVisit = useCallback((visit) => {
    const viaAssociate = visit.source === ASSOCIATE_SOURCE;
    const associate = viaAssociate ? associates.find((a) => a.id === visit.associateId) : null;
    const record = {
      id: `v${Date.now()}`,
      name: visit.name || 'New Visitor',
      project: visit.project || data.project.name,
      bookedBy: associate ? associate.name : profile.name,
      bookedByType: associate ? associate.type : 'Direct',
      associateId: associate ? associate.id : null,
      assignedTo: profile.name,
      date: visit.date || 'Today',
      time: visit.time || '10:00 AM',
      status: 'Pending',
      phone: viaAssociate ? '' : visit.phone || '',
      mobileLast4: viaAssociate ? visit.mobileLast4 || '' : '',
      aadhaarLast4: viaAssociate ? visit.aadhaarLast4 || '' : '',
      email: visit.email || '',
      leadType: (visit.leadType || 'Warm').toUpperCase(),
      visitStatus: 'Upcoming',
      notes: visit.notes || 'No notes added yet.',
      history: [],
    };
    setVisits((prev) => [record, ...prev]);
    return record;
  }, [associates, profile.name]);

  const updateVisit = useCallback((id, patch) => {
    setVisits((prev) => prev.map((v) => (v.id === id ? { ...v, ...patch } : v)));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((g) => ({ ...g, items: g.items.map((i) => ({ ...i, unread: false })) }))
    );
  }, []);

  const updateProfile = useCallback((patch) => {
    const set = role === 'staff' ? setStaffProfile : setAssociateProfile;
    set((prev) => ({ ...prev, ...patch }));
  }, [role]);

  const patchOnboarding = useCallback((patch) => {
    setOnboarding((prev) => ({ ...prev, ...patch }));
  }, []);

  /**
   * Called when the wizard is submitted: folds whatever the user typed during
   * onboarding into the signed-in profile, so the rest of the app greets them
   * by their own name rather than the seed data.
   */
  const completeOnboarding = useCallback((extra = {}) => {
    setOnboarding((prev) => {
      const next = { ...prev, ...extra };
      const b = next.basic || {};
      const full = [b.firstName, b.lastName].filter(Boolean).join(' ').trim();
      setAssociateProfile((p) => ({
        ...p,
        ...(full ? { name: full, firstName: b.firstName } : null),
        ...(b.email ? { email: b.email } : null),
        ...(b.mobile || next.mobile ? { phone: `+91 ${b.mobile || next.mobile}`.trim() } : null),
        ...(b.address ? { address: b.address } : null),
        ...(b.dob ? { dob: b.dob } : null),
        ...(b.anniversary ? { anniversary: b.anniversary } : null),
        ...(next.role
          ? { role: next.role.charAt(0).toUpperCase() + next.role.slice(1) }
          : null),
      }));
      return next;
    });
    setRole('associate');
  }, []);

  /** Marks a registration document as uploaded with the picked file's name (empty name = removed). */
  const setDocumentFile = useCallback((docId, fileName) => {
    setOnboarding((prev) => ({
      ...prev,
      documents: prev.documents.map((d) =>
        d.id === docId ? { ...d, uploaded: Boolean(fileName), fileName: fileName || '' } : d
      ),
    }));
  }, []);

  const value = useMemo(
    () => ({
      role,
      setRole,
      isStaff,
      can,
      leads: visibleLeads,
      allLeads: leads,
      visits: visibleVisits,
      registrations,
      associates,
      notifications,
      unreadCount,
      profile,
      onboarding,
      addLead,
      editLead,
      updateLead,
      deleteLead,
      addVisit,
      updateVisit,
      markAllNotificationsRead,
      updateProfile,
      patchOnboarding,
      completeOnboarding,
      setDocumentFile,
      setRegistrations,
    }),
    [
      role, isStaff, can, visibleLeads, leads, visibleVisits, registrations, associates,
      notifications, unreadCount, profile, onboarding, addLead, editLead, updateLead,
      deleteLead, addVisit, updateVisit, markAllNotificationsRead, updateProfile,
      patchOnboarding, completeOnboarding, setDocumentFile,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}

export { clone };
