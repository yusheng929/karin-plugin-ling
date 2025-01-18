import { logger } from 'node-karin'
import { pkg } from '@/utils/config'
import { basename } from '@/utils/dir'

/** 请不要在这编写插件 不会有任何效果~ */
logger.info(`${logger.violet(`[插件:${pkg().version}]`)} ${logger.green(basename)} 初始化完成~`)
