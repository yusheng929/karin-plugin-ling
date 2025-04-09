interface WhoatRedis {
  time: string
  nickname: string
  msg?: string
  userId: string
  img?: string
}

export type Whoat = WhoatRedis[]
