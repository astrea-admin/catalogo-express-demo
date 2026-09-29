import { buildLineId } from "./purchase.js";

export function addToCart(cart, { productId, quantity, selections = {} }) {
  const lineId = buildLineId(productId, selections);
  const existing = cart.find((line) => line.lineId === lineId);

  if (existing) {
    return cart.map((line) => (
      line.lineId === lineId
        ? { ...line, quantity: line.quantity + quantity }
        : line
    ));
  }

  return [
    ...cart,
    {
      lineId,
      productId,
      quantity,
      selections: { ...selections }
    }
  ];
}

export function setCartLineQuantity(cart, lineId, quantity) {
  return cart.map((line) => (
    line.lineId === lineId
      ? { ...line, quantity }
      : line
  ));
}

export function removeCartLine(cart, lineId) {
  return cart.filter((line) => line.lineId !== lineId);
}

export function clearCart() {
  return [];
}
