import { karin } from 'node-karin';
import { Edit } from '../components/index.js';
export const test = karin.command(/^#(上班|下班)$/, async (e) => {
    if (!e.isGroup) {
        e.reply('请在群聊中执行');
        return false;
    }
    if (e.msg.includes('上班')) {
        await Edit.EditRemove(e, '开始上班(T^T)', '已经是上班状态咯~', 'NoWork', e.group_id, 'other');
        return true;
    }
    if (e.msg.includes('下班')) {
        await Edit.EditAddend(e, '下班咯~', '已经是下班状态咯~', 'NoWork', e.group_id, 'other');
        return true;
    }
    return true;
}, { permission: 'master' });
