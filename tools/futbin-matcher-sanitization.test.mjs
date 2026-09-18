
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import {compareFutbinSnapshot, normalizeSnapshotPrice, detectSnapshotDuplicates} from "./futbin-matcher.mjs";
import {parseFutbinDiagnostic} from "./futbin-parser.mjs";
const card=()=>({nombre:"Example",ovr:85,posicionPrincipal:"ST",stats:{pac:80,sho:80,pas:80,dri:80,def:40,phy:70},
  pie:"R",skills:4,weakFoot:4,precioReferencia:5000,precioReferenciaRaw:"5K",popularidadFuente:100,
  ratingFuente:85,valorSecundarioFuente:300,parseStatus:"complete",warnings:[]});
test("zero source preserves an existing price without a destructive diff",()=>{
  const current=card(),pdf={...card(),precioReferencia:0,precioReferenciaRaw:"0"};
  const r=compareFutbinSnapshot([pdf],[current]);
  assert.equal(r.summary.unchanged,1);
  assert.equal(r.unchanged[0].priceDecision.effective,5000);
  assert.equal(r.unchanged[0].pdfCard.precioDisponible,false);
  assert.equal(r.unchanged[0].pdfCard.precioFuenteRaw,"0");
  assert.equal(r.unchanged[0].pdfCard.precioReferencia,null);
  assert.equal(r.unchanged[0].parserCard.precioReferencia,0);
  assert(!("precioReferencia" in r.unchanged[0].marketDiff));
  const updated=compareFutbinSnapshot([{...pdf,popularidadFuente:200}],[current]);
  assert.equal(updated.summary.updated,1);
  assert.deepEqual(Object.keys(updated.updated[0].marketDiff),["popularidadFuente"]);
});
test("new raw-zero cards and null catalog prices remain unavailable",()=>{
  const pdf={...card(),precioReferencia:0,precioReferenciaRaw:"0"};
  const r=compareFutbinSnapshot([pdf],[]);
  assert.equal(r.summary.new,1);assert.equal(r.new[0].pdfCard.precioReferencia,null);
  assert.equal(r.new[0].pdfCard.precioFuenteRaw,"0");assert.equal(r.summary.unavailableZeroPrices,1);
  const current={...card(),precioReferencia:null};
  assert.equal(compareFutbinSnapshot([pdf],[current]).unchanged[0].priceDecision.effective,null);
  assert.deepEqual(normalizeSnapshotPrice(normalizeSnapshotPrice(pdf)),normalizeSnapshotPrice(pdf));
});
test("duplicate complete/partial appearances never independently become NEW",()=>{
  const a=card(),b={...card(),stats:{},parseStatus:"partial",warnings:["missing_stats"]};
  const r=compareFutbinSnapshot([a,b],[]);
  assert.equal(r.summary.new,0);assert.equal(r.summary.snapshotDuplicates,2);
  assert.equal(r.snapshotDuplicates[0].occurrences[0].parserCard,a);
  assert.equal(r.snapshotDuplicates[0].occurrences[1].parserCard,b);
});
test("conflicting complete identities are never merged; partial bridges remain explicit conflicts",()=>{
  const a=card(),b={...card(),stats:{...card().stats,pac:99}};
  assert.equal(detectSnapshotDuplicates([a,b]).length,0);
  const partial={...card(),stats:{},parseStatus:"partial"};
  const groups=detectSnapshotDuplicates([a,b,partial]);
  assert.equal(groups.length,1);assert.equal(groups[0].reason,"partial_bridge_structural_conflict");
  assert.equal(groups[0].snapshotIndices.length,3);assert.equal(groups[0].structuralConflicts.length,1);
  const r=compareFutbinSnapshot([a,b,partial],[]);
  assert.equal(r.summary.new,0);assert.equal(r.summary.snapshotDuplicates,3);
});
test("market differences preserve both appearances for manual review",()=>{
  const a=card(),b={...card(),precioReferencia:6000,ratingFuente:86,popularidadFuente:101,valorSecundarioFuente:350};
  const r=compareFutbinSnapshot([a,b],[a]);
  assert.equal(r.snapshotDuplicates[0].reason,"duplicate_identity_market_conflict");
  assert.equal(r.snapshotDuplicates[0].marketConflicts[0].fields.length,4);
  assert.equal(r.summary.updated,0);assert.equal(r.summary.notInCurrentSnapshot,0);
});
const fixture=new URL("./fixtures-local/EA FC 27 Popular Players _ FUTBIN2-diagnostico.json",import.meta.url);
test("all 15 real duplicate groups, 6 GK and van de Ven, with exhaustive occurrence accounting",{skip:!fs.existsSync(fixture)},()=>{
  const context=vm.createContext({window:{}});
  vm.runInContext(fs.readFileSync(new URL("../players-data.js",import.meta.url),"utf8"),context);
  const catalog=context.window.PLAYERS_DATA;
  const parsed=parseFutbinDiagnostic(JSON.parse(fs.readFileSync(fixture,"utf8").replace(/^\uFEFF/,"")));
  const before=JSON.stringify({catalog,parsed});
  const r=compareFutbinSnapshot(parsed.cards,catalog);
  const names=["Fernando Torres","White","Pepe","Schweinsteiger","Rummenigge","Heath","Formiga","Nagasato","Riise","Pirlo",
    "Barcola","Marmoush","Lamine Yamal","Agüero","Diaby"];
  for(const name of names) {
    const group=r.snapshotDuplicates.find(g=>g.occurrences[0].pdfCard.nombre===name);
    assert(group,name);assert.equal(group.occurrences.length,2);
    assert(group.occurrences.every(o=>o.status==="SNAPSHOT_DUPLICATE"));
    for(const occurrence of group.occurrences) {
      assert.equal(occurrence.parserCard,parsed.cards[occurrence.snapshotIndex]);
      assert.equal(occurrence.pdfCard.evidence,occurrence.parserCard.evidence);
      assert(!r.new.some(row=>row.snapshotIndex===occurrence.snapshotIndex));
    }
    if(names.indexOf(name)<10) {
      assert(group.occurrences.some(o=>o.pdfCard.parseStatus==="complete"));
      assert(group.occurrences.some(o=>o.pdfCard.warnings.includes("missing_stats")));
    } else {
      assert.equal(group.reason,"duplicate_identity_market_conflict");
      assert(group.marketConflicts.length>0);
    }
  }
  const classified=[...r.unchanged,...r.updated,...r.new,...r.needsReview,...r.snapshotDuplicates.flatMap(g=>g.occurrences)];
  assert.equal(classified.length,250);
  assert.equal(new Set(classified.map(row=>row.snapshotIndex)).size,250);
  assert.equal(r.summary.snapshotDuplicates,30);assert.equal(r.summary.new,0);assert.equal(r.summary.updated,0);assert.equal(r.summary.unchanged,216);assert.equal(r.summary.needsReview,4);
  const van=classified.find(row=>row.pdfCard.nombre.toLowerCase()==="van de ven");
  assert(van);assert.equal(van.pdfCard.precioDisponible,false);assert.equal(van.pdfCard.precioFuenteRaw,"0");
  assert.equal(van.status,"UNCHANGED");assert.deepEqual(van.marketDiff,{});assert.equal(van.currentRecord.popularidadFuente,167);assert.equal(van.currentRecord.precioReferencia,null);assert.equal(van.currentRecord.fuente.precioPrincipalRaw,"0");assert.equal(van.priceDecision.effective,van.currentRecord.precioReferencia);
  const keepers=parsed.cards.filter(c=>c.posicionPrincipal==="GK"&&c.warnings.includes("missing_rating"));
  assert.equal(keepers.length,6);
  for(const keeper of keepers) {
    const row=classified.find(row=>row.parserCard===keeper);
    assert.equal(row.matchReason,"exact_identity");
  }
  const zeros=classified.filter(row=>row.pdfCard.precioFuenteRaw==="0");
  assert.equal(zeros.length,49);
  assert(zeros.every(row=>row.pdfCard.precioReferencia===null&&!row.pdfCard.precioDisponible));
  assert.equal(JSON.stringify({catalog,parsed}),before);
});
