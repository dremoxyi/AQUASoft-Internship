import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const datasetPath = resolve(__dirname,
	"../../data/Datafiniti_Hotel_Reviews_Jun19.csv"
);

import { readCsvRows, normalizeValue, toNumber } from '../helpers/csv.ts'
import { findHotelGroup, normalizeHotelName } from '../helpers/hotel.ts'
import { buildAspectScores,clampRating} from '../helpers/ratings.ts'
import { safeEmail, safeUserName } from '../helpers/user.ts'
import { bulkInsertInChunks } from '../helpers/db.ts'
import type { Sequelize } from "sequelize";

export default async function seedHotels(sequelize: Sequelize): Promise<Array<[string, number]>> {
	const { rows } = await readCsvRows(datasetPath);
	const transaction = await sequelize.transaction();
	try {

		const Hotel = sequelize.models.Hotel;
		const Review = sequelize.models.Review;
		const HotelGroup = sequelize.models.HotelGroup;
		const User = sequelize.models.User;
		const Country = sequelize.models.Country;
		const Province = sequelize.models.Province;
		const City = sequelize.models.City;

		if (!Hotel) throw new Error("Hotel model missing");
		if (!Review) throw new Error("Review model missing");
		if (!HotelGroup) throw new Error("HotelGroup model missing");
		if (!User) throw new Error("User model missing");
		if (!Country) throw new Error("Country model missing");
		if (!Province) throw new Error("Province model missing");
		if (!City) throw new Error("City model missing");


		/* ====================================================== */
		/*                     HOTEL GROUPS                       */
		/* ====================================================== */
		const hotelGroupsToCreate = new Map<
			string,
			{
				GroupName: string;
			}
		>();

		for (const row of rows) {
			if (!row.name){
				continue
			}
			const hotelName = normalizeHotelName(row.name);

			if (!hotelName)
				continue;

			const groupName = findHotelGroup(hotelName);

			// No known group (independent hotel)
			if (!groupName)
				continue;

			if (!hotelGroupsToCreate.has(groupName)) {
				hotelGroupsToCreate.set(groupName, {
					GroupName: groupName
				});
			}
		}

		const groupRows = await HotelGroup.bulkCreate(
			[...hotelGroupsToCreate.values()],
			{
				returning: true,
				transaction
			}
		);

		const groupMap = new Map(
			groupRows.map(group => [
				group.get("GroupName") as string,
				group.get("HGroupId") as number
			])
		);


		/* ====================================================== */
		/*             COUNTRIES / PROVINCES / CITIES             */
		/* ====================================================== */

		const countriesCount = new Map<string, number>();

		for (const row of rows) {
			const countryName = normalizeValue(row.country);

			if (!countryName) {
				continue;
			}

			countriesCount.set(
				countryName,
				(countriesCount.get(countryName) ?? 0) + 1
			);
		}

		const countryRows = await Country.bulkCreate(
			[...countriesCount.entries()].map(([CountryName]) => ({
				CountryName,
			})),
			{
				returning: true,
				transaction
			}
		);

		const countryMap = new Map(
			countryRows.map(group => [
				group.get("CountryName") as string,
				group.get("CountryID") as number
			])
		);

		//-------------------

		const provinceCounts = new Map<string, {
			ProvinceName: string;
			CountryID: number;
		}>();

		for (const row of rows) {
			const provinceName = normalizeValue(row.province);
			const countryName = normalizeValue(row.country);

			if (!provinceName || !countryName) {
				continue;
			}

			const countryId = countryMap.get(countryName);

			if (!countryId) {
				continue;
			}

			const key = `${provinceName}|${countryId}`;

			if (!provinceCounts.has(key)) {
				provinceCounts.set(key, {
					ProvinceName: provinceName,
					CountryID: countryId
				});
			}
		}


		const provinceRows = await Province.bulkCreate(
			[...provinceCounts.values()],
			{
				returning: true,
				transaction
			}
		);


		const provinceMap = new Map<string, number>();

		for (const province of provinceRows) {

			const provinceName = province.get("ProvinceName") as string;
			const countryId = province.get("CountryID") as number;

			provinceMap.set(
				`${provinceName}|${countryId}`,
				province.get("ProvinceID") as number
			);
		}

		//-------------------

		const cityCounts = new Map<string, {
			CityName: string;
			ProvinceID: number;
		}>();

		for (const row of rows) {
			const cityName = normalizeValue(row.city);
			const provinceName = normalizeValue(row.province);
			const countryName = normalizeValue(row.country);

			if (!cityName || !provinceName || !countryName) {
				continue;
			}

			const countryId = countryMap.get(countryName);

			if (!countryId) {
				continue;
			}

			const provinceID = provinceMap.get(`${provinceName}|${countryId}`);

			if (!provinceID) {
				continue;
			}

			const key = `${cityName}|${provinceID}`;

			if (!cityCounts.has(key)) {
				cityCounts.set(key, {
					CityName: cityName,
					ProvinceID: provinceID
				});
			}
		}


		const cityRows = await City.bulkCreate(
			[...cityCounts.values()],
			{
				returning: true,
				transaction
			}
		);

		const cityMap = new Map<string, number>();

		for (const city of cityRows) {
			const cityName = city.get("CityName") as string;
			const provinceId = city.get("ProvinceID") as number;

			cityMap.set(
				`${cityName}|${provinceId}`,
				city.get("CityID") as number
			);
		}

		/* ====================================================== */
		/*                        HOTELS                          */
		/* ====================================================== */

		const hotels = new Map<
			string,
			{
				HotelName: string;
				Address: string;
				Longitude: number | null;
				Latitude: number | null;
				CityID: number;
				HGroupID: number | null;
				RatingSum?: number;
				RatingCounts?: number;
			}
		>();

		for (const row of rows) {

			const csvHotelId = normalizeValue(row.id);

			if (!csvHotelId)
				continue;

			if (hotels.has(csvHotelId))
				continue;


			const hotelName = normalizeValue(row.name);

			const normalizedHotelName = normalizeHotelName(hotelName);
			const groupName = findHotelGroup(normalizedHotelName);

			const groupId =
				groupName === null
					? null
					: groupMap.get(groupName) ?? null;

			const cityName = normalizeValue(row.city);
			const provinceName = normalizeValue(row.province);
			const countryName = normalizeValue(row.country);

			const countryId = countryMap.get(countryName);

			const provinceId = countryId
				? provinceMap.get(`${provinceName}|${countryId}`)
				: undefined;

			const cityId = provinceId
				? cityMap.get(`${cityName}|${provinceId}`)
				: undefined;

			if (!cityId)
				continue;

			hotels.set(csvHotelId, {
				HotelName: hotelName,
				Address: normalizeValue(row.address),
				Longitude: toNumber(row.longitude),
				Latitude: toNumber(row.latitude),
				CityID: cityId,
				HGroupID: groupId
			});
		}

		const hotelRows = await Hotel.bulkCreate(
			[...hotels.values()],
			{
				returning: true,
				transaction
			}
		);

		const hotelLookup = new Map<string, number>();

		for (const hotel of hotelRows) {

			const key = `${hotel.get("HotelName")}|${hotel.get("Address")}`;

			hotelLookup.set(
				key,
				hotel.get("HotelID") as number
			);
		}
		const hotelMap = new Map<string, number>();

		for (const row of rows) {

			const key = `${normalizeValue(row.name)}|${normalizeValue(row.address)}`;
			const hotelId = hotelLookup.get(key);

			if (!hotelId)
				continue;

			hotelMap.set(
				normalizeValue(row.id),
				hotelId
			);
		}

		/* ====================================================== */
		/*                         USERS                          */
		/* ====================================================== */

		const users = new Map<
			string,
			{
				UserName: string;
				Email: string;
				Password: string;
				RoleID: number;
			}
		>();

		for (const row of rows) {

			const username = normalizeValue(
				row["reviews.username"]
			);

			if (!username)
				continue;

			if (users.has(username))
				continue;

			const safeName = safeUserName(
				username,
				normalizeValue(row.id)
			);

			users.set(username, {
				UserName: safeName,
				Email: safeEmail(safeName),
				Password: `review-seed-${safeName}`,
				RoleID: 4
			});

		}

		const userRows = await User.bulkCreate(
			[...users.values()],
			{
				returning: true,
				transaction
			}
		);


		const userMap = new Map<string, number>();

		for (const user of userRows) {

			userMap.set(
				user.get("UserName") as string,
				user.get("UserID") as number
			);
		}
		/* ====================================================== */
		/*                     PRICE OFFERS                       */
		/* ====================================================== */

		const priceOfferBatch: Array<{
			Currency: 'USD' | 'EUR' | 'GBP' | 'RON' | 'JPY' | 'CNY' | 'CHF' | 'RUB'
			Category: "budget" | "standard" | "comfort" | "premium" | "luxury";
			Price: number;
			HotelID: number;
		}> = [];

		const hotelPrices = new Map<number, {
			Price:number;
			Currency:string;
		}[]>();

		const categories = [
			{ Category: "budget", multiplier: 0.80 },
			{ Category: "standard", multiplier: 1.00 },
			{ Category: "comfort", multiplier: 1.25 },
			{ Category: "premium", multiplier: 1.60 },
			{ Category: "luxury", multiplier: 2.20 }
		] as const;

		for (const hotelId of hotelMap.values()) {

			// Base nightly price between €60 and €250
			const basePrice = 60 + Math.random() * 190;

			for (const category of categories) {

				// ±10% variation
				const variation = 0.9 + Math.random() * 0.2;

				const price = Math.round(
					basePrice *
					category.multiplier *
					variation
				);

				priceOfferBatch.push({
					Currency: 'USD',	
					Category: category.Category,
					Price: price,
					HotelID: hotelId
				});

				const prices = hotelPrices.get(hotelId) ?? [];


				prices.push({
					Price: price,
					Currency: "USD"
				});


				hotelPrices.set(
					hotelId,
					prices
				);
			}
		}

		await bulkInsertInChunks(
			sequelize.models.PriceOffer!,
			priceOfferBatch,
			1000,
			transaction
		);


		/* ====================================================== */
		/*                        REVIEWS                         */
		/* ====================================================== */
		const hotelRatings = new Map<number, {
			RatingSum: number;
			RatingCounts: number;

			RatingTotal: number;
			AmenitiesTotal: number;
			CleanlinessTotal: number;
			FoodTotal: number;
			SleepTotal: number;
			InternetTotal: number;
		}>();

		const reviewBatch: Array<{
			Title: string;
			Text: string;
			Rating: number;
			AmenitiesRate: number;
			CleanlinessRate: number;
			FoodBeverageRate: number;
			SleepQualityRate: number;
			InternetQualityRate: number;
			UserID: number;
			HotelID: number;
		}> = [];

		for (const row of rows) {

			const username = normalizeValue( row["reviews.username"] );
			if (!username)
				continue;
			const seededUser = users.get(username);
			if (!seededUser)
				continue;

			const userId = userMap.get( seededUser.UserName );
			const hotelId = hotelMap.get( normalizeValue(row.id) );

			if (!userId || !hotelId)
				continue;

			const title = normalizeValue( row["reviews.title"] );
			const text = normalizeValue( row["reviews.text"] );
			const rawRating = toNumber( row["reviews.rating"] );
			const baseRating = clampRating( rawRating ?? 3 );
			const aspectScores = buildAspectScores( text, baseRating );

			const currentRating = hotelRatings.get(hotelId) ?? {
				RatingSum: 0,
				RatingCounts: 0,

				RatingTotal: 0,
				AmenitiesTotal: 0,
				CleanlinessTotal: 0,
				FoodTotal: 0,
				SleepTotal: 0,
				InternetTotal: 0
			};


			currentRating.RatingSum += baseRating * 10;
			currentRating.RatingCounts += 1;


			currentRating.RatingTotal += baseRating;
			currentRating.AmenitiesTotal += aspectScores.AmenitiesRate;
			currentRating.CleanlinessTotal += aspectScores.CleanlinessRate;
			currentRating.FoodTotal += aspectScores.FoodBeverageRate;
			currentRating.SleepTotal += aspectScores.SleepQualityRate;
			currentRating.InternetTotal += aspectScores.InternetQualityRate;


			hotelRatings.set(
				hotelId,
				currentRating
			);

			reviewBatch.push({
				Title: title,
				Text: text,
				Rating: baseRating,
				AmenitiesRate: aspectScores.AmenitiesRate,
				CleanlinessRate: aspectScores.CleanlinessRate,
				FoodBeverageRate: aspectScores.FoodBeverageRate,
				SleepQualityRate: aspectScores.SleepQualityRate,
				InternetQualityRate: aspectScores.InternetQualityRate,
				UserID: userId,
				HotelID: hotelId
			});
		}
		await bulkInsertInChunks(
			Review,
			reviewBatch,
			1000,
			transaction
		);

		
		const values: string[] = [];
		const replacements: Record<string, number> = {};

		let i = 0;

		for (const [HotelID, rating] of hotelRatings.entries()) {
			values.push(`
				(
					:id${i},
					:sum${i},
					:count${i},
					:amenities${i},
					:cleanliness${i},
					:food${i},
					:sleep${i},
					:internet${i}
				)
			`);

			replacements[`id${i}`] = HotelID;
			replacements[`sum${i}`] = rating.RatingSum;
			replacements[`count${i}`] = rating.RatingCounts;

			replacements[`amenities${i}`] =
				rating.AmenitiesTotal * 10;

			replacements[`cleanliness${i}`] =
				rating.CleanlinessTotal * 10;

			replacements[`food${i}`] =
				rating.FoodTotal * 10;

			replacements[`sleep${i}`] =
				rating.SleepTotal * 10;

			replacements[`internet${i}`] =
				rating.InternetTotal * 10;

			i++;
		}

		await sequelize.query(`
			UPDATE "Hotels" AS h
			SET
				"RatingSum" = v."RatingSum",
				"RatingCounts" = v."RatingCounts",

				"AmenitiesRate" = v."AmenitiesRate",
				"CleanlinessRate" = v."CleanlinessRate",
				"FoodBeverageRate" = v."FoodBeverageRate",
				"SleepQualityRate" = v."SleepQualityRate",
				"InternetQualityRate" = v."InternetQualityRate"

			FROM (
				VALUES ${values.join(",")}
			) AS v(
				"HotelID",
				"RatingSum",
				"RatingCounts",
				"AmenitiesRate",
				"CleanlinessRate",
				"FoodBeverageRate",
				"SleepQualityRate",
				"InternetQualityRate"
			)

			WHERE h."HotelID" = v."HotelID";
		`, {
			replacements,
			transaction
		});
		
		await transaction.commit();
		return [["Countries",countriesCount.size],["Provinces",provinceCounts.size],["Cities",cityCounts.size],["Hotel Groups",groupMap.size],["Hotels",hotelMap.size],["Price Offers",priceOfferBatch.length],["Users",userMap.size],["Reviews",reviewBatch.length]]
	} catch (err) {
		await transaction.rollback();
		throw err;
	}
}