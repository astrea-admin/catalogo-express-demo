import {
  calculateSubtotal,
  decreaseQuantity,
  formatQuantity,
  getDefaultQuantity,
  getSelectionLabels,
  increaseQuantity,
  resolveUnitPrice,
  validateSelections
} from "./purchase.js";

const moneyFormatter = new Intl.NumberFormat("es-PY", {
  style: "currency",
  currency: "PYG",
  maximumFractionDigits: 0
});

export function formatMoney(value) {
  return moneyFormatter.format(value).replace("PYG", "Gs.");
}

export function renderCategories(container, categories, activeCategoryId, onSelect) {
  const allCategories = [
    { id: null, label: "Todos" },
    ...categories
  ];

  container.innerHTML = "";

  allCategories.forEach((category) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "category-button";

    if (category.id === activeCategoryId) {
      button.classList.add("is-active");
    }

    button.textContent = category.label;
    button.addEventListener("click", () => onSelect(category.id));

    container.appendChild(button);
  });
}

export function renderProductGrid(container, products, profile, onOpenProduct) {
  container.innerHTML = "";

  products.forEach((product) => {
    const category = profile.categories.find((item) => item.id === product.categoryId);
    const startingPrice = resolveUnitPrice(product, getDefaultQuantity(product));

    const article = document.createElement("article");
    article.className = "product-card";

    article.innerHTML = `
      <div class="product-card__image-wrap">
        <img
          class="product-card__image"
          src="${product.image}"
          alt="${escapeHtml(product.name)}"
          loading="lazy"
        >
      </div>

      <div class="product-card__body">
        <p class="product-card__category">${escapeHtml(category?.label ?? "")}</p>
        <h3 class="product-card__title">${escapeHtml(product.name)}</h3>
        <p class="product-card__description">${escapeHtml(product.description)}</p>

        <div class="product-card__footer">
          <span class="product-card__price">${formatMoney(startingPrice)}</span>
          <button class="button button--secondary" type="button">Ver detalle</button>
        </div>
      </div>
    `;

    article.querySelector("button").addEventListener("click", () => onOpenProduct(product.id));
    container.appendChild(article);
  });
}

export function renderCatalogStatus(container, visibleCount, totalCount) {
  if (visibleCount === totalCount) {
    container.textContent = `${totalCount} productos disponibles`;
    return;
  }

  container.textContent = `${visibleCount} de ${totalCount} productos`;
}

export function renderProductDetail(container, product, categoryLabel, handlers) {
  let quantity = getDefaultQuantity(product);
  let selections = {};

  const optionGroups = product.purchase.optionGroups ?? [];

  container.innerHTML = `
    <article class="product-detail">
      <div class="product-detail__media">
        <img src="${product.image}" alt="${escapeHtml(product.name)}">
      </div>

      <div class="product-detail__content">
        <button class="dialog-close" type="button" aria-label="Cerrar">×</button>

        <p class="product-card__category">${escapeHtml(categoryLabel)}</p>
        <h2>${escapeHtml(product.name)}</h2>
        <p class="product-detail__description">${escapeHtml(product.description)}</p>
        <p class="product-detail__price" data-detail-price></p>

        <div data-option-groups></div>

        <div class="detail-purchase-row">
          <div>
            <p class="eyebrow">Cantidad</p>
            <div class="quantity-control">
              <button type="button" data-quantity-decrease aria-label="Disminuir cantidad">−</button>
              <output data-quantity-value></output>
              <button type="button" data-quantity-increase aria-label="Aumentar cantidad">+</button>
            </div>
          </div>

          <div class="detail-subtotal">
            <small>Subtotal</small>
            <strong data-subtotal></strong>
          </div>
        </div>

        <p class="detail-error" data-detail-error aria-live="polite"></p>

        <button class="button button--primary product-detail__add" type="button" data-add-to-cart>
          Añadir al carrito
        </button>
      </div>
    </article>
  `;

  const optionsContainer = container.querySelector("[data-option-groups]");

  optionGroups.forEach((group) => {
    const fieldset = document.createElement("fieldset");
    fieldset.className = "option-group";

    const legend = document.createElement("legend");
    legend.textContent = group.label;

    const optionList = document.createElement("div");
    optionList.className = "option-list";

    group.options.forEach((option) => {
      const label = document.createElement("label");
      label.className = "option-item";

      const input = document.createElement("input");
      input.type = group.maxSelections === 1 ? "radio" : "checkbox";
      input.name = `group-${group.id}`;
      input.value = option.id;

      input.addEventListener("change", () => {
        if (group.maxSelections === 1) {
          selections = { ...selections, [group.id]: option.id };
        }
        refresh();
      });

      const text = document.createElement("span");
      text.textContent = option.label;

      label.append(input, text);
      optionList.appendChild(label);
    });

    fieldset.append(legend, optionList);
    optionsContainer.appendChild(fieldset);
  });

  const quantityOutput = container.querySelector("[data-quantity-value]");
  const priceOutput = container.querySelector("[data-detail-price]");
  const subtotalOutput = container.querySelector("[data-subtotal]");
  const errorOutput = container.querySelector("[data-detail-error]");

  function refresh() {
    priceOutput.textContent = formatMoney(resolveUnitPrice(product, quantity));
    quantityOutput.textContent = formatQuantity(product, quantity);
    subtotalOutput.textContent = formatMoney(calculateSubtotal(product, quantity));
  }

  container.querySelector("[data-quantity-decrease]").addEventListener("click", () => {
    quantity = decreaseQuantity(product, quantity);
    refresh();
  });

  container.querySelector("[data-quantity-increase]").addEventListener("click", () => {
    quantity = increaseQuantity(product, quantity);
    refresh();
  });

  container.querySelector("[data-add-to-cart]").addEventListener("click", () => {
    const validation = validateSelections(product, selections);

    if (!validation.valid) {
      errorOutput.textContent = validation.message;
      return;
    }

    errorOutput.textContent = "";
    handlers.onAddToCart({
      productId: product.id,
      quantity,
      selections
    });
  });

  container.querySelector(".dialog-close").addEventListener("click", handlers.onClose);

  refresh();
}

export function renderCart(container, countContainer, cart, productResolver, handlers) {
  countContainer.textContent = String(
    cart.reduce((accumulator, line) => accumulator + line.quantity, 0)
  );

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <p>Tu carrito está vacío.</p>
        <small>Agregá un producto para probar el circuito.</small>
      </div>
    `;
    return;
  }

  const list = document.createElement("div");
  list.className = "cart-list";

  let total = 0;

  cart.forEach((line) => {
    const product = productResolver(line.productId);

    if (!product) {
      return;
    }

    const subtotal = calculateSubtotal(product, line.quantity);
    total += subtotal;

    const selectionLabels = getSelectionLabels(product, line.selections);
    const metadata = selectionLabels
      .map((item) => `${item.groupLabel.replace("Elegí tu ", "")}: ${item.optionLabel}`)
      .join(" · ");

    const lineElement = document.createElement("div");
    lineElement.className = "cart-line";

    lineElement.innerHTML = `
      <div class="cart-line__top">
        <div>
          <p class="cart-line__name">${escapeHtml(product.name)}</p>
          <p class="cart-line__meta">
            ${escapeHtml(formatQuantity(product, line.quantity))}
            ${metadata ? ` · ${escapeHtml(metadata)}` : ""}
          </p>
        </div>

        <span class="cart-line__price">${formatMoney(subtotal)}</span>
      </div>

      <div class="cart-line__actions">
        <div class="quantity-control">
          <button type="button" data-cart-decrease aria-label="Disminuir cantidad">−</button>
          <output>${escapeHtml(String(line.quantity))}</output>
          <button type="button" data-cart-increase aria-label="Aumentar cantidad">+</button>
        </div>

        <button class="cart-remove" type="button" data-cart-remove>Eliminar</button>
      </div>
    `;

    lineElement.querySelector("[data-cart-decrease]").addEventListener("click", () => {
      const nextQuantity = decreaseQuantity(product, line.quantity);
      handlers.onChangeQuantity(line.lineId, nextQuantity);
    });

    lineElement.querySelector("[data-cart-increase]").addEventListener("click", () => {
      const nextQuantity = increaseQuantity(product, line.quantity);
      handlers.onChangeQuantity(line.lineId, nextQuantity);
    });

    lineElement.querySelector("[data-cart-remove]").addEventListener("click", () => {
      handlers.onRemove(line.lineId);
    });

    list.appendChild(lineElement);
  });

  const summary = document.createElement("div");
  summary.className = "cart-summary";
  summary.innerHTML = `
    <div class="cart-summary__row">
      <span>Total</span>
      <span>${formatMoney(total)}</span>
    </div>

    <button class="button button--primary" type="button" disabled>
      Checkout sandbox · próxima etapa
    </button>
  `;

  container.replaceChildren(list, summary);
}

export function showProductDialog(dialog) {
  if (!dialog.open) {
    dialog.showModal();
  }
}

export function closeProductDialog(dialog) {
  if (dialog.open) {
    dialog.close();
  }
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
