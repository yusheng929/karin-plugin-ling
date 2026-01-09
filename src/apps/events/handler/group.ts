import { GroupMemberIncreaseNotice } from 'node-karin'

/** 自动退群逻辑 */
export const AutoQuit = async (e: GroupMemberIncreaseNotice) => {
  if (e.sender.userId !== e.selfId) return false
}
