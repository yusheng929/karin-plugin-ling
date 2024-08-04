import { Plugin } from 'node-karin'
import { UserID } from '../lib/index.js'

export class UserBing extends Plugin {
    constructor() {
        super({
            name: '群管',
            dsc: '群管',
            event: 'message',
            priority: 300,
            rule: [
                {
                    reg: '^#?全体(禁言|解禁)$',
                    fnc: 'MuteAll'
                },
                {
                    reg: '^#(设置|取消)管理(\\d+)?$',
                    fnc: 'SetAdmin'
                },
                {
                    reg: '^#(申请|我要)头衔',
                    fnc: 'SetGroupTitle'
                },
                {
                    reg: '^#踢(\\d+)?$',
                    fnc: 'KickMember'
                }
            ]
        })
    }

    async MuteAll(e) {
        if (!(UserID.A.role === 'admin' || UserID.A.role === 'owner' || e.isMaster)) return e.reply('暂无权限，只有管理员才能操作')
        if (!(UserID.B.role === 'admin' || UserID.B.role === 'owner')) return e.reply('少女做不到呜呜~(>_<)~')

        let type = /全体禁言/.test(e.msg)
        let res = await e.bot.SetGroupWholeBan(e.group_id, type)

        if (!res) return e.reply('错误: 未知原因❌', true)

        if (type) {
            e.reply('已开启全体禁言')
        } else {
            e.reply('已关闭全体禁言')
        }

        return true
    }

    async SetAdmin(e) {
        if (!e.isMaster) return e.reply('暂无权限，只有主人才能操作')
        if (!(UserID.B.role === 'owner')) return e.reply('少女做不到呜呜~(>_<)~')
        let qq
        e.at.forEach(at => {
            if (at === e.self_id) return false
            qq = at
        })
        const type = /设置管理/.test(e.msg)
        if (!qq) qq = e.msg.replace(/#|(设置|取消)管理/g, '').trim()
        if (!qq || !(/\d{5,}/.test(qq))) return e.reply('你QQ号真的输入正确了吗？')
        try {
            await e.bot.GetGroupMemberList(e.group_id, qq, true)
        } catch {
            return e.reply('这个群好像没这个人')
        }
        try {
        await e.bot.SetGroupAdmin(e.group_id, qq, type)
        } catch {
        return e.reply('错误: 未知原因❌', true)
        }
        if (type) {
            e.reply('设置管理员成功')
        } else {
            e.reply('已取消管理员')
        }
        return true
    }

    async SetGroupTitle(e) {
    if (!(UserID.B.role === 'owner')) return e.reply('少女做不到呜呜~(>_<)~')
        let Title = e.msg.replace(/#(申请|我要)头衔/g, '').trim()
        try {
            await e.bot.SetGroupUniqueTitle(e.group_id, e.user_id, Title)
        } catch (error) {
            return e.reply('错误:', error, true)

        }
        if (!Title) return e.reply('已经将你的头衔取消了', true)
        e.reply(`已将你的头衔更换为「${Title}」`, true)
        return true
    }
    async KickMember (e) {
    if (!(UserID.A.role === 'admin' || UserID.A.role === 'owner' || e.isMaster)) return e.reply('暂无权限，只有管理员才能操作')
    
    let qq
        e.at.forEach(at => {
            if (at === e.self_id) return false
            qq = at
        })
        if (!qq) qq = e.msg.replace(/#踢/g, '').trim()
        if (!qq || !(/\d{5,}/.test(qq))) return e.reply('你QQ号真的输入正确了吗？')
        try {
            await e.bot.GetGroupMemberList(e.group_id, qq, true)
        } catch {
            return e.reply('这个群好像没这个人')
        }
        try {
        await e.bot.KickMember(e.group_id, qq)
        e.reply (`已经将用户『${qq}』踢出群聊`)
        } catch {
        return e.reply('错误: 未知原因❌', true)
        }
        return true
    }
}