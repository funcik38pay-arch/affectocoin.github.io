let tg = window.Telegram?.WebApp;
let userId = '';
let userName = 'Player';
let userPhoto = '';
let userCoins = 0;
let userLevel = 1;

const STORAGE_URL = 'https://ваш-сайт.com/storage/';
const DATA_FILE = 'users.json';

let allTimeTop = [];
let monthTop = [];
let weekTop = [];
let userPosition = { allTime: null, month: null, week: null };

const TOP_SIZE = 50;

// Инициализация Telegram
function initTelegram() {
    if (tg) {
        tg.expand();
        tg.ready();
        
        if (tg.initDataUnsafe?.user) {
            const user = tg.initDataUnsafe.user;
            userId = user.id.toString();
            userName = user.first_name || 'Player';
            if (user.last_name) userName += ' ' + user.last_name;
            userPhoto = user.photo_url || '';
        }
        
        localStorage.setItem('user_id', userId);
        localStorage.setItem('user_name', userName);
    }
}

// Загрузка данных пользователя
function loadUserData() {
    const gameData = localStorage.getItem(`affecto_game_${userId}`);
    if (gameData) {
        const data = JSON.parse(gameData);
        userCoins = data.coins || 0;
        userLevel = data.level || 1;
    }
    updateBalance();
}

// Загрузка топов из JSON
async function loadTopsFromJSON() {
    try {
        const response = await fetch(`${STORAGE_URL}${DATA_FILE}`);
        const data = await response.json();
        
        if (data.users) {
            // Сортируем по монетам
            const sorted = [...data.users].sort((a, b) => b.coins - a.coins);
            
            allTimeTop = sorted.map(user => ({
                id: user.id,
                name: user.name,
                photo: user.photo,
                coins: user.coins,
                level: user.level
            }));
            
            // Для простоты показываем одинаковые топы
            monthTop = [...allTimeTop];
            weekTop = [...allTimeTop];
            
            renderTops();
            findUserPosition();
        }
    } catch (error) {
        console.error('Ошибка загрузки топов:', error);
        loadTopsFromLocal();
    }
}

// Загрузка топов из localStorage
function loadTopsFromLocal() {
    const users = [];
    
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        if (key && key.startsWith('affecto_game_')) {
            try {
                const data = JSON.parse(localStorage.getItem(key));
                const playerId = key.replace('affecto_game_', '');
                
                users.push({
                    id: playerId,
                    name: data.name || `Player_${playerId.substring(0, 4)}`,
                    photo: data.photo || '',
                    coins: data.coins || 0,
                    level: data.level || 1
                });
            } catch (e) {}
        }
    }
    
    users.sort((a, b) => b.coins - a.coins);
    
    allTimeTop = [...users];
    monthTop = [...users];
    weekTop = [...users];
    
    renderTops();
    findUserPosition();
}

// Обновление баланса
function updateBalance() {
    const el = document.getElementById('balance');
    if (el) {
        el.textContent = formatNumber(userCoins);
    }
}

// Форматирование чисел
function formatNumber(num) {
    if (num < 1000) {
        return num.toString();
    } else if (num < 1000000) {
        return (num / 1000).toFixed(1) + 'K';
    } else {
        return (num / 1000000).toFixed(1) + 'M';
    }
}

// Поиск позиции пользователя
function findUserPosition() {
    const allTimeIndex = allTimeTop.findIndex(u => u.id === userId);
    const monthIndex = monthTop.findIndex(u => u.id === userId);
    const weekIndex = weekTop.findIndex(u => u.id === userId);
    
    userPosition = {
        allTime: allTimeIndex !== -1 ? allTimeIndex + 1 : null,
        month: monthIndex !== -1 ? monthIndex + 1 : null,
        week: weekIndex !== -1 ? weekIndex + 1 : null
    };
    
    renderUserPosition();
}

// Рендер позиции пользователя
function renderUserPosition() {
    const container = document.getElementById('you-position');
    if (!container) return;
    
    const activeTab = document.querySelector('.tab.active')?.textContent.includes('KINGS') ? 'kings' :
                      document.querySelector('.tab.active')?.textContent.includes('MONTH') ? 'month' : 'week';
    
    let position, list;
    if (activeTab === 'kings') {
        position = userPosition.allTime;
        list = allTimeTop;
    } else if (activeTab === 'month') {
        position = userPosition.month;
        list = monthTop;
    } else {
        position = userPosition.week;
        list = weekTop;
    }
    
    if (!position) {
        container.innerHTML = '<div class="empty-state">Вы пока не в топе</div>';
        return;
    }
    
    const userData = list.find(u => u.id === userId);
    if (!userData) return;
    
    const initial = userData.name.charAt(0).toUpperCase();
    const rankClass = position === 1 ? 'rank-1' : position === 2 ? 'rank-2' : position === 3 ? 'rank-3' : '';
    
    container.innerHTML = `
        <div class="top-item" style="background: rgba(255,215,0,0.15); border: 2px solid gold;">
            <div class="top-rank ${rankClass}">#${position}</div>
            <div class="top-avatar">
                ${userPhoto ? `<img src="${userPhoto}" alt="avatar">` : initial}
            </div>
            <div class="top-info">
                <div class="top-name">${userData.name} (Вы)</div>
                <div class="top-score">
                    <img src="img/coin.png" alt="coin">
                    ${formatNumber(userData.coins)}
                </div>
                <div style="font-size: 0.8rem; color: #666;">Уровень ${userData.level}</div>
            </div>
        </div>
    `;
}

// Рендер топов
function renderTops() {
    renderTopList('kings-list', allTimeTop.slice(0, TOP_SIZE));
    renderTopList('month-list', monthTop.slice(0, TOP_SIZE));
    renderTopList('week-list', weekTop.slice(0, TOP_SIZE));
}

function renderTopList(containerId, list) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (!list || list.length === 0) {
        container.innerHTML = '<div class="empty-state">Пока нет игроков</div>';
        return;
    }
    
    let html = '';
    list.forEach((user, index) => {
        const rank = index + 1;
        const rankClass = rank === 1 ? 'rank-1' : rank === 2 ? 'rank-2' : rank === 3 ? 'rank-3' : '';
        const initial = user.name.charAt(0).toUpperCase();
        const isCurrentUser = user.id === userId;
        
        html += `
            <div class="top-item" ${isCurrentUser ? 'style="background: rgba(255,215,0,0.1); border: 1px solid gold;"' : ''}>
                <div class="top-rank ${rankClass}">#${rank}</div>
                <div class="top-avatar">
                    ${user.photo ? `<img src="${user.photo}" alt="avatar">` : initial}
                </div>
                <div class="top-info">
                    <div class="top-name">${user.name} ${isCurrentUser ? '(Вы)' : ''}</div>
                    <div class="top-score">
                        <img src="img/coin.png" alt="coin">
                        ${formatNumber(user.coins)}
                    </div>
                    <div style="font-size: 0.8rem; color: #666;">Уровень ${user.level}</div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Переключение табов
function switchTab(tab, event) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    
    document.getElementById('kings-section').classList.add('hidden');
    document.getElementById('month-section').classList.add('hidden');
    document.getElementById('week-section').classList.add('hidden');
    
    if (tab === 'kings') {
        document.getElementById('kings-section').classList.remove('hidden');
    } else if (tab === 'month') {
        document.getElementById('month-section').classList.remove('hidden');
    } else {
        document.getElementById('week-section').classList.remove('hidden');
    }
    
    renderUserPosition();
}

// Инициализация
function init() {
    initTelegram();
    loadUserData();
    loadTopsFromJSON();
    
    window.addEventListener('storage', (e) => {
        if (e.key === `affecto_game_${userId}`) {
            loadUserData();
            loadTopsFromLocal();
        }
    });
}

window.switchTab = switchTab;
document.addEventListener('DOMContentLoaded', init);