import { forwardRef,useEffect, useMemo, useState, useRef, type FormEvent } from "react";
import { VirtuosoGrid, type VirtuosoGridProps } from "react-virtuoso";
import { createHotel, getHotels, updateHotel, deleteHotel, type HotelInput } from "../../../../api/hotel-api";
import { getHotelGroups } from "../../../../api/hotel-group-api";
import type { AuthUser, DashboardHotelGroupRecord } from "../../../../api/auth-api";
import type { DashboardHotel } from "../../../../api/hotel-api";
import type { RoleName, RolePermissionConfig } from "../../permissions";
import LocationPicker from "./component/LocationPicker";
import HotelListCard from "./component/HotelListCard";
import parentStyles from "../../Dashboard.module.css";
import styles from "./index.module.css";
import { forwardGeocode, reverseGeocode } from "./component/geo_helper";

type PriceOfferForm = {
    PriceOfferID?: number;
    Category: "budget" | "standard" | "comfort" | "premium" | "luxury";
    Price: string;
    Currency: "USD" | "EUR" | "GBP" | "RON" | "JPY" | "CNY" | "CHF" | "RUB";
};

type HotelFormState = {
	HotelName: string;
	Address: string;
	Longitude: string;
	Latitude: string;
	CityName: string;
	ProvinceName: string;
	CountryName: string;
	HGroupID: string;
	PriceOffers: PriceOfferForm[];
};

const EMPTY_FORM: HotelFormState = {
	HotelName: "",
	Address: "",
	Longitude: "",
	Latitude: "",
	CityName: "",
	ProvinceName: "",
	CountryName: "",
	HGroupID: "",
	PriceOffers: [],
};

type Props = {
	role: RoleName;
	user: AuthUser;
	rolePermissions: RolePermissionConfig;
};

function formatLocation(hotel: DashboardHotel) {
	return [
		hotel.City?.CityName,
		hotel.City?.Province?.ProvinceName,
		hotel.City?.Province?.Country?.CountryName,
	]
		.filter(Boolean)
		.join(" · ");
}

function getHotelGroupMemberRole(hotel: DashboardHotel, actorId?: number) {
	if (!hotel.HotelGroup || actorId == null) return null;

	const member = hotel.HotelGroup.Users?.find((entry) => Number(entry.UserID) === actorId);
	const membership = member?.HotelGroupManagers ?? member;

	if (!membership || membership.MembershipStatus === "PENDING") return null;

	return membership.ManagerRole ?? null;
}

function canViewHotel(hotel: DashboardHotel, role: RoleName, rolePermissions:RolePermissionConfig, userId?: number) {
	if (role === "Admin" || rolePermissions[role]?.accessMode === "Every") {
		return true;
	}

	if (!userId) {
		return false;
	}

	if (hotel.HotelGroup?.HGroupId != null) {
		return getHotelGroupMemberRole(hotel, userId) != null || (hotel.Users ?? []).some((manager) => Number(manager.UserID) === userId);
	}

	return (hotel.Users ?? []).some((manager) => Number(manager.UserID) === userId);
}

function canEditHotel(hotel: DashboardHotel, role: RoleName, rolePermissions: RolePermissionConfig, userId?: number) {
	if (role === "Admin" || rolePermissions[role]?.accessMode === "Every") {
		return true;
	}

	if (!userId) {
		return false;
	}

	const groupRole = getHotelGroupMemberRole(hotel, userId);

	if (hotel.HotelGroup?.HGroupId != null) {
		return groupRole === "OWNER" || groupRole === "MANAGER";
	}

	return (hotel.Users ?? []).some((manager) => Number(manager.UserID) === userId);
}

const GridList = forwardRef<
    HTMLDivElement,
    React.ComponentPropsWithoutRef<"div">
>(({ style, children, ...props }, ref) => (
    <div
        {...props}
        ref={ref}
        style={{
            ...style,
            display: "flex",
            flexWrap: "wrap",
            alignContent: "flex-start",
            width: "100%",
        }}
    >
        {children}
    </div>
));

const GridItem = forwardRef<
    HTMLDivElement,
    React.ComponentPropsWithoutRef<"div">
>(({ children, style, ...props }, ref) => (
    <div
        {...props}
        ref={ref}
        style={{
            ...style,
            width: "33.333333%",
            display: "flex",
            flex: "none",
            boxSizing: "border-box",
            padding: "0.5rem",
        }}
    >
        {children}
    </div>
));

const gridComponents: VirtuosoGridProps<DashboardHotel>["components"] = {
	List: GridList,
	Item: GridItem,
};

export default function HotelsTab({ role, user, rolePermissions }: Props) {
	const editFormRef = useRef<HTMLFormElement | null>(null);
	
	const [hotels, setHotels] = useState<DashboardHotel[]>([]);
	const [search, setSearch] = useState("");
	const [groups, setGroups] = useState<DashboardHotelGroupRecord[]>([]);
	const [loading, setLoading] = useState(true);
	const [groupLoading, setGroupLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [mode, setMode] = useState<"view" | "create" | "edit">("view");
	const [editingId, setEditingId] = useState<number | null>(null);
	const [form, setForm] = useState<HotelFormState>(EMPTY_FORM);

	const userId = user.id != null ? Number(user.id) : undefined;

	useEffect(() => {
		let mounted = true;

		(async () => {
			try {
				setLoading(true);
				const data = await getHotels();

				if (mounted) {
					setHotels(Array.isArray(data) ? data : []);
				}
			} catch (err) {
				if (mounted) {
					setError(err instanceof Error ? err.message : "Unable to load hotels");
				}
			} finally {
				if (mounted) {
					setLoading(false);
				}
			}
		})();

		return () => {
			mounted = false;
		};
	}, []);

	useEffect(() => {
		let mounted = true;

		(async () => {
			try {
				setGroupLoading(true);
				const data = await getHotelGroups();

				if (mounted) {
					setGroups(Array.isArray(data) ? data : []);
				}
			} catch {
				if (mounted) {
					setGroups([]);
				}
			} finally {
				if (mounted) {
					setGroupLoading(false);
				}
			}
		})();

		return () => {
			mounted = false;
		};
	}, []);

	const visibleHotels = useMemo(() => {
		return hotels.filter((hotel) => canViewHotel(hotel, role, rolePermissions,userId ));
	}, [hotels, role, rolePermissions,userId]);

	const filteredHotels = useMemo(() => {
		const query = search.trim().toLowerCase();

		if (!query) {
			return visibleHotels;
		}

		return visibleHotels.filter((hotel) => {
			const location = formatLocation(hotel);

			return [
				hotel.HotelName,
				hotel.Address,
				location,
				hotel.City?.CityName,
				hotel.City?.Province?.ProvinceName,
				hotel.City?.Province?.Country?.CountryName,
			]
				.filter(Boolean)
				.some((value) => String(value).toLowerCase().includes(query));
		});
	}, [visibleHotels, search]);

	const canEdit = role === "Admin" || Boolean(rolePermissions[role]?.hotels);

	function resetForm() {
		setForm(EMPTY_FORM);
		setEditingId(null);
	}

	function openCreate() {
		resetForm();
		setMode("create");
	}

	function openEdit(hotel: DashboardHotel) {
		setEditingId(hotel.HotelID);

		setForm({
			HotelName: hotel.HotelName ?? "",
			Address: hotel.Address ?? "",
			Longitude: String(hotel.Longitude ?? ""),
			Latitude: String(hotel.Latitude ?? ""),
			CityName: hotel.City?.CityName ?? "",
			ProvinceName: hotel.City?.Province?.ProvinceName ?? "",
			CountryName: hotel.City?.Province?.Country?.CountryName ?? "",
			HGroupID: hotel.HGroupID != null ? String(hotel.HGroupID) : "",
			PriceOffers: (hotel.PriceOffers ?? []).map((offer: any) => ({
				PriceOfferID: offer.PriceOfferID,
				Category: offer.Category,
				Price: String(offer.Price ?? ""),
				Currency: offer.Currency,
			})),
		});

		setMode("edit");

		requestAnimationFrame(() => {
			const element = editFormRef.current;

			if (!element) return;

			const y = element.getBoundingClientRect().top + window.scrollY - 20;

			window.scrollTo({
				top: y,
				behavior: "smooth",
			});
		});
	}

	function handleChange(field: keyof HotelFormState, value: string) {
		setForm((current) => ({
			...current,
			[field]: value,
		}));
	}
	function addPriceOffer() {
		setForm((current) => ({
			...current,
			PriceOffers: [
				...current.PriceOffers,
				{
					Category: "standard",
					Price: "",
					Currency: "EUR",
				},
			],
		}));
	}

	function updatePriceOffer(
		index: number,
		field: keyof PriceOfferForm,
		value: string
	) {
		setForm((current) => ({
			...current,
			PriceOffers: current.PriceOffers.map((offer, i) =>
				i === index
					? {
						...offer,
						[field]: value,
					}
					: offer
			),
		}));
	}

	function removePriceOffer(index: number) {
		setForm((current) => ({
			...current,
			PriceOffers: current.PriceOffers.filter((_, i) => i !== index),
		}));
	}

	async function handleForwardGeocoding() {
		try {
			const location = await forwardGeocode(
				form.Address,
				form.CityName,
				form.ProvinceName,
				form.CountryName
			);

			handleChange("Latitude", String(location.latitude));
			handleChange("Longitude", String(location.longitude));
		} catch (err) {
			console.error(err);
		}
	}

	async function handleReverseGeocoding(){
		try {
			const location = await reverseGeocode(
				Number(form.Latitude),
				Number(form.Longitude)
			);

			handleChange("Address", location.address);
			handleChange("CityName", location.city);
			handleChange("ProvinceName", location.province);
			handleChange("CountryName", location.country);
		} catch (err) {
			console.error(err);
		}
	}

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError(null);

		if (!userId) {
			setError("You must be signed in to save hotels.");
			return;
		}

		const payload: HotelInput = {
			HotelName: form.HotelName.trim(),
			Address: form.Address.trim(),
			Longitude: Number(form.Longitude),
			Latitude: Number(form.Latitude),
			CityName: form.CityName.trim(),
			ProvinceName: form.ProvinceName.trim(),
			CountryName: form.CountryName.trim(),
			HGroupID: form.HGroupID ? Number(form.HGroupID) : null,
			PriceOffers: form.PriceOffers.map((offer) => ({
				...(offer.PriceOfferID != null
					? { PriceOfferID: offer.PriceOfferID }
					: {}),
				Category: offer.Category,
				Price: Number(offer.Price),
				Currency: offer.Currency,
			})),
		};

		if (
			!payload.HotelName ||
			!payload.Address ||
			Number.isNaN(payload.Longitude) ||
			Number.isNaN(payload.Latitude) ||
			!payload.CityName ||
			!payload.ProvinceName ||
			!payload.CountryName
		) {
			setError("Hotel name, address, city, province, country, longitude, and latitude are required.");
			return;
		}

		try {
			setSaving(true);

			if (mode === "edit" && editingId != null) {
				await updateHotel(editingId, payload);
			} else {
				await createHotel(payload);
			}

			const refreshed = await getHotels();
			setHotels(Array.isArray(refreshed) ? refreshed : []);
			resetForm();
			setMode("view");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Unable to save hotel");
		} finally {
			setSaving(false);
		}
	}

	async function handleDeleteHotel(hotel: DashboardHotel) {
		const confirmed = window.confirm(
			`Remove ${hotel.HotelName ?? `hotel #${hotel.HotelID}`}?`
		);

		if (!confirmed) return;

		try {
			setError(null);
			setSaving(true);

			await deleteHotel(hotel.HotelID);

			const refreshed = await getHotels();
			setHotels(Array.isArray(refreshed) ? refreshed : []);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Unable to remove hotel"
			);
		} finally {
			setSaving(false);
		}
	}

	const title = mode === "edit" ? "Edit Hotel" : "Create Hotel";
	console.log("Hotel rendered");
	return (
		<div className={styles.panel}>
			<div className={parentStyles.sectionHeader}>
				<h2>Hotels</h2>

				<div className={parentStyles.actions}>
					<button type="button" onClick={openCreate}>
						Create Hotel
					</button>

					<button type="button" onClick={() => setMode("view")}>
						View Hotels
					</button>
				</div>
			</div>

			<div className={styles.summaryRow}>
				<div>
					<p className={styles.kicker}>Visible hotels</p>
					<strong>{visibleHotels.length}</strong>
				</div>

				<div>
					<p className={styles.kicker}>Role</p>
					<strong>{role}</strong>
				</div>
			</div>

			{mode !== "view" && canEdit && (
				<form ref={editFormRef} className={styles.form} onSubmit={handleSubmit}>
					<div className={styles.formHead}>
						<div>
							<p className={styles.kicker}>{title}</p>
							<h3>{editingId ? `Hotel #${editingId}` : "New hotel record"}</h3>
						</div>
					</div>

					<div className={styles.formGrid}>
						<label>
							<span>Hotel name</span>
							<input
								value={form.HotelName}
								onChange={(e) => handleChange("HotelName", e.target.value)}
							/>
						</label>

						<label>
							<span>Hotel group</span>
							<select
								value={form.HGroupID}
								onChange={(e) => handleChange("HGroupID", e.target.value)}
								disabled={groupLoading}
							>
								<option value="">No group</option>

								{groups.map((group) => (
									<option key={group.HGroupId} value={group.HGroupId}>
										{group.GroupName ?? `Group ${group.HGroupId}`}
									</option>
								))}
							</select>
						</label>
					</div>

					<div className={styles.mapSection}>
						<div className={styles.mapHeader}>
							<div>
								<span className={styles.mapTitle}>Hotel Location</span>
								<p className={styles.mapHint}>
									{"Click the map or drag the marker to adjust coordinates."} <br/>
									{"If Location Details has been filled, you can also use 'Pinpoint address'"}
								</p>
							</div>
								<button
									type="button"
									className={styles.locateButton}
									onClick={handleForwardGeocoding}
								>
									Pinpoint address
								</button>
						</div>

						<div className={styles.mapWrapper}>
							<LocationPicker
								latitude={form.Latitude}
								longitude={form.Longitude}
								onChange={(location) => {
									handleChange("Latitude", String(location.latitude));
									handleChange("Longitude", String(location.longitude));
								}}
							/>
						</div>
					</div>

					<div className={styles.locationSection}>
						<div className={styles.locationHeader}>
							<div className={styles.locationHeaderText}>
								<p className={styles.kicker}>Location details</p>

								<p className={styles.sectionHint}>
									Use 'Detect address' to fill address details from the pinpoint on the map.
								</p>
							</div>

							<button
								type="button"
								className={styles.locateButton}
								onClick={handleReverseGeocoding}
							>
								Detect address
							</button>
						</div>

						<div className={styles.formGrid}>
							<label>
								<span>Address</span>
								<input
									value={form.Address}
									onChange={(e) => handleChange("Address", e.target.value)}
								/>
							</label>

							<label>
								<span>City</span>
								<input
									value={form.CityName}
									onChange={(e) => handleChange("CityName", e.target.value)}
								/>
							</label>

							<label>
								<span>Province</span>
								<input
									value={form.ProvinceName}
									onChange={(e) => handleChange("ProvinceName", e.target.value)}
								/>
							</label>

							<label>
								<span>Country</span>
								<input
									value={form.CountryName}
									onChange={(e) => handleChange("CountryName", e.target.value)}
								/>
							</label>
						</div>
					</div>

					<div className={styles.locationSection}>
						<div className={styles.locationHeader}>
							<div className={styles.locationHeaderText}>
								<p className={styles.kicker}>Price offers</p>

								<p className={styles.sectionHint}>
									Add the available price offers for this hotel.
								</p>
							</div>
						</div>

						<div className={styles.priceOffers}>
							{form.PriceOffers.length === 0 ? (
								<div className={styles.priceOfferRow}>
									<p className={styles.sectionHint}>
										No price offers added.
									</p>
								</div>
							) : (
								form.PriceOffers.map((offer, index) => (
									<div
										className={styles.priceOfferRow}
										key={offer.PriceOfferID ?? `new-${index}`}
									>
										<label>
											<span>Category</span>
											<select
												value={offer.Category}
												onChange={(e) =>
													updatePriceOffer(
														index,
														"Category",
														e.target.value
													)
												}
											>
												<option value="budget">Budget</option>
												<option value="standard">Standard</option>
												<option value="comfort">Comfort</option>
												<option value="premium">Premium</option>
												<option value="luxury">Luxury</option>
											</select>
										</label>

										<label>
											<span>Price</span>
											<input
												type="number"
												min="0"
												step="0.01"
												value={offer.Price}
												onChange={(e) =>
													updatePriceOffer(
														index,
														"Price",
														e.target.value
													)
												}
											/>
										</label>

										<label>
											<span>Currency</span>
											<select
												value={offer.Currency}
												onChange={(e) =>
													updatePriceOffer(
														index,
														"Currency",
														e.target.value
													)
												}
											>
												<option value="USD">USD</option>
												<option value="EUR">EUR</option>
												<option value="GBP">GBP</option>
												<option value="RON">RON</option>
												<option value="JPY">JPY</option>
												<option value="CNY">CNY</option>
												<option value="CHF">CHF</option>
												<option value="RUB">RUB</option>
											</select>
										</label>

										<div className={styles.priceOfferActions}>
											<button
												type="button"
												className={styles.cancelButton}
												onClick={() => removePriceOffer(index)}
											>
												Remove
											</button>
										</div>
									</div>
								))
							)}

							<div className={styles.priceOfferAddRow}>
								<button
									type="button"
									className={styles.priceOfferAddButton}
									onClick={addPriceOffer}
								>
									+ Add offer
								</button>
							</div>
						</div>
					</div>



					{error && <p className={styles.error}>{error}</p>}

					<div className={styles.formActions}>
						<button
							type="button"
							className={styles.cancelButton}
							onClick={() => {
								resetForm();
								setMode("view");
							}}
						>
							Cancel
						</button>

						<button type="submit" disabled={saving}>
							{saving ? "Saving..." : mode === "edit" ? "Save Changes" : "Create Hotel"}
						</button>
					</div>
				</form>
			)}

			<section className={styles.listArea}>
				<div className={styles.listHead}>
					<h3>{mode === "view" ? "Hotel list" : "Your hotel list"}</h3>
					<p>
						{role === "Admin"
							? "Admins can inspect and edit every hotel."
							: "Managers only see hotels linked to their account."}
					</p>
				</div>

				{loading ? (
					<div className={styles.emptyState}>Loading hotels...</div>
				) : error ? (
					<div className={styles.emptyState}>{error}</div>
				) : visibleHotels.length === 0 ? (
					<div className={styles.emptyState}>No hotels match your account yet.</div>
				) : (
					<>
						<div className={styles.searchBar}>
							<input
								type="search"
								value={search}
								onChange={(event) => setSearch(event.target.value)}
								placeholder="Search hotels..."
								aria-label="Search hotels"
							/>
						</div>

						{filteredHotels.length === 0 ? (
							<div className={styles.emptyState}>
								No hotels match your search.
							</div>
						) : (
						<VirtuosoGrid
							data={filteredHotels}
							className={styles.cards}
							components={gridComponents}
							computeItemKey={(_, record) => record.HotelID}
							itemContent={(_, record) => (
							<HotelListCard
								key={record.HotelID}
								hotel={record}
								onEdit={openEdit}
								onDelete={handleDeleteHotel}
								formatLocation={formatLocation}
								canEdit={canEditHotel(record, role, rolePermissions, userId)}
							/>
							)}
						/>
						)}
					</>
				)}
			</section>
		</div>
	);
}