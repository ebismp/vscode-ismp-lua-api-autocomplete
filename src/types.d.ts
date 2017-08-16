interface ISMPTypeMap {
    [prop: string]: ISMPType
}

interface ISMPType {
    type?: string
    name?: string
    doc?: string
    mode?: string
    properties?: ISMPTypeMap
    args?: ISMPTypeMap
    returns?: string
    inherits?: string[]
    notice?: string
    exception?: string
    option?: string
}
