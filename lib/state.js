import { execSync } from 'child_process'
import os from 'os'
import ps from 'ps-node'
import diskusage from 'diskusage'

const getCPUInfo = () => {
  try {
    let cpuInfo = execSync('lscpu').toString()
    let cpuModel = cpuInfo.match(/Model name:\s+(.+)/)[1].trim()
    let cpuFreq = cpuInfo.match(/CPU MHz:\s+(.+)/)[1].trim()
    let cpuCores = os.cpus().length
    return `${cpuCores}核 ${cpuModel} (${cpuFreq}MHz)`
  } catch (error) {
    return 'CPU 信息获取失败'
  }
}

const getSystemInfo = () => {
  let platform = os.platform()
  let release = os.release()
  let architecture = os.arch()
  let memoryTotal = (os.totalmem() / (1000 * 1000 * 1000)).toFixed(2)
  let memoryFree = (os.freemem() / (1000 * 1000 * 1000)).toFixed(2)
  let memoryUsed = (memoryTotal - memoryFree).toFixed(2)
  let memoryUsage = ((memoryUsed / memoryTotal) * 100).toFixed(2)

  return {
    system: `${platform} ${release} ${architecture}`,
    memory: `${memoryUsed} GiB / ${memoryTotal} GiB (${memoryUsage}%)`
  }
}
const getDiskInfo = () => {
  try {
    // 获取根目录路径
    let path = '/'
    let { available, total } = diskusage.checkSync(path)
    let free = (available / (1000 * 1000 * 1000)).toFixed(2)
    let totalSize = (total / (1000 * 1000 * 1000)).toFixed(2)
    let used = (totalSize - free).toFixed(2)
    let usage = ((used / totalSize) * 100).toFixed(2)

    return `${used} GiB / ${totalSize} GiB (${usage}%)`
  } catch (error) {
    return '磁盘信息获取失败'
  }
}

const getNodeVersion = () => {
  return `NodeJS ${process.version}`
}
export default {
  getCPUInfo,
  getSystemInfo,
  getNodeVersion,
  getDiskInfo
}
