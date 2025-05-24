// Configuration
const TOTAL_PCS = 30;
const DEFAULT_STATUS = 'kosong';

// PC Data Model
let pcData = [];
let originalPCData = [];

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
function init() {
    initializePCData();
    renderPCCards();
    setupEventListeners();
}

document.addEventListener('DOMContentLoaded', init);

function initializePCData() {
    for (let i = 1; i <= TOTAL_PCS; i++) {
        pcData.push({
            id: i,
            status: DEFAULT_STATUS,
            username: '',
            time: ''
        });
    }
    originalPCData = [...pcData]; // Simpan salinan data asli
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
            const durationMs = timeToMs(pc.time);
            timerElement.style.display = 'block';
            startCountdown(card, durationMs);
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

function setStatus(status) {
    if (!currentPC) return;

    // This is the first declaration of pcIndex
    const pcIndex = pcData.findIndex(pc => pc.id === currentPC);
    if (pcIndex === -1) return;

    const pc = pcData[pcIndex];
    
    switch(status) {
        case 'kosong':
            pc.status = 'kosong';
            pc.username = '';
            pc.time = '';
            break;
        case 'dipakai':
            pc.status = 'dipakai';
            pc.username = usernameInput.value.trim() || 'Guest';
            pc.time = getBillingTime();
            break;
        case 'perbaikan':
            pc.status = 'perbaikan';
            pc.username = '';
            pc.time = '';
            break;
        case 'stop':
            pc.status = 'kosong';
            pc.username = '';
            pc.time = '';
            break;
    }
    
    // Just reuse the variable or use a different name
    const originalIndex = originalPCData.findIndex(pc => pc.id === currentPC);
    if (originalIndex !== -1) {
        originalPCData[originalIndex] = {...pcData.find(pc => pc.id === currentPC)};
    }

    renderPCCards();
    closeModal();
}

function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function startCountdown(cardElement, durationMs) {
    const timerElement = cardElement.querySelector('.card-timer');
    const endTime = Date.now() + durationMs;

    if (cardElement.dataset.intervalId) {
        clearInterval(cardElement.dataset.intervalId);
    }

    const intervalId = setInterval(() => {
        const remaining = endTime - Date.now();
        if (remaining <= 0) {
            clearInterval(intervalId);
            timerElement.textContent = '00:00:00';
            
            const pcId = parseInt(cardElement.dataset.id);
            const pcIndex = pcData.findIndex(pc => pc.id === pcId);
            if (pcIndex !== -1) {
                pcData[pcIndex].status = 'kosong';
                pcData[pcIndex].username = '';
                pcData[pcIndex].time = '';
                renderPCCards();
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