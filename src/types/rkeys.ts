export interface RkeysData {
  type: 'group' | 'private'
  rkey: string
  created_at: number
  ttl: number
}

export type Rkeys = {
  rkeys: RkeysData[]
}
