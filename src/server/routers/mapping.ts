import { Router, Request, Response, NextFunction } from 'express';
import { DataMapping, DataMappingFieldNames } from '../models';

export class MappingRouter {
    private router: Router = Router();

    constructor() {

    }

    getRouter(): Router {
        // Get

        this.router.get('/field-names', async (req: Request, res: Response) => {
            try {
                const names = await DataMappingFieldNames.find({}).distinct('name');

                res.json(names);
            } catch (err) {
                res.status(500);
            }
        });

        this.router.get('/mapping-names', async (req: Request, res: Response) => {
            try {
                const names = await DataMapping.find({}).distinct('name');

                res.json(names);
            } catch (err) {
                res.status(500);
            }
        });

        this.router.get('/:name', async (req: Request, res: Response) => {
            try {
                const mapping = await DataMapping.findOne({ name: req.params.name });

                console.log(`mapping ${mapping}`);

                res.json(mapping);
            } catch (err) {
                console.log(err);
                res.status(500);
            }
        });

        // Post
        this.router.post('/field-names', async (req: Request, res: Response, next: NextFunction) => {
            try {
                await DataMappingFieldNames.create(req.body);

                res.status(200).json({ status: 'ok' });
            } catch (err) {

            }
        });

        this.router.post('/', async (req: Request, res: Response, next: NextFunction) => {
            try {
                await DataMapping.create(req.body);

                res.status(200).json({ status: 'ok' });
            } catch (err) {
                console.log(err);

                res.status(500);
            }
        });

        // Put
        this.router.put('/:id', (req: Request, res: Response) => {

        });

        // Delete

        return this.router;
    }
}