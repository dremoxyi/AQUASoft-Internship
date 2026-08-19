import { apiClient } from "./API-client"

export type PriceOfferCategory =
    | "budget"
    | "standard"
    | "comfort"
    | "premium"
    | "luxury";

export type PriceOfferCurrency =
    | "USD"
    | "EUR"
    | "GBP"
    | "RON"
    | "JPY"
    | "CNY"
    | "CHF"
    | "RUB";


export type DashboardHotel = {
	HotelID: number;
	HotelName: string;
	Address: string;
	Longitude: number | string;
	Latitude: number | string;
	CityID?: number;
	City?: {
		CityName?: string;
		Province?: {
			ProvinceName?: string;
			Country?: {
				CountryName?: string;
			};
		};
	};
	HGroupID?: number | null;
	AquaRating?: number;
	Users?: Array<{
		UserID?: number;
		UserName?: string;
		Email?: string;
		HotelManager?: { ManagerRole?: string };
		ManagerRole?: string;
	}>;
	HotelGroup?: {
		HGroupId?: number;
		GroupName?: string;
		Users?: Array<{
			UserID?: number;
			UserName?: string;
			Email?: string;
			HotelGroupManagers?: {
				ManagerRole?: string;
				MembershipStatus?: "PENDING" | "ACTIVE";
			};
			ManagerRole?: string;
			MembershipStatus?: "PENDING" | "ACTIVE";
		}>;
	};
	PriceOffers?: Array<{
		PriceOfferID: number;
		Category: PriceOfferCategory;
		Price: number | string;
		Currency: PriceOfferCurrency;
	}>
};

export type PriceOfferInput = {
	PriceOfferID?: number;
	Category: PriceOfferCategory;
	Price: number;
	Currency: PriceOfferCurrency;
}

export type HotelInput = {
  HotelName: string;
  Address: string;
  Longitude: number;
  Latitude: number;
  CityID?: number;
  CityName?: string;
  ProvinceName?: string;
  CountryName?: string;
  HGroupID?: number | null;
  PriceOffers: PriceOfferInput[];
};

export function getHotel(id:string) {
  return apiClient(`/hotel/${id}`, {
    method: "GET",
  })
}

export function getHotels() {
  return apiClient("/hotel", {
    method: "GET",
  })
}

export function createHotel(payload: HotelInput) {
  return apiClient("/hotel", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export function updateHotel(id: number, payload: HotelInput) {
  return apiClient(`/hotel/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  })
}

export function deleteHotel(id: number){
	return apiClient(`/hotel/${id}`,{
		method: "DELETE"
	})
}

export async function submitReview(hotelId: string, review: { Rating: number; Title?: string; Text?: string; }) {
	return apiClient(`/review/hotel/${hotelId}/rating`,{
		method: "POST",
		body: JSON.stringify(review)
	})
}

export async function deleteReview(reviewId: string) {
	return apiClient(`/review/${reviewId}`, {
		method: "DELETE",
	});
}