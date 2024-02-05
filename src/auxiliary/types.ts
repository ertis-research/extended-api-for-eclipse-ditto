export interface RequestResponse {
    status: number;
    message: any;
}

export interface DittoThing {
    thingId?: string;
    policyId?: string;
    definition?: string;
    attributes?: Attributes;
    features?: Features;
}

export interface Attributes {
    [key:string] : any
}

export interface Features {
    [key: string] : {
        definition: string;
        properties: any;
        desiredProperties: any;
    }
}

export interface TypeParentAttribute {
    [key:string] : number
}