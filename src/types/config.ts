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

export interface Friend {
  /** 通知 */
  notify: {
    /** 是否启用 */
    enable: boolean
    /** 是否只通知第一个主人 */
    allow: boolean
  }
  /** 自动同意好友 */
  enable: boolean
  /** 关闭点赞 */
  closeLike: boolean
  /** 点赞文本 */
  likeStart: string
  /** 已点赞的文本 */
  likeEnd: string
}

export interface Group {
  /** 进退群通知 */
  accept: {
    /** 进退群开关 */
    enable: boolean
    /** 白名单 */
    enable_list: string[]
    /** 黑名单 */
    disable_list: string[]
  }
  /** 通知 */
  notify: {
    /** 是否启用 */
    group_enable: boolean
    /** 是否只通知第一个主人 */
    allow: boolean
  }
  /** 自动同意邀请Bot入新群 */
  invite: boolean
  /** 申请加群通知列表 */
  apply_list: string[]
  /** 进群验证列表 */
  joinGroup: string[]
}

/** `other.yaml` 文件的类型定义 */
export interface Other {
  /** 抽幸运字符成功后是否渲染图片 */
  word_render: boolean
  /** 上下班 */
  noWork: string[]
  /** 谁艾特我 */
  whoat: boolean
  /** 消息前缀 */
  msg_prefix: ''

  /** 消息后缀 */
  msg_suffix: ''

  /** 联系主人 */
  contactMaster: {
    /** 是否启用 */
    enable: true
    /** 为true时，只发送第一个主人 */
    allow: false
    /** 联系主人的cd */
    cd: number
  }
}

interface AutoQuitEntry {
  /** 黑名单列表 */
  disable_list: string[]
  /** 白名单列表 */
  enable_list: string[]
}

export interface AutoQuitGroup {
  /** 是否启用 */
  enable: boolean
  /** 退群列表 */
  autoquit: {
    /** 默认配置 */
    default: AutoQuitEntry
    /** 单独Bot配置 */
    [key: string | number]: AutoQuitEntry
  }
}
