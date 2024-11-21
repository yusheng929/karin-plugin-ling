import os from 'os';
import { execSync } from 'child_process';
const Disk = () => {
    try {
        let output = '';
        const platform = os.platform();
        if (platform === 'win32') {
            // Windows 系统使用 wmic 命令
            output = execSync('wmic logicaldisk get size,freespace,caption').toString();
            const lines = output.trim().split('\n');
            const diskInfo = [];
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim().split(/\s+/);
                if (line.length === 3) {
                    const [caption, freeSpace, totalSize] = line;
                    const freeGiB = Number((parseInt(freeSpace) / (1024 * 1024 * 1024)).toFixed(2));
                    const totalSizeGiB = Number((parseInt(totalSize) / (1024 * 1024 * 1024)).toFixed(2));
                    const usedGiB = Number((totalSizeGiB - freeGiB).toFixed(2));
                    const usage = Number(((usedGiB / totalSizeGiB) * 100).toFixed(2));
                    diskInfo.push(`  ${caption} ${usedGiB} GiB / ${totalSizeGiB} GiB (${usage}%)`);
                }
            }
            return diskInfo.length > 0 ? diskInfo.join('\n') : '无法获取磁盘信息';
        }
        else if (platform === 'linux' || platform === 'darwin') {
            // Linux 和 macOS 系统使用 df 命令
            output = execSync('df -h /').toString();
            const lines = output.trim().split('\n');
            const data = lines[1].split(/\s+/);
            const totalSize = data[1];
            const used = data[2];
            const available = data[3];
            const usage = data[4];
            return `已使用: ${used}, 未使用: ${available}, 总共: ${totalSize}, 使用百分比: ${usage}`;
        }
        else {
            return '不支持的操作系统';
        }
    }
    catch (error) {
        return '磁盘信息获取失败';
    }
};
export default {
    Disk
};
