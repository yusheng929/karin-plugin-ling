import { components } from 'node-karin'

export default {
  info: {

  },
  /** 动态渲染的组件 */
  components: () => [
    components
      .input
      .email('email')
      .toJSON(),
    components.divider,
    components
      .input
      .number('number'),
    components.divider,
    components.accordion
      .default('accordion')
      .children([
        components
          .accordionItem
          .create('item1')
          .title('手风琴')
          .children([
            components.input.string('string1')
          ])
      ])
  ],

  /** 前端点击保存之后调用的方法 */
  save: (config) => {
    console.log('config:', config)
  }
}
