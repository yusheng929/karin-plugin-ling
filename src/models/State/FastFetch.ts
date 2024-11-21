import { Config, Version } from '@/components';
import child_process from 'child_process';
import { logger } from 'node-karin';

type ExecResult = {
  error: Error | null;
  stdout: string;
  stderr: string;
};

/**
 * 获取FastFetch
 * @param e
 */
export default async function getFastFetch(e: any): Promise<string> {
  if (!isFeatureVisible(e.isPro)) return '';
  
  const ret: ExecResult = await execSync(`bash plugins/${Version.pluginName}/resources/state/state.sh`);
  
  if (ret.error) {
    logger.error(
      `[${Version.pluginName}][状态]Error FastFetch 请检查是否使用git bash启动Karin，错误信息：${ret.stderr || ret.stdout}`
    );
    return '';
  }
  
  return ret.stdout.trim();
}

function isFeatureVisible(isPro: any): boolean {
  const { showFastFetch } = Config.getYaml('config', 'state')
  if (showFastFetch === true) return true;
  if (showFastFetch === 'pro' && isPro) return true;
  if (showFastFetch === 'default') {
    if (!isPlatformWin() || isPro) return true;
  }
  return false;
}

function isPlatformWin(): boolean {
  return process.platform === 'win32';
}

async function execSync(cmd: string): Promise<ExecResult> {
  return new Promise((resolve) => {
    child_process.exec(cmd, (error, stdout, stderr) => {
      resolve({ error, stdout, stderr });
    });
  });
}