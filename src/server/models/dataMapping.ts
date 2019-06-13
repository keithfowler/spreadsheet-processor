import { Document, Model, Schema, model } from 'mongoose';

export interface IDataMapPair {
    from: string;
    to: string;
    mapType: string;
    isExcluded: boolean;
}

export interface IDataMapping extends Document {
    name: string;
    mapping: Array<IDataMapPair>;
}

export interface IDataMappingModel extends Model<IDataMapping> {

}

const dataMapPairSchema = new Schema({
    from: {
        type: Schema.Types.String
    },
    to: {
        type: Schema.Types.String
    },
    mapType: {
        type: Schema.Types.String
    },
    isExcluded: {
        type: Schema.Types.Boolean
    }
});

const schema = new Schema({
    name: {
        type: Schema.Types.String,
        required: true
    },
    mapping: {
        type: [dataMapPairSchema]
    }
});

export const DataMapping = model<IDataMapping>('dataMapping', schema) as IDataMappingModel;