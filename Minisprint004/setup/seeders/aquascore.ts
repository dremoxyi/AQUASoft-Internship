import type { Sequelize } from "sequelize";
import { calculateAquaRating } from "../helpers/aqua.ts";
import { DistanceHaversineKM } from "../helpers/z-helper.ts";


export default async function seedDatabaseAquaRating(sequelize: Sequelize) {

    const Hotel = sequelize.models.Hotel;
    const PriceOffer = sequelize.models.PriceOffer;
    const Airport = sequelize.models.Airport;

    if (!Hotel) throw new Error("AS - Missing Hotel Model")
    if (!PriceOffer) throw new Error("AS - Missing PriceOffer Model")
    if (!Airport) throw new Error("AS - Missing Airport Model")

    const [hotels, airports] = await Promise.all([
        Hotel.findAll({ include: PriceOffer }),
        Airport.findAll()
    ]);

    const values: string[] = [];
    const replacements: Record<string, number> = {};

    hotels.forEach((hotel, i) => {
        const lat = Number(hotel.get("Latitude"));
        const lon = Number(hotel.get("Longitude"));
        const count = Number(hotel.get("RatingCounts"));

        if (!lat || !lon || !count) return;

        const nearestAirports = airports
            .map(a => ({
                ...a.get(),
                DistanceKm: DistanceHaversineKM(
                    lat,
                    lon,
                    Number(a.get("Latitude")),
                    Number(a.get("Longitude"))
                )
            }))
            .sort((a, b) => a.DistanceKm - b.DistanceKm)
            .slice(0, 5);

        const aqua = calculateAquaRating({
            RatingCounts: count,
            Rating: Number(hotel.get("RatingSum")) / count / 10,
            AmenitiesRate: Number(hotel.get("AmenitiesRate")),
            CleanlinessRate: Number(hotel.get("CleanlinessRate")),
            FoodBeverageRate: Number(hotel.get("FoodBeverageRate")),
            SleepQualityRate: Number(hotel.get("SleepQualityRate")),
            InternetQualityRate: Number(hotel.get("InternetQualityRate")),
            PriceOffers: hotel.get("PriceOffers") as any[],
            NearestAirports: nearestAirports
        });

        values.push(`(:id${i}, :aqua${i})`);
        replacements[`id${i}`] = hotel.get("HotelID") as number;
        replacements[`aqua${i}`] = aqua;
    });

    if (!values.length) return [["Aqua Ratings", 0]];

    await sequelize.query(`
        UPDATE "Hotels" h
        SET "AquaRating" = v."AquaRating"
        FROM (VALUES ${values.join(",")})
        AS v("HotelID", "AquaRating")
        WHERE h."HotelID" = v."HotelID";
    `, { replacements });

    return [["Aqua Ratings", values.length]];
}