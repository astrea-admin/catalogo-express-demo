export function getDefaultQuantity(product) {
  return product.purchase.quantity.min;
}

export function increaseQuantity(product, quantity) {
  const { step } = product.purchase.quantity;
  return roundQuantity(quantity + step, step);
}

export function decreaseQuantity(product, quantity) {
  const { min, step } = product.purchase.quantity;
  return Math.max(min, roundQuantity(quantity - step, step));
}

export function resolveUnitPrice(product, quantity) {
  const { pricing } = product.purchase;

  if (pricing.mode === "fixed") {
    return pricing.amount;
  }

  if (pricing.mode === "tiered") {
    const applicableTier = getActivePricingTier(product, quantity);

    if (!applicableTier) {
      throw new Error(`No hay un tramo de precio válido para ${product.id}`);
    }

    return applicableTier.amount;
  }

  throw new Error(`Modo de precio no soportado: ${pricing.mode}`);
}

export function getPricingTiers(product) {
  const { pricing } = product.purchase;

  if (pricing.mode !== "tiered") {
    return [];
  }

  return [...pricing.tiers].sort((a, b) => a.minQty - b.minQty);
}

export function getActivePricingTier(product, quantity) {
  return [...getPricingTiers(product)]
    .sort((a, b) => b.minQty - a.minQty)
    .find((tier) => quantity >= tier.minQty) ?? null;
}

export function getNextPricingTier(product, quantity) {
  return getPricingTiers(product)
    .find((tier) => tier.minQty > quantity) ?? null;
}

export function calculateSubtotal(product, quantity) {
  return resolveUnitPrice(product, quantity) * quantity;
}

export function validateSelections(product, selections = {}) {
  const groups = product.purchase.optionGroups ?? [];

  for (const group of groups) {
    if (!group.required) {
      continue;
    }

    const selectedOptionId = selections[group.id];

    if (!selectedOptionId) {
      return {
        valid: false,
        message: `Seleccioná una opción en “${group.label}”.`
      };
    }

    const exists = group.options.some((option) => option.id === selectedOptionId);

    if (!exists) {
      return {
        valid: false,
        message: `La selección de “${group.label}” no es válida.`
      };
    }
  }

  return { valid: true, message: "" };
}

export function buildLineId(productId, selections = {}) {
  const suffix = Object.entries(selections)
    .filter(([, value]) => Boolean(value))
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([key, value]) => `${key}:${value}`)
    .join("|");

  return suffix ? `${productId}|${suffix}` : productId;
}

export function getSelectionLabels(product, selections = {}) {
  const groups = product.purchase.optionGroups ?? [];

  return groups.flatMap((group) => {
    const selectedOptionId = selections[group.id];

    if (!selectedOptionId) {
      return [];
    }

    const option = group.options.find((item) => item.id === selectedOptionId);

    if (!option) {
      return [];
    }

    return [{
      groupId: group.id,
      groupLabel: group.label,
      optionId: option.id,
      optionLabel: option.label
    }];
  });
}

export function formatQuantity(product, quantity) {
  const { unit, label } = product.purchase.quantity;

  if (unit === "kg") {
    return `${formatDecimal(quantity)} ${label}`;
  }

  return `${formatDecimal(quantity)} ${quantity === 1 ? label : `${label}s`}`;
}

function roundQuantity(value, step) {
  const decimals = String(step).includes(".")
    ? String(step).split(".")[1].length
    : 0;

  return Number(value.toFixed(decimals));
}

function formatDecimal(value) {
  return new Intl.NumberFormat("es-PY", {
    maximumFractionDigits: 2
  }).format(value);
}
