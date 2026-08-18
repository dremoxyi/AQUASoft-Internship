// register()
// login()
// verifyPassword()
// generateJWT()

import AuthService from "../services/AuthService.ts"
import type { Request, Response } from "express"

function setCookie(res:Response,token:string){
    res.cookie("access_token", token, {
        httpOnly: true,
        secure:true,
        sameSite: "lax",
    });
}

function clearCookie(res:Response){
    res.clearCookie("access_token", {
        httpOnly: true,
        secure: true,
        sameSite: "lax"
    });
}

export default class AuthController {
    private readonly authService: AuthService

    constructor(dependencies:any){
        this.authService = new AuthService(dependencies)
    }

    register = async (req:Request, res:Response) => {
        if (!req.body){
            return res.status(400).json({message: "Missing required field > 'JSON request body' required"})
        }
        const auth = await this.authService.register(req.body)
        setCookie(res,auth.Token)
        const answer = { id:auth.UserID, username:auth.UserName, email:auth.Email, role:auth.RoleID }
        return res.json(answer)
    }

    login = async (req: Request, res: Response) => {
        try {
            const { UserName, Password } = req.body ?? {};

            // Validate request
            if (!UserName || !Password) {
                return res.status(400).json({
                    message: "UserName and Password are required."
                });
            }

            const result = await this.authService.login(UserName, Password);

            // Authentication failed
            if (!result.success) {
                return res.status(401).json({
                    message: result.message
                });
            }

            // Extra safety check
            if (!result.Token) {
                return res.status(500).json({
                    message: "Something went wrong."
                });
            }

            setCookie(res, result.Token);

            return res.status(200).json({
                message: "Logged in",
                user_connected: {
                    id: result.UserID,
                    username: result.Username
                }
            });

        } catch (err) {
            console.error("Login error:", err);

            return res.status(500).json({
                message: "Internal server error."
            });
        }
    }
    
    logout = async (req:Request, res:Response) => {
        if (!req.cookies.access_token) {
            return null
        }
        clearCookie(res)
    }

    check = async (req:Request, res:Response) => {
        if (typeof req.query.d !== 'string'){
            return res.status(400).json({message: "Missing required field > Parameter 'd' required"})
        }
        if (typeof req.query.v !== 'string'){
            return res.status(400).json({message: "Missing required field > Parameter 'value' required"})
        }
        const answer = await this.authService.checkAvailability(req.query.d,req.query.v)
        const isAvailable = (answer === null)
        return res.json({ response:{isAvailable}})
    }

    whoami = async (req:Request,res:Response) => {
        const token = req.cookies.access_token
        if (!token) {
            return res.status(200).json(null)
        }
        try {
            const user = await this.authService.whoami(token)
            return res.status(200).json(user);
        } catch {
            this.logout(req,res);
            return res.status(401).json({ message:"Session Expired"})
        }
    }

    updateMe = async (req:Request,res:Response) => {
        const token = req.cookies.access_token
        if (!token) {
            return res.status(401).json({ message: "Unauthorized -> 'JWT' required -> Please login" })
        }

        if (!req.body) {
            return res.status(400).json({ message: "Missing required field > 'JSON request body' required" })
        }

        try {
            const updated = await this.authService.updateMe(token, req.body)
            setCookie(res, updated.Token)
            return res.status(200).json(updated.user)
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unable to update profile"
            return res.status(400).json({ message })
        }
    }
}