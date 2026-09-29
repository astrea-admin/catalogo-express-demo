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
