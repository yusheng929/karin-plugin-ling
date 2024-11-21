import fs from 'fs/promises';
import path from 'path';
import { logger } from 'node-karin';
export default class Ling {
    static move(Path, arg1) {
        throw new Error('Method not implemented.');
    }
    constructor() {
    }
    /**
   * 检测指定路径是否存在文件或文件夹
   * @param path - 文件或文件夹的路径
   * @param opts - 是否获取文件的详细信息(可选)
   */
    async fsStat(path, opts) {
        try {
            return await fs.stat(path, opts);
        }
        catch (error) {
            logger.trace(`获取: ${path} 出错:`, error.message);
            return false;
        }
    }
    async move(Path, FinalPath) {
        try {
            const finalDir = path.dirname(FinalPath);
            await this.mkdir(finalDir, { recursive: true });
            const finalFilePath = path.basename(FinalPath) === FinalPath ? path.join(finalDir, path.basename(FinalPath)) : FinalPath;
            await fs.rename(Path, finalFilePath);
            return true;
        }
        catch (error) {
            logger.error(`移动文件 ${Path} 到 ${FinalPath} 错误`, error.message);
            return false;
        }
    }
    async mkdir(dir, opts) {
        try {
            await fs.mkdir(dir, { recursive: true, ...opts });
            return true;
        }
        catch (error) {
            logger.error(`创建${dir}错误`, error.message);
            return false;
        }
    }
    async rm(path) {
        try {
            await fs.rm(path, { recursive: true, force: true });
            return true;
        }
        catch (error) {
            logger.error(`删除 ${path} 错误`, error.message);
            return false;
        }
    }
}
