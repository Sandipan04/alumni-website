// js/admin.js
import { db, auth } from './config.js'; // REMOVED STORAGE
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc, orderBy, query } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// --- CONFIG FOR CLOUDINARY ---
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dqivrep05/image/upload";
const CLOUDINARY_PRESET = "alumni_upload";

// --- 0. POPULATE YEARS AUTOMATICALLY ---
const currentYear = new Date().getFullYear();
const startSelect = document.getElementById('inStart');
const endSelect = document.getElementById('inEnd');

for (let y = currentYear + 5; y >= 2007; y--) {
    let opt1 = new Option(y, y);
    let opt2 = new Option(y, y);
    startSelect.add(opt1);
    endSelect.add(opt2);
}

// --- AUTH ---
onAuthStateChanged(auth, (user) => {
    const loginSec = document.getElementById('login-section');
    const dashSec = document.getElementById('dashboard-section');
    const btnLogout = document.getElementById('btnLogout');

    if (user) {
        loginSec.style.display = 'none';
        dashSec.style.display = 'block';
        btnLogout.style.display = 'block';
        loadTable();
    } else {
        loginSec.style.display = 'block';
        dashSec.style.display = 'none';
        btnLogout.style.display = 'none';
    }
});

document.getElementById('btnLogin').addEventListener('click', () => {
    const e = document.getElementById('email').value;
    const p = document.getElementById('password').value;
    signInWithEmailAndPassword(auth, e, p).catch(err => alert("Login Failed: " + err.message));
});

document.getElementById('btnLogout').addEventListener('click', () => signOut(auth));

// --- LOAD TABLE ---
async function loadTable() {
    const tbody = document.getElementById('admin-table-body');
    tbody.innerHTML = '<tr><td colspan="4" class="text-center">Loading...</td></tr>';
    
    const q = query(collection(db, "students"), orderBy("batch", "desc"));
    const snapshot = await getDocs(q);
    
    tbody.innerHTML = '';
    snapshot.forEach(docSnap => {
        const s = docSnap.data();
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="fw-bold">${s.name}</td>
            <td><span class="badge bg-secondary">${s.batch}</span></td>
            <td><small>${s.institute || '-'}</small></td>
            <td class="text-end">
                <button class="btn btn-sm btn-outline-primary me-1 btn-edit"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-outline-danger btn-delete"><i class="fas fa-trash"></i></button>
            </td>
        `;
        row.querySelector('.btn-delete').addEventListener('click', () => deleteStudent(docSnap.id, s.name));
        row.querySelector('.btn-edit').addEventListener('click', () => startEdit(docSnap.id, s));
        tbody.appendChild(row);
    });
}

// --- DELETE ---
async function deleteStudent(id, name) {
    if(confirm(`Delete ${name}?`)) {
        await deleteDoc(doc(db, "students", id));
        loadTable();
    }
}

// --- EDIT FUNCTION ---
function startEdit(id, data) {
    document.getElementById('editDocId').value = id;
    
    // Parse Batch
    if (data.batch) {
        const match = data.batch.match(/^(.*)\s+(\d{4})(?:-(\d{2,4}))?$/);
        if (match) {
            document.getElementById('inProg').value = match[1];
            document.getElementById('inStart').value = match[2];
            if (match[3]) {
                const endY = match[3].length === 2 ? "20" + match[3] : match[3];
                document.getElementById('inEnd').value = endY;
            }
        }
    }

    // Fill Fields
    document.getElementById('inName').value = data.name || '';
    document.getElementById('inSupervisor').value = data.supervisor || '';
    document.getElementById('inInterests').value = data.researchInterests || '';
    document.getElementById('inPos').value = data.position || '';
    document.getElementById('inInst').value = data.institute || '';
    document.getElementById('inEmail').value = data.email || '';
    document.getElementById('inWeb').value = data.website || '';
    document.getElementById('inInfo').value = data.additionalInfo || '';
    
    // Photo Logic
    document.getElementById('inPhoto').value = data.photo || '';
    document.getElementById('uploadStatus').innerText = data.photo ? "Has existing photo" : "No file chosen";
    document.getElementById('inFile').value = ""; // Reset file picker

    // UI Updates
    document.getElementById('formTitle').innerText = "Edit Student";
    document.getElementById('btnSave').innerText = "Update";
    document.getElementById('btnSave').classList.replace('btn-primary-custom', 'btn-warning');
    document.getElementById('btnCancelEdit').style.display = 'inline-block';
    
    window.scrollTo(0,0);
}

// --- CANCEL ---
document.getElementById('btnCancelEdit').addEventListener('click', () => {
    document.getElementById('editDocId').value = '';
    
    // Clear Form
    document.querySelectorAll('input, textarea, select').forEach(i => i.value = '');
    
    document.getElementById('formTitle').innerText = "Add New Student";
    document.getElementById('btnSave').innerText = "Save Entry";
    document.getElementById('btnSave').classList.replace('btn-warning', 'btn-primary-custom');
    document.getElementById('btnCancelEdit').style.display = 'none';
});

// --- SAVE WITH CLOUDINARY UPLOAD ---
document.getElementById('btnSave').addEventListener('click', async () => {
    const btn = document.getElementById('btnSave');
    const status = document.getElementById('uploadStatus');
    const fileInput = document.getElementById('inFile');
    
    btn.disabled = true;
    btn.innerText = "Processing...";

    let photoURL = document.getElementById('inPhoto').value; // Default to existing

    // 1. Upload to Cloudinary if file selected
    if (fileInput.files.length > 0) {
        status.innerText = "Uploading to Cloudinary...";
        
        const file = fileInput.files[0];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_PRESET);

        try {
            const response = await fetch(CLOUDINARY_URL, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error("Upload failed");

            const result = await response.json();
            photoURL = result.secure_url; // Use the secure link Cloudinary gave us
            status.innerText = "Upload complete!";
            
        } catch (err) {
            console.error(err);
            alert("Image Upload Failed. Check Cloud Name/Preset.");
            btn.disabled = false;
            btn.innerText = "Save Entry";
            return;
        }
    }

    // 2. Prepare Data
    const prog = document.getElementById('inProg').value;
    const start = document.getElementById('inStart').value;
    const end = document.getElementById('inEnd').value;

    if (!prog || !start) { alert("Programme and Start Year required!"); btn.disabled = false; return; }

    let batchStr = `${prog} ${start}`;
    if (end) batchStr += `-${end.slice(-2)}`;

    const data = {
        batch: batchStr,
        name: document.getElementById('inName').value,
        supervisor: document.getElementById('inSupervisor').value,
        researchInterests: document.getElementById('inInterests').value,
        position: document.getElementById('inPos').value,
        institute: document.getElementById('inInst').value,
        email: document.getElementById('inEmail').value,
        website: document.getElementById('inWeb').value,
        photo: photoURL, // Save the Cloudinary Link
        additionalInfo: document.getElementById('inInfo').value,
        lastUpdated: new Date()
    };

    if(!data.name) { alert("Name required!"); btn.disabled = false; return; }

    // 3. Save to Firestore
    try {
        const id = document.getElementById('editDocId').value;
        if (id) {
            await updateDoc(doc(db, "students", id), data);
        } else {
            await addDoc(collection(db, "students"), data);
        }
        document.getElementById('btnCancelEdit').click();
        loadTable();
        alert("Saved Successfully!");
    } catch (e) {
        console.error(e);
        alert("Database Error: " + e.message);
    } finally {
        btn.disabled = false;
        btn.innerText = "Save Entry";
    }
});