import TransactionManager from "../managers/sequelizeManager.ts"
import AirportRepository from "../repositories/AirportRepository.ts";
import type { createAirportDTO, updateAirportDTO } from "../models/data-transfer-object/index.ts";

class AirportService {
    private readonly transactionManager: TransactionManager

    private readonly Repo: AirportRepository;

    constructor({sequelizeManager,airportRepository}
        :{sequelizeManager: TransactionManager,airportRepository:AirportRepository} ){
        this.transactionManager = sequelizeManager
        this.Repo = airportRepository
    }

    async createAirport(newAirpt:createAirportDTO) {
        return this.transactionManager.runInTransaction(async (t) => {
            const airpt = await this.Repo.create(newAirpt,t)
            return airpt
        })
    }

    async readAirport(){
        const airport = await this.Repo.read()
        return airport
    }

    async findAirport(iata:string) {
        const airport = await this.Repo.findByIata(iata)
        return airport
    }

    async updateAirport(ID: number, updatedAirpt: updateAirportDTO) {
        return this.transactionManager.runInTransaction(async (t) => {
            const airport= await this.Repo.update(ID,updatedAirpt,t)
            return airport
        })
    }

    async deleteAirport(ID: number) {
        return this.transactionManager.runInTransaction(async (t)=> {

            const DeletedAirport = await this.Repo.delete(ID,t)

            return { DeletedAirport }
        })
    }
}

export default AirportService