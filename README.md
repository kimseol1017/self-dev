# SELF — 자기계발 대시보드

모던하고 침착한 감각의 자기계발 대시보드입니다.

## 🚀 실행 방법

### 1. 의존성 설치
```bash
npm install
```

### 2. 서버 시작
```bash
npm start
# 또는
npm run dev
```

### 3. 브라우저 열기
```
http://localhost:3000
```

## 📁 구조

```
selfdev/
├── src/
│   └── server.ts        # Express + TypeScript 백엔드
├── public/
│   └── index.html       # 프론트엔드 (단일 파일)
├── data/
│   └── store.json       # 로컬 데이터 저장소
├── tsconfig.json
└── package.json
```

## ✨ 기능

| 섹션 | 설명 |
|------|------|
| **날짜/시간** | 실시간 시계, 요일 표시 |
| **나에게 한마디** | 자유 텍스트 입력, 자동 저장 (2초 딜레이) |
| **ToDo 리스트** | 추가/완료/삭제, 진행률 바 |
| **오늘의 영감** | Claude API로 철학자/기업가 명언 동적 생성 |
| **Claude 추천** | 오늘 날짜 기반 자기계발 추천 3가지 |

## 💾 데이터 저장

- `나에게 한마디`와 `ToDo`는 `data/store.json`에 로컬 저장
- 서버 재시작 후에도 데이터 유지
- API 연결 실패 시 브라우저 메모리로 동작 (새로고침 시 초기화)

## 🔑 API 설정

Claude API 명언/추천 기능은 claude.ai 환경에서 자동으로 API 키가 적용됩니다.
로컬에서 직접 사용 시 `public/index.html`의 fetch 헤더에 API 키를 추가하세요:
```javascript
headers: {
  'Content-Type': 'application/json',
  'x-api-key': 'YOUR_API_KEY',
  'anthropic-version': '2023-06-01',
  'anthropic-dangerous-direct-browser-access': 'true'
}
```
