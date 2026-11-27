import AsyncStorage from '@react-native-async-storage/async-storage';

const ISSUES_KEY = 'campusfix_issues_v1';
const DRAFTS_KEY = 'campusfix_drafts_v1';
const NOTIFS_KEY = 'campusfix_notifications_v1';
const USER_KEY = 'campusfix_user';

export const CATEGORIES = [
  { label: 'Electricity', icon: 'flash-outline' },
  { label: 'Plumbing', icon: 'water-outline' },
  { label: 'Classroom', icon: 'school-outline' },
  { label: 'Laboratory', icon: 'flask-outline' },
  { label: 'Furniture', icon: 'bed-outline' },
  { label: 'Cleanliness', icon: 'sparkles-outline' },
  { label: 'Internet / Wi-Fi', icon: 'wifi-outline' },
  { label: 'Infrastructure', icon: 'construct-outline' },
  { label: 'Hostel', icon: 'home-outline' },
  { label: 'Other', icon: 'ellipsis-horizontal-circle-outline' },
];

export const CAMPUS_LOCATIONS = [
  'Block A',
  'Block B',
  'Library',
  'Main Building',
  'Computer Laboratory',
  'Science Laboratory',
  'Cafeteria',
  'Hostel',
  'Sports Ground',
  'Parking Area',
];

export const TIMELINE_STEPS = ['Submitted', 'Acknowledged', 'Assigned', 'In Progress', 'Resolved'];

const SEED_ISSUES = [
  {
    id: 'CF-2026-1001',
    title: 'Projector flickering in Lecture Hall 204',
    category: 'Classroom',
    description: 'The ceiling-mounted HDMI projector keeps cutting out every 5 minutes during morning lectures.',
    location: 'Block A',
    priority: 'High',
    status: 'In Progress',
    date: '2026-11-24',
    reporter: 'Ananya Verma',
    anonymous: false,
    isMine: false,
    supporters: 14,
    supportedByMe: false,
    image: require('../assets/images/campus-hero.jpg'),
    images: [],
    staffNote: 'AV technician assigned. Replacement HDMI coupler ordered.',
    comments: [
      { id: 'c1', author: 'Rohan K.', text: 'Same issue happened in yesterday afternoon class.', date: '2026-11-25' },
    ],
  },
  {
    id: 'CF-2026-1002',
    title: 'Water cooler not cooling near reading room',
    category: 'Plumbing',
    description: 'The drinking water dispenser on the 2nd floor of the library is dispensing warm water.',
    location: 'Library',
    priority: 'Medium',
    status: 'Assigned',
    date: '2026-11-25',
    reporter: 'Campus Student',
    anonymous: false,
    isMine: true,
    supporters: 22,
    supportedByMe: true,
    image: require('../assets/images/campus-library.jpg'),
    images: [],
    staffNote: 'Plumbing & cooling unit inspection scheduled for today.',
    comments: [],
  },
  {
    id: 'CF-2026-1003',
    title: 'Broken pathway light near Main Walkway',
    category: 'Electricity',
    description: 'Two LED pole lights near the north walkway remain off after 6:30 PM.',
    location: 'Main Building',
    priority: 'High',
    status: 'Resolved',
    date: '2026-11-20',
    reporter: 'Campus Student',
    anonymous: false,
    isMine: true,
    supporters: 9,
    supportedByMe: false,
    image: require('../assets/images/campus-walkway.jpg'),
    images: [],
    staffNote: 'Replaced faulty relay switch and tested both poles.',
    comments: [],
  },
];

const SEED_NOTIFICATIONS = [
  {
    id: 'n1',
    title: 'Maintenance staff assigned',
    message: 'Report CF-2026-1002 (Water cooler) has been assigned to Facilities Team.',
    time: '2 hours ago',
    read: false,
    icon: 'construct-outline',
  },
  {
    id: 'n2',
    title: 'Issue resolved',
    message: 'Report CF-2026-1003 (Broken pathway light) has been marked Resolved.',
    time: 'Yesterday',
    read: true,
    icon: 'checkmark-circle-outline',
  },
];

export async function getIssues() {
  const raw = await AsyncStorage.getItem(ISSUES_KEY);
  if (!raw) {
    await AsyncStorage.setItem(ISSUES_KEY, JSON.stringify(SEED_ISSUES));
    return SEED_ISSUES;
  }
  return JSON.parse(raw);
}

export async function getIssueById(id) {
  const list = await getIssues();
  return list.find((item) => item.id === id) || null;
}

export async function createIssue(payload) {
  const list = await getIssues();
  const user = await getUser();
  const refId = `CF-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const newIssue = {
    id: refId,
    title: payload.title,
    category: payload.category,
    description: payload.description,
    location: payload.location,
    priority: payload.priority || 'Medium',
    status: 'Submitted',
    date: new Date().toISOString().split('T')[0],
    reporter: payload.anonymous ? 'Anonymous Student' : user?.name || 'Student',
    anonymous: Boolean(payload.anonymous),
    isMine: true,
    supporters: 1,
    supportedByMe: true,
    image: payload.images?.[0] || require('../assets/images/campus-hero.jpg'),
    images: payload.images || [],
    staffNote: 'Awaiting review by campus maintenance desk.',
    comments: [],
  };

  const updated = [newIssue, ...list];
  await AsyncStorage.setItem(ISSUES_KEY, JSON.stringify(updated));

  // Add notification
  const notifs = await getNotifications();
  const newNotif = {
    id: `n-${Date.now()}`,
    title: 'Your report has been submitted',
    message: `${refId}: "${newIssue.title}" is now queued for review.`,
    time: 'Just now',
    read: false,
    icon: 'paper-plane-outline',
  };
  await AsyncStorage.setItem(NOTIFS_KEY, JSON.stringify([newNotif, ...notifs]));

  return newIssue;
}

export async function addComment(issueId, text) {
  const list = await getIssues();
  const user = await getUser();
  const updated = list.map((item) => {
    if (item.id !== issueId) return item;
    const comment = {
      id: `c-${Date.now()}`,
      author: user?.name || 'Student',
      text: text.trim(),
      date: new Date().toISOString().split('T')[0],
    };
    return { ...item, comments: [...(item.comments || []), comment] };
  });
  await AsyncStorage.setItem(ISSUES_KEY, JSON.stringify(updated));
  return updated.find((i) => i.id === issueId);
}

export async function getNotifications() {
  const raw = await AsyncStorage.getItem(NOTIFS_KEY);
  if (!raw) {
    await AsyncStorage.setItem(NOTIFS_KEY, JSON.stringify(SEED_NOTIFICATIONS));
    return SEED_NOTIFICATIONS;
  }
  return JSON.parse(raw);
}

export async function markNotificationRead(id) {
  const list = await getNotifications();
  const updated = list.map((n) => (n.id === id ? { ...n, read: true } : n));
  await AsyncStorage.setItem(NOTIFS_KEY, JSON.stringify(updated));
  return updated;
}

export async function markAllNotificationsRead() {
  const list = await getNotifications();
  const updated = list.map((n) => ({ ...n, read: true }));
  await AsyncStorage.setItem(NOTIFS_KEY, JSON.stringify(updated));
  return updated;
}

export async function getUser() {
  const raw = await AsyncStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : { name: 'Student', email: 'student@university.edu', role: 'Student' };
}

export async function updateUser(data) {
  const current = await getUser();
  const merged = { ...current, ...data };
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(merged));
  return merged;
}

export async function logoutUser() {
  await AsyncStorage.removeItem(USER_KEY);
}

// Feature 1: Community Support ("Issue Affects Me Too") with duplicate prevention
export async function toggleSupportIssue(issueId) {
  const list = await getIssues();
  const updated = list.map((item) => {
    if (item.id !== issueId) return item;
    const already = Boolean(item.supportedByMe);
    return {
      ...item,
      supportedByMe: !already,
      supporters: Math.max(0, (item.supporters || 0) + (already ? -1 : 1)),
    };
  });
  await AsyncStorage.setItem(ISSUES_KEY, JSON.stringify(updated));
  return updated.find((i) => i.id === issueId);
}

// Feature 3: Offline Report Drafts
export async function getDrafts() {
  const raw = await AsyncStorage.getItem(DRAFTS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function saveDraft(draft) {
  const drafts = await getDrafts();
  const now = new Date().toISOString().split('T')[0];
  if (draft.id) {
    const updated = drafts.map((d) => (d.id === draft.id ? { ...d, ...draft, updatedAt: now } : d));
    await AsyncStorage.setItem(DRAFTS_KEY, JSON.stringify(updated));
    return updated.find((d) => d.id === draft.id);
  }
  const newDraft = { ...draft, id: `DRAFT-${Date.now()}`, updatedAt: now };
  await AsyncStorage.setItem(DRAFTS_KEY, JSON.stringify([newDraft, ...drafts]));
  return newDraft;
}

export async function deleteDraft(draftId) {
  const drafts = await getDrafts();
  const updated = drafts.filter((d) => d.id !== draftId);
  await AsyncStorage.setItem(DRAFTS_KEY, JSON.stringify(updated));
  return updated;
}
