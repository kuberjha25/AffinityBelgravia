/**
 * data.js — every piece of content the app renders.
 *
 * There is no backend: screens read from here and mutate the in-memory copies
 * through the AppState context (src/store.js), so the app is fully usable end
 * to end. All copy, names and figures are transcribed from the Figma file
 * "Affinity New" (page 02 Screens).
 */

export const images = {
  logo: require('../assets/images/logo-monogram.png'),
  logoHi: require('../assets/images/logo-monogram-hi.png'),
  heroLogin: require('../assets/images/hero-login.jpg'),
  heroProject: require('../assets/images/hero-project.jpg'),
  heroInventory: require('../assets/images/hero-inventory.jpg'),
  heroAbout: require('../assets/images/hero-about.jpg'),
  heroNews: require('../assets/images/hero-news.jpg'),
  coverProfile: require('../assets/images/cover-profile.jpg'),
  person1: require('../assets/images/person-1.jpg'),
  person2: require('../assets/images/person-2.jpg'),
  person3: require('../assets/images/person-3.jpg'),
  person4: require('../assets/images/person-4.jpg'),
  person5: require('../assets/images/person-5.jpg'),
  personAyesha: require('../assets/images/person-ayesha.jpg'),
  personYash: require('../assets/images/person-yash.jpg'),
  newsTower: require('../assets/images/news-tower.jpg'),
  newsBlueprint: require('../assets/images/news-blueprint.jpg'),
  newsMeeting: require('../assets/images/news-meeting.jpg'),
  newsPhone: require('../assets/images/news-phone.jpg'),
  newsLibrary: require('../assets/images/news-library.jpg'),
  newsModern: require('../assets/images/news-modern.jpg'),
  newsSkyline: require('../assets/images/news-skyline.jpg'),
  newsHandshake: require('../assets/images/news-handshake.jpg'),
  newsAnalytics: require('../assets/images/news-analytics.jpg'),
};

export const brand = {
  name: 'Affinity',
  subName: 'Belgravia',
  appName: 'Affinity Belgravia',
  tagline: ['Experience timeless elegance.', 'Live beyond ordinary.'],
  version: '1.0.4',
  aboutVersion: '2.4.1 (Build 108)',
  establishedLabel: 'ESTABLISHED 2012',
};

/* ------------------------------------------------------------------ auth */

export const auth = {
  dialCode: '+91',
  flag: '🇮🇳',
  demoMobile: '98765 43210',
  /** Any 6 digits are accepted; this is what the OTP screen pre-fills. */
  demoOtp: '482913',
  otpLength: 6,
};

export const roleOptions = [
  { id: 'partner', label: 'Partner', icon: 'briefcase' },
  { id: 'influencer', label: 'Influencer', icon: 'star' },
  { id: 'freelancer', label: 'Freelancer', icon: 'user' },
];

/**
 * Indian states / union territories with their main cities. Forms ask for the
 * State first and then offer only that state's cities.
 */
export const citiesByState = {
  'Andaman and Nicobar Islands': ['Port Blair'],
  'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Tirupati', 'Kurnool', 'Kakinada', 'Rajahmundry', 'Anantapur', 'Amaravati'],
  'Arunachal Pradesh': ['Itanagar', 'Naharlagun', 'Pasighat', 'Tawang'],
  Assam: ['Guwahati', 'Dibrugarh', 'Silchar', 'Jorhat', 'Nagaon', 'Tezpur', 'Tinsukia'],
  Bihar: ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Darbhanga', 'Purnia', 'Arrah'],
  Chandigarh: ['Chandigarh'],
  Chhattisgarh: ['Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Durg', 'Rajnandgaon'],
  'Dadra and Nagar Haveli and Daman and Diu': ['Daman', 'Diu', 'Silvassa'],
  Delhi: ['New Delhi', 'Delhi', 'Dwarka', 'Rohini', 'Saket', 'Karol Bagh'],
  Goa: ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda'],
  Gujarat: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar', 'Bhavnagar', 'Jamnagar', 'Junagadh', 'Anand'],
  Haryana: ['Gurugram', 'Faridabad', 'Panchkula', 'Ambala', 'Karnal', 'Panipat', 'Sonipat', 'Rohtak', 'Hisar', 'Yamunanagar', 'Kurukshetra'],
  'Himachal Pradesh': ['Shimla', 'Dharamshala', 'Solan', 'Mandi', 'Kullu', 'Manali', 'Baddi'],
  'Jammu and Kashmir': ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Katra'],
  Jharkhand: ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Hazaribagh', 'Deoghar'],
  Karnataka: ['Bengaluru', 'Mysuru', 'Mangaluru', 'Hubballi', 'Belagavi', 'Kalaburagi', 'Davanagere', 'Udupi'],
  Kerala: ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam', 'Kannur', 'Alappuzha'],
  Ladakh: ['Leh', 'Kargil'],
  Lakshadweep: ['Kavaratti'],
  'Madhya Pradesh': ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Rewa'],
  Maharashtra: ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Navi Mumbai', 'Nashik', 'Aurangabad', 'Solapur', 'Kolhapur', 'Amravati'],
  Manipur: ['Imphal', 'Thoubal', 'Churachandpur'],
  Meghalaya: ['Shillong', 'Tura', 'Jowai'],
  Mizoram: ['Aizawl', 'Lunglei', 'Champhai'],
  Nagaland: ['Kohima', 'Dimapur', 'Mokokchung'],
  Odisha: ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur', 'Puri'],
  Puducherry: ['Puducherry', 'Karaikal', 'Mahe', 'Yanam'],
  Punjab: ['Mohali', 'Zirakpur', 'Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Kharar', 'Pathankot', 'Hoshiarpur', 'Moga', 'Firozpur', 'Rajpura'],
  Rajasthan: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer', 'Bikaner', 'Alwar', 'Bhilwara'],
  Sikkim: ['Gangtok', 'Namchi', 'Gyalshing'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Vellore', 'Erode'],
  Telangana: ['Hyderabad', 'Secunderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam'],
  Tripura: ['Agartala', 'Udaipur', 'Dharmanagar'],
  'Uttar Pradesh': ['Lucknow', 'Noida', 'Greater Noida', 'Ghaziabad', 'Kanpur', 'Agra', 'Varanasi', 'Prayagraj', 'Meerut', 'Bareilly', 'Aligarh'],
  Uttarakhand: ['Dehradun', 'Haridwar', 'Rishikesh', 'Haldwani', 'Roorkee', 'Nainital'],
  'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Kharagpur'],
};

export const states = Object.keys(citiesByState);

export const employees = [
  'Aman Verma — Sales Manager',
  'Neha Sharma — Relationship Manager',
  'Rohit Khanna — Channel Head',
  'Simran Kaur — CRM Executive',
];

export const uploadDocuments = [
  { id: 'incorporation', title: 'Certificate of Incorporation', hint: 'incorporation_cert.pdf', uploaded: true },
  { id: 'partnership', title: 'Partnership Deed', hint: 'Only for Partnership Firms', uploaded: false },
  { id: 'llp', title: 'LLP Registration Certificate', hint: 'Only for LLP Entities', uploaded: false },
  { id: 'gst', title: 'GST Registration Certificate', hint: 'GSTIN copy (Required)', uploaded: false },
  { id: 'pan', title: 'PAN Card', hint: 'Company / Individual PAN (Required)', uploaded: false },
  { id: 'msme', title: 'MSME/Udyam Registration', hint: 'Optional, if registered', uploaded: false },
  { id: 'rera', title: 'RERA Certificate', hint: 'RERA Certificate copy', uploaded: false },
];

/* ------------------------------------------------------------------ user */

export const currentUser = {
  id: 'u-1',
  firstName: 'Alex',
  name: 'Yash Arora',
  role: 'Partner Associate',
  partnerId: 'CP-98765',
  phone: '+91 98765 43210',
  email: 'yash.arora@gmail.com',
  address: 'Sector 66, Mohali',
  dob: '12 Jan 1992',
  avatar: images.personYash,
  cover: images.coverProfile,
  stats: [
    { id: 'enquiries', value: 3, label: 'Enquiries', icon: 'home' },
    { id: 'visits', value: 2, label: 'Site Visits', icon: 'calendar' },
    { id: 'bookings', value: 1, label: 'Bookings', icon: 'briefcase' },
  ],
};

/* -------------------------------------------------------------- home */

export const homeBanners = [
  {
    id: 'b1',
    title: 'Exclusive Launch: Tower B',
    subtitle: 'Starting from ₹2.5 Cr',
    image: images.heroInventory,
  },
  {
    id: 'b2',
    title: 'Affinity Villa — Final Phase',
    subtitle: 'Limited 4 BHK residences',
    image: images.heroProject,
  },
  {
    id: 'b3',
    title: 'Belgravia Penthouse Collection',
    subtitle: 'Starting from ₹4.2 Cr',
    image: images.heroNews,
  },
];

export const homeGlance = [
  { id: 'g1', value: '12', label: 'Registrations', lines: ['Registrations'], route: 'Registrations' },
  { id: 'g2', value: '8', label: 'Leads In Progress', lines: ['Leads In', 'Progress'], route: 'Leads' },
  { id: 'g3', value: '7', label: 'Visits Scheduled', lines: ['Visits', 'Scheduled'], route: 'Visits' },
  { id: 'g4', value: '46', label: 'Units Available', lines: ['Units', 'Available'], route: 'Inventory' },
];

/** Quick access grid for the channel-partner home (screen `home-screen`). */
export const quickAccessPartner = [
  { id: 'qa1', label: 'Registrations', icon: 'clipboard-type', route: 'Registrations' },
  { id: 'qa2', label: 'Leads', icon: 'users', route: 'Leads' },
  { id: 'qa3', label: 'Project Visits', icon: 'calendar', route: 'Visits' },
  { id: 'qa4', label: 'Project', icon: 'layers', route: 'Projects' },
  { id: 'qa5', label: 'Inventory', icon: 'shopping-bag', route: 'Inventory' },
  { id: 'qa6', label: 'Documents', icon: 'file', route: 'Documents' },
  { id: 'qa7', label: 'MIS Report', icon: 'trending-up', route: 'MISReport' },
];

/** Quick access grid for the end-user home (screen `User-home-screen`). */
export const quickAccessUser = [
  { id: 'qu1', label: 'Leads', icon: 'users', route: 'Leads' },
  { id: 'qu2', label: 'Visits', icon: 'calendar', route: 'Visits' },
  { id: 'qu3', label: 'Project', icon: 'layers', route: 'Projects' },
  { id: 'qu4', label: 'Inventory', icon: 'shopping-bag', route: 'Inventory' },
  { id: 'qu5', label: 'Documents', icon: 'file', route: 'Documents' },
];

/* ----------------------------------------------------- registrations */

export const registrationFilters = ['All', 'Channel Partner', 'Broker', 'Influencer'];

export const registrations = [
  {
    id: 'r1',
    name: 'Ayesha Khan',
    type: 'Influencer',
    phone: '+91 98765 43210',
    email: 'ayesha.khan@email.com',
    date: '28 May 2024',
    status: 'Pending',
    avatar: images.personAyesha,
    personal: {
      Phone: '+91 98765 43210',
      Email: 'ayesha.khan@email.com',
      Address: '12, Marine Drive, Mumbai',
      State: 'Maharashtra',
      City: 'Mumbai',
      Pincode: '400001',
      'Date of Birth': '15 Mar 1990',
      Anniversary: '22 Dec 2015',
    },
    professional: {
      Company: 'Khan Properties',
      'RERA Number': 'RERA-MH-2024-001',
      'Registration Date': '28 May 2024',
      Status: 'Active',
    },
  },
  {
    id: 'r2',
    name: 'Rohit Mehra',
    type: 'Broker',
    phone: '+91 91234 56789',
    email: 'rohit.mehra@email.com',
    date: '25 May 2024',
    status: 'Pending',
    avatar: images.person2,
    personal: {
      Phone: '+91 91234 56789',
      Email: 'rohit.mehra@email.com',
      Address: '44, Sector 17, Chandigarh',
      State: 'Chandigarh',
      City: 'Chandigarh',
      Pincode: '160017',
      'Date of Birth': '02 Aug 1987',
      Anniversary: '11 Nov 2013',
    },
    professional: {
      Company: 'Mehra Realty',
      'RERA Number': 'RERA-CH-2024-114',
      'Registration Date': '25 May 2024',
      Status: 'Active',
    },
  },
  {
    id: 'r3',
    name: 'Pooja Sharma',
    type: 'Influencer',
    phone: '+91 99876 54321',
    email: 'pooja.sharma@email.com',
    date: '25 May 2024',
    status: 'Completed',
    avatar: images.person3,
    personal: {
      Phone: '+91 99876 54321',
      Email: 'pooja.sharma@email.com',
      Address: '9, Koregaon Park, Pune',
      State: 'Maharashtra',
      City: 'Pune',
      Pincode: '411001',
      'Date of Birth': '19 Jun 1993',
      Anniversary: '05 Feb 2019',
    },
    professional: {
      Company: 'Sharma Media House',
      'RERA Number': 'RERA-MH-2024-208',
      'Registration Date': '25 May 2024',
      Status: 'Active',
    },
  },
  {
    id: 'r4',
    name: 'Arjun Verma',
    type: 'Broker',
    phone: '+91 98123 45678',
    email: 'arjun.verma@email.com',
    date: '24 May 2024',
    status: 'Completed',
    avatar: images.person4,
    personal: {
      Phone: '+91 98123 45678',
      Email: 'arjun.verma@email.com',
      Address: '77, Golf Course Road, Gurugram',
      State: 'Haryana',
      City: 'Gurugram',
      Pincode: '122002',
      'Date of Birth': '30 Sep 1985',
      Anniversary: '14 Apr 2011',
    },
    professional: {
      Company: 'Verma Estates',
      'RERA Number': 'RERA-HR-2024-076',
      'Registration Date': '24 May 2024',
      Status: 'Active',
    },
  },
  {
    id: 'r5',
    name: 'Neha Iyer',
    type: 'Influencer',
    phone: '+91 95432 10987',
    email: 'neha.iyer@email.com',
    date: '22 May 2024',
    status: 'Pending',
    avatar: images.person5,
    personal: {
      Phone: '+91 95432 10987',
      Email: 'neha.iyer@email.com',
      Address: '3, Indiranagar, Bengaluru',
      State: 'Karnataka',
      City: 'Bengaluru',
      Pincode: '560038',
      'Date of Birth': '08 Jan 1992',
      Anniversary: '27 Jul 2018',
    },
    professional: {
      Company: 'Iyer Digital',
      'RERA Number': 'RERA-KA-2024-311',
      'Registration Date': '22 May 2024',
      Status: 'Active',
    },
  },
];

/* ------------------------------------------------------- site visits */

export const visitFilters = ['All', 'Upcoming', 'Completed', 'Cancelled'];

export const siteVisits = [
  {
    id: 'v1',
    name: 'Rahul Kapoor',
    project: 'AFFINITY TOWER B',
    bookedBy: 'Ayesha Khan',
    bookedByType: 'Influencer',
    date: '2 Jun 2024',
    time: '10:30 AM',
    status: 'Confirmed',
    phone: '+91 98765 43210',
    email: 'rahul.kapoor@email.com',
    leadType: 'HOT',
    visitStatus: 'In Progress',
    notes: 'Discussed project details and pricing. Client interested in 3 BHK units.',
    history: [
      { id: 'h1', date: '25 May 2024', time: '03:30 PM', duration: '45 mins', status: 'Attended', note: 'Met client at site office. Provided brochure and project walkthrough.' },
      { id: 'h2', date: '20 May 2024', time: '11:30 AM', duration: '30 mins', status: 'Attended', note: 'Initial call to confirm interest. Client preferred weekend face-to-face.' },
    ],
  },
  {
    id: 'v2',
    name: 'Priya Nair',
    project: 'AFFINITY VILLA',
    bookedBy: 'Rohit Mehra',
    bookedByType: 'Broker',
    date: '1 Jun 2024',
    time: '2:00 PM',
    status: 'Pending',
    phone: '+91 91234 56789',
    email: 'priya.nair@email.com',
    leadType: 'WARM',
    visitStatus: 'Upcoming',
    notes: 'Requested villa layouts and payment plan before the visit.',
    history: [
      { id: 'h1', date: '30 May 2024', time: '09:15 AM', duration: '20 mins', status: 'Attended', note: 'Shared villa brochure over WhatsApp.' },
    ],
  },
  {
    id: 'v3',
    name: 'Vikram Singh',
    project: 'AFFINITY TOWER A',
    bookedBy: 'Pooja Sharma',
    bookedByType: 'Influencer',
    date: '30 May 2024',
    time: '11:00 AM',
    status: 'Completed',
    phone: '+91 99876 54321',
    email: 'vikram.singh@email.com',
    leadType: 'HOT',
    visitStatus: 'Completed',
    notes: 'Shortlisted a 12th floor 3 BHK. Awaiting spouse approval.',
    history: [
      { id: 'h1', date: '30 May 2024', time: '11:00 AM', duration: '60 mins', status: 'Attended', note: 'Full site walkthrough including sample flat.' },
      { id: 'h2', date: '27 May 2024', time: '04:00 PM', duration: '25 mins', status: 'Attended', note: 'Follow-up call on pricing and floor rise.' },
    ],
  },
  {
    id: 'v4',
    name: 'Meera Joshi',
    project: 'AFFINITY PENTHOUSE',
    bookedBy: 'Arjun Verma',
    bookedByType: 'Broker',
    date: '29 May 2024',
    time: '3:30 PM',
    status: 'Cancelled',
    phone: '+91 98123 45678',
    email: 'meera.joshi@email.com',
    leadType: 'COLD',
    visitStatus: 'Cancelled',
    notes: 'Client postponed indefinitely due to travel.',
    history: [
      { id: 'h1', date: '28 May 2024', time: '02:00 PM', duration: '10 mins', status: 'Cancelled', note: 'Client called to cancel the scheduled visit.' },
    ],
  },
  {
    id: 'v5',
    name: 'Aditya Rao',
    project: 'AFFINITY TOWER B',
    bookedBy: 'Neha Iyer',
    bookedByType: 'Influencer',
    date: '28 May 2024',
    time: '9:00 AM',
    status: 'Confirmed',
    phone: '+91 95432 10987',
    email: 'aditya.rao@email.com',
    leadType: 'WARM',
    visitStatus: 'Upcoming',
    notes: 'Interested in park-facing units on higher floors.',
    history: [
      { id: 'h1', date: '26 May 2024', time: '10:45 AM', duration: '15 mins', status: 'Attended', note: 'Confirmed visit slot for Saturday morning.' },
    ],
  },
];

export const visitTimeSlots = [
  '9:00 AM - 11:00 AM',
  '11:00 AM - 1:00 PM',
  '1:00 PM - 3:00 PM',
  '3:00 PM - 5:00 PM',
  '5:00 PM - 7:00 PM',
];

/* ------------------------------------------------------------- leads */

export const leadFilters = [
  { id: 'All', label: 'All' },
  { id: 'In Progress', label: 'In Progress', count: 3 },
  { id: 'Converted', label: 'Converted', count: 2 },
  { id: 'Not Matured', label: 'Not Matured', count: 4 },
];

export const leadTypes = [
  { id: 'Hot', label: 'Hot', icon: 'flame' },
  { id: 'Warm', label: 'Warm', icon: 'sun' },
  { id: 'Cold', label: 'Cold', icon: 'snowflake' },
];

export const leadStatuses = ['In Progress', 'Converted', 'Not Interested', 'Not Matured'];

export const leadCategories = ['Residential', 'Commercial', 'Investment', 'Resale'];

export const leads = [
  {
    id: 'l1',
    name: 'Rajesh Kumar',
    phone: '+91 98765 43210',
    email: 'rajesh.kumar@email.com',
    project: 'Affinity Belgravia - 3 BHK',
    type: 'Hot',
    status: 'In Progress',
    source: 'Walk-in',
    activeOn: '28 Aug 2026',
    followUpDate: '15 Sep 2026',
    interest: {
      Project: 'Affinity Belgravia',
      Configuration: '3 BHK',
      'Budget Range': '₹1.5 - 2.0 Cr',
      'Preferred Floor': '10-15th',
      Possession: 'Immediate',
      Financing: 'Home Loan',
    },
    note: 'Client expressed key interest in pool-facing apartments on higher floors. Needs site visit coordination with spouse.',
    history: [
      { id: 'h1', date: '24 Jul 2025', time: '11:30 AM', title: 'Lead Created', detail: 'Leads created by Aman Verma', by: 'Aman Verma' },
      { id: 'h2', date: '24 Jul 2025', time: '15:15 PM', title: 'Follow Up Call', detail: 'Spoke with lead, shared brochure', by: 'Aman Verma' },
      { id: 'h3', date: '26 Jul 2025', time: '09:00 AM', title: 'Site Visit Scheduled', detail: 'Scheduled for 26 Jul 2025', by: 'Neha Sharma' },
      { id: 'h4', date: '26 Jul 2025', time: '12:30 PM', title: 'Site Visit Completed', detail: 'Visited site, shown model unit', by: 'Neha Sharma' },
      { id: 'h5', date: '28 Jul 2025', time: '16:00 PM', title: 'Follow Up', detail: 'Requested time to discuss', by: 'Neha Sharma' },
    ],
  },
  {
    id: 'l2',
    name: 'Priya Sharma',
    phone: '+91 87654 32109',
    email: 'priya.sharma@email.com',
    project: 'Affinity Belgravia - 3 BHK',
    type: 'Warm',
    status: 'In Progress',
    source: 'Referral',
    activeOn: '27 Aug 2026',
    followUpDate: '12 Sep 2026',
    interest: {
      Project: 'Affinity Belgravia',
      Configuration: '3 BHK',
      'Budget Range': '₹1.8 - 2.2 Cr',
      'Preferred Floor': '5-10th',
      Possession: 'Dec 2026',
      Financing: 'Home Loan',
    },
    note: 'Comparing with two other projects in the corridor. Price sensitive.',
    history: [
      { id: 'h1', date: '21 Jul 2025', time: '10:05 AM', title: 'Lead Created', detail: 'Leads created by Aman Verma', by: 'Aman Verma' },
      { id: 'h2', date: '23 Jul 2025', time: '14:40 PM', title: 'Follow Up Call', detail: 'Shared payment plan comparison', by: 'Neha Sharma' },
    ],
  },
  {
    id: 'l3',
    name: 'Amit Patel',
    phone: '+91 76543 21098',
    email: 'amit.patel@email.com',
    project: 'Affinity Belgravia - 3 BHK',
    type: 'Cold',
    status: 'Converted',
    source: 'Digital',
    activeOn: '25 Aug 2026',
    followUpDate: '—',
    interest: {
      Project: 'Affinity Belgravia',
      Configuration: '3 BHK',
      'Budget Range': '₹1.5 - 1.8 Cr',
      'Preferred Floor': '3-8th',
      Possession: 'Immediate',
      Financing: 'Self Funded',
    },
    note: 'Booking completed for unit B-1204. Registration paperwork in progress.',
    history: [
      { id: 'h1', date: '12 Jul 2025', time: '09:20 AM', title: 'Lead Created', detail: 'Leads created by Rohit Khanna', by: 'Rohit Khanna' },
      { id: 'h2', date: '18 Jul 2025', time: '13:00 PM', title: 'Site Visit Completed', detail: 'Visited site, shown model unit', by: 'Neha Sharma' },
      { id: 'h3', date: '25 Jul 2025', time: '17:10 PM', title: 'Booking Confirmed', detail: 'Token amount received', by: 'Rohit Khanna' },
    ],
  },
  {
    id: 'l4',
    name: 'Sneha Desai',
    phone: '+91 65432 10987',
    email: 'sneha.desai@email.com',
    project: 'Affinity Belgravia - 3 BHK',
    type: 'Warm',
    status: 'Not Interested',
    source: 'Walk-in',
    activeOn: '22 Aug 2026',
    followUpDate: '—',
    interest: {
      Project: 'Affinity Belgravia',
      Configuration: '3 BHK',
      'Budget Range': '₹1.2 - 1.5 Cr',
      'Preferred Floor': 'Any',
      Possession: 'Ready to move',
      Financing: 'Home Loan',
    },
    note: 'Budget mismatch. Asked to be contacted for the next phase launch.',
    history: [
      { id: 'h1', date: '08 Jul 2025', time: '11:00 AM', title: 'Lead Created', detail: 'Leads created by Simran Kaur', by: 'Simran Kaur' },
      { id: 'h2', date: '14 Jul 2025', time: '16:30 PM', title: 'Follow Up', detail: 'Budget did not match inventory', by: 'Simran Kaur' },
    ],
  },
  {
    id: 'l5',
    name: 'Vikram Singh',
    phone: '+91 54321 09876',
    email: 'vikram.singh@email.com',
    project: 'Affinity Belgravia - 3 BHK',
    type: 'Hot',
    status: 'In Progress',
    source: 'Referral',
    activeOn: '20 Aug 2026',
    followUpDate: '10 Sep 2026',
    interest: {
      Project: 'Affinity Belgravia',
      Configuration: '3 BHK',
      'Budget Range': '₹2.0 - 2.5 Cr',
      'Preferred Floor': '12-18th',
      Possession: 'Dec 2026',
      Financing: 'Home Loan',
    },
    note: 'Ready to book once the corner unit on the 14th floor is released.',
    history: [
      { id: 'h1', date: '19 Jul 2025', time: '10:00 AM', title: 'Lead Created', detail: 'Leads created by Aman Verma', by: 'Aman Verma' },
      { id: 'h2', date: '20 Jul 2025', time: '12:15 PM', title: 'Site Visit Scheduled', detail: 'Scheduled for 22 Jul 2025', by: 'Neha Sharma' },
    ],
  },
];

/* ---------------------------------------------------------- project */

export const project = {
  id: 'p1',
  name: 'AFFINITY BELGRAVIA',
  location: 'Zirakpur, Punjab',
  hero: images.heroProject,
  totalUnits: '320',
  available: '48',
  priceRange: '₹1.8 - 4.2 Cr',
  overview:
    'Affinity Belgravia is a premium residential development nestled in the heart of the city, offering an unparalleled blend of luxury and modern living. Spread across 4 towers with 32 floors each, the project features thoughtfully designed 2, 3 & 4 BHK apartments with world-class amenities. With RERA certification and expected possession by Dec 2026, this is an ideal opportunity for discerning homebuyers seeking an elevated lifestyle.',
  facts: {
    'RERA No': 'P51900028732',
    Developer: 'Affinity Group',
    'Project Type': 'Residential',
    Possession: 'Dec 2026',
    'Total Towers': '4 Towers',
    'Total Floors': '32 Floors',
  },
  configurations: [
    { id: 'c1', title: '2 BHK', area: '850-1050 sq.ft', price: 'From ₹1.8 Cr' },
    { id: 'c2', title: '3 BHK', area: '1200-1450 sq.ft', price: 'From ₹2.8 Cr' },
    { id: 'c3', title: '4 BHK', area: '1800-2100 sq.ft', price: 'From ₹3.8 Cr' },
  ],
  amenities: [
    { id: 'a1', label: 'Pool', icon: 'glass-water' },
    { id: 'a2', label: 'Gym', icon: 'dumbbell' },
    { id: 'a3', label: 'Club House', icon: 'home' },
    { id: 'a4', label: 'Garden', icon: 'leaf' },
    { id: 'a5', label: 'Parking', icon: 'car' },
    { id: 'a6', label: 'Security', icon: 'shield' },
    { id: 'a7', label: 'Playground', icon: 'gamepad' },
    { id: 'a8', label: 'Spa', icon: 'circle-x' },
  ],
};

/** Every project the partner can sell. Only Affinity Belgravia has full data so far. */
export const projects = [
  {
    id: project.id,
    name: project.name,
    location: project.location,
    image: project.hero,
    configurations: '2, 3 & 4 BHK',
    priceRange: project.priceRange,
    available: project.available,
    possession: project.facts.Possession,
  },
];

/** Options for the Interest Details captured on the New Lead form. */
export const leadInterestOptions = {
  Project: ['Affinity Belgravia'],
  Configuration: ['2 BHK', '3 BHK', '4 BHK'],
  'Budget Range': ['₹1.5 - 2.0 Cr', '₹2.0 - 2.5 Cr', '₹2.5 - 3.0 Cr', '₹3.0 - 4.0 Cr', 'Above ₹4.0 Cr'],
  'Preferred Floor': ['Ground - 5th', '5-10th', '10-15th', '15-20th', '20th & above', 'Any'],
  Possession: ['Immediate', 'Within 6 months', 'Within 1 year', 'Dec 2026'],
  Financing: ['Home Loan', 'Self Funded'],
};

/* -------------------------------------------------------- inventory */

export const inventoryHeader = {
  title: 'AFFINITY BELGRAVIA',
  subtitle: 'INVENTORY',
  meta: 'Tower A • 32 Floors • 320 Units',
  image: images.heroInventory,
};

export const inventoryTowers = ['All', 'TOWER 1', 'TOWER 2', 'TOWER 3'];

export const inventory = [
  {
    id: 'i1',
    title: '2 BHK',
    tower: 'TOWER 1',
    area: '850 sq.ft',
    status: 'Available',
    details: {
      Floor: '12th Floor',
      'Super Area': '850 sq.ft',
      'Carpet Area': '680 sq.ft',
      Balconies: '2 Balconies',
      Facing: 'East',
      'Parking Allocation': '1 Covered Basement Slot',
    },
  },
  {
    id: 'i2',
    title: '3 BHK',
    tower: 'TOWER 1',
    area: '1350 sq.ft',
    status: 'Booked',
    details: {
      Floor: '9th Floor',
      'Super Area': '1350 sq.ft',
      'Carpet Area': '1080 sq.ft',
      Balconies: '3 Balconies',
      Facing: 'North-East',
      'Parking Allocation': '2 Covered Basement Slots',
    },
  },
  {
    id: 'i3',
    title: '4 BHK',
    tower: 'TOWER 2',
    area: '1950 sq.ft',
    status: 'Available',
    details: {
      Floor: '21st Floor',
      'Super Area': '1950 sq.ft',
      'Carpet Area': '1560 sq.ft',
      Balconies: '4 Balconies',
      Facing: 'West',
      'Parking Allocation': '2 Covered Basement Slots',
    },
  },
  {
    id: 'i4',
    title: '5 BHK',
    tower: 'TOWER 3',
    area: '1400 sq.ft',
    status: 'Sold',
    details: {
      Floor: '30th Floor',
      'Super Area': '1400 sq.ft',
      'Carpet Area': '1120 sq.ft',
      Balconies: '2 Balconies',
      Facing: 'South',
      'Parking Allocation': '3 Covered Basement Slots',
    },
  },
];

/* -------------------------------------------------------- documents */

export const documentsHeader = {
  title: 'AFFINITY BELGRAVIA',
  subtitle: 'DOCUMENTS',
  meta: 'Tower A • 32 Floors • 320 Units',
  image: images.heroInventory,
};

export const documents = [
  { id: 'd1', title: 'Brochure', size: '2.5 MB', tag: 'Marketing' },
  { id: 'd2', title: 'Price List', size: '1.8 MB', tag: 'Pricing' },
  { id: 'd3', title: 'Payment Plan', size: '1.3 MB', tag: 'Legal' },
  { id: 'd4', title: 'Floor Plan', size: '2.6 MB', tag: 'Technical' },
  { id: 'd5', title: 'RERA Certificate', size: '1.1 MB', tag: 'Legal' },
  { id: 'd6', title: 'Layout Plan', size: '2.5 MB', tag: 'Marketing' },
  { id: 'd7', title: 'Cost Sheet', size: '1.8 MB', tag: 'Pricing' },
  { id: 'd8', title: 'Allotment Letter', size: '1.3 MB', tag: 'Legal' },
  { id: 'd9', title: 'Specification Sheet', size: '2.6 MB', tag: 'Technical' },
  { id: 'd10', title: 'Approval Copy', size: '1.1 MB', tag: 'Legal' },
];

/* ------------------------------------------------------ MIS report */

export const misPeriods = ['Daily', 'Weekly', 'Monthly', 'Custom'];

export const misReport = {
  date: '26 May 2024',
  updatedNote: 'Note: Data is updated as of 26 May 2024, 08:30 AM',
  tiles: [
    { id: 'm1', value: '56', label: 'Total Visits', delta: '↑ 12% vs yesterday' },
    { id: 'm2', value: '28', label: 'Attended Visits', delta: '↑ 15% vs yesterday' },
    { id: 'm3', value: '18', label: 'New Registrations', delta: '↑ 8% vs yesterday' },
    { id: 'm4', value: '12', label: 'Leads Converted', delta: '↑ 5% vs yesterday' },
  ],
  visitsSummary: {
    total: 56,
    label: 'Total Visits',
    segments: [
      { id: 's1', label: 'In Progress', value: 28, pct: 50, color: '#8a857c' },
      { id: 's2', label: 'Attended', value: 18, pct: 32, color: '#4a4741' },
      { id: 's3', label: 'Upcoming', value: 10, pct: 18, color: '#b19777' },
    ],
  },
  registrationsSummary: {
    total: 18,
    label: 'Total',
    segments: [
      { id: 's1', label: 'Influencer', value: 8, pct: 44, color: '#8a857c' },
      { id: 's2', label: 'Broker', value: 6, pct: 33, color: '#4a4741' },
      { id: 's3', label: 'Freelancer', value: 4, pct: 23, color: '#b19777' },
    ],
  },
  topProjects: [
    { id: 't1', name: 'AFFINITY BELGRAVIA', visits: 22 },
    { id: 't2', name: 'AFFINITY GREEN', visits: 14 },
    { id: 't3', name: 'AFFINITY VILLA', visits: 4 },
  ],
};

/* -------------------------------------------------------------- news */

export const newsFilters = ['All', 'Company', 'Industry', 'Updates', 'Tips', 'Market'];

export const news = [
  {
    id: 'n1',
    tag: 'Updates',
    date: 'Oct 15',
    fullDate: 'Oct 15, 2026',
    readTime: '3 min read',
    title: 'New Project Launch: Sunrise Residency Phase 2',
    author: 'Sales Operations',
    desk: 'National Launch Desk',
    thumb: images.newsTower,
    hero: images.heroNews,
    body: [
      'We are thrilled to announce the official launch of Sunrise Residency Phase 2. Following the unprecedented success of our initial phase, this expansion introduces premium high-rise residences designed to elevate urban luxury to new heights. Located strategically in Mumbai’s fastest-growing corridor, Phase 2 features state-of-the-art home automation, panoramic deck balconies, and a world-class clubhouse.',
      'For our valued channel partners, the priority booking window officially opens on October 20, 2026. Premium inventory, including park-facing 3 BHK and 4 BHK ultra-luxury suites, has been exclusively reserved for pre-registrations. Initial launch pricing starts at a highly competitive bracket, offering up to 8% early-bird appreciation advantages for early bookings finalized within the initial window.',
      'To streamline client onboardings, our CRM portal has been updated with the latest digital brochures, interactive 3D floor plans, and flexible payment schedule matrices. Partners can directly generate customized quotation sheets and block units via the ‘Deals’ tab starting this Friday.',
    ],
    related: ['n2', 'n4'],
  },
  {
    id: 'n2',
    tag: 'Industry',
    date: 'Oct 14',
    fullDate: 'Oct 14, 2026',
    readTime: '4 min read',
    title: 'Real Estate Market Trends Q3 2026',
    author: 'Research Team',
    desk: 'Market Intelligence',
    thumb: images.newsBlueprint,
    hero: images.newsAnalytics,
    body: [
      'Residential absorption in the top eight markets grew 9% quarter on quarter, with the premium segment above ₹1.5 Cr accounting for a record share of total sales. Tier-1 corridors with completed metro connectivity continued to outperform.',
      'Unsold inventory levels dropped to a 34-month low, tightening negotiating room for buyers in ready-to-move projects. Developers with RERA-compliant delivery records commanded a measurable pricing premium over the market average.',
      'Our outlook for Q4 remains constructive: festive-quarter demand, stable interest rates, and limited new launches in the luxury bracket should sustain price firmness through the end of the year.',
    ],
    related: ['n1', 'n4'],
  },
  {
    id: 'n3',
    tag: 'Company',
    date: 'Oct 12',
    fullDate: 'Oct 12, 2026',
    readTime: '2 min read',
    title: 'Company Town Hall Highlights',
    author: 'Internal Communications',
    desk: 'People & Culture',
    thumb: images.newsMeeting,
    hero: images.newsMeeting,
    body: [
      'The quarterly town hall covered performance against plan, the channel-partner roadmap for the coming year, and the rollout of the redesigned partner app.',
      'Leadership confirmed an expanded incentive structure for partners crossing four bookings in a quarter, effective from the next cycle.',
      'A recording and the full deck are available in the Documents section for partners who could not attend live.',
    ],
    related: ['n1', 'n2'],
  },
  {
    id: 'n4',
    tag: 'Tips',
    date: 'Oct 10',
    fullDate: 'Oct 10, 2026',
    readTime: '5 min read',
    title: 'Tips: 5 Ways to Convert More Leads',
    author: 'Sales Enablement',
    desk: 'Partner Success',
    thumb: images.newsPhone,
    hero: images.newsHandshake,
    body: [
      'One: respond inside the first ten minutes. Lead-to-contact time is still the single strongest predictor of conversion in our data, ahead of budget fit or source.',
      'Two: qualify on possession timeline before configuration. Buyers who are clear on when they need to move are three times more likely to close within the quarter.',
      'Three: always book the site visit on the first call. Four: send the payment plan and cost sheet together, never separately. Five: log every interaction in the app — partners who maintain complete lead histories convert at nearly double the rate of those who do not.',
    ],
    related: ['n2', 'n1'],
  },
  {
    id: 'n5',
    tag: 'Updates',
    date: 'Oct 08',
    fullDate: 'Oct 08, 2026',
    readTime: '3 min read',
    title: 'Policy Update: New RERA Guidelines',
    author: 'Legal & Compliance',
    desk: 'Regulatory Affairs',
    thumb: images.newsLibrary,
    hero: images.newsLibrary,
    body: [
      'The regulator has issued revised disclosure norms covering quarterly construction progress, escrow utilisation and revised completion timelines.',
      'All marketing collateral must now carry the project registration number and the regulator’s website address in a legible size. Updated templates are already live in the Documents section.',
      'Partners should replace any printed material issued before this month with the refreshed versions to stay compliant.',
    ],
    related: ['n2', 'n1'],
  },
  {
    id: 'n6',
    tag: 'Market',
    date: 'Oct 05',
    fullDate: 'Oct 05, 2026',
    readTime: '4 min read',
    title: 'Luxury Segment Growth',
    author: 'Research Team',
    desk: 'Market Intelligence',
    thumb: images.newsModern,
    hero: images.newsModern,
    body: [
      'Sales of homes priced above ₹4 Cr grew faster than any other bracket this year, driven by end-users upgrading rather than pure investors.',
      'Branded residences and projects with amenity-led differentiation captured a disproportionate share of that demand.',
      'For channel partners, the practical implication is straightforward: lead with lifestyle and delivery credibility rather than per-square-foot pricing in this segment.',
    ],
    related: ['n2', 'n4'],
  },
];

/* ----------------------------------------------------- notifications */

export const notifications = [
  {
    group: 'Today',
    items: [
      { id: 'nt1', title: 'Flexi Payment Plan', time: '10:30 AM', body: 'Pay 20% now and the rest as per your convenience. Limited time offer. Avail now!', unread: true },
      { id: 'nt2', title: 'Special Offer for You!', time: '9:15 AM', body: 'Zero floor rise charges on select units. Explore the offer now!', unread: true },
      { id: 'nt3', title: 'New Lead Assigned', time: '8:05 AM', body: 'A new lead has been assigned to you. Check details in Leads section.', unread: true },
    ],
  },
  {
    group: 'Yesterday',
    items: [
      { id: 'nt4', title: 'Quarterly MIS Report', time: '6:30 PM', body: 'Your MIS report for Q1 Apr - Jun 2025 is now available.', unread: false },
      { id: 'nt5', title: 'New Project Launch', time: '4:20 PM', body: 'Introducing Meraqui Downtown - Premium Residences in the Heart of the City.', unread: false },
    ],
  },
  {
    group: 'Earlier',
    items: [
      { id: 'nt6', title: 'News Update', time: '25 Jul, 11:45 AM', body: 'Construction update: Meraqui Greens - Tower B reaches 12th floor.', unread: false },
      { id: 'nt7', title: 'System Notification', time: '24 Jul, 7:30 PM', body: 'Scheduled maintenance will be performed on 27 Jul 2025 from 1:00 AM to 3:00 AM.', unread: false },
    ],
  },
];

export const notificationsFooter = 'Stay updated with the latest offers, news and important updates.';

/* --------------------------------------------------- terms & about */

export const terms = {
  intro: 'Please read these terms and conditions carefully before using the Meraqui app and services.',
  updated: 'Last Updated: 26 Jul 2025',
  sections: [
    { id: 't1', title: '1. Introduction', body: 'Welcome to Meraqui. By accessing or using our application, website, or services, you agree to be bound by these Terms & Conditions and all applicable laws and regulations. If you do not agree with any part of these terms, you must not use our services.' },
    { id: 't2', title: '2. Use of Our Services', body: 'You agree to use our Meraqui services only for lawful purposes and in a way that does not infringe the rights of, restrict, or inhibit anyone else’s use of the services. You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account.' },
    { id: 't3', title: '3. Property Information', body: 'All project details, pricing, layouts, images, and other information provided on the app are for general informational purposes only and are subject to change without prior notice. Meraqui does not warrant the accuracy, completeness, or reliability of any information provided.' },
    { id: 't4', title: '4. Bookings', body: 'Bookings made through the app are subject to availability and confirmation. We reserve the right to accept or reject any booking request at our sole discretion. A booking is confirmed only upon receipt of the required amount and issuance of a booking confirmation.' },
    { id: 't5', title: '5. Payments', body: 'All payments must be made through the modes available on the app or as communicated by our authorized representatives. Prices are indicative and subject to change. Taxes, charges, and other levies will be applicable as per government norms.' },
    { id: 't6', title: '6. Cancellations & Refunds', body: 'Cancellations are governed by the specific project policy as communicated at the time of booking. Refunds, if applicable, will be processed as per the cancellation policy and may take the stipulated time to reflect.' },
    { id: 't7', title: '7. Intellectual Property', body: 'All content, including text, images, logos, icons, and software, is the property of Gillco Group and Meraqui. Unauthorized reproduction, modification, distribution, or creation of derivative works of any content is strictly prohibited without prior written consent.' },
    { id: 't8', title: '8. Limitation of Liability', body: 'Meraqui shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use the services.' },
    { id: 't9', title: '9. Changes to Terms', body: 'We may update these Terms & Conditions from time to time. Any changes will be posted on this page with the updated date. Your continued use of the app after changes together your acceptance of the revised terms.' },
    { id: 't10', title: '10. Governing Law', body: 'These Terms & Conditions shall be governed by and construed in accordance with the laws of India, and any disputes shall be subject to the exclusive jurisdiction of the courts in Gurugram, Haryana.' },
  ],
  help: {
    title: 'Need Help?',
    body: 'Our team is here to help you.\nMon - Sat, 10:00 AM - 7:00 PM',
    cta: 'Contact Us',
  },
};

export const about = {
  title: 'About Us',
  subtitle: 'Luxury, trust, and architectural excellence.',
  hero: images.heroAbout,
  wordmark: 'AFFINITY BELGRAVIA',
  intro:
    'Affinity Belgravia is a premium residential development nestled in the heart of the city, bringing an unprecedented standard of sophisticated living. Designed for discerning individuals, we blend classic European layout values with cutting-edge smart home automation.',
  pillars: [
    { id: 'p1', icon: 'target', title: 'Our Mission', body: 'To curate modern luxury environments built upon unparalleled engineering, uncompromising transparency, and elite concierge service.' },
    { id: 'p2', icon: 'eye', title: 'Our Vision', body: 'To redefine the skyline of premium lifestyles, becoming the gold standard for luxury residential developments worldwide.' },
  ],
  highlights: [
    { id: 'h1', title: 'RERA Certified Development', body: 'Fully registered and compliant with all local regulatory standards ensuring complete investment protection.' },
    { id: 'h2', title: 'World-Class Amenity Suite', body: 'Access exclusive resident-only wellness lounges, private infinity pools, and a dedicated 24/7 digital concierge.' },
    { id: 'h3', title: 'Ultra-Prime Central Location', body: 'Perfectly positioned within easy reach of the financial district, major transit hubs, and elite shopping avenues.' },
  ],
  contact: {
    title: 'Contact Affinity Belgravia',
    phone: '+1800 309 4599',
    email: 'concierge@affinitybelgravia.com',
    address: 'Affinity Belgravia Premium Estates, Sector 7, Golf Course Road, Gurugram, India.',
    cta: 'Send Inquiry',
  },
  footer: 'Affinity Belgravia Real Estate App',
};

export const thankYou = {
  title: 'Thank You!',
  body: 'Your application has been submitted successfully.',
  note: 'Our team will review your details and get back to you within 24-48 hours.',
  cta: 'Go to Dashboard',
  secondary: 'Contact Support',
};

export const socialLinks = [
  { id: 'instagram', icon: 'instagram' },
  { id: 'youtube', icon: 'youtube' },
  { id: 'facebook', icon: 'facebook' },
];

export default {
  images,
  brand,
  auth,
  roleOptions,
  states,
  citiesByState,
  employees,
  uploadDocuments,
  currentUser,
  homeBanners,
  homeGlance,
  quickAccessPartner,
  quickAccessUser,
  registrationFilters,
  registrations,
  visitFilters,
  siteVisits,
  visitTimeSlots,
  leadFilters,
  leadTypes,
  leadStatuses,
  leadCategories,
  leads,
  project,
  projects,
  leadInterestOptions,
  inventoryHeader,
  inventoryTowers,
  inventory,
  documentsHeader,
  documents,
  misPeriods,
  misReport,
  newsFilters,
  news,
  notifications,
  notificationsFooter,
  terms,
  about,
  thankYou,
  socialLinks,
};
