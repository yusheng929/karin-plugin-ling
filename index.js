import { Version, Config } from './lib/index.js'
import { logger } from 'node-karin'

logger.info('-----------------')
logger.info(`${Version.pluginName}${Config.package.version}初始化~`)
logger.info('-------^_^-------')

export * from './apps/index.js'
