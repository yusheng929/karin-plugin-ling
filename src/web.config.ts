import { components, LocalApiResponse } from 'node-karin'
import { cof, friend, group, other, writeYaml } from '@/utils/config'
import _ from 'lodash'

interface Config {
  group: [
    {
      'accept:enable': boolean,
      'accept:enable_list': string[],
      'accept:disable_list': string[],
      'accept:jointext': string,
      'accept:quittext': string,
      'notify:group_enable': boolean,
      'notify:allow': boolean,
      invite: boolean,
      apply_list: string[],
      joinGroup: string[]
    }
  ],
  friend: [
    {
      'notify:enable': boolean,
      'notify:allow': boolean,
      enable: boolean,
      closeLike: boolean,
      likeStart: string,
      likeEnd: string
    }
  ],
  other: [
    {
      noWork: string[],
      word_render: boolean,
      whoat: boolean,
      msg_prefix: string,
      msg_suffix: string,
      'contactMaster:enable': boolean,
      'contactMaster:allow': boolean,
      'contactMaster:cd': number
    }
  ],
  cof: [
    {
      enable: boolean,
      cron: string,
      msg: string[],
      group: string[],
      friend: string[]
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
              description: '进退群通知配置',
              descPosition: 0
            }),
            components.switch.create('accept:enable', {
              label: '进退群通知',
              description: '开启后会监听群聊的进退群事件并推送',
              defaultSelected: group().accept.enable
            }),
            components.input.group('accept:enable_list', {
              label: '进群通知白名单',
              description: '开启后只会监听白名单群聊,白名单 > 黑名单',
              data: group().accept.enable_list,
              template:
                components.input.string('a-number-1', {
                  color: 'success',
                  label: '群号',
                  placeholder: '请输入群号',
                  isRequired: true,
                  value: ''
                })
            }),
            components.input.group('accept:disable_list', {
              label: '进群通知黑名单',
              description: '开启后不会监听黑名单群聊,白名单 > 黑名单',
              data: group().accept.disable_list,
              template:
                components.input.string('a-number-2', {
                  color: 'success',
                  label: '群号',
                  placeholder: '请输入群号',
                  isRequired: true,
                  value: ''
                })
            }),
            components.input.string('accept:jointext', {
              label: '进群通知文本',
              description: '设置后,当有用户加入群聊时,会发送该文本(可使用{{Id}}做为占位符,会自动替换用户id)',
              defaultValue: group().accept.jointext,
              isRequired: false,
              color: 'success'
            }),
            components.input.string('accept:quittext', {
              label: '退群通知文本',
              description: '设置后,当有用户离开群聊时,会发送该文本(可使用{{Id}}做为占位符,会自动替换用户id)',
              defaultValue: group().accept.quittext,
              isRequired: false,
              color: 'success'
            }),
            components.divider.create('a-d-2', {
              description: '群聊通知配置',
              descPosition: 0
            }),
            components.switch.create('notify:group_enable', {
              label: '邀请Bot加群通知',
              description: '开启后,当有用户邀请Bot加群,会私聊通知主人',
              defaultSelected: group().notify.group_enable
            }),
            components.switch.create('notify:allow', {
              label: '只通知第一个主人',
              description: '开启后,所有通知主人的消息将只会通知除开console的第一个主人',
              defaultSelected: group().notify.group_enable
            }),
            components.switch.create('invite', {
              label: '自动同意邀请加群',
              description: '开启后,当有用户邀请Bot加群,会自动同意(主人无视该规则)',
              defaultSelected: group().notify.allow
            }),
            components.input.group('apply_list', {
              label: '加群通知列表',
              description: '开启后当用户加入该群,会推送消息到该群',
              data: group().apply_list,
              template:
                components.input.string('a-number-3', {
                  color: 'success',
                  label: '群号',
                  placeholder: '请输入群号',
                  isRequired: true,
                  value: ''
                })
            }),
            components.input.group('joinGroup', {
              label: '加群验证',
              description: '开启后当新用户加入该群,会对其进行验证',
              data: group().joinGroup,
              template:
                components.input.string('a-number-4', {
                  color: 'success',
                  label: '群号',
                  placeholder: '请输入群号',
                  isRequired: true,
                  value: ''
                })
            })
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
            components.switch.create('notify:enable', {
              label: '通知',
              description: '开启后,当Bot收到好友申请会发送消息到主人',
              defaultSelected: friend().notify.enable
            }),
            components.switch.create('notify:allow', {
              label: '只通知第一个主人',
              description: '开启后,所有通知主人的消息将只会通知除开console的第一个主人',
              defaultSelected: friend().notify.allow
            }),
            components.switch.create('enable', {
              label: '自动同意好友申请',
              description: '开启后,Bot收到好友申请,会自动同意(主人无视该规则)',
              defaultSelected: friend().enable
            }),
            components.switch.create('closeLike', {
              label: '关闭点赞',
              description: '开启后,将无法触发功能#赞我',
              defaultSelected: friend().closeLike
            }),
            components.input.string('likeStart', {
              label: '点赞成功发送的消息',
              description: '设置后,当触发点赞回复的消息,注: {{likeCount}} 是次数',
              defaultValue: friend().likeStart,
              isRequired: false,
              color: 'success'
            }),
            components.input.string('likeEnd', {
              label: '已点赞发送的消息',
              description: '设置后,当触发点赞并且已经点赞过所回复的消息',
              defaultValue: friend().likeEnd,
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
              data: other().noWork,
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
              label: '渲染图片',
              description: '关闭后,功能`#抽幸运字符`将会返回文本',
              defaultSelected: other().word_render
            }),
            components.switch.create('whoat', {
              label: '谁艾特我',
              description: '开启后将开始统计艾特消息(注: 开启时，群多可能会对性能产生影响)',
              defaultSelected: other().whoat
            }),
            components.input.string('msg_prefix', {
              label: '消息前缀',
              description: '设置后,Bot所发送的文本消息的最前面会添加所设置的字符(为空则不添加)',
              defaultValue: other().msg_prefix,
              isRequired: false,
              color: 'success'
            }),
            components.input.string('msg_suffix', {
              label: '消息后缀',
              description: '设置后,Bot所发送的文本消息的最后面会添加所设置的字符(为空则不添加)',
              defaultValue: other().msg_suffix,
              isRequired: false,
              color: 'success'
            }),
            components.switch.create('contactMaster:enable', {
              label: '启用联系主人',
              description: '开启后可在群聊联系主人',
              defaultSelected: other().contactMaster.enable
            }),
            components.switch.create('contactMaster:allow', {
              label: '只发送第一个主人',
              description: '开启后,联系主人的消息只会发送出console的第一个主人',
              defaultSelected: other().contactMaster.allow
            }),
            components.input.number('contactMaster:cd', {
              color: 'success',
              label: '联系主人冷却',
              placeholder: '请输入cd 0 ≤ cd ≤ 86400',
              description: '设置后,联系主人功能将会有冷却时间,单位为秒(0表示不限制)',
              defaultValue: String(other().contactMaster.cd),
              isRequired: true,
              rules: [
                {
                  min: 0,
                  max: 86400,
                  error: '请输入0 ≤ cd ≤ 86400 的数字'
                }
              ]
            })
          ]
        })
      ]
    }),
    components.accordion.create('cof', {
      label: '续火配置',
      children: [
        components.accordion.createItem('d', {
          title: '续火配置',
          subtitle: '',
          children: [
            components.switch.create('enable', {
              label: '启用续火',
              description: '开启后会定时向指定群聊好友发送自定义消息',
              defaultSelected: cof().enable
            }),
            components.input.string('cron', {
              label: '正则表达式',
              description: '设置后,会按照所设置的时间发送消息',
              defaultValue: cof().cron,
              color: 'success'
            }),
            components.input.group('msg', {
              label: '续火文本',
              description: '配置后,将发送列表的文本(当有多条时,会随机发送任意一条)',
              data: cof().msg,
              template:
                components.input.string('d-string-1', {
                  color: 'success',
                  label: '续火文本',
                  placeholder: '请输入文本',
                  isRequired: true,
                  value: ''
                })
            }),
            components.input.group('group', {
              label: '续火群聊',
              description: '配置后,只向列表中的群聊发送消息',
              data: cof().group,
              template:
                components.input.string('d-string-2', {
                  color: 'success',
                  label: '续火群聊',
                  placeholder: '请输入群号',
                  isRequired: true,
                  value: '',
                  rules: [
                    {
                      regex: /.+:.+/,
                      error: '请使用`BotId:群聊Id`的格式'
                    }
                  ]
                })
            }),
            components.input.group('friend', {
              label: '续火好友',
              description: '配置后,只向列表中的好友发送消息',
              data: cof().friend,
              template:
                components.input.string('d-string-3', {
                  color: 'success',
                  label: '续火好友',
                  placeholder: '请输入好友Id',
                  isRequired: true,
                  rules: [
                    {
                      regex: /.+:.+/,
                      error: '请使用`BotId:好友Id`的格式'
                    }
                  ],
                  value: ''
                })
            })
          ]
        })
      ]
    })
  ],

  /** 前端点击保存之后调用的方法 */
  save: (cfg: Config) => {
    const Other = {
      noWork: cfg.other[0].noWork,
      whoat: cfg.other[0].whoat,
      word_render: cfg.other[0].word_render,
      msg_prefix: cfg.other[0].msg_prefix,
      msg_suffix: cfg.other[0].msg_suffix,
      contactMaster: {
        enable: cfg.other[0]['contactMaster:enable'],
        allow: cfg.other[0]['contactMaster:allow'],
        cd: Number(cfg.other[0]['contactMaster:cd'])
      }
    }
    const Group = {
      accept: {
        enable: cfg.group[0]['accept:enable'],
        enable_list: cfg.group[0]['accept:enable_list'],
        disable_list: cfg.group[0]['accept:disable_list'],
        jointext: cfg.group[0]['accept:jointext'],
        quittext: cfg.group[0]['accept:quittext']
      },
      notify: {
        group_enable: cfg.group[0]['notify:group_enable'],
        allow: cfg.group[0]['notify:allow']
      },
      invite: cfg.group[0].invite,
      apply_list: cfg.group[0].apply_list,
      joinGroup: cfg.group[0].joinGroup
    }
    const Friend = {
      notify: {
        enable: cfg.friend[0]['notify:enable'],
        allow: cfg.friend[0]['notify:allow']
      },
      enable: cfg.friend[0].enable,
      closeLike: cfg.friend[0].closeLike,
      likeStart: cfg.friend[0].likeStart,
      likeEnd: cfg.friend[0].likeEnd
    }
    const Cof = {
      enable: cfg.cof[0].enable,
      cron: cfg.cof[0].cron,
      msg: cfg.cof[0].msg,
      group: cfg.cof[0].group,
      friend: cfg.cof[0].friend
    }
    if (!_.isEqual(cof(), Cof)) writeYaml('cof', Cof)
    if (!_.isEqual(friend(), Friend)) writeYaml('friend', Friend)
    if (!_.isEqual(group(), Group)) writeYaml('group', Group)
    if (!_.isEqual(other(), Other)) writeYaml('other', Other)
    return {
      success: true,
      message: '配置保存成功',
    }
  }
}
