import type { Request, Response, NextFunction } from 'express';

export default function authenticate(req:Request, res:Response, next: NextFunction){
    const authorization = req.headers.authorization;
    const acceptanceCriteria = process.env.ADMIN_TOKEN
    console.log("\n-> WELCOME TO dremoxyi API BORDER CHECKPOINT <-")
    console.log(">> PAPERS PLEASE ! <<",authorization)
    if (!authorization) {
        return res.status(401).json({ message: "|||||| YOU DON'T HAVE YOUR PAPERS? -> UNAUTHORIZED -> 'Bearer token' required ||||||"})
    }
    const [ bearer, token ] = authorization.split(" ");
    console.log(">> INSPECTING DOCUMENTS... <<",token)
    if (bearer !== 'Bearer') {
        return res.status(401).json({ message: "|||||| YOUR DOCUMENT FORMAT IS INVALID -> UNAUTHORIZED -> Expected 'Bearer token' format ||||||"})
    }
    if (token !== acceptanceCriteria ) {
        return res.status(401).json({ message:"|||||| YOUR PAPERS HAVE BEEN REJECTED, YOU SHALL NOT PASS! -> UNAUTHORIZED -> Invalid 'Bearer token' ||||||"})
    }
    console.log(">> ACCESS GRANTED! YOU GOOD TO GO. <<")

    next();
}