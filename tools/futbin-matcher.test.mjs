
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { normalizeIdentity, marketDiff, compareFutbinSnapshot } from "./futbin-matcher.mjs";
import { parseFutbinDiagnostic } from "./futbin-parser.mjs";

const base = () => ({
  id:"historical-id",nombre:"João Pedro",ovr:82,posicionPrincipal:"ST",posiciones:["ST","CAM"],
  stats:{pac:80,sho:81,pas:72,dri:83,def:35,phy:70},pie:"R",skills:4,weakFoot:3,
  precioReferencia:5000,valorSecundarioFuente:340,popularidadFuente:203,ratingFuente:81.4,parseStatus:"complete"
});
const compare=(pdf,current)=>compareFutbinSnapshot([pdf],[current]);
function freeze(value) { if(value && typeof value==="object") { Object.freeze(value); Object.values(value).forEach(freeze); } return value; }

test("normalizes accents, case, whitespace and numeric values without relying on IDs",()=>{
  const current=base(),pdf=base();
  Object.assign(pdf,{id:"different-id",nombre:"  JOAO   PEDRO ",ovr:"82",posicionPrincipal:"st",pie:"r",skills:"4",weakFoot:"3",posiciones:["CAM","ST"]});
  pdf.stats.pac="80";
  assert.deepEqual(normalizeIdentity(pdf),normalizeIdentity(current));
  const r=compare(pdf,current);assert.equal(r.summary.unchanged,1);assert.equal(r.summary.exactMatches,1);
  assert(!r.unchanged[0].warnings.includes("alternative_positions_differ"));
});
test("market, rating, rank and PDF-page changes never create NEW",()=>{
  const current=base(),pdf={...base(),precioReferencia:3500,popularidadFuente:294,ratingFuente:82,sourcePage:17,ranking:99};
  const r=compare(pdf,current);assert.equal(r.summary.updated,1);assert.equal(r.summary.new,0);
  assert.deepEqual(r.updated[0].marketDiff.precioReferencia,{old:5000,new:3500,delta:-1500,deltaPercent:-30});
  assert.equal(r.updated[0].marketDiff.popularidadFuente.delta,91);
});
test("diff handles zero and null without invalid percentages",()=>{
  assert.deepEqual(marketDiff({precioReferencia:0},{precioReferencia:50}).precioReferencia,{old:0,new:50,delta:50,deltaPercent:null});
  assert.deepEqual(marketDiff({precioReferencia:null},{precioReferencia:0}).precioReferencia,{old:null,new:0,delta:null,deltaPercent:null});
  assert.deepEqual(marketDiff({ratingFuente:81.4},{ratingFuente:null}).ratingFuente,{old:81.4,new:null,delta:null,deltaPercent:null});
  assert.deepEqual(marketDiff({valorSecundarioFuente:100},{valorSecundarioFuente:80}).valorSecundarioFuente,{old:100,new:80,delta:-20,deltaPercent:-20});
  assert.deepEqual(marketDiff({},{}),{});
});
test("unique partial uses only known identity fields at medium confidence",()=>{
  const pdf={...base(),stats:{pac:80,sho:null},parseStatus:"partial"};
  const r=compare(pdf,base());assert.equal(r.summary.partialMatches,1);assert.equal(r.summary.unchanged,1);
  assert.equal(r.unchanged[0].confidence,"medium");assert(!r.unchanged[0].fieldsUsed.includes("stats.sho"));
  const conflict=compare({...pdf,stats:{pac:99}},base());assert.equal(conflict.summary.needsReview,1);
});
test("goalkeeper missing rating still matches exact identity",()=>{
  const current={...base(),posicionPrincipal:"GK",stats:{div:82,han:81,kic:75,ref:83,spd:47,pos:82},ratingFuente:null};
  const pdf={...current,parseStatus:"partial",warnings:["missing_rating"]};
  const r=compare(pdf,current);assert.equal(r.summary.exactMatches,1);assert.equal(r.summary.needsReview,0);
});
test("structural conflicts never merge only by name; different OVR is a new version",()=>{
  for(const [field,value] of [["posicionPrincipal","LW"],["pie","L"],["skills",5],["weakFoot",5]]) {
    const r=compare({...base(),[field]:value},base());
    assert.equal(r.summary.needsReview,1);assert(r.needsReview[0].candidates[0].conflicts.some(c=>c.field===field));
  }
  const r=compare({...base(),ovr:86},base());assert.equal(r.summary.new,1);assert.equal(r.summary.notInCurrentSnapshot,1);
});
test("multiple partial or identical candidates require review, never use ID as tiebreaker",()=>{
  const first=base(),second={...base(),id:"different-history",stats:{...base().stats,pac:81}};
  let r=compareFutbinSnapshot([{...base(),stats:{}}],[first,second]);
  assert.equal(r.summary.needsReview,1);assert.equal(r.needsReview[0].candidates.length,2);assert.equal(r.summary.notInCurrentSnapshot,0);
  r=compareFutbinSnapshot([base()],[first,{...first,id:"another"}]);assert.equal(r.summary.needsReview,1);
  r=compareFutbinSnapshot([base()],[first,second]);assert.equal(r.summary.exactMatches,1);assert.equal(r.summary.notInCurrentSnapshot,1);
});
test("duplicate snapshot claims do not silently reuse a catalog entry",()=>{
  const r=compareFutbinSnapshot([base(),{...base(),stats:{},parseStatus:"partial"}],[base()]);
  assert.equal(r.summary.needsReview,2);assert.equal(r.summary.exactMatches,0);assert.equal(r.summary.notInCurrentSnapshot,0);
  assert(r.needsReview.every(row=>row.matchReason==="duplicate_snapshot_candidate"));
});
test("insufficient identity requires review even with an empty catalog",()=>{
  const r=compareFutbinSnapshot([{...base(),ovr:null}],[]);
  assert.equal(r.summary.needsReview,1);assert.equal(r.summary.new,0);
  assert.equal(compare({...base(),parseStatus:"ambiguous"},base()).summary.needsReview,1);
});
test("absent entries are not deletions; pure inputs and export are serializable",()=>{
  const catalog=freeze([base()]),snapshot=freeze([]);
  const r=compareFutbinSnapshot(snapshot,catalog);
  assert.equal(r.notInCurrentSnapshot[0].status,"NOT_IN_CURRENT_SNAPSHOT");
  assert(r.notInCurrentSnapshot[0].warnings.includes("not_a_deletion"));
  assert.deepEqual(Object.keys(r),["metadata","summary","unchanged","updated","new","notInCurrentSnapshot","needsReview"]);
  assert.doesNotThrow(()=>JSON.stringify(r));
  assert.equal(compareFutbinSnapshot(freeze([base()]),catalog).summary.unchanged,1);
});

const fixture=new URL("./fixtures-local/EA FC 27 Popular Players _ FUTBIN2-diagnostico.json",import.meta.url);
test("real fixture: named players, partial collisions, multiple versions and no mutation",{skip:!fs.existsSync(fixture)},()=>{
  const context=vm.createContext({window:{}});
  vm.runInContext(fs.readFileSync(new URL("../players-data.js",import.meta.url),"utf8"),context);
  const catalog=structuredClone(context.window.PLAYERS_DATA);
  const parsed=parseFutbinDiagnostic(JSON.parse(fs.readFileSync(fixture,"utf8").replace(/^\uFEFF/,"")));
  const before=JSON.stringify({catalog,parsed});
  const r=compareFutbinSnapshot(parsed.cards,catalog);
  assert.deepEqual(r.summary,{catalog:250,snapshot:250,exactMatches:189,partialMatches:0,unchanged:0,updated:189,new:35,notInCurrentSnapshot:37,needsReview:26});
  for(const name of ["Gordon","Frimpong","Pedro Neto","Mamardashvili"]) {
    const match=r.updated.find(row=>row.pdfCard.nombre===name);
    assert(match,name);assert.equal(match.confidence,"high");assert.equal(match.matchReason,"exact_identity");
    assert("precioReferencia" in match.marketDiff);assert("popularidadFuente" in match.marketDiff);
  }
  const partial=parsed.cards.find(card=>card.nombre==="Rummenigge"&&card.parseStatus==="partial");
  assert.equal(compareFutbinSnapshot([partial],catalog).summary.partialMatches,1);
  assert(r.needsReview.some(row=>row.pdfCard===partial&&row.matchReason==="duplicate_snapshot_candidate"));
  assert(r.needsReview.some(row=>row.pdfCard.nombre==="Barcola"&&row.candidates.length>1));
  assert.equal(JSON.stringify({catalog,parsed}),before);
  const reversed=compareFutbinSnapshot([...parsed.cards].reverse(),[...catalog].reverse());
  assert.deepEqual(reversed.summary,r.summary);
  console.log("Real comparison:",r.summary);
});

