import { Version, Config } from '#components'
import { logger } from 'node-karin'

global.Ling = new (await import("./Ling.js")).default

logger.info('-----------------')
logger.info(`${Version.pluginName}${Config.package.version}初始化~`)
logger.info('-------^_^-------')