import { db } from './config.js';
import { collection, getDocs, orderBy, query } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

async function loadAlumni() {
    const container = document.getElementById('alumni-container');
    const sidebar = document.getElementById('sidebar-nav');
    
    try {
        const q = query(collection(db, "students"), orderBy("batch", "desc"));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            container.innerHTML = `<div class="text-center mt-5"><h3 class="text-muted">No records found.</h3></div>`;
            sidebar.innerHTML = '';
            return;
        }

        const grouped = {};
        snapshot.forEach(doc => {
            const s = doc.data();
            if (!grouped[s.batch]) grouped[s.batch] = [];
            grouped[s.batch].push(s);
        });

        renderPage(grouped);

    } catch (error) {
        console.error(error);
        container.innerHTML = `<div class="alert alert-danger m-5">Error loading data: ${error.message}</div>`;
    }
}

function renderPage(groupedData) {
    const container = document.getElementById('alumni-container');
    const sidebar = document.getElementById('sidebar-nav');
    
    container.innerHTML = "";
    sidebar.innerHTML = "";

    // Loop Batches
    for (const [batchName, students] of Object.entries(groupedData)) {
        
        const safeId = "batch-" + batchName.replace(/[^a-z0-9]/gi, '-').toLowerCase();

        // 1. Sidebar Link
        sidebar.innerHTML += `
            <a class="nav-link" href="#${safeId}">
                ${batchName}
            </a>
        `;

        // 2. Table Rows
        let rows = students.map(s => {
            // Avatar Logic
            const avatarHtml = s.photo 
                ? `<img src="${s.photo}" class="avatar" alt="${s.name}">` 
                : `<div class="avatar-placeholder">${s.name.charAt(0)}</div>`;

            // Contact Icons
            let contactHtml = '';
            if (s.email) contactHtml += `<a href="mailto:${s.email}" class="icon-btn" title="Email"><i class="fas fa-envelope"></i></a>`;
            if (s.website) contactHtml += `<a href="${s.website}" target="_blank" class="icon-btn" title="Website"><i class="fas fa-globe"></i></a>`;

            return `
            <tr>
                <td width="70">${avatarHtml}</td>
                <td>
                    <div class="primary-text">${s.name}</div>
                </td>
                <td>
                    <div class="primary-text">${s.supervisor || '<span class="text-muted">-</span>'}</div>
                </td>
                <td>
                    <div class="primary-text">${s.position || ''}</div>
                    <span class="sub-text">${s.institute || ''}</span>
                </td>
                <td>${contactHtml}</td>
                <td class="text-muted small">${s.additionalInfo || ''}</td>
            </tr>
            `;
        }).join('');

        // 3. Render Section
        container.innerHTML += `
            <div id="${safeId}" class="batch-section">
                <div class="batch-header">
                    <div class="batch-title">${batchName}</div>
                    <div class="batch-count">${students.length} Students</div>
                </div>
                
                <div class="modern-table-card">
                    <div class="table-responsive">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Photo</th>
                                    <th>Name</th>
                                    <th>NISER Supervisor</th>
                                    <th>Current Status</th>
                                    <th>Contact</th>
                                    <th>Notes</th>
                                </tr>
                            </thead>
                            <tbody>${rows}</tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }
}

loadAlumni();