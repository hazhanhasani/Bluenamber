// Provider-independent domain rules. Nothing here authorizes purchasing.
export const NUMBER_TYPES = Object.freeze([
  { id: "standard", title: "شماره عادی", description: "دریافت شماره و پیامک در بازه زمانی محدود" },
  { id: "permanent", title: "شماره دائمی", description: "دسترسی بلندمدت؛ جزئیات و شرایط وابسته به موجودی نامبرلند" },
  { id: "rental", title: "شماره اجاره‌ای", description: "اجاره شماره با مدت و شرایط تعیین‌شده توسط تأمین‌کننده" },
]);

// Local states are internal, never assume they equal Numberland's numeric codes.
export const TRANSITIONS = Object.freeze({
  awaiting_payment: ["paid", "cancelled"],
  paid: ["reserving", "refund_pending"],
  reserving: ["waiting_code", "refund_pending"],
  waiting_code: ["code_received", "retry_requested", "cancel_requested", "expired"],
  retry_requested: ["waiting_code", "code_received", "expired"],
  code_received: ["finished", "retry_requested"],
  cancel_requested: ["cancelled", "waiting_code"],
  cancelled: ["refund_pending"],
  expired: ["refund_pending"],
  refund_pending: ["refunded", "refund_failed"],
  refund_failed: ["refund_pending"],
  refunded: [],
  finished: [],
});

export function moveOrder(order, next) {
  if (!order || typeof order !== "object") throw new TypeError("Order required");
  if (!Object.hasOwn(TRANSITIONS, order.status)) throw new Error("UNKNOWN_ORDER_STATE");
  if (!TRANSITIONS[order.status].includes(next)) throw new Error("INVALID_ORDER_TRANSITION");
  if ((next === "cancel_requested" || next === "cancelled") && order.smsReceived)
    throw new Error("SMS_ALREADY_RECEIVED");
  if ((next === "refund_pending" || next === "refunded") &&
      order.status !== "paid" && order.status !== "reserving" &&
      order.status !== "cancelled" && order.status !== "expired" &&
      order.status !== "refund_pending" && order.status !== "refund_failed")
    throw new Error("REFUND_NOT_ALLOWED");
  return { ...order, status: next };
}

// Supplier prices and currencies must not be inferred from the mobile client.
// Basis points provide deterministic percentage pricing for integer minor units.
export function calculateRetailPrice(supplierMinorUnits, markupBasisPoints, fixedFeeMinorUnits = 0) {
  for (const value of [supplierMinorUnits, markupBasisPoints, fixedFeeMinorUnits]) {
    if (!Number.isSafeInteger(value) || value < 0) throw new RangeError("INVALID_PRICE_COMPONENT");
  }
  if (markupBasisPoints > 100000) throw new RangeError("MARKUP_TOO_LARGE");
  const total = BigInt(supplierMinorUnits) +
    (BigInt(supplierMinorUnits) * BigInt(markupBasisPoints) + 9999n) / 10000n +
    BigInt(fixedFeeMinorUnits);
  if (total > BigInt(Number.MAX_SAFE_INTEGER)) throw new RangeError("PRICE_OVERFLOW");
  return Number(total);
}

export function validateSelection(selection) {
  if (!selection || typeof selection !== "object" || Array.isArray(selection)) return false;
  return NUMBER_TYPES.some(item => item.id === selection.type) &&
    typeof selection.service === "string" && /^[a-zA-Z0-9_-]{1,60}$/.test(selection.service) &&
    typeof selection.country === "string" && /^[a-zA-Z0-9_-]{1,60}$/.test(selection.country) &&
    (selection.operator == null ||
      (typeof selection.operator === "string" && /^[a-zA-Z0-9_-]{1,60}$/.test(selection.operator)));
}

export const PROVIDER_STEPS = Object.freeze([
  { id: "inventory", action: "Read country/service/operator stock and supplier prices", supported: false },
  { id: "purchase", action: "Reserve number; persist supplier numeric ID; confirm charged amount", supported: false },
  { id: "status", action: "Poll activation status and SMS, respecting time-to-live", supported: false },
  { id: "change_status", action: "Request cancel, finish or another SMS as allowed", supported: false },
  { id: "reconcile", action: "Confirm supplier-side refund and settle the customer separately", supported: false },
]);