
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { parseMarketValue, parseFutbinDiagnostic } from "./futbin-parser.mjs";

const info = page => ({ page, view: [0, 0, 612, 792], rotation: 0, userUnit: 1 });
const token = (page, text, x, y) => ({ page, text, x, y, width: 8, height: 8 });
function fixture({page=1, col=0, y=498, name="Example", stats=true, price=true, goalkeeper=false}={}) {
  const x=41.6+132*col;
  const items = [
    token(page,"82",x+4,y+81.75), token(page,goalkeeper?"GK":"LW",x+7,y+72.75),
    token(page,name,x+26,y+9.75), token(page,"R",x+19,y-34.5),
    token(page,"3",x+31,y-34.5), token(page,"4",x+48,y-34.5),
    token(page,"81.4",x+62,y-33.75), token(page,"294",x+38,y-61.5)
  ];
  if(stats) (goalkeeper?["DIV","HAN","KIC","REF","SPD","POS"]:["PAC","SHO","PAS","DRI","DEF","PHY"])
    .forEach((label,i)=>items.push(token(page,label,x+16*i,y),token(page,String(90-i),x+16*i+1,y-8.25)));
  if(price) items.push(token(page,"3.5K",x+13,y+113.25),token(page,"340",x+53,y+113.25));
  return items;
}
const diagnostic = items => ({fileName:"test.pdf",items,pageInfo:[info(1),info(2)],pages:2});

test("market notation preserves zero and rejects malformed/fractional coins",()=>{
  for(const [raw,expected] of [["0",0],["650",650],["850",850],["3.5K",3500],["26.75K",26750],["64.5K",64500],["1.33M",1330000],[" 5.8k ",5800]]) assert.equal(parseMarketValue(raw),expected);
  for(const raw of ["","-1","1.2","1,33M","NaN","3.5K junk",null,"999999999999999999"]) assert.equal(parseMarketValue(raw),null);
});
test("geometric parsing is invariant to token order and tolerates coordinate noise",()=>{
  const items=fixture();
  const base=parseFutbinDiagnostic(diagnostic(items));
  assert.equal(base.metrics.complete,1);
  assert.deepEqual(parseFutbinDiagnostic(diagnostic([...items].reverse())),base);
  const noisy=items.map((item,i)=>({...item,x:item.x+(i%3-1)*0.4,y:item.y+(i%3-1)*0.35}));
  const card=parseFutbinDiagnostic(diagnostic(noisy)).cards[0];
  assert.equal(card.parseStatus,"complete");assert.equal(card.nombre,"Example");assert.equal(card.precioReferencia,3500);
});
test("missing stats do not discard a card; missing one stat does not shift its neighbors",()=>{
  let result=parseFutbinDiagnostic(diagnostic(fixture({stats:false})));
  assert.equal(result.metrics.partial,1);assert(result.cards[0].warnings.includes("missing_stats"));
  assert(Object.values(result.cards[0].stats).every(value=>value===null));
  const items=fixture().filter(t=>!(t.text==="88" && Math.abs(t.y-489.75)<1));
  result=parseFutbinDiagnostic(diagnostic(items));
  assert.equal(result.cards[0].stats.pas,null);assert.equal(result.cards[0].stats.dri,87);
});
test("goalkeepers use goalkeeper stats",()=>{
  const card=parseFutbinDiagnostic(diagnostic(fixture({goalkeeper:true}))).cards[0];
  assert.deepEqual(Object.keys(card.stats),["div","han","kic","ref","spd","pos"]);assert.equal(card.parseStatus,"complete");
});
test("pending economic rows cross only adjacent pages and are not reused",()=>{
  const items=[token(1,"2.4K",55,28.5),token(1,"160",95,28.5),...fixture({page:2,y:708,price:false}),...fixture({page:2,y:474,price:false,name:"Second"})];
  const result=parseFutbinDiagnostic(diagnostic(items));
  const [first,second]=result.cards;
  assert.equal(first.precioReferencia,2400);assert.equal(first.priceSourcePage,1);
  assert(first.warnings.includes("price_from_previous_page"));assert.equal(second.precioReferencia,null);
  const skipped=items.map(t=>t.page===2?{...t,page:3}:t);
  assert.equal(parseFutbinDiagnostic(diagnostic(skipped)).cards.find(c=>c.nombre==="Example").precioReferencia,null);
});
test("unidentified economics and conflicting identity stay ambiguous",()=>{
  const orphan=parseFutbinDiagnostic(diagnostic([token(1,"0",55,28),token(1,"280",95,28)]));
  assert.equal(orphan.metrics.ambiguous,1);assert.equal(orphan.cards[0].precioReferencia,0);
  const items=fixture();items.push(token(1,"83",46,579.75));
  const conflict=parseFutbinDiagnostic(diagnostic(items)).cards[0];
  assert.equal(conflict.parseStatus,"ambiguous");assert.equal(conflict.ovr,null);
});
test("layout changes are visible errors, and invalid tokens fail explicitly",()=>{
  const d=diagnostic(fixture());d.pageInfo[0].rotation=90;
  assert.equal(parseFutbinDiagnostic(d).metrics.errors,1);
  assert.throws(()=>parseFutbinDiagnostic({items:[{page:1,text:"bad",x:NaN}]}),/inválidas/);
  assert.equal(parseFutbinDiagnostic(diagnostic([])).metrics.cards,0);
});
test("parser never mutates its input and does not enforce a fixed card count",()=>{
  const d=diagnostic([...fixture(),...fixture({col:1,name:"Two"})]);const before=JSON.stringify(d);
  assert.equal(parseFutbinDiagnostic(d).metrics.cards,2);assert.equal(JSON.stringify(d),before);
});

const fixturePath=new URL("./fixtures-local/EA FC 27 Popular Players _ FUTBIN2-diagnostico.json",import.meta.url);
test("real local diagnostic: named examples, goalkeeper, missing stats and page boundary", {skip:!fs.existsSync(fixturePath)},()=>{
  const raw=fs.readFileSync(fixturePath,"utf8");
  const d=JSON.parse(raw.replace(/^\uFEFF/,""));
  assert.equal(d.items.length,6465);
  const result=parseFutbinDiagnostic(d);
  for(const [name,expected] of [
    ["Gordon",[82,"LW",[91,78,77,82,50,71],"R",3,3,81.4,294,3500,340]],
    ["Frimpong",[81,"RB",[94,62,74,82,72,62],"R",3,3,83.5,221,5800,280]],
    ["Pedro Neto",[81,"RM",[91,76,77,82,40,70],"L",4,4,84.1,151,4000,280]]
  ]) {
    const card=result.cards.find(c=>c.nombre===name);
    assert(card,name);
    assert.deepEqual([card.ovr,card.posicionPrincipal,Object.values(card.stats),card.pie,card.skills,card.weakFoot,card.ratingFuente,card.popularidadFuente,card.precioReferencia,card.valorSecundarioFuente],expected);
    assert.equal(card.parseStatus,"complete");
  }
  assert.deepEqual(result.cards.find(c=>c.nombre==="Gordon").posiciones,["LW","LM","ST"]);
  const gk=result.cards.find(c=>c.nombre==="Mamardashvili");
  assert.deepEqual(gk.stats,{div:82,han:81,kic:75,ref:83,spd:47,pos:82});
  assert.equal(gk.ratingFuente,null);assert(gk.warnings.includes("missing_rating"));
  const partial=result.cards.find(c=>c.nombre==="Lamine Yamal");
  assert.equal(partial.parseStatus,"partial");assert(partial.warnings.includes("missing_stats"));
  for(const [name,price,secondary] of [["Víctor Muñoz",2400,160],["Szoboszlai",30000,4100],["Claudia Pina",1330000,11000],["Álvaro Carreras",0,280]]) {
    const card=result.cards.find(c=>c.nombre===name);
    assert.equal(card.sourcePage,2);assert.equal(card.priceSourcePage,1);
    assert.equal(card.precioReferencia,price);assert.equal(card.valorSecundarioFuente,secondary);
  }
  assert.deepEqual(result.metrics,{slots:250,cards:250,complete:232,partial:18,ambiguous:0,errors:0});
  assert.deepEqual(parseFutbinDiagnostic({...d,items:[...d.items].reverse()}),result);
  assert.equal(fs.readFileSync(fixturePath,"utf8"),raw);
  console.log("Real fixture metrics:",result.metrics);
});

