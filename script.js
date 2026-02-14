// ======================================
// ДАННЫЕ
// ======================================
let links = JSON.parse(localStorage.getItem('swordLinks')) || [];
let stats = JSON.parse(localStorage.getItem('swordStats')) || {
    totalLinks: 0,
    totalClicks: 0,
    browsers: { Chrome: 0, Firefox: 0, Safari: 0, Other: 0 }
};

// ======================================
// СОЗДАНИЕ КОРОТКОЙ ССЫЛКИ
// ======================================
function createShortUrl() {
    let longUrl = document.getElementById('longUrl').value;
    if (!longUrl) return alert('❌ Вставь ссылку!');
    
    let swordClass = document.getElementById('swordClass').value;
    let ttl = document.getElementById('ttl').value || 24;
    let selfDestruct = document.getElementById('selfDestruct').checked;
    
    // Генерируем код меча
    let codes = ['⚔️', '🔥', '❄️', '☠️', '🗡️', '🛡️', '👑', '💀'];
    let randomCode = codes[Math.floor(Math.random() * codes.length)] + 
                     Math.random().toString(36).substring(2, 6).toUpperCase();
    
    let newLink = {
        id: Date.now(),
        long: longUrl,
        short: randomCode,
        class: swordClass,
        created: new Date().toLocaleString(),
        expires: Date.now() + (ttl * 60 * 60 * 1000),
        selfDestruct: selfDestruct,
        clicks: 0,
        browsers: []
    };
    
    links.push(newLink);
    stats.totalLinks++;
    localStorage.setItem('swordLinks', JSON.stringify(links));
    localStorage.setItem('swordStats', JSON.stringify(stats));
    
    // Показываем результат
    document.getElementById('shortUrl').textContent = window.location.origin + '/' + randomCode;
    document.getElementById('result').style.display = 'block';
    
    // Генерация QR-кода (простая заглушка)
    document.getElementById('qrCode').innerHTML = '⚔️ QR КОД МЕЧА ⚔️';
    
    updateStats();
}

// ======================================
// ПЕРЕХОД ПО ССЫЛКЕ (эмуляция)
// ======================================
function redirectToLong(shortCode) {
    let link = links.find(l => l.short === shortCode);
    if (!link) return alert('❌ Меч сломан!');
    
    // Проверка времени жизни
    if (link.expires < Date.now()) {
        links = links.filter(l => l.short !== shortCode);
        localStorage.setItem('swordLinks', JSON.stringify(links));
        return alert('❌ Меч рассыпался от времени!');
    }
    
    // Самоуничтожение
    if (link.selfDestruct) {
        links = links.filter(l => l.short !== shortCode);
        localStorage.setItem('swordLinks', JSON.stringify(links));
    }
    
    // Статистика
    link.clicks++;
    stats.totalClicks++;
    
    // Определяем браузер (упрощенно)
    let ua = navigator.userAgent;
    if (ua.includes('Chrome')) stats.browsers.Chrome++;
    else if (ua.includes('Firefox')) stats.browsers.Firefox++;
    else if (ua.includes('Safari')) stats.browsers.Safari++;
    else stats.browsers.Other++;
    
    localStorage.setItem('swordLinks', JSON.stringify(links));
    localStorage.setItem('swordStats', JSON.stringify(stats));
    
    // Редирект
    window.location.href = link.long;
}

// ======================================
// ПОКАЗ СТРАНИЦ
// ======================================
function showPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(page + 'Page').classList.add('active');
    
    if (page === 'my') showMyLinks();
    if (page === 'stats') showStats();
}

// ======================================
// МОИ ССЫЛКИ
// ======================================
function showMyLinks() {
    let html = '';
    links.sort((a,b) => b.id - a.id).forEach(link => {
        let expiresIn = Math.floor((link.expires - Date.now()) / (1000 * 60 * 60));
        html += `
            <div class="link-item">
                <div class="link-info">
                    <div class="link-original">${link.long.substring(0,50)}...</div>
                    <div class="link-short">⚔️ ${link.short}</div>
                    <div class="link-stats">
                        <span>👁️ ${link.clicks}</span>
                        <span>⏰ ${expiresIn}ч</span>
                        <span>${link.selfDestruct ? '💣' : '🔒'}</span>
                    </div>
                </div>
                <button class="copy-btn" onclick="copyToClipboard('${link.short}')">📋</button>
            </div>
        `;
    });
    document.getElementById('linksList').innerHTML = html || '<p style="color:#888;">Нет мечей</p>';
}

// ======================================
// СТАТИСТИКА
// ======================================
function showStats() {
    document.getElementById('totalLinks').textContent = stats.totalLinks;
    document.getElementById('totalClicks').textContent = stats.totalClicks;
    document.getElementById('activeLinks').textContent = links.length;
    
    // График битвы браузеров
    let chart = document.getElementById('battleChart');
    chart.innerHTML = '';
    let max = Math.max(...Object.values(stats.browsers));
    
    for (let browser in stats.browsers) {
        let bar = document.createElement('div');
        bar.className = 'chart-bar';
        bar.setAttribute('data-browser', browser);
        bar.style.height = (stats.browsers[browser] / max * 200) + 'px';
        chart.appendChild(bar);
    }
}

// ======================================
// КОПИРОВАНИЕ
// ======================================
function copyToClipboard(code) {
    let text = window.location.origin + '/' + (code || document.getElementById('shortUrl').textContent.split('/').pop());
    navigator.clipboard.writeText(text);
    alert('✅ Скопировано!');
}

// ======================================
// ОБНОВЛЕНИЕ СТАТИСТИКИ
// ======================================
function updateStats() {
    document.getElementById('totalLinks').textContent = stats.totalLinks;
    document.getElementById('totalClicks').textContent = stats.totalClicks;
    document.getElementById('activeLinks').textContent = links.length;
}

// ======================================
// ПЕРЕХОД ПО КОРОТКОЙ ССЫЛКЕ
// ======================================
let path = window.location.pathname.substring(1);
if (path) {
    redirectToLong(path);
}

// ======================================
// АВТОМАТИЧЕСКАЯ ОЧИСТКА ПРОСРОЧЕННЫХ
// ======================================
setInterval(() => {
    let oldLength = links.length;
    links = links.filter(l => l.expires > Date.now());
    if (links.length !== oldLength) {
        localStorage.setItem('swordLinks', JSON.stringify(links));
        updateStats();
    }
}, 60000); // Каждую минуту

// ======================================
// ЗАПУСК
// ======================================
updateStats();
