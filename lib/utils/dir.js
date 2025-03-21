import path from 'node:path';
import { fileURLToPath } from 'node:url';
/** 当前文件的绝对路径 */
const filePath = fileURLToPath(import.meta.url).replace(/\\/g, '/');
/** 插件包绝对路径 */
export const dirPath = path.resolve(filePath, '../../..');
/** 插件包的名称 */
export const basename = path.basename(dirPath);
/** 插件名称 */
export const pluginName = basename;
