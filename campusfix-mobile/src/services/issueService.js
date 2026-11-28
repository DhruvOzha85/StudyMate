import AsyncStorage from '@react-native-async-storage/async-storage';

// Switch between Render production and local dev server
export const API_ROOT = 'https://campusfix-p0fg.onrender.com/api';

const TOKEN_KEY = 'campusfix_token';
const USER_KEY = 'campusfix_user';
const DRAFTS_KEY = 'campusfix_drafts_v1';
const NOTIFS_KEY = 'campusfix_notifications_v1';

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

async function apiFetch(path, options = {}, timeoutMs = 25000) {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${API_ROOT}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || `Request failed (${res.status})`);
    }
    return data;
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Request timed out. Server may be waking up—please try again.');
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

// --- Authentication ---
export async function registerUser(name, email, password) {
  const data = await apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
  await AsyncStorage.setItem(TOKEN_KEY, data.token);
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));
  return data.user;
}

export async function loginUser(email, password) {
  const data = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  await AsyncStorage.setItem(TOKEN_KEY, data.token);
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));
  return data.user;
}

export async function getUser() {
  const raw = await AsyncStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : { name: 'Student', email: 'student@university.edu', role: 'Student' };
}

export async function updateUser(data) {
  const res = await apiFetch('/auth/me', {
    method: 'PUT',
    body: JSON.stringify({ name: data.name }),
  });
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(res.user));
  return res.user;
}

export async function logoutUser() {
  await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
}

// --- Issues (MongoDB via Express) ---
export async function getIssues() {
  const user = await getUser();
  const q = user?.id ? `?userId=${encodeURIComponent(user.id)}` : '';
  return apiFetch(`/issues${q}`);
}

export async function getIssueById(id) {
  const user = await getUser();
  const q = user?.id ? `?userId=${encodeURIComponent(user.id)}` : '';
  return apiFetch(`/issues/${encodeURIComponent(id)}${q}`);
}

export async function createIssue(payload) {
  return apiFetch('/issues', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function addComment(issueId, text) {
  return apiFetch(`/issues/${encodeURIComponent(issueId)}/comments`, {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
}

export async function toggleSupportIssue(issueId) {
  return apiFetch(`/issues/${encodeURIComponent(issueId)}/support`, {
    method: 'POST',
  });
}

// --- Notifications (MongoDB via Express) ---
export async function getNotifications() {
  try {
    return await apiFetch('/notifications');
  } catch {
    return [];
  }
}

export async function markNotificationRead(id) {
  return apiFetch(`/notifications/${encodeURIComponent(id)}/read`, {
    method: 'PATCH',
  });
}

export async function markAllNotificationsRead() {
  return apiFetch('/notifications/read-all', {
    method: 'PATCH',
  });
}

// --- Offline Drafts (Local AsyncStorage by design) ---
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
