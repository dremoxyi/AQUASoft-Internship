import { Transaction } from "sequelize";
import type { createUserDTO, updateUserDTO } from "../models/data-transfer-object/index.ts";


class UserRepository {
    private readonly models: any;
    
    constructor(models:any){
        this.models = models;
    }

    async create(newUser:createUserDTO,transaction?:Transaction) {
        try {
            const user = await this.models.User.create(newUser, {transaction})
            return user
        } catch (e) {
            console.log(e)
        }
    }

    async read(){
        const user = await this.models.User.findAll({
            attributes: { exclude: ["Password"] },
            include: [
                {
                    model: this.models.Role,
                    attributes: ["RoleID", "RoleName"],
                },
            ],
            order: [["UserID", "ASC"]],
        })
        return user
    }

    async findByName(name:string, transaction?:Transaction) {
        const user = await this.models.User.findOne({where: {UserName: name}, transaction})
        return user
    }

    async findById(ID:number, transaction?:Transaction) {
        const user = await this.models.User.findOne({where: {UserID: ID}, transaction})
        return user
    }

    async findByEmail(email:string, transaction?:Transaction) {
        const user = await this.models.User.findOne({where: {Email: email}, transaction})
        return user
    }

    async update(ID:number,updUser:updateUserDTO, transaction?:Transaction) {
        const user = await this.models.User.update(updUser, {where : {UserID: ID}, returning: true, transaction} )
        return user
    }

    async delete(ID:number, transaction?:Transaction) {
        const user = await this.models.User.destroy({where: {UserID: ID}, transaction})
        return user
    }
}

export default UserRepository