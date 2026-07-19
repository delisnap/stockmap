# StockMap

주식 종목을 업종별로 분류하고 기업 간 관계를 지도로 보는 정적 사이트.
노드를 누르면 하는 일 · 주가 · 연결 관계가 뜬다. 빌드 도구 없이 `index.html`만 열면 동작한다.

```
index.html                     사이트 전체 (HTML/CSS/JS 한 파일)
data.js                        업종 · 기업 · 관계 데이터  ← 여기만 고치면 반영됨
quotes.json                    시세 스냅샷 (Actions가 자동 갱신, 직접 건드릴 필요 없음)
scripts/fetch-quotes.mjs       시세 수집 스크립트
.github/workflows/quotes.yml   30분마다 시세 갱신
```

## GitHub Pages 배포

1. GitHub에서 저장소를 만든다 (**Public** — Pages 무료는 공개 저장소만 지원).
2. 푸시한다.

   ```bash
   git remote add origin https://github.com/<계정>/stockmap.git
   git push -u origin main
   ```

3. 저장소 **Settings → Pages → Source: `Deploy from a branch`**,
   Branch를 **`main` / `(root)`** 로 지정하고 저장.
4. 1~2분 뒤 `https://<계정>.github.io/stockmap/` 에서 열린다.

## 시세가 갱신되는 방식

Yahoo Finance API는 브라우저에서 직접 호출하면 **CORS로 차단된다**.
그래서 GitHub Actions가 서버에서 시세를 받아 `quotes.json`으로 커밋하고,
페이지는 같은 도메인의 그 파일만 읽는다. 프록시도 API 키도 필요 없다.

- 평일 30분마다 자동 실행 (UTC 기준, GitHub 사정으로 수십 분 지연될 수 있음)
- `data.js`를 푸시하면 즉시 실행
- **Actions** 탭 → `시세 갱신` → `Run workflow` 로 수동 실행

따라서 **실시간 호가가 아니라 최대 30분 지연된 값**이다. 매매 판단에는 증권사 시세를 쓸 것.

> 예약 워크플로는 저장소가 60일간 활동이 없으면 GitHub가 자동으로 비활성화한다.
> 그 경우 Actions 탭에서 다시 켜면 된다.

## 기업 · 업종 추가

사이트 왼쪽의 **＋ 업종 추가 / ＋ 기업 추가** 버튼으로 브라우저에서 바로 추가할 수 있다.
추가한 내용은 그 브라우저에만 저장되므로, 사이트에 영구 반영하려면:

**data.js로 내보내기** → 받은 파일로 저장소의 `data.js`를 덮어쓰고 → 푸시.

푸시하면 새 종목의 시세도 워크플로가 자동으로 받아온다.

## 데이터 관련 주의

`data.js`의 관계 설명은 산업 구조를 바탕으로 손으로 정리한 것이라 최신 계약 변동은 반영되어 있지 않다. 투자 판단 전에 원자료로 확인할 것.
