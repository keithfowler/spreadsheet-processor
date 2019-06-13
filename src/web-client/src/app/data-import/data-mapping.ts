export class DataMapping {
    public mapping: Array<DataMappingPair>;
    public name: string;

    constructor() {
        this.mapping = new Array<DataMappingPair>();
    }
}

export class DataMappingPair {
    public from: string;
    public to: string;
    public mapType: string;
    public value: string;
    public isExcluded: boolean;

    constructor() {
        this.isExcluded = false;
        this.mapType = 'text';
    }
}

export class DataMappingFieldName {
    public name: string;

    constructor(name: string) {
        this.name = name;
    }
}