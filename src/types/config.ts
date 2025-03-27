export interface Cof {
  /** 是否启用 */
  enable: boolean
  /** cron表达式 */
  cron: string
  /** 续火文本 */
  msg: string[]
  /** 续火的群列表 */
  group: string[]
  /** 续火的好友列表 */
  friend: string[]
}

/** `other.yaml` 文件的类型定义 */
export interface Other {
  /** 进退群通知 */
  accept: {
    /** 进退群通知开关 */
    enable: boolean
    /** 白名单 */
    enable_list: string[]
    /** 黑名单 */
    disable_list: string[]
  }
  /** 开启入群验证的群聊列表 */
  joinGroup: string[]
  /** 好友相关配置 */
  friend: {
    /** 通知开关 */
    notify: boolean
    /** 自动同意好友申请 */
    enable: boolean
    /** 关闭点赞 */
    closeLike: boolean
    /** 点赞文本 */
    likeStart: string
    /** 已点赞的文本 */
    likeEnd: string
  }
  /** 群聊相关配置 */
  group: {
    /** 通知开关 */
    notify: boolean
    /** 自动同意邀请Bot入新群 */
    invite: boolean
    /** 申请加群通知列表 */
    list: string[]
  }
  /** 给所有主人发送通知 */
  notify: boolean
  /** 抽幸运字符成功后是否渲染图片 */
  word_render: boolean
}
