import { components, LocalApiResponse } from 'node-karin'
import { group } from './utils/config'

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
        components.accordion.createItem('accept', {
          title: '进退群通知配置',
          subtitle: '优先级: 白名单配置 > 黑名单配置',
          children: [
            components.switch.create('enable', {
              label: '启用进退群通知',
              size: 'sm',
              color: 'primary',
              defaultSelected: group().accept.enable
            }),
            components.input.group('enable_list', {
              label: '白名单',
              data: group().accept.enable_list,
              template:
                components.input.string('input-number', {
                  color: 'success',
                  label: '群号',
                  placeholder: '请输入群号',
                  isRequired: true,
                  value: ''
                })
            }),
            components.input.group('disable_list', {
              label: '黑名单',
              data: group().accept.disable_list,
              template:
                components.input.string('input-number', {
                  color: 'success',
                  label: '群号',
                  placeholder: '请输入群号',
                  isRequired: true,
                  value: ''
                })
            })
          ]
        }),
        components.accordion.createItem('notify', {
          title: '群聊通知配置',
          subtitle: '',
          children: [
            components.switch.create('group_enable', {
              label: '启用邀请Bot加群通知',
              size: 'sm',
              color: 'primary',
              defaultSelected: group().notify.group_enable
            }),
            components.switch.create('allow', {
              label: '是否只通知第一个主人',
              size: 'sm',
              color: 'primary',
              defaultSelected: group().notify.allow
            })
          ]
        })
      ]
    })
  ],

  /** 前端点击保存之后调用的方法 */
  save: (config: any) => {
    console.log('config:', JSON.stringify(config, null, 2))
  }
}
