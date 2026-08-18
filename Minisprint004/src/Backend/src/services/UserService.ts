import TransactionManager from "../managers/sequelizeManager.ts"
import UserRepository from "../repositories/UserRepository.ts";
import type { createUserDTO, updateUserDTO } from "../models/data-transfer-object/index.ts";
import bcrypt from "bcrypt"

const Salt_Rounds = 10

class UserService {
    private readonly transactionManager: TransactionManager

    private readonly Repo: UserRepository;

    constructor({sequelizeManager,userRepository}
        :{sequelizeManager: TransactionManager,userRepository:UserRepository} ){
        this.transactionManager = sequelizeManager
        this.Repo = userRepository
    }

    async createUser(newUsr:createUserDTO) {
        return this.transactionManager.runInTransaction(async (t) => {
            if (!newUsr.Password?.trim()) {
                throw new Error("Password is required")
            }

            newUsr.Password = await bcrypt.hash(newUsr.Password,Salt_Rounds)
            const user = await this.Repo.create(newUsr,t)
            return user
        })
    }

    async readUser(){
        const user = await this.Repo.read()
        return user
    }

    async findUser(usrName:string) {
        const user = await this.Repo.findByName(usrName)
        return user
    }

    async findEmail(email:string) {
        const user = await this.Repo.findByEmail(email)
        return user
    }

    async updateUser(ID: number, updatedUsr: Partial<updateUserDTO>) {
        return this.transactionManager.runInTransaction(async (t) => {
            const payload: Partial<updateUserDTO> = {
                ...updatedUsr,
            }

            if (payload.Password?.trim()) {
                payload.Password = await bcrypt.hash(payload.Password, Salt_Rounds)
            } else {
                delete payload.Password
            }

            const user= await this.Repo.update(ID,payload as updateUserDTO)
            return user
        })
    }

    async deleteUser(ID: number) {
        return this.transactionManager.runInTransaction(async (t)=> {
            let DeletedReviews = 0;

            const DeletedUser = await this.Repo.delete(ID,t)

            return { DeletedUser, DeletedReviews }
        })
    }
}

export default UserService