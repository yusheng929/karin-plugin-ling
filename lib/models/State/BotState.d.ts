export default function getBotState(e: {
    bot: any;
    self_id?: any;
    isPro?: any;
}): Promise<(false | {
    avatar: {
        similarColor1: string;
        similarColor2: string;
        path: string;
    };
    nickname: any;
    botRunTime: string;
    status: any;
    platform: any;
    botVersion: string;
    messageCount: {
        sent: string | number;
        recv: string | number;
        screenshot: string | number;
    };
    countContacts: {
        friend: string | number;
        group: string | number;
        groupMember: any;
    };
})[]>;
