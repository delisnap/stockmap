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

GitHub Actions가 서버에서 시세를 받아 `quotes.json`으로 커밋하고,
페이지는 같은 도메인의 그 파일만 읽는다. 프록시도 API 키도 필요 없다.

브라우저에서 시세 API를 직접 부르지 않는 이유는 **CORS 때문**이다.
`file://`에서는 되지만 실제 웹 주소에서는 차단되어 주가가 전부 비어 버린다.

시세 출처 (둘 다 키 불필요):

| 대상 | 출처 |
|---|---|
| 해외 (NVDA 등) | CNBC quote 웹서비스 — 한 번에 20종목씩 |
| 국내 (`.KS` / `.KQ`) | 네이버 금융 |

> Yahoo Finance API는 쓰지 않는다. 쿠키·crumb 없는 서버 요청에 `429 Too Many Requests`를 반환한다.
> 비공식 엔드포인트들이므로 언제든 바뀔 수 있다 — 워크플로가 실패하면 이 부분을 먼저 의심할 것.

- 평일 30분마다 자동 실행 (UTC 기준, GitHub 사정으로 수십 분 지연될 수 있음)
- `data.js`를 푸시하면 즉시 실행
- **Actions** 탭 → `시세 갱신` → `Run workflow` 로 수동 실행

따라서 **실시간 호가가 아니라 최대 30분 지연된 값**이다. 매매 판단에는 증권사 시세를 쓸 것.

> 예약 워크플로는 저장소가 60일간 활동이 없으면 GitHub가 자동으로 비활성화한다.
> 그 경우 Actions 탭에서 다시 켜면 된다.

## 기업 · 업종 추가

사이트 왼쪽의 **＋ 업종 추가 / ＋ 기업 추가** 버튼으로 브라우저에서 바로 추가할 수 있다.
추가한 내용은 일단 그 브라우저에만 저장된다. 사이트에 영구 반영하는 방법은 두 가지다.

### 1) GitHub에 반영 (원클릭)

**내가 추가한 항목 → GitHub에 반영** 버튼이 저장소의 `data.js`를 바로 커밋한다.
처음 한 번은 토큰 등록이 필요하다:

1. [Fine-grained token 발급](https://github.com/settings/personal-access-tokens/new)
2. **Repository access**: `Only select repositories` → 이 저장소만
3. **Permissions → Repository permissions → Contents: Read and write** (이것 하나만)
4. 사이트의 **설정**에 붙여넣기

커밋되면 워크플로가 새 종목 시세를 받아오고 Pages가 다시 배포된다.

> 토큰은 이 브라우저의 localStorage에만 저장되고 `api.github.com` 외에는 전송되지 않는다.
> 그래도 **공용 PC에서는 쓰지 말 것** — 저장소 쓰기 권한이 남는다.
> 권한은 Contents 하나로 제한하고 만료일을 짧게 두는 것을 권한다.
> 유출이 의심되면 GitHub 설정에서 토큰을 폐기하면 즉시 무효가 된다.

### 2) 파일로 내보내기 (토큰 없이)

**data.js로 내보내기** → 받은 파일로 저장소의 `data.js`를 덮어쓰고 → 푸시.

## 데이터 관련 주의

`data.js`의 관계 설명은 산업 구조를 바탕으로 손으로 정리한 것이라 최신 계약 변동은 반영되어 있지 않다. 투자 판단 전에 원자료로 확인할 것.
