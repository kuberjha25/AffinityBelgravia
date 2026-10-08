/**
 * config.js — master lists the client wants managed from the Admin Panel
 * (Customer Category, Preferred Configuration, Lead Source, Time Slot,
 * registration documents, greeting templates).
 *
 * There is no backend yet, so these are the defaults. Every screen reads them
 * from here, so swapping this file for an API response is the only change
 * needed once the Admin Panel exists.
 */

/** #11 Customer Category. */
export const customerCategories = ['Residential', 'Commercial', 'Investment', 'Resale'];

/** #12 Preferred Configuration. */
export const preferredConfigurations = ['2 BHK', '3 BHK', '4 BHK'];

/**
 * #13 Lead Source. `viaAssociate: true` marks the source used when a CP /
 * Freelancer / Influencer brings the customer; those leads capture only the
 * last 4 digits of the mobile and Aadhaar numbers (#4).
 */
export const leadSources = [
  { id: 'walk-in', label: 'Walk-in' },
  { id: 'referral', label: 'Referral' },
  { id: 'digital', label: 'Digital' },
  { id: 'social', label: 'Social Media' },
  { id: 'associate', label: 'CP / Freelancer / Influencer', viaAssociate: true },
];

export const ASSOCIATE_SOURCE = leadSources.find((s) => s.viaAssociate).label;

/** #14 Time Slot. */
export const timeSlots = [
  '9:00 AM - 11:00 AM',
  '11:00 AM - 1:00 PM',
  '1:00 PM - 3:00 PM',
  '3:00 PM - 5:00 PM',
  '5:00 PM - 7:00 PM',
];

/**
 * #7 CP registration documents. Admin decides which are shown (`visible`)
 * and which must be uploaded before the application can be submitted
 * (`mandatory`); the rest are optional.
 */
export const registrationDocuments = [
  { id: 'incorporation', title: 'Certificate of Incorporation', hint: 'Company incorporation certificate', visible: true, mandatory: false },
  { id: 'partnership', title: 'Partnership Deed', hint: 'Only for Partnership Firms', visible: true, mandatory: false },
  { id: 'llp', title: 'LLP Registration Certificate', hint: 'Only for LLP Entities', visible: true, mandatory: false },
  { id: 'gst', title: 'GST Registration Certificate', hint: 'GSTIN copy', visible: true, mandatory: true },
  { id: 'pan', title: 'PAN Card', hint: 'Company / Individual PAN', visible: true, mandatory: true },
  { id: 'msme', title: 'MSME/Udyam Registration', hint: 'Optional, if registered', visible: true, mandatory: false },
  { id: 'rera', title: 'RERA Certificate', hint: 'RERA Certificate copy', visible: true, mandatory: false },
];

/** #5 Birthday / Anniversary greeting templates. `{name}` is replaced with the recipient's first name. */
export const greetingTemplates = {
  Birthday: [
    'Dear {name}, wishing you a very Happy Birthday! May the year ahead bring you joy, success and good health. Warm regards, Team Affinity Belgravia',
    'Happy Birthday, {name}! Thank you for being a valued partner of Affinity Belgravia. Have a wonderful day!',
  ],
  Anniversary: [
    'Dear {name}, heartiest congratulations on your anniversary! Wishing you many more years of happiness together. Warm regards, Team Affinity Belgravia',
    'Happy Anniversary, {name}! Best wishes from all of us at Affinity Belgravia.',
  ],
};

export default {
  customerCategories,
  preferredConfigurations,
  leadSources,
  timeSlots,
  registrationDocuments,
  greetingTemplates,
};
