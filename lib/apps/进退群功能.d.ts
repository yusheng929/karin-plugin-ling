export declare const deal_invited_group: {
    event: "request.invited_group";
    fn: (e: import("node-karin").RequestEvent<import("node-karin").RequestSubType.InvitedGroup>) => Promise<boolean>;
    log: (id: string, text: string) => void;
    name: string;
    rank: number;
    type: import("node-karin").AppType;
    adapter: string[];
    notAdapter: string[];
};
export declare const deal_private_apply: {
    event: "request.private_apply";
    fn: (e: import("node-karin").RequestEvent<import("node-karin").RequestSubType.PrivateApply>) => Promise<boolean>;
    log: (id: string, text: string) => void;
    name: string;
    rank: number;
    type: import("node-karin").AppType;
    adapter: string[];
    notAdapter: string[];
};
export declare const deal_group_apply: {
    event: "request.group_apply";
    fn: (e: import("node-karin").RequestEvent<import("node-karin").RequestSubType.GroupApply>) => Promise<boolean>;
    log: (id: string, text: string) => void;
    name: string;
    rank: number;
    type: import("node-karin").AppType;
    adapter: string[];
    notAdapter: string[];
};
export declare const Notification: import("node-karin").CommandInfo;
export declare const test: import("node-karin").CommandInfo;
