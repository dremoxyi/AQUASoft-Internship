import type { Transaction } from "sequelize";
import type { RegionDTO } from "../models/DataTransferObject/index.ts";

class RegionRepository {
    private readonly models: any;

    constructor(models:any){
        this.models = models;
    }

    async test() {
        return 'RegionService: Getting Region from Database'
    }

    async getRegionByID(ID:number,transaction?:Transaction) {
        const region = await this.models.Region.findOne({ where: { PropertyStateProvinceID: ID },transaction})
        return region
    }

    async create(regionDto:RegionDTO, transaction?:Transaction) {
        const region = await this.models.Region.create(regionDto, {transaction})
        return region
    }

    async delete(ID: number, transaction?:Transaction) {
        const del = this.models.Region.destroy({ where: { PropertyStateProvinceID: ID },transaction} )
        return del
    }


}

export default RegionRepository;