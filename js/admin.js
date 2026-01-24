import { db, auth } from './config.js';
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc, orderBy, query } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

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

// --- EDIT (PARSING LOGIC) ---
function startEdit(id, data) {
    document.getElementById('editDocId').value = id;
    
    // 1. Parse "Int. MSc. 2017-22" back into Dropdowns
    if (data.batch) {
        // Regex looks for: (Anything) space (4 digits) optional(-2to4 digits)
        const match = data.batch.match(/^(.*)\s+(\d{4})(?:-(\d{2,4}))?$/);
        
        if (match) {
            document.getElementById('inProg').value = match[1]; // e.g. "Int. MSc."
            document.getElementById('inStart').value = match[2]; // e.g. "2017"
            
            // Handle End Year
            if (match[3]) {
                // If it's short "22", convert to "2022" for the dropdown
                const endY = match[3].length === 2 ? "20" + match[3] : match[3];
                document.getElementById('inEnd').value = endY;
            } else {
                document.getElementById('inEnd').value = "";
            }
        } else {
            // Fallback for weird formats
            document.getElementById('inProg').value = ""; 
        }
    }

    // 2. Fill Rest
    document.getElementById('inName').value = data.name || '';
    document.getElementById('inSupervisor').value = data.supervisor || '';
    document.getElementById('inInterests').value = data.researchInterests || '';
    document.getElementById('inPos').value = data.position || '';
    document.getElementById('inInst').value = data.institute || '';
    document.getElementById('inEmail').value = data.email || '';
    document.getElementById('inWeb').value = data.website || '';
    document.getElementById('inPhoto').value = data.photo || '';
    document.getElementById('inInfo').value = data.additionalInfo || '';

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

// --- SAVE (COMBINING LOGIC) ---
document.getElementById('btnSave').addEventListener('click', async () => {
    const id = document.getElementById('editDocId').value;
    
    // 1. Combine Dropdowns into String
    const prog = document.getElementById('inProg').value;
    const start = document.getElementById('inStart').value;
    const end = document.getElementById('inEnd').value;

    if (!prog || !start) { alert("Programme and Start Year are required!"); return; }

    let batchStr = `${prog} ${start}`;
    if (end) {
        // Convert "2022" -> "22" for the short style
        batchStr += `-${end.slice(-2)}`;
    }

    const data = {
        batch: batchStr, // "Int. MSc. 2017-22"
        name: document.getElementById('inName').value,
        supervisor: document.getElementById('inSupervisor').value,
        researchInterests: document.getElementById('inInterests').value,
        position: document.getElementById('inPos').value,
        institute: document.getElementById('inInst').value,
        email: document.getElementById('inEmail').value,
        website: document.getElementById('inWeb').value,
        photo: document.getElementById('inPhoto').value,
        additionalInfo: document.getElementById('inInfo').value,
        lastUpdated: new Date()
    };

    if(!data.name) { alert("Name is required!"); return; }

    try {
        if (id) {
            await updateDoc(doc(db, "students", id), data);
        } else {
            await addDoc(collection(db, "students"), data);
        }
        document.getElementById('btnCancelEdit').click(); // Reset form
        loadTable();
        alert("Saved!");
    } catch (e) {
        console.error(e);
        alert("Error: " + e.message);
    }
});