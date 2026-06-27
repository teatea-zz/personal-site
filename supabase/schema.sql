-- ================================================================
-- Jihyun Kim Personal Site — Supabase Schema
-- Supabase SQL Editor에 전체를 붙여넣고 Run 하세요.
-- 이미 테이블이 존재한다면 아래 DROP 주석을 해제하고 실행하세요.
-- ================================================================

-- 테이블이 없으면 새로 생성
create table if not exists notes (
  id          bigint generated always as identity primary key,
  type        text    not null,
  date        text    not null,
  title       text    not null,
  sub         text    not null default '',
  body        jsonb   not null default '[]',
  images      text[]  not null default '{}',
  private     boolean not null default false,
  created_at  timestamptz not null default now()
);

-- 기존 테이블에 images 컬럼이 없으면 추가
do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'notes' and column_name = 'images'
  ) then
    alter table notes add column images text[] not null default '{}';
  end if;
end $$;

create table if not exists works (
  id          bigint generated always as identity primary key,
  title       text    not null,
  year        text    not null,
  role        text    not null,
  field       text    not null,
  tools       text    not null,
  tag         text    not null,
  img         text    not null,
  description jsonb   not null default '[]',
  gallery     text[]  not null default '{}',
  created_at  timestamptz not null default now()
);

-- body/description 컬럼을 text[] → jsonb 로 변경 (이미 jsonb면 무시됨)
do $$ begin
  if (select data_type from information_schema.columns
      where table_name='notes' and column_name='body') != 'jsonb' then
    alter table notes alter column body drop default;
    alter table notes alter column body type jsonb using '[]'::jsonb;
    alter table notes alter column body set default '[]'::jsonb;
  end if;
end $$;

do $$ begin
  if (select data_type from information_schema.columns
      where table_name='works' and column_name='description') != 'jsonb' then
    alter table works alter column description drop default;
    alter table works alter column description type jsonb using '[]'::jsonb;
    alter table works alter column description set default '[]'::jsonb;
  end if;
end $$;

-- 기존 데이터 초기화 후 시드 재삽입
delete from notes;
delete from works;

-- Enable RLS
alter table notes enable row level security;
alter table works enable row level security;

-- Public read
drop policy if exists "public read notes" on notes;
drop policy if exists "public read works" on works;
create policy "public read notes" on notes for select using (true);
create policy "public read works" on works for select using (true);

-- Authenticated write (admin only)
drop policy if exists "auth insert notes" on notes;
drop policy if exists "auth update notes" on notes;
drop policy if exists "auth delete notes" on notes;
drop policy if exists "auth insert works" on works;
drop policy if exists "auth update works" on works;
drop policy if exists "auth delete works" on works;
create policy "auth insert notes" on notes for insert with check (auth.role() = 'authenticated');
create policy "auth update notes" on notes for update using (auth.role() = 'authenticated');
create policy "auth delete notes" on notes for delete using (auth.role() = 'authenticated');

create policy "auth insert works" on works for insert with check (auth.role() = 'authenticated');
create policy "auth update works" on works for update using (auth.role() = 'authenticated');
create policy "auth delete works" on works for delete using (auth.role() = 'authenticated');

-- ----------------------------------------------------------------
-- Storage: Works images
-- ----------------------------------------------------------------
insert into storage.buckets (id, name, public)
  values ('works', 'works', true)
  on conflict (id) do nothing;

drop policy if exists "public read works images" on storage.objects;
drop policy if exists "auth upload works images" on storage.objects;
drop policy if exists "auth delete works images" on storage.objects;

create policy "public read works images"
  on storage.objects for select using (bucket_id = 'works');

create policy "auth upload works images"
  on storage.objects for insert
  with check (bucket_id = 'works' and auth.role() = 'authenticated');

create policy "auth delete works images"
  on storage.objects for delete
  using (bucket_id = 'works' and auth.role() = 'authenticated');

-- ----------------------------------------------------------------
-- Storage: Notes images
-- ----------------------------------------------------------------
insert into storage.buckets (id, name, public)
  values ('notes', 'notes', true)
  on conflict (id) do nothing;

drop policy if exists "public read notes images" on storage.objects;
drop policy if exists "auth upload notes images" on storage.objects;
drop policy if exists "auth delete notes images" on storage.objects;

create policy "public read notes images"
  on storage.objects for select using (bucket_id = 'notes');

create policy "auth upload notes images"
  on storage.objects for insert
  with check (bucket_id = 'notes' and auth.role() = 'authenticated');

create policy "auth delete notes images"
  on storage.objects for delete
  using (bucket_id = 'notes' and auth.role() = 'authenticated');

-- ================================================================
-- Seed: Notes
-- body = Block[] — { "type": "text", "content": "..." }
--                  { "type": "image", "url": "...", "alt": "..." }
-- ================================================================
insert into notes (type, date, title, sub, body, private) values

('노트', '2026.06.12', '스위스 그리드에 관한 노트', '뮐러-브로크만, 다시 읽기',
  '[
    {"type":"text","content":"그리드는 감옥이 아니라, 한 번 내려두면 매 페이지마다 다시 고민하지 않아도 되는 결정의 묶음이다. 뮐러-브로크만의 핵심은 선이 아니라, 그 선으로 매번 되돌아오는 규율이었다."},
    {"type":"text","content":"화면에서는 8단 그리드로 자꾸 돌아오게 된다. 휴대폰에서도 살아남고, 4단으로 깔끔하게 접히며, 한 장의 이미지가 전체 폭을 원할 때 일부러 규칙을 깰 여백까지 남는다."}
  ]'::jsonb,
  false),

('노트', '2026.05.30', 'OKLCH 컬러 시스템, 실전', '지각 기반 팔레트 설계',
  '[
    {"type":"text","content":"HEX는 편리하지만 지각적으로는 정직하지 않다. OKLCH는 계속 어림짐작하던 내 머릿속 한 조각을 바로잡아 준다."},
    {"type":"text","content":"명도와 채도를 고정하고 색상만 걷는다. 그러면 액센트가 우연이 아니라 하나의 가족이 되고, 다크 모드가 더 이상 탁해지지 않는다."}
  ]'::jsonb,
  false),

('습작', '2026.05.24', '그리드 변주 실험', '8단 그리드를 비트는 연습',
  '[
    {"type":"text","content":"8단 그리드를 기본으로 두고, 한 칸씩 어긋내거나 합치며 리듬을 만드는 연습. 규칙이 있어야 규칙을 깨는 일이 의미를 가진다."},
    {"type":"text","content":"개인적인 실험이라 결과보다 과정을 남긴다."}
  ]'::jsonb,
  false),

('회고', '2026.05.18', '서브그리드: 현장 기록', '작업 회고',
  '[{"type":"text","content":"이 사이트의 갤러리를 서브그리드로 다시 만들며 남긴 기록. 브라우저 호환성 문제로 시간이 걸렸지만, 결국 규칙 안에서 유연함을 찾는 과정이었다."}]'::jsonb,
  false),

('노트', '2026.04.27', '비넬리 카논, 다시 읽기', '절제와 규율에 관하여',
  '[
    {"type":"text","content":"비넬리의 카논은 간직한 것보다 버린 것이 더 많은 사람의 글처럼 읽힌다. 그 절제 자체가 내용이다."},
    {"type":"text","content":"취향이란 결국 하지 않기로 정한 것들의 목록이다."}
  ]'::jsonb,
  false),

('로그', '2026.04.09', '데일리 로그 — 14주차', '습작과 작은 성취',
  '[
    {"type":"text","content":"아카이브 스키마를 끝냈고, 두 챕터를 읽었고, OKLCH 팔레트를 이 사이트에 적용했다."},
    {"type":"text","content":"작은 성취도 성취다."}
  ]'::jsonb,
  false);

-- ================================================================
-- Seed: Works
-- description = Block[]
-- field 값은 영문 사용: Web | Branding | Editorial
-- ================================================================
insert into works (title, year, role, field, tools, tag, img, description, gallery) values

('아카이브 시스템', '2026', '디자인 / 개발', 'Web', 'Figma · React', 'WEB',
  'https://picsum.photos/seed/jh-archive-sys/1200/700',
  '[
    {"type":"text","content":"개인 아카이브를 위한 디자인 시스템이자 웹 애플리케이션. 완성작과 습작, 노트와 데일리 로그를 하나의 인덱스로 묶었다."},
    {"type":"text","content":"OKLCH 기반 팔레트와 8단 그리드를 토대로 다크 테마를 설계했고, 슬라이드업 오버레이로 모든 하위 화면을 한 페이지 안에서 다룬다."}
  ]'::jsonb,
  array['https://picsum.photos/seed/jh-archive-1/1200/900','https://picsum.photos/seed/jh-archive-2/1200/900']),

('필드 레코더', '2025', '아이덴티티', 'Branding', 'Glyphs · InDesign', 'BRAND',
  'https://picsum.photos/seed/jh-field-rec/1200/700',
  '[
    {"type":"text","content":"현장 녹음을 기록하는 작은 레이블을 위한 비주얼 아이덴티티. 모노스페이스 로고타입과 빈티지 필름 톤의 사진 언어로 아날로그적 질감을 끌어냈다."},
    {"type":"text","content":"명함부터 카세트 인레이까지, 같은 그리드와 색 가족 안에서 변주되도록 시스템을 구성했다."}
  ]'::jsonb,
  array['https://picsum.photos/seed/jh-field-1/1200/900','https://picsum.photos/seed/jh-field-2/1200/900']),

('타입 스페시멘 03', '2025', '에디토리얼', 'Editorial', 'InDesign', 'PRINT',
  'https://picsum.photos/seed/jh-type-spec/1200/700',
  '[
    {"type":"text","content":"한글 본문 서체를 위한 견본 책자. 행폭과 행간, 크기의 단계를 실제 긴 글 안에서 검증하며 조판 규칙을 정리했다."},
    {"type":"text","content":"장식을 덜어내고 본문 자체가 주인공이 되도록, 여백과 리듬에 대부분의 시간을 썼다."}
  ]'::jsonb,
  array['https://picsum.photos/seed/jh-type-1/1200/900','https://picsum.photos/seed/jh-type-2/1200/900']),

('스튜디오 인덱스', '2024', '웹', 'Web', 'HTML · CSS', 'WEB',
  'https://picsum.photos/seed/jh-studio-idx/1200/700',
  '[
    {"type":"text","content":"작업을 시간순으로 늘어놓는 가장 단순한 형태의 포트폴리오. 한 페이지, 한 인덱스, 군더더기 없는 항법."},
    {"type":"text","content":"이후 아카이브 시스템으로 발전하는 출발점이 된 프로젝트다."}
  ]'::jsonb,
  array['https://picsum.photos/seed/jh-studio-1/1200/900','https://picsum.photos/seed/jh-studio-2/1200/900']);
