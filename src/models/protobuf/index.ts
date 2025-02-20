import { ExtractSchema, PBString, PBUint32, ProtoBuf, ProtoBufBase, ProtoBufEx } from 'napcat.protobuf'

class ProtoBufDataInnerClass extends ProtoBufBase {
  1 = PBString(1)
}

class ProtoBufDataInnerResClass extends ProtoBufBase {
  field2 = PBString(2)
}

class ProtoBufDataClass extends ProtoBufBase {
  1 = PBUint32(1)
  2 = PBString(2)
  3 = PBString(3)
  4 = ProtoBuf(4, ProtoBufDataInnerClass)
  5 = PBString(5)
}

class ProtoBufDataResClass extends ProtoBufBase {
  field4 = ProtoBuf(4, ProtoBufDataInnerResClass)
}

export default class {
  data: ProtoBufDataClass
  constructor (item: ExtractSchema<ProtoBufDataClass>) {
    this.data = ProtoBufEx(ProtoBufDataClass, item)
  }

  async encode () {
    const item = this.data.encode()
    return Buffer.from(item).toString('hex')
  }

  async decode (item: string) {
    const retpb = ProtoBuf(ProtoBufDataResClass)
    retpb.decode(Buffer.from(item, 'hex'))
    return retpb.field4.field2
  }
}
