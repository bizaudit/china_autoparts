const product = document.getElementById("product");
const relatedSection = document.getElementById("relatedSection");
const relatedGrid = document.getElementById("relatedGrid");
const recentSection = document.getElementById("recentSection");
const recentGrid = document.getElementById("recentGrid");

let allProducts = [];
let currentProduct = null;

function getStockClass(stock) {
    if (stock > 5) return "in-stock";
    return "low-stock";
}

function getStockText(stock) {
    if (stock > 5) return "В наличии";
    if (stock > 0) return `Осталось ${stock} шт.`;
    return "В наличии";
}

function discountPercent(item) {
    if (!item.oldPrice || item.oldPrice <= item.price) return null;
    return Math.round((1 - item.price / item.oldPrice) * 100);
}

function renderSimpleCard(item) {
    return `
    <div class="card" data-id="${item.id}">
        <div class="card-media">
            <img src="${item.images?.[0] || "images/no-image.svg"}" alt="${item.name}" loading="lazy" onerror="this.onerror=null;this.src='images/no-image.svg';">
        </div>
        <div class="card-content">
            <h3>${item.name}</h3>
            <p><strong>Марка:</strong> ${item.brand}</p>
            <p><strong>Модель:</strong> ${item.model}</p>
            <span class="badge-stock ${getStockClass(item.stock)}">${getStockText(item.stock)}</span>
            <div class="price-row">
                <div class="price">${App.formatPrice(item.price)} <span class="currency">₽</span></div>
            </div>
            <a href="product.html?id=${item.id}" class="btn">Подробнее</a>
        </div>
    </div>`;
}

function renderRelated() {
    if (!currentProduct || !relatedGrid || !relatedSection) return;

    const related = allProducts
        .filter(p => p.id !== currentProduct.id && p.category === currentProduct.category)
        .slice(0, 4);

    if (!related.length) {
        relatedSection.style.display = "none";
        return;
    }

    relatedSection.style.display = "";
    relatedGrid.innerHTML = related.map(renderSimpleCard).join("");
}

function renderRecent() {
    if (!recentGrid || !recentSection) return;

    const recentIds = App.getRecent().filter(id => id !== (currentProduct?.id));
    if (!recentIds.length) {
        recentSection.style.display = "none";
        return;
    }

    const items = recentIds
        .map(id => allProducts.find(p => p.id === id))
        .filter(Boolean)
        .slice(0, 4);

    if (!items.length) {
        recentSection.style.display = "none";
        return;
    }

    recentSection.style.display = "";
    recentGrid.innerHTML = items.map(renderSimpleCard).join("");
}

function bindCardMedia(container) {
    if (!container || container.dataset.galleryBound) return;
    container.addEventListener("click", e => {
        const img = e.target.closest(".card-media img");
        if (!img) return;
        const card = img.closest(".card");
        if (!card) return;
        e.preventDefault();
        const found = allProducts.find(p => p.id === Number(card.dataset.id));
        if (found) App.openGallery(found.images, 0);
    });
    container.dataset.galleryBound = "1";
}

function buildProductHTML(item) {
    const gallery = item.images
        .map(image => `<img src="${image}" class="gallery-image" alt="${item.name}" loading="lazy" onerror="this.onerror=null;this.src='images/no-image.svg';">`)
        .join("");

    const discount = discountPercent(item);
    const cartItem = App.inCart(item.id);
    const compareItem = App.isInCompare(item.id);

    return `
    <a href="index.html" class="back-link" style="margin-bottom:16px;display:inline-flex;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        Вернуться в каталог
    </a>

    <div class="product-page" data-id="${item.id}">

        <div class="gallery">
            ${gallery}
        </div>

        <div class="product-info">

            <h1>${item.name}</h1>

            <div class="product-meta">
                <span class="product-meta-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                    Артикул: <strong>${item.article}</strong>
                </span>
                ${item.oem ? `
                <span class="product-meta-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                    OEM: <strong>${item.oem}</strong>
                </span>` : ""}
                <span class="product-meta-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="M9 3v18"/></svg>
                    Марка: <strong>${item.brand}</strong>
                </span>
                <span class="product-meta-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 2 7l10 5 10-5-10-5z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/></svg>
                    Модель: <strong>${item.model}</strong>
                </span>
                ${item.generation && item.generation !== "-" ? `
                <span class="product-meta-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    Поколение: <strong>${item.generation}</strong>
                </span>` : ""}
                <span class="product-meta-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                    Наличие: <strong>${item.stock} шт.</strong>
                </span>
                ${item.warranty ? `
                <span class="product-meta-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
                    Гарантия: <strong>${item.warranty} мес.</strong>
                </span>` : ""}
                ${item.delivery ? `
                <span class="product-meta-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 17h14"/><path d="M5 17V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v10"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="16.5" cy="17.5" r="2.5"/></svg>
                    Доставка: <strong>${item.delivery}</strong>
                </span>` : ""}
            </div>

            ${item.description ? `<p class="product-description">${item.description}</p>` : ""}

            <div class="price-row" style="margin-top:12px;">
                <div class="product-price">
                    ${App.formatPrice(item.price)} <span class="currency">₽</span>
                </div>
                ${item.oldPrice ? `<span class="old-price" style="font-size:18px;">${App.formatPrice(item.oldPrice)} ₽</span>` : ""}
            </div>
            ${discount ? `<span class="card-discount" style="position:static;display:inline-flex;margin-top:8px;width:fit-content;">−${discount}%</span>` : ""}

            <div class="product-buy">
                <div class="qty-box">
                    <button class="qty-btn minus" id="prodMinus">−</button>
                    <span class="qty-value" id="prodQty">1</span>
                    <button class="qty-btn plus" id="prodPlus">+</button>
                </div>
                <button class="btn btn-add-cart" id="prodAddCart">
                    ${cartItem ? "В корзине" : "Добавить в корзину"}
                </button>
                <div class="card-icon compare-action ${compareItem ? "active" : ""}" id="prodCompare" style="height:48px;width:48px;flex-shrink:0;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3h5v5"/><path d="M8 3H3v5"/><path d="M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3"/><path d="m15 9 6-6"/></svg>
                </div>
            </div>

            <a href="javascript:void(0)" class="btn btn-order" id="prodOrder" style="margin-top:12px;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                Заказать сейчас
            </a>

        </div>

    </div>
    `;
}

function bindProductEvents(item) {
    const minus = document.getElementById("prodMinus");
    const plus = document.getElementById("prodPlus");
    const qtyEl = document.getElementById("prodQty");
    const addCart = document.getElementById("prodAddCart");
    const compareEl = document.getElementById("prodCompare");
    const order = document.getElementById("prodOrder");
    let qty = 1;

    minus.onclick = () => {
        if (qty > 1) {
            qty--;
            qtyEl.textContent = qty;
        }
    };

    plus.onclick = () => {
        if (qty < item.stock) {
            qty++;
            qtyEl.textContent = qty;
        } else {
            App.toast(`Доступно только ${item.stock} шт.`, "error");
        }
    };

    addCart.onclick = () => {
        if (App.inCart(item.id)) {
            window.location.href = "cart.html";
            return;
        }
        App.addToCart(item.id, qty);
        addCart.textContent = `В корзине (${App.inCart(item.id)?.qty || qty})`;
    };

    compareEl.onclick = () => {
        App.toggleCompare(item.id);
        compareEl.classList.toggle("active", App.isInCompare(item.id));
    };

    order.onclick = () => {
        App.openOrderModal({ single: item });
    };

    document.querySelectorAll(".gallery-image").forEach((img, i) => {
        img.onclick = () => App.openGallery(item.images, i);
    });
}

async function loadProduct() {
    const params = new URLSearchParams(window.location.search);
    const id = Number(params.get("id"));

    try {
        const response = await fetch("./data/parts.json");
        allProducts = await response.json();
        currentProduct = allProducts.find(p => p.id === id);

        if (!currentProduct) {
            product.innerHTML = `
            <div class="empty">
                <div class="empty-icon">❌</div>
                <h3>Товар не найден</h3>
                <p>Запрашиваемый товар не существует</p>
                <a href="index.html" class="btn btn-order" style="max-width:280px;margin:20px auto 0;">Вернуться в каталог</a>
            </div>`;
            return;
        }

        document.title = `${currentProduct.name} — China AutoParts`;
        document.querySelector('meta[property="og:title"]')?.setAttribute("content", currentProduct.name);
        document.querySelector('meta[property="og:description"]')?.setAttribute("content", currentProduct.description || "");

        App.addRecent(currentProduct.id);
        product.innerHTML = buildProductHTML(currentProduct);
        bindProductEvents(currentProduct);
        renderRelated();
        renderRecent();
        bindCardMedia(relatedGrid);
        bindCardMedia(recentGrid);
        App.updateCounters();

    } catch (error) {
        console.error(error);
        product.innerHTML = `
        <div class="empty">
            <div class="empty-icon">⚠️</div>
            <h3>Ошибка загрузки</h3>
            <p>Не удалось загрузить данные товара</p>
            <a href="index.html" class="btn btn-order" style="max-width:280px;margin:20px auto 0;">Вернуться в каталог</a>
        </div>`;
    }
}

loadProduct();