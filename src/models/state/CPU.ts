import { Size } from '@/components/Size'
import si from 'systeminformation'

/**
 * 获取CPU使用率
 * @returns {Promise<number>}
 */
const getCPUUsage = async (): Promise<string | number> => {
  try {
    const cpu = await si.currentLoad()

    const data = cpu.currentLoad.toFixed(2)
    return data
  } catch (error) {
    return 0
  }
}

/**
 * 获取CPU信息
 * @returns {Promise<string>}
 */
const getCPUInfo = async (): Promise<string> => {
  try {
    const cpuData = await si.cpu()
    const cpuSpeed = await si.cpuCurrentSpeed()
    const cpuCores = await si.cpu()
    const data = `${cpuData.brand} ${cpuData.cores}- Core (${cpuCores.physicalCores}) @ ${cpuSpeed.avg}GHZ`
    return data
  } catch (error) {
    return '少女不知道哦'
  }
}

/**
 * 获取CPU温度
 * @returns {Promise<number>}
 */
const getCPUTemp = async (): Promise<number> => {
  try {
    const cpuTemp = await si.cpuTemperature()

    const data = cpuTemp.main
    return data
  } catch (error) {
    return 0
  }
}

/**
 * 获取CPU缓存
 * @returns {Promise<string>}
 */
const getCPUCache = async (): Promise<any> => {
  try {
    const data: { l1d: string, l1i: string, l2: string, l3: string } = {

      l1d: '',
      l1i: '',
      l2: '',
      l3: ''
    }
    const cpuCache = await si.cpuCache()
    data.l1d = await Size(cpuCache.l1d)
    data.l1i = await Size(cpuCache.l1i)
    data.l2 = await Size(cpuCache.l2)
    data.l3 = await Size(cpuCache.l3)
    return data
  } catch (error) {
    return ''
  }
}

export default { getCPUUsage, getCPUInfo, getCPUTemp, getCPUCache }
