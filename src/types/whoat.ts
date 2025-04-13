interface WhoatRedis {
  time: Date
  nickname: string
  msg?: string
  userId: string
  file?: string
  reply?: string
}

export type Whoat = WhoatRedis[]
