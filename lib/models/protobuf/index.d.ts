import { ExtractSchema, ProtoBufBase } from 'napcat.protobuf';
declare class ProtoBufDataInnerClass extends ProtoBufBase {
    1: string;
}
declare class ProtoBufDataClass extends ProtoBufBase {
    1: number;
    2: string;
    3: string;
    4: ProtoBufDataInnerClass;
    5: string;
}
export default class {
    data: ProtoBufDataClass;
    constructor(item: ExtractSchema<ProtoBufDataClass>);
    encode(): Promise<string>;
    decode(item: string): Promise<string>;
}
export {};
