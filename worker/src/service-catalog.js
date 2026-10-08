// Only fields from the official Callinoo applications response are public.
export function normalizeServices(input) {
  if (input?.success === false) return [];
  const raw = Array.isArray(input) ? input :
    Array.isArray(input?.data) ? input.data :
    input && typeof input === "object" ? Object.values(input) : [];
  const result = new Map();
  for(const service of raw.slice(0,600)) {
    if (!service || typeof service !== "object") continue;
    const id=String(service.id??"");
    const title=typeof service.title==="string"?service.title.trim():"";
    const code=typeof service.code==="string"?service.code.trim():"";
    if(!/^[1-9][0-9]{0,11}$/.test(id) || title.length<1 ||
       title.length>120 || !/^[a-zA-Z0-9_-]{0,40}$/.test(code))continue;
    result.set(id,{id,title,code});
  }
  return [...result.values()].slice(0,500);
}

/** Public-safe country offers; supplier cost never crosses the API boundary. */
export function normalizeCountryAvailability(input, markupBps = null, fixedFee = 0) {
  if (!Array.isArray(input)) throw new TypeError("Invalid quote payload");
  const priced = Number.isSafeInteger(markupBps) && markupBps >= 0 && markupBps <= 100000 &&
    Number.isSafeInteger(fixedFee) && fixedFee >= 0;
  return input.slice(0,300).flatMap(row => {
    if (!row || typeof row !== "object") return [];
    const country=String(row.country || "").slice(0,100);
    const range=String(row.range ?? "");
    const price=Number(row.price);
    if (!country || !/^[0-9]{1,8}$/.test(range) ||
      !Number.isSafeInteger(price) || price < 0) return [];
    const count=String(row.count || "");
    const available=count.includes("✅") && !count.includes("❌") ||
      count.includes("موجود") && !count.includes("ناموجود");
    const retail=priced ? price+Math.ceil(price*markupBps/10000)+fixedFee : null;
    if (retail !== null && !Number.isSafeInteger(retail)) return [];
    return [{country,range,available,retailPriceToman:retail}];
  });
}
