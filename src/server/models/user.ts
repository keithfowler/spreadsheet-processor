import mongoose, { Document, Model, Schema, model } from 'mongoose';
import bcrypt from 'bcrypt-nodejs';

export interface IUser extends Document {
    username: string;
    password: string;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IUserModel extends Model<IUser> {

}

const schema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

schema.pre('save', function (next) {
    if (!this.isModified('password')) { return next(); }

    bcrypt.genSalt(10, (err, salt) => {
        if (err) { return next(err); }
        // tslint:disable-next-line:no-shadowed-variable
        bcrypt.hash(this.password, salt, undefined, (err: mongoose.Error, hash) => {
            if (err) { return next(err); }
            this.password = hash;
            next();
        });
    });
});

schema.pre('update', function (next) {
    bcrypt.genSalt(10, (err, salt) => {
        if (err) { return next(err); }
        // tslint:disable-next-line:no-shadowed-variable
        bcrypt.hash(this.password, salt, undefined, (err: mongoose.Error, hash) => {
            if (err) { return next(err); }
            this.password = hash;
            next();
        });
    });
});

schema.methods.comparePassword = function (candidatePassword: string): Promise<boolean> {
    const password = this.password;

    return new Promise((resolve, reject) => {
        bcrypt.compare(candidatePassword, password, (err, success) => {
            if (err) { return reject(err); }
            return resolve(success);
        });
    });
};

export const User = model<IUser>('users', schema) as IUserModel;