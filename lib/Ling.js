import fs from 'fs/promises';
import path from 'path';
import { logger } from 'node-karin';
import { exec as childExec } from 'child_process';
class Ling {
    constructor() { }
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
    /**
     * 移动文件或文件夹
     * @param Path - 源路径
     * @param FinalPath - 目标路径
     */
    async move(Path, FinalPath) {
        try {
            const finalDir = path.dirname(FinalPath);
            await this.mkdir(finalDir, { recursive: true });
            const finalFilePath = path.basename(FinalPath) === FinalPath
                ? path.join(finalDir, path.basename(FinalPath))
                : FinalPath;
            await fs.rename(Path, finalFilePath);
            return true;
        }
        catch (error) {
            logger.error(`移动文件 ${Path} 到 ${FinalPath} 错误`, error.message);
            return false;
        }
    }
    /**
     * 创建文件夹
     * @param dir - 文件夹路径
     * @param opts - 选项（递归等）
     */
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
    /**
     * 删除文件或文件夹
     * @param path - 文件或文件夹路径
     */
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
    /**
     * 异步执行命令
     * @param cmd - 要执行的命令
     */
    async exec(cmd) {
        return new Promise((resolve, reject) => {
            childExec(cmd, (error, stdout, stderr) => {
                if (error) {
                    reject(`执行错误: \n${error.message}`);
                }
                else if (stderr) {
                    reject(`标准错误输出: \n${stderr}`);
                }
                else {
                    resolve(stdout);
                }
            });
        });
    }
}
// 直接实例化并导出
export default new Ling();
