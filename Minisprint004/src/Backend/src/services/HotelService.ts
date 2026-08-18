import TransactionManager from "../managers/sequelizeManager.ts"
import HotelRepository from "../repositories/HotelRepository.ts"
import type { createHotelDTO, updateHotelDTO, updatePriceOfferDTO } from "../models/data-transfer-object/index.ts";
import { buildAquaInput, calculateAquaRating } from "../../../../setup/helpers/aqua.ts"
import type PriceOfferRepository from "../repositories/PriceOfferRepository.ts";
import type { Transaction } from "sequelize";


class HotelService {
    private readonly transactionManager: TransactionManager;
    private readonly Repo: HotelRepository;
    private readonly PriceOffersRepo: PriceOfferRepository;

    private async syncPriceOffers(HotelID: number, submittedOffers: updatePriceOfferDTO[], transaction: Transaction) {
        const existingOffers = await this.PriceOffersRepo.findForHotel(HotelID,transaction);

        for (const existing of existingOffers) {
            const stillExists = submittedOffers.some(
                offer =>
                    offer.PriceOfferID === existing.PriceOfferID
            );

            if (!stillExists) {
                await this.PriceOffersRepo.delete(
                    existing.PriceOfferID,
                    transaction
                );
            }
        }

        for (const offer of submittedOffers) {

            if (offer.PriceOfferID == null) {
                await this.PriceOffersRepo.create(
                    {
                        HotelID,
                        Category: offer.Category,
                        Price: offer.Price,
                        Currency: offer.Currency
                    },
                    transaction
                );

                continue;
            }

            const existing = existingOffers.find(
                (item):boolean =>
                    item.PriceOfferID === offer.PriceOfferID
            );

            if (!existing) {
                throw new Error(
                    "Price offer does not belong to this hotel"
                );
            }

            await this.PriceOffersRepo.update(
                offer.PriceOfferID,
                {
                    Category: offer.Category,
                    Price: offer.Price,
                    Currency: offer.Currency
                },
                transaction
            );
        }
    }

    constructor({sequelizeManager,hotelRepository,priceofferRepository}
        :{sequelizeManager: TransactionManager,hotelRepository:HotelRepository, priceofferRepository: PriceOfferRepository} ){
        this.transactionManager = sequelizeManager
        this.Repo = hotelRepository
        this.PriceOffersRepo = priceofferRepository
    }

    async createHotel(newHotel:createHotelDTO, creatorId?: number) {
        if (creatorId == null) {
            throw new Error("Unauthorized")
        }

        return this.transactionManager.runInTransaction(async (t) => {
            const hotel = await this.Repo.create(newHotel, creatorId, t)
            await this.syncPriceOffers(hotel.HotelID, newHotel.PriceOffers ?? [], t)
            return hotel
        })
    }

    async readHotel(){
        const hotel = await this.Repo.read()
        return hotel
    }

    async findHotel(id:number,transaction?:Transaction) {
        const hotel = await this.Repo.findByID(id,transaction)
        return hotel
    }

    async updateHotel(ID: number, updatedHotel: updateHotelDTO, editorId?: number, role?: string) {
        return this.transactionManager.runInTransaction(async (t) => {
            if (editorId == null) {
                throw new Error("Unauthorized");
            }
            if (role !== "Admin") {
                const current = await this.Repo.findByID(ID, t);
                if (!current) {
                    throw new Error("Hotel not found");
                }

                const hotelGroup = current.HotelGroup;
                if (hotelGroup?.Users?.length) {
                    const groupMember = hotelGroup.Users.find( (manager: any) => Number(manager.UserID) === editorId );
                    const membership = groupMember?.HotelGroupManagers ?? groupMember;
                    const isActive = membership?.MembershipStatus === "ACTIVE" || membership?.ManagerRole === "OWNER";
                    const canEditGroupHotel = isActive && (membership?.ManagerRole === "OWNER" || membership?.ManagerRole === "MANAGER");

                    if (!canEditGroupHotel) {
                        throw new Error("You can only edit your own hotels");
                    }
                } else {
                    const managers = current.Users ?? [];
                    const ownsHotel = managers.some( (manager: any) => Number(manager.UserID) === editorId );

                    if (!ownsHotel) {
                        throw new Error("You can only edit your own hotels");
                    }
                }
            }

            const hotel = await this.Repo.update(ID, updatedHotel, t);
            await this.syncPriceOffers(ID, updatedHotel.PriceOffers ?? [], t);

            const updated = await this.Repo.findByID(ID, t);
            if (!updated) {
                throw new Error("Hotel not found");
            }
            const aquaInput = buildAquaInput(updated);
            const aquaRating = calculateAquaRating(aquaInput);
            await this.Repo.updateAquaRating(ID,aquaRating,t);

            return hotel;
        });
    }

    async deleteHotel(ID: number) {
        return this.transactionManager.runInTransaction(async (t)=> {

            const DeletedHotel = await this.Repo.delete(ID,t)

            return { DeletedHotel }
        })
    }

    async updateAllAquaRatings() {
        return this.transactionManager.runInTransaction(async (t) => {
            const hotels = await this.Repo.findAllIds(t);

            for (const hotel of hotels) {
                await this.updateAquaRating(hotel.HotelID,t);
            }
        })
    }

    async updateAquaRating(
        id: number,
        transaction?: Transaction
    ) {
        const hotel = await this.findHotel(id, transaction);

        const aquaInput = buildAquaInput(hotel);
        const aqua = calculateAquaRating(aquaInput);

        return this.Repo.updateAquaRating(id,aqua,transaction);
    }
}

export default HotelService