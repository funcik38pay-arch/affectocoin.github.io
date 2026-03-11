let userCoins = 0;
let userLevel = 1;
let userEnergy = 1000;
let maxEnergy = 1000;
let clickPower = 1;
let rechargeSpeed = 1;

const boostData = {
    multitap: {
        1: { power: 1, price: 0, isFree: true },
        2: { power: 2, price: 500, levelReq: 1 },
        3: { power: 3, price: 1500, levelReq: 1 },
        4: { power: 4, price: 5000, levelReq: 1 },
        5: { power: 5, price: 10000, levelReq: 1 },
        6: { power: 7, price: 20000, levelReq: 1 },
        7: { power: 10, price: 30000, levelReq: 1 },
        8: { power: 15, price: 70000, levelReq: 1 },
        9: { power: 20, price: 150000, levelReq: 1 },
        10: { power: 25, price: 300000, levelReq: 1 },
        11: { power: 30, price: 500000, levelReq: 1, isMax: true }
    },
    energyLimit: {
        1: { limit: 500, price: 0, isFree: true },
        2: { limit: 1000, price: 3000, levelReq: 1 },
        3: { limit: 2000, price: 5000, levelReq: 1 },
        4: { limit: 3000, price: 10000, levelReq: 1 },
        5: { limit: 4000, price: 20000, levelReq: 1 },
        6: { limit: 5000, price: 35000, levelReq: 1 },
        7: { limit: 8000, price: 55000, levelReq: 1 },
        8: { limit: 10000, price: 75000, levelReq: 1 },
        9: { limit: 13000, price: 100000, levelReq: 1 },
        10: { limit: 15000, price: 157000, levelReq: 1 },
        11: { limit: 18000, price: 200000, levelReq: 1 },
        12: { limit: 22000, price: 300000, levelReq: 1 },
        13: { limit: 25000, price: 450000, levelReq: 1 },
        14: { limit: 28000, price: 600000, levelReq: 1 },
        15: { limit: 35000, price: 900000, levelReq: 1, isMax: true }
    },
    rechargeSpeed: {
        1: { speed: 1, price: 0, isFree: true },
        2: { speed: 2, price: 5000, levelReq: 1 },
        3: { speed: 3, price: 15000, levelReq: 1 },
        4: { speed: 4, price: 30000, levelReq: 1 },
        5: { speed: 5, price: 50000, levelReq: 1, isMax: true }
    },
    autoBot: {
        1: { income: 120000, price: 100000, levelReq: 5 },
        2: { income: 300000, price: 200000, levelReq: 10 },
        3: { income: 450000, price: 300000, levelReq: 13 },
        4: { income: 750000, price: 500000, levelReq: 20 },
        5: { income: 1000000, price: 700000, levelReq: 30, isMax: true }
    }
};

let userBoostLevels = {
    multitap: 1,
    energyLimit: 1,
    rechargeSpeed: 1,
    autoBot: 0
};

let freeBoosters = {
    turbo: { count: 3, lastUsed: null, cooldown: 12 * 60 * 60 * 1000, maxCount: 3 },
    fullEnergy: { count: 5, lastUsed: null, cooldown: 12 * 60 * 60 * 1000, maxCount: 5 }
};

function loadData() {
    try {
        const userId = localStorage.getItem('user_id') || 'guest';
        const gameData = localStorage.getItem(`affecto_game_${userId}`);
        
        if (gameData) {
            const data = JSON.parse(gameData);
            userCoins = data.coins || 0;
            userLevel = data.level || 1;
            userEnergy = data.energy || 1000;
            maxEnergy = data.maxEnergy || 1000;
            clickPower = data.clickPower || 1;
            rechargeSpeed = data.rechargeSpeed || 1;
        }
        
        const boostSaved = localStorage.getItem('affecto_boosts');
        if (boostSaved) {
            const data = JSON.parse(boostSaved);
            userBoostLevels = data.boostLevels || { multitap: 1, energyLimit: 1, rechargeSpeed: 1, autoBot: 0 };
            
            if (data.freeBoosters) {
                freeBoosters = {
                    turbo: { ...freeBoosters.turbo, ...data.freeBoosters.turbo },
                    fullEnergy: { ...freeBoosters.fullEnergy, ...data.freeBoosters.fullEnergy }
                };
            }
        }
        
        updateBalance();
        renderAll();
        updateTimers();
        
    } catch (e) {
        console.error('Ошибка загрузки:', e);
    }
}

function saveData() {
    try {
        localStorage.setItem('affecto_boosts', JSON.stringify({
            boostLevels: userBoostLevels,
            freeBoosters: freeBoosters
        }));
        
        const userId = localStorage.getItem('user_id') || 'guest';
        const game = JSON.parse(localStorage.getItem(`affecto_game_${userId}`) || '{}');
        game.coins = userCoins;
        game.maxEnergy = maxEnergy;
        game.clickPower = clickPower;
        game.rechargeSpeed = rechargeSpeed;
        game.energy = userEnergy;
        
        localStorage.setItem(`affecto_game_${userId}`, JSON.stringify(game));
        
    } catch (e) {
        console.error('Ошибка сохранения:', e);
    }
}

function formatNumber(num) {
    if (num < 1000) return num.toString();
    if (num < 1000000) return (num / 1000).toFixed(1) + 'K';
    return (num / 1000000).toFixed(1) + 'M';
}

function updateBalance() {
    const el = document.getElementById('balance');
    if (el) el.textContent = formatNumber(userCoins);
}

function updateTimers() {
    const turboTimer = document.getElementById('turboTimer');
    const energyTimer = document.getElementById('energyTimer');
    const turboCount = document.getElementById('turboCount');
    const energyCount = document.getElementById('energyCount');
    
    if (!turboTimer || !energyTimer) return;
    
    const now = Date.now();
    
    if (turboCount) turboCount.textContent = freeBoosters.turbo.count;
    if (energyCount) energyCount.textContent = freeBoosters.fullEnergy.count;
    
    if (freeBoosters.turbo.lastUsed && freeBoosters.turbo.count < freeBoosters.turbo.maxCount) {
        const timeLeft = freeBoosters.turbo.cooldown - (now - freeBoosters.turbo.lastUsed);
        
        if (timeLeft > 0) {
            const hours = Math.floor(timeLeft / (60 * 60 * 1000));
            const minutes = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
            const seconds = Math.floor((timeLeft % (60 * 1000)) / 1000);
            turboTimer.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        } else {
            freeBoosters.turbo.count++;
            freeBoosters.turbo.lastUsed = null;
            if (turboCount) turboCount.textContent = freeBoosters.turbo.count;
            turboTimer.textContent = '12:00:00';
            saveData();
        }
    } else {
        turboTimer.textContent = '12:00:00';
    }
    
    if (freeBoosters.fullEnergy.lastUsed && freeBoosters.fullEnergy.count < freeBoosters.fullEnergy.maxCount) {
        const timeLeft = freeBoosters.fullEnergy.cooldown - (now - freeBoosters.fullEnergy.lastUsed);
        
        if (timeLeft > 0) {
            const hours = Math.floor(timeLeft / (60 * 60 * 1000));
            const minutes = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
            const seconds = Math.floor((timeLeft % (60 * 1000)) / 1000);
            energyTimer.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        } else {
            freeBoosters.fullEnergy.count++;
            freeBoosters.fullEnergy.lastUsed = null;
            if (energyCount) energyCount.textContent = freeBoosters.fullEnergy.count;
            energyTimer.textContent = '12:00:00';
            saveData();
        }
    } else {
        energyTimer.textContent = '12:00:00';
    }
}

function renderMultitap() {
    const c = document.getElementById('multitapContainer');
    if (!c) return;
    
    const lvl = userBoostLevels.multitap;
    const next = lvl + 1;
    const d = boostData.multitap;
    
    if (d[lvl].isMax) {
        c.innerHTML = `
            <div class="boost-item">
                <div class="boost-info">
                    <div class="boost-name">Multitap <span>MAX</span></div>
                    <div class="boost-effect">+${d[lvl].power} за клик</div>
                </div>
                <div class="buy-btn disabled">MAX</div>
            </div>
        `;
    } else {
        const canBuy = userCoins >= d[next].price;
        c.innerHTML = `
            <div class="boost-item">
                <div class="boost-info">
                    <div class="boost-name">Multitap <span>${lvl} lvl</span></div>
                    <div class="boost-effect">+${d[lvl].power} за клик</div>
                    <div class="boost-desc">→ +${d[next].power} за клик</div>
                </div>
                <div class="boost-right">
                    <div class="boost-price">
                        <img src="img/coin.png">${formatNumber(d[next].price)}
                    </div>
                    <div class="buy-btn ${canBuy ? '' : 'disabled'}" onclick="buyBoost('multitap', ${next})">
                        Купить
                    </div>
                </div>
            </div>
        `;
    }
}

function renderEnergyLimit() {
    const c = document.getElementById('energyLimitContainer');
    if (!c) return;
    
    const lvl = userBoostLevels.energyLimit;
    const next = lvl + 1;
    const d = boostData.energyLimit;
    
    if (d[lvl].isMax) {
        c.innerHTML = `
            <div class="boost-item">
                <div class="boost-info">
                    <div class="boost-name">Energy Limit <span>MAX</span></div>
                    <div class="boost-effect">⚡ ${formatNumber(d[lvl].limit)}</div>
                </div>
                <div class="buy-btn disabled">MAX</div>
            </div>
        `;
    } else {
        const canBuy = userCoins >= d[next].price;
        c.innerHTML = `
            <div class="boost-item">
                <div class="boost-info">
                    <div class="boost-name">Energy Limit <span>${lvl} lvl</span></div>
                    <div class="boost-effect">⚡ ${formatNumber(d[lvl].limit)}</div>
                    <div class="boost-desc">→ ⚡ ${formatNumber(d[next].limit)}</div>
                </div>
                <div class="boost-right">
                    <div class="boost-price">
                        <img src="img/coin.png">${formatNumber(d[next].price)}
                    </div>
                    <div class="buy-btn ${canBuy ? '' : 'disabled'}" onclick="buyBoost('energyLimit', ${next})">
                        Купить
                    </div>
                </div>
            </div>
        `;
    }
}

function renderRecharge() {
    const c = document.getElementById('rechargeContainer');
    if (!c) return;
    
    const lvl = userBoostLevels.rechargeSpeed;
    const next = lvl + 1;
    const d = boostData.rechargeSpeed;
    
    if (d[lvl].isMax) {
        c.innerHTML = `
            <div class="boost-item">
                <div class="boost-info">
                    <div class="boost-name">Recharge <span>MAX</span></div>
                    <div class="boost-effect">⚡ +${d[lvl].speed}/5сек</div>
                </div>
                <div class="buy-btn disabled">MAX</div>
            </div>
        `;
    } else {
        const canBuy = userCoins >= d[next].price;
        c.innerHTML = `
            <div class="boost-item">
                <div class="boost-info">
                    <div class="boost-name">Recharge <span>${lvl} lvl</span></div>
                    <div class="boost-effect">⚡ +${d[lvl].speed}/5сек</div>
                    <div class="boost-desc">→ +${d[next].speed}/5сек</div>
                </div>
                <div class="boost-right">
                    <div class="boost-price">
                        <img src="img/coin.png">${formatNumber(d[next].price)}
                    </div>
                    <div class="buy-btn ${canBuy ? '' : 'disabled'}" onclick="buyBoost('rechargeSpeed', ${next})">
                        Купить
                    </div>
                </div>
            </div>
        `;
    }
}

function renderAutoBot() {
    const c = document.getElementById('autoBotContainer');
    if (!c) return;
    
    const lvl = userBoostLevels.autoBot;
    const d = boostData.autoBot;
    
    if (lvl === 0) {
        const canBuy = userCoins >= d[1].price && userLevel >= d[1].levelReq;
        c.innerHTML = `
            <div class="boost-item">
                <div class="boost-info">
                    <div class="boost-name">Auto Bot <span>1 lvl</span></div>
                    <div class="boost-effect">🤖 ${formatNumber(d[1].income)}/12ч</div>
                    <div class="boost-desc">Требуется ${d[1].levelReq}+ ур.</div>
                </div>
                <div class="boost-right">
                    <div class="boost-price">
                        <img src="img/coin.png">${formatNumber(d[1].price)}
                    </div>
                    <div class="buy-btn ${canBuy ? '' : 'locked'}" onclick="buyBoost('autoBot', 1)">
                        ${canBuy ? 'Купить' : `${d[1].levelReq} лвл`}
                    </div>
                </div>
            </div>
        `;
    } else if (d[lvl].isMax) {
        c.innerHTML = `
            <div class="boost-item">
                <div class="boost-info">
                    <div class="boost-name">Auto Bot <span>MAX</span></div>
                    <div class="boost-effect">🤖 ${formatNumber(d[lvl].income)}/12ч</div>
                </div>
                <div class="buy-btn disabled">MAX</div>
            </div>
        `;
    } else {
        const next = lvl + 1;
        const canBuy = userCoins >= d[next].price && userLevel >= d[next].levelReq;
        c.innerHTML = `
            <div class="boost-item">
                <div class="boost-info">
                    <div class="boost-name">Auto Bot <span>${lvl} lvl</span></div>
                    <div class="boost-effect">🤖 ${formatNumber(d[lvl].income)}/12ч</div>
                    <div class="boost-desc">→ 🤖 ${formatNumber(d[next].income)}/12ч</div>
                </div>
                <div class="boost-right">
                    <div class="boost-price">
                        <img src="img/coin.png">${formatNumber(d[next].price)}
                    </div>
                    <div class="buy-btn ${canBuy ? '' : 'locked'}" onclick="buyBoost('autoBot', ${next})">
                        ${canBuy ? 'Купить' : `${d[next].levelReq} лвл`}
                    </div>
                </div>
            </div>
        `;
    }
}

function renderAll() {
    renderMultitap();
    renderEnergyLimit();
    renderRecharge();
    renderAutoBot();
}

function buyBoost(type, level) {
    if (type === 'multitap' && userCoins >= boostData.multitap[level].price) {
        userCoins -= boostData.multitap[level].price;
        userBoostLevels.multitap = level;
        clickPower = boostData.multitap[level].power;
        showNotification(`Multitap улучшен до +${clickPower}!`);
    } else if (type === 'energyLimit' && userCoins >= boostData.energyLimit[level].price) {
        userCoins -= boostData.energyLimit[level].price;
        userBoostLevels.energyLimit = level;
        maxEnergy = boostData.energyLimit[level].limit;
        showNotification(`Лимит энергии увеличен до ${formatNumber(maxEnergy)}!`);
    } else if (type === 'rechargeSpeed' && userCoins >= boostData.rechargeSpeed[level].price) {
        userCoins -= boostData.rechargeSpeed[level].price;
        userBoostLevels.rechargeSpeed = level;
        rechargeSpeed = boostData.rechargeSpeed[level].speed;
        showNotification(`Скорость восстановления +${rechargeSpeed}!`);
    } else if (type === 'autoBot' && userCoins >= boostData.autoBot[level].price && userLevel >= boostData.autoBot[level].levelReq) {
        userCoins -= boostData.autoBot[level].price;
        userBoostLevels.autoBot = level;
        showNotification(`Автокликер куплен! Доход ${formatNumber(boostData.autoBot[level].income)}/12ч`);
    } else {
        showNotification('Недостаточно монет или низкий уровень!', 'error');
        return;
    }
    
    updateBalance();
    renderAll();
    saveData();
}

function initFreeBoosters() {
    const turbo = document.getElementById('useTurbo');
    const energy = document.getElementById('useEnergy');
    
    if (turbo) {
        turbo.addEventListener('click', () => {
            if (freeBoosters.turbo.count > 0) {
                freeBoosters.turbo.count--;
                freeBoosters.turbo.lastUsed = Date.now();
                
                localStorage.setItem('turbo_mode', JSON.stringify({
                    active: true,
                    expires: Date.now() + 30000,
                    multiplier: 3
                }));
                
                document.getElementById('turboCount').textContent = freeBoosters.turbo.count;
                saveData();
                showNotification('⚡ TURBO x3 активирован на 30 секунд!');
            }
        });
    }
    
    if (energy) {
        energy.addEventListener('click', () => {
            if (freeBoosters.fullEnergy.count > 0) {
                freeBoosters.fullEnergy.count--;
                freeBoosters.fullEnergy.lastUsed = Date.now();
                
                const userId = localStorage.getItem('user_id') || 'guest';
                const game = JSON.parse(localStorage.getItem(`affecto_game_${userId}`) || '{}');
                game.energy = game.maxEnergy || 1000;
                localStorage.setItem(`affecto_game_${userId}`, JSON.stringify(game));
                
                document.getElementById('energyCount').textContent = freeBoosters.fullEnergy.count;
                saveData();
                showNotification('🔋 Энергия полностью восстановлена!');
            }
        });
    }
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

function init() {
    loadData();
    renderAll();
    initFreeBoosters();
    
    setInterval(updateTimers, 1000);
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

document.addEventListener('DOMContentLoaded', init);
window.buyBoost = buyBoost;