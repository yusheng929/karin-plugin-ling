import { Friend, Group, Other } from './types'

export const friend: Friend = {
  Apply: {
    autoAgree: false,
    notify: {
      enable: true,
      allow: false
    }
  },
  enableLike: true,
  likeStart: '已为你点赞{{likeCount}}次',
  likeEnd: '已经给你赞过了',
  timedLike: {
    enable: false,
    targets: []
  }
}
export const group: Group = {
  MemberChange: {
    notice: {
      enable: false,
      disable_list: [
        '454991766',
        '967068507'
      ],
      white_list: [],
      joinText: '欢迎加入本群୯(⁠*⁠´⁠ω⁠`⁠*⁠)୬',
      quitText: '用户『{{Id}}』丢下我们一个人走了'
    },
    joinVerify: []
  },
  Invite: {
    notify: {
      enable: false,
      allow: false
    },
    autoInvite: false
  },
  Apply_list: [],
  AutoQuitGroup: {
    enable: false,
    enableText: '当前群不在白名单,已自动退出',
    disableText: '当前群在黑名单,已自动退出',
    autoQuit: {
      default: {
        enable: true,
        disable_list: [],
        enable_list: []
      },
      114514: {
        enable: false,
        disable_list: [],
        enable_list: []
      }
    }
  },
  Perm: {
    notOwnerText: '少女不是群主,不能执行这项操作~',
    notAdminText: '少女不是管理员,不能执行这项操作~',
    higherUserText: '这个人权限比我高,少女做不到~'
  }
}

export const other: Other = {
  noWork: [],
  word_render: true,
  whoat: false,
  autoUpdate: false
}
