import { Config } from '../../components/index.js';
const JoinGroupMsg = async (e, group_id) => {
    let data = Config.Other.accept.BlackGroup;
    if (!data.includes(group_id))
        return await e.reply('\n欢迎加入本群୯(⁠*⁠´⁠ω⁠｀⁠*⁠)୬', { at: true });
    return false;
};
const ExitGroupMsg = async (e, group_id, user_id) => {
    let data = Config.Other.accept.BlackGroup;
    if (data.includes(e.group_id))
        return false;
    await e.reply(`用户『${user_id}』丢下我们一个人走了`);
    return true;
};
export default {
    JoinGroupMsg,
    ExitGroupMsg,
};
