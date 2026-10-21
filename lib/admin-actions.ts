// 어드민 · 메인 사이트 공용 콘텐츠 관리 로직 (로그인 / 저장 / 삭제 / 재조회)
// 실제 권한 검사는 Supabase RLS가 담당 — 로그인 세션 없이는 쓰기 요청이 거부됨
import { supabaseBrowser } from '@/lib/supabase-browser'
import type { Note, Work } from '@/types/database'

const ADMIN_ID = process.env.NEXT_PUBLIC_ADMIN_ID ?? 'admin'

export type NoteInput = Omit<Note, 'id' | 'created_at'>
export type WorkInput = Omit<Work, 'id' | 'created_at'>

/** 아이디 · 비밀번호 로그인. 실패 시 에러 문구, 성공 시 null */
export async function signInAdmin(id: string, password: string): Promise<string | null> {
  const fail = '아이디 또는 비밀번호가 올바르지 않습니다'
  if (id !== ADMIN_ID) return fail
  const { error } = await supabaseBrowser.auth.signInWithPassword({
    email: `${ADMIN_ID}@admin.local`,
    password,
  })
  return error ? fail : null
}

export async function signOutAdmin() {
  await supabaseBrowser.auth.signOut()
}

export async function fetchAllNotes(): Promise<Note[] | null> {
  const { data } = await supabaseBrowser.from('notes').select('*').order('date', { ascending: false })
  return data
}

export async function fetchAllWorks(): Promise<Work[] | null> {
  const { data } = await supabaseBrowser.from('works').select('*').order('year', { ascending: false }).order('created_at', { ascending: false })
  return data
}

/** id가 있으면 수정, 없으면 새로 추가. 실패 시 throw (호출한 쪽에서 알림) */
export async function saveNote(data: NoteInput, id?: number) {
  const q = supabaseBrowser.from('notes') as any // eslint-disable-line @typescript-eslint/no-explicit-any
  const { error } = id != null ? await q.update(data).eq('id', id) : await q.insert(data)
  if (error) throw new Error(error.message)
}

export async function saveWork(data: WorkInput, id?: number) {
  const q = supabaseBrowser.from('works') as any // eslint-disable-line @typescript-eslint/no-explicit-any
  const { error } = id != null ? await q.update(data).eq('id', id) : await q.insert(data)
  if (error) throw new Error(error.message)
}

/** 노트 삭제 — 본문 이미지 · images 컬럼 파일도 스토리지에서 함께 삭제 */
export async function deleteNote(note: Note) {
  const bodyUrls = (note.body ?? []).filter((b: any) => b.type === 'image').map((b: any) => b.url) // eslint-disable-line @typescript-eslint/no-explicit-any
  const imageUrls = [...bodyUrls, ...(note.images ?? [])]
  const paths = imageUrls.map((url: string) => url.split('/notes/')[1]).filter(Boolean)
  if (paths.length) await supabaseBrowser.storage.from('notes').remove(paths)
  await supabaseBrowser.from('notes').delete().eq('id', note.id)
}

/** 작업 삭제 — 대표 이미지 · 갤러리 파일도 스토리지에서 함께 삭제 */
export async function deleteWork(work: Work) {
  const urls = [work.img, ...(work.gallery ?? [])].filter(Boolean)
  const paths = urls.map((url: string) => url.split('/works/')[1]).filter(Boolean)
  if (paths.length) await supabaseBrowser.storage.from('works').remove(paths)
  await supabaseBrowser.from('works').delete().eq('id', work.id)
}
