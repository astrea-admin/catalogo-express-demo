function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function asNumber(value, fallback = 0) {
  const normalized = String(value ?? "")
    .replace(",", ".")
    .trim();

  const number = Number(normalized);
  return Number.isFinite(number) ? number : fallback;
}

function slugify(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getBasePrice(product) {
  if (!product) {
    return "";
  }

  if (product.purchase.pricing.mode === "tiered") {
    return product.purchase.pricing.tiers[0]?.amount ?? "";
  }

  return product.purchase.pricing.amount ?? "";
}

function getWholesaleTier(product) {
  if (!product || product.purchase.pricing.mode !== "tiered") {
    return null;
  }

  return product.purchase.pricing.tiers[1] ?? null;
}

function getKitchenGroup(product) {
  return product?.purchase.optionGroups?.[0] ?? null;
}

function getDefaultEditorValues(profile, product) {
  const isNew = !product;
  const wholesaleTier = getWholesaleTier(product);
  const kitchenGroup = getKitchenGroup(product);

  return {
    name: product?.name ?? "",
    sku: product?.sku ?? "",
    categoryId: product?.categoryId ?? profile.categories[0]?.id ?? "",
    description: product?.description ?? "",
    image: product?.image ?? "",
    active: product?.active ?? true,
    price: getBasePrice(product),

    almacenSaleMode: product?.purchase.quantity.unit === "kg" ? "weight" : "unit",
    weightMin: product?.purchase.quantity.unit === "kg"
      ? product.purchase.quantity.min
      : 0.5,
    weightStep: product?.purchase.quantity.unit === "kg"
      ? product.purchase.quantity.step
      : 0.5,

    kitchenConfigurable: Boolean(kitchenGroup),
    kitchenGroupLabel: kitchenGroup?.label ?? "Elegí tu guarnición",
    kitchenOptions: kitchenGroup
      ? kitchenGroup.options.map((option) => option.label).join("\n")
      : "",

    wholesaleUnit: product?.purchase.quantity.unit ?? "unit",
    wholesaleMin: wholesaleTier?.minQty ?? 3,
    wholesalePrice: wholesaleTier?.amount ?? "",

    isNew
  };
}

function renderProfileFields(profileId, values) {
  if (profileId === "almacen") {
    return `
      <fieldset class="admin-editor-section">
        <legend>Forma de venta</legend>

        <label class="admin-editor-field">
          <span>Modalidad</span>
          <select name="almacenSaleMode" data-sale-mode>
            <option value="unit" ${values.almacenSaleMode === "unit" ? "selected" : ""}>
              Por unidad
            </option>
            <option value="weight" ${values.almacenSaleMode === "weight" ? "selected" : ""}>
              Por peso
            </option>
          </select>
        </label>

        <div class="admin-editor-weight-fields" data-weight-fields>
          <label class="admin-editor-field">
            <span>Cantidad mínima (kg)</span>
            <input
              type="number"
              name="weightMin"
              min="0.01"
              step="0.01"
              value="${escapeHtml(values.weightMin)}"
            >
          </label>

          <label class="admin-editor-field">
            <span>Incremento (kg)</span>
            <input
              type="number"
              name="weightStep"
              min="0.01"
              step="0.01"
              value="${escapeHtml(values.weightStep)}"
            >
          </label>
        </div>
      </fieldset>
    `;
  }

  if (profileId === "cocina") {
    return `
      <fieldset class="admin-editor-section">
        <legend>Configuración del producto</legend>

        <label class="admin-editor-check">
          <input
            type="checkbox"
            name="kitchenConfigurable"
            data-kitchen-configurable
            ${values.kitchenConfigurable ? "checked" : ""}
          >
          <span>Producto configurable</span>
        </label>

        <div class="admin-editor-kitchen-fields" data-kitchen-fields>
          <label class="admin-editor-field">
            <span>Pregunta / grupo</span>
            <input
              type="text"
              name="kitchenGroupLabel"
              value="${escapeHtml(values.kitchenGroupLabel)}"
              placeholder="Ej. Elegí tu guarnición"
            >
          </label>

          <label class="admin-editor-field">
            <span>Opciones · una por línea</span>
            <textarea
              name="kitchenOptions"
              rows="5"
              placeholder="Arroz kesú&#10;Fideo al pesto&#10;Puré de papas"
            >${escapeHtml(values.kitchenOptions)}</textarea>
          </label>
        </div>
      </fieldset>
    `;
  }

  if (profileId === "mayoristas") {
    return `
      <fieldset class="admin-editor-section">
        <legend>Precio por cantidad</legend>

        <label class="admin-editor-field">
          <span>Unidad comercial</span>
          <select name="wholesaleUnit">
            <option value="unit" ${values.wholesaleUnit === "unit" ? "selected" : ""}>Unidad</option>
            <option value="box" ${values.wholesaleUnit === "box" ? "selected" : ""}>Caja</option>
            <option value="pack" ${values.wholesaleUnit === "pack" ? "selected" : ""}>Pack</option>
          </select>
        </label>

        <div class="admin-editor-grid">
          <label class="admin-editor-field">
            <span>Desde cantidad</span>
            <input
              type="number"
              name="wholesaleMin"
              min="2"
              step="1"
              value="${escapeHtml(values.wholesaleMin)}"
            >
          </label>

          <label class="admin-editor-field">
            <span>Precio mayorista</span>
            <input
              type="number"
              name="wholesalePrice"
              min="1"
              step="1"
              value="${escapeHtml(values.wholesalePrice)}"
            >
          </label>
        </div>
      </fieldset>
    `;
  }

  return `
    <div class="admin-editor-note">
      Venta simple por unidad.
    </div>
  `;
}

function buildProductFromForm(profile, form, currentProduct) {
  const formData = new FormData(form);

  const name = String(formData.get("name") ?? "").trim();
  const sku = String(formData.get("sku") ?? "").trim();
  const categoryId = String(formData.get("categoryId") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const image = String(formData.get("image") ?? "").trim();
  const price = asNumber(formData.get("price"), 0);
  const active = formData.get("active") === "on";

  const base = {
    id: currentProduct?.id,
    sku,
    name,
    categoryId,
    description,
    image,
    gallery: currentProduct?.gallery ?? [],
    badge: currentProduct?.badge ?? null,
    active
  };

  if (profile.id === "almacen") {
    const saleMode = String(formData.get("almacenSaleMode") ?? "unit");

    base.purchase = {
      quantity: saleMode === "weight"
        ? {
            unit: "kg",
            label: "kg",
            min: asNumber(formData.get("weightMin"), 0.5),
            step: asNumber(formData.get("weightStep"), 0.5)
          }
        : {
            unit: "unit",
            label: "unidad",
            min: 1,
            step: 1
          },
      pricing: {
        mode: "fixed",
        amount: price
      },
      optionGroups: []
    };

    base.badge = saleMode === "weight"
      ? (currentProduct?.badge || "Venta por peso")
      : null;

    return base;
  }

  if (profile.id === "cocina") {
    const configurable = formData.get("kitchenConfigurable") === "on";

    const options = String(formData.get("kitchenOptions") ?? "")
      .split("\n")
      .map((label) => label.trim())
      .filter(Boolean)
      .map((label) => ({
        id: slugify(label),
        label
      }));

    base.purchase = {
      quantity: {
        unit: "unit",
        label: "unidad",
        min: 1,
        step: 1
      },
      pricing: {
        mode: "fixed",
        amount: price
      },
      optionGroups: configurable
        ? [{
            id: currentProduct?.purchase.optionGroups?.[0]?.id ?? "options",
            label: String(formData.get("kitchenGroupLabel") ?? "").trim(),
            required: true,
            maxSelections: 1,
            options
          }]
        : []
    };

    return base;
  }

  if (profile.id === "mayoristas") {
    const unit = String(formData.get("wholesaleUnit") ?? "unit");

    const unitLabels = {
      unit: "unidad",
      box: "caja",
      pack: "pack"
    };

    base.purchase = {
      quantity: {
        unit,
        label: unitLabels[unit] ?? "unidad",
        min: 1,
        step: 1
      },
      pricing: {
        mode: "tiered",
        tiers: [
          {
            minQty: 1,
            amount: price
          },
          {
            minQty: Math.max(2, Math.trunc(asNumber(formData.get("wholesaleMin"), 3))),
            amount: asNumber(formData.get("wholesalePrice"), price)
          }
        ]
      },
      optionGroups: []
    };

    base.badge = currentProduct?.badge ?? "Precio por volumen";

    return base;
  }

  base.purchase = {
    quantity: {
      unit: "unit",
      label: "unidad",
      min: 1,
      step: 1
    },
    pricing: {
      mode: "fixed",
      amount: price
    },
    optionGroups: []
  };

  return base;
}

function validateProduct(profile, product) {
  if (!product.name) {
    return "Ingresá el nombre del producto.";
  }

  if (!product.sku) {
    return "Ingresá el código del producto.";
  }

  if (!product.categoryId) {
    return "Seleccioná una categoría.";
  }

  if (!product.image) {
    return "Ingresá una ruta o URL de imagen.";
  }

  const basePrice = product.purchase.pricing.mode === "tiered"
    ? product.purchase.pricing.tiers[0]?.amount
    : product.purchase.pricing.amount;

  if (!Number.isFinite(basePrice) || basePrice <= 0) {
    return "Ingresá un precio válido.";
  }

  if (profile.id === "almacen" && product.purchase.quantity.unit === "kg") {
    if (product.purchase.quantity.min <= 0 || product.purchase.quantity.step <= 0) {
      return "La cantidad mínima y el incremento deben ser mayores a cero.";
    }
  }

  if (profile.id === "cocina" && product.purchase.optionGroups.length > 0) {
    const group = product.purchase.optionGroups[0];

    if (!group.label) {
      return "Ingresá el texto del grupo de opciones.";
    }

    if (group.options.length < 2) {
      return "Ingresá al menos dos opciones para el producto configurable.";
    }
  }

  if (profile.id === "mayoristas") {
    const [, wholesaleTier] = product.purchase.pricing.tiers;

    if (!wholesaleTier || wholesaleTier.amount <= 0) {
      return "Ingresá un precio mayorista válido.";
    }

    if (wholesaleTier.minQty < 2) {
      return "La cantidad mayorista debe comenzar desde 2 unidades.";
    }
  }

  return "";
}

export function renderAdminEditor(
  container,
  profile,
  product,
  handlers
) {
  const values = getDefaultEditorValues(profile, product);
  const title = product ? "Editar producto" : "Agregar nuevo producto";

  container.innerHTML = `
    <form class="admin-editor-form" novalidate>
      <div class="admin-editor-header">
        <div>
          <p>Admin · ${escapeHtml(profile.label)}</p>
          <h2>${title}</h2>
        </div>

        <button
          class="admin-editor-close"
          type="button"
          aria-label="Cerrar editor"
          data-editor-close
        >
          ×
        </button>
      </div>

      <div class="admin-editor-body">
        <div class="admin-editor-grid">
          <label class="admin-editor-field">
            <span>Nombre</span>
            <input
              type="text"
              name="name"
              value="${escapeHtml(values.name)}"
              placeholder="Nombre del producto"
              required
            >
          </label>

          <label class="admin-editor-field">
            <span>Código</span>
            <input
              type="text"
              name="sku"
              value="${escapeHtml(values.sku)}"
              placeholder="ABC-001"
              required
            >
          </label>
        </div>

        <div class="admin-editor-grid">
          <label class="admin-editor-field">
            <span>Categoría</span>
            <select name="categoryId" required>
              ${profile.categories.map((category) => `
                <option
                  value="${escapeHtml(category.id)}"
                  ${category.id === values.categoryId ? "selected" : ""}
                >
                  ${escapeHtml(category.label)}
                </option>
              `).join("")}
            </select>
          </label>

          <label class="admin-editor-field">
            <span>Precio</span>
            <input
              type="number"
              name="price"
              min="1"
              step="1"
              value="${escapeHtml(values.price)}"
              placeholder="50000"
              required
            >
          </label>
        </div>

        <label class="admin-editor-field">
          <span>Descripción</span>
          <textarea
            name="description"
            rows="3"
            placeholder="Descripción breve del producto"
          >${escapeHtml(values.description)}</textarea>
        </label>

        <label class="admin-editor-field">
          <span>Imagen · ruta o URL</span>
          <input
            type="text"
            name="image"
            value="${escapeHtml(values.image)}"
            placeholder="./assets/demo/..."
            required
          >
        </label>

        ${renderProfileFields(profile.id, values)}

        <label class="admin-editor-check admin-editor-check--visibility">
          <input
            type="checkbox"
            name="active"
            ${values.active ? "checked" : ""}
          >
          <span>Visible en el catálogo</span>
        </label>

        <p class="admin-editor-error" data-editor-error role="alert"></p>
      </div>

      <div class="admin-editor-footer">
        <button
          class="button admin-editor-cancel"
          type="button"
          data-editor-cancel
        >
          Cancelar
        </button>

        <button
          class="button admin-editor-save"
          type="submit"
        >
          Guardar producto
        </button>
      </div>
    </form>
  `;

  const form = container.querySelector(".admin-editor-form");
  const errorOutput = container.querySelector("[data-editor-error]");

  const saleMode = form.querySelector("[data-sale-mode]");
  const weightFields = form.querySelector("[data-weight-fields]");

  function refreshWeightFields() {
    if (!saleMode || !weightFields) {
      return;
    }

    weightFields.hidden = saleMode.value !== "weight";
  }

  saleMode?.addEventListener("change", refreshWeightFields);
  refreshWeightFields();

  const configurable = form.querySelector("[data-kitchen-configurable]");
  const kitchenFields = form.querySelector("[data-kitchen-fields]");

  function refreshKitchenFields() {
    if (!configurable || !kitchenFields) {
      return;
    }

    kitchenFields.hidden = !configurable.checked;
  }

  configurable?.addEventListener("change", refreshKitchenFields);
  refreshKitchenFields();

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const nextProduct = buildProductFromForm(profile, form, product);
    const validationError = validateProduct(profile, nextProduct);

    if (validationError) {
      errorOutput.textContent = validationError;
      return;
    }

    errorOutput.textContent = "";

    handlers.onSubmit({
      productId: product?.id ?? null,
      product: nextProduct
    });
  });

  container
    .querySelector("[data-editor-close]")
    .addEventListener("click", handlers.onCancel);

  container
    .querySelector("[data-editor-cancel]")
    .addEventListener("click", handlers.onCancel);
}
