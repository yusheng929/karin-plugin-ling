import { Config, Version } from '../../components/index.js';
import child_process from 'child_process';
import { logger } from 'node-karin';
/**
 * 获取FastFetch
 * @param e
 */
export default async function getFastFetch(e) {
    if (!isFeatureVisible(e.isPro))
        return '';
    const ret = await execSync(`bash ${Version.pluginPath}/resources/state/state.sh`);
    if (ret.error) {
        logger.error(`[${Version.pluginName}][状态]Error FastFetch 请检查是否使用git bash启动Karin，错误信息：${ret.stderr || ret.stdout}`);
        return '';
    }
    return ret.stdout.trim();
}
function isFeatureVisible(isPro) {
    const { showFastFetch } = Config.state;
    if (showFastFetch === true)
        return true;
    if (showFastFetch === 'pro' && isPro)
        return true;
    if (showFastFetch === 'default') {
        if (!isPlatformWin() || isPro)
            return true;
    }
    return false;
}
function isPlatformWin() {
    return process.platform === 'win32';
}
async function execSync(cmd) {
    return new Promise((resolve) => {
        child_process.exec(cmd, (error, stdout, stderr) => {
            resolve({ error, stdout, stderr });
        });
    });
}
