import passport from 'passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import jwt from 'jsonwebtoken';
import moment from 'moment';

import { User, IUser } from '../models';

export class AuthService {
    private _jwtSecret: string;
    private _jwtExpiration: number;

    constructor() {
        this._jwtSecret = process.env.JWT_SECRET;
        this._jwtExpiration = Number(process.env.JWT_TOKEN_EXPIRATION);
    }

    public initialize() {
        passport.use('jwt', this._getStrategy());

        return passport.initialize();
    }

    public async stubUser() {
        try {
            const checkUser = await User.findOne({ 'username': 'admin' }).exec();

            if (checkUser === null) {
                const user = new User({ username: 'admin', password: 'password' });

                await user.save();
            }
        } catch (err) {
            console.log(err);
        }
    }

    public authenticate = (callback) => passport.authenticate('jwt', { session: false, failWithError: true }, callback);

    public async login(username: string, password: string): Promise<any> {
        try {
            const user = await User.findOne({ 'username': username });

            if (user === null) { throw new Error('User not found'); }

            const success = await user.comparePassword(password);
            if (success === false) { throw new Error(); }

            return this._genToken(user);
        } catch (err) {
            return {
                errors: err
            };
        }
    }

    private _genToken(user: IUser): Object {
        const expires = moment().utc().add({ days: this._jwtExpiration }).unix();
        const token = jwt.sign({
            exp: expires,
            username: user.username
        }, this._jwtSecret);

        return {
            token: token,
            expires: moment.unix(expires).format(),
            userId: user._id
        };
    }

    private _getStrategy(): Strategy {
        const params = {
            secretOrKey: this._jwtSecret,
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            passReqToCallback: true
        };

        return new Strategy(params, async (req, payload: any, done) => {
            try {
                const user = await User.findOne({ 'username': payload.username });
                if (user === null) {
                    return done(null, false, { message: 'The user in the token was not found' });
                }

                return done(null, { _id: user._id, username: user.username });
            } catch (err) {
                return done(err);
            }
        });
    }
}