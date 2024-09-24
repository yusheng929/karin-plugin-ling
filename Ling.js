import http from 'http'
import fs from 'fs'
import path from 'path'
import { logger } from 'node-karin'

export default class Ling {
constructor() {
  }
  /**
 * 下载文件到指定路径，如果文件已存在则替换
 * @param {string} url - 文件的URL
 * @param {string} downloadPath - 文件下载的路径
 */
  async downloadFile(url, downloadPath) {
  try {
    const dir = path.dirname(downloadPath)

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    await new Promise((resolve, reject) => {
      const file = fs.createWriteStream(downloadPath)

      http.get(url, (response) => {
        if (response.statusCode === 200) {
          response.pipe(file)
        } else {
          reject(new Error(`Failed to download file: ${response.statusCode}`))
        }
        file.on('finish', () => {
          file.close(resolve)
        })
      }).on('error', (err) => {
        fs.unlink(downloadPath, () => reject(new Error(err.message)))
      })
    })
  } catch (error) {
    logger.error('文件下载失败:', error.message)
    }
  }
}