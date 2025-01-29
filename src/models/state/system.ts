import os from 'os'

/**
 * 获取系统架构
 * @returns {Promise<string>}
 */
const getSystemInfo = async (): Promise<string> => {
  try {
    const platform = os.platform()
    const release = os.release()
    const arch = os.arch()
    return `${platform} ${release} ${arch}`
  } catch (error) {
    return '少女不知道哦'
  }
}

export default { getSystemInfo }
