let userCoins = 0;
let userLevel = 1;
let referralCount = 0;
let completedQuests = [];

const defaultQuests = [
    { id: 'tg_channel', type: 'social', name: 'Join TG Channel', desc: '@affectocoin', reward: 200000, link: 'https://t.me/affectocoin', icon: '📱', checkable: true },
    { id: 'invite_10', type: 'social', name: 'Invite 10 Frens', desc: 'Пригласи 10 друзей', reward: 5000000, icon: '👥', checkable: false, progressType: 'referral' },
    { id: 'level_5', type: 'level', name: 'Reach Level 5', desc: 'Достигни 5 уровня', reward: 350000, requirement: 5, icon: '⭐' },
    { id: 'level_10', type: 'level', name: 'Reach Level 10', desc: 'Достигни 10 уровня', reward: 350000, requirement: 10, icon: '⭐' },
    { id: 'level_15', type: 'level', name: 'Reach Level 15', desc: 'Достигни 15 уровня', reward: 450000, requirement: 15, icon: '⭐' },
    { id: 'level_20', type: 'level', name: 'Reach Level 20', desc: 'Достигни 20 уровня', reward: 550000, requirement: 20, icon: '⭐' },
    { id: 'level_25', type: 'level', name: 'Reach Level 25', desc: 'Достигни 25 уровня', reward: 650000, requirement: 25, icon: '⭐' },
    { id: 'level_30', type: 'level', name: 'Reach Level 30', desc: 'Достигни 30 уровня', reward: 750000, requirement: 30, icon: '⭐' },
    { id: 'level_35', type: 'level', name: 'Reach Level 35', desc: 'Достигни 35 уровня', reward: 850000, requirement: 35, icon: '⭐' },
    { id: 'level_40', type: 'level', name: 'Reach Level 40', desc: 'Достигни 40 уровня', reward: 950000, requirement: 40, icon: '⭐' },
    { id: 'level_50', type: 'level', name: 'Reach Level 50', desc: 'Достигни 50 уровня', reward: 1250000, requirement: 50, icon: '⭐' },
    { id: 'level_60', type: 'level', name: 'Reach Level 60', desc: 'Достигни 60 уровня', reward: 1500000, requirement: 60, icon: '⭐' },
    { id: 'coin_1m', type: 'coin', name: 'Earn 1M coins', desc: 'Заработай 1,000,000 монет', reward: 250000, requirement: 1000000, icon: '💰' },
    { id: 'coin_10m', type: 'coin', name: 'Earn 10M coins', desc: 'Заработай 10,000,000 монет', reward: 750000, requirement: 10000000, icon: '💰' },
    { id: 'coin_50m', type: 'coin', name: 'Earn 50M coins', desc: 'Заработай 50,000,000 монет', reward: 1500000, requirement: 50000000, icon: '💰' },
    { id: 'coin_100m', type: 'coin', name: 'Earn 100M coins', desc: 'Заработай 100,000,000 монет', reward: 5000000, requirement: 100000000, icon: '💰' }
];

function loadData() {
    try {
        const userId = localStorage.getItem('user_id') || 'guest';
        const gameData = localStorage.getItem(`affecto_game_${userId}`);
        
        if (gameData) {
            const data = JSON.parse(gameData);
            userCoins = data.coins || 0;
            userLevel = data.level || 1;
        }
        
        const referrals = localStorage.getItem('affecto_referrals');
        if (referrals) {
            referralCount = parseInt(referrals) || 0;
        }
        
        const completed = localStorage.getItem('affecto_completed_quests');
        if (completed) {
            completedQuests = JSON.parse(completed);
        } else {
            completedQuests = [];
        }
        
        const questsSaved = localStorage.getItem('affecto_quests');
        if (questsSaved) {
            window.questsData = JSON.parse(questsSaved);
        } else {
            window.questsData = [...defaultQuests];
            saveQuests();
        }
        
        updateBalance();
        renderQuests();
        updateReferralProgress();
        
    } catch (e) {
        console.error('Ошибка загрузки:', e);
    }
}

function saveQuests() {
    localStorage.setItem('affecto_quests', JSON.stringify(window.questsData));
}

function saveCompletedQuests() {
    localStorage.setItem('affecto_completed_quests', JSON.stringify(completedQuests));
}

function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

function updateBalance() {
    const balanceEl = document.getElementById('balance');
    if (balanceEl) {
        balanceEl.textContent = formatNumber(userCoins);
    }
}

function claimReward(questId) {
    const quest = window.questsData.find(q => q.id === questId);
    if (!quest) return;
    
    if (completedQuests.includes(questId)) return;
    
    userCoins += quest.reward;
    
    const userId = localStorage.getItem('user_id') || 'guest';
    const gameData = localStorage.getItem(`affecto_game_${userId}`);
    if (gameData) {
        const game = JSON.parse(gameData);
        game.coins = userCoins;
        localStorage.setItem(`affecto_game_${userId}`, JSON.stringify(game));
    }
    
    completedQuests.push(questId);
    saveCompletedQuests();
    
    updateBalance();
    renderQuests();
    showNotification(`+${formatNumber(quest.reward)} монет!`);
}

function handleSocialQuest(quest) {
    if (completedQuests.includes(quest.id)) return;
    
    if (quest.checkable && quest.link) {
        window.open(quest.link, '_blank');
        
        let pendingChecks = JSON.parse(localStorage.getItem('pending_quest_checks') || '{}');
        pendingChecks[quest.id] = true;
        localStorage.setItem('pending_quest_checks', JSON.stringify(pendingChecks));
        
        renderQuests();
        showNotification('Перейдите в канал и нажмите "Проверить"', 'info');
    } else {
        copyReferralLink();
    }
}

function checkSocialQuest(questId) {
    const quest = window.questsData.find(q => q.id === questId);
    if (!quest) return;
    
    claimReward(questId);
    
    let pendingChecks = JSON.parse(localStorage.getItem('pending_quest_checks') || '{}');
    delete pendingChecks[questId];
    localStorage.setItem('pending_quest_checks', JSON.stringify(pendingChecks));
}

function copyReferralLink() {
    const userId = getUserId();
    const link = `https://t.me/your_bot?start=${userId}`;
    
    navigator.clipboard.writeText(link).then(() => {
        showNotification('Ссылка скопирована!', 'success');
    }).catch(() => {
        const textarea = document.createElement('textarea');
        textarea.value = link;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showNotification('Ссылка скопирована!', 'success');
    });
}

function getUserId() {
    let userId = localStorage.getItem('user_id');
    if (!userId) {
        userId = 'user_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('user_id', userId);
    }
    return userId;
}

function updateReferralProgress() {
    const countEl = document.getElementById('referralCount');
    const progressEl = document.getElementById('referralProgress');
    
    if (countEl) countEl.textContent = referralCount;
    if (progressEl) progressEl.style.width = Math.min(100, (referralCount / 10 * 100)) + '%';
    
    if (referralCount >= 10 && !completedQuests.includes('invite_10')) {
        claimReward('invite_10');
    }
}

function addReferral() {
    referralCount++;
    localStorage.setItem('affecto_referrals', referralCount.toString());
    updateReferralProgress();
    renderQuests();
}

function renderQuests() {
    if (!window.questsData) return;
    
    const socialContainer = document.getElementById('socialQuests');
    const levelContainer = document.getElementById('levelQuests');
    const coinContainer = document.getElementById('coinQuests');
    
    const pendingChecks = JSON.parse(localStorage.getItem('pending_quest_checks') || '{}');
    
    if (socialContainer) {
        socialContainer.innerHTML = window.questsData
            .filter(q => q.type === 'social')
            .map(quest => renderQuestCard(quest, pendingChecks))
            .join('');
    }
    
    if (levelContainer) {
        levelContainer.innerHTML = window.questsData
            .filter(q => q.type === 'level')
            .map(quest => renderQuestCard(quest, pendingChecks))
            .join('');
    }
    
    if (coinContainer) {
        coinContainer.innerHTML = window.questsData
            .filter(q => q.type === 'coin')
            .map(quest => renderQuestCard(quest, pendingChecks))
            .join('');
    }
}

function renderQuestCard(quest, pendingChecks) {
    const isCompleted = completedQuests.includes(quest.id);
    const isPending = pendingChecks[quest.id];
    
    let canClaim = false;
    if (!isCompleted) {
        if (quest.type === 'level') {
            canClaim = userLevel >= quest.requirement;
        } else if (quest.type === 'coin') {
            canClaim = userCoins >= quest.requirement;
        } else if (quest.type === 'social') {
            if (quest.id === 'invite_10') {
                canClaim = referralCount >= 10;
            }
        }
    }
    
    let buttonHtml = '';
    
    if (isCompleted) {
        buttonHtml = `<div class="quest-btn completed">✓ Получено</div>`;
    } else if (isPending) {
        buttonHtml = `<div class="quest-btn check" onclick="checkSocialQuest('${quest.id}')">Проверить</div>`;
    } else if (quest.type === 'social' && quest.checkable) {
        buttonHtml = `<div class="quest-btn" onclick="handleSocialQuest(${JSON.stringify(quest).replace(/"/g, '&quot;')})">Выполнить</div>`;
    } else if (quest.type === 'social' && quest.id === 'invite_10') {
        if (referralCount >= 10) {
            buttonHtml = `<div class="quest-btn" onclick="claimReward('${quest.id}')">Получить</div>`;
        } else {
            buttonHtml = `<div class="quest-btn locked">${referralCount}/10</div>`;
        }
    } else if (canClaim) {
        buttonHtml = `<div class="quest-btn" onclick="claimReward('${quest.id}')">Получить</div>`;
    } else {
        buttonHtml = `<div class="quest-btn locked">Выполните</div>`;
    }
    
    return `
        <div class="quest-card" id="quest-${quest.id}">
            <div class="quest-icon">${quest.icon || '🎯'}</div>
            <div class="quest-info">
                <div class="quest-title">${quest.name}</div>
                <div class="quest-desc">${quest.desc}</div>
                <div class="quest-reward">
                    <img src="img/coin.png" alt="coin">
                    +${formatNumber(quest.reward)}
                </div>
            </div>
            ${buttonHtml}
        </div>
    `;
}

function showNotification(text, type = 'success') {
    const notification = document.createElement('div');
    notification.textContent = text;
    notification.style.position = 'fixed';
    notification.style.bottom = '100px';
    notification.style.left = '50%';
    notification.style.transform = 'translateX(-50%)';
    notification.style.backgroundColor = type === 'success' ? 'rgba(0,150,0,0.95)' : 
                                        type === 'error' ? 'rgba(200,0,0,0.95)' : 
                                        'rgba(0,100,200,0.95)';
    notification.style.color = 'white';
    notification.style.padding = '15px 30px';
    notification.style.borderRadius = '50px';
    notification.style.fontWeight = 'bold';
    notification.style.zIndex = '10001';
    notification.style.border = '2px solid gold';
    notification.style.animation = 'fadeOut 2s forwards';
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 2000);
}

function toggleAdminPanel() {
    const panel = document.getElementById('adminPanel');
    if (panel) {
        panel.classList.toggle('hidden');
    }
}

function addQuest() {
    const type = document.getElementById('questType')?.value;
    const name = document.getElementById('questName')?.value;
    const desc = document.getElementById('questDesc')?.value;
    const reward = parseInt(document.getElementById('questReward')?.value);
    const link = document.getElementById('questLink')?.value;
    const requirement = parseInt(document.getElementById('questRequirement')?.value);
    
    if (!name || !reward) {
        alert('Заполните обязательные поля!');
        return;
    }
    
    const id = name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') + '_' + Date.now();
    
    const newQuest = {
        id: id,
        type: type,
        name: name,
        desc: desc || '',
        reward: reward,
        icon: type === 'social' ? '📱' : type === 'level' ? '⭐' : '💰'
    };
    
    if (type === 'social') {
        if (link) {
            newQuest.link = link;
            newQuest.checkable = true;
        } else {
            newQuest.checkable = false;
        }
    }
    
    if (requirement) {
        newQuest.requirement = requirement;
    }
    
    window.questsData.push(newQuest);
    saveQuests();
    renderQuests();
    
    document.getElementById('questName').value = '';
    document.getElementById('questDesc').value = '';
    document.getElementById('questReward').value = '200000';
    document.getElementById('questLink').value = '';
    document.getElementById('questRequirement').value = '';
    
    showNotification('Задание добавлено!');
}

function exportQuests() {
    const data = {
        quests: window.questsData,
        completed: completedQuests,
        exportDate: new Date().toISOString()
    };
    
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `quests_backup_${Date.now()}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    showNotification('Задания экспортированы!');
}

function importQuests() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                
                if (data.quests && Array.isArray(data.quests)) {
                    window.questsData = data.quests;
                    if (data.completed) {
                        completedQuests = data.completed;
                        saveCompletedQuests();
                    }
                    saveQuests();
                    renderQuests();
                    showNotification('Задания импортированы!');
                } else {
                    alert('Неверный формат файла!');
                }
            } catch (err) {
                alert('Ошибка при импорте!');
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

function resetToDefault() {
    if (confirm('Сбросить все задания к настройкам по умолчанию?')) {
        window.questsData = [...defaultQuests];
        completedQuests = [];
        saveQuests();
        saveCompletedQuests();
        renderQuests();
        showNotification('Задания сброшены!');
    }
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
    loadData();
    
    window.toggleAdminPanel = toggleAdminPanel;
    window.addQuest = addQuest;
    window.exportQuests = exportQuests;
    window.importQuests = importQuests;
    window.resetToDefault = resetToDefault;
    window.handleSocialQuest = handleSocialQuest;
    window.claimReward = claimReward;
    window.checkSocialQuest = checkSocialQuest;
    
    document.getElementById('addQuestBtn')?.addEventListener('click', addQuest);
    document.getElementById('exportQuestsBtn')?.addEventListener('click', exportQuests);
    document.getElementById('importQuestsBtn')?.addEventListener('click', importQuests);
    document.getElementById('resetQuestsBtn')?.addEventListener('click', resetToDefault);
    document.getElementById('closeAdminBtn')?.addEventListener('click', toggleAdminPanel);
    document.getElementById('adminToggle')?.addEventListener('click', toggleAdminPanel);
}

document.addEventListener('DOMContentLoaded', init);