import fs from 'fs'
import { logger } from 'node-karin'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { Version } from '../lib/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const files = fs.readdirSync(__dirname).filter(file => file.endsWith('.js'))

const apps = {}
for (const i of files) {
  if (i === 'index.js') continue
  try {
    const exp = await import(`file://${join(__dirname, i)}`)
    for (const key in exp) {
      if (exp[key].prototype) {
        apps[key] = exp[key]
      }
    }
  } catch (error) {
    logger.error(`[${Version.pluginName}]加载js: apps/${i}错误\n`, error)
  }
}

export { apps }
