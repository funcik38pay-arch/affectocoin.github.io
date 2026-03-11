document.addEventListener('DOMContentLoaded', () => {
    // Элементы интерфейса
    const characterContainer = document.querySelector('.character-container');
    const characterImg = document.querySelector('.main-character');
    const scoreSpan = document.querySelector('.score');
    const energyFill = document.querySelector('.progress-fill');
    const levelSpan = document.querySelector('.level-badge span');
    const avatarImg = document.querySelector('.avatar');
    const energyText = document.getElementById('energyText');
    const usernameSpan = document.querySelector('.username');
    
    // НАЧАЛЬНЫЕ ЗНАЧЕНИЯ
    let coins = 0;
    let energy = 1000;
    let maxEnergy = 1000;
    let currentLevel = 1;
    let maxLevelAchieved = 1;
    let clickPower = 1;
    let rechargeSpeed = 1;
    let activeSkin = 'skin_1';
    
    // Telegram данные
    let tg = window.Telegram?.WebApp;
    let tgUser = null;

    // Скины за уровни
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

    // ПОРОГИ УРОВНЕЙ
    const levelThresholds = {
        1: 0, 2: 100, 3: 300, 4: 600, 5: 650000,
        6: 700000, 7: 750000, 8: 800000, 9: 900000, 10: 1000000,
        11: 2000000, 12: 3000000, 13: 5000000, 14: 8000000, 15: 10000000,
        16: 11000000, 17: 12000000, 18: 13000000, 19: 14000000, 20: 15000000,
        21: 16000000, 22: 17000000, 23: 18000000, 24: 20000000, 25: 22000000,
        26: 24000000, 27: 26000000, 28: 28000000, 29: 30000000, 30: 35977977,
        31: 38000000, 32: 40000000, 33: 42000000, 34: 45000000, 35: 50767767,
        36: 55000000, 37: 60000000, 38: 65000000, 39: 70000000, 40: 72000000,
        41: 73000000, 42: 74000000, 43: 75000000, 44: 76000000, 45: 77777777,
        46: 80000000, 47: 82000000, 48: 84000000, 49: 86000000, 50: 88888888,
        51: 90000000, 52: 91000000, 53: 92000000, 54: 93000000, 55: 94000000,
        56: 95000000, 57: 96000000, 58: 97000000, 59: 98000000, 60: 100000000
    };

    // ИНИЦИАЛИЗАЦИЯ TELEGRAM
    function initTelegram() {
        if (tg) {
            tg.expand();
            tg.ready();
            
            if (tg.initDataUnsafe?.user) {
                const user = tg.initDataUnsafe.user;
                tgUser = {
                    id: user.id.toString(),
                    firstName: user.first_name || 'Player',
                    lastName: user.last_name || '',
                    username: user.username || '',
                    photoUrl: user.photo_url || ''
                };
                
                if (usernameSpan) {
                    usernameSpan.textContent = tgUser.firstName;
                }
                
                if (tgUser.photoUrl && avatarImg) {
                    avatarImg.src = tgUser.photoUrl;
                }
                
                localStorage.setItem('tg_user', JSON.stringify(tgUser));
                localStorage.setItem('user_id', tgUser.id);
            }
        }
    }

    // ЗАГРУЗКА ИЗ LOCALSTORAGE
    function loadFromLocalStorage() {
        try {
            const userId = tgUser?.id || localStorage.getItem('user_id') || 'guest';
            const saved = localStorage.getItem(`affecto_game_${userId}`);
            
            if (saved) {
                const data = JSON.parse(saved);
                coins = data.coins || 0;
                energy = data.energy || 1000;
                maxEnergy = data.maxEnergy || 1000;
                clickPower = data.clickPower || 1;
                rechargeSpeed = data.rechargeSpeed || 1;
                currentLevel = data.level || 1;
                maxLevelAchieved = data.maxLevel || currentLevel;
                activeSkin = data.activeSkin || 'skin_1';
            }
            
            // Загружаем бустеры
            const boostSaved = localStorage.getItem('affecto_boosts');
            if (boostSaved) {
                const boostData = JSON.parse(boostSaved);
                applyBoosts(boostData.boostLevels);
            }
            
            // Обновляем скин
            const skin = levelSkins.find(s => s.id === activeSkin);
            if (skin && skin.image) {
                characterImg.src = `img/${skin.image}`;
                if (!tgUser?.photoUrl) {
                    avatarImg.src = `img/${skin.image}`;
                }
            }
            
            updateUI();
        } catch (e) {
            console.error('Ошибка загрузки из localStorage:', e);
        }
    }

    // СОХРАНЕНИЕ В LOCALSTORAGE
    function saveToLocalStorage() {
        try {
            const userId = tgUser?.id || localStorage.getItem('user_id') || 'guest';
            const gameData = {
                coins: coins,
                level: currentLevel,
                maxLevel: maxLevelAchieved,
                energy: energy,
                maxEnergy: maxEnergy,
                clickPower: clickPower,
                rechargeSpeed: rechargeSpeed,
                activeSkin: activeSkin,
                lastSaved: Date.now()
            };
            localStorage.setItem(`affecto_game_${userId}`, JSON.stringify(gameData));
            
            // Синхронизируем с другими разделами
            syncWithOtherSections();
        } catch (e) {
            console.error('Ошибка сохранения в localStorage:', e);
        }
    }
    
    // СИНХРОНИЗАЦИЯ С ДРУГИМИ РАЗДЕЛАМИ
    function syncWithOtherSections() {
        // Обновляем данные в skins
        const skinsData = localStorage.getItem('affecto_skins');
        if (skinsData) {
            try {
                const data = JSON.parse(skinsData);
                if (data.active !== activeSkin) {
                    data.active = activeSkin;
                    localStorage.setItem('affecto_skins', JSON.stringify(data));
                }
            } catch (e) {}
        }
        
        // Обновляем данные в boosts
        const boostsData = localStorage.getItem('affecto_boosts');
        if (boostsData) {
            try {
                const data = JSON.parse(boostsData);
                let needUpdate = false;
                
                if (data.boostLevels) {
                    if (data.boostLevels.multitap && clickPower !== boostData.multitap[data.boostLevels.multitap]?.power) {
                        needUpdate = true;
                    }
                }
                
                if (needUpdate) {
                    localStorage.setItem('affecto_boosts', JSON.stringify(data));
                }
            } catch (e) {}
        }
    }

    // ПРИМЕНЕНИЕ БУСТЕРОВ
    function applyBoosts(boosts) {
        const multitapPowers = {1:1,2:2,3:3,4:4,5:5,6:7,7:10,8:15,9:20,10:25,11:30};
        const energyLimits = {1:500,2:1000,3:2000,4:3000,5:4000,6:5000,7:8000,8:10000,9:13000,10:15000,11:18000,12:22000,13:25000,14:28000,15:35000};
        const rechargeSpeeds = {1:1,2:2,3:3,4:4,5:5};
        
        if (boosts?.multitap) {
            clickPower = multitapPowers[boosts.multitap] || 1;
        }
        if (boosts?.energyLimit) {
            maxEnergy = energyLimits[boosts.energyLimit] || 1000;
            if (energy > maxEnergy) energy = maxEnergy;
        }
        if (boosts?.rechargeSpeed) {
            rechargeSpeed = rechargeSpeeds[boosts.rechargeSpeed] || 1;
        }
    }

    // ФОРМАТИРОВАНИЕ ЧИСЕЛ
    function formatNumber(num) {
        if (num < 1000) {
            return num.toString();
        } else if (num < 1000000) {
            return (num / 1000).toFixed(1) + 'K';
        } else {
            return (num / 1000000).toFixed(1) + 'M';
        }
    }

    // ОБНОВЛЕНИЕ UI
    function updateUI() {
        scoreSpan.textContent = formatNumber(coins);
        
        const percent = (energy / maxEnergy) * 100;
        energyFill.style.width = percent + '%';
        if (energyText) energyText.textContent = `${Math.floor(energy)}/${maxEnergy}`;
        
        if (energy < 200) {
            energyFill.style.background = 'linear-gradient(90deg, #FF4444, #FF8844)';
        } else if (energy < 500) {
            energyFill.style.background = 'linear-gradient(90deg, #FF8844, #FFD700)';
        } else {
            energyFill.style.background = 'linear-gradient(90deg, #FFB347, #FFD700, #FFE55C)';
        }
        
        checkLevelUp();
        levelSpan.textContent = `${currentLevel} Уровень`;
        
        saveToLocalStorage();
    }

    // ПРОВЕРКА УРОВНЯ
    function checkLevelUp() {
        let newLevel = 1;
        const levels = Object.keys(levelThresholds).map(Number).sort((a, b) => a - b);
        
        for (let level of levels) {
            if (coins >= levelThresholds[level]) {
                newLevel = level;
            } else {
                break;
            }
        }
        
        if (newLevel > currentLevel) {
            currentLevel = newLevel;
            if (newLevel > maxLevelAchieved) {
                maxLevelAchieved = newLevel;
            }
            levelSpan.textContent = `${currentLevel} Уровень`;
            showLevelUpEffect(currentLevel);
            
            // Проверяем открытие скинов
            checkSkinUnlock(newLevel);
            return true;
        }
        return false;
    }

    // ПРОВЕРКА СКИНОВ
    function checkSkinUnlock(level) {
        const skinsData = localStorage.getItem('affecto_skins');
        if (skinsData) {
            try {
                const data = JSON.parse(skinsData);
                let owned = data.owned || ['skin_1'];
                let changed = false;
                
                levelSkins.forEach(skin => {
                    if (level >= skin.required && !owned.includes(skin.id)) {
                        owned.push(skin.id);
                        changed = true;
                    }
                });
                
                if (changed) {
                    localStorage.setItem('affecto_skins', JSON.stringify({
                        ...data,
                        owned: owned
                    }));
                }
            } catch (e) {}
        }
    }

    // ЭФФЕКТ ПОВЫШЕНИЯ УРОВНЯ
    function showLevelUpEffect(newLevel) {
        const msg = document.createElement('div');
        msg.textContent = `⬆️ УРОВЕНЬ ${newLevel} ⬆️`;
        msg.style.cssText = `
            position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
            color: #FFD700; font-size: clamp(24px, 8vw, 36px); font-weight: 900;
            text-shadow: 0 0 30px gold; background: rgba(0,0,0,0.8);
            padding: clamp(15px, 4vw, 20px) clamp(25px, 6vw, 40px);
            border-radius: 60px; border: 3px solid gold; z-index: 2000;
            animation: levelUp 1.5s ease-out forwards;
        `;
        characterContainer.appendChild(msg);
        setTimeout(() => msg.remove(), 1500);
    }

    // ВСПЛЫВАЮЩИЕ ЦИФРЫ
    function createFloatingNumber(x, y, value) {
        const floating = document.createElement('div');
        floating.textContent = `+${value}`;
        floating.style.cssText = `
            position: absolute; color: #FFD700; font-size: clamp(32px, 10vw, 54px);
            font-weight: 900; text-shadow: 0 0 20px gold; left: ${x}px; top: ${y}px;
            transform: translate(-50%, -50%); pointer-events: none; z-index: 1000;
            animation: floatUp 1.2s ease-out forwards;
        `;
        characterContainer.appendChild(floating);
        setTimeout(() => floating.remove(), 1100);
    }

    // СТИЛИ АНИМАЦИЙ
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes floatUp {
            0% { opacity: 1; transform: translate(-50%, -50%) scale(0.8); }
            100% { opacity: 0; transform: translate(-50%, -180%) scale(1.8); }
        }
        @keyframes levelUp {
            0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
            20% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
            80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            100% { opacity: 0; transform: translate(-50%, -80%) scale(0.8); }
        }
        @keyframes fadeOut {
            0% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            70% { opacity: 0.7; transform: translate(-50%, -50%) scale(1.1); }
            100% { opacity: 0; transform: translate(-50%, -50%) scale(1.3); }
        }
    `;
    document.head.appendChild(style);

    // ОБРАБОТКА КЛИКА
    characterContainer.addEventListener('click', (e) => {
        const rect = characterContainer.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        characterImg.style.transform = 'scale(0.82)';
        setTimeout(() => characterImg.style.transform = 'scale(1)', 100);

        if (energy > 0) {
            // Проверяем TURBO режим
            const turbo = JSON.parse(localStorage.getItem('turbo_mode') || '{}');
            let power = clickPower;
            if (turbo.active && turbo.expires > Date.now()) {
                power = clickPower * 3;
            }
            
            coins += power;
            energy -= 1;
            createFloatingNumber(x, y, power);
            if (navigator.vibrate) navigator.vibrate(20);
            checkLevelUp();
        } else {
            const msg = document.createElement('div');
            msg.textContent = '⚡ NO ENERGY ⚡';
            msg.style.cssText = `
                position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
                color: #FF4444; font-size: clamp(20px, 6vw, 28px); font-weight: 900;
                text-shadow: 0 0 20px red; background: rgba(0,0,0,0.7);
                padding: 15px 25px; border-radius: 50px; border: 2px solid red;
                z-index: 1000; animation: fadeOut 1s forwards;
            `;
            characterContainer.appendChild(msg);
            setTimeout(() => msg.remove(), 1000);
        }

        updateUI();
    });

    // РЕГЕНЕРАЦИЯ ЭНЕРГИИ
    setInterval(() => {
        if (energy < maxEnergy) {
            energy = Math.min(energy + rechargeSpeed, maxEnergy);
            updateUI();
        }
    }, 5000);

    // СЛУШАЕМ ИЗМЕНЕНИЯ
    window.addEventListener('storage', (e) => {
        const userId = tgUser?.id || localStorage.getItem('user_id') || 'guest';
        if (e.key === `affecto_game_${userId}`) {
            loadFromLocalStorage();
            updateUI();
        }
    });

    // ЗАПУСК
    initTelegram();
    setTimeout(() => {
        loadFromLocalStorage();
    }, 100);
});