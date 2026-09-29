export function submitSandboxOrder(cart) {
  if (!Array.isArray(cart) || cart.length === 0) {
    return {
      ok: false,
      reason: "empty-cart"
    };
  }

  return {
    ok: true,
    lineCount: cart.length
  };
}
