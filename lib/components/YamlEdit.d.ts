declare const _default: {
    EditAddend: (e: any, Msg1: any, Msg2: any, term: string, value: any, path: any) => Promise<boolean>;
    EditRemove: (e: any, Msg1: any, Msg2: any, term: string, value: any, path: any) => Promise<boolean>;
    EditTest: (e: any) => Promise<boolean>;
    EditSet: (e: {
        reply: (arg0: string) => any;
    }, Msg1: any, Msg2: any, term: string, value: string | number | boolean | object | any[], path: any) => Promise<any>;
};
export default _default;
