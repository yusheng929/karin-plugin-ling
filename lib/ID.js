let A = async (e) => await e.bot.SendApi('get_group_member_info', { group_id: e.group_id, user_id: e.user_id })
let B = async (e) => await e.bot.SendApi('get_group_member_info', { group_id: e.group_id, self_id: e.self_id })

let UserID = {
  A,
  B
}

export default UserID