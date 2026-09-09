const compareList = document.getElementById("compareList");

let products = [];

function getCompareItems() {
    return App.getCompare()
        .map(id => products.find(item => item.id === id))
        .filter(Boolean);
}

function getStockClass(stock) {
    if (stock > 5) return "in-stock";
    return "low-stock";
}

function render() {
    App.updateCounters();

    const items = getCompareItems();

    if (!items.length) {
        compareList.innerHTML = `
        <div class="empty">
            <div class="empty-icon">⚖️</div>
            <h3>Список сравнения пуст</h3>
            <p>Добавьте товары из каталога для сравнения характеристик</p>
            <a href="index.html" class="btn btn-order" style="max-width:280px;margin:20px auto 0;">Перейти в каталог</a>
        </div>`;
        return;
    }

    compareList.innerHTML = items.map((item, i) => `
        <article class="page-card" style="animation-delay:${i * .05}s">
            <img src="${item.images?.[0] || "images/no-image.svg"}" alt="${item.name}" loading="lazy" onerror="this.onerror=null;this.src='images/no-image.svg';">
            <div class="page-card-body">
                <h3>${item.name}</h3>
                <p>Марка: ${item.brand}</p>
                <p>Модель: ${item.model}</p>
                <p>Артикул: ${item.article}</p>
                ${item.oem ? `<p>OEM: ${item.oem}</p>` : ""}
                <span class="badge-stock ${getStockClass(item.stock)}">${item.stock > 5 ? "В наличии" : `Осталось ${item.stock} шт.`}</span>
                <div class="page-card-footer">
                    <div>
                        <div class="price">${App.formatPrice(item.price)} <span class="currency">₽</span></div>
                        ${item.oldPrice ? `<span class="old-price">${App.formatPrice(item.oldPrice)} ₽</span>` : ""}
                    </div>
                    <button class="btn add-cart-btn" data-id="${item.id}" style="margin-top:0;max-width:160px;">В корзину</button>
                </div>
                <button class="btn btn-danger remove-btn" data-id="${item.id}">Удалить</button>
            </div>
        </article>
    `).join("");

    bindEvents();
}

function bindEvents() {
    document.querySelectorAll(".add-cart-btn").forEach(btn => {
        btn.onclick = () => {
            App.addToCart(+btn.dataset.id);
            btn.textContent = "Добавлено ✓";
            setTimeout(() => { btn.textContent = "В корзину"; }, 1000);
        };
    });

    document.querySelectorAll(".remove-btn").forEach(btn => {
        btn.onclick = () => {
            App.removeFromCompare(+btn.dataset.id);
            render();
        };
    });
}

async function load() {
    try {
        const res = await fetch("./data/parts.json");
        products = await res.json();
        render();
    } catch (e) {
        console.error(e);
        compareList.innerHTML = `
        <div class="empty">
            <div class="empty-icon">⚠️</div>
            <h3>Ошибка загрузки</h3>
            <p>Не удалось загрузить данные</p>
        </div>`;
    }
}

load();