import { YamlEditor, Cfg, config } from 'node-karin'

/**
 * 更新群组通知状态
 * @param e 事件对象
 * @param type 类型 ('White' 或 'Black')
 * @param isRemoval 是否是移除操作
 * @param targetType 目标类型 ('Group' 或 'User')
 * @param id 目标 ID
 * @returns 是否继续处理
 */
const updateCfg = async (e: any, type: string, isRemoval: any, targetType: string, id: any) => {
  try {
    const yaml = new YamlEditor('./config/config/config.yaml')
    let data

    if (type === 'Black') {
      data = targetType === 'Group' ? yaml.get('BlackList.groups') : yaml.get('BlackList.users')
    } else if (type === 'White') {
      data = targetType === 'Group' ? yaml.get('WhiteList.groups') : yaml.get('WhiteList.users')
    }

    if (!Array.isArray(data)) {
      e.reply('\n配置文件格式错误❌', { at: true })
      return true
    }

    const isIdInList = data.includes(id)

    if ((!isRemoval && isIdInList) || (isRemoval && !isIdInList)) {
      e.reply(`${targetType === 'Group' ? '群' : '用户'}『${id}』已经在${type === 'White' ? '白名单' : '黑名单'}里面了`, { at: true })
      return true
    }

    if (!isRemoval) {
      if (targetType === 'Group') {
        yaml.append(`${type === 'White' ? 'WhiteList.groups' : 'BlackList.groups'}`, String(id))
        // eslint-disable-next-line @stylistic/no-mixed-operators
        if ((type === 'White' && !Cfg.App.WhiteList.groups) || type === 'Black' && !Cfg.App.BlackList.groups) e.reply(`当前${type === 'White' ? '白' : '黑'}名单中的群配置未开启，黑白名单将无效，可前往config/config/App.yaml中启用`, { at: true })
      } else {
        yaml.append(`${type === 'White' ? 'WhiteList.users' : 'BlackList.users'}`, String(id))
        // eslint-disable-next-line @stylistic/no-mixed-operators
        if ((type === 'White' && !config.App.WhiteList.users) || type === 'Black' && !config.App.BlackList.users) e.reply(`当前${type === 'White' ? '白' : '黑'}名单中的用户配置未开启，黑白名单将无效，可前往config/config/App.yaml中启用`, { at: true })
      }
      e.reply(`已经将${targetType === 'Group' ? '群' : '用户'}『${id}』${type === 'White' ? '拉白' : '拉黑'}掉了`, { at: true })
    } else {
      if (targetType === 'Group') {
        yaml.remove(`${type === 'White' ? 'WhiteList.groups' : 'BlackList.groups'}`, String(id))
      } else {
        yaml.remove(`${type === 'White' ? 'WhiteList.users' : 'BlackList.users'}`, String(id))
      }
      e.reply(`已经将${targetType === 'Group' ? '群' : '用户'}『${id}』取消${type === 'White' ? '拉白' : '拉黑'}了`, { at: true })
    }

    yaml.save()
    return true
  } catch (error) {
    e.reply('失败: 未知错误❌', { at: true })
    console.error(error)
    return true
  }
}
const UpdateFile = async (e: any, 文件: any, 修改的值: string | number | boolean | object | any[], 配置项: string, 修改内容: any) => {
  try {
    const 配置文件 = new YamlEditor(`./config/config/${文件}`)
    const 获取配置项 = 配置文件.get(配置项)
    if (获取配置项 === 修改的值) {
      e.reply(`当前${修改内容}已是${修改的值}，无需修改`)
      return true
    }
    配置文件.set(配置项, 修改的值)
    e.reply(`${修改内容}已经被修改为${修改的值}`)
    配置文件.save()
    return true
  } catch (error) {
    e.reply('失败: 未知错误❌')
    console.error(error)
    return true
  }
}

export default {
  编辑黑白名单: updateCfg,
  编辑文件: UpdateFile,
}
