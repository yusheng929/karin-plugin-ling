import os from 'os'
import si from 'systeminformation'

const CPUUsage = async () => {
    try {
        let load = await si.currentLoad()
        let cpus = os.cpus()
        let cpuSpeedGHz = (cpus[0].speed / 1000).toFixed(2) // 获取第一个CPU的频率，并转换为GHz
        let usagePercent = load.currentLoad.toFixed(2)
        return `${usagePercent}% (${cpuSpeedGHz} GHz)`
    } catch (error) {
        console.error("获取CPU占用失败:", error)
        return "获取CPU失败"
    }
}

const CPUInfo = async () => {
    try {
        let cpuData = await si.cpu()
        let cores = await cpuData.cores
        let model = await cpuData.brand
        return `${cores}核 ${model}`
    } catch (error) {
        console.error("获取CPU信息失败:", error)
        return "获取CPU失败"
    }
}

export default {
  CPUUsage,
  CPUInfo
}
