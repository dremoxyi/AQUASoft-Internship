import { memo } from "react";
import { Link } from "react-router-dom";

import { ratingToStars, currToSymbol, AverageRating } from "../../../shared/utils/Renderer";
import styles from "../SearchResults.module.css";

interface HotelCardProps {
  hotel: any;
}

function HotelCard({ hotel }: HotelCardProps) {
  const hue = hotel.AquaRating*1.2
  const avgRating =
    hotel.RatingCounts > 0
      ? AverageRating(hotel.RatingSum, hotel.RatingCounts)
      : undefined;

  return (
    <Link to={`/hotel/${hotel.HotelID}`} className={styles.card}>
      <div className={styles.content}>
        <h3 className={styles.name}>
          {hotel.HotelName}
        </h3>

      <div className={styles.aquaScore} style={{background: `linear-gradient(135deg, hsl(${hue}, 75%, 48%), hsl(${hue}, 85%, 38%))`,}}>
        AquaScore
        <span className={styles.aquaRatingValue}>
          {hotel.AquaRating}
          <span className={styles.aquaRatingMax}>/100</span>
        </span>
      </div>

        <p className={styles.location}>
          {hotel.Address}, {hotel.City?.CityName},{" "}
          {hotel.City?.Province?.ProvinceName} |{" "}
          {hotel.City?.Province?.Country?.CountryName}
        </p>

        <div className={styles.footer}>
          <div className={styles.rating}>
            <span className={styles.stars}>
              {ratingToStars(Number(avgRating))}
            </span>
            <span className={styles.ratingText}>
              {avgRating} ({hotel.RatingCounts} reviews)
            </span>
          </div>

          <div className={styles.price}>
            From{" "}
            <span className={styles.priceAmount}>
              {hotel.PriceOffers?.[0]?.Price}
              {currToSymbol(hotel.PriceOffers?.[0]?.Currency)}
            </span>
            /night
          </div>
        </div>

        <span className={styles.button}>View Details</span>
      </div>
    </Link>
  );
}

export default memo(HotelCard);