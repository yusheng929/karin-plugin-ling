import { state } from '#lib'
import karin from 'node-karin'

export const State = karin.command(/^#系统信息$/, async (e) => {
  try {
    // 获取系统信息
    const systemInfo = state.getSystemInfo()
    // 获取CPU信息
    const cpuInfo = state.getCPUInfo()
    // 获取NodeJS版本
    const nodeVersion = state.getNodeVersion()
    const adapter = e.bot.adapter.name
    const Disk = state.getDiskInfo()

    // 组装消息
    const msg = 
`系统架构：${systemInfo.system}
CPU：${cpuInfo}
内存：${systemInfo.memory}
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
