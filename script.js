// Initial Data
let teams = [
    {
        name: "Neural Nexus",
        icon: "fa-brain",
        score: 9850,
        history: [
            { points: 500, reason: "Launch MVP", date: "2023-10-01" },
            { points: 200, reason: "Weekly Streak", date: "2023-10-08" }
        ],
        badges: [
            { icon: "💡", title: "Innovator" },
            { icon: "🤖", title: "AI Native" },
            { icon: "⚙️", title: "Optimizer" }
        ]
    },
    {
        name: "Data Dynamos",
        icon: "fa-database",
        score: 9420,
        history: [],
        badges: [
            { icon: "🏗️", title: "Builder" },
            { icon: "💡", title: "Innovator" }
        ]
    },
    {
        name: "Cyber Synapse",
        icon: "fa-network-wired",
        score: 8900,
        badges: [
            { icon: "🛡️", title: "Guardian" },
            { icon: "⚙️", title: "Optimizer" }
        ]
    },
    {
        name: "Algorithm Allies",
        icon: "fa-code-branch",
        score: 8550,
        badges: [
            { icon: "🤝", title: "Collaborator" }
        ]
    },
    {
        name: "Silicon Squad",
        icon: "fa-microchip",
        score: 8100,
        badges: [
            { icon: "🏗️", title: "Builder" },
            { icon: "⚙️", title: "Optimizer" }
        ]
    },
    {
        name: "Quantum Quest",
        icon: "fa-atom",
        score: 7800,
        badges: [
            { icon: "💡", title: "Innovator" }
        ]
    },
    {
        name: "Logic Legends",
        icon: "fa-puzzle-piece",
        score: 7450,
        badges: [
            { icon: "⚙️", title: "Optimizer" }
        ]
    },
    {
        name: "Binary Brigade",
        icon: "fa-0",
        score: 7100,
        badges: [
            { icon: "🏗️", title: "Builder" }
        ]
    },
    {
        name: "Future Forge",
        icon: "fa-hammer",
        score: 6800,
        badges: [
            { icon: "🏗️", title: "Builder" }
        ]
    },
    {
        name: "Techno Titans",
        icon: "fa-robot",
        score: 6500,
        badges: [
            { icon: "🤖", title: "AI Native" }
        ]
    }
];

const availableBadges = [
    { icon: "💡", title: "Innovator" },
    { icon: "🏗️", title: "Builder" },
    { icon: "⚙️", title: "Optimizer" },
    { icon: "🤝", title: "Collaborator" },
    { icon: "🛡️", title: "Guardian" },
    { icon: "🤖", title: "AI Native" }
];

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
const viewBadges = document.getElementById('view-badges');

function calculateLevel(score) {
    if (score >= 10000) return { level: 5, name: "Visionary", min: 10000, max: 20000 };
    if (score >= 6000) return { level: 4, name: "Master", min: 6000, max: 10000 };
    if (score >= 3000) return { level: 3, name: "Pro", min: 3000, max: 6000 };
    if (score >= 1000) return { level: 2, name: "Explorer", min: 1000, max: 3000 };
    return { level: 1, name: "Novice", min: 0, max: 1000 };
}

function calculateBadges(score) {
    const badges = [];
    if (score >= 1000) badges.push({ icon: "🤝", title: "Collaborator" });
    if (score >= 3000) badges.push({ icon: "🏗️", title: "Builder" });
    if (score >= 6000) {
        badges.push({ icon: "⚙️", title: "Optimizer" });
        badges.push({ icon: "🛡️", title: "Guardian" });
    }
    if (score >= 10000) {
        badges.push({ icon: "💡", title: "Innovator" });
        badges.push({ icon: "🤖", title: "AI Native" });
    }
    return badges;
}

// Render Leaderboard
function renderLeaderboard() {
    // Recalculate badges for all teams based on score
    teams.forEach(team => {
        team.badges = calculateBadges(team.score);
    });

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

        // Generate Badges HTML
        const badgesHtml = team.badges && team.badges.length > 0 
            ? team.badges.map(badge => `<span class="badge" title="${badge.title}">${badge.icon}</span>`).join('') 
            : '<span style="color:var(--text-secondary); font-size:0.8rem;">No badges yet</span>';

        row.innerHTML = `
            <div class="col rank">#${rank}</div>
            <div class="col team">
                <div class="team-icon">
                    <i class="fa-solid ${team.icon}"></i>
                </div>
                <span>${team.name}</span>
            </div>
            <div class="col score">${team.score.toLocaleString()}</div>
            <div class="col badges">${badgesHtml}</div>
            <div class="col actions">
                <button class="btn view-btn" onclick="viewTeam(${index})" title="View Dashboard"><i class="fa-solid fa-eye"></i></button>
                <button class="btn edit" onclick="editTeam(${index})" title="Edit"><i class="fa-solid fa-pen"></i></button>
                <button class="btn danger" onclick="deleteTeam(${index})" title="Delete"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;

        leaderboardList.appendChild(row);
    });
}

// Modal Handling
function openModal(isEdit = false) {
    teamModal.style.display = 'flex';
    if (!isEdit) {
        teamForm.reset();
        editIndexInput.value = -1;
        modalTitle.textContent = "Add New Team";
        // Reset specific fields for new team
        document.getElementById('current-score-display').textContent = "0";
        document.getElementById('points-add').value = '';
        document.getElementById('points-reason').value = '';
    }
}

function closeModal() {
    teamModal.style.display = 'none';
}

function closeView() {
    viewModal.style.display = 'none';
}

function closeReport() {
    reportModal.style.display = 'none';
}

function openRules() {
    rulesModal.style.display = 'flex';
}

function closeRules() {
    rulesModal.style.display = 'none';
}

// Mock Data Generator for Reports
function generateMockHistory() {
    teams.forEach(team => {
        if (!team.history || team.history.length === 0) {
            team.history = [];
            const today = new Date();
            for (let i = 0; i < 5; i++) {
                const daysAgo = Math.floor(Math.random() * 7);
                const points = Math.floor(Math.random() * 500) + 50;
                const date = new Date(today);
                date.setDate(today.getDate() - daysAgo);
                team.history.push({
                    points: points,
                    reason: "Automated Activity",
                    date: date.toISOString().split('T')[0]
                });
            }
        }
    });
}

function renderReports() {
    generateMockHistory();
    reportModal.style.display = 'flex';

    // 1. Engagement Levels (Pie Chart)
    const levels = { "Novice": 0, "Explorer": 0, "Pro": 0, "Master": 0, "Visionary": 0 };
    teams.forEach(t => {
        const lvl = calculateLevel(t.score);
        if (levels[lvl.name] !== undefined) levels[lvl.name]++;
    });

    const ctxLevel = document.getElementById('levelChart').getContext('2d');
    if (chartInstances.level) chartInstances.level.destroy();
    chartInstances.level = new Chart(ctxLevel, {
        type: 'doughnut',
        data: {
            labels: Object.keys(levels),
            datasets: [{
                data: Object.values(levels),
                backgroundColor: ['#94a3b8', '#3b82f6', '#8b5cf6', '#fbbf24', '#10b981'],
                borderWidth: 0
            }]
        },
        options: {
            plugins: {
                legend: { position: 'right', labels: { color: '#fff' } }
            }
        }
    });

    // 2. Activity Trends (Line Chart - Last 7 Days)
    const dates = [];
    const today = new Date();
    for(let i=6; i>=0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        dates.push(d.toISOString().split('T')[0]);
    }

    const activityData = dates.map(date => {
        let dailyTotal = 0;
        teams.forEach(t => {
            if(t.history) {
                t.history.forEach(h => {
                    if(h.date === date) dailyTotal += h.points;
                });
            }
        });
        return dailyTotal;
    });

    const ctxActivity = document.getElementById('activityChart').getContext('2d');
    if (chartInstances.activity) chartInstances.activity.destroy();
    chartInstances.activity = new Chart(ctxActivity, {
        type: 'line',
        data: {
            labels: dates.map(d => d.slice(5)), // MM-DD
            datasets: [{
                label: 'Points Added',
                data: activityData,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#aaa' } },
                x: { grid: { display: false }, ticks: { color: '#aaa' } }
            },
            plugins: { legend: { display: false } }
        }
    });

    // 3. Top Performers (Bar Chart)
    const topTeams = [...teams].sort((a,b) => b.score - a.score).slice(0, 5);
    const ctxTop = document.getElementById('topChart').getContext('2d');
    if (chartInstances.top) chartInstances.top.destroy();
    chartInstances.top = new Chart(ctxTop, {
        type: 'bar',
        data: {
            labels: topTeams.map(t => t.name),
            datasets: [{
                label: 'Total Score',
                data: topTeams.map(t => t.score),
                backgroundColor: ['#fbbf24', '#e2e8f0', '#b45309', 'rgba(59, 130, 246, 0.6)', 'rgba(59, 130, 246, 0.4)'],
                borderRadius: 4
            }]
        },
        options: {
            indexAxis: 'y',
            scales: {
                x: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#aaa' } },
                y: { grid: { display: false }, ticks: { color: '#fff' } }
            },
            plugins: { legend: { display: false } }
        }
    });

    // 4. Activity Count (Stacked Bar Chart - Last 7 Days)
    // Generate colors for teams
    const colors = [
        '#3b82f6', '#8b5cf6', '#10b981', '#fbbf24', '#f43f5e', 
        '#06b6d4', '#ec4899', '#f97316', '#6366f1', '#84cc16'
    ];

    const datasets = teams.map((team, index) => {
        const dailyCounts = dates.map(date => {
            let count = 0;
            if (team.history) {
                team.history.forEach(h => {
                    if (h.date === date) count++;
                });
            }
            return count;
        });

        return {
            label: team.name,
            data: dailyCounts,
            backgroundColor: colors[index % colors.length],
            borderRadius: 2
        };
    });

    const ctxActivityCount = document.getElementById('activityCountChart').getContext('2d');
    if (chartInstances.activityCount) chartInstances.activityCount.destroy();
    chartInstances.activityCount = new Chart(ctxActivityCount, {
        type: 'bar',
        data: {
            labels: dates.map(d => d.slice(5)), // MM-DD
            datasets: datasets
        },
        options: {
            scales: {
                x: { 
                    stacked: true, 
                    grid: { display: false }, 
                    ticks: { color: '#aaa' } 
                },
                y: { 
                    stacked: true, 
                    beginAtZero: true, 
                    grid: { color: 'rgba(255,255,255,0.1)' }, 
                    ticks: { color: '#aaa' } 
                }
            },
            plugins: { 
                legend: { 
                    display: true, // Show legend so users know which color is which team
                    position: 'bottom',
                    labels: { color: '#fff', boxWidth: 10, font: { size: 10 } }
                } 
            }
        }
    });
}

// Event Listeners
addTeamBtn.addEventListener('click', () => openModal(false));
viewReportBtn.addEventListener('click', renderReports);
viewRulesBtn.addEventListener('click', openRules);
closeModalBtn.addEventListener('click', closeModal);
closeRulesBtn.addEventListener('click', closeRules);
closeViewBtn.addEventListener('click', closeView);
closeReportBtn.addEventListener('click', closeReport);

// Close modal if clicking outside
window.addEventListener('click', (e) => {
    if (e.target === teamModal) closeModal();
    if (e.target === rulesModal) closeRules();
    if (e.target === viewModal) closeView();
    if (e.target === reportModal) closeReport();
});

// Form Submission (Add / Edit)
teamForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('team-name').value;
    const icon = document.querySelector('input[name="team-icon"]:checked').value;
    const index = parseInt(editIndexInput.value);
    
    const pointsAddInput = document.getElementById('points-add');
    const reasonInput = document.getElementById('points-reason');
    
    let pointsToAdd = parseInt(pointsAddInput.value);
    const reason = reasonInput.value.trim();

    // Logic for Update (Edit)
    if (index > -1) {
        const team = teams[index];
        let newScore = team.score;
        let newHistory = team.history || [];

        // If points added, require reason
        if (!isNaN(pointsToAdd) && pointsToAdd !== 0) {
            if (!reason) {
                alert("Please provide a reason for adding/subtracting points.");
                return;
            }
            newScore += pointsToAdd;
            const date = new Date().toISOString().split('T')[0];
            newHistory.push({ points: pointsToAdd, reason: reason, date: date });
        }

        teams[index] = { 
            ...team, 
            name, 
            icon, 
            score: newScore,
            history: newHistory,
            badges: calculateBadges(newScore) // Immediate update
        };
    } else {
        // Add new team
        // For new team, use 'points-add' as initial score if provided, else 0
        // Or simpler: Just treat it as initial score.
        // The UI changed "Score" to "Current Score" (display) and "Add Points" (input).
        // For a NEW team, "Current Score" is 0. "Add Points" is the initial score.
        // Reason is "Initial Score"
        
        let initialScore = isNaN(pointsToAdd) ? 0 : pointsToAdd;
        let history = [];
        if (initialScore !== 0) {
             history.push({ points: initialScore, reason: reason || "Initial Score", date: new Date().toISOString().split('T')[0] });
        }

        const newTeamData = {
            name,
            icon,
            score: initialScore,
            history: history,
            badges: calculateBadges(initialScore)
        };
        teams.push(newTeamData);
    }

    renderLeaderboard();
    closeModal();
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
    viewLevel.textContent = `Level ${levelData.level}: ${levelData.name}`;
    
    // Progress Calculation
    let progress = 0;
    if (levelData.level < 5) {
        const range = levelData.max - levelData.min;
        const current = team.score - levelData.min;
        progress = Math.min(100, Math.max(0, (current / range) * 100));
        viewProgressText.textContent = `${team.score.toLocaleString()} / ${levelData.max.toLocaleString()} pts`;
    } else {
        progress = 100;
        viewProgressText.textContent = "Max Level Reached!";
    }
    viewProgressBar.style.width = `${progress}%`;

    // Badges
    viewBadges.innerHTML = '';
    if (team.badges && team.badges.length > 0) {
        team.badges.forEach(badge => {
            const div = document.createElement('div');
            div.className = 'badge-item';
            div.innerHTML = `<span style="font-size: 1.2rem;">${badge.icon}</span> <span>${badge.title}</span>`;
            viewBadges.appendChild(div);
        });
    } else {
        viewBadges.innerHTML = '<p style="color:var(--text-secondary)">No badges yet.</p>';
    }

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

window.deleteTeam = function(index) {
    if(confirm(`Are you sure you want to delete ${teams[index].name}?`)) {
        teams.splice(index, 1);
        renderLeaderboard();
    }
};

function launchFireworks() {
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffffff'];
    
    // Continuous fireworks for 30 seconds
    const duration = 30000;
    const interval = 600; // Launch every 600ms
    const endTime = Date.now() + duration;

    const launcher = setInterval(() => {
        if (Date.now() > endTime) {
            clearInterval(launcher);
            return;
        }

        // Launch 1-3 fireworks at a time
        const batch = Math.floor(Math.random() * 3) + 1;
        for(let b=0; b<batch; b++) {
            const x = Math.random() * 80 + 10;
            const y = Math.random() * 40 + 10; 
            const color = colors[Math.floor(Math.random() * colors.length)];
            createExplosion(x, y, color);
        }
    }, interval);
}

function createExplosion(x, y, color) {
    const particleCount = 30;
    for (let i = 0; i < particleCount; i++) {
        const p = document.createElement('div');
        p.className = 'firework-particle';
        p.style.left = x + 'vw';
        p.style.top = y + 'vh';
        p.style.backgroundColor = color;
        
        // Random direction
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 100 + 50; // Distance
        const tx = Math.cos(angle) * velocity + 'px';
        const ty = Math.sin(angle) * velocity + 'px';
        
        p.style.setProperty('--tx', tx);
        p.style.setProperty('--ty', ty);
        
        document.body.appendChild(p);
        
        setTimeout(() => p.remove(), 1000);
    }
}

// Initial Render
document.addEventListener('DOMContentLoaded', () => {
    renderLeaderboard();
    
    // Celebration
    launchFireworks();
});
