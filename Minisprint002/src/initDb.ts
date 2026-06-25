import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Sequelize } from 'sequelize';
import { parse } from 'csv-parse/sync';
import defineModels from './models/sequelize/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
interface CsvRow {
    [key: string]: string;
}

async function initDb() {
  const sequelize = new Sequelize('dev', 'dremoxyi', 'admin', {
    host: 'localhost',
    dialect: 'postgres',
    logging: false
  });

  try {
    await sequelize.authenticate();
    console.log('[ SEQUELIZE ] > Connection has been established successfully. <');
    
    // Define models
    defineModels(sequelize);
    await sequelize.sync({force: true});
    const { City, Region, Hotel } = sequelize.models;


    // Read CSV dataset
    const csvPath = path.resolve(__dirname, '../data/Dataset1_AllCSLPropertieswithGlobalIdsandGDSIds_Jun25_1 1.csv');
    const fileContent = fs.readFileSync(csvPath, { encoding: 'utf-8' });

    // Parse CSV
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      delimiter: ';',
      trim: true
    }) as CsvRow[];

    console.log(`Found ${records.length} records in Dataset1.`);

    // To manage IDs and unique constraints without modifying model autoIncrement properties
    const citiesMap = new Map();
    const regionsMap = new Map();
    let cityCounter = 1;
    let regionCounter = 1;

    const hotelsToInsert = [];
    const citiesToInsert = [];
    const regionsToInsert = [];

    for (const row of records) {
      // 1. Process City
      const cityName = row['Property City Name'];
      const countryCode = row['Property Country Code'];
      const cityKey = `${cityName}-${countryCode}`;
      
      let cityId;
      if (citiesMap.has(cityKey)) {
        cityId = citiesMap.get(cityKey);
      } else {
        cityId = cityCounter++;
        citiesMap.set(cityKey, cityId);
        citiesToInsert.push({
          CityID: cityId,
          CityName: cityName,
          Country: countryCode
        });
      }

      // 2. Process Region
      const regionName = row['Property State/Province'];
      let regionId = null;
      if (regionName) {
        if (regionsMap.has(regionName)) {
          regionId = regionsMap.get(regionName);
        } else {
          regionId = regionCounter++;
          regionsMap.set(regionName, regionId);
          regionsToInsert.push({
            PropertyStateProvinceID: regionId,
            PropertyStateProvinceName: regionName
          });
        }
      }

      // 3. Process Hotel
      // Handle decimal parsing for Rating, Lat, Lon based on possible odd formats
      // E.g. '03.May' -> null or handled correctly. Rating is Decimal(3,1)
      let rating:any = parseFloat(row['Sabre Property Rating']!);
      if (isNaN(rating)) rating = null;

      // Ensure Latitute and Longitude format issues with multiple periods are fixed e.g. -32.926.201 -> -32.926201
      const parseCoord = (val:any) => {
        if (!val) return null;
        let parts = val.split('.');
        if (parts.length > 2) {
          val = parts[0] + '.' + parts.slice(1).join('');
        }
        const num = parseFloat(val);
        return isNaN(num) ? null : num;
      };

      hotelsToInsert.push({
        GlobalPropertyID: parseInt(row['Global Property ID']!, 10),
        SourcePropertyID: row['Source Property ID'],
        GlobalPropertyName: row['Global Property Name'],
        GlobalChainCode: row['Global Chain Code'],
        PropertyAddress1: row['Property Address 1'],
        PropertyAddress2: row['Property Address 2'] || null,
        PrimaryAirportCode: row['Primary Airport Code'],
        CityID: cityId,
        PropertyStateProvinceID: regionId,
        PropertyZipPostal: row['Property Zip/Postal'] || null,
        PropertyPhoneNumber: row['Property Phone Number'],
        PropertyFaxNumber: row['Property Fax Number'] || null,
        SabrePropertyRating: rating,
        PropertyLatitude: parseCoord(row['Property Latitude']),
        PropertyLongitude: parseCoord(row['Property Longitude']),
        SourceGroupCode: row['Source Group Code']
      });
    }

    console.log(`Prepared ${citiesToInsert.length} cities, ${regionsToInsert.length} regions, and ${hotelsToInsert.length} hotels.`);

    // Batch insert
    await City!.bulkCreate(citiesToInsert, { ignoreDuplicates: true });
    await Region!.bulkCreate(regionsToInsert, { ignoreDuplicates: true });
    await Hotel!.bulkCreate(hotelsToInsert, { ignoreDuplicates: true });

    console.log('> Database population complete. <');
  } catch (error) {
    console.error('An error occurred during database initialization:', error);
  } finally {
    await sequelize.close();
  }
}

initDb();