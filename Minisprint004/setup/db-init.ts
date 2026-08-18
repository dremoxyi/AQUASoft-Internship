import { Sequelize } from "sequelize";
import initModels from "../src/Backend/src/models/sequelize/index.ts";
import seedDatabasePermission from "./seeders/roles-permissions.ts";
import seedDatabaseAirport from "./seeders/airport.ts";
import seedDatabaseDatafiniti from "./seeders/datafiniti.ts";
import seedDatabaseAquaRating from "./seeders/aquascore.ts"

function LogItUp(data: Array<Array<[string, number]>>) {
    console.log("\n[Log It Up] Database Seeded with:\n_________________________________");

    data.forEach((subArray) => {
        subArray.forEach(([name, numbr]) => {
            const nb = String(numbr).padStart(5)
            const label = name.padEnd(5)
            console.log("     -", `\x1b[33m${nb}\x1b[0m`, `\x1b[32m${label}\x1b[0m`);
        });
    });
    console.log("‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾\n");
}

async function createPostgresIndexes(sequelize: Sequelize) {
    try {
        await sequelize.query(`
            CREATE EXTENSION IF NOT EXISTS pg_trgm;
        `);

        await sequelize.query(`
            CREATE INDEX IF NOT EXISTS trgm_idx_hotelname
            ON "Hotels"
            USING gin ("HotelName" gin_trgm_ops);
        `);

        await sequelize.query(`
            CREATE INDEX IF NOT EXISTS idx_hotel_cityid 
            ON "Hotels" ("CityID");
        `);

        await sequelize.query(`
            CREATE INDEX IF NOT EXISTS idx_priceoffer_hotel_category_price
            ON "PriceOffers" ("HotelID", "Category", "Price");
        `);

        await sequelize.query(`
            CREATE INDEX IF NOT EXISTS idx_review_hotelid 
            ON "Reviews" ("HotelID");
        `);

    } catch (err) {
        console.log(err)
    }
}



async function main() {
    try {
        const start = Date.now()
        const sequelize = new Sequelize('dev','dremoxyi','admin', {host: 'localhost', dialect: 'postgres', logging:true})

        await sequelize.authenticate();
        initModels(sequelize);
        await sequelize.sync({ force : true });
        await createPostgresIndexes(sequelize);

        const datarolesPromise = seedDatabasePermission(sequelize);
        const datafinitiPromise = seedDatabaseDatafiniti(sequelize);

        const [dataroles, datafiniti] = await Promise.all([datarolesPromise, datafinitiPromise]);
        // Run Sequentially
        const dataairport = await seedDatabaseAirport(sequelize);
        
        await seedDatabaseAquaRating(sequelize);
        
        console.log("\n\n> TIME TO FINISH:", (Date.now() - start) ,"ms\n")
        LogItUp([dataroles,datafiniti,dataairport])

        await sequelize.close
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}
main();