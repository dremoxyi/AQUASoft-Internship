import TransactionManager from "../managers/sequelizeManager.ts"
import HotelRepository from "../repositories/HotelRepository.ts"

class SearchService {
    private readonly transactionManager: TransactionManager
    private readonly Repo: HotelRepository;

    constructor({sequelizeManager,hotelRepository}
        :{sequelizeManager: TransactionManager,hotelRepository:HotelRepository} ){
        this.transactionManager = sequelizeManager
        this.Repo = hotelRepository
    }

    async searchHotel(q: string, l:number, o:number) {
        try {
            const start = Date.now()
            const res = await this.Repo.search(q,l,o);
            console.log("\nTime Spent DB:", Date.now() - start,"ms")
            return res
        } catch (err: any) {
            console.log(err);
            throw err
        }
    }
    }

export default SearchService