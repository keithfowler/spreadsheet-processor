import { Document, Model, Schema, model } from 'mongoose';

const schema = new Schema({
    inputData: {
        type: Schema.Types.Mixed,
        required: true
    }
});

export interface IGenericData extends Document {
    inputData: any;
}

export interface IGenericDataModel extends Model<IGenericData> {

}


export function getGenericModel(modelName: string): IGenericDataModel {
    modelName = modelName.replace(/\s/g, '');
    const dataModel = model<IGenericData>(modelName, schema) as IGenericDataModel;

    return dataModel;
}