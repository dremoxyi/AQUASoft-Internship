import type { CityDTO } from "../models/DataTransferObject/index.ts";

class CityRepository {
    private models: any;

    constructor(models:any){
        this.models = models;
    }

    async test() {
        return 'CityService: Getting City from Database'
    }

    async getCityByID(ID:number) {
        const city = await this.models.City.findOne({ where: { CityID: ID }})
        return city
    }

    async create(cityDto:CityDTO) {
        const city = await this.models.City.create(cityDto)
        return city
    }

    async delete(ID: number) {
        const del = await this.models.City.destroy({ where: { CityID: ID }} )
        return del
    }

}

export default CityRepository;