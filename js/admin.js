import {
  getDefaultQuantity,
  getPricingTiers,
  resolveUnitPrice
} from "./purchase.js";

const moneyFormatter = new Intl.NumberFormat("es-PY", {
  style: "currency",
  currency: "PYG",
  maximumFractionDigits: 0
});

function formatMoney(value) {
  return moneyFormatter.format(value).replace("PYG", "Gs.");
}

function formatAdminPrice(product) {
  const quantity = getDefaultQuantity(product);
  const unitPrice = resolveUnitPrice(product, quantity);
  const pricingTiers = getPricingTiers(product);
  const { unit, label } = product.purchase.quantity;

  if (pricingTiers.length > 1) {
    const volumeTier = pricingTiers[1];

    return {
      primary: `${formatMoney(unitPrice)} c/u`,
      secondary: `Desde ${volumeTier.minQty} ${label}${volumeTier.minQty === 1 ? "" : "s"} · ${formatMoney(volumeTier.amount)} c/u`
    };
  }

  if (unit === "kg") {
    return {
      primary: `${formatMoney(unitPrice)} / kg`,
      secondary: `Mín. ${product.purchase.quantity.min} kg · paso ${product.purchase.quantity.step} kg`
    };
  }

  return {
    primary: formatMoney(unitPrice),
    secondary: "Venta por unidad"
  };
}

export function renderAdminCategories(
  container,
  categories,
  activeCategoryId,
  onSelect
) {
  const allCategories = [
    { id: null, label: "Todos" },
    ...categories
  ];

  container.innerHTML = "";

  allCategories.forEach((category) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "category-button admin-category-button";

    if (category.id === activeCategoryId) {
      button.classList.add("is-active");
    }

    button.textContent = category.label;
    button.addEventListener("click", () => onSelect(category.id));

    container.appendChild(button);
  });
}

export function renderAdminStatus(container, products) {
  const hiddenCount = products.filter((product) => !product.active).length;

  if (hiddenCount === 0) {
    container.textContent = `${products.length} productos`;
    return;
  }

  container.textContent = `${products.length} productos · ${hiddenCount} ${hiddenCount === 1 ? "oculto" : "ocultos"}`;
}

export function renderAdminProducts(
  container,
  products,
  profile,
  handlers
) {
  container.innerHTML = "";

  if (products.length === 0) {
    container.innerHTML = `
      <div class="admin-empty-state">
        <p>No encontramos productos con estos filtros.</p>
      </div>
    `;
    return;
  }

  products.forEach((product) => {
    const category = profile.categories
      .find((item) => item.id === product.categoryId);

    const price = formatAdminPrice(product);

    const article = document.createElement("article");
    article.className = "admin-product-card";

    if (!product.active) {
      article.classList.add("is-hidden");
    }

    article.innerHTML = `
      <div class="admin-product-card__media">
        <img src="${product.image}" alt="${escapeHtml(product.name)}" loading="lazy">
        ${!product.active ? '<span class="admin-product-card__hidden-badge">Oculto</span>' : ""}
      </div>

      <div class="admin-product-card__content">
        <div class="admin-product-card__actions">
          <button
            class="admin-action admin-action--edit"
            type="button"
            disabled
            title="Disponible en la próxima implementación"
          >
            Editar
          </button>

          <button
            class="admin-action admin-action--visibility"
            type="button"
            data-toggle-visibility
          >
            ${product.active ? "Ocultar" : "Mostrar"}
          </button>
        </div>

        <p class="admin-product-card__category">${escapeHtml(category?.label ?? "")}</p>
        <h3>${escapeHtml(product.name)}</h3>
        <p class="admin-product-card__sku">Código: ${escapeHtml(product.sku)}</p>
        <p class="admin-product-card__price">${escapeHtml(price.primary)}</p>
        <p class="admin-product-card__price-note">${escapeHtml(price.secondary)}</p>
        <p class="admin-product-card__description">${escapeHtml(product.description)}</p>
      </div>
    `;

    article
      .querySelector("[data-toggle-visibility]")
      .addEventListener("click", () => {
        handlers.onToggleVisibility(product.id, product.active);
      });

    container.appendChild(article);
  });
}

export function setAdminFeedback(container, message = "") {
  container.textContent = message;
  container.hidden = !message;
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
