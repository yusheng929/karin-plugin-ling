import os from 'os'
import { execSync } from 'child_process'

const getCPUInfo = () => {
  try {
    const cpuInfo = execSync('lscpu').toString()
    const cpuModel = cpuInfo.match(/Model name:\s+(.+)/)[1].trim()
    const cpuFreq = cpuInfo.match(/CPU MHz:\s+(.+)/)[1].trim()
    const cpuCores = os.cpus().length
    return `${cpuCores}核 ${cpuModel} (${cpuFreq}MHz)`
  } catch (error) {
    return 'CPU 信息获取失败'
  }
}

const getSystemInfo = () => {
  const platform = os.platform()
  const release = os.release()
  const architecture = os.arch()
  const memoryTotal = (os.totalmem() / (1000 * 1000 * 1000)).toFixed(2)
  const memoryFree = (os.freemem() / (1000 * 1000 * 1000)).toFixed(2)
  const memoryUsed = (memoryTotal - memoryFree).toFixed(2)
  const memoryUsage = ((memoryUsed / memoryTotal) * 100).toFixed(2)

  return {
    system: `${platform} ${release} ${architecture}`,
    memory: `${memoryUsed} GiB / ${memoryTotal} GiB (${memoryUsage}%)`,
  }
}

const getDiskInfo = () => {
  try {
    let output = ''
    const platform = os.platform()

    if (platform === 'win32') {
      // Windows 系统使用 wmic 命令
      output = execSync('wmic logicaldisk get size,freespace,caption').toString()
      const lines = output.trim().split('\n')

      const diskInfo = []

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim().split(/\s+/)
        if (line.length === 3) {
          const [caption, freeSpace, totalSize] = line
          const freeGiB = (parseInt(freeSpace) / (1024 * 1024 * 1024)).toFixed(2)
          const totalSizeGiB = (parseInt(totalSize) / (1024 * 1024 * 1024)).toFixed(2)
          const usedGiB = (totalSizeGiB - freeGiB).toFixed(2)
          const usage = ((usedGiB / totalSizeGiB) * 100).toFixed(2)
          diskInfo.push(`  ${caption} ${usedGiB} GiB / ${totalSizeGiB} GiB (${usage}%)`)
        }
      }

      return diskInfo.length > 0 ? diskInfo.join('\n') : '无法获取磁盘信息'
    } else if (platform === 'linux' || platform === 'darwin') {
      // Linux 和 macOS 系统使用 df 命令
      output = execSync('df -h /').toString()
      const lines = output.trim().split('\n')
      const data = lines[1].split(/\s+/)
      const totalSize = data[1]
      const used = data[2]
      const available = data[3]
      const usage = data[4]

      return `Used: ${used}, Available: ${available}, Total: ${totalSize}, Usage: ${usage}`
    } else {
      return '不支持的操作系统'
    }
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
  getDiskInfo,
}
