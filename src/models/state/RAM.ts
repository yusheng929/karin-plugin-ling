import { Size } from '@/components/Size'
import si from 'systeminformation'

/**
 * 获取内存信息
 * @returns {Promise<string>}
 */
const getRAMInfo = async (): Promise<string> => {
  try {
    const ram = await si.mem()

    const total = await getRAMTotal()
    const used = await getRAMUsed()
    const percent = (ram.active / ram.total) * 100
    return `${used} / ${total} (${percent.toFixed(2)}%)`
  } catch (error) {
    return '少女不知道哦'
  }
}

/**
 * 获取内存总量
 * @returns {Promise<string>}
 */
const getRAMTotal = async (): Promise<string | number> => {
  try {
    const ram = await si.mem()

    const total = await Size(ram.total)
    return total
  } catch (error) {
    return 0
  }
}

/**
 * 获取内存使用量
 * @returns {Promise<string>}
 */
const getRAMUsed = async (): Promise<string | number> => {
  try {
    const ram = await si.mem()

    const used = await Size(ram.used)
    return used
  } catch (error) {
    return 0
  }
}

/**
 * 获取内存空闲量
 * @returns {Promise<string>}
 */
const getRAMFree = async (): Promise<string | number> => {
  try {
    const ram = await si.mem()

    const free = await Size(ram.free)
    return free
  } catch (error) {
    return 0
  }
}

/**
 * 获取内存交换量
 * @returns {Promise<string>}
 */
const getSwap = async (): Promise<string> => {
  try {
    const swap = await si.mem()
    const swapTotal = await getSwapTotal()
    const swapUsed = await getSwapUsed()
    const percent = (swap.swapused / swap.swaptotal) * 100
    return `${swapUsed} / ${swapTotal} (${percent.toFixed(2)}%)`
  } catch (error) {
    return '少女不知道哦'
  }
}

/**
 * 获取内存交换总量
 * @returns {Promise<string>}
 */
const getSwapTotal = async (): Promise<string | number> => {
  try {
    const swap = await si.mem()
    const swapTotal = await Size(swap.swaptotal)
    return swapTotal
  } catch (error) {
    return 0
  }
}

/**
 * 获取内存交换使用量
 * @returns {Promise<string>}
 */
const getSwapUsed = async (): Promise<string | number> => {
  try {
    const swap = await si.mem()
    const swapUsed = await Size(swap.swapused)
    return swapUsed
  } catch (error) {
    return 0
  }
}

/**
 * 获取内存交换空闲量
 * @returns {Promise<string>}
 */
const getSwapFree = async (): Promise<string | number> => {
  try {
    const swap = await si.mem()
    const swapFree = await Size(swap.swapfree)
    return swapFree
  } catch (error) {
    return 0
  }
}

export default { getRAMInfo, getRAMTotal, getRAMUsed, getRAMFree, getSwap, getSwapTotal, getSwapUsed, getSwapFree }
