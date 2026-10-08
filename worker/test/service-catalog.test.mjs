import test from "node:test";
import assert from "node:assert/strict";
import {normalizeServices, normalizeCountryAvailability, normalizePackages} from "../src/service-catalog.js";
test("normalize official Callinoo numeric-key service catalogue",()=>{
  const raw={"0":{id:"1",title:"Telegram Vip panel",code:"tg",private:"never leak"},
             "1":{id:"2",title:"WhatsApp",code:"wa"}};
  assert.deepEqual(normalizeServices(raw),[
    {id:"1",title:"Telegram Vip panel",code:"tg"},
    {id:"2",title:"WhatsApp",code:"wa"}
  ]);
});
test("malformed services are not published",()=>{
  assert.deepEqual(normalizeServices({success:false,error_code:"wrong_token"}),[]);
  assert.deepEqual(normalizeServices({"0":{id:"../../x",title:"Bad",code:"x"}}),[]);
});

test("supplier costs are omitted without retail pricing configuration",()=>{
  const source=[{country:"لهستان",price:12000,range:48,count:"✅ موجود"},{country:"آمریکا",price:13000,range:1,count:"❌ ناموجود"}];
  const hidden=normalizeCountryAvailability(source);
  assert.equal(hidden[0].available,true);
  assert.equal(hidden[1].available,false);
  assert.equal(hidden[0].retailPriceToman,null);
  assert.doesNotMatch(JSON.stringify(hidden),/12000|13000/);
  assert.deepEqual(normalizeCountryAvailability(source,2000).map(x=>x.retailPriceToman),[14400,15600]);
  assert.equal(normalizeCountryAvailability([{country:"Test",price:12001,range:98,count:"✅ موجود"}],2000)[0].retailPriceToman,14402);
  assert.deepEqual(normalizeCountryAvailability([{country:"Overflow",price:Number.MAX_SAFE_INTEGER,range:1,count:"✅ موجود"}],2000),[]);
});

test("Stars and Premium show only retailer prices after 20% markup",()=>{
  const stars=normalizePackages([{id:5,package:"50 Telegram Stars",count:50,
    price:12001,status:true,private_note:"do not expose"}],"stars",2000);
  assert.deepEqual(stars,[{id:"5",title:"50 Telegram Stars",count:50,
    available:true,retailPriceToman:14402}]);
  assert.doesNotMatch(JSON.stringify(stars),/private_note|12001/);
  const premium=normalizePackages([{id:8,package:"3 ماه پرمیوم",price:5000,status:true}],
    "premium",2000);
  assert.equal(premium[0].retailPriceToman,6000);
  assert.equal(premium[0].count,null);
});
test("premium quote fields remain unpriced if markup is missing",()=>{
  const results=normalizePackages([{package:"Premium",price:5000,status:true}],"premium",null);
  assert.equal(results[0].retailPriceToman,null);
});
test("overflowing package price is discarded",()=>{
  assert.deepEqual(normalizePackages([{package:"Premium",price:Number.MAX_SAFE_INTEGER,status:true}],
    "premium",2000),[]);
});
