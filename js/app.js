import { addToCart, removeCartLine, setCartLineQuantity } from "./cart.js";
import { filterProducts } from "./catalog.js";
import { getProduct, getProfile, getProducts } from "./repository.js";
import { state, updateState } from "./state.js";
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
  cartCount: document.querySelector("#cart-count")
};

const profile = getProfile(state.activeProfileId);

if (!profile) {
  throw new Error(`No se encontró el perfil "${state.activeProfileId}".`);
}

function getActiveProducts() {
  return getProducts(state.activeProfileId);
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

elements.searchInput.addEventListener("input", (event) => {
  updateState({ searchQuery: event.target.value });
  renderCatalog();
});

elements.productDialog.addEventListener("click", (event) => {
  if (event.target === elements.productDialog) {
    closeProduct();
  }
});

elements.productDialog.addEventListener("close", () => {
  updateState({ selectedProductId: null });
});

renderCatalog();
renderCurrentCart();
