import { YamlEditor, Cfg } from 'node-karin'

/**
 * 更新群组通知状态
 * @param e 事件对象
 * @param type 类型 ('White' 或 'Black')
 * @param isRemoval 是否是移除操作
 * @param targetType 目标类型 ('Group' 或 'User')
 * @param id 目标 ID
 * @returns 是否继续处理
 */
const 编辑黑白名单 = async (e, type, isRemoval, targetType, id) => {
  try {
    const yaml = new YamlEditor('config/config/config.yaml')
    let data

    if (type === 'Black') {
      data = targetType === 'Group' ? yaml.get('BlackList.groups') : yaml.get('BlackList.users')
    } else if (type === 'White') {
      data = targetType === 'Group' ? yaml.get('WhiteList.groups') : yaml.get('WhiteList.users')
    }

    if (!Array.isArray(data)) {
      await e.reply('\n配置文件格式错误❌', { at: true })
      return true
    }

    const isIdInList = data.includes(id)

    if ((!isRemoval && isIdInList) || (isRemoval && !isIdInList)) {
      await e.reply(`${targetType === 'Group' ? "群" : "用户"}『${id}』已经在${type === 'White' ? "白名单" : "黑名单"}里面了`)
      return true
    }

    if (!isRemoval) {
      if (targetType === 'Group') {
        yaml.append(`${type === 'White' ? 'WhiteList.groups' : 'BlackList.groups'}`, String(id))
        if ((type === 'White' && !Cfg.App.WhiteList.groups) || type === 'Black' && !Cfg.App.BlackList.groups) e.reply(`当前${type === 'White' ? "白" : "黑"}名单中的群配置未开启，黑白名单将无效，可前往config/config/App.yaml中启用`)
      } else {
        yaml.append(`${type === 'White' ? 'WhiteList.users' : 'BlackList.users'}`, String(id))
        if ((type === 'White' && !config.App.WhiteList.users) || type === 'Black' && !config.App.BlackList.users) e.reply(`当前${type === 'White' ? "白" : "黑"}名单中的用户配置未开启，黑白名单将无效，可前往config/config/App.yaml中启用`)
      }
      await e.reply(`已经将${targetType === 'Group' ? "群" : "用户"}『${id}』${type === 'White' ? "拉白" : "拉黑"}掉了`)
    } else {
      if (targetType === 'Group') {
        yaml.remove(`${type === 'White' ? 'WhiteList.groups' : 'BlackList.groups'}`, String(id))
      } else {
        yaml.remove(`${type === 'White' ? 'WhiteList.users' : 'BlackList.users'}`, String(id))
      }
      await e.reply(`已经将${targetType === 'Group' ? "群" : "用户"}『${id}』取消${type === 'White' ? "拉白" : "拉黑"}了`)
    }

    yaml.save()
    return true
  } catch (error) {
    await e.reply('失败: 未知错误❌')
    console.error(error)
    return true
  }
}
const 编辑文件 = async (e, 文件, 修改的值, 配置项, 修改内容) => {
 try {
 const 配置文件 = new YamlEditor(`config/config/${文件}`)
  let 获取配置项 = 配置文件.get(配置项)
  if (获取配置项 == 修改的值){
  e.reply(`当前${修改内容}已是${修改的值}，无需修改`)
  return true
  }
  配置文件.set(配置项, 修改的值)
  await e.reply(`${修改内容}已经被修改为${修改的值}`)
  配置文件.save()
  return true
 } catch (error) {
    await e.reply('失败: 未知错误❌')
    console.error(error)
    return true
  }
}
export default {
  编辑黑白名单,
  编辑文件
}