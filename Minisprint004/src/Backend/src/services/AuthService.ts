import TransactionManager from "../managers/sequelizeManager.ts"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import type UserRepository from "../repositories/UserRepository.ts"
import type { createUserDTO, updateUserDTO } from "../models/data-transfer-object/index.ts"

const Salt_Rounds = 10
function signJWT(ID:string,usrName:string,role:string){
    const token = jwt.sign(
        {id: ID, username: usrName,rolename: role},
        process.env.JWT_SECRET!,
        {expiresIn:"5m"}
    )
    return token
}
function checkJWT(tken:string){
    const user = jwt.verify(tken, process.env.JWT_SECRET!)
    return user
}

type JwtUser = {
    id?: string | number
    username?: string
    rolename?: string
}


class AuthService {
    private readonly transactionManager: TransactionManager
    private readonly userRepo: UserRepository;

    constructor({sequelizeManager,userRepository}
        :{sequelizeManager: TransactionManager,userRepository: UserRepository}){
        this.transactionManager = sequelizeManager
        this.userRepo = userRepository
    }

    async register(newUsr:createUserDTO){
        return this.transactionManager.runInTransaction(async (t) => {
            const existUser = await this.userRepo.findByName(newUsr.UserName)
            if (existUser) {
                throw new Error("Username already exist")
            }
            newUsr.Password = await bcrypt.hash(newUsr.Password,Salt_Rounds)
            const {UserID,UserName,Email,RoleID} = await this.userRepo.create(newUsr,t)
            const Token = signJWT(UserID,UserName,'Traveler')
            return {UserID,UserName,Email,RoleID,Token}
        })
    }

    async login(usrName:string, pw:string):Promise<{success:boolean,message?:string,UserID?:string,Username?:string,Token?:string}>{
        const RoleToName: Map<number, string> = new Map([
            [1, "Admin"],
            [2, "DataOperator"],
            [3, "Manager"],
            [4, "Traveler"],
        ])
        const db_Usr = await this.userRepo.findByName(usrName)
        if (!db_Usr) {
            console.log("Username:",usrName,"don't exist")
            return { success:false, message: "Invalid username or password"}
        } 
        const rolename = RoleToName.get(db_Usr.RoleID)
        console.log(rolename)
        const correctPassword = await bcrypt.compare(pw,db_Usr.Password)
        const UsrJWT = correctPassword ? signJWT(db_Usr.UserID,db_Usr.UserName,rolename!) : undefined
        if (!UsrJWT) {
            console.log("Password (pw):",pw,"does not match with db_pw")
            return { success:false , message: "Invalid username or password"}
        }
        return {success: true,UserID:db_Usr.UserID, Username:db_Usr.UserName ,Token:UsrJWT}
    }

    async checkAvailability(domain:string, value:string) {
        let user = undefined
        if (domain === 'name') {
            user = await this.userRepo.findByName(value)
        } else if (domain === 'email'){
            user = await this.userRepo.findByEmail(value)
        }
        return user
    }

    async whoami(tken:string) {
        const me = checkJWT(tken) as JwtUser
        const userId = Number(me.id)

        if (Number.isNaN(userId)) {
            throw new Error("Invalid token payload")
        }

        const user = await this.userRepo.findById(userId)
        if (!user) {
            throw new Error("User not found")
        }

        return {
            id: user.UserID,
            username: user.UserName,
            email: user.Email,
            rolename: me.rolename,
        }
    }

    async updateMe(tken:string, updatedUsr: Partial<updateUserDTO>) {
        return this.transactionManager.runInTransaction(async (transaction) => {
            const me = checkJWT(tken) as JwtUser
            const userId = Number(me.id)

            if (Number.isNaN(userId)) {
                throw new Error("Invalid token payload")
            }

            const currentUser = await this.userRepo.findById(userId, transaction)
            if (!currentUser) {
                throw new Error("User not found")
            }

            const nextUserName = updatedUsr.UserName?.trim() || currentUser.UserName
            const nextEmail = updatedUsr.Email?.trim() || currentUser.Email
            const nextPassword = updatedUsr.Password?.trim()

            if (nextUserName !== currentUser.UserName) {
                const existUser = await this.userRepo.findByName(nextUserName, transaction)
                if (existUser && existUser.UserID !== currentUser.UserID) {
                    throw new Error("Username already exist")
                }
            }

            if (nextEmail !== currentUser.Email) {
                const existEmail = await this.userRepo.findByEmail(nextEmail, transaction)
                if (existEmail && existEmail.UserID !== currentUser.UserID) {
                    throw new Error("Email already exist")
                }
            }

            const payload: updateUserDTO = {
                UserName: nextUserName,
                Email: nextEmail,
            }

            if (nextPassword) {
                payload.Password = await bcrypt.hash(nextPassword, Salt_Rounds)
            }

            await this.userRepo.update(currentUser.UserID, payload, transaction)

            const refreshedToken = signJWT(String(currentUser.UserID), nextUserName, me.rolename ?? "Traveler")

            return {
                user: {
                    id: currentUser.UserID,
                    username: nextUserName,
                    email: nextEmail,
                    rolename: me.rolename,
                },
                Token: refreshedToken,
            }
        })
    }
}

export default AuthService