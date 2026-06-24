# Personal Site
학습 기록과 디자인 작업물을 아카이브하는 개인 홈페이지.

🛠 Next.js 15 · TypeScript · Supabase
---

## 주요 기능

- **홈페이지** — 히어로 카드, 슬라이드업 시트, 갤러리 라이트박스, 소셜 링크
- **Notes / Works** — 작성 날짜순 자동 정렬 (Notes: `date`, Works: `year` 내림차순)
- **관리자 CMS** (`/admin`)
  - Notes / Works CRUD
  - 이미지 업로드 (Supabase Storage)
  - 아이디 · 비밀번호 로그인 (Supabase Auth + RLS 이중 보호)
- **반응형** — 데스크톱 / 노트북 / 태블릿 / 모바일 4단계 대응