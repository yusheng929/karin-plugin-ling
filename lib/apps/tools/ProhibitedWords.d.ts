declare const _default: {
    ProhibitedWords: (e: {
        isGroup: any;
        group_id: any;
        msg: string | any[];
        sender: {
            role: string;
        };
        isMaster: any;
        bot: {
            RecallMessage: (arg0: any, arg1: any) => any;
        };
        contact: any;
        message_id: any;
        reply: (arg0: string, arg1: {
            at: boolean;
        }) => any;
    }) => Promise<boolean | undefined>;
};
export default _default;
