import { HookNext, Message } from 'node-karin'

/**
 * 消息中间件组合函数
 * @param func 函数数组
 * @returns
 */
export function createHookMessageHandler (func: Function[]) {
  return async (e: Message, next: HookNext) => {
    let index = -1

    async function dispatch (i: number) {
      if (i <= index) return
      index = i

      const fn = func[i] || next
      if (!fn) return

      await fn(e, () => dispatch(i + 1))
    }

    await dispatch(0)
  }
}

export function createGroupHandler (func: Function[]) { }
