import { addToCart, clearCart, removeCartLine, setCartLineQuantity } from "./cart.js";
import { filterProducts } from "./catalog.js";
import { getProduct, getProfile, getProducts } from "./repository.js";
import { resetCatalogFilters, state, updateState } from "./state.js";
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
  businessOptions: [...document.querySelectorAll("[data-profile]")]
};

let profile = null;

function profileExists(profileId) {
  return Boolean(getProfile(profileId));
}

function activateProfile(profileId, { scrollToDemo = true } = {}) {
  const nextProfile = getProfile(profileId);

  if (!nextProfile) {
    return;
  }

  profile = nextProfile;

  resetCatalogFilters();

  updateState({
    activeProfileId: profile.id,
    selectedProductId: null,
    cart: clearCart()
  });

  elements.searchInput.value = "";
  elements.profileEyebrow.textContent = `Demo · ${profile.label}`;
  elements.demoSection.hidden = false;

  elements.businessOptions.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.profile === profile.id);
  });

  renderCatalog();
  renderCurrentCart();

  if (scrollToDemo) {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    requestAnimationFrame(() => {
      elements.demoSection.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "start"
      });
    });
  }
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
      }
    }
  );

  renderFloatingCart();
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
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.querySelector("#welcome-title").scrollIntoView({
    behavior: reducedMotion ? "auto" : "smooth",
    block: "start"
  });
});

elements.searchInput.addEventListener("input", (event) => {
  updateState({ searchQuery: event.target.value });
  renderCatalog();
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
}
