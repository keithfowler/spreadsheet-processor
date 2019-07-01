import path from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import expressValidator from 'express-validator';
import errorHandler from 'errorhandler';

import { AuthService } from './services/auth';
import { AuthRouter, DataRouter, MappingRouter } from './routers';

export class App {
    public expressApp: express.Express;

    constructor() {
        this.expressApp = express();

        this.setup();
    }

    public async setup() {
        mongoose.Promise = global.Promise;
        let connString = 'mongodb://localhost/si-data';
        const connOptions = {
            useNewUrlParser: true
        };

        if (process.env.NODE_ENV != 'development') {
            connString = process.env.MONGODB_URI;
            const mongoUsername = process.env.MONGODB_USERNAME;
            const mongoPassword = process.env.MONGODB_PASSWORD;
            connOptions['auth'] = {
                user: mongoUsername,
                password: mongoPassword
            };
        }

        await mongoose.connect(connString, connOptions);

        this.expressApp.set('port', process.env.PORT || 4300);
        this.expressApp.use(bodyParser.json());
        this.expressApp.use(expressValidator());

        const authSvc = new AuthService();
        this.expressApp.use(authSvc.initialize());

        if (process.env.NODE_ENV == 'production') {
            this.expressApp.use('/',
                express.static(path.join(__dirname, 'client'), { maxAge: 31557600000, index: 'index.html' })
            );
        } else {
            await authSvc.stubUser();
            console.log('user stubbed');

            this.expressApp.use(errorHandler());
        }

        this.expressApp.all('/svc/*', (req, res, next) => {
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

                this.expressApp.set('user', user);

                return next();
            })(req, res, next);
        });

        this.expressApp.use('/svc/auth', new AuthRouter().getRouter());
        this.expressApp.use('/svc/data', new DataRouter().getRouter());
        this.expressApp.use('/svc/mapping', new MappingRouter().getRouter());
    }
}