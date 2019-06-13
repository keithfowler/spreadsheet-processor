import { Document, Model, Schema, model } from 'mongoose';

export interface IStartupApplication extends Document {
    inputData: any;
}

export interface IStartupApplicationModel extends Model<IStartupApplication> {

}

const schema = new Schema({
    inputData: {
        type: Schema.Types.Mixed,
        required: true
    }
});

export const StartupApplication = model<IStartupApplication>('StartupApplication', schema) as IStartupApplicationModel;