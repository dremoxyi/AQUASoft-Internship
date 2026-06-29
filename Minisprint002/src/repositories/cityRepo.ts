import type { Transaction } from "sequelize";
import type { CityDTO } from "../models/DataTransferObject/index.ts";

class CityRepository {
    private readonly models: any;

    constructor(models:any){
        this.models = models;
    }

    async test() {
        return 'CityService: Getting City from Database'
    }

    async getCityByID(ID:number, transaction?:Transaction) {
        const city = await this.models.City.findOne({ where: { CityID: ID },transaction});
        return city
    }

    async create(cityDto:CityDTO, transaction?:Transaction) {
        const city = await this.models.City.create(cityDto, {transaction})
        return city
    }

    async delete(ID: number,transaction?:Transaction) {
        const del = await this.models.City.destroy({ where: { CityID: ID },transaction} )
        return del
    }

}

export default CityRepository;