import { AutoQuitEntry } from './config'

export interface Oldcfg {
  friend: {
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
  },
  group: {
    /** 进退群通知 */
    accept: {
      /** 进退群开关 */
      enable: boolean
      /** 白名单 */
      enable_list: string[]
      /** 黑名单 */
      disable_list: string[]
      /** 进群通知文本 */
      jointext: string
      /** 退群通知文本 */
      quittext: string
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
  },
  other: {
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
  },
  AutoQuitGroup: {
    /** 是否启用 */
    enable: boolean
    /** 非白名单退群文本 */
    enabletext: string
    /** 黑名单退群文本 */
    disabletext: string
    /** 退群列表 */
    autoquit: {
      /** 默认配置 */
      default: AutoQuitEntry
      /** 单独Bot配置 */
      [key: string | number]: AutoQuitEntry
    }
  }
}
