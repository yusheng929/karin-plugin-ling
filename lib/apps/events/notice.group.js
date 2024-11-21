import { karin } from 'node-karin';
import { GroupNotice, GroupTest } from '../tools/index.js';
export const accept = karin.accept('notice.group_member_increase', async (e) => {
    await GroupNotice.JoinGroupMsg(e, e.group_id);
    await GroupTest.GroupTest(e, e.group_id, e.user_id);
    return true;
});
export const unaccept = karin.accept('notice.group_member_decrease', async (e) => {
    await GroupNotice.ExitGroupMsg(e, e.group_id, e.user_id);
    return true;
});
