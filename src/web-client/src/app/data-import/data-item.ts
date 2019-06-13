export class DataItem {
    public type: string;
    public props: Array<DataProp>;

    constructor(type: string) {
        this.type = type;
        this.props = new Array<DataProp>();
    }
}

export class DataProp {
    public inputData: {};

    constructor() {
        this.inputData = {};
    }
}
