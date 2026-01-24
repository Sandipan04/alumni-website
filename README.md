#  Alumni Archive Hub

A modern, serverless alumni directory designed to manage and display university alumni batches. It features a clean, professional "Card & Glass" UI for the public directory and a secure, feature-rich admin panel for data management.

## ✨ Features

### 🏛 Public Directory
* **Modern Aesthetic:** Clean "Card-Table" hybrid design using **Inter** typography and generous whitespace.
* **Glass Sidebar:** A sticky, floating sidebar with a glass-morphism effect for easy navigation between batches.
* **Mobile Optimized:** Fully responsive design with a slide-out hamburger menu on mobile devices.
* **Smart Display:** Automatically groups students by batch and displays research interests, supervisors, and live contact links.

### 🛡 Admin Panel
* **Secure Access:** Protected by **Firebase Authentication** (Email/Password).
* **CRUD Operations:** Add, Edit, and Delete student entries effortlessly.
* **Smart Data Entry:** Dropdowns for "Programme", "Start Year", and "End Year" are automatically parsed into standardized batch strings (e.g., *"Int. MSc. 2021-26"*).
* **Image Uploads:** Integrated **Cloudinary** support for drag-and-drop photo uploads (with a 1MB size limit to save bandwidth).

---

## 🛠 Tech Stack

* **Frontend:** HTML5, CSS3 (Custom + Bootstrap 5.3), JavaScript (ES6 Modules).
* **Backend:** Google Firebase (Firestore Database & Authentication).
* **Storage:** Cloudinary (Free Tier) for image hosting.
* **Hosting:** GitHub Pages (Zero-config deployment).

---

## 📂 Project Structure

```text
/
├── index.html          # Public Homepage (The Directory)
├── admin.html          # Protected Admin Dashboard
├── css/
│   └── style.css       # Unified styling for both pages
├── js/
│   ├── config.js       # Firebase & App Configuration
│   ├── home.js         # Logic for fetching & rendering the directory
│   └── admin.js        # Logic for CRUD, Auth, and Cloudinary Uploads
└── README.md           # Documentation
```

## 🚀 Setup Guide

To run this project, you need free accounts on Firebase (for the database) and Cloudinary (for images).

### Step 1: Firebase Setup (Database & Auth)

1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a project.
2. **Authentication**:
    * Go to **Build > Authentication -> Get Started**.
    * Enable **Email/Password**.
    * **Important**: Go to the "Users" tab and manually create your first Admin account.
3. **Firestore Database**:
    * Go to **Build > Firestore Database -> Create Database**.
    * Start in **Test Mode** (select a region near you).
    * Go to the **Rules** tab and paste this to secure your data:

        ```JavaScript
        rules_version = '2';
        service cloud.firestore {
        match /databases/{database}/documents {
            match /{document=**} {
            allow read: if true;                 // Public can view
            allow write: if request.auth != null; // Only Admin can edit
            }
        }
        }
        ```
4. **Get Config**:
    * Go to **Project Settings** (Gear icon) -> **General** -> **Your apps** (`</>`).
     * Copy the `firebaseConfig` object.

### Step 2: Cloudinary Setup (Images)

1. Sign up at Cloudinary.com.
2. Go to Settings (Gear icon) > Upload.
3. Under Upload presets, click Add upload preset.
    * **Signing Mode**: Select Unsigned (Crucial!).
    * **Name**: Give it a name (e.g., `alumni_upload`).
    * Click **Save**.
4. Note down your Cloud Name from the Dashboard.

### Step 3: Connect the Code

1. **Firebase**: Open `js/config.js` and paste your config object:

    ```JavaScript
    const firebaseConfig = {
        apiKey: "YOUR_API_KEY",
        authDomain: "...",
        projectId: "...",
        // ... rest of the keys
    };
    ```

2. **Cloudinary**: Open `js/admin.js` and update the top variables:

    ```JavaScript
    const CLOUDINARY_URL = "[https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload](https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload)";
    const CLOUDINARY_PRESET = "YOUR_UPLOAD_PRESET_NAME";
    ```

## 🖥️ Local Development

Because this project uses ES6 Modules (`type="module"`), you cannot simply double-click `index.html`. You must run a local server.

### VS Code:

1. Install the Live Server extension.
2. Right-click index.html -> Open with Live Server.

### Python:

1. Open terminal in the project folder.
2. Run: python3 -m http.server.
3. Go to http://localhost:8000.

## 🛡️ License
This project is open-source and available under the [MIT License](https://choosealicense.com/licenses/mit/).