/** `gorup.yaml` 文件的类型定义 */
export type Gorup = Record<string, {
  /** 是否启用 */
  enable: boolean
  /** 拦截规则0为模糊拦截1为精准拦截 */
  rule: number
  /** 违禁词 */
  words: string[]
  /** 是否禁言触发违禁后撤回并禁言 */
  ban: boolean
  /** 禁言时长，默认10分钟 */
  time: number
}>

/** `cof.yaml` 文件的类型定义 */
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
    /** 黑名单 */
    blackGroup: string[]
  }
  /** 开启入群验证的群聊列表 */
  joinGroup: string[]
  /** 好友相关配置 */
  friend: {
    /** 自动通过好友请求 */
    accept: boolean
    /** 给所有主人发送通知 */
    notify: boolean
    /** 关闭点赞 */
    closeLike: boolean
  }
  /** 上下班配置 下班的群聊列表 配置后该群将无法触发任何功能 */
  noWork: string[]
  /** 群聊相关配置 */
  group: {
    /** 自动同意邀请Bot入新群 */
    invite: boolean
    /** 自动通过群聊的入群申请 */
    accept: boolean
    /** 给所有主人发送通知 */
    notify: boolean
    /** 单独群设置 */
    alone: {
      /** 群号 */
      groupId: string
      /** 自动通过群聊的入群申请 */
      accept: boolean
      /** 给所有主人发送通知 */
      notify: boolean
    }[]
  }
}

/** `state.yaml` 文件的类型定义 */
export interface State {
  /** 是否设置为默认状态 */
  default: boolean
  /** 测试访问的网址列表配置 */
  psTestSites: {
    /** 显示设置 true-显示 false-不显示 pro-只有pro显示 */
    show: boolean | 'pro'
    /** 测试站点列表 */
    list: Array<{
      /** 显示名称 */
      name: string
      /** 要访问的网址 */
      url: string
    }>
    /** 测试超时时间 */
    timeout: number
  }
  /** 监控任务开关 */
  statusTask: boolean
  /** 内存异常处理开关 */
  statusPowerShellStart: boolean
  /** 背景图片api */
  backdrop: string | false
  /** 默认背景图片设置 */
  backdropDefault: 'random' | string
  /** 是否关闭node信息圈圈 */
  closedNodeInfo: boolean
  /** 是否关闭图表 */
  closedChart: boolean
  /** FastFetch显示设置 */
  showFastFetch: boolean | 'pro' | 'default'
  /** Bot昵称颜色 */
  botNameColor: string
  /** Bot昵称渐变色 */
  botNameColorGradient: string | 'none' | false
  /** 进度条严重状态颜色 */
  highColor: string
  /** 进度条警告状态颜色 */
  mediumColor: string
  /** 进度条正常状态颜色 */
  lowColor: string
}
