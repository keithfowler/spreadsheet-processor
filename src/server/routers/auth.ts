import { Router, Request, Response, NextFunction } from 'express';
import { AuthService } from '../services';

export class AuthRouter {
    private router: Router = Router();
    private _authSvc: AuthService;

    constructor() {
        this._authSvc = new AuthService();
    }

    getRouter(): Router {
        this.router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
            req.checkBody('username', 'Invalid username').notEmpty();
            req.checkBody('password', 'Invalid password').notEmpty();

            const errors = req.validationErrors();
            if (errors) { throw errors; }

            const response = await this._authSvc.login(req.body.username, req.body.password);

            if (response.errors) {
                res.status(401).json({ 'message': 'Invalid credentials', 'errors': response.errors });
            } else {
                res.status(200).json(response);
            }
        });

        return this.router;
    }
}