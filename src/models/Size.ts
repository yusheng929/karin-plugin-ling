/**
 * 将字节转换为B,KB,MB,GB,TB的单位
 * @param size 字节数
 * @returns 转换后的字符串
 */
export const Size = async (size: number): Promise<string> => {
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let index = 0
  while (size >= 1024 && index < units.length - 1) {
    size /= 1024
    index++
  }
  return `${size.toFixed(2)} ${units[index]}`
}
