import karin from 'node-karin'
import { CPU, RAM, Disk, System } from '@/state'

export const State = karin.command(/^#系统信息$/, async (e) => {
  try {
    const CPUA = await CPU.CPUUsage()
    const CPUB = await CPU.CPUInfo()
    const RAMA = await RAM.RAM()
    const RAMB = await RAM.SwapRAMUsage()
    const adapter = e.bot.adapter.name
    const implementation = e.bot.adapter.name
    const disk = Disk.Disk()
    const system = System.System()

    const msg = [
      `系统架构：${system}`,
      `CPU：${CPUA}`,
      `CPU信息: ${CPUB}`,
      `内存：${RAMA}`,
      `内存交换: ${RAMB}`,
      `储存: \n${disk}`,
      `运行环境：NodeJS ${process.version}`,
      `标准协议: ${adapter}`,
      `适配器: ${implementation}`
    ].join('\n')

    await e.reply(msg)
    return true
  } catch (error) {
    await e.reply(`发生未知错误: ${(error as Error).message}`)
    return true
  }
}, { name: '系统信息', priority: -1 })
