const product =
document.getElementById("product");

async function loadProduct() {

    const params =
    new URLSearchParams(
        window.location.search
    );

    const id =
    Number(params.get("id"));

    try {

        const response =
        await fetch("./data/parts.json");

        const products =
        await response.json();

        const item =
        products.find(
            product => product.id === id
        );

        if (!item) {

            product.innerHTML =
            "<h2>Товар не найден</h2>";

            return;
        }

        const gallery =
        item.images
        .map(image => `
            <img
                src="${image}"
                class="gallery-image">
        `)
        .join("");

        product.innerHTML = `

        <div class="product-page">

            <div class="gallery">

                ${gallery}

            </div>

            <div class="product-info">

                <h1>${item.name}</h1>

                <p>
                    Артикул:
                    ${item.article}
                </p>

                <p>
                    Марка:
                    ${item.brand}
                </p>

                <p>
                    Модель:
                    ${item.model}
                </p>

                <p>
                    ${item.description || ""}
                </p>

                <div class="product-price">
                    ${Number(item.price)
                        .toLocaleString("ru-RU")} ₽
                </div>

            </div>

        </div>
        `;

    } catch(error) {

        console.error(error);

        product.innerHTML =
        "<h2>Ошибка загрузки товара</h2>";
    }
}

loadProduct();