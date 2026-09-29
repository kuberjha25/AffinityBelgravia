import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
import * as data from './data';

/**
 * In-memory app state. Stands in for the backend: new leads, visits and
 * profile edits are held here for the life of the session so every flow in
 * the app actually completes.
 */
const AppContext = createContext(null);

const clone = (v) => JSON.parse(JSON.stringify(v));

export function AppProvider({ children }) {
  const [leads, setLeads] = useState(data.leads);
  const [visits, setVisits] = useState(data.siteVisits);
  const [registrations, setRegistrations] = useState(data.registrations);
  const [notifications, setNotifications] = useState(data.notifications);
  const [profile, setProfile] = useState(data.currentUser);
  const [onboarding, setOnboarding] = useState({
    mobile: '',
    role: 'partner',
    basic: {},
    knowsEmployee: 'yes',
    employee: '',
    social: { facebook: 'https://facebook.com/alex_gillco', instagram: '', youtube: '' },
    company: '',
    documents: data.uploadDocuments,
  });

  const unreadCount = useMemo(
    () => notifications.reduce((n, g) => n + g.items.filter((i) => i.unread).length, 0),
    [notifications]
  );

  const addLead = useCallback((lead) => {
    const id = `l${Date.now()}`;
    const record = {
      id,
      name: lead.name || 'New Lead',
      phone: lead.phone || '',
      email: lead.email || '',
      project: `${data.project.name} - ${lead.configuration || '3 BHK'}`,
      type: lead.type || 'Warm',
      status: 'In Progress',
      source: lead.category || 'Walk-in',
      activeOn: lead.visitDate || 'Today',
      followUpDate: lead.visitDate || '—',
      interest: {
        Project: 'Affinity Belgravia',
        Configuration: lead.configuration || '3 BHK',
        'Budget Range': '₹1.5 - 2.0 Cr',
        'Preferred Floor': 'Any',
        Possession: 'Dec 2026',
        Financing: 'Home Loan',
      },
      note: lead.remarks || 'No remarks added yet.',
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
  }, [profile.name]);

  const updateLead = useCallback((id, patch) => {
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        const next = { ...l, ...patch };
        if (patch.note && patch.note !== l.note) {
          next.history = [
            ...l.history,
            {
              id: `h${l.history.length + 1}`,
              date: 'Today',
              time: 'Just now',
              title: 'Lead Updated',
              detail: patch.note,
              by: profile.name,
            },
          ];
        }
        return next;
      })
    );
  }, [profile.name]);

  const addVisit = useCallback((visit) => {
    const record = {
      id: `v${Date.now()}`,
      name: visit.name || 'New Visitor',
      project: data.project.name,
      bookedBy: profile.name,
      bookedByType: visit.role === 'client' ? 'Client' : 'Broker',
      date: visit.date || 'Today',
      time: visit.time || '10:00 AM',
      status: 'Pending',
      phone: visit.phone || '',
      email: visit.email || '',
      leadType: (visit.leadType || 'Warm').toUpperCase(),
      visitStatus: 'Upcoming',
      notes: visit.notes || 'No notes added yet.',
      history: [],
    };
    setVisits((prev) => [record, ...prev]);
    return record;
  }, [profile.name]);

  const updateVisit = useCallback((id, patch) => {
    setVisits((prev) => prev.map((v) => (v.id === id ? { ...v, ...patch } : v)));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((g) => ({ ...g, items: g.items.map((i) => ({ ...i, unread: false })) }))
    );
  }, []);

  const updateProfile = useCallback((patch) => {
    setProfile((prev) => ({ ...prev, ...patch }));
  }, []);

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
      setProfile((p) => ({
        ...p,
        ...(full ? { name: full, firstName: b.firstName } : null),
        ...(b.email ? { email: b.email } : null),
        ...(b.mobile || next.mobile ? { phone: `+91 ${b.mobile || next.mobile}`.trim() } : null),
        ...(b.address ? { address: b.address } : null),
        ...(b.dob ? { dob: b.dob } : null),
        ...(next.role
          ? { role: next.role.charAt(0).toUpperCase() + next.role.slice(1) }
          : null),
      }));
      return next;
    });
  }, []);

  const toggleDocument = useCallback((docId) => {
    setOnboarding((prev) => ({
      ...prev,
      documents: prev.documents.map((d) =>
        d.id === docId ? { ...d, uploaded: !d.uploaded } : d
      ),
    }));
  }, []);

  const value = useMemo(
    () => ({
      leads,
      visits,
      registrations,
      notifications,
      unreadCount,
      profile,
      onboarding,
      addLead,
      updateLead,
      addVisit,
      updateVisit,
      markAllNotificationsRead,
      updateProfile,
      patchOnboarding,
      completeOnboarding,
      toggleDocument,
      setRegistrations,
    }),
    [
      leads, visits, registrations, notifications, unreadCount, profile, onboarding,
      addLead, updateLead, addVisit, updateVisit, markAllNotificationsRead,
      updateProfile, patchOnboarding, completeOnboarding, toggleDocument,
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
