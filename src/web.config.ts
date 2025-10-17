import { components, LocalApiResponse } from 'node-karin'
import { cfg } from '@/config'
import _ from 'node-karin/lodash'

const group = await cfg.getGroup()
const friend = await cfg.getFriend()
const other = await cfg.getOther()
interface Config {
  group: [
    {
      'MemberChange:notice:enable': boolean,
      'MemberChange:notice:disable_list': string[],
      'MemberChange:notice:joinText': string,
      'MemberChange:notice:quitText': string,
      'MemberChange:joinVerify': string[],
      'Invite:notify:enable': boolean,
      'Invite:notify:allow': boolean,
      'Invite:autoInvite': boolean,
      Apply_list: string[],
      'AutoQuitGroup:enable': boolean,
      'AutoQuitGroup:enableText': string,
      'AutoQuitGroup:disableText': string
    }
  ],
  friend: [
    {
      'Apply:autoAgree': boolean,
      'Apply:notify:enable': boolean,
      'Apply:notify:allow': boolean,
      closeLike: boolean,
      likeStart: string,
      likeEnd: string
    }
  ],
  other: [
    {
      noWork: string[],
      word_render: boolean,
      whoat: boolean
    }
  ]
}

export default {
  info: {
    name: '铃插件',
    description: '多功能插件',
    icon: {
      name: 'tag',
      color: '#FFB6C1'
    },
    author: [
      {
        name: '瑜笙',
        home: 'https://github.com/yusheng929',
        avatar: 'https://q1.qlogo.cn/g?b=qq&s=0&nk=2624367622'
      }
    ]
  } as LocalApiResponse,
  /** 动态渲染的组件 */
  components: () => [
    components.accordion.create('group', {
      label: '群聊配置',
      children: [
        components.accordion.createItem('a', {
          title: '群聊配置',
          subtitle: '',
          children: [
            components.divider.create('a-d-1', {
              description: '群成员变动配置',
              descPosition: 0
            }),
            components.switch.create('MemberChange:notice:enable', {
              label: '是否启用通知',
              description: '开启后会监听群聊的群成员变动事件并推送',
              defaultSelected: group.MemberChange.notice.enable
            }),
            components.input.group('MemberChange:notice:disable_list', {
              label: '通知黑名单',
              description: '开启后不会监听黑名单群聊',
              data: group.MemberChange.notice.disable_list,
              template:
                components.input.string('a-number-2', {
                  color: 'success',
                  label: '群号',
                  placeholder: '请输入群号',
                  isRequired: true,
                  value: ''
                })
            }),
            components.input.string('MemberChange:notice:joinText', {
              label: '进群通知文本',
              description: '设置后,当有用户加入群聊时,会发送该文本(可使用{{Id}}做为占位符,会自动替换用户id)',
              defaultValue: group.MemberChange.notice.joinText,
              isRequired: false,
              color: 'success'
            }),
            components.input.string('MemberChange:notice:quitText', {
              label: '退群通知文本',
              description: '设置后,当有用户离开群聊时,会发送该文本(可使用{{Id}}做为占位符,会自动替换用户id)',
              defaultValue: group.MemberChange.notice.quitText,
              isRequired: false,
              color: 'success'
            }),
            components.input.group('joinVerify', {
              label: '进群验证',
              description: '开启后当新用户加入该群,会对其进行验证',
              data: group.MemberChange.joinVerify,
              template:
                components.input.string('a-number-4', {
                  color: 'success',
                  label: '群号',
                  placeholder: '请输入群号',
                  isRequired: true,
                  value: ''
                })
            }),
            components.divider.create('a-d-2', {
              description: '邀请Bot入群配置',
              descPosition: 0
            }),
            components.switch.create('Invite:notify:enable', {
              label: '是否启用通知',
              description: '开启后,当有用户邀请Bot加群,会私聊通知主人',
              defaultSelected: group.Invite.notify.enable
            }),
            components.switch.create('Invite:notify:allow', {
              label: '只通知第一个主人',
              description: '开启后,邀请Bot加群通知只会发送至除开console的第一个主人',
              defaultSelected: group.Invite.notify.allow
            }),
            components.switch.create('Invite:autoInvite', {
              label: '自动同意邀请',
              description: '开启后,当有用户邀请Bot加群,会自动同意(主人无视该规则)',
              defaultSelected: group.Invite.autoInvite
            }),
            components.input.group('Apply_list', {
              label: '申请入群通知列表',
              description: '开启后当用户加入该群,会推送消息到该群',
              data: group.Apply_list,
              template:
                components.input.string('a-number-3', {
                  color: 'success',
                  label: '群号',
                  placeholder: '请输入群号',
                  isRequired: true,
                  value: ''
                })
            }),
          ]
        })
      ]
    }),
    components.accordion.create('friend', {
      label: '好友配置',
      children: [
        components.accordion.createItem('b', {
          title: '好友配置',
          subtitle: '',
          children: [
            components.divider.create('b-d-1', {
              description: '好友申请配置',
              descPosition: 0
            }),
            components.switch.create('Apply:notify:enable', {
              label: '是否启用通知',
              description: '开启后,当Bot收到好友申请会发送消息到主人',
              defaultSelected: friend.Apply.notify.enable
            }),
            components.switch.create('Apply:notify:allow', {
              label: '只通知第一个主人',
              description: '开启后,好友申请通知只会通知除开console的第一个主人',
              defaultSelected: friend.Apply.notify.allow
            }),
            components.switch.create('Apply:autoAgree', {
              label: '自动同意好友申请',
              description: '开启后,Bot收到好友申请,会自动同意(主人无视该规则)',
              defaultSelected: friend.Apply.autoAgree
            }),
            components.switch.create('closeLike', {
              label: '关闭点赞',
              description: '开启后,将无法触发功能#赞我',
              defaultSelected: friend.closeLike
            }),
            components.input.string('likeStart', {
              label: '点赞成功发送的消息',
              description: '设置后,当触发点赞回复的消息,注: {{likeCount}} 是次数',
              defaultValue: friend.likeStart,
              isRequired: false,
              color: 'success'
            }),
            components.input.string('likeEnd', {
              label: '已点赞发送的消息',
              description: '设置后,当触发点赞并且已经点赞过所回复的消息',
              defaultValue: friend.likeEnd,
              isRequired: false,
              color: 'success'
            })
          ]
        })
      ]
    }),
    components.accordion.create('other', {
      label: '其他配置',
      children: [
        components.accordion.createItem('c', {
          title: '其他配置',
          subtitle: '',
          children: [
            components.input.group('noWork', {
              label: '上下班配置',
              description: '配置后,列表内的群聊无法触发任何功能',
              data: other.noWork,
              template:
                components.input.string('c-number-1', {
                  color: 'success',
                  label: '群号',
                  placeholder: '请输入群号',
                  isRequired: true,
                  value: ''
                })
            }),
            components.switch.create('word_render', {
              label: '抽幸运字符是否渲染图片',
              description: '关闭后,功能`#抽幸运字符`将会返回文本',
              defaultSelected: other.word_render
            }),
            components.switch.create('whoat', {
              label: '谁艾特我',
              description: '开启后将开始统计艾特消息(注: 开启时，群多可能会对性能产生影响)',
              defaultSelected: other.whoat
            })
          ]
        })
      ]
    })
  ],

  /** 前端点击保存之后调用的方法 */
  save: (config: Config) => {
    const Other = {
      noWork: config.other[0].noWork,
      whoat: config.other[0].whoat,
      word_render: config.other[0].word_render
    }
    const Group = {
      MemberChange: {
        notice: {
          enable: config.group[0]['MemberChange:notice:enable'],
          disable_list: config.group[0]['MemberChange:notice:disable_list'],
          joinText: config.group[0]['MemberChange:notice:joinText'],
          quitText: config.group[0]['MemberChange:notice:quitText']
        },
        joinVerify: config.group[0]['MemberChange:joinVerify']
      },
      Invite: {
        notify: {
          enable: config.group[0]['Invite:notify:enable'],
          allow: config.group[0]['Invite:notify:allow']
        },
        autoInvite: config.group[0]['Invite:autoInvite']
      },
      Apply_list: config.group[0].Apply_list,
      AutoQuitGroup: {
        enable: config.group[0]['AutoQuitGroup:enable'],
        enableText: config.group[0]['AutoQuitGroup:enableText'],
        disableText: config.group[0]['AutoQuitGroup:disableText'],
        autoQuit: {
          default: {
            disable_list: [],
            enable_list: []
          },
          114514: {
            disable_list: [],
            enable_list: []
          }
        }
      }
    }
    const Friend = {
      Apply: {
        autoAgree: config.friend[0]['Apply:autoAgree'],
        notify: {
          enable: config.friend[0]['Apply:notify:enable'],
          allow: config.friend[0]['Apply:notify:allow']
        }
      },
      closeLike: config.friend[0].closeLike,
      likeStart: config.friend[0].likeStart,
      likeEnd: config.friend[0].likeEnd
    }
    if (!_.isEqual(friend, Friend)) cfg.saveJson('friend', Friend)
    if (!_.isEqual(group, Group)) cfg.saveJson('group', Group)
    if (!_.isEqual(other, Other)) cfg.saveJson('other', Other)
    return {
      success: true,
      message: '配置保存成功',
    }
  }
}
