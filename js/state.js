export const state = {
  activeProfileId: "boutique",

  searchQuery: "",
  activeCategoryId: null,

  adminSearchQuery: "",
  adminActiveCategoryId: null,

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

export function resetAdminFilters() {
  state.adminSearchQuery = "";
  state.adminActiveCategoryId = null;
}
