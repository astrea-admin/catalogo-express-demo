export const state = {
  activeProfileId: "almacen",
  searchQuery: "",
  activeCategoryId: null,
  selectedProductId: null,
  cart: []
};

export function updateState(patch) {
  Object.assign(state, patch);
}

export function resetCatalogFilters() {
  state.searchQuery = "";
  state.activeCategoryId = null;
}
