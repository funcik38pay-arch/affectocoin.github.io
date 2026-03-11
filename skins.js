let tg = window.Telegram?.WebApp;
let userId = '';
let userName = 'Player';
let userCoins = 0;
let userLevel = 1;
let isOwner = false;

// Данные скинов
const levelSkins = [
    { id: 'skin_1', name: '1 lvl', level: 1, image: '1_lvl.png', required: 1 },
    { id: 'skin_5', name: '5 lvl', level: 5, image: '5_lvl.png', required: 5 },
    { id: 'skin_10', name: '10 lvl', level: 10, image: '10_lvl.png', required: 10 },
    { id: 'skin_15', name: '15 lvl', level: 15, image: '15_lvl.png', required: 15 },
    { id: 'skin_20', name: '20 lvl', level: 20, image: '20_lvl.png', required: 20 },
    { id: 'skin_25', name: '25 lvl', level: 25, image: '25_lvl.png', required: 25 },
    { id: 'skin_30', name: '30 lvl', level: 30, image: '30_lvl.png', required: 30 },
    { id: 'skin_35', name: '35 lvl', level: 35, image: '35_lvl.png', required: 35 },
    { id: 'skin_45', name: '45 lvl', level: 45, image: '45_lvl.png', required: 45 },
    { id: 'skin_50', name: '50 lvl', level: 50, image: '50_lvl.png', required: 50 }
];

let customSkins = [];
let ownedSkins = ['skin_1'];
let activeSkin = 'skin_1';

// ID владельца (ЗАМЕНИТЕ НА СВОЙ TELEGRAM ID)
const OWNER_ID = '123456789'; // Узнайте свой ID у @userinfobot

function initTelegram() {
    if (tg) {
        tg.expand();
        tg.ready();
        
        if (tg.initDataUnsafe?.user) {
            const user = tg.initDataUnsafe.user;
            userId = user.id.toString();
            userName = user.first_name || 'Player';
            if (user.last_name) userName += ' ' + user.last_name;
            isOwner = (userId === OWNER_ID);
        }
        
        localStorage.setItem('user_id', userId);
        localStorage.setItem('user_name', userName);
    }
}

function loadData() {
    try {
        // Загружаем данные игры
        const userId = localStorage.getItem('user_id') || 'guest';
        const gameData = localStorage.getItem(`affecto_game_${userId}`);
        
        if (gameData) {
            const data = JSON.parse(gameData);
            userCoins = data.coins || 0;
            userLevel = data.level || 1;
        }
        
        // Загружаем скины
        const skinsData = localStorage.getItem('affecto_skins');
        if (skinsData) {
            const data = JSON.parse(skinsData);
            ownedSkins = data.owned || ['skin_1'];
            activeSkin = data.active || 'skin_1';
            customSkins = data.custom || [];
        }
        
        // Автоматически получаем скины за достигнутые уровни
        let changed = false;
        levelSkins.forEach(skin => {
            if (userLevel >= skin.required && !ownedSkins.includes(skin.id)) {
                ownedSkins.push(skin.id);
                changed = true;
            }
        });
        
        if (changed) {
            saveData();
            showNotification('✨ Получены новые скины!');
        }
        
        updateBalance();
        renderSkins();
        updateStats();
        
    } catch (e) {
        console.error('Ошибка загрузки:', e);
    }
}

function saveData() {
    try {
        const data = {
            owned: ownedSkins,
            active: activeSkin,
            custom: customSkins
        };
        localStorage.setItem('affecto_skins', JSON.stringify(data));
        
        // Синхронизируем с главной игрой
        const userId = localStorage.getItem('user_id') || 'guest';
        const gameData = localStorage.getItem(`affecto_game_${userId}`);
        if (gameData) {
            const game = JSON.parse(gameData);
            game.activeSkin = activeSkin;
            localStorage.setItem(`affecto_game_${userId}`, JSON.stringify(game));
        }
    } catch (e) {
        console.error('Ошибка сохранения:', e);
    }
}

function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

function updateBalance() {
    const el = document.getElementById('balance');
    if (el) el.textContent = formatNumber(userCoins);
}

function updateStats() {
    document.getElementById('ownedCount').textContent = ownedSkins.length;
    document.getElementById('totalCount').textContent = levelSkins.length + customSkins.length;
    
    let nextLevel = userLevel + 1;
    for (let skin of levelSkins) {
        if (skin.required > userLevel && !ownedSkins.includes(skin.id)) {
            nextLevel = skin.required;
            break;
        }
    }
    document.getElementById('nextLevel').textContent = nextLevel;
}

function renderSkins() {
    const grid = document.getElementById('levelSkinsGrid');
    if (!grid) return;
    
    const allSkins = [...levelSkins, ...customSkins];
    
    if (allSkins.length === 0) {
        grid.innerHTML = '<div class="empty-state">Скины пока не добавлены</div>';
        return;
    }
    
    allSkins.sort((a, b) => a.required - b.required);
    
    let html = '';
    allSkins.forEach(skin => {
        const isOwned = ownedSkins.includes(skin.id);
        const isActive = activeSkin === skin.id;
        const isAvailable = userLevel >= skin.required;
        
        let statusClass = 'status-locked';
        let statusText = `🔒 Уровень ${skin.required}`;
        
        if (isOwned) {
            if (isActive) {
                statusClass = 'status-active';
                statusText = '✨ ЭКИПИРОВАН';
            } else {
                statusClass = 'status-owned';
                statusText = '✓ ПОЛУЧЕН';
            }
        } else if (isAvailable) {
            statusClass = 'status-owned';
            statusText = '🎁 ДОСТУПЕН';
        }
        
        let cardClass = 'skin-card';
        if (isOwned) cardClass += ' owned';
        if (isActive) cardClass += ' active';
        if (!isOwned && !isAvailable) cardClass += ' locked';
        
        html += `
            <div class="${cardClass}">
                <div class="skin-level-badge">УРОВЕНЬ ${skin.required}</div>
                <img src="img/${skin.image}" alt="${skin.name}" class="skin-image" onerror="this.src='img/1_lvl.png'">
                <div class="skin-name">${skin.name}</div>
                <div class="skin-level">Уровень ${skin.level}</div>
                <div class="skin-status ${statusClass}">${statusText}</div>
                ${isOwned && !isActive ? 
                    `<button class="equip-btn owned" onclick="equipSkin('${skin.id}')">ЭКИПИРОВАТЬ</button>` : 
                    isOwned && isActive ? 
                    `<button class="equip-btn" style="background:#4CAF50; color:white;" disabled>ЭКИПИРОВАН</button>` : 
                    `<button class="equip-btn" disabled>${isAvailable ? 'ДОСТУПЕН' : 'ЗАБЛОКИРОВАН'}</button>`
                }
            </div>
        `;
    });
    
    grid.innerHTML = html;
    
    if (isOwner) {
        document.getElementById('adminToggle').classList.remove('hidden');
    }
}

function equipSkin(skinId) {
    if (!ownedSkins.includes(skinId)) return;
    
    activeSkin = skinId;
    saveData();
    renderSkins();
    showNotification('✅ Скин экипирован!');
}

function showNotification(text, type = 'success') {
    const notification = document.createElement('div');
    notification.textContent = text;
    notification.style.cssText = `
        position: fixed; bottom: 100px; left: 50%; transform: translateX(-50%);
        background: ${type === 'success' ? 'rgba(0,150,0,0.95)' : 'rgba(200,0,0,0.95)'};
        color: white; padding: 15px 30px; border-radius: 50px; font-weight: bold;
        z-index: 10001; border: 2px solid gold; animation: fadeOut 2s forwards;
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 2000);
}

function toggleAdminPanel() {
    const panel = document.getElementById('adminPanel');
    panel.classList.toggle('hidden');
}

function addSkin() {
    const name = document.getElementById('skinName').value;
    const level = parseInt(document.getElementById('skinLevel').value);
    const image = document.getElementById('skinImage').value;
    
    if (!name || !level || !image) {
        showNotification('Заполните все поля!', 'error');
        return;
    }
    
    const newSkin = {
        id: 'custom_' + Date.now(),
        name: name,
        level: level,
        image: image,
        required: level,
        isCustom: true
    };
    
    customSkins.push(newSkin);
    saveData();
    renderSkins();
    updateStats();
    
    document.getElementById('skinName').value = '';
    document.getElementById('skinLevel').value = '';
    document.getElementById('skinImage').value = '';
    
    toggleAdminPanel();
    showNotification('✅ Скин добавлен!');
}

const style = document.createElement('style');
style.innerHTML = `
    @keyframes fadeOut {
        0% { opacity: 1; transform: translateX(-50%) scale(1); }
        70% { opacity: 1; transform: translateX(-50%) scale(1); }
        100% { opacity: 0; transform: translateX(-50%) scale(0.9); }
    }
`;
document.head.appendChild(style);

function init() {
    initTelegram();
    loadData();
    
    window.addEventListener('storage', (e) => {
        if (e.key === `affecto_game_${userId}` || e.key === 'affecto_skins') {
            loadData();
        }
    });
}

window.equipSkin = equipSkin;
window.toggleAdminPanel = toggleAdminPanel;
window.addSkin = addSkin;

document.addEventListener('DOMContentLoaded', init);