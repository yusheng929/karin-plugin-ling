import karin, { common, Message } from 'node-karin'
import pb from '@/models/protobuf/index'
import { Client } from 'icqq'

const loginlist: any = {}

export const violationquery = karin.command(/^#(我的|(机器人|bot))违规记录(查询)?([1-9]\d*)?$/i, async (e) => {
  const num = e.msg.replace(/^#(我的|(机器人|bot))违规记录(查询)?/i, '').trim() || 20
  let code
  const appid = 1109907872
  let uin = e.msg.includes('我的') ? e.userId : e.selfId
  if (loginlist[`${uin}_code`] && (Date.now() - loginlist[`${uin}_code`].time) < 10 * 60 * 1000) {
    code = loginlist[`${uin}_code`].code
  }
  if (!code) {
    if (e.msg.includes('我的')) {
      const options = {
        method: 'GET',
        headers: {
          qua: 'V1_HT5_QDT_0.70.2209190_x64_0_DEV_D',
          host: 'q.qq.com',
          accept: 'application/json',
          'content-type': 'application/json'
        }
      }
      const resultes = await fetch('https://q.qq.com/ide/devtoolAuth/GetLoginCode', options)
      const result = await resultes.json()
      if (result.data && result.data.code) {
        const logincode = result.data.code
        const verifymessage = await e.reply(`请在一分钟内通过以下链接授权登录！\nhttps://h5.qzone.qq.com/qqq/code/${logincode}?_proxy=1&from=ide`, { reply: true })
        const time = Date.now()
        let timer: number | NodeJS.Timeout = -1
        code = await new Promise(resolve => {
          let count = 0
          if (loginlist[uin]) {
            clearInterval(loginlist[uin])
            delete loginlist[uin]
          }
          loginlist[uin] = time
          timer = setInterval(async () => {
            if (count >= 60 || loginlist[uin] !== time) {
              clearInterval(timer)
              if (count >= 60) e.reply('授权登录超时！', { reply: true })
              resolve(false)
              return
            }
            const resultes = await fetch(`https://q.qq.com/ide/devtoolAuth/syncScanSateGetTicket?code=${logincode}`, options)
            const result = await resultes.json()
            if (result.code !== 0) {
              clearInterval(timer)
              e.reply(`授权登录失败！\n${result.message}[${result.code}]`, { reply: true })
              resolve(false)
              return
            }
            const data = result.data || {}
            if (data?.ok === 1) {
              if (data.uin) uin = data.uin
              clearInterval(timer)
              const ticket = data.ticket
              const options = {
                method: 'POST',
                headers: {
                  qua: 'V1_HT5_QDT_0.70.2209190_x64_0_DEV_D',
                  host: 'q.qq.com',
                  accept: 'application/json',
                  'content-type': 'application/json'
                },
                body: JSON.stringify({
                  appid,
                  ticket
                })
              }
              const response = await fetch('https://q.qq.com/ide/login', options)
              const result = await response.json()
              if (!result.code) {
                e.reply(`授权登录失败！\n${result.message}`, { reply: true })
                resolve(false)
                return
              }
              resolve(result.code)
              return
            }
            count++
          }, 1000)
        })
        if (verifymessage) {
          try {
            e.bot.recallMsg(e.contact, verifymessage.messageId)
          } catch (err) { }
        }
        if (loginlist[uin] === time) delete loginlist[uin]
        if (!code) {
          return true
        }
      }
    } else {
      code = await LightAppGetCode(e, appid)
    }
    if (code) {
      loginlist[`${uin}_code`] = {
        code,
        time: Date.now()
      }
    }
  } else return e.reply('获取code失败!', { reply: true })
  let url = 'https://minico.qq.com/minico/oauth20?uin=QQ%E5%AE%89%E5%85%A8%E4%B8%AD%E5%BF%83'
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      code,
      appid,
      platform: 'qq'
    })
  }
  let resultes = await fetch(url, options)
  let result = await resultes.json()
  if (result.retcode !== 0 || !result.data) {
    if (loginlist[`${uin}_code`]) delete loginlist[`${uin}_code`]
    e.reply(`code授权登录失败[${result.retcode}]，请重试！`, { reply: true })
  }
  const data = result.data
  data.token = data.minico_token
  delete data.minico_token
  delete data.expire
  let param = {
    appid,
    ...data
  }
  param = Object.keys(param).map(key => {
    return `${key}=${param[key]}`
  }).join('&')
  url = `https://minico.qq.com/minico/cgiproxy/v3_release/v3/getillegalityhistory?${param}`
  options.body = `{"com":{"src":0,"scene":1001,"platform":2,"version":"${e.bot?.adapter?.version || '8.9.85.12820'}"},"pageNum":0,"pageSize":${num}}`
  resultes = await fetch(url, options)
  result = await resultes.json()
  if (result.retcode !== 0 || !result.records) {
    e.reply(`查询失败[${result.retcode}]!`, { reply: true })
    return
  }

  if (result.totalSize < 1) {
    e.reply(`${e.msg.includes('我的') ? '账号[' + uin + ']' : '本账号'}没有违规记录！`, { reply: true })
    return true
  }

  const title = `${e.msg.includes('我的') ? '账号[' + uin + ']' : '本账号'}存在${result.totalSize}条历史违规记录`
  const MsgList = [title]
  const records = result.records
  for (const record of records) {
    const violationinfo = violationlist.find((val: { reason: any }) => {
      return val.reason === record.reason
    })
    const day = record.duration > 0 ? Math.ceil((record.duration - record.time) / 86400) + '天' : ''
    const msg = [`冻结时间：${new Date(record.time * 1000 + 28800000).toJSON().replace('T', ' ').split('.')[0]}`]
    if (violationinfo) {
      msg.push(`冻结原因：${violationinfo.reasonDesc === '' ? violationinfo.title : `因涉嫌${violationinfo.reasonDesc}被冻结${day}。`}`)
      msg.push(`冻结详情：${violationinfo.description}`)
    }
    msg.push(JSON.stringify(record))
    MsgList.push(msg.join('\n'))
  }
  const forwardMsg = common.makeForward(MsgList, e.selfId, e.bot.selfName)
  await e.bot.sendForwardMsg(e.contact, forwardMsg)
  return true
})

async function LightAppGetCode (e: Message, appid: number) {
  const body = {
    1: 3,
    2: 'V1_AND_SQ_9.0.90_1234_YYB_D',
    3: 'i=cec7510bfa5070a89b234b01d25e567a&imsi=&mac=02:00:00:00:00:00&m=ICQQ A6F1&o=0&a=0&sd=0&c64=1&sc=1&p=1080*2221&aid=cec7510bfa5070a89b234b01d25e567a&f=0675&mm=00&cf=00&cc=00&qimei=&qimei36=&sharpP=1&n=wifi&support_xsj_live=true&client_mod=default',
    4: {
      1: String(appid)
    },
    5: String(e.selfId)
  }
  if (e.bot.adapter.standard === 'onebot11') {
    // eslint-disable-next-line new-cap
    const item = new pb(body)
    const payload = await (e.bot as any).sendApi!('.send_packet', {
      command: 'LightAppSvc.mini_program_auth.GetCode',
      data: await item.encode(),
      sign: false,
    })
    const data = await item.decode(payload.result)
    return data
  }
  if (e.bot.adapter.standard === 'icqq') {
    const core = (await import('icqq')).default.core
    const payload = await (e.bot.super as Client).sendUni('LightAppSvc.mini_program_auth.GetCode', core.pb.encode(body))

    const result = core.pb.decode(payload)
    return core.pb.decode(result[4].toBuffer())[2].toString()
  }
}

// eslint-disable-next-line @stylistic/quotes
const violationdata = { LOCKTOWER_REASON_SMART_63: { reason: 63, type: 1, reasonDesc: "", title: "该QQ账号存在安全风险，已被安全保护。", description: "根据系统检测，该QQ账号存在安全风险，已被安全保护。", eDescription: "根据系统检测，该QQ账号存在安全风险，已被安全保护。", button: "申请立即解冻", link: "" }, LOCKTOWER_REASON_SMART_60: { reason: 60, type: 1, reasonDesc: "", title: "你的QQ账号因密码泄露已被系统冻结保护，请修改密码恢复使用。", description: "系统根据智能检测或人工审核等方式判断，你的QQ账号密码已经泄露。为避免产生损失，请按照系统指引修改密码。修改成功后即可解除冻结及正常使用。", eDescription: "系统根据智能检测或人工审核等方式判断，你的QQ账号密码已经泄露。为避免产生损失，请按照系统指引修改密码。修改成功后即可解除冻结及正常使用。", button: "修改密码立即解冻", link: "我的QQ账号为什么会被冻结保护？" }, LOCKTOWER_REASON_SMART_40: { reason: 40, type: 2, reasonDesc: "发布/传播违法违规信息", title: "该QQ账号暂时被冻结，无法正常登录QQ，请按照指引恢复使用。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌发布/传播违法违规信息，已被暂时冻结QQ登录。请后续注册或使用QQ账号时遵守《QQ号码规则》和互联网相关法律法规。", eDescription: "该账号因涉嫌发布/传播违法违规信息，违反了国家法规政策和《QQ号码规则》中“内容规范”的相关规定，且该账号已于XXXX年X月X日收到QQ安全提醒并承诺不再违规。由于未遵守承诺再次违规，该账号现已被暂时冻结QQ登录。", button: "申请立即解冻", link: "哪些情况会导致账号被冻结？" }, LOCKTOWER_REASON_SMART_33: { reason: 33, type: 2, reasonDesc: "", title: "你的QQ账号因存在高被盗风险已被系统冻结保护，请修改密码恢复使用。", description: "系统根据智能检测或人工审核等方式判断，你的QQ账号密码已经泄露。为避免产生损失，请按照系统指引修改密码。修改成功后即可解除冻结及正常使用。", eDescription: "系统根据智能检测或人工审核等方式判断，你的QQ账号密码已经泄露。为避免产生损失，请按照系统指引修改密码。修改成功后即可解除冻结及正常使用。", button: "修改密码立即解冻", link: "我的QQ账号为什么会被冻结保护？" }, LOCKTOWER_REASON_SMART_42: { reason: 42, type: 2, reasonDesc: "", title: "你的QQ账号因存在高被盗风险已被系统冻结保护，请修改密码恢复使用。", description: "系统根据智能检测或人工审核等方式判断，你的QQ账号密码已经泄露。为避免产生损失，请按照系统指引修改密码。修改成功后即可解除冻结及正常使用。", eDescription: "系统根据智能检测或人工审核等方式判断，你的QQ账号密码已经泄露。为避免产生损失，请按照系统指引修改密码。修改成功后即可解除冻结及正常使用。", button: "修改密码立即解冻", link: "我的QQ账号为什么会被冻结保护？" }, LOCKTOWER_REASON_SMART_10: { reason: 10, type: 3, reasonDesc: "", title: "该QQ账号暂时被冻结，无法正常登录QQ。", description: "该QQ账号因启动号码保护被暂时冻结，请按照系统指引解除冻结。", eDescription: "该QQ账号因启动号码保护被暂时冻结，请按照系统指引解除冻结。", button: "申请立即解冻", link: "我的QQ账号为什么会被冻结保护？" }, LOCKTOWER_REASON_SMART_21: { reason: 21, type: 3, reasonDesc: "", title: "该QQ账号暂时被冻结，无法正常登录及使用QQ。", description: "该QQ账号因被用户暂时冻结，已进入保护模式，请按照系统指引修改密码。修改成功后方可解除冻结及正常使用。", eDescription: "该QQ账号因被用户暂时冻结，已进入保护模式，请按照系统指引修改密码。修改成功后方可解除冻结及正常使用。", button: "申请立即解冻", link: "我的QQ账号为什么会被冻结保护？" }, LOCKTOWER_REASON_SMART_27: { reason: 27, type: 3, reasonDesc: "", title: "该QQ账号暂时被冻结，无法正常登录及使用QQ。", description: "该QQ账号因用户申请注销被暂时冻结", eDescription: "该QQ账号因用户申请注销被暂时冻结", button: "申请立即解冻", link: "我的QQ账号为什么会被冻结保护？" }, LOCKTOWER_REASON_SMART_1: { reason: 1, type: 4, reasonDesc: "发布/传播违法违规信息", title: "该QQ账号暂时被冻结，无法正常登录QQ，请按照指引恢复使用。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌发布/传播违法违规信息，已被暂时冻结QQ登录。请后续注册或使用QQ账号时遵守《QQ号码规则》和互联网相关法律法规。", eDescription: "该账号因涉嫌发布/传播违法违规信息，违反了国家法规政策和《QQ号码规则》中“内容规范”的相关规定，且该账号已于XXXX年X月X日收到QQ安全提醒并承诺不再违规。由于未遵守承诺再次违规，该账号现已被暂时冻结QQ登录。", forever: { title: "该QQ账号已被永久冻结，无法正常登录QQ。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌发布/传播违法违规信息，已被永久冻结QQ登录。" }, button: "申请立即解冻", link: "哪些情况会导致账号被冻结？" }, LOCKTOWER_REASON_SMART_2: { reason: 2, type: 4, reasonDesc: "异常添加好友", title: "该QQ账号暂时被冻结，无法正常登录QQ，请按照指引恢复使用。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌异常添加好友，已被暂时冻结QQ登录。请后续注册或使用QQ账号时遵守《QQ号码规则》和互联网相关法律法规。", eDescription: "该账号因涉嫌异常添加好友，违反了国家法规政策和《QQ号码规则》中“内容规范”的相关规定，且该账号已于XXXX年X月X日收到QQ安全提醒并承诺不再违规。由于未遵守承诺再次违规，该账号现已被暂时冻结QQ登录。", forever: { title: "该QQ账号已被永久冻结，无法正常登录QQ。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌异常添加好友，已被永久冻结QQ登录。" }, button: "申请立即解冻", link: "哪些情况会导致账号被冻结？" }, LOCKTOWER_REASON_SMART_3: { reason: 3, type: 4, reasonDesc: "违规注册QQ账号", title: "该QQ账号暂时被冻结，无法正常登录QQ，请按照指引恢复使用。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌违规注册QQ账号已被暂时冻结QQ登录。请后续注册或使用QQ账号时遵守《QQ号码规则》和互联网相关法律法规。", eDescription: "该账号因涉嫌违规注册QQ账号，违反了国家法规政策和《QQ号码规则》中“内容规范”的相关规定，且该账号已于XXXX年X月X日收到QQ安全提醒并承诺不再违规。由于未遵守承诺再次违规，该账号现已被暂时冻结QQ登录。", forever: { title: "该QQ账号已被永久冻结，无法正常登录QQ。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌违规注册QQ账号已被永久冻结QQ登录。" }, button: "申请立即解冻", link: "哪些情况会导致账号被冻结？" }, LOCKTOWER_REASON_SMART_4: { reason: 4, type: 4, reasonDesc: "传播色情、暴力、敏感信息或组织相关活动", title: "该QQ账号暂时被冻结，无法正常登录QQ，请按照指引恢复使用。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌传播色情、暴力、敏感信息或组织相关活动已被暂时冻结QQ登录。请后续注册或使用QQ账号时遵守《QQ号码规则》和互联网相关法律法规。", eDescription: "该账号因涉嫌传播色情、暴力、敏感信息或组织相关活动，违反了国家法规政策和《QQ号码规则》中“内容规范”的相关规定，且该账号已于XXXX年X月X日收到QQ安全提醒并承诺不再违规。由于未遵守承诺再次违规，该账号现已被暂时冻结QQ登录。", forever: { title: "该QQ账号已被永久冻结，无法正常登录QQ。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌传播色情、暴力、敏感信息或组织相关活动已被永久冻结QQ登录。" }, button: "申请立即解冻", link: "哪些情况会导致账号被冻结？" }, LOCKTOWER_REASON_SMART_5: { reason: 5, type: 4, reasonDesc: "传播违法违规信息", title: "该QQ账号暂时被冻结，无法正常登录QQ，请按照指引恢复使用。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌传播违法违规信息已被暂时冻结QQ登录。请后续注册或使用QQ账号时遵守《QQ号码规则》和互联网相关法律法规。", eDescription: "该账号因涉嫌传播违法违规信息，违反了国家法规政策和《QQ号码规则》中“内容规范”的相关规定，且该账号已于XXXX年X月X日收到QQ安全提醒并承诺不再违规。由于未遵守承诺再次违规，该账号现已被暂时冻结QQ登录。", forever: { title: "该QQ账号已被永久冻结，无法正常登录QQ。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌传播违法违规信息已被永久冻结QQ登录。" }, button: "申请立即解冻", link: "哪些情况会导致账号被冻结？" }, LOCKTOWER_REASON_SMART_6: { reason: 6, type: 4, reasonDesc: "传播违法违规信息", title: "该QQ账号暂时被冻结，无法正常登录QQ，请按照指引恢复使用。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌传播违法违规信息已被暂时冻结QQ登录。请后续注册或使用QQ账号时遵守《QQ号码规则》和互联网相关法律法规。", eDescription: "该账号因涉嫌传播违法违规信息，违反了国家法规政策和《QQ号码规则》中“内容规范”的相关规定，且该账号已于XXXX年X月X日收到QQ安全提醒并承诺不再违规。由于未遵守承诺再次违规，该账号现已被暂时冻结QQ登录。", forever: { title: "该QQ账号已被永久冻结，无法正常登录QQ。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌传播违法违规信息已被永久冻结QQ登录。" }, button: "申请立即解冻", link: "哪些情况会导致账号被冻结？" }, LOCKTOWER_REASON_SMART_28: { reason: 28, type: 4, reasonDesc: "传播违法违规信息", title: "该QQ账号暂时被冻结，无法正常登录QQ，请按照指引恢复使用。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌传播违法违规信息已被暂时冻结QQ登录。请后续注册或使用QQ账号时遵守《QQ号码规则》和互联网相关法律法规。", eDescription: "该账号因涉嫌传播违法违规信息，违反了国家法规政策和《QQ号码规则》中“内容规范”的相关规定，且该账号已于XXXX年X月X日收到QQ安全提醒并承诺不再违规。由于未遵守承诺再次违规，该账号现已被暂时冻结QQ登录。", forever: { title: "该QQ账号已被永久冻结，无法正常登录QQ。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌传播违法违规信息已被永久冻结QQ登录。" }, button: "申请立即解冻", link: "哪些情况会导致账号被冻结？" }, LOCKTOWER_REASON_SMART_7: { reason: 7, type: 4, reasonDesc: "传播诈骗信息或涉嫌诈骗行为", title: "该QQ账号暂时被冻结，无法正常登录QQ，请按照指引恢复使用。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌传播诈骗信息或涉嫌诈骗行为已被暂时冻结QQ登录。请后续注册或使用QQ账号时遵守《QQ号码规则》和互联网相关法律法规。", eDescription: "该账号因涉嫌传播诈骗信息或涉嫌诈骗行为，违反了国家法规政策和《QQ号码规则》中“内容规范”的相关规定，且该账号已于XXXX年X月X日收到QQ安全提醒并承诺不再违规。由于未遵守承诺再次违规，该账号现已被暂时冻结QQ登录。", forever: { title: "该QQ账号已被永久冻结，无法正常登录QQ。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌传播诈骗信息或涉嫌诈骗行为已被永久冻结QQ登录。" }, button: "申请立即解冻", link: "哪些情况会导致账号被冻结？" }, LOCKTOWER_REASON_SMART_12: { reason: 12, type: 4, reasonDesc: "传播诈骗信息或涉嫌诈骗行为", title: "该QQ账号暂时被冻结，无法正常登录QQ，请按照指引恢复使用。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌诈骗信息或涉嫌诈骗行为已被暂时冻结QQ登录。请后续注册或使用QQ账号时遵守《QQ号码规则》和互联网相关法律法规。", eDescription: "该账号因涉嫌传播诈骗信息或涉嫌诈骗行为，违反了国家法规政策和《QQ号码规则》中“内容规范”的相关规定，且该账号已于XXXX年X月X日收到QQ安全提醒并承诺不再违规。由于未遵守承诺再次违规，该账号现已被暂时冻结QQ登录。", forever: { title: "该QQ账号已被永久冻结，无法正常登录QQ。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌诈骗信息或涉嫌诈骗行为已被永久冻结QQ登录。" }, button: "申请立即解冻", link: "哪些情况会导致账号被冻结？" }, LOCKTOWER_REASON_SMART_13: { reason: 13, type: 4, reasonDesc: "传播诈骗信息或涉嫌诈骗行为", title: "该QQ账号暂时被冻结，无法正常登录QQ，请按照指引恢复使用。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌诈骗信息或涉嫌诈骗行为已被暂时冻结QQ登录。请后续注册或使用QQ账号时遵守《QQ号码规则》和互联网相关法律法规。", eDescription: "该账号因涉嫌传播诈骗信息或涉嫌诈骗行为，违反了国家法规政策和《QQ号码规则》中“内容规范”的相关规定，且该账号已于XXXX年X月X日收到QQ安全提醒并承诺不再违规。由于未遵守承诺再次违规，该账号现已被暂时冻结QQ登录。", forever: { title: "该QQ账号已被永久冻结，无法正常登录QQ。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌诈骗信息或涉嫌诈骗行为已被永久冻结QQ登录。" }, button: "申请立即解冻", link: "哪些情况会导致账号被冻结？" }, LOCKTOWER_REASON_SMART_14: { reason: 14, type: 4, reasonDesc: "传播诈骗信息或涉嫌诈骗行为", title: "该QQ账号暂时被冻结，无法正常登录QQ，请按照指引恢复使用。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌诈骗信息或涉嫌诈骗行为已被暂时冻结QQ登录。请后续注册或使用QQ账号时遵守《QQ号码规则》和互联网相关法律法规。", eDescription: "该账号因涉嫌传播诈骗信息或涉嫌诈骗行为，违反了国家法规政策和《QQ号码规则》中“内容规范”的相关规定，且该账号已于XXXX年X月X日收到QQ安全提醒并承诺不再违规。由于未遵守承诺再次违规，该账号现已被暂时冻结QQ登录。", forever: { title: "该QQ账号已被永久冻结，无法正常登录QQ。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌诈骗信息或涉嫌诈骗行为已被永久冻结QQ登录。" }, button: "申请立即解冻", link: "哪些情况会导致账号被冻结？" }, LOCKTOWER_REASON_SMART_8: { reason: 8, type: 4, reasonDesc: "发布/传播违法违规交易信息或组织相关活动", title: "该QQ账号暂时被冻结，无法正常登录QQ，请按照指引恢复使用。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌发布/传播违法违规交易信息或组织相关活动已被暂时冻结QQ登录。请后续注册或使用QQ账号时遵守《QQ号码规则》和互联网相关法律法规。", eDescription: "该账号因涉嫌发布/传播违法违规交易信息或组织相关活动，违反了国家法规政策和《QQ号码规则》中“内容规范”的相关规定，且该账号已于XXXX年X月X日收到QQ安全提醒并承诺不再违规。由于未遵守承诺再次违规，该账号现已被暂时冻结QQ登录。", forever: { title: "该QQ账号已被永久冻结，无法正常登录QQ。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌涉嫌发布/传播违法违规交易信息或组织相关活动已被永久冻结QQ登录。" }, button: "申请立即解冻", link: "哪些情况会导致账号被冻结？" }, LOCKTOWER_REASON_SMART_9: { reason: 9, type: 4, reasonDesc: "传播违法违规信息", title: "该QQ账号暂时被冻结，无法正常登录QQ，请按照指引恢复使用。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌传播违法违规信息已被暂时冻结QQ登录。请后续注册或使用QQ账号时遵守《QQ号码规则》和互联网相关法律法规。", eDescription: "该账号因涉嫌传播违法违规信息，违反了国家法规政策和《QQ号码规则》中“内容规范”的相关规定，且该账号已于XXXX年X月X日收到QQ安全提醒并承诺不再违规。由于未遵守承诺再次违规，该账号现已被暂时冻结QQ登录。", forever: { title: "该QQ账号已被永久冻结，无法正常登录QQ。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌传播违法违规信息已被永久冻结QQ登录。" }, button: "申请立即解冻", link: "哪些情况会导致账号被冻结？" }, LOCKTOWER_REASON_SMART_11: { reason: 11, type: 4, reasonDesc: "业务违规操作（如批量登录等）", title: "该QQ账号暂时被冻结，无法正常登录QQ，请按照指引恢复使用。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌业务违规操作（如批量登录等）已被暂时冻结QQ登录。请后续注册或使用QQ账号时遵守《QQ号码规则》和互联网相关法律法规。", eDescription: "该账号因涉嫌业务违规操作（如批量登录等），违反了国家法规政策和《QQ号码规则》中“内容规范”的相关规定，且该账号已于XXXX年X月X日收到QQ安全提醒并承诺不再违规。由于未遵守承诺再次违规，该账号现已被暂时冻结QQ登录。", forever: { title: "该QQ账号已被永久冻结，无法正常登录QQ。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌业务违规操作（如批量登录等）已被永久冻结QQ登录。" }, button: "申请立即解冻", link: "哪些情况会导致账号被冻结？" }, LOCKTOWER_REASON_SMART_15: { reason: 15, type: 4, reasonDesc: "业务违规操作（如批量登录等）", title: "该QQ账号暂时被冻结，无法正常登录QQ，请按照指引恢复使用。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌业务违规操作（如批量登录等）已被暂时冻结QQ登录。请后续注册或使用QQ账号时遵守《QQ号码规则》和互联网相关法律法规。", eDescription: "该账号因涉嫌业务违规操作（如批量登录等），违反了国家法规政策和《QQ号码规则》中“内容规范”的相关规定，且该账号已于XXXX年X月X日收到QQ安全提醒并承诺不再违规。由于未遵守承诺再次违规，该账号现已被暂时冻结QQ登录。", forever: { title: "该QQ账号已被永久冻结，无法正常登录QQ。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌业务违规操作（如批量登录等）已被永久冻结QQ登录。" }, button: "申请立即解冻", link: "哪些情况会导致账号被冻结？" }, LOCKTOWER_REASON_SMART_20: { reason: 20, type: 4, reasonDesc: "异常使用行为（如涉嫌批量登录等业务违规操作、传播违法违规信息或组织相关活动）", title: "该QQ账号暂时被冻结，无法正常登录QQ，请按照指引恢复使用。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因存在异常使用行为（如涉嫌批量登录等业务违规操作、传播违法违规信息或组织相关活动），已被暂时冻结QQ登录。请后续注册或使用QQ账号时遵守《QQ号码规则》和互联网相关法律法规。", eDescription: "该账号因涉嫌异常使用行为（如涉嫌批量登录等业务违规操作、传播违法违规信息或组织相关活动），违反了国家法规政策和《QQ号码规则》中“内容规范”的相关规定，且该账号已于XXXX年X月X日收到QQ安全提醒并承诺不再违规。由于未遵守承诺再次违规，该账号现已被暂时冻结QQ登录。", forever: { title: "该QQ账号已被永久冻结，无法正常登录QQ。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因存在异常使用行为（如涉嫌批量登录等业务违规操作、传播违法违规信息或组织相关活动）已被永久冻结QQ登录。" }, button: "申请立即解冻", link: "哪些情况会导致账号被冻结？" }, LOCKTOWER_REASON_SMART_29: { reason: 29, type: 4, reasonDesc: "业务违规操作（如批量登录等）", title: "该QQ账号暂时被冻结，无法正常登录QQ，请按照指引恢复使用。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌业务违规操作（如批量登录等）已被暂时冻结QQ登录。请后续注册或使用QQ账号时遵守《QQ号码规则》和互联网相关法律法规。", eDescription: "该账号因涉嫌业务违规操作（如批量登录等），违反了国家法规政策和《QQ号码规则》中“内容规范”的相关规定，且该账号已于XXXX年X月X日收到QQ安全提醒并承诺不再违规。由于未遵守承诺再次违规，该账号现已被暂时冻结QQ登录。", forever: { title: "该QQ账号已被永久冻结，无法正常登录QQ。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌业务违规操作（如批量登录等）已被永久冻结QQ登录。" }, button: "申请立即解冻", link: "哪些情况会导致账号被冻结？" }, LOCKTOWER_REASON_SMART_30: { reason: 30, type: 4, reasonDesc: "异常使用行为（如涉嫌批量登录等业务违规操作、传播违法违规信息或组织相关活动）", title: "该QQ账号暂时被冻结，无法正常登录QQ，请按照指引恢复使用。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因存在异常使用行为（如涉嫌批量登录等业务违规操作、传播违法违规信息或组织相关活动），已被暂时冻结QQ登录。请后续注册或使用QQ账号时遵守《QQ号码规则》和互联网相关法律法规。", eDescription: "该账号因涉嫌异常使用行为（如涉嫌批量登录等业务违规操作、传播违法违规信息或组织相关活动），违反了国家法规政策和《QQ号码规则》中“内容规范”的相关规定，且该账号已于XXXX年X月X日收到QQ安全提醒并承诺不再违规。由于未遵守承诺再次违规，该账号现已被暂时冻结QQ登录。", forever: { title: "该QQ账号已被永久冻结，无法正常登录QQ。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因存在异常使用行为（如涉嫌批量登录等业务违规操作、传播违法违规信息或组织相关活动）已被永久冻结QQ登录。" }, button: "申请立即解冻", link: "哪些情况会导致账号被冻结？" }, LOCKTOWER_REASON_SMART_31: { reason: 31, type: 4, reasonDesc: "异常使用行为（如涉嫌批量登录等业务违规操作、传播违法违规信息或组织相关活动）", title: "该QQ账号暂时被冻结，无法正常登录QQ，请按照指引恢复使用。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因存在异常使用行为（如涉嫌批量登录等业务违规操作、传播违法违规信息或组织相关活动），已被暂时冻结QQ登录。请后续注册或使用QQ账号时遵守《QQ号码规则》和互联网相关法律法规。", eDescription: "该账号因涉嫌异常使用行为（如涉嫌批量登录等业务违规操作、传播违法违规信息或组织相关活动），违反了国家法规政策和《QQ号码规则》中“内容规范”的相关规定，且该账号已于XXXX年X月X日收到QQ安全提醒并承诺不再违规。由于未遵守承诺再次违规，该账号现已被暂时冻结QQ登录。", forever: { title: "该QQ账号已被永久冻结，无法正常登录QQ。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因存在异常使用行为（如涉嫌批量登录等业务违规操作、传播违法违规信息或组织相关活动）已被永久冻结QQ登录。" }, button: "申请立即解冻", link: "哪些情况会导致账号被冻结？" }, LOCKTOWER_REASON_SMART_22: { reason: 22, type: 4, reasonDesc: "使用恶意插件", title: "该QQ账号暂时被冻结，无法正常登录QQ，请按照指引恢复使用。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌使用恶意插件已被暂时冻结QQ登录。请后续注册或使用QQ账号时遵守《QQ号码规则》和互联网相关法律法规。", eDescription: "该账号因涉嫌使用恶意插件，违反了国家法规政策和《QQ号码规则》中“内容规范”的相关规定，且该账号已于XXXX年X月X日收到QQ安全提醒并承诺不再违规。由于未遵守承诺再次违规，该账号现已被暂时冻结QQ登录。", forever: { title: "该QQ账号已被永久冻结，无法正常登录QQ。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌使用恶意插件已被永久冻结QQ登录。" }, button: "申请立即解冻", link: "哪些情况会导致账号被冻结？" }, LOCKTOWER_REASON_SMART_23: { reason: 23, type: 4, reasonDesc: "使用恶意插件", title: "该QQ账号暂时被冻结，无法正常登录QQ，请按照指引恢复使用。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌使用恶意插件已被暂时冻结QQ登录。请后续注册或使用QQ账号时遵守《QQ号码规则》和互联网相关法律法规。", eDescription: "该账号因涉嫌使用恶意插件，违反了国家法规政策和《QQ号码规则》中“内容规范”的相关规定，且该账号已于XXXX年X月X日收到QQ安全提醒并承诺不再违规。由于未遵守承诺再次违规，该账号现已被暂时冻结QQ登录。", forever: { title: "该QQ账号已被永久冻结，无法正常登录QQ。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌使用恶意插件已被永久冻结QQ登录。" }, button: "申请立即解冻", link: "哪些情况会导致账号被冻结？" }, LOCKTOWER_REASON_SMART_24: { reason: 24, type: 4, reasonDesc: "存在违法违规行为", title: "该QQ账号暂时被冻结，无法正常登录QQ，请按照指引恢复使用。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌存在违法违规行为已被暂时冻结QQ登录。请后续注册或使用QQ账号时遵守《QQ号码规则》和互联网相关法律法规。", eDescription: "该账号因涉嫌存在违法违规行为，违反了国家法规政策和《QQ号码规则》中“内容规范”的相关规定，且该账号已于XXXX年X月X日收到QQ安全提醒并承诺不再违规。由于未遵守承诺再次违规，该账号现已被暂时冻结QQ登录。", forever: { title: "该QQ账号已被永久冻结，无法正常登录QQ。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌存在违法违规行为已被永久冻结QQ登录。" }, button: "申请立即解冻", link: "哪些情况会导致账号被冻结？" }, LOCKTOWER_REASON_SMART_32: { reason: 32, type: 4, reasonDesc: "使用抢红包插件", title: "该QQ账号暂时被冻结，无法正常登录QQ，请按照指引恢复使用。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌使用抢红包插件已被暂时冻结QQ登录。请后续注册或使用QQ账号时遵守《QQ号码规则》和互联网相关法律法规。", eDescription: "该账号因涉嫌使用抢红包插件，违反了国家法规政策和《QQ号码规则》中“内容规范”的相关规定，且该账号已于XXXX年X月X日收到QQ安全提醒并承诺不再违规。由于未遵守承诺再次违规，该账号现已被暂时冻结QQ登录。", forever: { title: "该QQ账号已被永久冻结，无法正常登录QQ。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌使用抢红包插件已被永久冻结QQ登录。" }, button: "申请立即解冻", link: "哪些情况会导致账号被冻结？" }, LOCKTOWER_REASON_SMART_34: { reason: 34, type: 4, reasonDesc: "进行异常操作行为", title: "该QQ账号暂时被冻结，无法正常登录QQ，请按照指引恢复使用。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌进行异常操作行为已被暂时冻结QQ登录。请后续注册或使用QQ账号时遵守《QQ号码规则》和互联网相关法律法规。", eDescription: "该账号因涉嫌进行异常操作行为，违反了国家法规政策和《QQ号码规则》中“内容规范”的相关规定，且该账号已于XXXX年X月X日收到QQ安全提醒并承诺不再违规。由于未遵守承诺再次违规，该账号现已被暂时冻结QQ登录。", forever: { title: "该QQ账号已被永久冻结，无法正常登录QQ。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌进行异常操作行为已被永久冻结QQ登录。" }, button: "申请立即解冻", link: "哪些情况会导致账号被冻结？" }, LOCKTOWER_REASON_SMART_41: { reason: 41, type: 4, reasonDesc: "违反相关法律法规或用户协议等", title: "该QQ账号暂时被冻结，无法正常登录QQ，请按照指引恢复使用。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌违反相关法律法规或用户协议等已被暂时冻结QQ登录。请后续注册或使用QQ账号时遵守《QQ号码规则》和互联网相关法律法规。", eDescription: "该账号因涉嫌违反相关法律法规或用户协议等，违反了国家法规政策和《QQ号码规则》中“内容规范”的相关规定，且该账号已于XXXX年X月X日收到QQ安全提醒并承诺不再违规。由于未遵守承诺再次违规，该账号现已被暂时冻结QQ登录。", forever: { title: "该QQ账号已被永久冻结，无法正常登录QQ。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌违反相关法律法规或用户协议等已被永久冻结QQ登录。" }, button: "申请立即解冻", link: "哪些情况会导致账号被冻结？" }, LOCKTOWER_REASON_SMART_43: { reason: 43, type: 4, reasonDesc: "发布/传播诈骗信息或涉嫌诈骗行为", title: "该QQ账号暂时被冻结，无法正常登录QQ，请按照指引恢复使用。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌发布/传播诈骗信息或涉嫌诈骗行为已被暂时冻结QQ登录。请后续注册或使用QQ账号时遵守《QQ号码规则》和互联网相关法律法规。", eDescription: "该账号因涉嫌发布/传播诈骗信息或涉嫌诈骗行为，违反了国家法规政策和《QQ号码规则》中“内容规范”的相关规定，且该账号已于XXXX年X月X日收到QQ安全提醒并承诺不再违规。由于未遵守承诺再次违规，该账号现已被暂时冻结QQ登录。", forever: { title: "该QQ账号已被永久冻结，无法正常登录QQ。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌发布/传播诈骗信息或涉嫌诈骗行为已被永久冻结QQ登录。" }, button: "申请立即解冻", link: "哪些情况会导致账号被冻结？" }, LOCKTOWER_REASON_SMART_44: { reason: 44, type: 4, reasonDesc: "涉嫌色情、暴力、敏感信息或组织相关活动", title: "该QQ账号暂时被冻结，无法正常登录QQ，请按照指引恢复使用。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌传播色情、暴力、敏感信息或组织相关活动已被暂时冻结QQ登录。请后续注册或使用QQ账号时遵守《QQ号码规则》和互联网相关法律法规。", eDescription: "该账号因涉嫌传播色情、暴力、敏感信息或组织相关活动，违反了国家法规政策和《QQ号码规则》中“内容规范”的相关规定，且该账号已于XXXX年X月X日收到QQ安全提醒并承诺不再违规。由于未遵守承诺再次违规，该账号现已被暂时冻结QQ登录。", forever: { title: "该QQ账号已被永久冻结，无法正常登录QQ。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌传播色情、暴力、敏感信息或组织相关活动已被永久冻结QQ登录。" }, button: "申请立即解冻", link: "哪些情况会导致账号被冻结？" }, LOCKTOWER_REASON_SMART_45: { reason: 45, type: 4, reasonDesc: "传播诋毁、辱骂等信息", title: "该QQ账号暂时被冻结，无法正常登录QQ，请按照指引恢复使用。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌传播诋毁、辱骂等信息已被暂时冻结QQ登录。请后续注册或使用QQ账号时遵守《QQ号码规则》和互联网相关法律法规。", eDescription: "该账号因涉嫌传播诋毁、辱骂等信息，违反了国家法规政策和《QQ号码规则》中“内容规范”的相关规定，且该账号已于XXXX年X月X日收到QQ安全提醒并承诺不再违规。由于未遵守承诺再次违规，该账号现已被暂时冻结QQ登录。", forever: { title: "该QQ账号已被永久冻结，无法正常登录QQ。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌传播诋毁、辱骂等信息已被永久冻结QQ登录。" }, button: "申请立即解冻", link: "哪些情况会导致账号被冻结？" }, LOCKTOWER_REASON_SMART_46: { reason: 46, type: 4, reasonDesc: "传播赌博信息或组织相关活动", title: "该QQ账号暂时被冻结，无法正常登录QQ，请按照指引恢复使用。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌传播赌博信息或组织相关活动已被暂时冻结QQ登录。请后续注册或使用QQ账号时遵守《QQ号码规则》和互联网相关法律法规。", eDescription: "该账号因涉嫌传播赌博信息或组织相关活动，违反了国家法规政策和《QQ号码规则》中“内容规范”的相关规定，且该账号已于XXXX年X月X日收到QQ安全提醒并承诺不再违规。由于未遵守承诺再次违规，该账号现已被暂时冻结QQ登录。", forever: { title: "该QQ账号已被永久冻结，无法正常登录QQ。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌传播赌博信息或组织相关活动已被永久冻结QQ登录。" }, button: "申请立即解冻", link: "哪些情况会导致账号被冻结？" }, LOCKTOWER_REASON_SMART_47: { reason: 47, type: 4, reasonDesc: "发布违禁品及相关信息", title: "该QQ账号暂时被冻结，无法正常登录QQ，请按照指引恢复使用。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌发布违禁品及相关信息已被暂时冻结QQ登录。请后续注册或使用QQ账号时遵守《QQ号码规则》和互联网相关法律法规。", eDescription: "该账号因涉嫌发布违禁品及相关信息，违反了国家法规政策和《QQ号码规则》中“内容规范”的相关规定，且该账号已于XXXX年X月X日收到QQ安全提醒并承诺不再违规。由于未遵守承诺再次违规，该账号现已被暂时冻结QQ登录。", forever: { title: "该QQ账号已被永久冻结，无法正常登录QQ。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌发布违禁品及相关信息已被永久冻结QQ登录。" }, button: "申请立即解冻", link: "哪些情况会导致账号被冻结？" }, LOCKTOWER_REASON_SMART_48: { reason: 48, type: 4, reasonDesc: "传播不良信息或组织相关活动", title: "该QQ账号暂时被冻结，无法正常登录QQ，请按照指引恢复使用。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌传播不良信息或组织相关活动已被暂时冻结QQ登录。请后续注册或使用QQ账号时遵守《QQ号码规则》和互联网相关法律法规。", eDescription: "该账号因涉嫌传播不良信息或组织相关活动，违反了国家法规政策和《QQ号码规则》中“内容规范”的相关规定，且该账号已于XXXX年X月X日收到QQ安全提醒并承诺不再违规。由于未遵守承诺再次违规，该账号现已被暂时冻结QQ登录。", forever: { title: "该QQ账号已被永久冻结，无法正常登录QQ。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌传播不良信息或组织相关活动已被永久冻结QQ登录。" }, button: "申请立即解冻", link: "哪些情况会导致账号被冻结？" }, LOCKTOWER_REASON_SMART_49: { reason: 49, type: 4, reasonDesc: "传播不良信息或组织相关活动", title: "该QQ账号暂时被冻结，无法正常登录QQ，请按照指引恢复使用。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌发布/传播不实信息或组织相关活动已被暂时冻结QQ登录。请后续注册或使用QQ账号时遵守《QQ号码规则》和互联网相关法律法规。", eDescription: "该账号因涉嫌传播不良信息或组织相关活动，违反了国家法规政策和《QQ号码规则》中“内容规范”的相关规定，且该账号已于XXXX年X月X日收到QQ安全提醒并承诺不再违规。由于未遵守承诺再次违规，该账号现已被暂时冻结QQ登录。", forever: { title: "该QQ账号已被永久冻结，无法正常登录QQ。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌发布/传播不实信息或组织相关活动已被永久冻结QQ登录。" }, button: "申请立即解冻", link: "哪些情况会导致账号被冻结？" }, LOCKTOWER_REASON_SMART_50: { reason: 50, type: 4, reasonDesc: "发布/传播诋毁、辱骂等侵权信息或组织相关活动", title: "该QQ账号暂时被冻结，无法正常登录QQ，请按照指引恢复使用。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌发布/传播诋毁、辱骂等侵权信息或组织相关活动已被暂时冻结QQ登录。请后续注册或使用QQ账号时遵守《QQ号码规则》和互联网相关法律法规。", eDescription: "该账号因涉嫌发布/传播诋毁、辱骂等侵权信息或组织相关活动，违反了国家法规政策和《QQ号码规则》中“内容规范”的相关规定，且该账号已于XXXX年X月X日收到QQ安全提醒并承诺不再违规。由于未遵守承诺再次违规，该账号现已被暂时冻结QQ登录。", forever: { title: "该QQ账号已被永久冻结，无法正常登录QQ。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌发布/传播诋毁、辱骂等侵权信息或组织相关活动已被永久冻结QQ登录。" }, button: "申请立即解冻", link: "哪些情况会导致账号被冻结？" }, LOCKTOWER_REASON_SMART_51: { reason: 51, type: 4, reasonDesc: "发布/传播诋毁、辱骂等侵权信息或组织相关活动", title: "该QQ账号暂时被冻结，无法正常登录QQ，请按照指引恢复使用。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌发布/传播诋毁、辱骂等侵权信息或组织相关活动已被暂时冻结QQ登录。请后续注册或使用QQ账号时遵守《QQ号码规则》和互联网相关法律法规。", eDescription: "该账号因涉嫌发布/传播诋毁、辱骂等侵权信息或组织相关活动，违反了国家法规政策和《QQ号码规则》中“内容规范”的相关规定，且该账号已于XXXX年X月X日收到QQ安全提醒并承诺不再违规。由于未遵守承诺再次违规，该账号现已被暂时冻结QQ登录。", forever: { title: "该QQ账号已被永久冻结，无法正常登录QQ。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌发布/传播诋毁、辱骂等侵权信息或组织相关活动已被永久冻结QQ登录。" }, button: "申请立即解冻", link: "哪些情况会导致账号被冻结？" }, LOCKTOWER_REASON_SMART_52: { reason: 52, type: 4, reasonDesc: "发布/传播知识产权侵权信息", title: "该QQ账号暂时被冻结，无法正常登录QQ，请按照指引恢复使用。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌发布/传播知识产权侵权信息已被暂时冻结QQ登录。请后续注册或使用QQ账号时遵守《QQ号码规则》和互联网相关法律法规。", eDescription: "该账号因涉嫌发布/传播知识产权侵权信息，违反了国家法规政策和《QQ号码规则》中“内容规范”的相关规定，且该账号已于XXXX年X月X日收到QQ安全提醒并承诺不再违规。由于未遵守承诺再次违规，该账号现已被暂时冻结QQ登录。", forever: { title: "该QQ账号已被永久冻结，无法正常登录QQ。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌发布/传播知识产权侵权信息已被永久冻结QQ登录。" }, button: "申请立即解冻", link: "哪些情况会导致账号被冻结？" }, LOCKTOWER_REASON_SMART_53: { reason: 53, type: 4, reasonDesc: "发布/传播侵犯他人隐私权、肖像权、名誉权、姓名权、名称权等侵权信息", title: "该QQ账号暂时被冻结，无法正常登录QQ，请按照指引恢复使用。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌发布/传播侵犯他人隐私权、肖像权、名誉权、姓名权、名称权等侵权信息已被暂时冻结QQ登录。请后续注册或使用QQ账号时遵守《QQ号码规则》和互联网相关法律法规。", eDescription: "该账号因涉嫌发布/传播侵犯他人隐私权、肖像权、名誉权、姓名权、名称权等侵权信息，违反了国家法规政策和《QQ号码规则》中“内容规范”的相关规定，且该账号已于XXXX年X月X日收到QQ安全提醒并承诺不再违规。由于未遵守承诺再次违规，该账号现已被暂时冻结QQ登录。", forever: { title: "该QQ账号已被永久冻结，无法正常登录QQ。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌发布/传播侵犯他人隐私权、肖像权、名誉权、姓名权、名称权等侵权信息已被永久冻结QQ登录。" }, button: "申请立即解冻", link: "哪些情况会导致账号被冻结？" }, LOCKTOWER_REASON_SMART_54: { reason: 54, type: 4, reasonDesc: "传播违法违规信息或存在违法违规行为", title: "该QQ账号暂时被冻结，无法正常登录QQ，请按照指引恢复使用。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌传播违法违规信息或存在违法违规行为已被暂时冻结QQ登录。请后续注册或使用QQ账号时遵守《QQ号码规则》和互联网相关法律法规。", eDescription: "该账号因涉嫌传播违法违规信息或存在违法违规行为，违反了国家法规政策和《QQ号码规则》中“内容规范”的相关规定，且该账号已于XXXX年X月X日收到QQ安全提醒并承诺不再违规。由于未遵守承诺再次违规，该账号现已被暂时冻结QQ登录。", forever: { title: "该QQ账号已被永久冻结，无法正常登录QQ。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌传播违法违规信息或存在违法违规行为已被永久冻结QQ登录。" }, button: "申请立即解冻", link: "哪些情况会导致账号被冻结？" }, LOCKTOWER_REASON_SMART_55: { reason: 55, type: 4, reasonDesc: "进行资金盗用等违法违规行为", title: "该QQ账号暂时被冻结，无法正常登录QQ，请按照指引恢复使用。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌进行资金盗用等违法违规行为已被暂时冻结QQ登录。请后续注册或使用QQ账号时遵守《QQ号码规则》和互联网相关法律法规。", eDescription: "该账号因涉嫌进行资金盗用等违法违规行为，违反了国家法规政策和《QQ号码规则》中“内容规范”的相关规定，且该账号已于XXXX年X月X日收到QQ安全提醒并承诺不再违规。由于未遵守承诺再次违规，该账号现已被暂时冻结QQ登录。", forever: { title: "该QQ账号已被永久冻结，无法正常登录QQ。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌进行资金盗用等违法违规行为已被永久冻结QQ登录。" }, button: "申请立即解冻", link: "哪些情况会导致账号被冻结？" }, LOCKTOWER_REASON_SMART_56: { reason: 56, type: 4, reasonDesc: "进行业务违规操作", title: "该QQ账号暂时被冻结，无法正常登录QQ，请按照指引恢复使用。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌进行业务违规操作已被暂时冻结QQ登录。请后续注册或使用QQ账号时遵守《QQ号码规则》和互联网相关法律法规。", eDescription: "该账号因涉嫌进行业务违规操作，违反了国家法规政策和《QQ号码规则》中“内容规范”的相关规定，且该账号已于XXXX年X月X日收到QQ安全提醒并承诺不再违规。由于未遵守承诺再次违规，该账号现已被暂时冻结QQ登录。", forever: { title: "该QQ账号已被永久冻结，无法正常登录QQ。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌进行业务违规操作已被永久冻结QQ登录。" }, button: "申请立即解冻", link: "哪些情况会导致账号被冻结？" }, LOCKTOWER_REASON_SMART_57: { reason: 57, type: 4, reasonDesc: "发布/传播垃圾/骚扰信息", title: "该QQ账号暂时被冻结，无法正常登录QQ，请按照指引恢复使用。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌发布/传播垃圾/骚扰信息已被暂时冻结QQ登录。请后续注册或使用QQ账号时遵守《QQ号码规则》和互联网相关法律法规。", eDescription: "该账号因涉嫌发布/传播垃圾/骚扰信息，违反了国家法规政策和《QQ号码规则》中“内容规范”的相关规定，且该账号已于XXXX年X月X日收到QQ安全提醒并承诺不再违规。由于未遵守承诺再次违规，该账号现已被暂时冻结QQ登录。", forever: { title: "该QQ账号已被永久冻结，无法正常登录QQ。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌发布/传播垃圾/骚扰信息已被永久冻结QQ登录。" }, button: "申请立即解冻", link: "哪些情况会导致账号被冻结？" }, LOCKTOWER_REASON_SMART_58: { reason: 58, type: 4, reasonDesc: "传播病毒、木马等恶意文件", title: "该QQ账号暂时被冻结，无法正常登录QQ，请按照指引恢复使用。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌传播病毒、木马等恶意文件已被暂时冻结QQ登录。请后续注册或使用QQ账号时遵守《QQ号码规则》和互联网相关法律法规。", eDescription: "该账号因涉嫌传播病毒、木马等恶意文件，违反了国家法规政策和《QQ号码规则》中“内容规范”的相关规定，且该账号已于XXXX年X月X日收到QQ安全提醒并承诺不再违规。由于未遵守承诺再次违规，该账号现已被暂时冻结QQ登录。", forever: { title: "该QQ账号已被永久冻结，无法正常登录QQ。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌传播病毒、木马等恶意文件已被永久冻结QQ登录。" }, button: "申请立即解冻", link: "哪些情况会导致账号被冻结？" }, LOCKTOWER_REASON_SMART_59: { reason: 59, type: 4, reasonDesc: "", title: "该QQ账号暂时被冻结，无法正常登录QQ，请按照指引恢复使用。", description: "系统根据智能检测或人工审核等方式判断，该账号因使用非官方QQ软件被暂时冻结，请按照指引解除冻结。", eDescription: "系统根据智能检测或人工审核等方式判断，该账号因使用非官方QQ软件被暂时冻结，请按照指引解除冻结。", forever: { title: "该QQ账号已被永久冻结，无法正常登录QQ。", description: "系统根据智能检测或人工审核等方式判断，该账号因使用非官方QQ软件被永久冻结，请按照指引解除冻结。" }, button: "申请立即解冻", link: "哪些情况会导致账号被冻结？" }, LOCKTOWER_REASON_SMART_61: { reason: 61, type: 4, reasonDesc: "", title: "该QQ账号暂时被冻结，无法正常登录QQ，请按照指引恢复使用。", description: "该账号因涉及欺诈，被国务院打击治理电信网络新型违法犯罪工作部际联席会议办公室通报冻结，请按照指引解除冻结。", eDescription: "该账号因涉及欺诈，被国务院打击治理电信网络新型违法犯罪工作部际联席会议办公室通报冻结，请按照指引解除冻结。", button: "申请立即解冻", link: "哪些情况会导致账号被冻结？" }, LOCKTOWER_REASON_SMART_61_1: { reason: 61, type: 4, reasonDesc: "", title: "该QQ账号暂时被冻结，无法正常登录QQ，请按照指引恢复使用。", description: "该账号因涉及欺诈，违反了国家法规政策和《QQ号码规则》，被国务院打击治理电信网络新型违法犯罪工作部际联席会议办公室通报冻结，请按照指引解除冻结", eDescription: "该账号因涉及欺诈，违反了国家法规政策和《QQ号码规则》，被国务院打击治理电信网络新型违法犯罪工作部际联席会议办公室通报冻结，请按照指引解除冻结", button: "申请立即解冻", link: "哪些情况会导致账号被冻结？" }, LOCKTOWER_REASON_SMART_62: { reason: 62, type: 4, reasonDesc: "敏感信息", title: "该QQ账号暂时被冻结，无法正常登录QQ，请按照指引恢复使用。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号资料因涉嫌敏感信息已被暂时冻结QQ登录。请后续注册或使用QQ账号时遵守《QQ号码规则》和互联网相关法律法规。", eDescription: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号资料因涉嫌敏感信息已被暂时冻结QQ登录。请后续注册或使用QQ账号时遵守《QQ号码规则》和互联网相关法律法规。", forever: { title: "该QQ账号已被永久冻结，无法正常登录QQ。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌传播违法违规信息或组织相关活动/存在异常使用行为已被永久冻结QQ登录。" }, button: "申请立即解冻", link: "哪些情况会导致账号被冻结？" }, LOCKTOWER_REASON_SMART_66: { reason: 66, type: 4, reasonDesc: "传播未成年色情信息或组织相关活动", title: "该QQ账号暂时被冻结，无法正常登录QQ，请按照指引恢复使用。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌传播未成年色情信息或组织相关活动已被暂时冻结QQ登录。请后续注册或使用QQ账号时遵守《QQ号码规则》和互联网相关法律法规。", eDescription: "该账号因涉嫌传播未成年色情信息或组织相关活动，违反了国家法规政策和《QQ号码规则》中“内容规范”的相关规定，且该账号已于XXXX年X月X日收到QQ安全提醒并承诺不再违规。由于未遵守承诺再次违规，该账号现已被暂时冻结QQ登录。", forever: { title: "该QQ账号已被永久冻结，无法正常登录QQ。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌传播未成年色情信息或组织相关活动已被永久冻结QQ登录。" }, button: "申请立即解冻", link: "哪些情况会导致账号被冻结？" }, LOCKTOWER_REASON_SMART_67: { reason: 67, type: 4, reasonDesc: "传播损害未成年权益信息或组织相关活动", title: "该QQ账号暂时被冻结，无法正常登录QQ，请按照指引恢复使用。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌传播损害未成年权益信息或组织相关活动已被暂时冻结QQ登录。请后续注册或使用QQ账号时遵守《QQ号码规则》和互联网相关法律法规。", eDescription: "该账号因涉嫌传播损害未成年权益信息或组织相关活动，违反了国家法规政策和《QQ号码规则》中“内容规范”的相关规定，且该账号已于XXXX年X月X日收到QQ安全提醒并承诺不再违规。由于未遵守承诺再次违规，该账号现已被暂时冻结QQ登录。", forever: { title: "该QQ账号已被永久冻结，无法正常登录QQ。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌传播损害未成年权益信息或组织相关活动已被永久冻结QQ登录。" }, button: "申请立即解冻", link: "哪些情况会导致账号被冻结？" }, LOCKTOWER_REASON_SMART_68: { reason: 68, type: 4, reasonDesc: "传播网络水军信息或组织相关活动", title: "该QQ账号暂时被冻结，无法正常登录QQ，请按照指引恢复使用。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌传播网络水军信息或组织相关活动已被暂时冻结QQ登录。请后续注册或使用QQ账号时遵守《QQ号码规则》和互联网相关法律法规。", eDescription: "该账号因涉嫌传播网络水军信息或组织相关活动，违反了国家法规政策和《QQ号码规则》中“内容规范”的相关规定，且该账号已于XXXX年X月X日收到QQ安全提醒并承诺不再违规。由于未遵守承诺再次违规，该账号现已被暂时冻结QQ登录。", forever: { title: "该QQ账号已被永久冻结，无法正常登录QQ。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌传播网络水军信息或组织相关活动已被永久冻结QQ登录。" }, button: "申请立即解冻", link: "哪些情况会导致账号被冻结？" }, LOCKTOWER_REASON_SMART_69: { reason: 69, type: 4, reasonDesc: "传播网络暴力信息或组织相关活动", title: "该QQ账号暂时被冻结，无法正常登录QQ，请按照指引恢复使用。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌传播网络暴力信息或组织相关活动已被暂时冻结QQ登录。请后续注册或使用QQ账号时遵守《QQ号码规则》和互联网相关法律法规。", eDescription: "该账号因涉嫌传播网络暴力信息或组织相关活动，违反了国家法规政策和《QQ号码规则》中“内容规范”的相关规定，且该账号已于XXXX年X月X日收到QQ安全提醒并承诺不再违规。由于未遵守承诺再次违规，该账号现已被暂时冻结QQ登录。", forever: { title: "该QQ账号已被永久冻结，无法正常登录QQ。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌传播网络暴力信息或组织相关活动已被永久冻结QQ登录。" }, button: "申请立即解冻", link: "哪些情况会导致账号被冻结？" }, LOCKTOWER_REASON_SMART_70: { reason: 70, type: 4, reasonDesc: "传播饭圈文化乱象等有害信息", title: "该QQ账号暂时被冻结，无法正常登录QQ，请按照指引恢复使用。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌传播饭圈文化乱象等有害信息已被暂时冻结QQ登录。请后续注册或使用QQ账号时遵守《QQ号码规则》和互联网相关法律法规。", eDescription: "该账号因涉嫌传播饭圈文化乱象等有害信息，违反了国家法规政策和《QQ号码规则》中“内容规范”的相关规定，且该账号已于XXXX年X月X日收到QQ安全提醒并承诺不再违规。由于未遵守承诺再次违规，该账号现已被暂时冻结QQ登录。", forever: { title: "该QQ账号已被永久冻结，无法正常登录QQ。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌传播饭圈文化乱象等有害信息已被永久冻结QQ登录。" }, button: "申请立即解冻", link: "哪些情况会导致账号被冻结？" }, LOCKTOWER_REASON_SMART_OTHER: { reason: 999, type: 5, reasonDesc: "传播违法违规信息或组织相关活动/存在异常使用行为", title: "该QQ账号暂时被冻结，无法正常登录QQ，请按照指引恢复使用。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌传播违法违规信息或组织相关活动/存在异常使用行为已被暂时冻结QQ登录。请后续注册或使用QQ账号时遵守《QQ号码规则》和互联网相关法律法规。", eDescription: "该账号因涉嫌传播违法违规信息或组织相关活动/存在异常使用行为，违反了国家法规政策和《QQ号码规则》中“内容规范”的相关规定，且该账号已于XXXX年X月X日收到QQ安全提醒并承诺不再违规。由于未遵守承诺再次违规，该账号现已被暂时冻结QQ登录。", forever: { title: "该QQ账号已被永久冻结，无法正常登录QQ。", description: "根据用户举报、智能检测或人工审核等方式判断，该QQ账号因涉嫌传播违法违规信息或组织相关活动/存在异常使用行为已被永久冻结QQ登录。" }, button: "申请立即解冻", link: "哪些情况会导致账号被冻结？" } }
const violationlist = Object.values(violationdata)
