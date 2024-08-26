import { karin, YamlEditor } from 'node-karin'

/**
 * 更新群组通知状态
 * @param e 事件对象
 * @param type 类型 ('White' 或 'Black')
 * @param isRemoval 是否是移除操作
 * @param targetType 目标类型 ('Group' 或 'User')
 * @param id 目标 ID
 * @returns 是否继续处理
 */
const Edit = async (e, type, isRemoval, targetType, id) => {
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
      } else {
        yaml.append(`${type === 'White' ? 'WhiteList.users' : 'BlackList.users'}`, String(id))
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

export const BanorWh = karin.command(/^#(取消)?(拉黑|拉白)(群)?/, async (e) => {
  let id

  if (!e.msg.includes('群')) {
    id = e.at.length ? e.at[0] : e.msg.replace(/#(取消)?(拉黑|拉白)/, '').trim()
  } else {
    id = e.msg.replace(/#(取消)?(拉黑|拉白)群/, '').trim() || e.group_id
  }

  if (!id) return e.reply('请输入正确的账号')

  const type = e.msg.includes('拉白') ? 'White' : 'Black'
  const isRemoval = e.msg.includes('取消')
  const targetType = e.msg.includes('群') ? 'Group' : 'User'

  return await Edit(e, type, isRemoval, targetType, id)
}, { name: '取消拉黑拉白群', priority: '-1', permission: 'master' })
