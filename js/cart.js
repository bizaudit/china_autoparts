const cartList = document.getElementById("cartList");

let products = [];
let cart = JSON.parse(localStorage.getItem("cart")) || [];

function save() {
    localStorage.setItem("cart", JSON.stringify(cart));
}

function updateCounters() {
    const cartBadge = document.querySelector("#cartBtn .tool-count");
    const compareBadge = document.querySelector("#compareBtn .tool-count");

    const qty = cart.reduce((sum, item) => sum + item.qty, 0);
    const compareCount = JSON.parse(localStorage.getItem("compare") || "[]").length;

    if (cartBadge) {
        const cartText = qty > 99 ? "99+" : qty;
        cartBadge.textContent = cartText;
        cartBadge.style.display = qty ? "flex" : "none";
        cartBadge.classList.toggle("large", cartText.length > 1);
    }

    if (compareBadge) {
        const compareText = compareCount > 99 ? "99+" : compareCount;
        compareBadge.textContent = compareText;
        compareBadge.style.display = compareCount ? "flex" : "none";
        compareBadge.classList.toggle("large", compareText.length > 1);
    }
}

function getCartItems() {
    return cart
        .map(entry => {
            const product = products.find(item => item.id === entry.id);
            return product ? { ...product, qty: entry.qty } : null;
        })
        .filter(Boolean);
}

function render() {
    save();
    updateCounters();

    const items = getCartItems();

    if (!items.length) {
        cartList.innerHTML = '<div class="empty">Корзина пуста</div>';
        return;
    }

    cartList.innerHTML = items.map(item => `
        <article class="page-card">
            <img src="${item.images?.[0] || "images/no-image.jpg"}" alt="${item.name}">
            <div class="page-card-body">
                <h3>${item.name}</h3>
                <p>Марка: ${item.brand}</p>
                <p>Модель: ${item.model}</p>
                <p>Артикул: ${item.article}</p>
                <div class="page-card-footer">
                    <div class="price">${Number(item.price).toLocaleString("ru-RU")} ₽</div>
                    <div class="qty-box">
                        <button class="qty-btn minus" data-id="${item.id}">−</button>
                        <span class="qty-value">${item.qty}</span>
                        <button class="qty-btn plus" data-id="${item.id}">+</button>
                    </div>
                </div>
                <button class="btn btn-danger remove-btn" data-id="${item.id}">Удалить</button>
            </div>
        </article>
    `).join("");

    bindEvents();
}

function bindEvents() {
    document.querySelectorAll(".plus").forEach(btn => {
        btn.onclick = () => changeQty(+btn.dataset.id, 1);
    });

    document.querySelectorAll(".minus").forEach(btn => {
        btn.onclick = () => changeQty(+btn.dataset.id, -1);
    });

    document.querySelectorAll(".remove-btn").forEach(btn => {
        btn.onclick = () => removeFromCart(+btn.dataset.id);
    });
}

function changeQty(id, delta) {
    const item = cart.find(entry => entry.id === id);
    if (!item) return;

    item.qty += delta;

    if (item.qty <= 0) {
        cart = cart.filter(entry => entry.id !== id);
    }

    render();
}

function removeFromCart(id) {
    cart = cart.filter(entry => entry.id !== id);
    render();
}

async function load() {
    try {
        const res = await fetch("./data/parts.json");
        products = await res.json();
        render();
    } catch (e) {
        console.error(e);
        cartList.innerHTML = '<div class="empty">Не удалось загрузить данные</div>';
    }
}

load();
