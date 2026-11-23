// StudyMate API Service
// -------------------------------------------------------------
// Environments:
// 1. Production (Render): replace with your live Render backend URL after Step 3
export const RENDER_API_URL = 'https://studymate-server.onrender.com/api/tasks';

// 2. Local Wi-Fi (Physical Android device via Expo Go):
export const LOCAL_WIFI_API_URL = 'http://192.168.31.33:5000/api/tasks';

// 3. Android Emulator:
export const EMULATOR_API_URL = 'http://10.0.2.2:5000/api/tasks';

// ACTIVE API BASE URL:
// Toggle between RENDER_API_URL, LOCAL_WIFI_API_URL, or EMULATOR_API_URL
export const API_BASE_URL = LOCAL_WIFI_API_URL;

// 1. Fetch all tasks
export const getTasks = async () => {
  const response = await fetch(API_BASE_URL);
  if (!response.ok) {
    throw new Error(`Server returned error ${response.status}`);
  }
  return response.json();
};

// 2. Fetch single task by ID
export const getTaskById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/${id}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to fetch task (${response.status})`);
  }
  return response.json();
};

// 3. Create a new task
export const createTask = async (taskData) => {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taskData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to create task (${response.status})`);
  }
  return response.json();
};

// 4. Update task by ID (full update or status toggle)
export const updateTask = async (id, taskData) => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taskData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to update task (${response.status})`);
  }
  return response.json();
};

// 5. Delete task by ID
export const deleteTask = async (id) => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to delete task (${response.status})`);
  }
  return response.json();
};
