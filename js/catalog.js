function normalize(value = "") {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

export function filterProducts(products, { query = "", categoryId = null } = {}) {
  const normalizedQuery = normalize(query);

  return products.filter((product) => {
    const matchesCategory = !categoryId || product.categoryId === categoryId;

    if (!matchesCategory) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const haystack = normalize([
      product.name,
      product.sku,
      product.categoryId,
      product.description
    ].join(" "));

    return haystack.includes(normalizedQuery);
  });
}
