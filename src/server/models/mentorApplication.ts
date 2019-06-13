import { Document, Model, Schema, model } from 'mongoose';

export interface IMentorApplication extends Document {
    inputData: any;
}

export interface IMentorApplicationModel extends Model<IMentorApplication> {

}

const schema = new Schema({
    inputData: {
        type: Schema.Types.Mixed,
        required: true
    }
});

export const MentorApplication = model<IMentorApplication>('MentorApplication', schema) as IMentorApplicationModel;