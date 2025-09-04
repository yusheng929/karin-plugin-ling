import { logger } from 'node-karin'
import { pkg } from '@/components/config'
import { basename } from '@/utils/dir'

/** 请不要在这编写插件 不会有任何效果~ */

logger.info('-----------------')
logger.info(`\x1b[38;2;255;182;193m${basename}${pkg().version}初始化~\x1b[0m`)
logger.info('\x1b[38;2;173;216;230m少女祈祷中...\x1b[0m')
logger.info('-------^_^-------')
