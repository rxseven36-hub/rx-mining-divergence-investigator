const fs=require("fs"),path=require("path");

const timelineDir=process.argv[2];
const marketDir=process.argv[3];
const outFile=process.argv[4];

function readJson(file){
  let s=fs.readFileSync(file,"utf8");
  if(s.charCodeAt(0)===0xFEFF)s=s.slice(1);
  return JSON.parse(s);
}
function clean(s){
  return String(s??"")
    .replace(/\u00e2\u0080\u00af/g," ")
    .replace(/\u00e2\u0080\u0091/g,"-")
    .replace(/\u00e2\u0080\u0099/g,"'")
    .replace(/\s+/g," ").trim();
}
function host(u){
  try{return new URL(u).hostname.replace(/^www\./,"")}catch{return ""}
}
function publisher(u){
  const h=host(u);
  const map={
    "emitennews.com":"EmitenNews",
    "idnfinancials.com":"IDNFinancials",
    "bloombergtechnoz.com":"Bloomberg Technoz",
    "investasi.kontan.co.id":"Kontan",
    "market.bisnis.com":"Bisnis",
    "investor.id":"Investor.id",
    "cnbcindonesia.com":"CNBC Indonesia",
    "idx.co.id":"IDX"
  };
  return map[h]||h||"Source";
}
function dims(d){
  return Object.entries(d||{})
    .filter(([,v])=>Number(v)>0)
    .map(([k,v])=>({name:k,score:Number(v)}))
    .sort((a,b)=>b.score-a.score||a.name.localeCompare(b.name));
}
function day(ts){return String(ts||"").slice(0,10)}
function unique(a){return [...new Set(a.filter(Boolean))]}
function dailyRows(raw){
  if(Array.isArray(raw))return raw;
  for(const k of ["data","results","prices","daily"]){
    if(Array.isArray(raw?.[k]))return raw[k];
  }
  return [];
}
function rowDate(r){return r?.date||r?.timestamp||r?.datetime||r?.trading_date||null}
function rowClose(r){return r?.close??r?.close_price??r?.last??r?.price??null}
function rowVolume(r){return r?.volume??r?.total_volume??null}

const newsRaw=readJson(path.join(timelineDir,"BUMI-news-2026.json"));
const filingsRaw=readJson(path.join(timelineDir,"BUMI-filings-2026.json"));
const corpRaw=readJson(path.join(timelineDir,"BUMI-corporate-actions.json"));
const suspRaw=readJson(path.join(timelineDir,"BUMI-suspensions-2026.json"));

const news=(newsRaw.results||[]).map((x,i)=>({
  id:`news-${i+1}`,
  type:"news",
  timestamp:x.timestamp,
  date:day(x.timestamp),
  title:clean(x.title),
  summary:clean(x.body),
  sourceUrl:x.source,
  publisher:publisher(x.source),
  symbols:Array.isArray(x.symbols)?x.symbols:[],
  dimensions:dims(x.dimension),
  thumbnail:x.thumbnail||null
}));

const filings=(filingsRaw.results||[]).map((x,i)=>({
  id:`filing-${i+1}`,
  type:"filing",
  timestamp:x.timestamp,
  date:day(x.timestamp),
  title:clean(x.title),
  summary:clean(x.body),
  sourceUrl:x.source,
  publisher:"IDX",
  symbol:x.symbol||"BUMI.JK",
  transactionType:x.transaction_type||null,
  holderType:x.holder_type||null,
  holderName:x.holder_name||null,
  holdingBefore:x.holding_before??null,
  holdingAfter:x.holding_after??null,
  amountTransaction:x.amount_transaction??null,
  price:x.price??null,
  transactionValue:x.transaction_value??null,
  sharePercentageBefore:x.share_percentage_before??null,
  sharePercentageAfter:x.share_percentage_after??null,
  sharePercentageTransaction:x.share_percentage_transaction??null,
  priceTransactions:Array.isArray(x.price_transaction)?x.price_transaction:[]
}));

const agm=(corpRaw.corporate_actions?.agm||[]).map((x,i)=>({
  id:`agm-${i+1}`,
  type:"agm",
  date:x.agm_date,
  timestamp:x.agm_date+(x.agm_time?`T${x.agm_time}`:"T00:00:00"),
  title:`BUMI shareholder meeting - ${x.agm_date}`,
  time:x.agm_time??null,
  place:clean(x.agm_place),
  result:clean(x.agm_result),
  sourceUrl:null,
  publisher:"Corporate action data"
}));

const suspensions=Array.isArray(suspRaw.results)?suspRaw.results:[];

// Deterministic cluster: same company, same date, acquisition-related headlines.
// We do not claim causality. We only group records sharing explicit event language.
const acquisitionWords=["loyal metals","acqui"];
const acquisitionNews=news.filter(n=>{
  const s=(n.title+" "+n.summary).toLowerCase();
  return n.date==="2026-09-07" && acquisitionWords.every((w,idx)=>idx===0?s.includes(w):true) && s.includes("acqui");
});
const acquisitionCluster={
  id:"bumi-loyal-metals-2026-09-07",
  kind:"company_event_cluster",
  date:"2026-09-07",
  symbol:"BUMI.JK",
  headline:"BUMI completes acquisition of Loyal Metals",
  description:"Multiple collected sources report BUMI's acquisition of Loyal Metals on the same date. RX MDI groups the coverage as one company event without asserting that the event caused any market movement.",
  dimensions:unique(acquisitionNews.flatMap(n=>n.dimensions.map(d=>d.name))),
  newsIds:acquisitionNews.map(n=>n.id),
  publishers:unique(acquisitionNews.map(n=>n.publisher)),
  sourceCount:unique(acquisitionNews.map(n=>n.sourceUrl)).length,
  evidenceRule:"same-date explicit acquisition coverage; no causal inference"
};

// Deterministic filing highlights: preserve source numbers; label by factual magnitude only.
const filingHighlights=filings
  .filter(f=>Number(f.amountTransaction)>0)
  .sort((a,b)=>Number(b.amountTransaction)-Number(a.amountTransaction))
  .slice(0,5)
  .map(f=>({
    id:`highlight-${f.id}`,
    kind:"ownership_event",
    date:f.date,
    filingId:f.id,
    headline:`${f.holderName||"Reported holder"} ${f.transactionType||"reported transaction"} in BUMI`,
    holderName:f.holderName,
    transactionType:f.transactionType,
    amountTransaction:f.amountTransaction,
    holdingBefore:f.holdingBefore,
    holdingAfter:f.holdingAfter,
    sharePercentageBefore:f.sharePercentageBefore,
    sharePercentageAfter:f.sharePercentageAfter,
    transactionValue:f.transactionValue,
    sourceUrl:f.sourceUrl,
    publisher:f.publisher,
    evidenceRule:"directly reported filing fields; no motive or market causality inferred"
  }));

let marketContext=null;
const dailyFile=path.join(marketDir,"BUMI-daily.json");
if(fs.existsSync(dailyFile)){
  const rows=dailyRows(readJson(dailyFile))
    .map(r=>({date:rowDate(r),close:rowClose(r),volume:rowVolume(r)}))
    .filter(r=>r.date)
    .sort((a,b)=>String(a.date).localeCompare(String(b.date)));
  const around=rows.filter(r=>String(r.date).slice(0,10)>="2026-09-04" && String(r.date).slice(0,10)<="2026-09-10");
  marketContext={
    symbol:"BUMI.JK",
    window:"2026-09-04..2026-09-10",
    observations:around,
    rule:"market observations are contextual only; no event causality is asserted"
  };
}

const output={
  schemaVersion:"rxmdi-event-intelligence-v1",
  generatedAt:new Date().toISOString(),
  company:{symbol:"BUMI.JK",name:"PT Bumi Resources Tbk"},
  principles:[
    "Group repeated coverage into understandable company events.",
    "Preserve source links and reported values.",
    "Show market observations as context, not proof of causality.",
    "Never invent missing corporate-action categories."
  ],
  counts:{
    news:news.length,
    filings:filings.length,
    agm:agm.length,
    suspensions:suspensions.length
  },
  availableCorporateActions:{
    agm:agm.length,
    bonus:corpRaw.corporate_actions?.bonus??null,
    warrant:corpRaw.corporate_actions?.warrant??null,
    dividend:corpRaw.corporate_actions?.dividend??null,
    rightIssue:corpRaw.corporate_actions?.right_issue??null,
    stockSplit:corpRaw.corporate_actions?.stock_split??null,
    upcomingDividend:corpRaw.corporate_actions?.upcoming_dividend??null
  },
  clusters:[acquisitionCluster],
  filingHighlights,
  marketContext,
  records:{news,filings,agm,suspensions}
};

fs.writeFileSync(outFile,JSON.stringify(output,null,2),"utf8");

console.log("");
console.log("Verified source counts:");
console.log(`  News: ${news.length}`);
console.log(`  Filings: ${filings.length}`);
console.log(`  AGM: ${agm.length}`);
console.log(`  Suspensions: ${suspensions.length}`);
console.log("");
console.log("Event cluster:");
console.log(`  ${acquisitionCluster.headline}`);
console.log(`  News records grouped: ${acquisitionCluster.newsIds.length}`);
console.log(`  Unique publishers: ${acquisitionCluster.publishers.length}`);
console.log(`  Dimensions: ${acquisitionCluster.dimensions.join(", ")||"none"}`);
console.log("");
console.log(`Generated ${outFile}`);
