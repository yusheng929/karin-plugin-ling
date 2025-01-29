import { Size } from '@/components/Size'
import si from 'systeminformation'

/**
 * 获取磁盘使用情况
 * @returns {Promise<string>}
 */
const getDiskInfo = async (): Promise<string> => {
  try {
    const disk = await si.fsSize()
    const data = await Promise.all(disk.map(async (v) => {
      const percent = ((v.used / v.size) * 100).toFixed(2)

      const used = await Size(v.used)
      const total = await Size(v.size)
      return `${v.fs} ${used} / ${total} (${percent}%)`
    }))
    return data.join('\n')
  } catch (error) {
    return '少女不知道哦'
  }
}

const getDiskLayout = async (): Promise<string> => {
  try {
    const disk = await si.diskLayout()
    const data = await Promise.all(disk.map(async (v) => {
      const total = await Size(v.size)
      return `磁盘名:${v.name}\n总大小: ${total}\n磁盘类型: ${v.type}\n磁盘状态: ${v.smartStatus}`
    }))
    return data.join('\n')
  } catch (error) {
    return '少女不知道哦'
  }
}
export default { getDiskInfo, getDiskLayout }
