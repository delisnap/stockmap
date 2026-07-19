/* data.js의 티커를 읽어 Yahoo Finance 시세를 quotes.json으로 저장.
   GitHub Actions에서 실행되므로 브라우저 CORS와 무관하다. */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT  = join(ROOT, 'quotes.json');

// data.js는 const 선언만 있는 평문 JS라 그대로 평가해서 읽는다
const src = readFileSync(join(ROOT, 'data.js'), 'utf8');
const { NODES } = new Function(`${src}; return { NODES };`)();
const tickers = [...new Set(NODES.map(n => n.ticker).filter(Boolean))];

// 실패한 종목은 직전 값을 유지
const prev = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')).quotes ?? {} : {};
const quotes = { ...prev };

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
           '(KHTML, like Gecko) Chrome/125.0 Safari/537.36';

let ok = 0, fail = [];
for (const t of tickers) {
  try {
    const r = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(t)}?range=1d&interval=1d`,
      { headers: { 'User-Agent': UA, Accept: 'application/json' } });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const m = (await r.json()).chart?.result?.[0]?.meta;
    const p = m?.regularMarketPrice, base = m?.chartPreviousClose ?? m?.previousClose;
    if (!Number.isFinite(p) || !Number.isFinite(base)) throw new Error('no price');
    quotes[t] = {
      price: p,
      chg: +(p - base).toFixed(4),
      pct: +(((p - base) / base) * 100).toFixed(4),
      cur: m.currency || 'USD',
      ts: (m.regularMarketTime ?? Math.floor(Date.now() / 1000)) * 1000,
    };
    ok++;
  } catch (e) {
    fail.push(`${t} (${e.message})`);
  }
  await new Promise(r => setTimeout(r, 250));   // 예의상 간격
}

writeFileSync(OUT, JSON.stringify({ generatedAt: Date.now(), quotes }, null, 1));
console.log(`성공 ${ok}/${tickers.length}`);
if (fail.length) console.log('실패: ' + fail.join(', '));
// 전부 실패하면 워크플로를 빨간불로 — 조용히 오래된 값이 남는 상황을 막는다
if (ok === 0) { console.error('모든 종목 조회 실패'); process.exit(1); }
