const catalog = document.getElementById("catalog");
const brandFilter = document.getElementById("brandFilter");
const modelFilter = document.getElementById("modelFilter");
const searchInput = document.getElementById("searchInput");

let products = [];
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let compare = JSON.parse(localStorage.getItem("compare")) || [];

/* ===================== */
/* SAVE */
/* ===================== */
function save() {
    localStorage.setItem("cart", JSON.stringify(cart));
    localStorage.setItem("compare", JSON.stringify(compare));
}

/* ===================== */
/* COUNTERS */
/* ===================== */
function updateCounters() {

    const cartBadge = document.querySelector("#cartBtn .tool-count");
    const compareBadge = document.querySelector("#compareBtn .tool-count");

    const qty = cart.reduce((sum, item) => sum + item.qty, 0);
    const compareCount = compare.length;

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

/* ===================== */
/* FILTER */
/* ===================== */
function getFilteredProducts() {

    const search = (searchInput.value || "").toLowerCase();
    const brand = brandFilter.value;
    const model = modelFilter.value;

    return products.filter(item => {

        const searchMatch =
            item.name.toLowerCase().includes(search) ||
            item.article.toLowerCase().includes(search);

        const brandMatch = !brand || item.brand === brand;
        const modelMatch = !model || item.model === model;

        return searchMatch && brandMatch && modelMatch;
    });
}

/* ===================== */
/* UI REFRESH */
/* ===================== */
function refreshUI() {
    save();
    updateCounters();
    render(getFilteredProducts());
}

function refreshCardUI(id) {
    save();
    updateCounters();
    updateCard(id);
}

/* ===================== */
/* CART */
/* ===================== */
function inCart(id) {
    return cart.find(i => i.id === id);
}

function addToCart(id) {
    const item = cart.find(i => i.id === id);

    if (item) item.qty++;
    else cart.push({ id, qty: 1 });

    refreshCardUI(id);
}

function increaseQty(id) {
    const item = cart.find(i => i.id === id);
    if (!item) return;

    item.qty++;
    refreshCardUI(id);
}

function decreaseQty(id) {
    const item = cart.find(i => i.id === id);
    if (!item) return;

    item.qty--;

    if (item.qty <= 0) {
        cart = cart.filter(i => i.id !== id);
    }

    refreshCardUI(id);
}

/* ===================== */
/* COMPARE */
/* ===================== */
function inCompare(id) {
    return compare.includes(id);
}

function toggleCompare(id) {

    if (inCompare(id)) {
        compare = compare.filter(i => i !== id);
    } else {
        compare.push(id);
    }

    refreshCardUI(id);
}

/* ===================== */
/* LOAD */
/* ===================== */
async function loadProducts() {

    try {
        const res = await fetch("./data/parts.json");
        products = await res.json();

        fillBrands();
        fillModels();
        render(products);
        updateCounters();

    } catch (e) {
        console.error(e);
        catalog.innerHTML = "<h2>Ошибка загрузки товаров</h2>";
    }
}

/* ===================== */
/* FILTER HELPERS */
/* ===================== */
function fillBrands() {

    const brands = [...new Set(products.map(i => i.brand))].sort();

    brandFilter.innerHTML = `<option value="">Все бренды</option>`;

    brands.forEach(b => {
        const opt = document.createElement("option");
        opt.value = b;
        opt.textContent = b;
        brandFilter.appendChild(opt);
    });
}

function fillModels() {

    modelFilter.innerHTML = `<option value="">Все модели</option>`;

    const selectedBrand = brandFilter.value;

    const models = [...new Set(
        products
            .filter(i => !selectedBrand || i.brand === selectedBrand)
            .map(i => i.model)
    )].sort();

    models.forEach(m => {
        const opt = document.createElement("option");
        opt.value = m;
        opt.textContent = m;
        modelFilter.appendChild(opt);
    });
}

/* ===================== */
/* FILTER EVENTS */
/* ===================== */
function filterProducts() {
    render(getFilteredProducts());
}

/* ===================== */
/* CARD UPDATE */
/* ===================== */
function updateCard(id) {
    const card = document.querySelector(`.card[data-id="${id}"]`);
    if (!card) return;

    const cartItem = inCart(id);
    const compareItem = inCompare(id);
    const cardIcons = card.querySelector(".card-icons");

    if (!cardIcons) return;

    cardIcons.innerHTML = `
        ${
            cartItem
                ? `
                <div class="qty-box">
                    <button class="qty-btn minus" data-id="${id}">−</button>
                    <span class="qty-value">${cartItem.qty}</span>
                    <button class="qty-btn plus" data-id="${id}">+</button>
                </div>
                `
                : `
                <img class="card-icon cart-action"
                    data-id="${id}"
                    src="images/basket_add.svg"
                    alt="Корзина">
                `
        }

        <div class="card-icon compare-action ${compareItem ? "active" : ""}"
            data-id="${id}">
            <img src="images/compare.svg" alt="Сравнение">
        </div>
    `;

    bindCardEvents(cardIcons);
}

function bindCardEvents(root) {
    root.querySelectorAll(".cart-action").forEach(btn => {
        btn.onclick = e => {
            e.stopPropagation();
            addToCart(+btn.dataset.id);
        };
    });

    root.querySelectorAll(".plus").forEach(btn => {
        btn.onclick = e => {
            e.stopPropagation();
            increaseQty(+btn.dataset.id);
        };
    });

    root.querySelectorAll(".minus").forEach(btn => {
        btn.onclick = e => {
            e.stopPropagation();
            decreaseQty(+btn.dataset.id);
        };
    });

    root.querySelectorAll(".compare-action").forEach(btn => {
        btn.onclick = e => {
            e.stopPropagation();
            toggleCompare(+btn.dataset.id);
        };
    });
}

/* ===================== */
/* RENDER */
/* ===================== */
function render(items) {

    catalog.innerHTML = "";

    if (!items.length) {
        catalog.innerHTML = `<div class="empty">Товары не найдены</div>`;
        return;
    }

    items.forEach(item => {

        const image = item.images?.[0] || "images/no-image.jpg";
        const cartItem = inCart(item.id);
        const compareItem = inCompare(item.id);

        catalog.innerHTML += `
<div class="card" data-id="${item.id}">

    <img src="${image}" alt="${item.name}">

    <div class="card-content">

        <h3>${item.name}</h3>

        <p>Марка: ${item.brand}</p>
        <p>Модель: ${item.model}</p>
        <p>Артикул: ${item.article}</p>
        <p>Наличие: ${item.stock} шт.</p>

        <div class="card-bottom">

            <div class="price">
                ${Number(item.price).toLocaleString("ru-RU")} ₽
            </div>

            <div class="card-icons">

                ${
                    cartItem
                    ? `
                    <div class="qty-box">
                        <button class="qty-btn minus" data-id="${item.id}">−</button>
                        <span class="qty-value">${cartItem.qty}</span>
                        <button class="qty-btn plus" data-id="${item.id}">+</button>
                    </div>
                    `
                    : `
                    <img class="card-icon cart-action"
                        data-id="${item.id}"
                        src="images/basket_add.svg"
                        alt="Корзина">
                    `
                }

                <div class="card-icon compare-action ${compareItem ? 'active' : ''}"
                    data-id="${item.id}">
                    <img src="images/compare.svg" alt="Сравнение">
                </div>

            </div>

        </div>

        <a href="product.html?id=${item.id}" class="btn">
            Подробнее
        </a>

    </div>

</div>`;
    });

    /* EVENTS */
    bindCardEvents(catalog);
}

/* ===================== */
/* EVENTS */
/* ===================== */
brandFilter.addEventListener("change", () => {
    fillModels();
    filterProducts();
});

modelFilter.addEventListener("change", filterProducts);
searchInput.addEventListener("input", filterProducts);

/* ===================== */
/* START */
/* ===================== */
loadProducts();