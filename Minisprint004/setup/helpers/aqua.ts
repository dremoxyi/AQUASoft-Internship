import { FactorToUSD } from "../config/currency.ts";


type AquaPriceOffer = {
    Price: number | string;
    Currency: string;
};

type AquaAirport = {
    DistanceKm: number;
};


export type AquaInput = {
    RatingCounts: number;

    Rating: number;
    AmenitiesRate: number;
    CleanlinessRate: number;
    FoodBeverageRate: number;
    SleepQualityRate: number;
    InternetQualityRate: number;

    PriceOffers: AquaPriceOffer[];
    NearestAirports: AquaAirport[];
};



function logisticPrice(price: number) {
    return 100 / (1 + Math.exp((price - 200) / 45));
}

function clamp(value: number, min: number, max: number) {
    return Math.max(min, Math.min(value, max));
}
function normalizeRating(rating:number) {
    return clamp((rating - 1) / 4, 0, 1);
}

function calculateAirportScore(airports: AquaAirport[]) {
    let score = 0;
    let totalWeight = 0;

    airports.forEach((airport, i) => {
        const weight = Math.pow(0.05, i);
        const distance = airport.DistanceKm;

        let airportScore: number;

        if (distance <= 5) {
            airportScore = 0.8 + (distance / 5) * 0.2;
        } else if (distance <= 15) {
            airportScore = 1;
        } else if (distance <= 20) {
            airportScore = 1 - ((distance - 15) / 5) * 0.1;
        } else {
            const decay = (distance - 20) / 80;
            airportScore = 0.9 * (1 - decay);
        }

        airportScore = Math.max(0, Math.min(airportScore, 1));

        score += airportScore * weight;
        totalWeight += weight;
    });

    return totalWeight ? score / totalWeight : 0;
}


export function buildAquaInput(hotel: any): AquaInput {
    const data = hotel.dataValues ?? hotel;

    const reviews = data.Reviews ?? [];
    const priceOffers = data.PriceOffers ?? [];
    const nearestAirports = data.NearestAirports ?? [];

    const avg = (selector: (r: any) => number | null | undefined): number => {
        const values = reviews
            .map(selector)
            .filter((v:any): v is number => v != null);

        if (values.length === 0) {
            return 0;
        }
        return values.reduce((a:any, b:any) => a + b, 0) / values.length;
    };

    return {
        RatingCounts: data.RatingCounts,

        Rating: avg(r => r.Rating),
        AmenitiesRate: avg(r => r.AmenitiesRate),
        CleanlinessRate: avg(r => r.CleanlinessRate),
        FoodBeverageRate: avg(r => r.FoodBeverageRate),
        SleepQualityRate: avg(r => r.SleepQualityRate),
        InternetQualityRate: avg(r => r.InternetQualityRate),

        PriceOffers: priceOffers.map((offer: any) => ({
            Price: offer.Price,
            Currency: offer.Currency
        })),

        NearestAirports: nearestAirports.map((airport: any) => ({
            DistanceKm: airport.DistanceKm
        }))
    };
}

export function calculateAquaRating(data: AquaInput): number {

    const avgPrice =
        data.PriceOffers.reduce(
            (sum, offer) =>
                sum +
                Number(offer.Price) *
                (FactorToUSD.get(offer.Currency) ?? 1),
            0
        ) / Math.max(data.PriceOffers.length, 1);


    const reviewScore =
        (
            normalizeRating(data.Rating             ) * 0.3   +
            normalizeRating(data.CleanlinessRate    ) * 0.25  +
            normalizeRating(data.SleepQualityRate   ) * 0.2   +
            normalizeRating(data.AmenitiesRate      ) * 0.1   +
            normalizeRating(data.FoodBeverageRate   ) * 0.075 +
            normalizeRating(data.InternetQualityRate) * 0.075
        ) * 100;


    const priceScore =  data.PriceOffers.length > 0
                            ? logisticPrice(avgPrice)
                            : 50;


    const airportScore = calculateAirportScore(data.NearestAirports) * 100;

    const rawScore =
        reviewScore  * 0.65 +
        priceScore   * 0.25 +
        airportScore * 0.10

    const prior = 40;
    const priorWeight = 9;

    const aqua =
        data.RatingCounts >= 20
            ? rawScore
            : (rawScore * data.RatingCounts + prior * priorWeight) /
            (data.RatingCounts + priorWeight);

    return Number(aqua.toFixed(2));
}