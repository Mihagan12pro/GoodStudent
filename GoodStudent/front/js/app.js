class AttendanceApp {
    constructor() {
        this.currentPage = 'dashboard';
        this.currentGroup = null;
        this.currentUser = null;
        this.scheduleData = [];
        this.init();
    }
    async init() {
        await this.checkAuth();
        this.loadUserData();
        this.setupEventListeners();
        await this.loadInitialData();
        this.showPage('dashboard');
    }
    async checkAuth() {
        const token = localStorage.getItem('authToken');
        if (!token) {
            window.location.href = 'index.html';
            return;
        }
    }
    loadUserData() {
        const userData = localStorage.getItem('user');
        if (userData) {
            this.currentUser = JSON.parse(userData);
            this.updateUserInterface();
        }
    }
    updateUserInterface() {
        const userNameElement = document.getElementById('user-name');
        if (userNameElement && this.currentUser) {
            userNameElement.textContent = this.currentUser.name || 'Преподаватель';
        }
        const dateElement = document.getElementById('current-date');
        if (dateElement) {
            const now = new Date();
            dateElement.textContent = now.toLocaleDateString('ru-RU', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    }
    setupEventListeners() {
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
        const groupSelector = document.getElementById('group-selector');
        if (groupSelector) {
            groupSelector.addEventListener('change', (e) => this.onGroupChange(e.target.value));
        }
    }
    async loadInitialData() {
        try {
            await this.loadGroups();
            await this.loadSchedule();
        } catch (error) {
            console.error('Error loading initial data:', error);
            this.showError('Ошибка загрузки данных');
        }
    }
    async loadGroups() {
        try {
            const groups = await apiClient.getGroups();
            this.populateGroupSelector(groups);
        } catch (error) {
            console.error('Error loading groups:', error);
        }
    }
    populateGroupSelector(groups) {
        const selector = document.getElementById('group-selector');
        if (!selector) return;
        while (selector.children.length > 1) {
            selector.removeChild(selector.lastChild);
        }
        groups.forEach(group => {
            const option = document.createElement('option');
            option.value = group.id;
            option.textContent = group.number || group.name;
            selector.appendChild(option);
        });
    }
    async loadSchedule(date = null) {
        try {
            this.scheduleData = await apiClient.getSchedule(date);
            this.renderSchedule();
        } catch (error) {
            console.error('Error loading schedule:', error);
        }
    }
    renderSchedule() {
        const container = document.getElementById('schedule-container');
        if (!container) return;
        if (!this.scheduleData || this.scheduleData.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon"></div>
                    <h3>Нет пар на сегодня</h3>
                    <p>Расписание пусто или не загружено</p>
                </div>
            `;
            return;
        }
        container.innerHTML = this.scheduleData.map(classItem => `
            <div class="schedule-card" data-class-id="${classItem.id}">
                <div class="class-header">
                    <h3 class="class-title">${classItem.subject}</h3>
                    <span class="class-time">${classItem.time}</span>
                </div>                
                <div class="class-details">
                    <div class="class-group">Группа: ${classItem.group}</div>
                    <div class="class-location">Аудитория: ${classItem.room}</div>
                </div>
                <div class="attendance-actions">
                    <button class="action-btn manual-btn" onclick="app.openManualAttendance('${classItem.id}')">
                        <span class="action-icon"></span>
                        Ручной ввод
                    </button>
                    
                    <button class="action-btn qr-btn" onclick="app.openQRAttendance('${classItem.id}')">
                        <span class="action-icon"></span>
                        QR-код
                    </button>
                    
                    <button class="action-btn ai-btn" onclick="app.openAIAttendance('${classItem.id}')">
                        <span class="action-icon"></span>
                        AI-система
                    </button>
                </div>
            </div>
        `).join('');
    }
    showPage(pageName) {
        this.currentPage = pageName;
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });        
        const activeBtn = document.querySelector(`[onclick="app.showPage('${pageName}')"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
        this.loadPageContent(pageName);
    }
    async loadPageContent(pageName) {
        const mainContent = document.querySelector('.main-content');
        if (!mainContent) return;
        switch (pageName) {
            case 'dashboard':
                await this.loadSchedule();
                break;               
            case 'history':
                mainContent.innerHTML = await this.getHistoryPage();
                break;                
            case 'profile':
                mainContent.innerHTML = this.getProfilePage();
                break;                
            default:
                mainContent.innerHTML = '<h2>Страница в разработке</h2>';
        }
    }
    async getHistoryPage() {
        return `
            <div class="page-header">
                <h1>История посещаемости</h1>
                <div class="history-controls">
                    <input type="date" id="start-date">
                    <input type="date" id="end-date">
                    <button class="filter-btn">Применить</button>
                </div>
            </div>
            <div class="history-container">
                <p>История загружается...</p>
            </div>
        `;
    }
    getProfilePage() {
        return `
            <div class="page-header">
                <h1>Профиль преподавателя</h1>
            </div>
            <div class="profile-container">
                <div class="profile-card">
                    <div class="profile-avatar"></div>
                    <h2>${this.currentUser?.name || 'Преподаватель'}</h2>
                    <p>${this.currentUser?.email || 'Email не указан'}</p>
                    <div class="profile-stats">
                        <div class="stat">Группы: <strong>5</strong></div>
                        <div class="stat">Студенты: <strong>127</strong></div>
                    </div>
                </div>
            </div>
        `;
    }
    openManualAttendance(classId) {
        window.location.href = `manual-attendance.html?classId=${classId}`;
    }
    openQRAttendance(classId) {
        window.location.href = `qr-attendance.html?classId=${classId}`;
    }
    openAIAttendance(classId) {
        window.location.href = `ai-cameras.html?classId=${classId}`;
    }
    onGroupChange(groupId) {
        this.currentGroup = groupId;
        this.loadSchedule();
    }
    logout() {
        apiClient.logout();
        window.location.href = 'index.html';
    }
    showError(message) {
        alert(message);
    }
}
const app = new AttendanceApp();
window.app = app;

// // === Demo schedule + modal logic ===
// const API_BASE = "/api"; // <- при необходимости заменить на полный адрес

// const demoSchedule = [
//   {
//     day: "Понедельник",
//     date: "2025-11-24",
//     lessons: [
//       { id: "les-1", time: "09:00-10:30", room: "Ауд. 101", title: "Математика (Лекция)", teachers: "Иванов А." , group: "231-324"},
//       { id: "les-2", time: "11:00-12:30", room: "Ауд. 102", title: "Физика (Лаб.)", teachers: "Петров Б.", group: "231-324"}
//     ]
//   },
//   {
//     day: "Вторник",
//     date: "2025-11-25",
//     lessons: [
//       { id: "les-3", time: "10:00-11:30", room: "Ауд. 103", title: "Информатика", teachers: "Сидоров В.", group: "231-324" }
//     ]
//   }
// ];

// document.addEventListener("DOMContentLoaded", () => {
//     initGroups();
//     renderSchedule(demoSchedule);
//     setupBottomNav();
//     setupModalButtons();
// });

// // === Мои функции для demo Schedule и модалок ===
// async function initGroups(){
//     try {
//         const res = await fetch(`${API_BASE}/groups`);
//         if(res.ok){
//             const groups = await res.json();
//             groups.forEach(g=>{
//                 const opt = document.createElement("option");
//                 opt.value = g.name || g.id;
//                 opt.textContent = g.name || g.displayName || g.id;
//                 document.getElementById("group-select").appendChild(opt);
//             });
//         } else addDemoGroups();
//     } catch(e){ addDemoGroups(); }
// }
// function addDemoGroups(){
//     ["231-324","231-325","231-326"].forEach(g=>{
//         const opt = document.createElement("option");
//         opt.value = g; opt.textContent = g;
//         document.getElementById("group-select").appendChild(opt);
//     });
// }

// function renderSchedule(days){
//     const daysAccordion = document.getElementById("days-accordion");
//     daysAccordion.innerHTML = "";
//     days.forEach((day, idx)=>{
//         const dayEl = document.createElement("div");
//         dayEl.className = "day";

//         const header = document.createElement("div");
//         header.className = "day-header";
//         header.innerHTML = `<h4>${day.day} — ${day.date}</h4><div class="day-meta">${day.lessons.length} пар</div>`;
//         header.addEventListener("click", ()=> {
//             const body = dayEl.querySelector(".day-body");
//             body.style.display = body.style.display === "block" ? "none":"block";
//         });
//         dayEl.appendChild(header);

//         const body = document.createElement("div");
//         body.className = "day-body";
//         day.lessons.forEach(lesson=>{
//             const row = document.createElement("div");
//             row.className="lesson-row";
//             row.innerHTML = `
//                 <div class="lesson-info">
//                     <div class="lesson-time">${lesson.time}</div>
//                     <div>
//                         <div class="lesson-title">${lesson.title}</div>
//                         <div class="lesson-room">${lesson.room} • ${lesson.teachers}</div>
//                     </div>
//                 </div>
//                 <div class="lesson-actions">
//                     <button class="small-btn" data-action="manual" data-lesson='${JSON.stringify(lesson)}'>Ручная</button>
//                     <button class="small-btn" data-action="qr" data-lesson='${JSON.stringify(lesson)}'>QR</button>
//                     <button class="small-btn" data-action="ai" data-lesson='${JSON.stringify(lesson)}'>AI</button>
//                 </div>
//             `;
//             row.querySelectorAll("[data-action]").forEach(btn=>{
//                 btn.addEventListener("click", e=>{
//                     e.stopPropagation();
//                     openAction(JSON.parse(btn.getAttribute("data-lesson")), btn.getAttribute("data-action"));
//                 });
//             });
//             body.appendChild(row);
//         });
//         dayEl.appendChild(body);
//         daysAccordion.appendChild(dayEl);
//         if(idx===0) body.style.display="block";
//     });
// }

// function openAction(lesson, action){
//     document.getElementById("att-title").textContent = `Посещаемость — ${lesson.title}`;
//     document.getElementById("att-sub").textContent = `${lesson.time} • ${lesson.room}`;
//     if(action==="manual") openManualModal(lesson);
//     if(action==="qr") openQrModal(lesson);
//     if(action==="ai") openAiModal(lesson);
// }

// // === Модалки ===
// const modalManual = document.getElementById("manual-modal");
// const modalQR = document.getElementById("qr-modal");
// const modalAI = document.getElementById("ai-modal");
// const studentsListEl = document.getElementById("students-list");
// const saveAttBtn = document.getElementById("save-att");
// const qrContainer = document.getElementById("qr-container");

// async function openManualModal(lesson){
//     document.getElementById("modal-lesson-title").textContent = `Ручная отметка — ${lesson.title} (${lesson.room})`;
//     loadStudentsForGroup(lesson.group || document.getElementById("group-select").value);
//     modalManual.classList.remove("hidden");
// }

// async function loadStudentsForGroup(group){
//     studentsListEl.innerHTML = "Загрузка...";
//     try {
//         const res = await fetch(`${API_BASE}/groups/${encodeURIComponent(group)}/students`);
//         if(res.ok){
//             const students = await res.json();
//             renderStudentsList(students);
//             return;
//         }
//     } catch(e){}
//     const demo = Array.from({length:10}).map((_,i)=>({id:`s${i+1}`, name:`Студент ${i+1}`, email:`s${i+1}@edu.ru`}));
//     renderStudentsList(demo);
// }

// function renderStudentsList(students){
//     studentsListEl.innerHTML = "";
//     students.forEach(s=>{
//         const item = document.createElement("div");
//         item.className = "student-item";
//         item.innerHTML = `
//             <div class="student-meta">
//                 <div class="student-name">${s.name}</div>
//                 <div class="student-sub">${s.email || ""}</div>
//             </div>
//             <div>
//                 <input type="checkbox" data-student='${JSON.stringify(s)}' class="att-checkbox">
//             </div>
//         `;
//         studentsListEl.appendChild(item);
//     });
//     document.getElementById("select-all").onclick = ()=>{ document.querySelectorAll(".att-checkbox").forEach(cb=>cb.checked=true); }
//     document.getElementById("clear-all").onclick = ()=>{ document.querySelectorAll(".att-checkbox").forEach(cb=>cb.checked=false); }
// }

// saveAttBtn.addEventListener("click", async ()=>{
//     const checks = Array.from(document.querySelectorAll(".att-checkbox"));
//     const payload = checks.map(cb=>{
//         const s = JSON.parse(cb.getAttribute("data-student"));
//         return { studentData: s, present: !!cb.checked };
//     });
//     try {
//         const res = await fetch(`${API_BASE}/attendance`, {
//             method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({attendanceData: payload})
//         });
//         if(res.ok){ alert("Отметка сохранена"); modalManual.classList.add("hidden"); }
//         else { const j = await res.json(); alert("Ошибка: "+(j.error||res.status)); }
//     } catch(e){ alert("Ошибка отправки"); }
// });

// // QR modal
// let qrTimer = null;
// async function openQrModal(lesson){
//     modalQR.classList.remove("hidden");
//     qrContainer.innerHTML = "<div>Запрос токена...</div>";
//     try {
//         const res = await fetch(`${API_BASE}/lessons/${lesson.id}/qrcode`);
//         if(res.ok){
//             const data = await res.json();
//             buildQr(data.url);
//             const ttl = new Date(data.expiresAtUtc)-new Date();
//             if(qrTimer) clearTimeout(qrTimer);
//             qrTimer = setTimeout(()=>openQrModal(lesson), Math.max(1000, ttl+300));
//             return;
//         }
//     } catch(e){}
//     buildQr(`${location.origin}/mock?lesson=${lesson.id}&t=${Date.now()}`);
// }
// function buildQr(url){
//     qrContainer.innerHTML = "";
//     const wrap = document.createElement("div");
//     wrap.style.padding="10px";
//     const canvas = document.createElement("div");
//     wrap.appendChild(canvas);
//     const note = document.createElement("div");
//     note.textContent = "QR (сканируйте телефонной камерой)";
//     note.style.color = "var(--muted)";
//     note.style.marginTop = "8px";
//     wrap.appendChild(note);
//     qrContainer.appendChild(wrap);
//     new QRCode(canvas, { text: url, width:200, height:200 });
// }

// // AI modal
// function openAiModal(lesson){ modalAI.classList.remove("hidden"); }

// function setupBottomNav(){
//     document.querySelectorAll(".bottom-nav .nav-btn").forEach(btn=>{
//         btn.addEventListener("click", ()=>{
//             document.querySelectorAll(".bottom-nav .nav-btn").forEach(b=>b.classList.remove("active"));
//             btn.classList.add("active");
//             const view = btn.getAttribute("data-view");
//             if(view==="manual") window.scrollTo({top:0, behavior:"smooth"});
//             if(view==="qr") {}
//             if(view==="ai") {}
//             if(view==="history") { alert("История — в разработке"); }
//         });
//     });
// }

// function setupModalButtons(){
//     document.getElementById("manual-close").onclick = ()=> modalManual.classList.add("hidden");
//     document.getElementById("qr-close").onclick = ()=> { modalQR.classList.add("hidden"); if(qrTimer) clearTimeout(qrTimer); };
//     document.getElementById("ai-close").onclick = ()=> modalAI.classList.add("hidden");
// }
