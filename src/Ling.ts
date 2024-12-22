import fs from 'fs/promises'
import path from 'path'
import { logger } from 'node-karin'
import { MakeDirectoryOptions, PathLike, StatOptions } from 'fs'

class Ling {
  /**
     * 检测指定路径是否存在文件或文件夹
     * @param path - 文件或文件夹的路径
     * @param opts - 是否获取文件的详细信息(可选)
     */
  async fsStat (path: PathLike, opts: (StatOptions & { bigint?: false | undefined }) | undefined) {
    try {
      return await fs.stat(path, opts)
    } catch (error: any) {
      logger.trace(`获取: ${path} 出错:`, error.message)
      return false
    }
  }

  /**
     * 移动文件或文件夹
     * @param Path - 源路径
     * @param FinalPath - 目标路径
     */
  async move (Path: PathLike, FinalPath: string) {
    try {
      const finalDir = path.dirname(FinalPath)
      await this.mkdir(finalDir as PathLike, { recursive: true })
      const finalFilePath =
        path.basename(FinalPath) === FinalPath
          ? path.join(finalDir, path.basename(FinalPath))
          : FinalPath
      await fs.rename(Path, finalFilePath)
      return true
    } catch (error: any) {
      logger.error(`移动文件 ${Path} 到 ${FinalPath} 错误`, error.message)
      return false
    }
  }

  /**
     * 创建文件夹
     * @param dir - 文件夹路径
     * @param opts - 选项（递归等）
     */
  async mkdir (dir: PathLike, opts: (MakeDirectoryOptions & { recursive: true }) | undefined) {
    try {
      await fs.mkdir(dir, { recursive: true, ...opts })
      return true
    } catch (error: any) {
      logger.error(`创建${dir}错误`, error.message)
      return false
    }
  }

  /**
     * 删除文件或文件夹
     * @param path - 文件或文件夹路径
     */
  async rm (path: PathLike) {
    try {
      await fs.rm(path, { recursive: true, force: true })
      return true
    } catch (error: any) {
      logger.error(`删除 ${path} 错误`, error.message)
      return false
    }
  }
}

// 直接实例化并导出
export default new Ling()
