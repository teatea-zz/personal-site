-- ================================================================
-- 비공개 노트 RLS 정책 업데이트
-- Supabase SQL Editor에서 이 파일만 실행하세요.
-- (schema.sql 전체를 다시 돌리면 안 됩니다 — 시드 리셋으로 데이터가 날아가요!)
-- ================================================================

-- 기존 "모두 읽기" 정책 제거 후, 비공개는 인증된 사용자만 읽도록 교체
drop policy if exists "public read notes" on notes;
drop policy if exists "read notes public or authenticated" on notes;

create policy "read notes public or authenticated" on notes
  for select using (private = false or auth.role() = 'authenticated');
