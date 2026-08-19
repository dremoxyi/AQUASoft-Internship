import type { Request, Response, NextFunction } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken'

function verifyJWT(token:string){
    const tk = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload
    return tk
}

export function Bearer_Auth(req:Request, res:Response, next: NextFunction){
    const authorization = req.headers.authorization;
    const acceptanceCriteria = process.env.ADMIN_TOKEN
    console.log("\n-> WELCOME TO dremoxyi bearer API BORDER CHECKPOINT <-")
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

export function JWT_Auth(req:Request,res:Response,next:NextFunction){
    console.log("\n-> WELCOME TO dremoxyi jwt API BORDER CHECKPOINT <-")
    console.log(req.cookies)
    const token = req.cookies.access_token
    console.log(">> PAPERS PLEASE ! <<",token)
    if (!token) {
        console.log(">> YOU DON'T HAVE YOUR PAPERS? <<\n|||||| ACCESS DENIED ||||||")
        return res.status(401).json({ message: "Unauthorized -> 'JWT' required -> Please login"})
    }
    try {
        const payload = verifyJWT(token)
        console.log("-> ACCESS GRANTED! YOU GOOD TO GO <-")
        res.locals.user = payload;
        next()
    } catch(error) {
        console.log(">> YOUR DOCUMENTS EXPIRED !! <<\n|||||| ACCESS DENIED ||||||")
        console.error(error)

        res.clearCookie("access_token", {
            httpOnly: true,
            secure: true,
            sameSite: "lax"
        });

        return res.status(401).json({message: "Unauthorized -> 'JWT' expired or invalid -> Please login",});
    }
}
