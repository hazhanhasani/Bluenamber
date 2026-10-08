// Public, read-only BlueNumber landing page. Not an authenticated admin panel.
// No secrets, phone numbers or SMS content are ever interpolated into HTML.
const PAGE = `<!doctype html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="theme-color" content="#0b368a">
  <meta name="description" content="بلونامبر — فروشگاه خدمات شماره مجازی. مشاهده وضعیت آماده‌سازی سرویس کالینو.">
  <title>بلونامبر | BlueNumber</title>
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <style>
    :root {color-scheme:light;--blue:#103d98;--deep:#0b245b;--ink:#162440;--muted:#62728f;--line:#e4eaf4;--surface:#fff;--bg:#f4f7fc;}
    *{box-sizing:border-box} html{scroll-behavior:smooth}
    body{margin:0;font-family:Tahoma,Arial,sans-serif;color:var(--ink);background:var(--bg);line-height:1.95}
    .wrap{max-width:1080px;margin:auto;padding:22px}
    header{display:flex;align-items:center;justify-content:space-between;gap:15px;padding:11px 0 23px}
    .logo{display:flex;align-items:center;gap:12px;font-weight:900;font-size:21px;color:var(--deep)}
    .mark{width:43px;height:43px;display:grid;place-items:center;border-radius:15px;background:linear-gradient(135deg,#2066da,#093075);color:white;box-shadow:0 6px 16px #103d9830}
    a{color:inherit} .link{color:var(--blue);text-decoration:none;font-weight:bold}
    nav{display:flex;gap:15px;align-items:center;font-size:13px}
    .hero{position:relative;overflow:hidden;border-radius:30px;background:radial-gradient(circle at 5% 0%,#367bd8 0%,transparent 44%),linear-gradient(115deg,#093078,#132a62);padding:42px 39px 44px;color:white;box-shadow:0 16px 40px #0b368a21}
    .hero:before{content:"";position:absolute;width:300px;height:300px;border:1px solid #ffffff2b;border-radius:50%;left:-125px;bottom:-175px}
    .hero:after{content:"";position:absolute;width:180px;height:180px;border:1px solid #ffffff25;border-radius:50%;left:65px;top:-95px}
    .eyebrow{font-size:12px;display:inline-block;border-radius:50px;padding:3px 13px;background:#ffffff24;border:1px solid #ffffff35;color:#e3efff}
    h1{font-size:clamp(32px,5vw,58px);line-height:1.5;margin:10px 0 3px;font-weight:900}
    .en{font-family:Arial,sans-serif;font-size:13px;letter-spacing:2px;color:#c6dafa;font-weight:700}
    .desc{max-width:590px;color:#e0eafb;font-size:15px;margin:19px 0 27px}
    .hero-actions{display:flex;gap:11px;flex-wrap:wrap;position:relative;z-index:2}
    .btn{border:0;cursor:pointer;border-radius:13px;padding:11px 20px;font:700 14px Tahoma,Arial,sans-serif;display:inline-flex;justify-content:center;align-items:center;gap:9px;text-decoration:none;min-height:45px;transition:transform .2s,background .2s}
    .btn:hover{transform:translateY(-2px)} .btn:focus-visible,a:focus-visible{outline:3px solid #ffca5b;outline-offset:3px}
    .primary{background:#fff;color:#173c8b} .secondary{border:1px solid #ffffff70;color:white;background:#ffffff18}
    .headrow{display:flex;align-items:end;justify-content:space-between;gap:15px;margin:27px 0 15px}
    h2{font-size:22px;margin:0;color:#142953} .hint{font-size:12px;color:var(--muted)}
    .cards{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
    .card{background:var(--surface);border:1px solid var(--line);border-radius:20px;padding:21px;box-shadow:0 6px 20px #193b7009;min-width:0}
    .label{color:#637594;font-size:13px;margin:0 0 8px}.value{font-size:18px;font-weight:800;color:#152b54}
    .small{color:var(--muted);font-size:12px;line-height:1.8;margin:7px 0 0}
    .dot{display:inline-block;width:9px;height:9px;margin-left:8px;border-radius:50%;background:#f0a326}
    .dot.ok{background:#2ca986}.dot.no{background:#e57865}
    .details{display:grid;grid-template-columns:1.4fr 1fr;gap:15px;margin:14px 0}
    .steps{margin:0;padding:0 21px 0 0;list-style:none;position:relative}
    .steps li{position:relative;padding:0 27px 13px 0;border-right:1px dashed #ccdbef;margin:0 10px 0 0}
    .steps li:last-child{border-color:transparent;padding-bottom:0}
    .steps li:before{content:"";position:absolute;right:-7px;top:5px;width:13px;height:13px;border-radius:50%;border:3px solid white;background:#c5d4eb;box-shadow:0 0 0 1px #c5d4eb}
    .steps li.done:before{background:#28a588;box-shadow:0 0 0 1px #28a588}
    .steps b{font-size:14px}.steps p{margin:0;font-size:12px;color:var(--muted)}
    .tag{display:inline-block;border-radius:50px;background:#fff0dc;color:#975800;font-size:11px;padding:2px 11px;margin-top:8px}
    .service-row{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:9px 0;padding:10px;border:1px solid var(--line);border-radius:13px}
    .service-row .btn{background:var(--blue);color:#fff;font-size:12px;min-height:38px}
    .countries{display:grid;grid-template-columns:repeat(auto-fill,minmax(165px,1fr));gap:9px;margin-top:14px}
    .country{border:1px solid var(--line);background:#f9fbff;border-radius:13px;padding:11px}
    .country b{font-size:13px;display:block}.country span{font-size:11px;color:var(--muted)}
    .available{color:#13846f!important}.unavailable{color:#b35a49!important}
    footer{padding:17px 0 25px;display:flex;justify-content:space-between;flex-wrap:wrap;gap:10px;font-size:12px;color:var(--muted)}
    .footlink{color:#3a5b9a;text-decoration:none}
    @media(max-width:760px){.wrap{padding:14px}header{padding:7px 2px 16px}nav{gap:9px}nav a{font-size:12px}.hero{padding:31px 23px;border-radius:24px}h1{margin-top:15px}.cards{grid-template-columns:1fr}.details{grid-template-columns:1fr}.headrow{display:block}.card{padding:20px}h2{font-size:19px}}
    @media(prefers-reduced-motion:reduce){*,*:before,*:after{scroll-behavior:auto!important;transition:none!important}}
  </style>
</head>
<body>
<div class="wrap">
  <header>
    <div class="logo"><span class="mark" aria-hidden="true">B</span><span>بلونامبر</span></div>
    <nav><a class="link" href="#status">وضعیت سرویس</a><a class="link" href="#services">خدمات</a></nav>
  </header>
  <main>
    <section class="hero">
      <span class="eyebrow">BlueNumber · Virtual Numbers</span>
      <h1>بلونامبر</h1>
      <div class="en">NUMBER SERVICES</div>
      <p class="desc">دسترسی ساده به خدمات شماره مجازی با تأمین‌کننده کالینو. این نسخه، پیش‌نمایش آنلاین فروشگاه است؛ سفارش‌گذاری پس از تکمیل اتصال و پرداخت ایمن فعال می‌شود.</p>
      <div class="hero-actions">
        <a class="btn primary" href="#status">مشاهده وضعیت سرویس <span aria-hidden="true">←</span></a>
        <button type="button" class="btn secondary" id="refresh">بروزرسانی وضعیت ↻</button>
      </div>
    </section>
    <section id="status" aria-label="وضعیت اتصال">
      <div class="headrow"><h2>وضعیت فعلی سیستم</h2><span class="hint" id="checked" aria-live="polite">در حال بررسی سرویس…</span></div>
      <div class="cards">
        <article class="card"><p class="label">سرور بلونامبر</p><div class="value"><span class="dot ok"></span>آنلاین</div><p class="small">بخش API برای پاسخگویی فعال است.</p></article>
        <article class="card"><p class="label">کلید سرویس کالینو</p><div class="value" id="provider-state"><span class="dot"></span>در حال بررسی</div><p class="small" id="provider-note">بررسی تنظیمات امن تأمین‌کننده، بدون نمایش کلید.</p></article>
        <article class="card"><p class="label">سفارش و پرداخت</p><div class="value" id="payment-state"><span class="dot no"></span>غیرفعال</div><p class="small">تا زمان تأیید قیمت، تحویل و پرداخت، خرید ممکن نیست.</p></article>
      </div>
    </section>
    <section class="details" id="services">
      <article class="card">
        <h2>خدمات شماره مجازی</h2>
        <p class="small">قیمت نهایی و موجودی از کالینو به‌روزرسانی می‌شوند. ثبت سفارش تا آماده‌شدن پرداخت و تحویل امن غیرفعال است.</p>
        <div id="service-list" style="padding:14px 0 4px"><span class="tag">در حال دریافت سرویس‌ها…</span></div>
        <div id="quote-label" class="hint" aria-live="polite"></div>
        <div id="country-grid" class="countries"></div>
      </article>
      <article class="card">
        <h2>مراحل راه‌اندازی</h2>
        <ol class="steps" style="margin-top:14px">
          <li class="done"><b>استقرار سرور</b><p>Cloudflare Worker و پایگاه‌داده آماده هستند.</p></li>
          <li class="done"><b>ثبت امن کلید</b><p>کلید در Secret قرار می‌گیرد؛ داخل اپ ذخیره نمی‌شود.</p></li>
          <li class="done"><b>نمایش موجودی و قیمت فروش</b><p>اطلاعات زنده کالینو و قیمت نهایی فروش آماده است.</p></li>
          <li><b>فعال‌سازی سفارش</b><p>پس از احراز هویت، پرداخت و تحویل خودکار.</p></li>
        </ol>
      </article>
    </section>
  </main>
  <footer><span>© BlueNumber · بلونامبر</span><span>این صفحه پنل مدیریت کاربران نیست · <a class="footlink" href="/health">وضعیت فنی API</a></span></footer>
</div>
<script>
(function () {
  "use strict";
  const get = id => document.getElementById(id);
  async function loadQuotes(id,title) {
    get("quote-label").textContent="در حال دریافت کشورهای "+title+"…";
    const box=get("country-grid");box.textContent="";
    try {
      const r=await fetch("/v1/quotes?serviceId="+encodeURIComponent(id),{cache:"no-store"});
      if(!r.ok)throw Error("Unreachable");
      const data=await r.json();
      const countries=Array.isArray(data.items)?data.items:[];
      countries.sort((a,b)=>Number(b.available)-Number(a.available));
      get("quote-label").textContent=String(countries.length)+" کشور / "+String(countries.filter(x=>x.available).length)+" مورد موجود";
      for (const c of countries) {
        const panel=document.createElement("div");panel.className="country";
        const title=document.createElement("b");title.textContent=String(c.country);
        const state=document.createElement("span");state.className=c.available?"available":"unavailable";
        state.textContent=(c.available?"● موجود":"● ناموجود")+" · +"+String(c.range);
        const price=document.createElement("div");price.className="small";
        price.textContent=c.retailPriceToman==null?"قیمت نهایی هنوز در دسترس نیست":"قیمت نهایی: "+new Intl.NumberFormat("fa-IR").format(c.retailPriceToman)+" تومان";
        panel.append(title,state,price);box.append(panel);
      }
    } catch {
      get("quote-label").textContent="کشورها فعلاً در دسترس نیستند؛ دوباره تلاش کنید.";
    }
  }
  async function refresh() {
    get("checked").textContent="در حال دریافت آخرین وضعیت…";
    try {
      const [c,t]=await Promise.all([
        fetch("/v1/config",{cache:"no-store"}).then(r=>{if(!r.ok)throw Error();return r.json();}),
        fetch("/v1/number-types",{cache:"no-store"}).then(r=>{if(!r.ok)throw Error();return r.json();})
      ]);
      const configured=c.providerConfigured === true;
      const connected=c.providerConnected === true;
      const enabled=c.paymentsEnabled === true;
      get("provider-state").textContent=configured?"کلید ثبت شده":"کلید تنظیم نشده";
      const dot=document.createElement("span");
      dot.className="dot "+(configured?"ok":"no");
      get("provider-state").prepend(dot);
      get("provider-note").textContent=connected?"اتصال سرویس تأیید شده است.":configured?"کلید ذخیره شده؛ اعتبارسنجی زنده API و تحویل شماره باقی است.":"کلید API تأمین‌کننده هنوز در سرور در دسترس نیست.";
      get("payment-state").textContent=enabled?"آماده خرید":"غیرفعال";
      const pd=document.createElement("span");pd.className="dot "+(enabled?"ok":"no");get("payment-state").prepend(pd);
      const list=get("service-list");
      list.textContent="";
      for(const item of (Array.isArray(t.items)?t.items:[])) {
        const span=document.createElement("span");span.className="tag";
        span.textContent=String(item.title||"شماره مجازی")+" — "+(t.live?"در دسترس":"به‌زودی");
        list.append(span);
      }
      if(!list.children.length){list.textContent="لیست محصولات هنوز تأیید نشده است.";}
      const serviceList=get("service-list");serviceList.textContent="";
      try {
        const srv=await fetch("/v1/services",{cache:"no-store"});
        if(!srv.ok)throw Error("Failed");
        const serviceData=await srv.json();
        const services=Array.isArray(serviceData.items)?serviceData.items:[];
        for (const service of services) {
          const line=document.createElement("div");line.className="service-row";
          const name=document.createElement("strong");name.textContent=String(service.title);
          const btn=document.createElement("button");btn.type="button";btn.className="btn";
          btn.textContent="نمایش کشورها";btn.addEventListener("click",()=>loadQuotes(service.id,service.title));
          line.append(name,btn);serviceList.append(line);
        }
        if(!services.length){serviceList.textContent="در حال حاضر سرویس قابل نمایشی یافت نشد.";}
        get("checked").textContent="فهرست خدمات از کالینو دریافت شد";
      } catch {
        serviceList.textContent="دریافت فهرست سرویس‌ها ممکن نشد.";
        get("checked").textContent="بروزرسانی سرویس‌ها ناموفق بود.";
      }
    } catch {
      get("checked").textContent="امکان بررسی آنلاین نبود؛ دوباره تلاش کنید.";
      get("provider-state").textContent="نامشخص";
      get("provider-note").textContent="پاسخ API در دسترس نیست.";
    }
  }
  get("refresh").addEventListener("click", refresh);
  refresh();
})();
</script>
</body></html>`;
export function landingResponse() {
  return new Response(PAGE, {
    status: 200,
    headers: {
      "content-type":"text/html; charset=utf-8",
      "cache-control":"no-store",
      "x-content-type-options":"nosniff",
      "referrer-policy":"no-referrer",
      "x-frame-options":"DENY",
      "content-security-policy":"default-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'; connect-src 'self'; img-src 'self'; script-src 'unsafe-inline'; style-src 'unsafe-inline'"
    }
  });
}
export function faviconResponse() {
  return new Response('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="15" fill="#103d98"/><text x="32" y="45" font-family="Arial" font-size="42" font-weight="bold" text-anchor="middle" fill="#fff">B</text></svg>',{
    headers:{"content-type":"image/svg+xml; charset=utf-8","cache-control":"public, max-age=86400","x-content-type-options":"nosniff"}
  });
}
