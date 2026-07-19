/* StockMap 데이터
 *
 * 최종 검증: 2026-07-19 — 관계 56건 중 14건을 웹 검색으로 대조.
 *   수정 4건 (MS-OpenAI 독점 해제, 삼성 HBM4 양산, 엔비디아 점유율, 아리스타 고객 비중)
 *   추가 1건 (아마존 → OpenAI 투자)
 *   삭제 1건 (슈퍼마이크로 → 메타 — 근거 확인 실패)
 *
 * 나머지 42건은 미검증 상태다. "확인됨"이 아니라 "확인하지 않음"이다.
 * 특히 개별 계약을 주장하는 항목(전력·냉각 등)은 근거가 약하다.
 */

const SECTORS = {
  "chip": {
    "name": "반도체 설계",
    "color": "#7dd3fc"
  },
  "foundry": {
    "name": "파운드리/장비",
    "color": "#fbbf24"
  },
  "memory": {
    "name": "메모리",
    "color": "#c084fc"
  },
  "cloud": {
    "name": "클라우드/빅테크",
    "color": "#4ade80"
  },
  "ai": {
    "name": "AI 모델/SW",
    "color": "#f472b6"
  },
  "hw": {
    "name": "서버/네트워크",
    "color": "#fb923c"
  },
  "u_mrr98fvj": {
    "name": "보안 S/W",
    "color": "#a78bfa"
  }
};

const LINK_TYPES = {
  "supply": {
    "name": "공급",
    "color": "#38bdf8",
    "dash": null
  },
  "customer": {
    "name": "고객",
    "color": "#4ade80",
    "dash": null
  },
  "partner": {
    "name": "협력",
    "color": "#a78bfa",
    "dash": "6 4"
  },
  "compete": {
    "name": "경쟁",
    "color": "#f87171",
    "dash": "2 5"
  },
  "invest": {
    "name": "투자/지분",
    "color": "#facc15",
    "dash": "10 4"
  }
};

const NODES = [
  {
    "id": "nvda",
    "name": "엔비디아",
    "ticker": "NVDA",
    "sector": "chip",
    "role": "AI 가속기(GPU) 절대 강자",
    "desc": "AI 학습·추론용 GPU 시장의 70~85%를 점유(2026년 추정, 출처별 편차). CUDA 생태계가 진입장벽이나 빅테크 커스텀 실리콘이 합산 15~20%까지 잠식. 최근에는 Spectrum-X로 이더넷 스위치 시장까지 진입.",
    "tags": [
      "GPU",
      "CUDA",
      "AI학습"
    ]
  },
  {
    "id": "avgo",
    "name": "브로드컴",
    "ticker": "AVGO",
    "sector": "chip",
    "role": "맞춤형 AI칩(ASIC) + 네트워크 칩",
    "desc": "빅테크가 직접 설계하려는 자체 AI칩을 함께 개발해주는 파트너. 구글 TPU, 메타 MTIA가 대표작. 데이터센터 이더넷 스위치칩(Tomahawk)도 1위.",
    "tags": [
      "ASIC",
      "XPU",
      "네트워킹"
    ]
  },
  {
    "id": "amd",
    "name": "AMD",
    "ticker": "AMD",
    "sector": "chip",
    "role": "엔비디아의 유일한 GPU 대항마",
    "desc": "MI300/MI350 시리즈로 AI 가속기 시장 추격. 서버 CPU(EPYC)에서는 인텔 점유율을 계속 뺏어오는 중.",
    "tags": [
      "GPU",
      "CPU",
      "ROCm"
    ]
  },
  {
    "id": "mrvl",
    "name": "마벨",
    "ticker": "MRVL",
    "sector": "chip",
    "role": "맞춤형 AI칩 2인자 + 광통신",
    "desc": "브로드컴과 커스텀 ASIC 시장을 양분. 아마존 트레이니엄 등에 참여. 데이터센터 간 광(optical) 인터커넥트 강자.",
    "tags": [
      "ASIC",
      "광통신"
    ]
  },
  {
    "id": "intc",
    "name": "인텔",
    "ticker": "INTC",
    "sector": "chip",
    "role": "전통 CPU 강자, 파운드리 재도전",
    "desc": "서버·PC CPU 점유율을 AMD/ARM에 잠식당하는 중. 18A 공정으로 파운드리 사업 반전을 노림.",
    "tags": [
      "CPU",
      "IDM",
      "18A"
    ]
  },
  {
    "id": "arm",
    "name": "ARM",
    "ticker": "ARM",
    "sector": "chip",
    "role": "CPU 설계 IP 라이선스",
    "desc": "칩을 직접 만들지 않고 설계도(아키텍처)를 팔아 로열티를 받음. 모바일 사실상 독점, 최근 데이터센터로 확장.",
    "tags": [
      "IP",
      "저전력",
      "로열티"
    ]
  },
  {
    "id": "qcom",
    "name": "퀄컴",
    "ticker": "QCOM",
    "sector": "chip",
    "role": "모바일 AP·모뎀",
    "desc": "스마트폰 두뇌(스냅드래곤)와 통신 모뎀. 온디바이스 AI와 PC/자동차로 영역 확장 중.",
    "tags": [
      "모바일",
      "온디바이스AI"
    ]
  },
  {
    "id": "tsm",
    "name": "TSMC",
    "ticker": "TSM",
    "sector": "foundry",
    "role": "첨단 칩 위탁생산 사실상 독점",
    "desc": "엔비디아·애플·AMD·브로드컴 등 거의 모든 설계 회사의 칩을 실제로 찍어냄. 첨단 패키징(CoWoS)이 AI칩 공급량의 병목.",
    "tags": [
      "3nm",
      "CoWoS",
      "위탁생산"
    ]
  },
  {
    "id": "asml",
    "name": "ASML",
    "ticker": "ASML",
    "sector": "foundry",
    "role": "EUV 노광장비 세계 유일 공급",
    "desc": "첨단 반도체를 만들려면 반드시 필요한 EUV 장비를 만드는 유일한 회사. 사실상 산업 전체의 최상류 관문.",
    "tags": [
      "EUV",
      "독점",
      "장비"
    ]
  },
  {
    "id": "amat",
    "name": "어플라이드머티어리얼즈",
    "ticker": "AMAT",
    "sector": "foundry",
    "role": "증착·식각 등 종합 장비",
    "desc": "반도체 공정 전반의 장비를 가장 폭넓게 공급. 파운드리·메모리 설비투자(CAPEX)에 실적이 직결됨.",
    "tags": [
      "장비",
      "CAPEX"
    ]
  },
  {
    "id": "mu",
    "name": "마이크론",
    "ticker": "MU",
    "sector": "memory",
    "role": "HBM·D램·낸드",
    "desc": "AI GPU 옆에 반드시 붙는 고대역폭 메모리(HBM) 3대 공급사 중 하나. 미국 상장 메모리 대표주.",
    "tags": [
      "HBM",
      "DRAM"
    ]
  },
  {
    "id": "hynix",
    "name": "SK하이닉스",
    "ticker": "000660.KS",
    "sector": "memory",
    "role": "HBM 시장 1위",
    "desc": "엔비디아 GPU에 들어가는 HBM을 가장 먼저·가장 많이 공급. AI 사이클의 최대 수혜 메모리 기업.",
    "tags": [
      "HBM",
      "국내"
    ]
  },
  {
    "id": "samsung",
    "name": "삼성전자",
    "ticker": "005930.KS",
    "sector": "memory",
    "role": "메모리 + 파운드리 동시 보유",
    "desc": "D램 1위이자 TSMC를 쫓는 파운드리 2위. HBM4가 엔비디아 품질 테스트 최고 평가를 받고 2026년 2월 양산에 진입해 HBM 점유율 28% 전망 — 더 이상 단순 추격자가 아님.",
    "tags": [
      "DRAM",
      "파운드리",
      "국내"
    ]
  },
  {
    "id": "msft",
    "name": "마이크로소프트",
    "ticker": "MSFT",
    "sector": "cloud",
    "role": "Azure + OpenAI 최대 파트너",
    "desc": "AI 수요를 클라우드(Azure) 매출로 직접 환산하는 구조. 2026년 4월 OpenAI와의 파트너십이 재편되며 독점 클라우드 지위를 잃었고, IP 라이선스는 2032년까지 비독점으로 유지.",
    "tags": [
      "Azure",
      "Copilot"
    ]
  },
  {
    "id": "googl",
    "name": "구글(알파벳)",
    "ticker": "GOOGL",
    "sector": "cloud",
    "role": "자체 AI칩 TPU + 자체 모델",
    "desc": "칩(TPU)·모델(Gemini)·클라우드·검색을 모두 자체 보유한 유일한 수직계열 기업. 엔비디아 의존도를 낮추려는 대표 주자.",
    "tags": [
      "TPU",
      "Gemini",
      "GCP"
    ]
  },
  {
    "id": "meta",
    "name": "메타",
    "ticker": "META",
    "sector": "cloud",
    "role": "AI 최대 구매자 중 하나",
    "desc": "광고 추천 정확도를 위해 GPU를 대량 구매. 동시에 브로드컴과 자체칩(MTIA)을 개발해 비용을 낮추려 함. Llama를 오픈소스로 공개.",
    "tags": [
      "MTIA",
      "Llama",
      "광고"
    ]
  },
  {
    "id": "amzn",
    "name": "아마존",
    "ticker": "AMZN",
    "sector": "cloud",
    "role": "AWS + 자체칩 트레이니엄",
    "desc": "클라우드 점유율 1위. 자체 학습칩(Trainium)·추론칩(Inferentia)을 마벨 등과 개발. 앤스로픽에 최대 250억달러, 2026년 2월에는 OpenAI에도 최대 500억달러를 투자해 양 진영에 모두 발을 걸침.",
    "tags": [
      "AWS",
      "Trainium"
    ]
  },
  {
    "id": "aapl",
    "name": "애플",
    "ticker": "AAPL",
    "sector": "cloud",
    "role": "자체 실리콘 + 온디바이스 AI",
    "desc": "M/A 시리즈 칩을 직접 설계해 TSMC 최신 공정을 가장 먼저 사용. 클라우드보다 기기 위에서 AI를 돌리는 전략.",
    "tags": [
      "M시리즈",
      "온디바이스"
    ]
  },
  {
    "id": "orcl",
    "name": "오라클",
    "ticker": "ORCL",
    "sector": "cloud",
    "role": "AI 전용 클라우드 급성장",
    "desc": "OCI로 대형 AI 기업에 GPU 인프라를 임대. OpenAI와 5년 약 3,000억달러 규모 Stargate 계약을 맺었으나, 2026년 3월 텍사스 플래그십 확장이 무산되는 등 자금 조달 부담이 실적 변수.",
    "tags": [
      "OCI",
      "RPO"
    ]
  },
  {
    "id": "openai",
    "name": "OpenAI",
    "ticker": null,
    "sector": "ai",
    "role": "ChatGPT (비상장)",
    "desc": "비상장이지만 GPU 수요의 최대 발원지. 2026년 4월 MS와의 독점 계약이 풀리며 모든 주요 클라우드를 쓸 수 있게 됐고, 같은 해 2월 아마존으로부터 최대 500억달러를 유치. 브로드컴과 만든 자체 추론칩 Jalapeño를 6월 공개.",
    "tags": [
      "비상장",
      "GPT"
    ]
  },
  {
    "id": "anthropic",
    "name": "Anthropic",
    "ticker": null,
    "sector": "ai",
    "role": "Claude (비상장)",
    "desc": "아마존·구글로부터 대규모 투자를 받고 AWS 트레이니엄과 구글 TPU를 함께 사용.",
    "tags": [
      "비상장",
      "Claude"
    ]
  },
  {
    "id": "pltr",
    "name": "팔란티어",
    "ticker": "PLTR",
    "sector": "ai",
    "role": "AI 운영 플랫폼",
    "desc": "정부·기업 데이터를 실제 의사결정에 붙이는 소프트웨어. AI 인프라가 아닌 \"적용\" 단계 대표주.",
    "tags": [
      "AIP",
      "정부"
    ]
  },
  {
    "id": "smci",
    "name": "슈퍼마이크로",
    "ticker": "SMCI",
    "sector": "hw",
    "role": "AI 서버 조립",
    "desc": "GPU를 받아 서버 랙 형태로 조립해 납품. 매출은 크지만 마진이 얇아 GPU 공급량에 실적이 좌우됨.",
    "tags": [
      "서버",
      "수냉"
    ]
  },
  {
    "id": "anet",
    "name": "아리스타",
    "ticker": "ANET",
    "sector": "hw",
    "role": "데이터센터 스위치",
    "desc": "GPU 수천 장을 하나로 묶는 고속 이더넷 네트워크 장비. 메타·MS가 핵심 고객.",
    "tags": [
      "이더넷",
      "스위치"
    ]
  },
  {
    "id": "vrt",
    "name": "버티브",
    "ticker": "VRT",
    "sector": "hw",
    "role": "데이터센터 전력·냉각",
    "desc": "GPU 밀집으로 급증한 발열과 전력을 처리하는 설비. AI 데이터센터 건설의 필수 인프라.",
    "tags": [
      "냉각",
      "전력"
    ]
  },
  {
    "id": "u_mrr99mql",
    "name": "크라우드스트라이크",
    "ticker": "CRWD",
    "sector": "u_mrr98fvj",
    "role": "—",
    "desc": "설명이 아직 없습니다.",
    "tags": []
  }
];

const LINKS = [
  {
    "from": "asml",
    "to": "tsm",
    "type": "supply",
    "label": "EUV 장비 공급"
  },
  {
    "from": "asml",
    "to": "samsung",
    "type": "supply",
    "label": "EUV 장비 공급"
  },
  {
    "from": "asml",
    "to": "intc",
    "type": "supply",
    "label": "EUV 장비 공급"
  },
  {
    "from": "amat",
    "to": "tsm",
    "type": "supply",
    "label": "공정 장비 공급"
  },
  {
    "from": "amat",
    "to": "samsung",
    "type": "supply",
    "label": "공정 장비 공급"
  },
  {
    "from": "amat",
    "to": "mu",
    "type": "supply",
    "label": "공정 장비 공급"
  },
  {
    "from": "tsm",
    "to": "nvda",
    "type": "supply",
    "label": "GPU 위탁생산(3/4nm+CoWoS)"
  },
  {
    "from": "tsm",
    "to": "amd",
    "type": "supply",
    "label": "MI 시리즈 위탁생산"
  },
  {
    "from": "tsm",
    "to": "avgo",
    "type": "supply",
    "label": "커스텀 ASIC 생산"
  },
  {
    "from": "tsm",
    "to": "aapl",
    "type": "supply",
    "label": "M/A칩 최신공정 우선 배정"
  },
  {
    "from": "tsm",
    "to": "qcom",
    "type": "supply",
    "label": "스냅드래곤 생산"
  },
  {
    "from": "tsm",
    "to": "mrvl",
    "type": "supply",
    "label": "ASIC 생산"
  },
  {
    "from": "hynix",
    "to": "nvda",
    "type": "supply",
    "label": "HBM 최대 공급 (HBM4 점유율 55%)",
    "v": { "at": "2026-07-19", "conf": "high", "src": "newdaily.co.kr" }
  },
  {
    "from": "mu",
    "to": "nvda",
    "type": "supply",
    "label": "HBM 공급"
  },
  {
    "from": "samsung",
    "to": "nvda",
    "type": "supply",
    "label": "HBM4 공급 (2026.2 양산, 점유율 28%)",
    "v": { "at": "2026-07-19", "conf": "high", "src": "epnc.co.kr" }
  },
  {
    "from": "hynix",
    "to": "amd",
    "type": "supply",
    "label": "HBM 공급"
  },
  {
    "from": "hynix",
    "to": "samsung",
    "type": "compete",
    "label": "HBM/D램 점유율 경쟁"
  },
  {
    "from": "mu",
    "to": "hynix",
    "type": "compete",
    "label": "HBM4 3파전 (하이닉스 55 · 삼성 28 · 마이크론 17)",
    "v": { "at": "2026-07-19", "conf": "high", "src": "newdaily.co.kr" }
  },
  {
    "from": "nvda",
    "to": "msft",
    "type": "customer",
    "label": "GPU 대량 납품"
  },
  {
    "from": "nvda",
    "to": "meta",
    "type": "customer",
    "label": "GPU 대량 납품"
  },
  {
    "from": "nvda",
    "to": "amzn",
    "type": "customer",
    "label": "GPU 납품"
  },
  {
    "from": "nvda",
    "to": "googl",
    "type": "customer",
    "label": "GPU 납품(TPU와 병행)"
  },
  {
    "from": "nvda",
    "to": "orcl",
    "type": "customer",
    "label": "OCI용 GPU 납품"
  },
  {
    "from": "amd",
    "to": "meta",
    "type": "customer",
    "label": "MI 시리즈 도입"
  },
  {
    "from": "amd",
    "to": "msft",
    "type": "customer",
    "label": "MI 시리즈 도입"
  },
  {
    "from": "avgo",
    "to": "googl",
    "type": "partner",
    "label": "TPU 공동 설계"
  },
  {
    "from": "avgo",
    "to": "meta",
    "type": "partner",
    "label": "MTIA 공동 설계"
  },
  {
    "from": "avgo",
    "to": "openai",
    "type": "partner",
    "label": "Jalapeño 추론칩 공동 개발 (2026.6 공개)",
    "v": { "at": "2026-07-19", "conf": "high", "src": "openai.com" }
  },
  {
    "from": "mrvl",
    "to": "amzn",
    "type": "partner",
    "label": "Trainium 주 설계 파트너 (3·4세대는 불확실)",
    "v": { "at": "2026-07-19", "conf": "weak", "src": "finance.yahoo.com" }
  },
  {
    "from": "avgo",
    "to": "mrvl",
    "type": "compete",
    "label": "커스텀 ASIC 수주 경쟁"
  },
  {
    "from": "avgo",
    "to": "nvda",
    "type": "compete",
    "label": "ASIC vs GPU / 네트워킹"
  },
  {
    "from": "amd",
    "to": "nvda",
    "type": "compete",
    "label": "AI 가속기 정면 경쟁"
  },
  {
    "from": "amd",
    "to": "intc",
    "type": "compete",
    "label": "서버 CPU 점유율 경쟁"
  },
  {
    "from": "intc",
    "to": "tsm",
    "type": "compete",
    "label": "파운드리 도전",
    "v": { "at": "2026-07-19", "conf": "high", "src": "intel.com" }
  },
  {
    "from": "samsung",
    "to": "tsm",
    "type": "compete",
    "label": "파운드리 2위 추격"
  },
  {
    "from": "msft",
    "to": "openai",
    "type": "invest",
    "label": "대규모 투자 · 2026.4 비독점 전환",
    "v": { "at": "2026-07-19", "conf": "high", "src": "openai.com" }
  },
  {
    "from": "amzn",
    "to": "openai",
    "type": "invest",
    "label": "2026.2 최대 500억달러 투자 (1,100억 라운드)",
    "v": { "at": "2026-07-19", "conf": "high", "src": "cnbc.com" }
  },
  {
    "from": "orcl",
    "to": "openai",
    "type": "customer",
    "label": "Stargate — 5년 약 3,000억달러",
    "v": { "at": "2026-07-19", "conf": "high", "src": "openai.com" }
  },
  {
    "from": "amzn",
    "to": "anthropic",
    "type": "invest",
    "label": "최대 250억달러 투자 · Trainium 5GW",
    "v": { "at": "2026-07-19", "conf": "high", "src": "cnbc.com" }
  },
  {
    "from": "googl",
    "to": "anthropic",
    "type": "invest",
    "label": "최대 400억달러 투자 · TPU 5GW",
    "v": { "at": "2026-07-19", "conf": "high", "src": "datacenterfrontier.com" }
  },
  {
    "from": "googl",
    "to": "openai",
    "type": "compete",
    "label": "Gemini vs GPT"
  },
  {
    "from": "anthropic",
    "to": "openai",
    "type": "compete",
    "label": "프런티어 모델 경쟁"
  },
  {
    "from": "meta",
    "to": "openai",
    "type": "compete",
    "label": "오픈소스(Llama) 대항"
  },
  {
    "from": "msft",
    "to": "googl",
    "type": "compete",
    "label": "클라우드·검색 경쟁"
  },
  {
    "from": "amzn",
    "to": "msft",
    "type": "compete",
    "label": "AWS vs Azure"
  },
  {
    "from": "nvda",
    "to": "smci",
    "type": "supply",
    "label": "GPU → 서버 조립",
    "v": { "at": "2026-07-19", "conf": "high", "src": "sec.gov" }
  },
  {
    "from": "anet",
    "to": "meta",
    "type": "customer",
    "label": "최대 고객 (아리스타 매출의 26%)",
    "v": { "at": "2026-07-19", "conf": "high", "src": "trefis.com" }
  },
  {
    "from": "anet",
    "to": "msft",
    "type": "customer",
    "label": "주요 고객 (아리스타 매출의 16%)",
    "v": { "at": "2026-07-19", "conf": "high", "src": "trefis.com" }
  },
  {
    "from": "avgo",
    "to": "anet",
    "type": "supply",
    "label": "Tomahawk 스위치칩 공급"
  },
  {
    "from": "anet",
    "to": "nvda",
    "type": "compete",
    "label": "이더넷 vs InfiniBand — 엔비디아가 Spectrum-X로 역공",
    "v": { "at": "2026-07-19", "conf": "high", "src": "fierce-network.com" }
  },
  {
    "from": "vrt",
    "to": "msft",
    "type": "customer",
    "label": "전력·냉각 (조기 파트너십, 개별 계약 미확인)",
    "v": { "at": "2026-07-19", "conf": "weak", "src": "enkiai.com" }
  },
  {
    "from": "vrt",
    "to": "orcl",
    "type": "customer",
    "label": "전력·냉각 (조기 파트너십, 개별 계약 미확인)",
    "v": { "at": "2026-07-19", "conf": "weak", "src": "enkiai.com" }
  },
  {
    "from": "arm",
    "to": "qcom",
    "type": "supply",
    "label": "CPU 설계 IP 라이선스"
  },
  {
    "from": "arm",
    "to": "aapl",
    "type": "supply",
    "label": "아키텍처 라이선스"
  },
  {
    "from": "arm",
    "to": "nvda",
    "type": "supply",
    "label": "Grace CPU IP"
  },
  {
    "from": "pltr",
    "to": "msft",
    "type": "partner",
    "label": "Azure 정부·기밀 클라우드에 AIP 배포",
    "v": { "at": "2026-07-19", "conf": "high", "src": "businesswire.com" }
  }
];
