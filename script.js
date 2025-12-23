// --- Auth System (SQLite Backend) ---
const API_BASE_URL = 'http://localhost:3000';
let currentUser = sessionStorage.getItem('currentUser');

window.showAuth = function(viewId) {
    document.querySelectorAll('.auth-box').forEach(el => el.classList.add('hidden'));
    const target = document.getElementById(`auth-${viewId}`);
    if(target) {
        target.classList.remove('hidden');
    }
};

function initAuth() {
    if (currentUser) {
        document.getElementById('auth-overlay').classList.add('hidden');
        document.getElementById('app-container').classList.remove('hidden');
    } else {
        document.getElementById('auth-overlay').classList.remove('hidden');
        document.getElementById('app-container').classList.add('hidden');
        showAuth('login');
    }
}

// Login
const formLogin = document.getElementById('form-login');
if(formLogin) {
    formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            
            if (res.ok) {
                sessionStorage.setItem('currentUser', email);
                window.location.href = '/';
            } else {
                alert(data.error || "Login failed");
            }
        } catch (error) {
            console.error("Login error:", error);
            alert("Server connection error.");
        }
    });
}

// Register
const formRegister = document.getElementById('form-register');
if(formRegister) {
    formRegister.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;
        const confirm = document.getElementById('reg-confirm').value;

        if (!email.endsWith('@brillio.com')) {
            alert("Only @brillio.com email addresses are allowed.");
            return;
        }

        if (password !== confirm) {
            alert("Passwords do not match.");
            return;
        }
        
        if (password.length < 6) {
            alert("Password must be at least 6 characters.");
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();

            if (res.ok) {
                alert("Registration Successful! Please login.");
                showAuth('login');
            } else {
                alert(data.error || "Registration failed");
            }
        } catch (error) {
            console.error("Register error:", error);
            alert("Server connection error.");
        }
    });
}

// Email Validation on Blur
const regEmailInput = document.getElementById('reg-email');
if(regEmailInput) {
    regEmailInput.addEventListener('blur', async function() {
        const email = this.value;
        const errorDiv = document.getElementById('reg-email-error');
        
        if (!email) {
             errorDiv.classList.add('hidden');
             return;
        }

        if (!email.endsWith('@brillio.com')) {
            errorDiv.textContent = "Only @brillio.com email addresses are allowed.";
            errorDiv.classList.remove('hidden');
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/check`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            
            if (data.exists) {
                errorDiv.textContent = "This email is already registered. Please login.";
                errorDiv.classList.remove('hidden');
            } else {
                errorDiv.classList.add('hidden');
            }
        } catch (e) {
            console.error("Validation error", e);
        }
    });
    
    // Hide error on focus
    regEmailInput.addEventListener('focus', function() {
        document.getElementById('reg-email-error').classList.add('hidden');
    });
}

// Forgot
const formForgot = document.getElementById('form-forgot');
if(formForgot) {
    formForgot.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('forgot-email').value;
        
        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/check`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            
            if (data.exists) {
                alert(`Password reset link sent to ${email} (Simulated).`);
                showAuth('login');
            } else {
                alert("Email not found.");
            }
        } catch (e) {
            alert("Server error");
        }
    });
}

// --- App Logic ---

// Initial Data (Empty - fetched from API)
let teams = [];

let reasonMappings = [];

// API Interaction
async function fetchTeams() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/teams`);
        if (!response.ok) throw new Error('Failed to fetch');
        teams = await response.json();
        renderLeaderboard();
    } catch (error) {
        console.error("Error fetching teams:", error);
    }
}

async function fetchReasons() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/reasons`);
        if (!response.ok) throw new Error('Failed to fetch reasons');
        reasonMappings = await response.json();
        populateReasonDropdown();
    } catch (error) {
        console.error("Error fetching reasons:", error);
    }
}

function populateReasonDropdown() {
    const reasonSelect = document.getElementById('points-reason');
    if (!reasonSelect) return;

    // Clear existing options except the placeholder
    while (reasonSelect.options.length > 1) {
        reasonSelect.remove(1);
    }

    reasonMappings.forEach(mapping => {
        const option = document.createElement('option');
        option.value = mapping.reason; // Use reason string as value for compatibility
        option.textContent = mapping.reason;
        option.title = mapping.description; // Show description on hover
        option.dataset.points = mapping.points; // Store points in data attribute
        reasonSelect.appendChild(option);
    });

    // Add event listener for change
    reasonSelect.addEventListener('change', function() {
        const selectedOption = this.options[this.selectedIndex];
        const points = selectedOption.dataset.points;
        const pointsInput = document.getElementById('points-add');
        if (pointsInput && points) {
            pointsInput.value = points;
        }
    });
}

// DOM Elements
const leaderboardList = document.getElementById('leaderboard-list');
const teamModal = document.getElementById('team-modal');
const rulesModal = document.getElementById('rules-modal');
const addTeamBtn = document.getElementById('add-team-btn');
const viewRulesBtn = document.getElementById('view-rules-btn');
const closeModalBtn = document.querySelector('.close-modal');
const closeRulesBtn = document.querySelector('.close-rules');
const teamForm = document.getElementById('team-form');
const modalTitle = document.getElementById('modal-title');
const editIndexInput = document.getElementById('edit-index');
const podiumDisplay = document.getElementById('podium-display');

// Report Modal Elements
const reportModal = document.getElementById('report-modal');
const closeReportBtn = document.querySelector('.close-report');
const viewReportBtn = document.getElementById('view-report-btn');
let chartInstances = {};

// View Modal Elements
const viewModal = document.getElementById('view-modal');
const closeViewBtn = document.querySelector('.close-view');
const viewIcon = document.getElementById('view-icon');
const viewName = document.getElementById('view-name');
const viewRank = document.getElementById('view-rank');
const viewScore = document.getElementById('view-score');
const viewLevel = document.getElementById('view-level');
const viewProgressText = document.getElementById('view-progress-text');
const viewProgressBar = document.getElementById('view-progress-bar');

function calculateLevel(score) {
    if (score >= 12000) return { level: 4, name: "Black Cap", min: 12000, max: 20000 };
    if (score >= 6000) return { level: 3, name: "Purple Cap", min: 6000, max: 12000 };
    if (score >= 3000) return { level: 2, name: "Green Cap", min: 3000, max: 6000 };
    if (score >= 1000) return { level: 1, name: "Orange Cap", min: 1000, max: 3000 };
    return { level: 0, name: "No Cap", min: 0, max: 1000 };
}

function getCapColor(levelName) {
    if (levelName.includes("Orange")) return "#f97316";
    if (levelName.includes("Green")) return "#39ff14";
    if (levelName.includes("Purple")) return "#bc13fe";
    if (levelName.includes("Black")) return "#000000";
    return "#64748b"; // Grey for No Cap
}

function getCapSvg(color) {
    const stroke = color === "#000000" ? 'stroke="white" stroke-width="2"' : '';
    return `<svg viewBox="0 0 120 80" width="40" height="25" style="filter: drop-shadow(0 0 3px ${color})">
        <path fill="${color}" ${stroke} d="M20,50 A30,30 0 0,1 80,50 L110,50 L100,60 L20,60 Z M50,20 A10,10 0 0,1 50,20 Z" />
    </svg>`;
}

// Render Leaderboard
function renderLeaderboard() {
    // Sort teams by score descending
    teams.sort((a, b) => b.score - a.score);

    leaderboardList.innerHTML = ''; // Clear existing content
    podiumDisplay.innerHTML = ''; // Clear podium

    // Render Podium (Top 3)
    if (teams.length > 0) {
        const podiumOrder = [1, 0, 2]; // 2nd, 1st, 3rd position visually (indices)
        
        podiumOrder.forEach(idx => {
            if (teams[idx]) {
                const team = teams[idx];
                const rank = idx + 1;
                const div = document.createElement('div');
                div.className = `podium-item podium-${rank}`;
                div.innerHTML = `
                    <div class="podium-content">
                        <div class="podium-icon"><i class="fa-solid ${team.icon}"></i></div>
                        <div class="podium-name">${team.name}</div>
                        <div class="podium-score">${team.score.toLocaleString()} pts</div>
                    </div>
                    <div class="podium-rank">${rank}</div>
                `;
                podiumDisplay.appendChild(div);
            }
        });
    }

    teams.forEach((team, index) => {
        const rank = index + 1;
        const row = document.createElement('div');
        row.className = `leaderboard-row rank-${rank}`;

        const levelData = calculateLevel(team.score);
        let capsHtml = '';
        if (team.score < 1000) {
            capsHtml = '<span style="color:#94a3b8; font-size: 0.9rem; font-style: italic;">No Cap</span>';
        } else {
            if (team.score >= 1000) capsHtml += getCapSvg("#f97316");
            if (team.score >= 3000) capsHtml += getCapSvg("#39ff14");
            if (team.score >= 6000) capsHtml += getCapSvg("#bc13fe");
            if (team.score >= 12000) capsHtml += getCapSvg("#000000");
        }

        row.innerHTML = `
            <div class="col rank">#${rank}</div>
            <div class="col team">
                <div class="team-icon">
                    <i class="fa-solid ${team.icon}"></i>
                </div>
                <span>${team.name}</span>
            </div>
            <div class="col score">${team.score.toLocaleString()}</div>
            <div class="col cap-level" title="${levelData.name}" style="gap: 5px;">${capsHtml}</div>
            <div class="col actions">
                <button class="btn view-btn" onclick="viewTeam(${index})" title="View Dashboard"><i class="fa-solid fa-eye"></i></button>
                <button class="btn edit" onclick="editTeam(${index})" title="Edit"><i class="fa-solid fa-pen"></i></button>
                <button class="btn danger" onclick="deleteTeam(${index})" title="Delete"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;

        leaderboardList.appendChild(row);
    });
}

// Event Listeners
addTeamBtn.addEventListener('click', () => {
    // Reset Form for Add
    document.getElementById('team-form').reset();
    document.getElementById('edit-index').value = -1;
    document.getElementById('modal-title').textContent = "Add New Team";
    document.getElementById('current-score-display').textContent = "0";
    
    // Default Icon
    const defaultIcon = document.querySelector('input[name="team-icon"][value="fa-brain"]');
    if(defaultIcon) defaultIcon.checked = true;

    openModal(false);
});
viewReportBtn.addEventListener('click', renderReports);

function renderReports() {
    reportModal.style.display = 'flex';
    
    // Destroy existing charts if any
    if (Object.keys(chartInstances).length > 0) {
        Object.values(chartInstances).forEach(chart => chart.destroy());
    }

    // --- Chart 1: Engagement Levels (Pie) ---
    const ctxLevel = document.getElementById('levelChart').getContext('2d');
    const levelCounts = { 'No Cap': 0, 'Orange Cap': 0, 'Green Cap': 0, 'Purple Cap': 0, 'Black Cap': 0 };
    
    teams.forEach(t => {
        const lvl = calculateLevel(t.score).name;
        levelCounts[lvl] = (levelCounts[lvl] || 0) + 1;
    });

    chartInstances.level = new Chart(ctxLevel, {
        type: 'doughnut',
        data: {
            labels: Object.keys(levelCounts),
            datasets: [{
                data: Object.values(levelCounts),
                backgroundColor: ['#64748b', '#f97316', '#39ff14', '#bc13fe', '#ffffff'],
                borderWidth: 0
            }]
        },
        options: {
            plugins: {
                legend: { position: 'right', labels: { color: '#e2e8f0' } }
            }
        }
    });

    // --- Chart 2: Activity Trends (Line - Mock Data based on history) ---
    const ctxActivity = document.getElementById('activityChart').getContext('2d');
    
    // Aggregate history by date
    const dateMap = {};
    teams.forEach(t => {
        if(t.history) {
            t.history.forEach(h => {
                if(h.date) {
                    dateMap[h.date] = (dateMap[h.date] || 0) + h.points;
                }
            });
        }
    });
    
    // Sort dates
    const sortedDates = Object.keys(dateMap).sort().slice(-7); // Last 7 active days
    const datePoints = sortedDates.map(d => dateMap[d]);

    chartInstances.activity = new Chart(ctxActivity, {
        type: 'line',
        data: {
            labels: sortedDates,
            datasets: [{
                label: 'Total Points Awarded',
                data: datePoints,
                borderColor: '#00f3ff',
                tension: 0.4,
                fill: true,
                backgroundColor: 'rgba(0, 243, 255, 0.1)'
            }]
        },
        options: {
            scales: {
                y: { beginAtZero: true, ticks: { color: '#94a3b8' }, grid: { color: '#334155' } },
                x: { ticks: { color: '#94a3b8' }, grid: { display: false } }
            },
            plugins: { legend: { labels: { color: '#e2e8f0' } } }
        }
    });

    // --- Chart 3: Top Teams (Bar) ---
    const ctxTop = document.getElementById('topChart').getContext('2d');
    const top5 = [...teams].sort((a, b) => b.score - a.score).slice(0, 5);
    
    chartInstances.top = new Chart(ctxTop, {
        type: 'bar',
        data: {
            labels: top5.map(t => t.name),
            datasets: [{
                label: 'Current Score',
                data: top5.map(t => t.score),
                backgroundColor: [
                    'rgba(255, 215, 0, 0.8)', // Gold
                    'rgba(192, 192, 192, 0.8)', // Silver
                    'rgba(205, 127, 50, 0.8)', // Bronze
                    'rgba(0, 243, 255, 0.6)',
                    'rgba(0, 243, 255, 0.4)'
                ],
                borderColor: 'transparent',
                borderWidth: 0,
                borderRadius: 4
            }]
        },
        options: {
            indexAxis: 'y',
            scales: {
                x: { beginAtZero: true, ticks: { color: '#94a3b8' }, grid: { color: '#334155' } },
                y: { ticks: { color: '#e2e8f0', font: { weight: 'bold' } }, grid: { display: false } }
            },
            plugins: { legend: { display: false } }
        }
    });

    // --- Chart 4: Activity Count (Bar - Mock) ---
    const ctxCount = document.getElementById('activityCountChart').getContext('2d');
    
    // Count activities per day
    const activityCountMap = {};
    teams.forEach(t => {
        if(t.history) {
            t.history.forEach(h => {
                if(h.date) {
                    activityCountMap[h.date] = (activityCountMap[h.date] || 0) + 1;
                }
            });
        }
    });
    
    const countDates = Object.keys(activityCountMap).sort().slice(-7);
    const activityCounts = countDates.map(d => activityCountMap[d]);

    chartInstances.count = new Chart(ctxCount, {
        type: 'bar',
        data: {
            labels: countDates,
            datasets: [{
                label: 'Number of Activities',
                data: activityCounts,
                backgroundColor: '#bc13fe',
                borderRadius: 4
            }]
        },
        options: {
            scales: {
                y: { beginAtZero: true, ticks: { stepSize: 1, color: '#94a3b8' }, grid: { color: '#334155' } },
                x: { ticks: { color: '#94a3b8' }, grid: { display: false } }
            },
            plugins: { legend: { display: false } }
        }
    });
}
viewRulesBtn.addEventListener('click', openRules);
closeModalBtn.addEventListener('click', closeModal);
closeRulesBtn.addEventListener('click', closeRules);
closeViewBtn.addEventListener('click', closeView);
closeReportBtn.addEventListener('click', closeReport);

function openRules() {
    rulesModal.style.display = 'flex';
}

function closeRules() {
    rulesModal.style.display = 'none';
}

function openModal(isEdit) {
    teamModal.style.display = 'flex';
}

function closeModal() {
    teamModal.style.display = 'none';
}

function closeReport() {
    reportModal.style.display = 'none';
}

function closeView() {
    viewModal.style.display = 'none';
}

// Logout
document.getElementById('logout-btn').addEventListener('click', () => {
    sessionStorage.removeItem('currentUser');
    location.reload();
});

// Close modal if clicking outside
window.addEventListener('click', (e) => {
    if (e.target === teamModal) closeModal();
    if (e.target === rulesModal) closeRules();
    if (e.target === viewModal) closeView();
    if (e.target === reportModal) closeReport();
});

// Form Submission (Add / Edit)
teamForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('team-name').value;
    const icon = document.querySelector('input[name="team-icon"]:checked').value;
    const index = parseInt(editIndexInput.value);
    
    const pointsAddInput = document.getElementById('points-add');
    const reasonInput = document.getElementById('points-reason');
    
    let pointsToAdd = parseInt(pointsAddInput.value);
    const reason = reasonInput.value.trim();

    try {
        if (index > -1) {
            // Update Existing Team
            const team = teams[index];
            let newScore = team.score;
            let newHistory = team.history || [];

            if (!isNaN(pointsToAdd) && pointsToAdd !== 0) {
                if (!reason) {
                    alert("Please provide a reason for adding/subtracting points.");
                    return;
                }
                newScore += pointsToAdd;
                const date = new Date().toISOString().split('T')[0];
                newHistory.push({ points: pointsToAdd, reason: reason, date: date });
            }

            const updatedTeam = { ...team, name, icon, score: newScore, history: newHistory };
            
            await fetch(`${API_BASE_URL}/api/teams/${team.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedTeam)
            });

        } else {
            // Add New Team
            let initialScore = isNaN(pointsToAdd) ? 0 : pointsToAdd;
            let history = [];
            if (initialScore !== 0) {
                 history.push({ points: initialScore, reason: reason || "Initial Score", date: new Date().toISOString().split('T')[0] });
            }

            const newTeamData = {
                name,
                icon,
                score: initialScore,
                history: history
            };

            await fetch(`${API_BASE_URL}/api/teams`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTeamData)
            });
        }
        
        await fetchTeams(); // Refresh data from server
        closeModal();

    } catch (error) {
        console.error("Error saving team:", error);
        alert("Failed to save changes. Check server connection.");
    }
});

// CRUD Operations exposed to window for inline onclicks
window.editTeam = function(index) {
    const team = teams[index];
    document.getElementById('team-name').value = team.name;
    
    // Update Score UI
    document.getElementById('current-score-display').textContent = team.score.toLocaleString();
    document.getElementById('points-add').value = '';
    document.getElementById('points-reason').value = '';
    
    // Select the correct icon
    const iconRadio = document.querySelector(`input[name="team-icon"][value="${team.icon}"]`);
    if (iconRadio) iconRadio.checked = true;

    editIndexInput.value = index;
    modalTitle.textContent = "Update Points / Edit Team";
    
    openModal(true);
};

window.viewTeam = function(index) {
    const team = teams[index];
    const rank = index + 1;
    const levelData = calculateLevel(team.score);
    
    // Populate Modal
    viewIcon.innerHTML = `<i class="fa-solid ${team.icon}"></i>`;
    viewName.textContent = team.name;
    viewRank.textContent = rank;
    viewScore.textContent = team.score.toLocaleString();
    
    // Show Cap Icon instead of Text
    let levelContent = '';
    if (levelData.level === 0) {
        levelContent = '<span style="font-size: 1.5rem; color: #94a3b8;">No Cap</span>';
        viewLevel.style.color = '#94a3b8';
    } else {
        const levelColor = getCapColor(levelData.name);
        levelContent = `<svg viewBox="0 0 120 80" width="80" height="50" style="filter: drop-shadow(0 0 5px ${levelColor})">
            <path fill="${levelColor}" ${levelColor === "#000000" ? 'stroke="white" stroke-width="2"' : ''} d="M20,50 A30,30 0 0,1 80,50 L110,50 L100,60 L20,60 Z M50,20 A10,10 0 0,1 50,20 Z" />
        </svg>`;
        viewLevel.style.color = ''; // Reset
    }
    
    viewLevel.innerHTML = levelContent;
    viewLevel.title = levelData.name;

    // Progress Calculation
    let progress = 0;
    if (levelData.level < 4) {
        const range = levelData.max - levelData.min;
        const current = team.score - levelData.min;
        progress = Math.min(100, Math.max(0, (current / range) * 100));
        viewProgressText.textContent = `${team.score.toLocaleString()} / ${levelData.max.toLocaleString()} pts`;
    } else {
        progress = 100;
        viewProgressText.textContent = "Max Level Reached!";
    }
    viewProgressBar.style.width = `${progress}%`;

    // History
    const viewHistory = document.getElementById('view-history');
    if (viewHistory) {
        viewHistory.innerHTML = '';
        if (team.history && team.history.length > 0) {
            const sortedHistory = [...team.history].reverse();
            sortedHistory.forEach(item => {
                const div = document.createElement('div');
                div.className = 'history-item';
                const sign = item.points >= 0 ? '+' : '';
                const pClass = item.points >= 0 ? 'positive' : 'negative';
                div.innerHTML = `
                    <div class="history-points ${pClass}">${sign}${item.points}</div>
                    <div class="history-reason" title="${item.reason}">${item.reason}</div>
                    <div class="history-date">${item.date || 'Today'}</div>
                `;
                viewHistory.appendChild(div);
            });
        } else {
            viewHistory.innerHTML = '<p style="color:var(--text-secondary); padding:1rem; text-align:center;">No history available.</p>';
        }
    }

    viewModal.style.display = 'flex';
};

window.deleteTeam = async function(index) {
    const team = teams[index];
    if(confirm(`Are you sure you want to delete ${team.name}?`)) {
        try {
            await fetch(`${API_BASE_URL}/api/teams/${team.id}`, { method: 'DELETE' });
            await fetchTeams();
        } catch (error) {
            console.error("Error deleting team:", error);
        }
    }
};

function launchFireworks() {
    const duration = 5000;
    const endTime = Date.now() + duration;
    const colors = ['#00f3ff', '#bc13fe', '#39ff14', '#ffd700', '#ff003c', '#ffffff'];

    const interval = setInterval(() => {
        if (Date.now() > endTime) {
            clearInterval(interval);
            return;
        }
        
        // Launch a firework rocket (trail)
        const startX = Math.random() * 80 + 10;
        const endX = startX + (Math.random() * 20 - 10);
        const endY = Math.random() * 40 + 10; // Top 10-50%
        
        const trail = document.createElement('div');
        trail.className = 'firework-trail';
        trail.style.left = startX + 'vw';
        trail.style.top = '100vh';
        trail.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        
        document.body.appendChild(trail);
        
        // Animate
        const animation = trail.animate([
            { top: '100vh', left: startX + 'vw', opacity: 1, transform: 'scale(1)' },
            { top: endY + 'vh', left: endX + 'vw', opacity: 0, transform: 'scale(0.5)' }
        ], {
            duration: 800 + Math.random() * 400,
            easing: 'ease-out'
        });
        
        animation.onfinish = () => {
            createExplosion(endX, endY, trail.style.backgroundColor);
            trail.remove();
        };
        
    }, 300);
}

function createExplosion(x, y, color) {
    const particleCount = 60;
    for (let i = 0; i < particleCount; i++) {
        const p = document.createElement('div');
        p.className = 'firework-particle';
        p.style.left = x + 'vw';
        p.style.top = y + 'vh';
        p.style.backgroundColor = color;
        
        document.body.appendChild(p);
        
        // Physics-based Keyframes for Arc
        const keyframes = [];
        const frames = 30;
        const angle = Math.random() * Math.PI * 2;
        const force = Math.random() * 8 + 4; // Initial speed
        const gravity = 0.4; // Gravity acceleration
        
        const vx = Math.cos(angle) * force;
        const vy = Math.sin(angle) * force;
        
        let posX = 0;
        let posY = 0;
        let currentVy = vy;

        for (let f = 0; f <= frames; f++) {
            posX += vx;
            posY += currentVy;
            currentVy += gravity; // Apply gravity
            
            const opacity = 1 - (f / frames);
            const scale = 1 - (f / frames) * 0.5;
            
            keyframes.push({
                transform: `translate(${posX * 2}px, ${posY * 2}px) scale(${scale})`, // Scale movement for visibility
                opacity: opacity
            });
        }

        const animation = p.animate(keyframes, {
            duration: 1500 + Math.random() * 1000,
            easing: 'linear' // Path is defined by keyframes
        });
        
        animation.onfinish = () => p.remove();
    }
}

function launchComets() {
    const duration = 5000;
    const endTime = Date.now() + duration;
    
    const interval = setInterval(() => {
        if (Date.now() > endTime) {
            clearInterval(interval);
            return;
        }
        
        const comet = document.createElement('div');
        comet.className = 'comet';
        
        // Random start side (mostly left or right)
        const startLeft = Math.random() > 0.5;
        const startX = startLeft ? -10 : 110;
        const startY = Math.random() * 60;
        const endX = startLeft ? 110 : -10;
        const endY = startY + (Math.random() * 40 - 20); // Slight vertical variance
        
        // Calculate Angle
        const dy = endY - startY;
        const dx = endX - startX;
        const angle = Math.atan2(dy, dx) * (180 / Math.PI); // Degrees
        
        comet.style.left = startX + 'vw';
        comet.style.top = startY + 'vh';
        
        document.body.appendChild(comet);
        
        const anim = comet.animate([
            { transform: `translate(0, 0) rotate(${angle}deg)`, opacity: 0 },
            { transform: `translate(${dx*0.1}vw, ${dy*0.1}vh) rotate(${angle}deg)`, opacity: 1, offset: 0.1 },
            { transform: `translate(${dx}vw, ${dy}vh) rotate(${angle}deg)`, opacity: 0 }
        ], {
            duration: 1500 + Math.random() * 1000,
            easing: 'linear'
        });
        
        anim.onfinish = () => comet.remove();
        
    }, 800); // Every 800ms
}

// Initial Render
document.addEventListener('DOMContentLoaded', () => {
    initAuth(); // Check auth first
    
    if (sessionStorage.getItem('currentUser')) {
        fetchTeams();
        fetchReasons();
        // Celebration
        launchFireworks();
        launchComets();
    }
});
