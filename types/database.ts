export type Note = {
  id: number
  type: string
  date: string
  title: string
  sub: string
  body: string[]
  private: boolean
  created_at: string
}

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
  description: string[]
  gallery: string[]
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
