import test from "node:test";
import assert from "node:assert/strict";
import {normalizeServices} from "../src/service-catalog.js";
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
