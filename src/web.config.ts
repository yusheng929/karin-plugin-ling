import { accordionItem, components, logger } from 'node-karin'

export default {
  info: {},
  components: () => [
    components.accordion.create('accordion-key', {
      label: '这是一个手风琴',
      children: [
        components.accordion.createItem('accordion-item-key', {
          title: '子项标题',
          subtitle: '子项副标题',
          indicator: true, // 是否显示折叠项展开指示器
          isCompact: false, // 是否使用紧凑模式
          isDisabled: false, // 是否禁用
          keepContentMounted: true, // 关闭时是否保持挂载内容
          hideIndicator: false, // 是否隐藏指示器
          disableAnimation: false, // 是否禁用动画
          disableIndicatorAnimation: false, // 是否禁用指示器动画
          children: [
            // 自定义组件
            components.input.string('accordion-input-key'),
            components.switch.create('accordion-switch-key')
          ]
        })
      ]
    }),
  ],
  save: (config: any) => {
    logger.info(config)
    return {
      success: true,
      message: '保存成功'
    }
  }
}
