import type { Transaction } from "sequelize";
import type { AirportDTO } from "../models/DataTransferObject/index.ts";

class AirportRepository {
    private readonly models: any;

    constructor(models:any){
        this.models = models;
    }

    async test() {
        return 'AirportService: Getting Airport from Database'
    }

    async getAirportByIataCode(IataCode:string, transaction?:Transaction) {
        const airport = await this.models.Airport.findOne({ where: { Iata_code: IataCode },transaction});
        return airport
    }

    async create(airportDto:AirportDTO, transaction?:Transaction) {
        const airport = await this.models.Airport.create(airportDto, {transaction})
        return airport
    }

    async delete(ID: number,transaction?:Transaction) {
        const del = await this.models.Airport.destroy({ where: { AirportID: ID },transaction} )
        return del
    }

}

export default AirportRepository;