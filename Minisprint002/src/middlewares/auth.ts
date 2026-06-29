import type { Request, Response, NextFunction } from 'express';

export default function authenticate(req:Request, res:Response, next: NextFunction){
    const authorization = req.headers.authorization;
    const acceptanceCriteria = process.env.ADMIN_TOKEN
    console.log("\n-> WELCOME TO dremoxyi API BORDER CHECKPOINT <-")
    console.log(">> PAPERS PLEASE ! <<",authorization)
    if (!authorization) {
        console.log(">> YOU DON'T HAVE YOUR PAPERS? <<\n|||||| ACCESS DENIED ||||||")
        return res.status(401).json({ message: "Unauthorized -> 'Bearer token' required"})
    }
    const [ bearer, token ] = authorization.split(" ");
    console.log(">> INSPECTING DOCUMENTS... <<",token)
    if (bearer !== 'Bearer') {
        console.log(">> YOUR DOCUMENT DOES NOT MEET 'Bearer' STANDARDS <<\n|||||| ACCESS DENIED ||||||")
        return res.status(401).json({ message: "Unauthorized -> Expected 'Bearer token' format"})
    }
    if (token !== acceptanceCriteria ) {
        console.log(">> CLEARANCE REFUSED, YOU SHALL NOT PASS! <<\n|||||| ACCESS DENIED ||||||")
        return res.status(401).json({ message:"Unauthorized -> Invalid 'Bearer token'"})
    }
    console.log("-> ACCESS GRANTED! YOU GOOD TO GO. <-\n")

    next();
}