import express from 'express';
import type { Router, Request, Response } from 'express';
const router : Router = express.Router();

export default (exampleService : any) => {

    router.get('/', async (req: Request,res: Response) => {
        try {
            const Test = await exampleService.getTest(); 
            res.send(Test);
        } catch (err) {
            console.log(err);
        }
    });

    return router
}
