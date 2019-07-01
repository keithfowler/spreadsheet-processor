import { Document, Model, Schema, model } from 'mongoose';

export interface ICustomDataType extends Document {
    displayName: string;
    value: string;
}

export interface ICustomDataTypeModel extends Model<ICustomDataType> {

}

const schema = new Schema({
    displayName: {
        type: Schema.Types.String,
        required: true
    },
    value: {
        type: Schema.Types.String,
        required: true
    }
});

export const CustomDataType = model<ICustomDataType>('customDataType', schema) as ICustomDataTypeModel;