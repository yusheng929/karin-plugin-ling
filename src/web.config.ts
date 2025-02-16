import { components } from 'node-karin'

export default {
  info: {},
  /** 动态渲染的组件 */
  components: () => [
    // 邮件输入框
    components.input.email('email'),
    // 分隔线
    components.divider.create('divider1'),
    // 数字输入框
    components.input.number('number'),
    // 分隔线
    components.divider.create('divider2'),
    // 单选框组
    components.radio.group('radio-group', {
      label: '这是一个单选框',
      orientation: 'horizontal',
      // 单选框列表
      radio: [
        components.radio.create('radio-1', {
          label: '选项1',
          value: 'option1'
        }),
        components.radio.create('radio-2', {
          label: '选项2',
          value: 'option2'
        })
      ]
    }),
    // 分隔线
    components.divider.create('divider3'),
    // 复选框组
    components.checkbox.group('checkbox-group', {
      label: '这是一个复选框',
      orientation: 'horizontal',
      // 复选框列表
      checkbox: [
        components.checkbox.create('checkbox-1', {
          name: '选项1',
          label: '选项1',
          value: 'option1'
        }),
        components.checkbox.create('checkbox-2', {
          label: '选项2',
          value: 'option2'
        }),
        components.checkbox.create('checkbox-3', {
          label: '选项3',
          value: 'option3'
        })
      ]
    }),
    // 分隔线
    components.divider.create('divider4', { transparent: true }),

    // 手风琴
    components.accordion.create('accordion-key', {
      label: '这是一个手风琴',
      children: [
        components.accordion.createItem('accordion-item-key', {
          title: '子项标题',
          subtitle: '子项副标题',
          children: [
            components.input.string('accordion-input-key'),
            components.switch.create('accordion-switch-key')
          ]
        })
      ]
    }),
    // 手风琴pro
    components.accordionPro.create(
      // 唯一标识符
      'accordion-pro-key',
      // data
      [
        {
          title: '数据项1',
          input: '数据项1',
          switch: true
        },
        {
          input: '数据项2',
          switch: false
        }
      ],
      // 子项参数
      {
        label: '这是一个手风琴',
        children: components.accordion.createItem('accordion-item', {
          title: '子项标题',
          subtitle: '子项副标题',
          children: [
            components.input.string('accordion-input'), // 这里需要与data的key一致
            components.switch.create('accordion-switch')
          ]
        })
      }
    )
  ],

  /** 前端点击保存之后调用的方法 */
  save: (config: any) => {
    console.log('config:', JSON.stringify(config, null, 2))
  }
}
