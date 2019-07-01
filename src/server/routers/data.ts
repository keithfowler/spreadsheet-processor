import { Router, Request, Response, NextFunction } from 'express';
import { isArray } from 'util';
import { getGenericModel, CustomDataType } from '../models';

export class DataRouter {
    private router: Router = Router();

    constructor() { }

    getRouter(): Router {
        this.router.get('/:type/:page(\\d+)', async (req: Request, res: Response) => {
            const skip = (req.params.page - 1) * 10;
            const genericModel = getGenericModel(req.params.type);
            const rawData = await genericModel.find({}).skip(skip).limit(10);

            const responseData = [];

            for (const data of rawData) {
                responseData.push(data.inputData);
            }

            res.json(responseData);
        });

        this.router.get('/type', async (req: Request, res: Response) => {
            const customTypes = await CustomDataType.find({});

            res.json(customTypes);
        });

        this.router.post('/type', async (req: Request, res: Response) => {
            if (req.body.type !== '' && req.body.type !== null && req.body.type !== undefined) {
                try {
                    //TODO: check if already exists and send error back stating as such
                    const dataType = await this._ensureDataType(req.body.type);

                    res.json(dataType);
                } catch (err) {
                    console.log(err);
                    res.status(500).send('error saving data');
                }
            }

            res.status(500).send('invalid data');
        });

        this.router.post('/batch', async (req: Request, res: Response, next: NextFunction) => {
            if (isArray(req.body)) {
                try {
                    let firstRun = true;
                    for (const item of req.body) {
                        if (firstRun) {
                            await this._ensureDataType(item.type);
                            firstRun = false;
                        }
                        const genericModel = getGenericModel(item.type);
                        await genericModel.create(item.props);
                    }

                    res.status(200).json(true);
                } catch (err) {
                    console.log(err);

                    res.status(500).send('error saving data');
                }
            } else {
                res.status(500).send('invalid data');
            }
        });

        return this.router;
    }

    private async _ensureDataType(dataType: string): Promise<string> {
        const foundType = await CustomDataType.findOne({ displayName: dataType });

        if (foundType === undefined || foundType === null) {
            //need to also check for special chars, etc.
            const sanitizedValue = dataType.replace(/\s/g, '');
            await CustomDataType.create({ displayName: dataType, value: sanitizedValue });

            return sanitizedValue;
        }
    }
}