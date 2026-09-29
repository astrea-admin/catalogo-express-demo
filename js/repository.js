import { DEMO_PROFILES } from "./data/index.js";

function clone(value) {
  return structuredClone(value);
}

export function getProfiles() {
  return DEMO_PROFILES.map(({ id, label }) => ({ id, label }));
}

export function getProfile(profileId) {
  const profile = DEMO_PROFILES.find((item) => item.id === profileId);
  return profile ? clone(profile) : null;
}

export function getProducts(profileId) {
  const profile = getProfile(profileId);
  return profile ? profile.products.filter((product) => product.active) : [];
}

export function getProduct(profileId, productId) {
  return getProducts(profileId).find((product) => product.id === productId) ?? null;
}
