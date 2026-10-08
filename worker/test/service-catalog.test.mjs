import test from "node:test";
import assert from "node:assert/strict";
import {normalizeServices, normalizeCountryAvailability} from "../src/service-catalog.js";
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
});
