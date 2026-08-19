import { memo } from "react";
import styles from "../index.module.css";
import type { DashboardHotel } from "../../../../../api/hotel-api";

type Props = {
	hotel: DashboardHotel;
	onEdit: (hotel: DashboardHotel) => void;
	onDelete: (hotel: DashboardHotel) => void;
	formatLocation: (hotel: DashboardHotel) => string;
	canEdit: boolean;
};

function HotelListCard({
	hotel,
	onEdit,
	formatLocation,
	canEdit,
	onDelete,
}: Props) {
	return (
		<article className={styles.card}>
			<div className={styles.cardTop}>
				<div>
					<p className={styles.kicker}>
						Hotel #{hotel.HotelID}
					</p>

					<h4>
						{hotel.HotelName}
					</h4>
				</div>

				<div className={styles.ratingPill}>
					AquaScore {hotel.AquaRating ?? 0}
				</div>
			</div>

			<p className={styles.location}>
				{hotel.Address}
			</p>

			<p className={styles.locationDetail}>
				{formatLocation(hotel) || "Location not set"}
			</p>

			<div className={styles.metaGrid}>
				<span>
					{hotel.City?.CityName ?? "City not set"}
				</span>

				<span>
					{hotel.HotelGroup?.GroupName ??
						`${hotel.HGroupID ?? ""}`}
				</span>

				<span>
					Owners {(hotel.Users ?? []).length}
				</span>
			</div>

			<div className={styles.ownerList}>
				{(hotel.Users ?? []).slice(0, 3).map((manager) => (
					<span
						key={manager.UserID}
						className={styles.ownerChip}
					>
						{manager.UserName ?? `User ${manager.UserID}`}
					</span>
				))}
			</div>

			<div className={styles.cardActions}>
				{canEdit ? (
					<>
					<button
						type="button"
						onClick={() => onEdit(hotel)}
					>
						Edit
					</button>

					<button
						type="button"
						className={styles.dangerButton}
						onClick={() => onDelete(hotel)}
					>
						Delete
					</button>
					</>
				) : (
					<button type="button" disabled>
						Locked
					</button>
				)}
			</div>
		</article>
	);
}

export default memo(HotelListCard);