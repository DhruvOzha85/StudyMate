# StudyMate – Student Assignment & Task Management Application

StudyMate is a clean, minimal, and beginner-friendly mobile application built for college students to track academic assignments, study tasks, subjects, deadlines, and priorities.

Developed as a College Diwali Assignment.

---

## 1. Features
- **Dashboard Overview:** Live counts for Total, Pending, Completed, and High-Priority tasks, plus upcoming deadlines.
- **My Tasks Filter:** View tasks categorized by `All`, `Pending`, and `Completed` with instant status toggling directly from list items.
- **Dual-Mode Task Form:** Unified form to create new assignments or update existing ones with date and field validation.
- **Task Details & Management:** Full view of task notes, due dates, inline completion toggle, and delete with confirmation dialog.
- **Real Cloud Persistence:** Powered by an Express.js REST API and persistent MongoDB Atlas cloud database (zero mock data).

---

## 2. Tech Stack

### Frontend
- **React Native** & **Expo SDK 58**
- **Expo Go Client** (compatible with 58.0.5)
- **React Native 0.88.1** & **React 19.3.0**
- **React Navigation Native Stack (v7)**
- **JavaScript only** (No TypeScript, No Redux, No Zustand)
- Native **Fetch API** & **StyleSheet**

### Backend
- **Node.js** (v22+ / v24)
- **Express.js** (v4.21)
- **MongoDB Atlas** with **Mongoose** (v8.9)
- **CORS** and **dotenv** middleware

### Production & Build
- **Render:** Cloud hosting for the Express backend.
- **EAS Build:** Cloud-based standalone Android APK generation (`preview` / `production` profile).
- **GitHub:** Source code management.

---

## 3. Project Structure

```text
StudyMate/
├── README.md
├── .gitignore
│
├── studymate-server/               # Express & MongoDB Backend
│   ├── .env.example                # Template for environment variables
│   ├── package.json
│   ├── server.js                   # Server entry, DB connection & 0.0.0.0 binding
│   ├── models/
│   │   └── Task.js                 # Task schema & Mongoose model
│   └── routes/
│       └── taskRoutes.js           # 5 REST CRUD endpoints
│
└── studymate-mobile/               # Expo SDK 58 Mobile Frontend
    ├── App.js                      # Root navigator (Native Stack)
    ├── app.json                    # Expo config & EAS project linking
    ├── eas.json                    # EAS build configuration (APK output)
    ├── package.json
    └── src/
        ├── api/
        │   └── taskApi.js          # Centralized API URLs & fetch helpers
        ├── screens/
        │   ├── DashboardScreen.js  # Live statistics & recent tasks
        │   ├── MyTasksScreen.js    # Filterable task list (All/Pending/Completed)
        │   ├── TaskFormScreen.js   # Dual Add/Edit form
        │   └── TaskDetailsScreen.js# Task details, status toggle & delete
        └── styles/
            └── theme.js            # Standard colors and spacing tokens
```

---

## 4. Local Setup Instructions

### Prerequisites
- Node.js (v22.13 or later)
- Git
- Expo Go app on your Android device (or Android Emulator)

### Step 1: Clone and Run the Backend
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd studymate-server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your `.env` file from `.env.example`:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_atlas_connection_string
   ```
4. Start the server:
   ```bash
   npm start
   ```
   *The server starts on `http://localhost:5000` and binds to `0.0.0.0`.*

### Step 2: Run the Mobile Frontend
1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd studymate-mobile
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure your API IP in `src/api/taskApi.js`:
   - For physical device on same Wi-Fi: use your computer's LAN IP (e.g. `http://192.168.x.x:5000/api/tasks`).
   - For Android Emulator: use `http://10.0.2.2:5000/api/tasks`.
4. Start Expo:
   ```bash
   npx expo start
   ```
5. Press `a` for Android Emulator, or scan the QR code with **Expo Go** on your Android phone.

---

## 5. Render Backend Deployment

1. Push this repository to your GitHub account.
2. In the [Render Dashboard](https://dashboard.render.com/):
   - Click **New** ➔ **Web Service**.
   - Connect your GitHub repository.
   - Configure:
     - **Name:** `studymate-server`
     - **Root Directory:** `studymate-server`
     - **Runtime:** `Node`
     - **Build Command:** `npm install`
     - **Start Command:** `node server.js`
   - In **Environment Variables**, add:
     - `PORT`: `5000`
     - `MONGODB_URI`: `<Your MongoDB Atlas Connection String>`
3. Click **Deploy Web Service**.
4. Test the health endpoint: `https://<your-service-name>.onrender.com/` (returns `{ "message": "StudyMate API is running." }`).
5. In `studymate-mobile/src/api/taskApi.js`, set `API_BASE_URL` to your live Render endpoint:
   ```javascript
   export const API_BASE_URL = 'https://<your-service-name>.onrender.com/api/tasks';
   ```

---

## 6. Standalone Android APK Generation (EAS Build)

The project includes `studymate-mobile/eas.json` configured for direct `.apk` output:

```json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

To trigger the cloud build:
```bash
cd studymate-mobile
eas build -p android --profile preview
```

Once the cloud build finishes, EAS provides a direct link to download and install the standalone `.apk` on any Android device without needing Expo Go.

---

## 7. REST API Endpoints

Base: `/api/tasks`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Server health check |
| `GET` | `/api/tasks` | Fetch all tasks |
| `POST` | `/api/tasks` | Create a new task |
| `GET` | `/api/tasks/:id` | Get task by ID |
| `PUT` | `/api/tasks/:id` | Update task or toggle status |
| `DELETE` | `/api/tasks/:id` | Delete task by ID |

---

## 8. License
Academic project for Diwali assignment evaluation.

