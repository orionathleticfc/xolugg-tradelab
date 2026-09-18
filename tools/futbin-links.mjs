import { GEOMETRY } from './futbin-parser.mjs';

export function inspectUrl(raw) {
  const result = { url: raw, domain: null, isFutbin: false, game: null, playerId: null, slug: null };
  try {
    const url = new URL(raw);
    result.domain = url.hostname.toLowerCase();
    result.isFutbin = /^https?:$/.test(url.protocol) && (result.domain === 'futbin.com' || result.domain.endsWith('.futbin.com'));
    const match = result.isFutbin && url.pathname.match(/^\/(\d+)\/player\/(\d+)(?:\/([^/]+))?\/?$/);
    if (match) {
      result.game = Number(match[1]); result.playerId = match[2]; result.slug = match[3] || null;
    }
  } catch { /* Preserve unsupported URL evidence without guessing. */ }
  return result;
}

function rectOf(rect) {
  if (!Array.isArray(rect) || rect.length !== 4 || !rect.every(Number.isFinite)) return null;
  const [a,b,c,d] = rect;
  return a === c || b === d ? null : [Math.min(a,c),Math.min(b,d),Math.max(a,c),Math.max(b,d)];
}
const area = r => (r[2]-r[0])*(r[3]-r[1]);
function belongs(a,b) {
  if (!a || !b) return false;
  const overlap = Math.max(0,Math.min(a[2],b[2])-Math.max(a[0],b[0])) * Math.max(0,Math.min(a[3],b[3])-Math.max(a[1],b[1]));
  return overlap > 0 && (overlap / area(a) >= 0.5 || overlap / area(b) >= 0.5);
}

export function cardRegions(card, pageInfo = []) {
  const x = GEOMETRY.columnAnchors[card.sourceColumn-1] - GEOMETRY.leftPadding;
  const y = card.evidence?.anchorY;
  if (!Number.isFinite(x) || !Number.isFinite(y)) return [];
  const regions = [{page:card.sourcePage,rect:[x,y-66,x+GEOMETRY.columnWidth,y+86],kind:'body'}];
  // Only bridge pages when the parser already supplied economic-token evidence.
  if (card.priceSourcePage && card.priceSourcePage !== card.sourcePage) {
    const tokens = (card.evidence?.tokensUsed || []).filter(t=>t.page===card.priceSourcePage && Number.isFinite(t.y));
    if (tokens.length) regions.push({page:card.priceSourcePage,rect:[x,Math.min(...tokens.map(t=>t.y))-6,x+GEOMETRY.columnWidth,Math.max(...tokens.map(t=>t.y+(t.height||0)))+6],kind:'price-fragment'});
  }
  return regions.map(region=>{
    const view = rectOf(pageInfo.find(p=>p.page===region.page)?.view);
    const r=region.rect;
    const clipped = view ? [Math.max(r[0],view[0]),Math.max(r[1],view[1]),Math.min(r[2],view[2]),Math.min(r[3],view[3])] : r;
    return {...region,rect:clipped[2] > clipped[0] && clipped[3] > clipped[1] ? clipped : null};
  }).filter(r=>r.rect);
}

export function buildLinksDiagnostic({fileName,pages,extractedAt = new Date().toISOString(),annotations=[],errors=[],pageInfo=[]}, cards) {
  const rows = cards.map((card,index)=>({snapshotIndex:index,cardId:'snapshot-card-'+index,page:card.sourcePage,playerName:card.nombre,ovr:card.ovr,position:card.posicionPrincipal,regions:cardRegions(card,pageInfo)}));
  const links = annotations.filter(a=>a.url || a.unsafeUrl).map(a=>{
    const inspected=inspectUrl(a.url || a.unsafeUrl);
    const candidates=rows.filter(c=>c.regions.some(r=>r.page===a.page && belongs(rectOf(a.rect),r.rect)));
    return {...a,...inspected,candidateCardIds:candidates.map(c=>c.cardId),matchedCardId:null,playerName:null,ovr:null,position:null,status:inspected.isFutbin?'UNASSOCIATED':'NON_FUTBIN_LINK'};
  });
  for (const card of rows) {
    const candidates=links.filter(l=>l.candidateCardIds.includes(card.cardId));
    const urls=[...new Set(candidates.map(l=>l.url))].sort();
    const incomplete=errors.some(e=>card.regions.some(r=>r.page===e.page));
    card.urls=urls;
    card.status = incomplete ? 'AMBIGUOUS_LINK' : !urls.length ? 'NO_LINK' :
      urls.length>1 || candidates.some(l=>l.candidateCardIds.length>1 || (l.isFutbin && !l.playerId)) ? 'AMBIGUOUS_LINK' :
      candidates.every(l=>!l.isFutbin) ? 'NON_FUTBIN_LINK' : 'MATCHED';
    card.reason = incomplete ? 'annotation_extraction_incomplete' : card.status==='AMBIGUOUS_LINK' ? 'multiple_candidates_shared_area_or_unrecognized_path' : card.status==='MATCHED' ? 'unique_player_url_with_geometric_overlap' : 'no_exact_futbin_player_link';
    for (const link of candidates) {
      link.status = card.status;
      if (card.status==='MATCHED') Object.assign(link,{matchedCardId:card.cardId,playerName:card.playerName,ovr:card.ovr,position:card.position});
    }
  }
  const domains={}; for(const link of links) domains[link.domain || '(unparsed)']=(domains[link.domain || '(unparsed)']||0)+1;
  return {
    metadata:{fileName,extractedAt,pages,totalAnnotations:annotations.length,totalUrls:links.length,totalFutbinUrls:links.filter(l=>l.isFutbin).length,pagesWithLinks:[...new Set(links.map(l=>l.page))].sort((a,b)=>a-b),domains,complete:errors.length===0,errors,coordinates:'Unrotated PDF coordinates, Y increases upwards. Same space as parser tokens.',associationRule:'At least 50% of annotation or card region area overlaps; all candidates retained. Identical URLs within one card deduplicated.'},
    summary:{cards:rows.length,matched:rows.filter(c=>c.status==='MATCHED').length,noLink:rows.filter(c=>['NO_LINK','NON_FUTBIN_LINK'].includes(c.status)).length,ambiguous:rows.filter(c=>c.status==='AMBIGUOUS_LINK').length,nonFutbin:rows.filter(c=>c.status==='NON_FUTBIN_LINK').length},
    cards:rows,links,annotations,pageInfo
  };
}
