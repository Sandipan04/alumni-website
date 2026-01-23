// js/admin.js
import { db, auth } from './config.js';
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc, orderBy, query } 
    from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } 
    from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// --- AUTH LISTENER ---
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

// --- LOGIN / LOGOUT ---
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
            <td><small>${s.supervisor || '-'}</small></td>
            <td class="text-end">
                <button class="btn btn-sm btn-outline-primary me-1 btn-edit"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-outline-danger btn-delete"><i class="fas fa-trash"></i></button>
            </td>
        `;

        // Bind events manually to avoid Global Scope issues
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

// --- EDIT PREP ---
function startEdit(id, data) {
    document.getElementById('editDocId').value = id;
    
    // Fill Fields
    document.getElementById('inBatch').value = data.batch || '';
    document.getElementById('inName').value = data.name || '';
    document.getElementById('inSupervisor').value = data.supervisor || '';
    document.getElementById('inPos').value = data.position || '';
    document.getElementById('inInst').value = data.institute || '';
    document.getElementById('inEmail').value = data.email || '';
    document.getElementById('inWeb').value = data.website || ''; // New Field
    document.getElementById('inPhoto').value = data.photo || '';
    document.getElementById('inInfo').value = data.additionalInfo || ''; // New Field

    // UI Updates
    document.getElementById('formTitle').innerText = "Edit Student";
    document.getElementById('btnSave').innerText = "Update";
    document.getElementById('btnSave').classList.replace('btn-success', 'btn-warning');
    document.getElementById('btnCancelEdit').style.display = 'inline-block';
    
    window.scrollTo(0,0);
}

// --- CANCEL ---
document.getElementById('btnCancelEdit').addEventListener('click', () => {
    document.getElementById('editDocId').value = '';
    document.querySelectorAll('input, textarea').forEach(i => i.value = '');
    
    document.getElementById('formTitle').innerText = "Add New Student";
    document.getElementById('btnSave').innerText = "Save Student";
    document.getElementById('btnSave').classList.replace('btn-warning', 'btn-success');
    document.getElementById('btnCancelEdit').style.display = 'none';
});

// --- SAVE / UPDATE ---
document.getElementById('btnSave').addEventListener('click', async () => {
    const id = document.getElementById('editDocId').value;
    
    // Gather Data
    const data = {
        batch: document.getElementById('inBatch').value,
        name: document.getElementById('inName').value,
        supervisor: document.getElementById('inSupervisor').value,
        position: document.getElementById('inPos').value,
        institute: document.getElementById('inInst').value,
        email: document.getElementById('inEmail').value,
        website: document.getElementById('inWeb').value,
        photo: document.getElementById('inPhoto').value,
        additionalInfo: document.getElementById('inInfo').value,
        lastUpdated: new Date()
    };

    if(!data.batch || !data.name) { alert("Batch and Name are required!"); return; }

    try {
        if (id) {
            await updateDoc(doc(db, "students", id), data);
        } else {
            await addDoc(collection(db, "students"), data);
        }
        // Reset form by clicking cancel
        document.getElementById('btnCancelEdit').click();
        loadTable();
        alert("Saved!");
    } catch (e) {
        console.error(e);
        alert("Error: " + e.message);
    }
});