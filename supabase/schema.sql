-- Notes table
create table if not exists notes (
  id          bigint generated always as identity primary key,
  type        text not null,           -- '노트' | '초고' | '습작' | '독서' | '로그'
  date        text not null,           -- '2026.06.12'
  title       text not null,
  sub         text not null default '',
  body        text[] not null default '{}',
  private     boolean not null default false,
  created_at  timestamptz not null default now()
);

-- Works table
create table if not exists works (
  id          bigint generated always as identity primary key,
  title       text not null,
  year        text not null,
  role        text not null,
  field       text not null,
  tools       text not null,
  tag         text not null,           -- 'WEB' | 'BRAND' | 'PRINT' etc.
  img         text not null,
  description text[] not null default '{}',
  gallery     text[] not null default '{}',
  created_at  timestamptz not null default now()
);

-- Enable RLS
alter table notes enable row level security;
alter table works enable row level security;

-- Public read
create policy "public read notes" on notes for select using (true);
create policy "public read works" on works for select using (true);

-- Authenticated write (admin only)
create policy "auth insert notes" on notes for insert with check (auth.role() = 'authenticated');
create policy "auth update notes" on notes for update using (auth.role() = 'authenticated');
create policy "auth delete notes" on notes for delete using (auth.role() = 'authenticated');

create policy "auth insert works" on works for insert with check (auth.role() = 'authenticated');
create policy "auth update works" on works for update using (auth.role() = 'authenticated');
create policy "auth delete works" on works for delete using (auth.role() = 'authenticated');

-- Storage bucket for work images
insert into storage.buckets (id, name, public) values ('works', 'works', true);

create policy "public read works images"
  on storage.objects for select using (bucket_id = 'works');

create policy "auth upload works images"
  on storage.objects for insert
  with check (bucket_id = 'works' and auth.role() = 'authenticated');

create policy "auth delete works images"
  on storage.objects for delete
  using (bucket_id = 'works' and auth.role() = 'authenticated');

-- Seed: Notes
insert into notes (type, date, title, sub, body, private) values
('노트', '2026.06.12', '스위스 그리드에 관한 노트', '뮐러-브로크만, 다시 읽기',
  array[
    '그리드는 감옥이 아니라, 한 번 내려두면 매 페이지마다 다시 고민하지 않아도 되는 결정의 묶음이다.',
    '화면에서는 8단 그리드로 자꾸 돌아오게 된다. 휴대폰에서도 살아남고, 4단으로 깔끔하게 접힌다.'
  ], false),

('노트', '2026.05.30', 'OKLCH 컬러 시스템, 실전', '지각 기반 팔레트 설계',
  array[
    'HEX는 편리하지만 지각적으로는 정직하지 않다. OKLCH는 계속 어림짐작하던 내 머릿속 한 조각을 바로잡아 준다.',
    '명도와 채도를 고정하고 색상만 걷는다. 다크 모드가 더 이상 탁해지지 않는다.'
  ], false),

('습작', '2026.05.24', '그리드 변주 실험', '8단 그리드를 비트는 연습',
  array[
    '8단 그리드를 기본으로 두고, 한 칸씩 어긋내거나 합치며 리듬을 만드는 연습.',
    '규칙이 있어야 규칙을 깨는 일이 의미를 가진다.'
  ], false),

('초고', '2026.05.18', '서브그리드: 현장 기록', '초고 — 작업 중',
  array['자리표시자. 사파리를 그만 깨뜨리면 공개할 예정.'],
  true),

('독서', '2026.04.27', '독서 — 비넬리 카논', '절제와 규율에 관하여',
  array[
    '비넬리의 카논은 간직한 것보다 버린 것이 더 많은 사람의 글처럼 읽힌다.',
    '취향이란 결국 하지 않기로 정한 것들의 목록이다.'
  ], false),

('로그', '2026.04.09', '데일리 로그 — 14주차', '습작과 작은 성취',
  array[
    '아카이브 스키마를 끝냈고, 두 챕터를 읽었고, OKLCH 팔레트를 이 사이트에 적용했다.',
    '작은 성취도 성취다.'
  ], false);

-- Seed: Works
insert into works (title, year, role, field, tools, tag, img, description, gallery) values
('아카이브 시스템', '2026', '디자인 / 개발', '웹', 'Figma · React', 'WEB',
  'https://picsum.photos/seed/jh-archive-sys/1200/700',
  array[
    '개인 아카이브를 위한 디자인 시스템이자 웹 애플리케이션.',
    'OKLCH 기반 팔레트와 8단 그리드를 토대로 다크 테마를 설계했다.'
  ],
  array['https://picsum.photos/seed/jh-archive-1/1200/900','https://picsum.photos/seed/jh-archive-2/1200/900']),

('필드 레코더', '2025', '아이덴티티', '브랜딩', 'Glyphs · InDesign', 'BRAND',
  'https://picsum.photos/seed/jh-field-rec/1200/700',
  array[
    '현장 녹음 레이블을 위한 비주얼 아이덴티티.',
    '명함부터 카세트 인레이까지 같은 그리드와 색 가족 안에서 변주되도록 시스템을 구성했다.'
  ],
  array['https://picsum.photos/seed/jh-field-1/1200/900','https://picsum.photos/seed/jh-field-2/1200/900']),

('타입 스페시멘 03', '2025', '에디토리얼', '출판', 'InDesign', 'PRINT',
  'https://picsum.photos/seed/jh-type-spec/1200/700',
  array[
    '한글 본문 서체를 위한 견본 책자.',
    '장식을 덜어내고 본문 자체가 주인공이 되도록 여백과 리듬에 시간을 썼다.'
  ],
  array['https://picsum.photos/seed/jh-type-1/1200/900','https://picsum.photos/seed/jh-type-2/1200/900']),

('스튜디오 인덱스', '2024', '웹', '웹', 'HTML · CSS', 'WEB',
  'https://picsum.photos/seed/jh-studio-idx/1200/700',
  array[
    '작업을 시간순으로 늘어놓는 가장 단순한 형태의 포트폴리오.',
    '이후 아카이브 시스템으로 발전하는 출발점이 된 프로젝트다.'
  ],
  array['https://picsum.photos/seed/jh-studio-1/1200/900','https://picsum.photos/seed/jh-studio-2/1200/900']);
