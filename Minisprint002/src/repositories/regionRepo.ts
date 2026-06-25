import type { RegionDTO } from "../models/DataTransferObject/index.ts";

class RegionRepository {
    private models: any;

    constructor(models:any){
        this.models = models;
    }

    async test() {
        return 'RegionService: Getting Region from Database'
    }

    async getRegionByID(ID:number) {
        const region = await this.models.Region.findOne({ where: { PropertyStateProvinceID: ID }})
        return region
    }

    async create(regionDto:RegionDTO) {
        const region = await this.models.Region.create(regionDto)
        return region
    }

    async delete(ID: number) {
        const del = this.models.Region.destroy({ where: { PropertyStateProvinceID: ID }} )
        return del
    }


}

export default RegionRepository;