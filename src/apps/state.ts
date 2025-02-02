import { CPU, Disk, RAM, System } from '@/models/state/index'
import karin, { common, segment, config } from 'node-karin'

export const state = karin.command(/^#系统信息(pro)?$/, async (e) => {
  const CPUUsage = await CPU.getCPUUsage()
  const CPUInfo = await CPU.getCPUInfo()
  const RAMInfo = await RAM.getRAMInfo()
  const SystemInfo = await System.getSystemInfo()
  const DiskInfo = await Disk.getDiskInfo()
  const SwapInfo = await RAM.getSwap()
  const adapter = e.bot.adapter.name
  if (!e.msg.includes('pro')) {
    const msg = [
      segment.text(`系统架构: ${SystemInfo}`),
      segment.text(`\nCPU: ${CPUInfo}`),
      segment.text(`\nCPU使用率: ${CPUUsage}%`),
      segment.text(`\n内存: ${RAMInfo}`),
      segment.text(`\n内存交换: ${SwapInfo}`),
      segment.text(`\n磁盘: \n${DiskInfo}`),
      segment.text(`\n运行环境: Node ${process.version}`),
      segment.text(`\n标准协议: ${adapter}`)
    ]

    await e.reply(msg)
    return true
  } else {
    const CPUTemp = await CPU.getCPUTemp()
    const CPUCache = await CPU.getCPUCache()
    const RAMTotal = await RAM.getRAMTotal()
    const RAMUsed = await RAM.getRAMUsed()
    const RAMFree = await RAM.getRAMFree()
    const SwapTotal = await RAM.getSwapTotal()
    const SwapUsed = await RAM.getSwapUsed()
    const SwapFree = await RAM.getSwapFree()
    const DiskInfos = await Disk.getDiskLayout()
    const uptime = process.uptime()
    const list: string[] = []

    list.push([
      'Karin状态:',
      `版本: ${config.pkg().version}`,
      `运行时间: ${Math.floor(uptime / 3600)}小时${Math.floor((uptime % 3600) / 60)}分钟${Math.floor(uptime % 60)}秒`,
      `PID: ${process.pid}`,
      `标准协议: ${adapter}`,
    ].join('\n'))

    list.push([
      'Node状态:',
      `版本: ${process.version}`,
      `进程占用: ${((process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2))}MB`,
      `JavaScript堆总量: ${((process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2))}MB`,
      `JavaScript堆使用: ${((process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2))}MB`,
    ].join('\n'))

    list.push([
      'CPU信息',
      `CPU: ${CPUInfo}`,
      `CPU使用率: ${CPUUsage}%`,
      `CPU温度: ${CPUTemp}°C`,
      'CPU缓存:',
      `L1数据缓存: ${CPUCache.l1d}`,
      `L1指令缓存: ${CPUCache.l1i}`,
      `L2缓存: ${CPUCache.l2}`,
      `L3缓存: ${CPUCache.l3}`
    ].join('\n'))

    list.push([
      '内存信息:',
      `内存总量: ${RAMTotal}`,
      `内存使用: ${RAMUsed}`,
      `内存空闲: ${RAMFree}`,
      `内存交换总量: ${SwapTotal}`,
      `内存交换使用: ${SwapUsed}`,
      `内存交换空闲: ${SwapFree}`
    ].join('\n'))

    list.push([
      '磁盘信息:',
      `${DiskInfos}`
    ].join('\n'))

    const msg = list.map((v) => segment.text(v))
    const forward = common.makeForward(msg, e.selfId, e.bot.account.name)
    await e.bot.sendForwardMsg(e.contact, forward)
    return true
  }
}, { name: '系统信息', priority: -1 })
