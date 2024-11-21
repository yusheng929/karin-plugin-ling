declare const _default: {
    JoinGroupMsg: (e: {
        reply: (arg0: string, arg1: {
            at: boolean;
        }) => any;
    }, group_id: any) => Promise<any>;
    ExitGroupMsg: (e: {
        group_id: any;
        reply: (arg0: string) => any;
    }, group_id: any, user_id: any) => Promise<boolean>;
};
export default _default;
