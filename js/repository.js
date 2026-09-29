import { DEMO_PROFILES } from "./data/index.js";

const STORAGE_KEY = "astrea.catalogExpress.demo.v1";
const SCHEMA_VERSION = 1;

let memoryFallback = null;

function clone(value) {
  return structuredClone(value);
}

function createSeedState() {
  return {
    schemaVersion: SCHEMA_VERSION,
    profiles: clone(DEMO_PROFILES)
  };
}

function isValidState(value) {
  return Boolean(
    value &&
    value.schemaVersion === SCHEMA_VERSION &&
    Array.isArray(value.profiles)
  );
}

function readState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      const seed = createSeedState();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }

    const parsed = JSON.parse(raw);

    if (!isValidState(parsed)) {
      const seed = createSeedState();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }

    return parsed;
  } catch (error) {
    if (!memoryFallback) {
      memoryFallback = createSeedState();
    }

    return clone(memoryFallback);
  }
}

function writeState(nextState) {
  const safeState = clone(nextState);

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(safeState));
  } catch (error) {
    memoryFallback = safeState;
  }

  return clone(safeState);
}

function findProfile(state, profileId) {
  return state.profiles.find((profile) => profile.id === profileId) ?? null;
}

export function getProfiles() {
  return readState().profiles.map(({ id, label }) => ({ id, label }));
}

export function getProfile(profileId) {
  const profile = findProfile(readState(), profileId);
  return profile ? clone(profile) : null;
}

export function getProducts(profileId) {
  const profile = getProfile(profileId);

  return profile
    ? profile.products.filter((product) => product.active)
    : [];
}

export function getAdminProducts(profileId) {
  const profile = getProfile(profileId);
  return profile ? profile.products : [];
}

export function getProduct(profileId, productId) {
  return getProducts(profileId)
    .find((product) => product.id === productId) ?? null;
}

export function getAdminProduct(profileId, productId) {
  return getAdminProducts(profileId)
    .find((product) => product.id === productId) ?? null;
}

export function setProductVisibility(profileId, productId, active) {
  const state = readState();
  const profile = findProfile(state, profileId);

  if (!profile) {
    return null;
  }

  const product = profile.products.find((item) => item.id === productId);

  if (!product) {
    return null;
  }

  product.active = Boolean(active);
  writeState(state);

  return clone(product);
}


function normalizeSku(value = "") {
  return String(value).trim().toLowerCase();
}

function skuExists(profile, sku, excludeProductId = null) {
  const normalized = normalizeSku(sku);

  return profile.products.some((product) => (
    product.id !== excludeProductId &&
    normalizeSku(product.sku) === normalized
  ));
}

function makeProductId(profileId) {
  const prefix = {
    boutique: "btq",
    almacen: "alm",
    cocina: "coc",
    mayoristas: "may"
  }[profileId] ?? profileId.slice(0, 3);

  return `${prefix}-demo-${Date.now()}`;
}

export function createProduct(profileId, productData) {
  const state = readState();
  const profile = findProfile(state, profileId);

  if (!profile) {
    return { ok: false, reason: "profile-not-found" };
  }

  if (skuExists(profile, productData.sku)) {
    return { ok: false, reason: "duplicate-sku" };
  }

  const product = {
    ...clone(productData),
    id: makeProductId(profileId)
  };

  profile.products.push(product);
  writeState(state);

  return {
    ok: true,
    product: clone(product)
  };
}

export function updateProduct(profileId, productId, productData) {
  const state = readState();
  const profile = findProfile(state, profileId);

  if (!profile) {
    return { ok: false, reason: "profile-not-found" };
  }

  const index = profile.products.findIndex((product) => product.id === productId);

  if (index === -1) {
    return { ok: false, reason: "product-not-found" };
  }

  if (skuExists(profile, productData.sku, productId)) {
    return { ok: false, reason: "duplicate-sku" };
  }

  const current = profile.products[index];

  const updated = {
    ...clone(productData),
    id: current.id
  };

  profile.products[index] = updated;
  writeState(state);

  return {
    ok: true,
    product: clone(updated)
  };
}
