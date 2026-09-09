const product = document.getElementById("product");

function formatPrice(price) {
    return Number(price).toLocaleString("ru-RU");
}

async function loadProduct() {
    const params = new URLSearchParams(window.location.search);
    const id = Number(params.get("id"));

    try {
        const response = await fetch("./data/parts.json");
        const products = await response.json();
        const item = products.find(p => p.id === id);

        if (!item) {
            product.innerHTML = `
            <div class="empty">
                <div class="empty-icon">❌</div>
                <h3>Товар не найден</h3>
                <p>Запрашиваемый товар не существует</p>
                <a href="index.html" class="btn" style="max-width:280px;margin:20px auto 0;">Вернуться в каталог</a>
            </div>`;
            return;
        }

        document.title = `${item.name} — China AutoParts`;

        const gallery = item.images
            .map(image => `<img src="${image}" class="gallery-image" alt="${item.name}">`)
            .join("");

        product.innerHTML = `
        <a href="index.html" class="back-link" style="margin-bottom:16px;display:inline-flex;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Вернуться в каталог
        </a>

        <div class="product-page">

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
                    <span class="product-meta-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="M9 3v18"/></svg>
                        Марка: <strong>${item.brand}</strong>
                    </span>
                    <span class="product-meta-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 2 7l10 5 10-5-10-5z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/></svg>
                        Модель: <strong>${item.model}</strong>
                    </span>
                    ${item.generation ? `
                    <span class="product-meta-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        Поколение: <strong>${item.generation}</strong>
                    </span>` : ''}
                    <span class="product-meta-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                        В наличии: <strong>${item.stock} шт.</strong>
                    </span>
                </div>

                ${item.description ? `<p class="product-description">${item.description}</p>` : ''}

                <div class="product-price">
                    ${formatPrice(item.price)} <span class="currency">₽</span>
                </div>

                <a href="tel:+79288092949" class="btn btn-order" style="margin-top:16px;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                    Заказать по телефону
                </a>

            </div>

        </div>
        `;

    } catch(error) {
        console.error(error);
        product.innerHTML = `
        <div class="empty">
            <div class="empty-icon">⚠️</div>
            <h3>Ошибка загрузки</h3>
            <p>Не удалось загрузить данные товара</p>
            <a href="index.html" class="btn" style="max-width:280px;margin:20px auto 0;">Вернуться в каталог</a>
        </div>`;
    }
}

loadProduct();
