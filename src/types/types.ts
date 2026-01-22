interface WhoAtItem {
  time: number,
  messageId: string
}
export type WhoAtType = WhoAtItem[]

export interface RequestResult {
  /** 请求类型 */
  type: 'groupApply' | 'friendApply' | 'groupInvite'
  /** 请求Id */
  flag: string
}