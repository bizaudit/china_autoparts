const cartList = document.getElementById("cartList");
const cartSummary = document.getElementById("cartSummary");
const cartTotalQty = document.getElementById("cartTotalQty");
const cartTotalPrice = document.getElementById("cartTotalPrice");
const cartOldTotal = document.getElementById("cartOldTotal");
const cartOrderBtn = document.getElementById("cartOrderBtn");

let products = [];

function getCartItems() {
    return App.getCart()
        .map(entry => {
            const product = products.find(item => item.id === entry.id);
            return product ? { ...product, qty: entry.qty } : null;
        })
        .filter(Boolean);
}

function getStockClass(stock) {
    if (stock > 5) return "in-stock";
    return "low-stock";
}

function computeTotals() {
    const items = getCartItems();
    return {
        items,
        totalQty: items.reduce((sum, item) => sum + item.qty, 0),
        totalPrice: items.reduce((sum, item) => sum + item.price * item.qty, 0),
        oldTotal: items.reduce((sum, item) => sum + ((item.oldPrice || item.price) * item.qty), 0)
    };
}

function renderSummary(t = computeTotals()) {
    if (!cartSummary) return;
    cartSummary.style.display = "block";
    cartTotalQty.textContent = t.totalQty;
    cartTotalPrice.textContent = App.formatPrice(t.totalPrice) + " ₽";
    if (cartOldTotal) {
        if (t.oldTotal > t.totalPrice) {
            cartOldTotal.textContent = App.formatPrice(t.oldTotal) + " ₽";
            cartOldTotal.style.display = "";
        } else {
            cartOldTotal.style.display = "none";
        }
    }
}

function render() {
    App.updateCounters();

    const { items } = computeTotals();

    if (!items.length) {
        cartList.innerHTML = `
        <div class="empty">
            <div class="empty-icon">🛒</div>
            <h3>Корзина пуста</h3>
            <p>Добавьте товары из каталога, чтобы оформить заказ</p>
            <a href="index.html" class="btn btn-order" style="max-width:280px;margin:20px auto 0;">Перейти в каталог</a>
        </div>`;
        if (cartSummary) cartSummary.style.display = "none";
        return;
    }

    cartList.innerHTML = items.map((item, i) => `
        <article class="page-card" style="animation-delay:${i * .05}s">
            <img src="${item.images?.[0] || "images/no-image.svg"}" alt="${item.name}" loading="lazy" onerror="this.onerror=null;this.src='images/no-image.svg';">
            <div class="page-card-body">
                <h3>${item.name}</h3>
                <p>Марка: ${item.brand}</p>
                <p>Модель: ${item.model}</p>
                <p>Артикул: ${item.article}</p>
                <span class="badge-stock ${getStockClass(item.stock)}">${item.stock > 5 ? "В наличии" : `Осталось ${item.stock} шт.`}</span>
                <div class="page-card-footer">
                    <div>
                        <div class="price">${App.formatPrice(item.price)} <span class="currency">₽</span></div>
                        ${item.oldPrice ? `<span class="old-price">${App.formatPrice(item.oldPrice)} ₽</span>` : ""}
                    </div>
                    <div class="qty-box">
                        <button class="qty-btn minus" data-id="${item.id}">−</button>
                        <span class="qty-value" data-id="${item.id}">${item.qty}</span>
                        <button class="qty-btn plus" data-id="${item.id}">+</button>
                    </div>
                </div>
                <button class="btn btn-danger remove-btn" data-id="${item.id}">Удалить</button>
            </div>
        </article>
    `).join("");

    renderSummary();
    bindEvents();
}

function refreshQty(id, button) {
    const item = App.getCart().find(i => i.id === id);
    if (!item) { render(); return; }
    const qtyEl = button.closest(".page-card")?.querySelector(".qty-value");
    if (qtyEl) qtyEl.textContent = item.qty;
    renderSummary();
}

function bindEvents() {
    document.querySelectorAll(".plus").forEach(btn => {
        btn.onclick = () => {
            App.increaseQty(+btn.dataset.id);
            refreshQty(+btn.dataset.id, btn);
        };
    });

    document.querySelectorAll(".minus").forEach(btn => {
        btn.onclick = () => {
            App.decreaseQty(+btn.dataset.id);
            refreshQty(+btn.dataset.id, btn);
        };
    });

    document.querySelectorAll(".remove-btn").forEach(btn => {
        btn.onclick = () => {
            App.removeFromCart(+btn.dataset.id);
            render();
        };
    });
}

async function load() {
    try {
        const res = await fetch("./data/parts.json");
        products = await res.json();
        render();

        if (cartOrderBtn) {
            cartOrderBtn.onclick = () => {
                const items = getCartItems();
                if (!items.length) return;
                App.openOrderModal({
                    items: items.map(i => ({ id: i.id, qty: i.qty })),
                    products
                });
            };
        }

    } catch (e) {
        console.error(e);
        cartList.innerHTML = `
        <div class="empty">
            <div class="empty-icon">⚠️</div>
            <h3>Ошибка загрузки</h3>
            <p>Не удалось загрузить данные</p>
        </div>`;
    }
}

load();