import test from 'node:test';
import assert from 'node:assert/strict';
import { inspectUrl, buildLinksDiagnostic } from './futbin-links.mjs';
const card=(column=1,name='Same name')=>({nombre:name,ovr:82,posicionPrincipal:'LW',sourcePage:1,sourceColumn:column,evidence:{anchorY:498,tokensUsed:[]}});
const annotation=(url='https://www.futbin.com/27/player/843/anthony-gordon',rect=[24,451.5,150,621],page=1)=>({page,url,rect});
const build=(annotations,cards=[card()],extra={})=>buildLinksDiagnostic({fileName:'synthetic.pdf',pages:2,extractedAt:'fixed',annotations,...extra},cards);

test('URL inspection recognizes only supported FUTBIN hosts and observed player paths',()=>{
  assert.deepEqual(inspectUrl(annotation().url),{url:annotation().url,domain:'www.futbin.com',isFutbin:true,game:27,playerId:'843',slug:'anthony-gordon'});
  for(const url of ['https://futbin.com.evil.test/27/player/1/x','javascript:alert(1)','/27/player/1/x','garbage']) assert.equal(inspectUrl(url).isFutbin,false);
  assert.equal(inspectUrl('https://futbin.com/27/players').playerId,null);
  assert.equal(inspectUrl('https://futbin.com/27/player/9007199254740993').playerId,'9007199254740993');
});
test('association uses geometry, not names; adjacent sliver is rejected',()=>{
  const result=build([annotation()],[card(1,'Unrelated'),card(2,'Gordon')]);
  assert.deepEqual(result.cards.map(c=>c.status),['MATCHED','NO_LINK']);
  assert.equal(result.links[0].playerName,'Unrelated');
});
test('multiple different URLs and shared rectangles remain ambiguous',()=>{
  assert.equal(build([annotation(),annotation('https://futbin.com/27/player/2/x')]).summary.ambiguous,1);
  const shared=build([annotation(undefined,[24,432,282,584])],[card(),card(2)]);
  assert.equal(shared.summary.ambiguous,2);
  assert.equal(shared.links[0].matchedCardId,null);
});
test('same URL fragments on two pages stay one candidate, preserving all evidence',()=>{
  const c={...card(),sourcePage:2,priceSourcePage:1,evidence:{anchorY:700,tokensUsed:[{page:1,y:20,height:8}]}};
  const result=build([annotation(undefined,[24,0,150,38.25]),annotation(undefined,[24,596,150,792],2)],[c]);
  assert.equal(result.summary.matched,1); assert.equal(result.links.length,2);
  assert.equal(result.cards[0].urls.length,1);
  assert.ok(result.links.every(l=>l.matchedCardId==='snapshot-card-0'));
});
test('external and unrecognized FUTBIN paths cannot become exact player matches',()=>{
  assert.equal(build([annotation('https://example.com/a')]).cards[0].status,'NON_FUTBIN_LINK');
  assert.equal(build([annotation('https://futbin.com/27/players')]).cards[0].status,'AMBIGUOUS_LINK');
});
test('invalid, empty and off-page rectangles cannot match; non-URL annotations are counted',()=>{
  const result=build([annotation(undefined,[0,0,0,0]),annotation(undefined,null),{page:1,rect:[24,450,150,620]},annotation(undefined,[24,450,150,620],2)]);
  assert.equal(result.summary.noLink,1); assert.equal(result.metadata.totalAnnotations,4);assert.equal(result.metadata.totalUrls,3);
});
test('annotation failures are visible and prevent a confident result on affected pages',()=>{
  const result=build([annotation()],undefined,{errors:[{page:1,message:'Synthetic failure'}]});
  assert.equal(result.metadata.complete,false);assert.equal(result.summary.matched,0);assert.equal(result.summary.ambiguous,1);
});
test('input evidence remains intact and annotation order does not change card associations',()=>{
  const input=[annotation(),annotation(undefined,[156,450,282,621])];const before=JSON.stringify(input);
  const a=build(input,[card(),card(2)]),b=build([...input].reverse(),[card(),card(2)]);
  assert.deepEqual(a.cards,b.cards);assert.equal(JSON.stringify(input),before);
  assert.equal(a.summary.cards,a.summary.matched+a.summary.noLink+a.summary.ambiguous);
});
