import { Version } from './lib/index.js'
import { logger } from 'node-karin'

logger.info('-----------------')
logger.info(`${Version.pluginName}${Version.version}初始化~`)
logger.info('-------^_^-------')

export * from './apps/index.js'
