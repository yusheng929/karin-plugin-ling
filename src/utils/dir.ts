import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { karinPathBase } from 'node-karin'
import pkg from '../../package.json'

let filePath = path.resolve(fileURLToPath(import.meta.url).replace(/\\/g, '/'), '../../..')
if (!fs.existsSync(path.join(filePath, 'package.json'))) {
  filePath = path.resolve(fileURLToPath(import.meta.url).replace(/\\/g, '/'), '../..')
}

export const dir = {
  /** 插件名 */
  name: pkg.name,
  /** 插件版本 */
  version: pkg.version,
  /** 插件绝对路径 */
  pluginPath: filePath,
  /** 插件在 @karinjs 中的目录 */
  get BaseDir () {
    return path.join(karinPathBase, this.name)
  },
  /** 配置文件路径 */
  get ConfigDir () {
    return path.join(this.BaseDir, 'config')
  },
  /** 插件缓存目录 */
  get TempDir () {
    return path.join(this.BaseDir, 'temp')
  },
}
