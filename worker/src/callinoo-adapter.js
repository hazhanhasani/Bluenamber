/**
 * Read-only Callinoo API adapter. Endpoint structures are from the
 * Callinoo integration notes; response schemas are not fully published.
 * This adapter NEVER reserves a phone number or spends funds.
 * API token is used on the Worker only, not in Android.
 */
export class CallinooError extends Error {
  constructor(code) {
    super(code);
    this.name = "CallinooError";
    this.code = code;
  }
}
const BASE = "https://api.ozvinoo.xyz";

export function isCallinooConfigured(env) {
  return typeof env?.CALLINOO_API_TOKEN === "string" &&
    env.CALLINOO_API_TOKEN.trim().length >= 8;
}

export class CallinooAdapter {
  constructor({ token, fetcher = fetch, timeoutMs = 8000 } = {}) {
    if (typeof token !== "string" || token.trim().length < 8) {
      throw new CallinooError("API_TOKEN_MISSING");
    }
    this.token = token.trim();
    this.fetcher = (url, options) => fetcher(url, options); // Preserve global fetch binding.
    this.timeoutMs = timeoutMs;
  }

  async #get(...segments) {
    const url = new URL(BASE);
    url.pathname = "/web/" + encodeURIComponent(this.token) + "/" +
      segments.map(part => encodeURIComponent(part)).join("/");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const res = await this.fetcher(url.toString(), {
        method: "GET",
        headers: { Accept: "application/json, text/plain;q=0.9" },
        signal: controller.signal,
        redirect: "manual", // Cloudflare Workers rejects redirect:"error"; do not follow 3xx.
        cache: "no-store"
      });
      if (res.status >= 300 && res.status < 400) throw new CallinooError("UPSTREAM_REDIRECT_BLOCKED");
      if (!res.ok) throw new CallinooError("UPSTREAM_HTTP_" + res.status);
      const txt = await res.text();
      if (txt.length > 262144) throw new CallinooError("UPSTREAM_RESPONSE_TOO_LARGE");
      try {
        return JSON.parse(txt);
      } catch {
        // Some provider implementations return text. Do not silently guess fields.
        return txt;
      }
    } catch (error) {
      if (error instanceof CallinooError) throw error;
      throw new CallinooError("UPSTREAM_UNAVAILABLE");
    } finally {
      clearTimeout(timeout);
    }
  }

  getBalance() {
    return this.#get("get-balance");
  }

  listApplications() {
    return this.#get("applications");
  }

  getPrices(serviceId) {
    if (!/^[1-9][0-9]{0,11}$/.test(String(serviceId))) {
      throw new CallinooError("INVALID_SERVICE_ID");
    }
    return this.#get("get-prices", serviceId);
  }

  // Separate documented Callinoo API family, authenticated by Bearer token.
  // Allow only these read-only GET endpoints. No buy/create methods here.
  async #getBearer(category) {
    const endpoints = {
      stars: "/telegram-services/stars/",
      premium: "/telegram-services/premium/",
      "telegram-numbers": "/telegram-numbers/numbers/"
    };
    if (!Object.hasOwn(endpoints, category)) throw new CallinooError("INVALID_CATEGORY");
    const url=BASE + endpoints[category];
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),this.timeoutMs);
    try {
      const result=await this.fetcher(url,{
        method:"GET",
        headers:{Authorization:"Bearer "+this.token,Accept:"application/json"},
        signal:controller.signal,
        redirect:"manual",
        cache:"no-store"
      });
      if(result.status>=300&&result.status<400)throw new CallinooError("UPSTREAM_REDIRECT_BLOCKED");
      if(!result.ok)throw new CallinooError("UPSTREAM_HTTP_"+result.status);
      const body=await result.text();
      if(body.length>262144)throw new CallinooError("UPSTREAM_RESPONSE_TOO_LARGE");
      let parsed;
      try{parsed=JSON.parse(body)}catch{throw new CallinooError("INVALID_UPSTREAM_JSON")}
      if(!parsed||typeof parsed!=="object"||parsed.status!==true||!Array.isArray(parsed.data))
        throw new CallinooError("INVALID_UPSTREAM_RESPONSE");
      return parsed.data;
    }catch(error){
      if(error instanceof CallinooError)throw error;
      throw new CallinooError("UPSTREAM_UNAVAILABLE");
    }finally{clearTimeout(timer)}
  }

  listStars() { return this.#getBearer("stars"); }
  listPremium() { return this.#getBearer("premium"); }
  listTelegramNumbers() { return this.#getBearer("telegram-numbers"); }

  // Deliberately not supported until receipt validation, anti-double-charge,
  // exact response schemas and refunds have all been confirmed.
  async reserveNumber() { throw new CallinooError("PURCHASING_DISABLED"); }
  async getStatus() { throw new CallinooError("STATUS_API_UNVERIFIED"); }
  async setStatus() { throw new CallinooError("STATUS_API_UNVERIFIED"); }
}
