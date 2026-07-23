import { spawn } from 'child_process'
import { logger } from 'node-karin'

export interface RunShellResult {
  /** 退出码为 0 即成功 */
  status: boolean
  /** stdout + stderr 按产生顺序合并，与终端所见一致 */
  output: string
  /** 退出码，进程启动失败时为 null */
  code: number | null
}

/** 去除 ANSI 转义序列，用于日志输出 */
// eslint-disable-next-line no-control-regex
const stripAnsi = (str: string) => str.replace(/\x1b\[[0-9;]*m/g, '')

/**
 * 执行 shell 命令
 * - 与 `exec` 分开缓冲 stdout/stderr 不同，这里按到达顺序合并两条流，输出顺序与终端一致
 * - 执行前后会在控制台打印命令与结果
 * @param cmd 命令
 * @param timeout 超时时间（毫秒），超时后终止进程
 */
export const runShell = (cmd: string, timeout = 60000): Promise<RunShellResult> => {
  return new Promise((resolve) => {
    logger.info(`[exec] 执行命令: ${cmd}`)
    /** FORCE_COLOR / CLICOLOR_FORCE 让子进程在非 TTY 下也输出 ANSI 颜色，渲染时还原 */
    const env: NodeJS.ProcessEnv = { ...process.env, FORCE_COLOR: '1', CLICOLOR_FORCE: '1' }
    /** NO_COLOR 与 FORCE_COLOR 冲突会产生警告，优先强制着色 */
    delete env.NO_COLOR
    const child = spawn(cmd, { shell: true, env })
    let output = ''
    child.stdout.on('data', (chunk) => { output += chunk })
    child.stderr.on('data', (chunk) => { output += chunk })
    const timer = setTimeout(() => {
      output += `\n命令执行超时 ${timeout / 1000}s，已终止`
      child.kill()
    }, timeout)
    child.on('error', (err) => {
      clearTimeout(timer)
      resolve({ status: false, output: output + String(err), code: null })
    })
    child.on('close', (code) => {
      clearTimeout(timer)
      logger.info(`[exec] 执行完毕，退出码: ${code}\n${stripAnsi(output)}`)
      resolve({ status: code === 0, output, code })
    })
  })
}
