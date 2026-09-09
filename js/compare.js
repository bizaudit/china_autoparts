const compareList = document.getElementById("compareList");

let products = [];
let compare = JSON.parse(localStorage.getItem("compare")) || [];

function save() {
    localStorage.setItem("compare", JSON.stringify(compare));
}

function updateCounters() {
    const cartBadge = document.querySelector("#cartBtn .tool-count");
    const compareBadge = document.querySelector("#compareBtn .tool-count");

    const cartQty = (JSON.parse(localStorage.getItem("cart") || "[]")).reduce((sum, item) => sum + item.qty, 0);
    const compareCount = compare.length;

    if (cartBadge) {
        const cartText = cartQty > 99 ? "99+" : cartQty;
        cartBadge.textContent = cartText;
        cartBadge.style.display = cartQty ? "flex" : "none";
        cartBadge.classList.toggle("large", String(cartText).length > 1);
    }

    if (compareBadge) {
        const compareText = compareCount > 99 ? "99+" : compareCount;
        compareBadge.textContent = compareText;
        compareBadge.style.display = compareCount ? "flex" : "none";
        compareBadge.classList.toggle("large", String(compareText).length > 1);
    }
}

function getCompareItems() {
    return compare
        .map(id => products.find(item => item.id === id))
        .filter(Boolean);
}

function render() {
    save();
    updateCounters();

    const items = getCompareItems();

    if (!items.length) {
        compareList.innerHTML = `
        <div class="empty">
            <div class="empty-icon">⚖️</div>
            <h3>Список сравнения пуст</h3>
            <p>Добавьте товары из каталога для сравнения характеристик</p>
            <a href="index.html" class="btn" style="max-width:280px;margin:20px auto 0;">Перейти в каталог</a>
        </div>`;
        return;
    }

    compareList.innerHTML = items.map((item, i) => `
        <article class="page-card" style="animation-delay:${i * .05}s">
            <img src="${item.images?.[0] || "images/no-image.jpg"}" alt="${item.name}">
            <div class="page-card-body">
                <h3>${item.name}</h3>
                <p>Марка: ${item.brand}</p>
                <p>Модель: ${item.model}</p>
                <p>Артикул: ${item.article}</p>
                <div class="page-card-footer">
                    <div class="price">${Number(item.price).toLocaleString("ru-RU")} <span class="currency">₽</span></div>
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
        btn.onclick = () => addToCart(+btn.dataset.id);
    });

    document.querySelectorAll(".remove-btn").forEach(btn => {
        btn.onclick = () => removeFromCompare(+btn.dataset.id);
    });
}

function addToCart(id) {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existing = cart.find(item => item.id === id);
    if (existing) existing.qty++;
    else cart.push({ id, qty: 1 });
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCounters();
}

function removeFromCompare(id) {
    compare = compare.filter(itemId => itemId !== id);
    render();
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
