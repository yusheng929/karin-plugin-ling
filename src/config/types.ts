export interface Friend {
  /** 好友申请 */
  Apply: {
    /** 自动同意好友申请 */
    autoAgree: boolean
    /** 好友申请通知 */
    notify: {
      /** 是否启用 */
      enable: boolean
      /** 是否只通知第一个主人 */
      allow: boolean
    }
  }
  /** 关闭点赞 */
  closeLike: boolean
  /** 点赞文本 */
  likeStart: string
  /** 已点赞的文本 */
  likeEnd: string
}

export interface Group {
  /** 群成员变动 */
  MemberChange: {
    /** 进退群通知 */
    notice: {
      /** 是否开启通知 */
      enable: boolean
      /** 通知黑名单 */
      disable_list: string[]
      /** 进群通知文本 */
      joinText: string
      /** 退群通知文本 */
      quitText: string
    }
    /** 进群验证列表 */
    joinVerify: string[]
  }
  /** 邀请bot加群 */
  Invite: {
    /** 邀请入群通知 */
    notify: {
      /** 是否启用 */
      enable: boolean
      /** 是否只通知第一个主人 */
      allow: boolean
    }
    /** 自动同意邀请Bot入新群 */
    autoInvite: boolean
  }
  /** 申请加群通知列表 */
  Apply_list: string[]

  /** 自动退群配置 */
  AutoQuitGroup: {
    /** 是否启用 */
    enable: boolean
    /** 非白名单退群文本 */
    enableText: string
    /** 黑名单退群文本 */
    disableText: string
    /** 退群列表 */
    autoQuit: {
      /** 默认配置 */
      default: AutoQuitEntry
      /** 单独Bot配置 */
      [key: string]: AutoQuitEntry
    }
  }
}

/** `other.yaml` 文件的类型定义 */
export interface Other {
  /** 抽幸运字符成功后是否渲染图片 */
  word_render: boolean
  /** 上下班 */
  noWork: string[]
  /** 谁艾特我 */
  whoat: boolean
  /** 自动更新 */
  autoUpdate: boolean
}

export interface AutoQuitEntry {
  /** 黑名单列表 */
  disable_list: string[]
  /** 白名单列表 */
  enable_list: string[]
}
