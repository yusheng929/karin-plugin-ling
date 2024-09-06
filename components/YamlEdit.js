import { YamlEditor, Cfg } from 'node-karin'
import Version from './Version.js'

let CfgPath = `${Version.pluginPath}/config/config`
const EditAdd = async (e, type, Msg1, Msg2, term, id, path) => {

  try {
    const yaml = new YamlEditor(`${CfgPath}/${path}.yaml`)
    const data = yaml.get(term)
    if (!Array.isArray(data)) {
      await e.reply('\n配置文件格式错误❌', { at: true })
      return true
    }

    if ((type === 'add' && data.includes(id)) || (type === 'remove' && !data.includes(id))) {
      await e.reply(Msg2)
      return true
    }

    if (type === 'add') {
      yaml.append(term, String(id))
    } else {
      const res = yaml.remove(term, String(id))
      if (!res) {
        await e.reply('失败: 未知错误❌')
        return true
      }
    }
    yaml.save()
    await e.reply(Msg1)
    return true
  } catch (error) {
    await e.reply('失败: 未知错误❌')
    logger.error(error)
    return true
  }
}

export default {
  EditAdd,
}