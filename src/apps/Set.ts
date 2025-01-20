import { render } from '@/lib/puppeteer'
import { cof, other, setYaml } from '@/utils/config'
import { karin } from 'node-karin'
import lodash from 'node-karin/lodash'

const cfgMap: Record<string, string> = {
  好友通知: 'other_friend.notify',
  进退群通知: 'other_accept.enable',
  自动同意好友申请: 'other_friend.enable',
  点赞: 'other_friend.closeLike',
  未点赞文本: 'other_friend.likeStart',
  已点赞文本: 'other_friend.likeEnd',
  群邀请: 'other_group.notify',
  自动同意邀群: 'other_group.invite',
  全部通知: 'other_notify',
}

const CfgReg = `^#?(铃|ling|Ling)设置\\s*(${lodash.keys(cfgMap).join('|')})?\\s*(.*)$`

export const set = karin.command(CfgReg, async (e) => {
  const reg = new RegExp(CfgReg).exec(e.msg)
  if (reg && reg[2]) {
    let val: string | boolean = reg[3] || ''
    let cfgKey = cfgMap[reg[2]]
    if (val.includes('开启') || val.includes('关闭')) {
      val = !/关闭/.test(val)
    } else {
      cfgKey = ''
    }

    if (cfgKey) {
      setCfg(cfgKey, val)
    }
  }

  const cfg: Record<string, any> = {}
  for (const name in cfgMap) {
    const key = cfgMap[name].split('_')[1].replace('.', '_')
    cfg[key] = getStatus(cfgMap[name])
  }

  // 渲染图像
  const base64 = await render('admin/index', {
    ...cfg,
    scale: 1,
    copyright: 'Karin'
  })

  await e.reply(base64)
  return true
}, { permission: 'master' })

const setCfg = async function (rote: string, value: boolean | string | number, def = false) {
  const arr = rote?.split('_') || []
  if (arr.length > 0) {
    const name = arr[0]
    const keys = arr[1]
    await setYaml(name, keys, value)
  }
}

const getStatus = function (rote: string, def = false) {
  let _class = 'cfg-status'
  let value = ''
  const arr = rote?.split('_') || []
  if (arr.length > 0) {
    const type = arr[0]
    const name = arr[1]
    const data: any = getCfg(type)
    const keys = name.split('.')
    let datas = data
    for (const types of keys) {
      datas = datas[types]
    }
    if (datas === true || datas === false) {
      _class = datas === false ? `${_class}  status-off` : _class
      value = datas === true ? '已开启' : '已关闭'
    } else {
      value = datas
    }
  }
  if (!value) {
    _class = `${_class}  status-off`
    value = '已关闭'
  }

  return `<div class="${_class}">${value}</div>`
}

const getCfg = function (type: string) {
  if (type === 'other') {
    return other()
  } else {
    if (type === 'cof') {
      return cof()
    }
  }
}
