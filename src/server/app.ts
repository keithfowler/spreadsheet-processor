import path from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import expressValidator from 'express-validator';
import errorHandler from 'errorhandler';

import { AuthService } from './services/auth';
import { AuthRouter, DataRouter, MappingRouter } from './routers';

export class App {
    public app: express.Express;

    constructor() {
        this.app = express();

        this.setup();
    }

    private setup() {
        mongoose.Promise = global.Promise;
        let connString = '';

        if (process.env.NODE_ENV != 'development') {
            connString = process.env.MONGODB_URI;
            const mongoUsername = process.env.MONGODB_USERNAME;
            const mongoPassword = process.env.MONGODB_PASSWORD;

            mongoose.connect(connString, {
                auth: {
                    user: mongoUsername,
                    password: mongoPassword
                }
            }).then(() => {
                // all good
            }).catch(err => {
                console.log(`MongoDB Connect err::${err}`);
            });
        } else {
            connString = 'mongodb://localhost/si-data';

            mongoose.connect(connString).then(() => {
                // all good
            }).catch(err => {
                console.log(`MongoDB Connect err::${err}`);
            });
        }

        this.app.set('port', process.env.PORT || 4300);
        this.app.use(bodyParser.json());
        this.app.use(expressValidator());

        if (process.env.NODE_ENV == 'production') {
            this.app.use('/',
                express.static(path.join(__dirname, 'client'), { maxAge: 31557600000, index: 'index.html' })
            );
        }

        const authSvc = new AuthService();
        this.app.use(authSvc.initialize());

        // TODO: remove for prod, just needed to stub a test user
        authSvc.stubUser().then(() => {
            console.log('user stubbed');
        }).catch(err => {
            console.log(`stub user err: ${err}`);
        });

        this.app.all('/svc/*', (req, res, next) => {
            if (req.path.includes('/svc/auth/login')) { return next(); }

            return authSvc.authenticate((err, user, info) => {
                if (err) { return next(err); }
                if (!user) {
                    if (info.name === 'TokenExpiredError') {
                        return res.status(401).json({ message: 'Your token has expired. Please generate a new one' });
                    } else {
                        return res.status(401).json({ message: info.message });
                    }
                }

                this.app.set('user', user);

                return next();
            })(req, res, next);
        });

        this.app.use('/svc/auth', new AuthRouter().getRouter());
        this.app.use('/svc/data', new DataRouter().getRouter());
        this.app.use('/svc/mapping', new MappingRouter().getRouter());

        if (process.env.NODE_ENV === 'development') {
            // only use in development
            this.app.use(errorHandler());
        } else {

        }
    }
}