import path from 'path'
import { logger, common } from 'node-karin'

/** 当前文件的绝对路径 */
const filePath = common.absPath(import.meta.url.replace(/^file:(\/\/\/|\/\/)/, ''))
/** 插件包的目录路径 */
const dirname = path.dirname(filePath)
/** 插件包的名称 */
const basename = path.basename(dirname)
/** 插件包相对路径 */
const dirPath = './plugins/' + basename

export { dirPath }

logger.info(basename + ' 插件 0.0.1初始化~')
