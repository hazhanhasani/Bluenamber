// The supplied developer text is a functional overview, NOT an executable API specification.
// Never guess Numberland endpoint URLs, authentication format or request payloads.
// These methods form an explicit, swappable contract for the real integration.
export class ProviderNotConfiguredError extends Error {
  constructor() {
    super("Numberland requires exact endpoint paths, authentication method and response examples");
    this.name = "ProviderNotConfiguredError";
  }
}

export class NumberlandAdapter {
  async getInventory({ type, service, country, operator }) {
    void type; void service; void country; void operator;
    throw new ProviderNotConfiguredError();
  }
  async reserveNumber({ type, service, country, operator, idempotencyKey }) {
    void type; void service; void country; void operator; void idempotencyKey;
    throw new ProviderNotConfiguredError();
  }
  async getStatus({ supplierOrderId }) {
    void supplierOrderId;
    throw new ProviderNotConfiguredError();
  }
  async setStatus({ supplierOrderId, action }) {
    void supplierOrderId; void action;
    throw new ProviderNotConfiguredError();
  }
}

export function isNumberlandConfigured() {
  return false;
}