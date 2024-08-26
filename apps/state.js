import { state, CPU, RAM } from '#lib'
import karin from 'node-karin'

export const State = karin.command(/^#系统信息$/, async (e) => {
  try {
    // 获取系统信息
    const systemInfo = state.getSystemInfo()
    // 获取CPU信息
    const cpuInfo = state.getCPUInfo()
    const CPUA = await CPU.CPUUsage()
    const CPUB = await CPU.CPUInfo()
    const RAMA = await RAM.RAM()
    const RAMB = await RAM.SwapRAMUsage()
    // 获取NodeJS版本
    const nodeVersion = state.getNodeVersion()
    const adapter = e.bot.adapter.name
    const Disk = state.getDiskInfo()

    // 组装消息
    const msg = 
`系统架构：${systemInfo.system}
CPU：${CPUA}
CPU信息: ${CPUB}
内存：${RAMA}
内存交换: ${RAMB}
储存: ${Disk}
运行环境：${nodeVersion}
适配器: ${adapter}`

    // 回复消息
    return e.reply(msg)
  } catch (error) {
    // 处理错误
    return e.reply(`发生错误: ${error.message}`)
  }
}, { name: '系统信息', priority: '-1' })
