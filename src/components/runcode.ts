import { logger } from 'node-karin'
import vm from 'node:vm'
/**
 * 运行JS代码
 * @param code 需要执行的代码
 * @param sandbox 沙盒环境
 * @returns 代码执行的结果
 */
export const RunJs = async (code: string, sandbox: any, repeat: boolean = false, a: boolean = true): Promise<any> => {
  try {
    logger.info(`执行代码: \n${code}`)
    const vmContext = vm.createContext(sandbox)
    const script = new vm.Script(`(async () => { ${a ? `return (${code})` : code} })()`)
    return await script.runInContext(vmContext, { timeout: 30000 })
  } catch (e) {
    if (!repeat && String(e).includes('SyntaxError: Unexpected')) {
      return RunJs(code, sandbox, true, false)
    }
    throw e
  }
}
