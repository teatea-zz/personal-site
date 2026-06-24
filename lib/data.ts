import type { Note, Work } from '@/types/database'

// Fallback seed data shown before Supabase is connected
export const SEED_NOTES: Note[] = [
  {
    id: 1,
    type: '노트',
    date: '2026.06.12',
    title: '스위스 그리드에 관한 노트',
    sub: '뮐러-브로크만, 다시 읽기',
    body: [
      "그리드는 감옥이 아니라, 한 번 내려두면 매 페이지마다 다시 고민하지 않아도 되는 결정의 묶음이다. 뮐러-브로크만의 핵심은 선이 아니라, 그 선으로 매번 되돌아오는 규율이었다.",
      "화면에서는 8단 그리드로 자꾸 돌아오게 된다. 휴대폰에서도 살아남고, 4단으로 깔끔하게 접히며, 한 장의 이미지가 전체 폭을 원할 때 일부러 규칙을 깰 여백까지 남는다."
    ],
    private: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    type: '노트',
    date: '2026.05.30',
    title: 'OKLCH 컬러 시스템, 실전',
    sub: '지각 기반 팔레트 설계',
    body: [
      "HEX는 편리하지만 지각적으로는 정직하지 않다. OKLCH는 계속 어림짐작하던 내 머릿속 한 조각을 바로잡아 준다.",
      "명도와 채도를 고정하고 색상만 걷는다. 그러면 액센트가 우연이 아니라 하나의 가족이 되고, 다크 모드가 더 이상 탁해지지 않는다."
    ],
    private: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    type: '습작',
    date: '2026.05.24',
    title: '그리드 변주 실험',
    sub: '8단 그리드를 비트는 연습',
    body: [
      "8단 그리드를 기본으로 두고, 한 칸씩 어긋내거나 합치며 리듬을 만드는 연습. 규칙이 있어야 규칙을 깨는 일이 의미를 가진다.",
      "개인적인 실험이라 결과보다 과정을 남긴다."
    ],
    private: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 4,
    type: '초고',
    date: '2026.05.18',
    title: '서브그리드: 현장 기록',
    sub: '초고 — 작업 중',
    body: [
      "자리표시자. 이 사이트의 갤러리를 서브그리드로 다시 만들며 남긴 기록. 사파리를 그만 깨뜨리면 공개할 예정."
    ],
    private: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 5,
    type: '독서',
    date: '2026.04.27',
    title: '독서 — 비넬리 카논',
    sub: '절제와 규율에 관하여',
    body: [
      "비넬리의 카논은 간직한 것보다 버린 것이 더 많은 사람의 글처럼 읽힌다. 그 절제 자체가 내용이다.",
      "취향이란 결국 하지 않기로 정한 것들의 목록이다."
    ],
    private: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 6,
    type: '로그',
    date: '2026.04.09',
    title: '데일리 로그 — 14주차',
    sub: '습작과 작은 성취',
    body: [
      "아카이브 스키마를 끝냈고, 두 챕터를 읽었고, OKLCH 팔레트를 이 사이트에 적용했다.",
      "작은 성취도 성취다."
    ],
    private: false,
    created_at: new Date().toISOString(),
  },
]

export const SEED_WORKS: Work[] = [
  {
    id: 1,
    title: '아카이브 시스템',
    year: '2026',
    role: '디자인 / 개발',
    field: '웹',
    tools: 'Figma · React',
    tag: 'WEB',
    img: 'https://picsum.photos/seed/jh-archive-sys/1200/700',
    description: [
      "개인 아카이브를 위한 디자인 시스템이자 웹 애플리케이션. 완성작과 습작, 노트와 데일리 로그를 하나의 인덱스로 묶었다.",
      "OKLCH 기반 팔레트와 8단 그리드를 토대로 다크 테마를 설계했고, 슬라이드업 오버레이로 모든 하위 화면을 한 페이지 안에서 다룬다."
    ],
    gallery: ['https://picsum.photos/seed/jh-archive-1/1200/900', 'https://picsum.photos/seed/jh-archive-2/1200/900'],    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    title: '필드 레코더',
    year: '2025',
    role: '아이덴티티',
    field: '브랜딩',
    tools: 'Glyphs · InDesign',
    tag: 'BRAND',
    img: 'https://picsum.photos/seed/jh-field-rec/1200/700',
    description: [
      "현장 녹음을 기록하는 작은 레이블을 위한 비주얼 아이덴티티. 모노스페이스 로고타입과 빈티지 필름 톤의 사진 언어로 아날로그적 질감을 끌어냈다.",
      "명함부터 카세트 인레이까지, 같은 그리드와 색 가족 안에서 변주되도록 시스템을 구성했다."
    ],
    gallery: ['https://picsum.photos/seed/jh-field-1/1200/900', 'https://picsum.photos/seed/jh-field-2/1200/900'],    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    title: '타입 스페시멘 03',
    year: '2025',
    role: '에디토리얼',
    field: '출판',
    tools: 'InDesign',
    tag: 'PRINT',
    img: 'https://picsum.photos/seed/jh-type-spec/1200/700',
    description: [
      "한글 본문 서체를 위한 견본 책자. 행폭과 행간, 크기의 단계를 실제 긴 글 안에서 검증하며 조판 규칙을 정리했다.",
      "장식을 덜어내고 본문 자체가 주인공이 되도록, 여백과 리듬에 대부분의 시간을 썼다."
    ],
    gallery: ['https://picsum.photos/seed/jh-type-1/1200/900', 'https://picsum.photos/seed/jh-type-2/1200/900'],    created_at: new Date().toISOString(),
  },
  {
    id: 4,
    title: '스튜디오 인덱스',
    year: '2024',
    role: '웹',
    field: '웹',
    tools: 'HTML · CSS',
    tag: 'WEB',
    img: 'https://picsum.photos/seed/jh-studio-idx/1200/700',
    description: [
      "작업을 시간순으로 늘어놓는 가장 단순한 형태의 포트폴리오. 한 페이지, 한 인덱스, 군더더기 없는 항법.",
      "이후 아카이브 시스템으로 발전하는 출발점이 된 프로젝트다."
    ],
    gallery: ['https://picsum.photos/seed/jh-studio-1/1200/900', 'https://picsum.photos/seed/jh-studio-2/1200/900'],    created_at: new Date().toISOString(),
  },
]
