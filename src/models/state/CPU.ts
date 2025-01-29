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
const getCPUTemp = async (): Promise<string | number> => {
  try {
    const cpuTemp = await si.cpuTemperature()

    const data = `${cpuTemp.main}°C`
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
    data.l1d = cpuCache.l1d > 1024 ? `${(cpuCache.l1d / 1024).toFixed(2)}MB` : `${cpuCache.l1d}KB`
    data.l1i = cpuCache.l1i > 1024 ? `${(cpuCache.l1i / 1024).toFixed(2)}MB` : `${cpuCache.l1i}KB`
    data.l2 = cpuCache.l2 > 1024 ? `${(cpuCache.l2 / 1024).toFixed(2)}MB` : `${cpuCache.l2}KB`
    data.l3 = cpuCache.l3 > 1024 ? `${(cpuCache.l3 / 1024).toFixed(2)}MB` : `${cpuCache.l3}KB`
    return data
  } catch (error) {
    return '少女不知道哦'
  }
}

export default { getCPUUsage, getCPUInfo, getCPUTemp, getCPUCache }
