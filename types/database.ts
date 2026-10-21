export type TextBlock  = { type: 'text';  content: string }
export type ImageBlock = { type: 'image'; url: string; alt?: string }
export type Block = TextBlock | ImageBlock

export type Note = {
  id: number
  type: string
  date: string
  title: string
  sub: string
  body: Block[]
  images: string[]
  private: boolean
  /** 상세 레이아웃 — text: 글 / image-1: 이미지 1단(이미지 위, 글 아래) / image-2: 이미지 2단(작업물 상세와 동일). 없으면 text */
  layout?: NoteLayout
  created_at: string
}

export type NoteLayout = 'text' | 'image-1' | 'image-2'

export type NoteInsert = Omit<Note, 'id' | 'created_at'>
export type NoteUpdate = Partial<NoteInsert>

export type Work = {
  id: number
  title: string
  year: string
  role: string
  field: string
  tools: string
  tag: string
  img: string
  description: Block[]
  gallery: string[]
  /** 갤러리 단 수 1~3 (모바일은 최대 2). 컬럼 추가 전 데이터 · 시드는 없을 수 있어 1로 취급 */
  gallery_cols?: number
  created_at: string
}

export type WorkInsert = Omit<Work, 'id' | 'created_at'>
export type WorkUpdate = Partial<WorkInsert>

export type Database = {
  public: {
    Tables: {
      notes: {
        Row: Note
        Insert: NoteInsert
        Update: NoteUpdate
      }
      works: {
        Row: Work
        Insert: WorkInsert
        Update: WorkUpdate
      }
    }
  }
}
