const catalog = document.getElementById("catalog");
const brandFilter = document.getElementById("brandFilter");
const modelFilter = document.getElementById("modelFilter");
const searchInput = document.getElementById("searchInput");

let products = [];

async function loadProducts() {

    try {

        const response =
        await fetch("./data/parts.json");

        products =
        await response.json();

        fillBrands();

        render(products);

    } catch(error) {

        console.error(error);

        catalog.innerHTML =
        "<h2>Ошибка загрузки товаров</h2>";
    }
}

function fillBrands() {

    const brands =
    [...new Set(products.map(item => item.brand))];

    brands.sort();

    brands.forEach(brand => {

        const option =
        document.createElement("option");

        option.value = brand;
        option.textContent = brand;

        brandFilter.appendChild(option);
    });
}

function fillModels() {

    modelFilter.innerHTML =
    `<option value="">Все модели</option>`;

    const selectedBrand =
    brandFilter.value;

    const models =
    [...new Set(
        products
        .filter(item =>
            !selectedBrand ||
            item.brand === selectedBrand
        )
        .map(item => item.model)
    )];

    models.sort();

    models.forEach(model => {

        const option =
        document.createElement("option");

        option.value = model;
        option.textContent = model;

        modelFilter.appendChild(option);
    });
}

function filterProducts() {

    const search =
    searchInput.value.toLowerCase();

    const brand =
    brandFilter.value;

    const model =
    modelFilter.value;

    const filtered =
    products.filter(item => {

        const searchMatch =
            item.name.toLowerCase().includes(search) ||
            item.article.toLowerCase().includes(search);

        const brandMatch =
            !brand ||
            item.brand === brand;

        const modelMatch =
            !model ||
            item.model === model;

        return (
            searchMatch &&
            brandMatch &&
            modelMatch
        );
    });

    render(filtered);
}

function render(items) {

    catalog.innerHTML = "";

    if (!items.length) {

        catalog.innerHTML =
        `<div class="empty">
            Товары не найдены
        </div>`;

        return;
    }

    items.forEach(item => {

        const image =
        item.images?.[0] ||
        "images/no-image.jpg";

        catalog.innerHTML += `

      <div class="card"
     onclick="window.location.href='product.html?id=${item.id}'">

            <img
                src="${image}"
                alt="${item.name}">

            <div class="card-content">

                <h3>${item.name}</h3>

                <p>Марка: ${item.brand}</p>
                <p>Модель: ${item.model}</p>
                <p>Артикул: ${item.article}</p>
                <p>Наличие: ${item.stock} шт.</p>

                <div class="price">
                    ${Number(item.price)
                        .toLocaleString("ru-RU")} ₽
                </div>

                <a
                    href="product.html?id=${item.id}"
                    class="btn">
                    Подробнее
                </a>

            </div>

        </div>
        `;
    });
}

brandFilter.addEventListener("change", () => {

    fillModels();

    filterProducts();
});

modelFilter.addEventListener(
    "change",
    filterProducts
);

searchInput.addEventListener(
    "input",
    filterProducts
);

loadProducts();