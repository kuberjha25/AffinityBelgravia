/**
 * data.js — static app content only: branding, bundled images, labels for the
 * backend's enum values, and fixed copy (Terms, About).
 *
 * Every record the app shows (profile, leads, visits, registrations,
 * projects, inventory, documents, news, notifications) comes from the API
 * through the Redux store in src/store.
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
  otpLength: 6,
};

/* --------------------------------------------- backend enum value labels */

/** `partner_type` */
export const partnerTypes = [
  { id: 'channel_partner', label: 'Channel Partner', icon: 'briefcase' },
  { id: 'broker', label: 'Broker', icon: 'building' },
  { id: 'influencer', label: 'Influencer', icon: 'star' },
  { id: 'freelancer', label: 'Freelancer', icon: 'user' },
];

/** `business_type` (channel partners) */
export const businessTypes = [
  { value: 'proprietorship', label: 'Proprietorship' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'llp', label: 'LLP' },
  { value: 'company', label: 'Company' },
  { value: 'individual', label: 'Individual' },
];

/** `lead_type` */
export const leadTypes = [
  { id: 'hot', label: 'Hot', icon: 'flame' },
  { id: 'warm', label: 'Warm', icon: 'sun' },
  { id: 'cold', label: 'Cold', icon: 'snowflake' },
];

/** Lead `status` values the list can filter by. */
export const leadStatuses = [
  'new',
  'contacted',
  'follow_up',
  'visit_scheduled',
  'visit_completed',
  'negotiation',
  'booked',
  'closed',
  'expired',
];

/** Statuses PUT /leads/{id} accepts (`converted`/`booked` are set by the backend). */
export const leadUpdateStatuses = [
  'new',
  'contacted',
  'follow_up',
  'in_progress',
  'negotiation',
  'visit_scheduled',
  'visit_completed',
];

/** Visit `status` */
export const visitStatuses = ['scheduled', 'in_progress', 'completed', 'cancelled'];

/** `date_filter` for the leads / visits / registrations lists. */
export const dateFilters = [
  { id: '', label: 'Any time' },
  { id: 'today', label: 'Today' },
  { id: 'this_week', label: 'This week' },
  { id: 'this_month', label: 'This month' },
];

/** News `category` */
export const newsCategories = ['projects', 'construction_updates', 'offers', 'events'];

/* ---------------------------------------------------------- home tiles */

/** Quick access for Sales / Front Office staff (screen `home-screen`). */
export const quickAccessPartner = [
  { id: 'qa1', label: 'Registrations', icon: 'clipboard-type', route: 'Registrations' },
  { id: 'qa2', label: 'Leads', icon: 'users', route: 'Leads' },
  { id: 'qa3', label: 'Project Visits', icon: 'calendar', route: 'Visits' },
  { id: 'qa4', label: 'Project', icon: 'layers', route: 'Projects' },
  { id: 'qa5', label: 'Inventory', icon: 'shopping-bag', route: 'Inventory' },
  { id: 'qa6', label: 'Documents', icon: 'file', route: 'Documents' },
  { id: 'qa7', label: 'MIS Report', icon: 'trending-up', route: 'MISReport' },
  { id: 'qa8', label: 'Greetings', icon: 'gift', route: 'Greetings' },
];

/** Quick access for CP / Broker / Influencer / Freelancer (screen `User-home-screen`). */
export const quickAccessUser = [
  { id: 'qu1', label: 'Leads', icon: 'users', route: 'Leads' },
  { id: 'qu2', label: 'Visits', icon: 'calendar', route: 'Visits' },
  { id: 'qu3', label: 'Project', icon: 'layers', route: 'Projects' },
  { id: 'qu4', label: 'Inventory', icon: 'shopping-bag', route: 'Inventory' },
  { id: 'qu5', label: 'Documents', icon: 'file', route: 'Documents' },
];

/* ------------------------------------------------------ location lists */

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

/* ----------------------------------------------------------- greetings */

/** #5 Birthday / Anniversary greeting templates. `{name}` becomes the recipient's first name. */
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

/* --------------------------------------------------- terms & about copy */

export const notificationsFooter = 'Stay updated with the latest offers, news and important updates.';

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
