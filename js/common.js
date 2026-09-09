/* ============================================
   China AutoParts — Общий модуль
   Корзина, сравнение, счётчики, уведомления
   ============================================ */

const App = (() => {

    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let compare = JSON.parse(localStorage.getItem("compare")) || [];

    /* ---------- PERSISTENCE ---------- */

    function saveCart() {
        localStorage.setItem("cart", JSON.stringify(cart));
    }

    function saveCompare() {
        localStorage.setItem("compare", JSON.stringify(compare));
    }

    /* ---------- HELPERS ---------- */

    function formatPrice(price) {
        return Number(price).toLocaleString("ru-RU");
    }

    function getCartCount() {
        return cart.reduce((sum, item) => sum + item.qty, 0);
    }

    function getCompareCount() {
        return compare.length;
    }

    /* ---------- CART ---------- */

    function getCart() {
        return JSON.parse(localStorage.getItem("cart")) || [];
    }

    function inCart(id) {
        return cart.find(i => i.id === id);
    }

    function addToCart(id, qty = 1, { notify = true } = {}) {
        const item = cart.find(i => i.id === id);
        if (item) item.qty += qty;
        else cart.push({ id, qty });
        saveCart();
        if (notify) toast("Товар добавлен в корзину", "success");
        updateCounters();
    }

    function changeQty(id, delta) {
        const item = cart.find(i => i.id === id);
        if (!item) return;
        item.qty += delta;
        if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
        saveCart();
        updateCounters();
    }

    function increaseQty(id) {
        changeQty(id, 1);
    }

    function decreaseQty(id) {
        changeQty(id, -1);
    }

    function removeFromCart(id) {
        cart = cart.filter(i => i.id !== id);
        saveCart();
        toast("Товар удалён из корзины", "info");
        updateCounters();
    }

    function buildOrderText(items, products) {
        const list = items
            .map((it, i) => {
                const p = products.find(x => x.id === it.id);
                return p ? `${i + 1}. ${p.name} (${p.article}) — ${it.qty} шт. — ${formatPrice(p.price * it.qty)} ₽` : "";
            })
            .filter(Boolean)
            .join("\n");

        const total = items.reduce((s, it) => {
            const p = products.find(x => x.id === it.id);
            return s + (p ? p.price * it.qty : 0);
        }, 0);

        return `Здравствуйте! Хочу заказать:\n${list}\n\nИтого: ${formatPrice(total)} ₽`;
    }

    /* ---------- COMPARE ---------- */

    function getCompare() {
        return JSON.parse(localStorage.getItem("compare")) || [];
    }

    function isInCompare(id) {
        return compare.includes(id);
    }

    function toggleCompare(id, { notify = true } = {}) {
        const exists = isInCompare(id);
        if (exists) compare = compare.filter(i => i !== id);
        else compare.push(id);
        saveCompare();
        if (notify) toast(exists ? "Удалено из сравнения" : "Добавлено в сравнение", exists ? "info" : "success");
        updateCounters();
    }

    function removeFromCompare(id) {
        compare = compare.filter(i => i !== id);
        saveCompare();
        toast("Удалено из сравнения", "info");
        updateCounters();
    }

    /* ---------- COUNTERS ---------- */

    function updateCounters() {
        document.querySelectorAll("#cartBtn .tool-count").forEach(badge => {
            const qty = getCartCount();
            const text = qty > 99 ? "99+" : qty;
            badge.textContent = text;
            badge.style.display = qty ? "flex" : "none";
            badge.classList.toggle("large", String(text).length > 1);
        });

        document.querySelectorAll("#compareBtn .tool-count").forEach(badge => {
            const count = getCompareCount();
            const text = count > 99 ? "99+" : count;
            badge.textContent = text;
            badge.style.display = count ? "flex" : "none";
            badge.classList.toggle("large", String(text).length > 1);
        });
    }

    /* ---------- TOAST ---------- */

    const ICONS = {
        success: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>',
        info: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',
        error: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>'
    };

    function toast(message, type = "info", duration = 2600) {
        let wrapper = document.getElementById("toastWrap");
        if (!wrapper) {
            wrapper = document.createElement("div");
            wrapper.id = "toastWrap";
            wrapper.className = "toast-wrap";
            document.body.appendChild(wrapper);
        }

        const el = document.createElement("div");
        el.className = `toast toast-${type}`;
        el.innerHTML = `<span class="toast-icon">${ICONS[type] || ICONS.info}</span><span>${message}</span>`;
        wrapper.appendChild(el);

        requestAnimationFrame(() => el.classList.add("show"));

        setTimeout(() => {
            el.classList.remove("show");
            setTimeout(() => el.remove(), 300);
        }, duration);
    }

    /* ---------- RECENTLY VIEWED ---------- */

    const RECENT_KEY = "recentlyViewed";

    function getRecent() {
        return JSON.parse(localStorage.getItem(RECENT_KEY)) || [];
    }

    function addRecent(id, max = 6) {
        let recent = getRecent().filter(i => i !== id);
        recent.unshift(id);
        recent = recent.slice(0, max);
        localStorage.setItem(RECENT_KEY, JSON.stringify(recent));
    }

    /* ---------- IMAGE HELPER ---------- */

    function imageFallback(src, alt = "") {
        return `<img src="${src}" alt="${alt}" loading="lazy" onerror="this.onerror=null;this.src='images/no-image.svg';">`;
    }

    /* ---------- LIGHTBOX SLIDER ---------- */

    function openGallery(images, startIndex = 0) {
        const list = (images || []).filter(Boolean);
        if (!list.length) return;

        let index = Math.min(Math.max(startIndex, 0), list.length - 1);
        const MIN_ZOOM = 100;
        const MAX_ZOOM = 150;
        let zoom = 100;
        let tx = 0;
        let ty = 0;

        const overlay = document.createElement("div");
        overlay.className = "lightbox lightbox-slider";
        overlay.innerHTML = `
            <button class="lightbox-close" type="button" aria-label="Закрыть">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
            <div class="lightbox-stage">
                <img src="${list[index]}" alt="">
            </div>
            <div class="lightbox-counter"><span class="lightbox-current">${index + 1}</span> / ${list.length}</div>
            ${list.length > 1 ? `
            <button class="lightbox-nav lightbox-prev" type="button" aria-label="Предыдущее фото">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <button class="lightbox-nav lightbox-next" type="button" aria-label="Следующее фото">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>` : ""}
            <div class="lightbox-tools">
                <button class="zoom-btn" type="button" data-target="minus" aria-label="Уменьшить">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/></svg>
                </button>
                <input type="range" class="zoom-range" min="${MIN_ZOOM}" max="${MAX_ZOOM}" step="10" value="100" aria-label="Масштаб изображения">
                <button class="zoom-btn" type="button" data-target="plus" aria-label="Увеличить">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
                </button>
                <span class="zoom-value">100%</span>
            </div>
        `;

        document.body.appendChild(overlay);
        document.body.style.overflow = "hidden";

        const img = overlay.querySelector(".lightbox-stage img");
        const stage = overlay.querySelector(".lightbox-stage");
        const counterEl = overlay.querySelector(".lightbox-current");
        const prevBtn = overlay.querySelector(".lightbox-prev");
        const nextBtn = overlay.querySelector(".lightbox-next");
        const range = overlay.querySelector(".zoom-range");
        const zoomValue = overlay.querySelector(".zoom-value");
        const minusBtn = overlay.querySelector('[data-target="minus"]');
        const plusBtn = overlay.querySelector('[data-target="plus"]');

        img.onerror = () => { img.onerror = null; img.src = "images/no-image.svg"; };

        function applyTransform(animate = true) {
            img.style.transform = `translate(${tx}px, ${ty}px) scale(${zoom / 100})`;
            stage.classList.toggle("dragging", !animate);
            stage.classList.toggle("zoomed", zoom > 100);
        }

        function updateZoomControls() {
            range.value = zoom;
            zoomValue.textContent = `${zoom}%`;
            applyTransform(true);
        }

        function resetView() {
            tx = 0;
            ty = 0;
            zoom = MIN_ZOOM;
            updateZoomControls();
        }

        function setZoom(z, reset = true) {
            zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));
            if (reset) { tx = 0; ty = 0; }
            updateZoomControls();
        }

        function show() {
            img.classList.add("fade");
            setTimeout(() => {
                img.src = list[index];
                if (counterEl) counterEl.textContent = index + 1;
                img.onerror = () => { img.onerror = null; img.src = "images/no-image.svg"; };
                resetView();
                img.classList.remove("fade");
            }, 130);
        }

        function prev() {
            if (list.length < 2) return;
            index = (index - 1 + list.length) % list.length;
            show();
        }

        function next() {
            if (list.length < 2) return;
            index = (index + 1) % list.length;
            show();
        }

        /* ---------- DRAG / SWIPE ---------- */

        let dragging = false;
        let moved = false;
        let startX = 0;
        let startY = 0;
        let startTx = 0;
        let startTy = 0;

        stage.addEventListener("pointerdown", e => {
            dragging = true;
            moved = false;
            startX = e.clientX;
            startY = e.clientY;
            startTx = tx;
            startTy = ty;
            stage.setPointerCapture(e.pointerId);
        });

        stage.addEventListener("pointermove", e => {
            if (!dragging) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            if (Math.abs(dx) > 6 || Math.abs(dy) > 6) moved = true;

            if (zoom > 100) {
                tx = startTx + dx;
                ty = startTy + dy;
                applyTransform(false);
            }
        });

        function endDrag(e) {
            if (!dragging) return;
            dragging = false;
            applyTransform(true);

            if (zoom <= 100 && moved) {
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;
                if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
                    dx < 0 ? next() : prev();
                }
            }
        }

        stage.addEventListener("pointerup", endDrag);
        stage.addEventListener("pointercancel", endDrag);

        img.addEventListener("click", e => {
            e.stopPropagation();
            if (!moved) {
                if (zoom > 100) setZoom(MIN_ZOOM);
                else setZoom(MAX_ZOOM);
            }
        });

        range.addEventListener("input", () => setZoom(Number(range.value), false));
        minusBtn.addEventListener("click", e => { e.stopPropagation(); setZoom(zoom - 10); });
        plusBtn.addEventListener("click", e => { e.stopPropagation(); setZoom(zoom + 10); });

        const close = () => {
            overlay.classList.remove("show");
            document.body.style.overflow = "";
            setTimeout(() => overlay.remove(), 250);
            document.removeEventListener("keydown", keyHandler);
        };

        const keyHandler = e => {
            if (e.key === "Escape") close();
            else if (e.key === "ArrowLeft") prev();
            else if (e.key === "ArrowRight") next();
            else if (e.key === "+" || e.key === "=") setZoom(zoom + 10);
            else if (e.key === "-" || e.key === "_") setZoom(zoom - 10);
            else if (e.key === "0") setZoom(MIN_ZOOM);
        };

        prevBtn?.addEventListener("click", e => { e.stopPropagation(); prev(); });
        nextBtn?.addEventListener("click", e => { e.stopPropagation(); next(); });
        overlay.querySelector(".lightbox-close").addEventListener("click", close);
        overlay.addEventListener("click", e => { if (e.target === overlay && !moved) close(); });

        document.addEventListener("keydown", keyHandler);
        requestAnimationFrame(() => overlay.classList.add("show"));
    }

    /* ---------- ORDER MODAL ---------- */

    function openOrderModal(options) {
        const { items, products, single } = options || {};
        let orderText = "";

        if (items && products) {
            orderText = buildOrderText(items, products);
        } else if (single) {
            orderText = `Здравствуйте! Хочу заказать: ${single.name} (${single.article}) — ${formatPrice(single.price)} ₽`;
        }

        const message = encodeURIComponent(orderText);
        const waLink = `https://wa.me/message/VURZ2TKA3WSGA1?text=${message}`;
        const telLink = `tel:+79288092949`;

        const overlay = document.createElement("div");
        overlay.className = "modal-overlay";
        overlay.innerHTML = `
            <div class="modal">
                <button class="modal-close" type="button">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
                <div class="modal-icon">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                </div>
                <h3>Оформление заказа</h3>
                <p class="modal-hint">Оставьте заявку — мы перезвоним для подтверждения. Или оформите заказ напрямую в мессенджере.</p>
                <div class="modal-order-text">${orderText.replace(/\n/g, "<br>")}</div>
                <div class="modal-actions">
                    <a href="${waLink}" target="_blank" class="btn btn-whatsapp">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                        Оформить в WhatsApp
                    </a>
                    <a href="${telLink}" class="btn btn-order">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                        Позвонить
                    </a>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        document.body.style.overflow = "hidden";

        requestAnimationFrame(() => overlay.classList.add("show"));

        const close = () => {
            overlay.classList.remove("show");
            document.body.style.overflow = "";
            setTimeout(() => overlay.remove(), 250);
        };

        overlay.querySelector(".modal-close").onclick = close;
        overlay.addEventListener("click", e => {
            if (e.target === overlay) close();
        });
        document.addEventListener("keydown", e => {
            if (e.key === "Escape") close();
        }, { once: true });
    }

    /* ---------- INIT ---------- */

    function init() {
        updateCounters();

        document.addEventListener("DOMContentLoaded", () => {
            updateCounters();
        });

        window.addEventListener("storage", e => {
            if (e.key === "cart" || e.key === "compare") {
                cart = JSON.parse(localStorage.getItem("cart")) || [];
                compare = JSON.parse(localStorage.getItem("compare")) || [];
                updateCounters();
            }
        });
    }

    return {
        init,
        saveCart,
        saveCompare,
        getCart,
        getCompare,
        getCartCount,
        getCompareCount,
        inCart,
        addToCart,
        changeQty,
        increaseQty,
        decreaseQty,
        removeFromCart,
        isInCompare,
        toggleCompare,
        removeFromCompare,
        buildOrderText,
        updateCounters,
        toast,
        formatPrice,
        imageFallback,
        getRecent,
        addRecent,
        openOrderModal,
        openGallery
    };
})();

App.init();