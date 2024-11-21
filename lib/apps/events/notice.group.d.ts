export declare const accept: {
    event: "notice.group_member_increase";
    fn: (e: import("node-karin").NoticeEvent<import("node-karin").NoticeSubType.GroupMemberIncrease>) => Promise<boolean>;
    log: (id: string, text: string) => void;
    name: string;
    rank: number;
    type: import("node-karin").AppType;
    adapter: string[];
    notAdapter: string[];
};
export declare const unaccept: {
    event: "notice.group_member_decrease";
    fn: (e: import("node-karin").NoticeEvent<import("node-karin").NoticeSubType.GroupMemberDecrease>) => Promise<boolean>;
    log: (id: string, text: string) => void;
    name: string;
    rank: number;
    type: import("node-karin").AppType;
    adapter: string[];
    notAdapter: string[];
};
