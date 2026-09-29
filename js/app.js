import { addToCart, clearCart, removeCartLine, setCartLineQuantity } from "./cart.js";
import { filterProducts } from "./catalog.js";
import { renderAdminEditor } from "./admin-editor.js";
import {
  renderAdminCategories,
  renderAdminProducts,
  renderAdminStatus,
  setAdminFeedback
} from "./admin.js";
import { submitSandboxOrder } from "./checkout.js";
import {
  createProduct,
  getAdminProduct,
  getAdminProducts,
  getProduct,
  getProfile,
  getProducts,
  resetDemo,
  setProductVisibility,
  updateProduct
} from "./repository.js";
import {
  resetAdminFilters,
  resetCatalogFilters,
  state,
  updateState
} from "./state.js";
import {
  closeProductDialog,
  renderCart,
  renderCatalogStatus,
  renderCategories,
  renderProductDetail,
  renderProductGrid,
  showProductDialog
} from "./ui.js";

const elements = {
  searchInput: document.querySelector("#search-input"),
  categoryFilter: document.querySelector("#category-filter"),
  catalogStatus: document.querySelector("#catalog-status"),
  productGrid: document.querySelector("#product-grid"),
  productDialog: document.querySelector("#product-dialog"),
  productDetail: document.querySelector("#product-detail"),
  cartContent: document.querySelector("#cart-content"),
  cartCount: document.querySelector("#cart-count"),
  cartPanel: document.querySelector("#cart-panel"),
  floatingCart: document.querySelector("#floating-cart"),
  floatingCartCount: document.querySelector("#floating-cart-count"),
  profileEyebrow: document.querySelector("#profile-eyebrow"),
  demoSection: document.querySelector("#demo-section"),
  changeProfile: document.querySelector("#change-profile"),
  businessOptions: [...document.querySelectorAll("[data-profile]")],

  demoViewToggle: document.querySelector("#demo-view-toggle"),
  demoViewLabel: document.querySelector("#demo-view-label"),
  demoViewList: document.querySelector("#demo-view-list"),
  demoViewOption: document.querySelector("[data-demo-view]"),
  catalogView: document.querySelector("#catalog-view"),
  adminView: document.querySelector("#admin-view"),
  adminProfileLabel: document.querySelector("#admin-profile-label"),
  adminSearchInput: document.querySelector("#admin-search-input"),
  adminCategoryFilter: document.querySelector("#admin-category-filter"),
  adminStatus: document.querySelector("#admin-status"),
  adminProductList: document.querySelector("#admin-product-list"),
  adminFeedback: document.querySelector("#admin-feedback"),
  adminAddProduct: document.querySelector("#admin-add-product"),
  adminEditorDialog: document.querySelector("#admin-editor-dialog"),
  adminEditorRoot: document.querySelector("#admin-editor-root"),
  welcomeScreen: document.querySelector("#welcome-screen"),
  resetDemoButton: document.querySelector("#admin-reset-demo"),
  resetDemoDialog: document.querySelector("#reset-demo-dialog"),
  resetDemoCancel: document.querySelector("#reset-demo-cancel"),
  resetDemoConfirm: document.querySelector("#reset-demo-confirm"),
  checkoutDialog: document.querySelector("#checkout-dialog"),
  checkoutReturn: document.querySelector("#checkout-return")
};

let profile = null;

function profileExists(profileId) {
  return Boolean(getProfile(profileId));
}

function setDemoView(view) {
  const isAdmin = view === "admin";

  elements.catalogView.hidden = isAdmin;
  elements.adminView.hidden = !isAdmin;

  elements.demoViewLabel.textContent = isAdmin
    ? "Demo Admin ASTREA™"
    : "Demo Catálogo Express®";

  elements.demoViewOption.dataset.demoView = isAdmin ? "catalog" : "admin";
  elements.demoViewOption.textContent = isAdmin
    ? "Demo Catálogo Express®"
    : "Demo Admin ASTREA™";

  if (isAdmin) {
    renderAdmin();
  } else if (profile) {
    profile = getProfile(state.activeProfileId);
    renderCatalog();
    renderCurrentCart();
  }

  closeDemoViewMenu();
}

function openDemoViewMenu() {
  elements.demoViewList.hidden = false;
  elements.demoViewToggle.setAttribute("aria-expanded", "true");
}

function closeDemoViewMenu() {
  elements.demoViewList.hidden = true;
  elements.demoViewToggle.setAttribute("aria-expanded", "false");
}

function toggleDemoViewMenu() {
  if (elements.demoViewList.hidden) {
    openDemoViewMenu();
  } else {
    closeDemoViewMenu();
  }
}

function activateProfile(profileId, { scrollToDemo = true } = {}) {
  const nextProfile = getProfile(profileId);

  if (!nextProfile) {
    return;
  }

  profile = nextProfile;

  resetCatalogFilters();
  resetAdminFilters();

  updateState({
    activeProfileId: profile.id,
    selectedProductId: null,
    cart: clearCart()
  });

  elements.searchInput.value = "";
  elements.adminSearchInput.value = "";
  elements.profileEyebrow.textContent = `Demo - ${profile.label}`;
  elements.adminProfileLabel.textContent = `Admin - ${profile.label}`;
  setAdminFeedback(elements.adminFeedback);

  elements.demoSection.hidden = false;

  if (!scrollToDemo) {
    elements.welcomeScreen.hidden = true;
  } else {
    elements.welcomeScreen.hidden = false;
  }

  if (elements.checkoutDialog.open) {
    elements.checkoutDialog.close();
  }

  elements.businessOptions.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.profile === profile.id);
  });

  setDemoView("catalog");
  renderCatalog();
  renderCurrentCart();

  if (scrollToDemo) {
    transitionWelcomeToDemo();
  } else {
    window.scrollTo({
      top: 0,
      behavior: "auto"
    });
  }
}

function transitionWelcomeToDemo() {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reducedMotion) {
    elements.welcomeScreen.hidden = true;
    window.scrollTo({ top: 0, behavior: "auto" });
    return;
  }

  let finalized = false;
  let fallbackTimer = null;

  function finalizeTransition() {
    if (finalized) {
      return;
    }

    finalized = true;

    if (fallbackTimer) {
      window.clearTimeout(fallbackTimer);
    }

    window.removeEventListener("scrollend", finalizeTransition);

    elements.welcomeScreen.hidden = true;
    window.scrollTo({
      top: 0,
      behavior: "auto"
    });
  }

  requestAnimationFrame(() => {
    elements.demoSection.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

    if ("onscrollend" in window) {
      window.addEventListener("scrollend", finalizeTransition, { once: true });
    }

    fallbackTimer = window.setTimeout(finalizeTransition, 850);
  });
}

function getVisibleAdminProducts() {
  const products = getAdminProducts(state.activeProfileId);

  return filterProducts(products, {
    query: state.adminSearchQuery,
    categoryId: state.adminActiveCategoryId
  });
}

function renderAdmin() {
  if (!profile) {
    return;
  }

  profile = getProfile(state.activeProfileId);

  const products = getAdminProducts(state.activeProfileId);
  const visibleProducts = getVisibleAdminProducts();

  elements.adminProfileLabel.textContent = `Admin - ${profile.label}`;

  renderAdminCategories(
    elements.adminCategoryFilter,
    profile.categories,
    state.adminActiveCategoryId,
    (categoryId) => {
      updateState({ adminActiveCategoryId: categoryId });
      renderAdmin();
    }
  );

  renderAdminProducts(
    elements.adminProductList,
    visibleProducts,
    profile,
    {
      onEdit(productId) {
        openAdminEditor(productId);
      },

      onToggleVisibility(productId, currentlyActive) {
        toggleAdminProductVisibility(productId, currentlyActive);
      }
    }
  );

  renderAdminStatus(elements.adminStatus, products);
}

function openResetDemoConfirmation() {
  closeDemoViewMenu();

  if (!elements.resetDemoDialog.open) {
    elements.resetDemoDialog.showModal();
  }
}

function closeResetDemoConfirmation() {
  if (elements.resetDemoDialog.open) {
    elements.resetDemoDialog.close();
  }
}

function confirmResetDemo() {
  resetDemo();

  resetCatalogFilters();
  resetAdminFilters();

  updateState({
    selectedProductId: null,
    cart: clearCart()
  });

  elements.searchInput.value = "";
  elements.adminSearchInput.value = "";

  profile = getProfile(state.activeProfileId);

  closeAdminEditor();
  closeResetDemoConfirmation();

  renderCurrentCart();
  renderCatalog();
  renderAdmin();

  setAdminFeedback(
    elements.adminFeedback,
    "Demo restablecida. Los productos volvieron a su estado original."
  );
}

function openAdminEditor(productId = null) {
  if (!profile) {
    return;
  }

  const currentProduct = productId
    ? getAdminProduct(state.activeProfileId, productId)
    : null;

  renderAdminEditor(
    elements.adminEditorRoot,
    profile,
    currentProduct,
    {
      onSubmit(payload) {
        saveAdminProduct(payload);
      },

      onCancel() {
        closeAdminEditor();
      }
    }
  );

  if (!elements.adminEditorDialog.open) {
    elements.adminEditorDialog.showModal();
  }
}

function closeAdminEditor() {
  if (elements.adminEditorDialog.open) {
    elements.adminEditorDialog.close();
  }

  elements.adminEditorRoot.innerHTML = "";
}

function saveAdminProduct({ productId, product }) {
  const result = productId
    ? updateProduct(state.activeProfileId, productId, product)
    : createProduct(state.activeProfileId, product);

  if (!result.ok) {
    const errorOutput = elements.adminEditorRoot
      .querySelector("[data-editor-error]");

    if (errorOutput) {
      errorOutput.textContent = result.reason === "duplicate-sku"
        ? "Ya existe un producto con ese código."
        : "No pudimos guardar el producto.";
    }

    return;
  }

  updateState({
    cart: clearCart()
  });

  renderCurrentCart();

  profile = getProfile(state.activeProfileId);

  closeAdminEditor();

  setAdminFeedback(
    elements.adminFeedback,
    productId
      ? "Producto actualizado. El carrito de la demo fue reiniciado."
      : "Producto agregado. Ya podés verlo en el catálogo."
  );

  renderAdmin();
}

function toggleAdminProductVisibility(productId, currentlyActive) {
  const nextActive = !currentlyActive;

  const updated = setProductVisibility(
    state.activeProfileId,
    productId,
    nextActive
  );

  if (!updated) {
    setAdminFeedback(
      elements.adminFeedback,
      "No pudimos actualizar el producto."
    );
    return;
  }

  updateState({
    cart: clearCart()
  });

  renderCurrentCart();

  setAdminFeedback(
    elements.adminFeedback,
    nextActive
      ? "Producto visible en el catálogo. El carrito de la demo fue reiniciado."
      : "Producto ocultado del catálogo. El carrito de la demo fue reiniciado."
  );

  renderAdmin();
}

function getActiveProducts() {
  return profile ? getProducts(state.activeProfileId) : [];
}

function getVisibleProducts() {
  return filterProducts(getActiveProducts(), {
    query: state.searchQuery,
    categoryId: state.activeCategoryId
  });
}

function renderCatalog() {
  const products = getActiveProducts();
  const visibleProducts = getVisibleProducts();

  renderCategories(
    elements.categoryFilter,
    profile.categories,
    state.activeCategoryId,
    (categoryId) => {
      updateState({ activeCategoryId: categoryId });
      renderCatalog();
    }
  );

  renderProductGrid(
    elements.productGrid,
    visibleProducts,
    profile,
    openProduct
  );

  renderCatalogStatus(
    elements.catalogStatus,
    visibleProducts.length,
    products.length
  );
}

function renderCurrentCart() {
  renderCart(
    elements.cartContent,
    elements.cartCount,
    state.cart,
    (productId) => getProduct(state.activeProfileId, productId),
    {
      onChangeQuantity(lineId, quantity) {
        updateState({
          cart: setCartLineQuantity(state.cart, lineId, quantity)
        });

        renderCurrentCart();
      },

      onRemove(lineId) {
        updateState({
          cart: removeCartLine(state.cart, lineId)
        });

        renderCurrentCart();
      },

      onCheckout() {
        completeSandboxCheckout();
      }
    }
  );

  renderFloatingCart();
}

function completeSandboxCheckout() {
  const result = submitSandboxOrder(state.cart);

  if (!result.ok) {
    return;
  }

  updateState({
    cart: clearCart()
  });

  renderCurrentCart();

  if (!elements.checkoutDialog.open) {
    elements.checkoutDialog.showModal();
  }
}

function returnFromCheckout() {
  if (elements.checkoutDialog.open) {
    elements.checkoutDialog.close();
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const target = elements.catalogView.querySelector(".page-shell");

  target.scrollIntoView({
    behavior: reducedMotion ? "auto" : "smooth",
    block: "start"
  });
}

function renderFloatingCart() {
  const itemCount = state.cart.length;

  elements.floatingCartCount.textContent = String(itemCount);
  elements.floatingCart.hidden = itemCount === 0;
  elements.floatingCart.setAttribute(
    "aria-label",
    `Ir al carrito · ${itemCount} ${itemCount === 1 ? "producto" : "productos"}`
  );
}

function openProduct(productId) {
  const product = getProduct(state.activeProfileId, productId);

  if (!product) {
    return;
  }

  updateState({ selectedProductId: productId });

  const category = profile.categories.find(
    (item) => item.id === product.categoryId
  );

  renderProductDetail(
    elements.productDetail,
    product,
    category?.label ?? "",
    {
      onAddToCart(payload) {
        updateState({
          cart: addToCart(state.cart, payload)
        });

        renderCurrentCart();
        closeProduct();
      },

      onClose: closeProduct
    }
  );

  showProductDialog(elements.productDialog);
}

function closeProduct() {
  closeProductDialog(elements.productDialog);
  updateState({ selectedProductId: null });
}

elements.businessOptions.forEach((button) => {
  button.addEventListener("click", () => {
    activateProfile(button.dataset.profile);
  });
});

elements.changeProfile.addEventListener("click", () => {
  closeDemoViewMenu();
  closeProduct();

  if (elements.adminEditorDialog.open) {
    closeAdminEditor();
  }

  if (elements.checkoutDialog.open) {
    elements.checkoutDialog.close();
  }

  if (elements.resetDemoDialog.open) {
    closeResetDemoConfirmation();
  }

  elements.demoSection.hidden = true;
  elements.welcomeScreen.hidden = false;

  elements.businessOptions.forEach((button) => {
    button.classList.remove("is-active");
  });

  window.scrollTo({
    top: 0,
    behavior: "auto"
  });
});

elements.demoViewToggle.addEventListener("click", () => {
  toggleDemoViewMenu();
});

elements.demoViewOption.addEventListener("click", () => {
  setDemoView(elements.demoViewOption.dataset.demoView);
});

document.addEventListener("click", (event) => {
  if (
    !elements.demoViewToggle.contains(event.target) &&
    !elements.demoViewList.contains(event.target)
  ) {
    closeDemoViewMenu();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeDemoViewMenu();

    if (elements.resetDemoDialog.open) {
      closeResetDemoConfirmation();
    }
  }
});

elements.resetDemoButton.addEventListener("click", () => {
  openResetDemoConfirmation();
});

elements.resetDemoCancel.addEventListener("click", () => {
  closeResetDemoConfirmation();
});

elements.resetDemoConfirm.addEventListener("click", () => {
  confirmResetDemo();
});

elements.resetDemoDialog.addEventListener("click", (event) => {
  if (event.target === elements.resetDemoDialog) {
    closeResetDemoConfirmation();
  }
});

elements.adminAddProduct.addEventListener("click", () => {
  openAdminEditor();
});

elements.adminEditorDialog.addEventListener("click", (event) => {
  if (event.target === elements.adminEditorDialog) {
    closeAdminEditor();
  }
});

elements.adminEditorDialog.addEventListener("close", () => {
  elements.adminEditorRoot.innerHTML = "";
});

elements.adminSearchInput.addEventListener("input", (event) => {
  updateState({
    adminSearchQuery: event.target.value
  });

  renderAdmin();
});

elements.searchInput.addEventListener("input", (event) => {
  updateState({ searchQuery: event.target.value });
  renderCatalog();
});

elements.checkoutReturn.addEventListener("click", () => {
  returnFromCheckout();
});

elements.floatingCart.addEventListener("click", () => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  elements.cartPanel.scrollIntoView({
    behavior: reducedMotion ? "auto" : "smooth",
    block: "start"
  });

  elements.cartPanel.focus({ preventScroll: true });
});

elements.productDialog.addEventListener("click", (event) => {
  if (event.target === elements.productDialog) {
    closeProduct();
  }
});

elements.productDialog.addEventListener("close", () => {
  updateState({ selectedProductId: null });
});

const requestedProfileId = new URLSearchParams(window.location.search).get("profile");

if (requestedProfileId && profileExists(requestedProfileId)) {
  activateProfile(requestedProfileId, { scrollToDemo: false });
} else {
  elements.demoSection.hidden = true;
  elements.welcomeScreen.hidden = false;
}
