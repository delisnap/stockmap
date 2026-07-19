/* data.js의 티커를 읽어 시세를 quotes.json으로 저장. GitHub Actions에서 실행.
 *
 * 소스
 *   미국 등 해외  → CNBC quote 웹서비스 (한 번에 여러 종목, 키 불필요)
 *   국내 .KS/.KQ → 네이버 금융 polling API
 *
 * Yahoo Finance는 쓰지 않는다 — 쿠키/crumb 없는 서버 요청에 429를 반환한다.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT  = join(ROOT, 'quotes.json');
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
           '(KHTML, like Gecko) Chrome/125.0 Safari/537.36';

// data.js는 const 선언만 있는 평문 JS라 그대로 평가해서 읽는다
const src = readFileSync(join(ROOT, 'data.js'), 'utf8');
const { NODES } = new Function(`${src}; return { NODES };`)();
const tickers = [...new Set(NODES.map(n => n.ticker).filter(Boolean))];

const isKR  = t => /\.(KS|KQ)$/i.test(t);
const num   = s => Number(String(s ?? '').replace(/[,%\s]/g, ''));
const chunk = (a, n) => a.reduce((r, x, i) => (i % n ? r[r.length-1].push(x) : r.push([x]), r), []);
const get   = async (url) => {
  const r = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } });
  if (!r.ok) throw new Error('HTTP ' + r.status);
  return r.json();
};

// 실패한 종목은 직전 값을 유지 — 빈 칸으로 사라지는 것보다 낫다
const prev = existsSync(OUT) ? (JSON.parse(readFileSync(OUT, 'utf8')).quotes ?? {}) : {};
const quotes = { ...prev };
const failed = [];
let ok = 0;

const put = (t, price, chg, pct, cur, ts) => {
  if (![price, chg, pct].every(Number.isFinite)) { failed.push(t + ' (파싱 실패)'); return; }
  quotes[t] = { price, chg: +chg.toFixed(4), pct: +pct.toFixed(4), cur, ts };
  ok++;
};

/* ── 해외: CNBC (20종목씩) ── */
for (const group of chunk(tickers.filter(t => !isKR(t)), 20)) {
  try {
    const j = await get('https://quote.cnbc.com/quote-html-webservice/restQuote/symbolType/symbol' +
      `?symbols=${group.map(encodeURIComponent).join('%7C')}` +
      '&requestMethod=itv&exthrs=1&partnerId=2&fund=1&output=json');
    const rows = j?.FormattedQuoteResult?.FormattedQuote ?? [];
    const bySym = new Map(rows.map(r => [String(r.symbol).toUpperCase(), r]));
    for (const t of group) {
      const r = bySym.get(t.toUpperCase());
      if (!r || r.code !== 0) { failed.push(`${t} (미지원 심볼)`); continue; }
      put(t, num(r.last), num(r.change), num(r.change_pct), r.currencyCode || 'USD',
          Date.parse(r.last_time) || Date.now());
    }
  } catch (e) {
    group.forEach(t => failed.push(`${t} (${e.message})`));
  }
  await new Promise(r => setTimeout(r, 300));
}

/* ── 국내: 네이버 ── */
const kr = tickers.filter(isKR);
if (kr.length) {
  try {
    const codes = kr.map(t => t.replace(/\.(KS|KQ)$/i, ''));
    const j = await get('https://polling.finance.naver.com/api/realtime/domestic/stock/' + codes.join(','));
    const byCode = new Map((j?.datas ?? []).map(d => [d.itemCode, d]));
    for (const t of kr) {
      const d = byCode.get(t.replace(/\.(KS|KQ)$/i, ''));
      if (!d) { failed.push(`${t} (조회 안 됨)`); continue; }
      // 등락폭에 부호가 포함돼 오지만(-24,500), 혹시 빠질 때를 대비해
      // 방향 코드(5=하락)로 한 번 더 보정한다
      const dir = String(d.compareToPreviousPrice?.code) === '5' ? -1 : 1;
      const chg = Math.abs(num(d.compareToPreviousClosePrice)) * dir;
      put(t, num(d.closePrice), chg, num(d.fluctuationsRatio), 'KRW',
          Date.parse(d.localTradedAt) || Date.now());
    }
  } catch (e) {
    kr.forEach(t => failed.push(`${t} (${e.message})`));
  }
}

writeFileSync(OUT, JSON.stringify({ generatedAt: Date.now(), quotes }, null, 1));
console.log(`성공 ${ok}/${tickers.length}`);
if (failed.length) console.log('실패: ' + failed.join(', '));
// 전부 실패하면 빨간불로 — 오래된 값이 조용히 남는 상황을 막는다
if (ok === 0) { console.error('모든 종목 조회 실패'); process.exit(1); }
