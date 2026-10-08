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
