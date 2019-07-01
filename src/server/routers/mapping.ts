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
                res.status(500).send('error');
            }
        });

        this.router.get('/mapping-names', async (req: Request, res: Response) => {
            try {
                const names = await DataMapping.find({}).distinct('name');

                res.json(names);
            } catch (err) {
                res.status(500).send('error');
            }
        });

        this.router.get('/:name', async (req: Request, res: Response) => {
            try {
                const mapping = await DataMapping.findOne({ name: req.params.name });

                if (mapping === null) {
                    res.status(404).send('not found');
                }

                res.json(mapping);
            } catch (err) {
                console.log(err);
                res.status(500).send('error');
            }
        });

        // Post
        this.router.post('/field-names', async (req: Request, res: Response, next: NextFunction) => {
            try {
                await DataMappingFieldNames.create(req.body);

                res.status(200).json(true);
            } catch (err) {
                res.status(500).send('error');
            }
        });

        this.router.post('/', async (req: Request, res: Response, next: NextFunction) => {
            try {
                await DataMapping.create(req.body);

                res.status(200).json(true);
            } catch (err) {
                res.status(500).send('error');
            }
        });

        this.router.put('/:name', async (req: Request, res: Response, next: NextFunction) => {
            try {
                const mapping = await DataMapping.findOne({ name: req.params.name });

                if (mapping === null) {
                    res.status(404).send('not found');
                }

                await mapping.update(req.body);

                res.json(mapping);
            } catch (err) {
                console.log(err);
                res.status(500).send('error');
            }
        });

        return this.router;
    }
}