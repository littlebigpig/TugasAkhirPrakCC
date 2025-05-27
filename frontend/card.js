// Configuration
const TOTAL_PCS = 30;
const DEFAULT_STATUS = 'kosong';
const API_BASE_URL = 'http://localhost:5000/api';

// Status mapping between frontend and backend
const STATUS_MAPPING = {
    // Frontend to Backend
    kosong: 'available',
    dipakai: 'in_use',
    perbaikan: 'maintenance',
    // Backend to Frontend
    available: 'kosong',
    in_use: 'dipakai',
    maintenance: 'perbaikan'
};

// PC Data Model
let pcData = [];
let originalPCData = [];

// Store end times for each PC
const pcTimers = new Map();

// Save PC state to localStorage
function savePCState() {
    const state = {
        pcData: pcData,
        timers: Array.from(pcTimers.entries())
    };
    localStorage.setItem('pcState', JSON.stringify(state));
}

// Load PC state from localStorage
function loadPCState() {
    const savedState = localStorage.getItem('pcState');
    if (savedState) {
        const state = JSON.parse(savedState);
        pcData = state.pcData;
        pcTimers.clear();
        state.timers.forEach(([id, endTime]) => {
            pcTimers.set(parseInt(id), endTime);
        });
        return true;
    }
    return false;
}

// DOM Elements
const pcGrid = document.getElementById('pcGrid');
const pcModal = document.getElementById('pcModal');
const modalTitle = document.getElementById('modalTitle');
const usernameInput = document.getElementById('usernameInput');
const hoursInput = document.getElementById('hours');
const minutesInput = document.getElementById('minutes');
const secondsInput = document.getElementById('seconds');
const sortDropdown = document.querySelector('.sort-dropdown');

let currentPC = null;

// Initialize the application
async function init() {
    try {
        // Try to load saved state first
        if (!loadPCState()) {
            // If no saved state, fetch from backend
            await fetchPCData();
        }
        renderPCCards();
        setupEventListeners();
    } catch (error) {
        console.error('Failed to initialize:', error);
        alert('Failed to load PC data. Please try again.');
    }
}

document.addEventListener('DOMContentLoaded', init);

// Fetch PC data from backend
async function fetchPCData() {
    try {
        const token = localStorage.getItem('authToken');
        if (!token) {
            window.location.href = '/frontend/login.html';
            return;
        }

        const response = await fetch(`${API_BASE_URL}/computers`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch PC data');
        }

        const computers = await response.json();
        pcData = computers.map(pc => ({
            id: pc.id,
            status: STATUS_MAPPING[pc.status] || DEFAULT_STATUS,
            username: pc.username || '',
            time: pc.time || ''
        }));

        // Initialize timers for in-use PCs
        pcData.forEach(pc => {
            if (pc.status === 'dipakai' && pc.time && !pcTimers.has(pc.id)) {
                pcTimers.set(pc.id, calculateEndTime(pc.time));
            }
        });

        originalPCData = [...pcData];
    } catch (error) {
        console.error('Error fetching PC data:', error);
        throw error;
    }
}

// Update PC status in backend
async function updatePCStatus(pcId, status, username = '', time = '') {
    try {
        const token = localStorage.getItem('authToken');
        if (!token) {
            window.location.href = '/frontend/login.html';
            return;
        }

        const response = await fetch(`${API_BASE_URL}/computers/${pcId}/status`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                status: STATUS_MAPPING[status],
                username,
                time
            })
        });

        if (!response.ok) {
            throw new Error('Failed to update PC status');
        }

        const result = await response.json();
        savePCState(); // Save state after successful update
        return result;
    } catch (error) {
        console.error('Error updating PC status:', error);
        throw error;
    }
}

function renderPCCards() {
    pcGrid.innerHTML = '';
    pcData.forEach(pc => {
        const card = createPCCard(pc);
        pcGrid.appendChild(card);
    });
}

function createPCCard(pc) {
    const card = document.createElement('div');
    card.className = `card ${pc.status}`;
    card.dataset.id = pc.id;
    card.onclick = () => openModal(pc.id);

    const cardNumber = document.createElement('div');
    cardNumber.className = 'card-number';
    cardNumber.textContent = pc.id;

    const cardStatus = document.createElement('div');
    cardStatus.className = 'card-status';
    cardStatus.textContent = pc.status;

    card.appendChild(cardNumber);
    card.appendChild(cardStatus);

    const usernameElement = document.createElement('div');
    usernameElement.className = 'card-username';
    usernameElement.style.display = 'none';
    card.appendChild(usernameElement);

    const timerElement = document.createElement('div');
    timerElement.className = 'card-timer';
    timerElement.style.display = 'none';
    card.appendChild(timerElement);

    if (pc.status === 'dipakai') {
        usernameElement.textContent = pc.username || 'Guest';
        usernameElement.style.display = 'block';
        
        if (pc.time) {
            timerElement.style.display = 'block';
            if (!pcTimers.has(pc.id)) {
                // Only set new end time if it doesn't exist
                pcTimers.set(pc.id, calculateEndTime(pc.time));
            }
            const remainingMs = pcTimers.get(pc.id) - Date.now();
            if (remainingMs > 0) {
                startCountdown(card, remainingMs);
            }
        }
    }

    return card;
}

function setupEventListeners() {
    pcModal.addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });

    sortDropdown.addEventListener('change', function() {
        sortPCs(this.value);
    });

    // Time unit inputs handling
    document.querySelectorAll('.time-unit').forEach(input => {
        input.addEventListener('blur', function() {
            this.value = formatTimeUnit(this.value || '0');
        });
        
        input.addEventListener('input', function() {
            if (this.value.length >= 2) {
                this.value = formatTimeUnit(this.value.slice(0, 2));
                const next = this.nextElementSibling?.nextElementSibling; // Skip the colon
                if (next && next.classList.contains('time-unit')) {
                    next.focus();
                }
            }
        });
    });
}

function openModal(pcId) {
    currentPC = pcId;
    const pc = pcData.find(pc => pc.id === pcId);
    
    if (!pc) {
        console.error('PC not found:', pcId);
        return;
    }

    modalTitle.textContent = `PC ${pcId}`;
    usernameInput.value = pc.username || '';
    
    // Set time inputs
    if (pc.time) {
        const [h, m, s] = pc.time.split(':');
        hoursInput.value = h;
        minutesInput.value = m;
        secondsInput.value = s;
    } else {
        hoursInput.value = '01';
        minutesInput.value = '00';
        secondsInput.value = '00';
    }

    pcModal.classList.add('active');
}

function closeModal() {
    pcModal.classList.remove('active');
    currentPC = null;
}

function formatTimeUnit(value) {
    return String(value).padStart(2, '0');
}

function getBillingTime() {
    const h = formatTimeUnit(hoursInput.value);
    const m = formatTimeUnit(minutesInput.value);
    const s = formatTimeUnit(secondsInput.value);
    return `${h}:${m}:${s}`;
}

function isValidTime(timeStr) {
    const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
    return regex.test(timeStr);
}

function timeToMs(timeStr) {
    if (!isValidTime(timeStr)) return 3600000;
    const [h, m, s] = timeStr.split(':').map(Number);
    return (h * 3600 + m * 60 + s) * 1000;
}

// Calculate end time from time string
function calculateEndTime(timeStr) {
    const durationMs = timeToMs(timeStr);
    return Date.now() + durationMs;
}

async function setStatus(status) {
    if (!currentPC) return;

    const pcIndex = pcData.findIndex(pc => pc.id === currentPC);
    if (pcIndex === -1) return;

    try {
        const pc = pcData[pcIndex];
        let username = '';
        let time = '';

        switch(status) {
            case 'kosong':
                break;
            case 'dipakai':
                username = usernameInput.value.trim() || 'Guest';
                time = getBillingTime();

                // Create new session
                const sessionResponse = await fetch(`${API_BASE_URL}/sessions`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        user_id: JSON.parse(localStorage.getItem('userInfo')).id,
                        computer_id: currentPC,
                        duration: timeToMinutes(time),
                        payment_method: 'offline',
                        username: username
                    })
                });

                if (!sessionResponse.ok) {
                    const errorData = await sessionResponse.json();
                    throw new Error(errorData.message || 'Failed to create session');
                }

                break;
            case 'perbaikan':
                break;
            case 'stop':
                status = 'kosong';
                break;
        }

        // Update PC status
        await updatePCStatus(currentPC, status, username, time);

        // Update frontend
        pc.status = status;
        pc.username = username;
        pc.time = time;

        const originalIndex = originalPCData.findIndex(p => p.id === currentPC);
        if (originalIndex !== -1) {
            originalPCData[originalIndex] = {...pcData[pcIndex]};
        }

        savePCState(); // Save state after updates
        renderPCCards();
        closeModal();
    } catch (error) {
        console.error('Error setting status:', error);
        alert(error.message || 'Failed to update PC status. Please try again.');
    }
}

// Convert time string to minutes
function timeToMinutes(timeStr) {
    const [hours, minutes, seconds] = timeStr.split(':').map(Number);
    return hours * 60 + minutes + (seconds > 0 ? 1 : 0);
}

function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

async function startCountdown(cardElement, durationMs) {
    const timerElement = cardElement.querySelector('.card-timer');
    const pcId = parseInt(cardElement.dataset.id);
    
    let endTime;
    if (pcTimers.has(pcId)) {
        endTime = pcTimers.get(pcId);
    } else {
        endTime = Date.now() + durationMs;
        pcTimers.set(pcId, endTime);
        savePCState(); // Save state when setting new timer
    }

    if (cardElement.dataset.intervalId) {
        clearInterval(cardElement.dataset.intervalId);
    }

    const intervalId = setInterval(async () => {
        const remaining = endTime - Date.now();
        if (remaining <= 0) {
            clearInterval(intervalId);
            timerElement.textContent = '00:00:00';
            pcTimers.delete(pcId);
            savePCState(); // Save state when timer ends
            
            try {
                await updatePCStatus(pcId, 'kosong');
                
                const pcIndex = pcData.findIndex(pc => pc.id === pcId);
                if (pcIndex !== -1) {
                    pcData[pcIndex].status = 'kosong';
                    pcData[pcIndex].username = '';
                    pcData[pcIndex].time = '';
                    
                    const originalIndex = originalPCData.findIndex(p => p.id === pcId);
                    if (originalIndex !== -1) {
                        originalPCData[originalIndex] = {...pcData[pcIndex]};
                    }
                }
                savePCState(); // Save state after updates
                renderPCCards();
            } catch (error) {
                console.error('Error updating PC status after timer ended:', error);
                alert('Failed to update PC status automatically. Please refresh the page.');
            }
            return;
        }
        timerElement.textContent = formatTime(remaining);
    }, 1000);

    cardElement.dataset.intervalId = intervalId;
}

function sortPCs(sortBy) {
    let sortedData = [...originalPCData]; // Selalu gunakan data asli sebagai dasar
    
    switch(sortBy) {
        case 'default':
            // Urutkan berdasarkan nomor PC (1-30)
            sortedData.sort((a, b) => a.id - b.id);
            break;
            
        case 'kosong':
            // Filter hanya PC dengan status kosong
            sortedData = sortedData.filter(pc => pc.status === 'kosong');
            break;
            
        case 'dipakai':
            // Filter hanya PC dengan status dipakai
            sortedData = sortedData.filter(pc => pc.status === 'dipakai');
            break;
            
        case 'perbaikan':
            // Filter hanya PC dengan status perbaikan
            sortedData = sortedData.filter(pc => pc.status === 'perbaikan');
            break;
            
        case 'time':
            // Filter hanya PC dipakai dan urutkan berdasarkan waktu tersisa
            sortedData = sortedData.filter(pc => pc.status === 'dipakai');
            sortedData.sort((a, b) => {
                const timeA = timeToMs(a.time);
                const timeB = timeToMs(b.time);
                return timeA - timeB; // Yang paling cepat habis muncul pertama
            });
            break;
            
        default:
            // Default: urutkan berdasarkan nomor PC
            sortedData.sort((a, b) => a.id - b.id);
    }
    
    // Perbarui pcData dengan data yang sudah difilter/diurutkan
    pcData = sortedData;
    renderPCCards();
}