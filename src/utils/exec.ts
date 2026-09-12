import { spawn } from 'child_process'
import os from 'os'
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
 * 拼接子进程的原始字节流并按平台解码
 * - 先攒 Buffer 再解码，避免多字节字符跨 chunk 被切断
 * - Windows 中文系统的 cmd/PowerShell 输出为 GBK，按 UTF-8 解码出现替换符时回退 GBK
 */
const decodeOutput = (chunks: Buffer[]): string => {
  const buf = Buffer.concat(chunks)
  const utf8 = buf.toString('utf8')
  if (os.platform() === 'win32' && utf8.includes('�')) {
    return new TextDecoder('gbk').decode(buf)
  }
  return utf8
}

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
    const chunks: Buffer[] = []
    child.stdout.on('data', (chunk) => { chunks.push(chunk) })
    child.stderr.on('data', (chunk) => { chunks.push(chunk) })
    let suffix = ''
    const timer = setTimeout(() => {
      suffix = `\n命令执行超时 ${timeout / 1000}s，已终止`
      child.kill()
    }, timeout)
    child.on('error', (err) => {
      clearTimeout(timer)
      resolve({ status: false, output: decodeOutput(chunks) + String(err), code: null })
    })
    child.on('close', (code) => {
      clearTimeout(timer)
      const output = decodeOutput(chunks) + suffix
      logger.info(`[exec] 执行完毕，退出码: ${code}\n${stripAnsi(output)}`)
      resolve({ status: code === 0, output, code })
    })
  })
}
