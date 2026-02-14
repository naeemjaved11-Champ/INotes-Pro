let notes = JSON.parse(localStorage.getItem('inotes_v3')) || [];
let config = JSON.parse(localStorage.getItem('inotes_config')) || { darkTheme: true };
let currentNoteId = null;
let selectedNoteId = null;
let longPressTimer;

lucide.createIcons();

window.onload = () => {
    if(!config.darkTheme) { 
        document.body.classList.add('light-mode'); 
        updateThemeIcons(false); 
    }
    setTimeout(() => {
        const splash = document.getElementById('splashScreen');
        splash.style.opacity = '0';
        setTimeout(() => {
            splash.style.display = 'none';
            showScreen('homeScreen');
        }, 800);
    }, 2500);
};

function toggleTheme() {
    config.darkTheme = !config.darkTheme;
    document.body.classList.toggle('light-mode');
    updateThemeIcons(config.darkTheme);
    localStorage.setItem('inotes_config', JSON.stringify(config));
    updateSettingsUI();
}

function updateThemeIcons(isDark) {
    const icon = document.getElementById('themeIcon');
    icon.setAttribute('data-lucide', isDark ? 'moon' : 'sun');
    lucide.createIcons();
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const burger = document.getElementById('burgerBtn');
    sidebar.classList.toggle('active');
    burger.classList.toggle('active');
    document.getElementById('hamburgerIcon').setAttribute('data-lucide', sidebar.classList.contains('active') ? 'x' : 'menu');
    lucide.createIcons();
}

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => {
        s.classList.remove('active-screen');
    });
    
    const targetScreen = document.getElementById(id);
    targetScreen.classList.add('active-screen');

    // Editor screen ke liye quick smooth animation (fade + slide up)
    if (id === 'editorScreen') {
        targetScreen.style.opacity = '0';
        targetScreen.style.transform = 'translateY(30px)';
        // Chhota delay taaki transition trigger ho jaye
        setTimeout(() => {
            targetScreen.style.opacity = '1';
            targetScreen.style.transform = 'translateY(0)';
        }, 10);
    }

    if(id === 'homeScreen') { 
        document.body.classList.add('home-active'); 
        renderNotes(); 
    }
    else if(id === 'archiveScreen') { 
        document.body.classList.add('home-active'); 
        renderArchivedNotes(); 
    }
    else {
        document.body.classList.remove('home-active');
    }

    if(id === 'settingsScreen') updateSettingsUI();
    lucide.createIcons();
}

function renderNotes() {
    const list = document.getElementById('notesList');
    list.innerHTML = '';
    const nonArchived = notes.filter(n => !n.archived);
    const sorted = [...nonArchived].sort((a,b) => (b.pinned || 0) - (a.pinned || 0));
    sorted.forEach(n => {
        const card = document.createElement('div');
        card.className = 'note-card';
        card.innerHTML = `
            ${n.pinned ? '<i data-lucide="pin" style="position:absolute;top:15px;right:15px;width:14px;color:var(--accent)"></i>' : ''}
            <h3>${n.title}</h3>
            <div class="card-meta">
                <span>${n.date}</span>
                <span>${n.time}</span>
            </div>`;
        card.onclick = () => { currentNoteId = n.id; openNote(n); };
        card.onmousedown = (e) => { selectedNoteId = n.id; longPressTimer = setTimeout(() => showMenu(e), 600); };
        card.ontouchstart = (e) => { selectedNoteId = n.id; longPressTimer = setTimeout(() => showMenu(e), 600); };
        card.onmouseup = () => clearTimeout(longPressTimer);
        card.ontouchend = () => clearTimeout(longPressTimer);
        list.appendChild(card);
    });
    lucide.createIcons();
}

function renderArchivedNotes() {
    const list = document.getElementById('archiveList');
    list.innerHTML = '';
    const archived = notes.filter(n => n.archived);
    const sorted = [...archived].sort((a,b) => (b.pinned || 0) - (a.pinned || 0));
    sorted.forEach(n => {
        const card = document.createElement('div');
        card.className = 'note-card';
        card.innerHTML = `
            ${n.pinned ? '<i data-lucide="pin" style="position:absolute;top:15px;right:15px;width:14px;color:var(--accent)"></i>' : ''}
            <h3>${n.title}</h3>
            <div class="card-meta">
                <span>${n.date}</span>
                <span>${n.time}</span>
            </div>`;
        card.onclick = () => { currentNoteId = n.id; openNote(n); };
        card.onmousedown = (e) => { selectedNoteId = n.id; longPressTimer = setTimeout(() => showMenu(e), 600); };
        card.ontouchstart = (e) => { selectedNoteId = n.id; longPressTimer = setTimeout(() => showMenu(e), 600); };
        card.onmouseup = () => clearTimeout(longPressTimer);
        card.ontouchend = () => clearTimeout(longPressTimer);
        list.appendChild(card);
    });
    lucide.createIcons();
}

function showMenu(e) {
    const menu = document.getElementById('contextMenu');
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - 50;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - 20;
    menu.style.left = x + 'px'; menu.style.top = y + 'px'; menu.style.display = 'block';
}

function hideMenu() { 
    document.getElementById('contextMenu').style.display = 'none'; 
}

function deleteNote() { 
    notes = notes.filter(n => n.id !== selectedNoteId); 
    localStorage.setItem('inotes_v3', JSON.stringify(notes)); 
    deleteFromPhoneStorage(n.title);
    renderNotes(); 
    renderArchivedNotes(); 
    hideMenu(); 
}

function togglePinNote() { 
    const n = notes.find(x => x.id === selectedNoteId); 
    if(n) n.pinned = !n.pinned; 
    localStorage.setItem('inotes_v3', JSON.stringify(notes)); 
    renderNotes(); 
    renderArchivedNotes(); 
    hideMenu(); 
}

function toggleArchiveNote() { 
    const n = notes.find(x => x.id === selectedNoteId); 
    if(n) n.archived = !n.archived; 
    localStorage.setItem('inotes_v3', JSON.stringify(notes)); 
    renderNotes(); 
    renderArchivedNotes(); 
    hideMenu(); 
}

function createNewNote() {
    currentNoteId = Date.now();
    document.getElementById('titleInput').value = '';
    document.getElementById('contentInput').value = '';
    const now = new Date();
    document.getElementById('dateDisplay').innerText = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    showScreen('editorScreen');
}

function openNote(n) {
    document.getElementById('titleInput').value = n.title;
    document.getElementById('contentInput').value = n.content;
    document.getElementById('dateDisplay').innerText = n.date;
    showScreen('editorScreen');
}

function saveNote() {
    const title = document.getElementById('titleInput').value || 'Untitled Note';
    const content = document.getElementById('contentInput').value;
    const now = new Date();
    const idx = notes.findIndex(n => n.id === currentNoteId);
    const note = { 
        id: currentNoteId, 
        title, 
        content, 
        date: now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), 
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        pinned: idx > -1 ? notes[idx].pinned : false,
        archived: idx > -1 ? notes[idx].archived : false
    };
    if(idx > -1) notes[idx] = note; else notes.unshift(note);
    localStorage.setItem('inotes_v3', JSON.stringify(notes));
    syncWithPhoneStorage(title, content);
    showScreen('homeScreen');
}

function updateSettingsUI() {
    document.getElementById('setThemeToggle').classList.toggle('on', config.darkTheme);
}

function toggleFont() { 
    document.getElementById('fontWrap').classList.toggle('open'); 
}

function changeSize(v) { 
    document.getElementById('contentInput').style.fontSize = v + 'px'; 
    document.getElementById('fontSizeLabel').innerText = v; 
}
function showCloudComingSoon() {
    // Temporary toast notification
    const toast = document.createElement('div');
    toast.innerHTML = `
        <div style="
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            background: var(--glass); backdrop-filter: blur(20px);
            border: 1px solid var(--card-border); border-radius: 20px;
            padding: 25px 35px; max-width: 320px; text-align: center;
            color: var(--text); font-weight: 600; font-size: 16px; line-height: 1.5;
            box-shadow: 0 10px 30px rgba(0,0,0,0.4); z-index: 9999;
            opacity: 0; transition: opacity 0.5s ease, transform 0.5s ease;
        ">
            <div style="font-size: 32px; margin-bottom: 15px;">🚀</div>
            <p style="margin: 0 0 12px 0;">This feature is coming very soon!</p>
            <p style="margin: 0 0 18px 0; opacity: 0.9; font-size: 14px;">
                You can message the developer for updates<br>or wait a little longer.
            </p>
            <p style="margin: 0; font-size: 15px; color: var(--accent);">
                Thanks for the excitement! ❤️
            </p>
        </div>
    `;

    document.body.appendChild(toast);
    
    // Fade in
    setTimeout(() => {
        toast.querySelector('div').style.opacity = '1';
        toast.querySelector('div').style.transform = 'translate(-50%, -50%) scale(1)';
    }, 100);

    // Fade out after 5 seconds
    setTimeout(() => {
        toast.querySelector('div').style.opacity = '0';
        toast.querySelector('div').style.transform = 'translate(-50%, -50%) scale(0.95)';
        setTimeout(() => toast.remove(), 600);
    }, 5000);
}
/* --- CORDOVA FILE SYSTEM LOGIC --- */
let notesFolder = null;

// Cordova initialization
document.addEventListener("deviceready", () => {
    // Permission mangne aur folder setup karne ke liye
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, (fs) => {
        fs.root.getDirectory('INotes_Pro', { create: true }, (dirEntry) => {
            notesFolder = dirEntry;
            console.log("Storage Folder Ready!");
        }, (err) => console.log("Directory Error:", err));
    }, (err) => console.log("FS Error:", err));
}, false);

// File save karne ka function (Overwrite logic ke saath)
function syncWithPhoneStorage(fileName, content) {
    if (!window.cordova || !notesFolder) return;

    // File name ko safe banana (special chars hata kar)
    let safeName = fileName.replace(/[/\\?%*:|"<>]/g, '-') + ".txt";

    notesFolder.getFile(safeName, { create: true, exclusive: false }, (fileEntry) => {
        fileEntry.createWriter((fileWriter) => {
            fileWriter.onwriteend = () => console.log(safeName + " synced to storage.");
            fileWriter.onerror = (e) => console.log("Sync Failed: " + e.toString());

            let dataObj = new Blob([content], { type: 'text/plain' });
            fileWriter.write(dataObj);
        });
    }, (err) => console.log("File Entry Error:", err));
}

// Delete function (Storage se bhi file hatane ke liye)
function deleteFromPhoneStorage(fileName) {
    if (!window.cordova || !notesFolder) return;
    let safeName = fileName.replace(/[/\\?%*:|"<>]/g, '-') + ".txt";

    notesFolder.getFile(safeName, { create: false }, (fileEntry) => {
        fileEntry.remove(() => console.log("Deleted from storage."), 
        (err) => console.log("Delete error or file not found."));
    });
}

/* --- UPDATE YOUR EXISTING FUNCTIONS --- */

// 1. Apne purane saveNote() function ke andar 'showScreen' se theek pehle ye line add karein:
// syncWithPhoneStorage(title, content);

// 2. Apne deleteNote() function ke andar ye line add karein:
// syncWithPhoneStorage(title, content); // Jahan n deleted note hai
