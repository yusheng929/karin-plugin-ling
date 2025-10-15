import path from 'node:path'
import { pkg } from '@/components/config'
import { dirPath, pluginName } from '@/utils/dir'
import { segment, karin, config } from 'node-karin'

/** 默认参数 */
export const copyright = `<span class="version" style="color: #ffb6c1;"> Karin v${config.pkg().version} </span> & <span class="version" style="color: #4169e1;"> ${pluginName} v${pkg().version} </span>`

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
  const root = path.join(dirPath, 'resources')
  const img = await karin.render({

    name: path.basename(name),
    type: 'jpeg',
    file: path.join(root, `${name}.html`),
    data: {
      pluResPath: `${root}/`,
      sys: {
        copyright: params.copyright || copyright,
      },
      ...params,
    },
    screensEval: '#container',
    pageGotoParams: {
      waitUntil: 'networkidle2',
    },
  })
  return segment.image(`${img.includes('base64://') ? img : `base64://${img}`}`)
}
