const catalog = document.getElementById("catalog");
const brandFilter = document.getElementById("brandFilter");
const modelFilter = document.getElementById("modelFilter");
const searchInput = document.getElementById("searchInput");

let products = [];
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let compare = JSON.parse(localStorage.getItem("compare")) || [];

function save() {
    localStorage.setItem("cart", JSON.stringify(cart));
    localStorage.setItem("compare", JSON.stringify(compare));
}

function updateCounters() {
    const cartBadge = document.querySelector("#cartBtn .tool-count");
    const compareBadge = document.querySelector("#compareBtn .tool-count");

    const qty = cart.reduce((sum, item) => sum + item.qty, 0);
    const compareCount = compare.length;

    if (cartBadge) {
        const cartText = qty > 99 ? "99+" : qty;
        cartBadge.textContent = cartText;
        cartBadge.style.display = qty ? "flex" : "none";
        cartBadge.classList.toggle("large", String(cartText).length > 1);
    }

    if (compareBadge) {
        const compareText = compareCount > 99 ? "99+" : compareCount;
        compareBadge.textContent = compareText;
        compareBadge.style.display = compareCount ? "flex" : "none";
        compareBadge.classList.toggle("large", String(compareText).length > 1);
    }
}

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

function getStockClass(stock) {
    if (stock > 5) return 'in-stock';
    if (stock > 0) return 'low-stock';
    return 'in-stock';
}

function getStockText(stock) {
    if (stock > 5) return 'В наличии';
    if (stock > 0) return `Осталось ${stock} шт.`;
    return 'В наличии';
}

const CART_SVG = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>`;

const COMPARE_SVG = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3h5v5"/><path d="M8 3H3v5"/><path d="M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3"/><path d="m15 9 6-6"/></svg>`;

function renderCartIcons(id, cartItem, compareItem) {
    let html = '';

    if (cartItem) {
        html += `
        <div class="qty-box">
            <button class="qty-btn minus" data-id="${id}">−</button>
            <span class="qty-value">${cartItem.qty}</span>
            <button class="qty-btn plus" data-id="${id}">+</button>
        </div>`;
    } else {
        html += `
        <div class="card-icon cart-action" data-id="${id}">
            ${CART_SVG}
        </div>`;
    }

    html += `
    <div class="card-icon compare-action ${compareItem ? 'active' : ''}" data-id="${id}">
        ${COMPARE_SVG}
    </div>`;

    return html;
}

function updateCard(id) {
    const card = document.querySelector(`.card[data-id="${id}"]`);
    if (!card) return;

    const cartItem = inCart(id);
    const compareItem = inCompare(id);
    const cardIcons = card.querySelector(".card-icons");
    if (!cardIcons) return;

    cardIcons.innerHTML = renderCartIcons(id, cartItem, compareItem);
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
        catalog.innerHTML = `
        <div class="empty">
            <div class="empty-icon">⚠️</div>
            <h3>Ошибка загрузки</h3>
            <p>Не удалось загрузить каталог товаров</p>
        </div>`;
    }
}

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

function filterProducts() {
    render(getFilteredProducts());
}

function render(items) {
    catalog.innerHTML = "";

    if (!items.length) {
        catalog.innerHTML = `
        <div class="empty">
            <div class="empty-icon">🔍</div>
            <h3>Товары не найдены</h3>
            <p>Попробуйте изменить параметры поиска</p>
        </div>`;
        return;
    }

    items.forEach(item => {
        const image = item.images?.[0] || "images/no-image.jpg";
        const cartItem = inCart(item.id);
        const compareItem = inCompare(item.id);

        catalog.innerHTML += `
<div class="card" data-id="${item.id}" style="animation-delay:${items.indexOf(item) * .05}s">

    <img src="${image}" alt="${item.name}">

    <div class="card-content">

        <h3>${item.name}</h3>

        <p><strong>Марка:</strong> ${item.brand}</p>
        <p><strong>Модель:</strong> ${item.model}</p>
        <p><strong>Артикул:</strong> ${item.article}</p>

        <span class="badge-stock ${getStockClass(item.stock)}">${getStockText(item.stock)}</span>

        <div class="card-bottom">

            <div class="price">
                ${Number(item.price).toLocaleString("ru-RU")} <span class="currency">₽</span>
            </div>

            <div class="card-icons">
                ${renderCartIcons(item.id, cartItem, compareItem)}
            </div>

        </div>

        <a href="product.html?id=${item.id}" class="btn">
            Подробнее
        </a>

    </div>

</div>`;
    });

    bindCardEvents(catalog);
}

brandFilter.addEventListener("change", () => {
    fillModels();
    filterProducts();
});

modelFilter.addEventListener("change", filterProducts);
searchInput.addEventListener("input", filterProducts);

loadProducts();
