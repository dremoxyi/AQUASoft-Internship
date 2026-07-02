import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Sequelize } from "sequelize";
import { parse } from "csv-parse/sync";
import defineModels from "./models/sequelize/index.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface CsvRow {
    [key: string]: string;
}

const sequelize = new Sequelize("dev", "dremoxyi", "admin", {
    host: "localhost",
    dialect: "postgres",
    logging: false
});

function readCsv(file: string): CsvRow[] {
    const csvPath = path.resolve(__dirname, "../data", file);
    const content = fs.readFileSync(csvPath, "utf8");

    return parse(content, {
        columns: true,
        delimiter: ";",
        trim: true,
        skip_empty_lines: true
    }) as CsvRow[];
}

function nullable(v?: string) {
    return v === "" || v == null ? null : v;
}

async function initDb() {
    try {
        await sequelize.authenticate();
        console.log("[SEQUELIZE] Connected.");

        defineModels(sequelize);
        await sequelize.sync({ force: true });

        const {
            City,
            Region,
            HotelGroup,
            Airport,
            PriceOffer,
            Review,
            User,
            Hotel
        } = sequelize.models;

        if (!City || !Region || !HotelGroup || !Airport || !Hotel || !User || !Review || !PriceOffer) {
            throw new Error("Models not initialized correctly");
        }

        //
        // =========================
        // HOTELS (source of truth)
        // =========================
        //
        const hotelRows = readCsv("Hotel-ScrapedData.csv");

        //
        // Maps (auto FK generation)
        //
        const cityMap = new Map<string, number>();
        const regionMap = new Map<string, number>();
        const groupMap = new Map<string, number>();

        let cityId = 1;
        let regionId = 1;
        let groupId = 1;

        const cities: any[] = [];
        const regions: any[] = [];
        const groups: any[] = [];
        const hotels: any[] = [];

        for (const h of hotelRows) {
            //
            // CITY
            //
            const cityKey = `${h["Property City Name"]}-${h["Property Country Code"]}`;
            let cId = cityMap.get(cityKey);

            if (!cId) {
                cId = cityId++;
                cityMap.set(cityKey, cId);

                cities.push({
                    CityID: cId,
                    CityName: h["Property City Name"],
                    Country: h["Property Country Code"]
                });
            }

            //
            // REGION
            //
            const regionKey = h["Property State/Province"];
            if (!regionKey) return -100
            let rId = regionMap.get(regionKey);

            if (regionKey) {
                if (!rId) {
                    rId = regionId++;
                    regionMap.set(regionKey, rId);

                    regions.push({
                        PropertyStateProvinceID: rId,
                        PropertyStateProvinceName: regionKey
                    });
                }
            } else {
                rId = undefined;
            }

            //
            // HOTEL GROUP
            //
            const groupName = h["Hotel Group Name"];
            let gId = null;

            if (groupName) {
                gId = groupMap.get(groupName);

                if (!gId) {
                    gId = groupId++;
                    groupMap.set(groupName, gId);

                    groups.push({
                        HotelGroupID: gId,
                        Group_name: groupName
                    });
                }
            }

            //
            // HOTEL
            //
            hotels.push({
                GlobalPropertyID: Number(h["Global Property ID"]),
                SourcePropertyID: nullable(h["Source Property ID"]),
                GlobalPropertyName: h["Global Property Name"],
                GlobalChainCode: nullable(h["Global Chain Code"]),
                PropertyAddress1: h["Property Address 1"],
                PropertyAddress2: nullable(h["Property Address 2"]),
                PrimaryAirportCode: nullable(h["Primary Airport Code"]),

                CityID: cId,
                PropertyStateProvinceID: rId,
                HotelGroupID: gId,

                PropertyZipPostal: nullable(h["Property Zip/Postal"]),
                PropertyPhoneNumber: h["Property Phone Number"],
                PropertyFaxNumber: nullable(h["Property Fax Number"]),

                SabrePropertyRating: nullable(h["Sabre Property Rating"])
                    ? Number(h["Sabre Property Rating"])
                    : null,

                PropertyLatitude: nullable(h["Property Latitude"])
                    ? Number(h["Property Latitude"])
                    : null,

                PropertyLongitude: nullable(h["Property Longitude"])
                    ? Number(h["Property Longitude"])
                    : null,

                SourceGroupCode: nullable(h["Source Group Code"])
            });
        }

        //
        // =========================
        // BULK INSERTS
        // =========================
        //

        await City.bulkCreate(cities);
        console.log(`Inserted Cities: ${cities.length}`);

        await Region.bulkCreate(regions);
        console.log(`Inserted Regions: ${regions.length}`);

        await HotelGroup.bulkCreate(groups);
        console.log(`Inserted HotelGroups: ${groups.length}`);

        await Hotel.bulkCreate(hotels);
        console.log(`Inserted Hotels: ${hotels.length}`);

        // ===========
        // REVIEWS
        // ===========
        const reviewRows = readCsv("Review-ScrapedData.csv");
        
        const userMap = new Map<string, number>();
        let userIdCounter = 1;

        const users: any[] = [];
        const reviews: any[] = [];
        for (const r of reviewRows) {
            // USER (auto-create if not exists)
            const username = r["Username"];
            if (!username) throw new Error("Missing Username in Review.csv")

            let uId = userMap.get(username);

            if (!uId) {
                uId = userIdCounter++;

                userMap.set(username, uId);

                users.push({
                    UserID: uId,
                    Username: username
                });
            }
            // REVIEW
            reviews.push({
                ReviewID: Number(r["Reviews Id"]),
                HotelID: Number(r["Hotel Id"]),
                UserID: uId,

                Message: r["Message"] || null,

                OverallRating: Number(r["OverallRating"]),
                ValueRating: Number(r["ValueRating"]),
                RoomsRating: Number(r["RoomsRating"]),
                LocationRating: Number(r["LocationRating"]),
                CleanlinessRating: Number(r["CleanlinessRating"]),
                ServiceRating: Number(r["ServiceRating"]),
                SleepQualityRating: Number(r["SleepQualityRating"])
            });
        }

        await User.bulkCreate(users);
        console.log(`Inserted Users: ${users.length}`);

        await Review.bulkCreate(reviews);
        console.log(`Inserted Reviews: ${reviews.length}`);

        // ======
        // PRICES
        // ======
        const PriceRows = readCsv("PriceOffers-ScrapedData.csv")
        
        const priceOffers: any[] = []
        for (const p of PriceRows) {
            const hotelId = Number(p["HotelID"]);

            priceOffers.push(
                {
                    PriceOfferID: Number(p["PriceOfferID"]),
                    HotelID: hotelId,
                    Category: p["Category"],
                    Price: Number(p["Price"])
                }
            );
        }
        await PriceOffer.bulkCreate(priceOffers);
        console.log(`Inserted PriceOffers: ${priceOffers.length}`);

        // ========
        // AIRPORTS
        // ========
        const airportRows = readCsv("Airport-ScrapedData.csv");

        const airports = airportRows.map(a => ({
            AirportID: Number(a.AirportID),
            Iata_code: a.Iata_code,
            Airport_name: a.Airport_name,
            CityID: Number(a.CityID),
            Latitude: Number(a.Latitude),
            Longitude: Number(a.Longitude)
        }));

        await Airport.bulkCreate(airports);
        console.log(`Inserted Airports: ${airports.length}`);

        console.log("Database successfully initialized!");
    } catch (err) {
        console.error(err);
    } finally {
        await sequelize.close();
    }
}

initDb();