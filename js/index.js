const catalog = document.getElementById("catalog");
const brandFilter = document.getElementById("brandFilter");
const modelFilter = document.getElementById("modelFilter");
const searchInput = document.getElementById("searchInput");
const categoriesBlock = document.getElementById("categories");
const resultsCount = document.getElementById("resultsCount");
const inStockOnly = document.getElementById("inStockOnly");
const priceMin = document.getElementById("priceMin");
const priceMax = document.getElementById("priceMax");
const sortSelect = document.getElementById("sortSelect");
const autocompleteList = document.getElementById("autocompleteList");

let products = [];

/* ---------- SKELETON ---------- */

function renderSkeleton(count = 6) {
    let html = "";
    for (let i = 0; i < count; i++) {
        html += `
        <div class="skeleton" style="animation-delay:${i * .05}s">
            <div class="skeleton-block skeleton-img"></div>
            <div class="skeleton-body">
                <div class="skeleton-block skeleton-line lg"></div>
                <div class="skeleton-block skeleton-line sm"></div>
                <div class="skeleton-block skeleton-line sm"></div>
                <div class="skeleton-block skeleton-line"></div>
                <div class="skeleton-block skeleton-btn"></div>
            </div>
        </div>`;
    }
    catalog.innerHTML = html;
    if (resultsCount) resultsCount.textContent = "Загрузка...";
}

/* ---------- FILTER & SORT ---------- */

function getFilteredProducts() {
    const search = (searchInput.value || "").toLowerCase().trim();
    const brand = brandFilter.value;
    const model = modelFilter.value;
    const min = priceMin.value ? Number(priceMin.value) : null;
    const max = priceMax.value ? Number(priceMax.value) : null;
    const stockOnly = inStockOnly.checked;

    let items = products.filter(item => {
        if (activeCategory && item.category !== activeCategory) return false;
        if (search) {
            const haystack = `${item.name} ${item.article} ${item.oem || ""} ${item.brand} ${item.model}`.toLowerCase();
            if (!haystack.includes(search)) return false;
        }
        if (brand && item.brand !== brand) return false;
        if (model && item.model !== model) return false;
        if (min !== null && item.price < min) return false;
        if (max !== null && item.price > max) return false;
        if (stockOnly && item.stock <= 0) return false;
        return true;
    });

    applySort(items);
    return items;
}

function applySort(items) {
    switch (sortSelect.value) {
        case "price-asc":
            items.sort((a, b) => a.price - b.price);
            break;
        case "price-desc":
            items.sort((a, b) => b.price - a.price);
            break;
        case "name-asc":
            items.sort((a, b) => a.name.localeCompare(b.name, "ru"));
            break;
        case "name-desc":
            items.sort((a, b) => b.name.localeCompare(a.name, "ru"));
            break;
        case "stock-desc":
            items.sort((a, b) => b.stock - a.stock);
            break;
    }
}

function filterProducts() {
    const items = getFilteredProducts();
    render(items);
    runAutocomplete();
}

/* ---------- AUTOCOMPLETE ---------- */

function runAutocomplete() {
    const q = (searchInput.value || "").toLowerCase().trim();
    if (!q || !autocompleteList) {
        autocompleteList.classList.remove("show");
        return;
    }

    const matches = products
        .filter(item =>
            `${item.name} ${item.article} ${item.oem || ""} ${item.brand} ${item.model}`.toLowerCase().includes(q)
        )
        .slice(0, 6);

    if (!matches.length) {
        autocompleteList.classList.remove("show");
        return;
    }

    autocompleteList.innerHTML = matches.map(item => `
        <a class="autocomplete-item" href="product.html?id=${item.id}">
            <img src="${item.images?.[0] || "images/no-image.svg"}" alt="${item.name}">
            <div>
                <div class="autocomplete-item-name">${item.name}</div>
                <div class="autocomplete-item-meta">${item.brand} ${item.model} · ${item.article}</div>
            </div>
            <div class="autocomplete-item-price">${App.formatPrice(item.price)} ₽</div>
        </a>
    `).join("");

    autocompleteList.classList.add("show");
}

/* ---------- CARD RENDERING ---------- */

function discountPercent(item) {
    if (!item.oldPrice || item.oldPrice <= item.price) return null;
    return Math.round((1 - item.price / item.oldPrice) * 100);
}

function getStockClass(stock) {
    if (stock > 5) return "in-stock";
    if (stock > 0) return "low-stock";
    return "in-stock";
}

function getStockText(stock) {
    if (stock > 5) return "В наличии";
    if (stock > 0) return `Осталось ${stock} шт.`;
    return "В наличии";
}

const CART_SVG = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>`;

const COMPARE_SVG = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3h5v5"/><path d="M8 3H3v5"/><path d="M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3"/><path d="m15 9 6-6"/></svg>`;

function renderCartIcons(id, cartItem, compareItem) {
    let html = "";

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
    <div class="card-icon compare-action ${compareItem ? "active" : ""}" data-id="${id}">
        ${COMPARE_SVG}
    </div>`;

    return html;
}

function render(items) {
    catalog.innerHTML = "";

    if (resultsCount) {
        resultsCount.innerHTML = items.length
            ? `Найдено: <strong>${items.length}</strong> ${plural(items.length)}
                <span style="opacity:.6">из ${products.length}</span>`
            : "Ничего не найдено";
    }

    if (!items.length) {
        catalog.innerHTML = `
        <div class="empty">
            <div class="empty-icon">🔍</div>
            <h3>Товары не найдены</h3>
            <p>Попробуйте изменить параметры поиска или сбросить фильтры</p>
            <button class="btn btn-outline" onclick="resetFilters()" style="max-width:280px;margin:20px auto 0;">Сбросить фильтры</button>
        </div>`;
        return;
    }

    items.forEach(item => {
        const image = item.images?.[0] || "images/no-image.svg";
        const cartItem = App.inCart(item.id);
        const compareItem = App.isInCompare(item.id);
        const discount = discountPercent(item);

        catalog.innerHTML += `
<div class="card" data-id="${item.id}" style="animation-delay:${items.indexOf(item) * .04}s">

    ${discount ? `<span class="card-discount">−${discount}%</span>` : ""}

    <div class="card-media">
        <img src="${image}" alt="${item.name}" loading="lazy" onerror="this.onerror=null;this.src='images/no-image.svg';">
    </div>

    <div class="card-content">

        <h3>${item.name}</h3>

        <p><strong>Марка:</strong> ${item.brand}</p>
        <p><strong>Модель:</strong> ${item.model}</p>
        <p><strong>Артикул:</strong> ${item.article}</p>

        <span class="badge-stock ${getStockClass(item.stock)}">${getStockText(item.stock)}</span>

        ${item.warranty ? `<span class="badge-warranty">Гарантия ${item.warranty} мес.</span>` : ""}

        <div class="card-bottom">

            <div class="price-row">
                <div class="price">${App.formatPrice(item.price)} <span class="currency">₽</span></div>
                ${item.oldPrice ? `<span class="old-price">${App.formatPrice(item.oldPrice)} ₽</span>` : ""}
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

function plural(n) {
    const d = n % 10;
    if (n % 100 >= 11 && n % 100 <= 14) return "товаров";
    if (d === 1) return "товар";
    if (d >= 2 && d <= 4) return "товара";
    return "товаров";
}

/* ---------- CARD EVENTS ---------- */

function updateCard(id) {
    const card = document.querySelector(`.card[data-id="${id}"]`);
    if (!card) return;

    const cartItem = App.inCart(id);
    const compareItem = App.isInCompare(id);
    const cardIcons = card.querySelector(".card-icons");
    if (!cardIcons) return;

    cardIcons.innerHTML = renderCartIcons(id, cartItem, compareItem);
    bindCardEvents(cardIcons);
}

function bindCardEvents(root) {
    root.querySelectorAll(".cart-action").forEach(btn => {
        btn.onclick = e => {
            e.stopPropagation();
            App.addToCart(+btn.dataset.id);
            updateCard(+btn.dataset.id);
        };
    });

    root.querySelectorAll(".plus").forEach(btn => {
        btn.onclick = e => {
            e.stopPropagation();
            App.increaseQty(+btn.dataset.id);
            updateCard(+btn.dataset.id);
        };
    });

    root.querySelectorAll(".minus").forEach(btn => {
        btn.onclick = e => {
            e.stopPropagation();
            App.decreaseQty(+btn.dataset.id);
            updateCard(+btn.dataset.id);
        };
    });

    root.querySelectorAll(".compare-action").forEach(btn => {
        btn.onclick = e => {
            e.stopPropagation();
            App.toggleCompare(+btn.dataset.id);
            updateCard(+btn.dataset.id);
        };
    });
}

/* ---------- CATEGORIES ---------- */

let activeCategory = "";

function countByCategory(category) {
    if (!category) return products.length;
    return products.filter(p => p.category === category).length;
}

function updateCategoryCounters() {
    if (!categoriesBlock) return;

    const catMap = {
        "catCountAll": countByCategory(""),
        "catCountFilters": countByCategory("Фильтры"),
        "catCountBrakes": countByCategory("Тормозная система"),
        "catCountSuspension": countByCategory("Подвеска"),
        "catCountEngine": countByCategory("Двигатель"),
        "catCountElectric": countByCategory("Электрика"),
        "catCountBody": countByCategory("Кузов"),
        "catCountSteering": countByCategory("Рулевое"),
    };

    Object.entries(catMap).forEach(([id, count]) => {
        const el = document.getElementById(id);
        if (el) {
            el.textContent = count;
            el.parentElement.style.display = count ? "" : "none";
        }
    });
}

function bindCategoryEvents() {
    if (!categoriesBlock) return;
    categoriesBlock.querySelectorAll(".category-card").forEach(card => {
        card.onclick = () => {
            categoriesBlock.querySelectorAll(".category-card").forEach(c => c.classList.remove("active"));
            card.classList.add("active");
            activeCategory = card.dataset.category;
            filterProducts();
        };
    });
}

/* ---------- FILTER HELPERS ---------- */

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

function resetFilters() {
    activeCategory = "";
    searchInput.value = "";
    brandFilter.value = "";
    modelFilter.value = "";
    inStockOnly.checked = false;
    priceMin.value = "";
    priceMax.value = "";
    sortSelect.value = "default";
    categoriesBlock.querySelectorAll(".category-card").forEach(c => c.classList.remove("active"));
    categoriesBlock.querySelector(".category-card").classList.add("active");
    fillModels();
    filterProducts();
}

/* ---------- LOAD ---------- */

async function loadProducts() {
    renderSkeleton();

    catalog.addEventListener("click", e => {
        const img = e.target.closest(".card-media img");
        if (!img) return;
        const card = img.closest(".card");
        if (!card) return;
        e.preventDefault();
        const item = products.find(p => p.id === Number(card.dataset.id));
        if (item) App.openGallery(item.images, 0);
    });

    try {
        const res = await fetch("./data/parts.json");
        products = await res.json();
        fillBrands();
        fillModels();
        updateCategoryCounters();
        bindCategoryEvents();
        render(products);
        App.updateCounters();
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

/* ---------- EVENTS ---------- */

brandFilter.addEventListener("change", () => {
    fillModels();
    filterProducts();
});

modelFilter.addEventListener("change", filterProducts);
searchInput.addEventListener("input", e => {
    filterProducts();
    runAutocomplete();
});

searchInput.addEventListener("focus", runAutocomplete);
document.addEventListener("click", e => {
    if (!e.target.closest(".search-wrap") && autocompleteList) {
        autocompleteList.classList.remove("show");
    }
});

[inStockOnly, priceMin, priceMax, sortSelect].forEach(el => {
    if (el) el.addEventListener("change", filterProducts);
});
[priceMin, priceMax].forEach(el => {
    if (el) el.addEventListener("input", debounce(filterProducts, 300));
});

function debounce(fn, ms) {
    let t;
    return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...args), ms);
    };
}

loadProducts();