import { Transaction } from "sequelize";
import type { createAirportDTO, updateAirportDTO } from "../models/data-transfer-object/index.ts";


class AirportRepository {
    private readonly models: any;
    
    constructor(models:any){
        this.models = models;
    }

    async create(newAirport:createAirportDTO,transaction?:Transaction) {
        const airport = await this.models.Airport.create(newAirport, {transaction})
        return airport
    }

    async read(){
        const airports = await this.models.Airport.findAll();
        return airports;
    }

    async findByIata(iata_code:string, transaction?:Transaction) {
        const airport = await this.models.Airport.findOne({where: {IataCode: iata_code}, transaction})
        return airport
    }

    async update(ID:number,updAirport:updateAirportDTO, transaction?:Transaction) {
        const airport = await this.models.Airport.update(updAirport, {where : {AirportID: ID}, returning: true, transaction} )
        return airport
    }

    async delete(ID:number, transaction?:Transaction) {
        const airport = await this.models.Airport.destroy({where: {AirportID: ID}, transaction})
        return airport
    }
}

export default AirportRepository