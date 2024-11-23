import { Config } from '@/components'

const JoinGroupMsg = async (e: { reply: (arg0: string, arg1: { at: boolean }) => any }, group_id: any) => {
let data = Config.Other.accept.BlackGroup
 if (!data.includes(group_id)) return await e.reply('\n欢迎加入本群୯(⁠*⁠´⁠ω⁠｀⁠*⁠)୬', { at: true })
 return false
}
const ExitGroupMsg = async (e: { group_id: any; reply: (arg0: string) => any }, group_id: any, user_id: any) => {
   let data = Config.Other.accept.BlackGroup
  if (data.includes(e.group_id)) return false
  await e.reply(`用户『${user_id}』丢下我们一个人走了`)
  return true
}

export default {
  JoinGroupMsg,
  ExitGroupMsg,
}