import express from 'express';
import type { Router, Request, Response } from 'express';
import exampleRoute from './example/index.ts';
import type exampleServices from '../services/exampleServices.ts';
const router : Router = express.Router();

export default (params? : {exampleService?: exampleServices} ) => {
    router.get('/', (req: Request,res: Response) => {
        res.send("Home Page")
    });

    router.use('/test',exampleRoute(params?.exampleService));

    return router;
}
