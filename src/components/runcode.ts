import vm from 'node:vm'
/**
 * 运行JS代码
 * @param code 需要执行的代码
 * @param sandbox 沙盒环境
 * @returns 代码执行的结果
 */
export const RunJs = async (code: string, sandbox: any, repeat: boolean = false, a: boolean = true): Promise<any> => {
  try {
    const vmContext = vm.createContext(sandbox)
    const script = new vm.Script(`(async () => { ${a ? `return (${code})` : code} })()`)
    return await script.runInContext(vmContext, { timeout: 60000 })
  } catch (e) {
    if (!repeat && code.includes('return')) {
      return RunJs(code, sandbox, true, false)
    }
    throw new Error(String(e))
  }
}
