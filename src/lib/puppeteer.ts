import path from 'node:path'
import { pkg } from '@/utils/config'
import { pluginName } from '@/utils/dir'
import { segment, karin, config } from 'node-karin'

/** 默认布局 */
export const defaultLayout = path.join(pluginName, 'resources', 'common', 'layout', 'default.html')
/** 默认参数 */
export const copyright = `Created By <span class="version"> Karin v${config.pkg().version} </span> & <span class="version"> ${pluginName} v${pkg().version} </span>`

/**
 * 缩放
 * @param pct 缩放比例
 * @returns 缩放样式
 */
export const scale = (pct = 1) => {
  const scale = Math.min(2, Math.max(0.5, 100 / 100))
  pct = pct * scale
  return `style=transform:scale(${pct})`
}

/**
 * 渲染
 * @param name 文件名称 不包含`.html`
 * @param params 渲染参数
 */
export const render = async (
  name: string,
  params: Record<string, any>
) => {
  name = name.replace(/.html$/, '')
  const root = path.join(pluginName, 'resources')
  const img = await karin.render({

    name: path.basename(name),
    type: 'jpeg',
    file: path.join(root, `${name}.html`),
    data: {
      pluResPath: `${root}/`,
      defaultLayout,
      sys: {
        scale: scale(params.scale || 1),
        copyright: params.copyright || copyright,
      },
      ...params,
    },
    screensEval: '#containter',
    pageGotoParams: {
      waitUntil: 'networkidle2',
    },
  })
  return segment.image(`base64://${img}`)
}
