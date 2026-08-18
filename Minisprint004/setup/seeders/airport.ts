import type { Sequelize } from "sequelize";
import { airports_list } from "../config/airport.ts";

export default async function seedAirports(sequelize: Sequelize): Promise<Array<[string, number]>>  {
	const City = sequelize.models.City!;
	const Airport = sequelize.models.Airport!;
	const Province = sequelize.models.Province!;
	const Country = sequelize.models.Country!;

  const airports = airports_list

 const country = await Country.findOne({ where: {CountryName: "US"} });

	if (!country) {
		throw new Error("US country missing");
	}

	const countryId = country.get("CountryID") as number;
	const provinces = await Province.findAll({ where:{ CountryID: countryId } });
	const provinceMap = new Map<string, number>();

	for (const province of provinces) {

    provinceMap.set(
        `${province.get("ProvinceName")}|${countryId}`,
        province.get("ProvinceID") as number
    );


	}

	const cities = await City.findAll({
		attributes:[
			"CityID",
			"CityName",
			"ProvinceID"
		]
	});


	const cityMap = new Map<string, number>();

	for (const city of cities) {

		cityMap.set(
			`${city.get("CityName")}|${city.get("ProvinceID")}`,
			city.get("CityID") as number
		);

	}

  const airportData = [];

  for (const airport of airports) {
  const provinceId = provinceMap.get(`${airport.ProvinceName}|${countryId}`);

		if (!provinceId) {
			console.warn(`Missing province: ${airport.ProvinceName}`);
			continue;
		}

		const cityId = cityMap.get(`${airport.CityName}|${provinceId}`);

		if (!cityId) {
			console.warn(`Missing city: ${airport.CityName}, ${airport.ProvinceName}`);
			continue;
		}

		airportData.push({

			IataCode    : airport.IataCode,
			AirportName : airport.AirportName,
			Latitude    : airport.Latitude,
			Longitude   : airport.Longitude,
			CityID      : cityId
		});

	}

	await Airport.bulkCreate(
		airportData,
		{
			ignoreDuplicates:true
		}
	);

	return [["Airports",airportData.length]];
}