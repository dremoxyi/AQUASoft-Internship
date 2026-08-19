import TransactionManager from "../managers/sequelizeManager.ts"
import PriceOfferRepository from "../repositories/PriceOfferRepository.ts"
import type { createPriceOfferDTO, updatePriceOfferDTO } from "../models/data-transfer-object/index.ts";

class PriceOfferService {
    private readonly transactionManager: TransactionManager
    private readonly Repo: PriceOfferRepository;

    constructor({sequelizeManager,priceofferRepository}
        :{sequelizeManager: TransactionManager,priceofferRepository:PriceOfferRepository} ){
        this.transactionManager = sequelizeManager
        this.Repo = priceofferRepository
    }

    async createPriceOffer(newPriceOffer:createPriceOfferDTO) {
        return this.transactionManager.runInTransaction(async (t) => {
            const priceoffer = await this.Repo.create(newPriceOffer,t)
            return priceoffer
        })
    }

    async readPriceOffer(){
        const priceoffer = await this.Repo.read()
        return priceoffer
    }

    async findPriceOffer(ID:number) {
        const priceoffer = await this.Repo.findByID(ID)
        return priceoffer
    }

    async updatePriceOffer(ID: number, updatedPriceOffer: updatePriceOfferDTO) {
        return this.transactionManager.runInTransaction(async (t) => {
            const priceoffer= await this.Repo.update(ID,updatedPriceOffer,t)
            return priceoffer
        })
    }

    async deletePriceOffer(ID: number) {
        return this.transactionManager.runInTransaction(async (t)=> {

            const DeletedPriceOffer = await this.Repo.delete(ID,t)

            return { DeletedPriceOffer }
        })
    }
}

export default PriceOfferService