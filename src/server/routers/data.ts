import { Router, Request, Response, NextFunction } from 'express';
import { isArray } from 'util';
import { StartupApplication, MentorApplication } from '../models';

export class DataRouter {
    private router: Router = Router();

    constructor() {

    }

    getRouter(): Router {
        this.router.get('/', (req: Request, res: Response) => {
            // const data = StartupApplication.find({}).limit(20);

            res.json({ Hello: 'World!' });
        });

        this.router.post('/', async (req: Request, res: Response, next: NextFunction) => {
            // const data = await StartupApplication.create(req.body);

            // res.status(200).json(data);
        });

        this.router.post('/batch', async (req: Request, res: Response, next: NextFunction) => {
            if (isArray(req.body)) {
                try {
                    for (const item of req.body) {
                        switch (item.type) {
                            case 'Startup Application':
                                await StartupApplication.create(item.props);
                                break;
                            case 'Mentor Application':
                                await MentorApplication.create(item.props);
                                break;
                        }
                    }

                    res.status(200).json({ status: 'ok' });
                } catch (err) {
                    console.log(err);

                    res.status(500);
                }
            } else {
                res.status(500);
            }
        });

        return this.router;
    }
}