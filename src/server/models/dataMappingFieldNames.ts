import { Document, Model, Schema, model } from 'mongoose';

export interface IDataMappingFieldNames extends Document {
    name: string;
}

export interface IDataMappingFieldNamesModel extends Model<IDataMappingFieldNames> {

}

const schema = new Schema({
    name: {
        type: Schema.Types.String,
        required: true
    }
});

export const DataMappingFieldNames = model<IDataMappingFieldNames>('dataMappingFieldNames', schema) as IDataMappingFieldNamesModel;