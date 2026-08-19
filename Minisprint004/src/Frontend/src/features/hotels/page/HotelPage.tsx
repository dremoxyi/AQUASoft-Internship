import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Virtuoso } from "react-virtuoso";
import { getHotel, submitReview, deleteReview } from "../../../api/hotel-api";
import { whoami } from "../../../api/auth-api";
import Navbar from "../../../shared/ui/navbar/Navbar";
import { ratingToStars, currToSymbol, AverageRating } from "../../../shared/utils/Renderer";
import ReviewCard from "../components/ReviewCard";
import styles from "../HotelPage.module.css";

type RatingFilter = number | "all";

export default function HotelPage() {
  const { id } = useParams<{ id: string }>();
  const [hotel, setHotel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>("all");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);



  const handleSubmitReview = async () => {
    if (!id || reviewRating === 0 || submittingReview) return;

    setSubmittingReview(true);
    setReviewError(null);

    try {
      const review = await submitReview(id, {
        Rating: reviewRating,
        Title: reviewTitle.trim() || undefined,
        Text: reviewText.trim() || undefined,
      });

      setHotel((current: any) => ({
        ...current,
        Reviews: [review, ...(current.Reviews ?? [])],
        RatingCounts:        Number(current.RatingCounts ?? 0)        + 1,
        RatingSum:           Number(current.RatingSum ?? 0)           + reviewRating                            * 10,
        AmenitiesRate:       Number(current.AmenitiesRate ?? 0)       + Number(review.AmenitiesRate ?? 0)       * 10,
        CleanlinessRate:     Number(current.CleanlinessRate ?? 0)     + Number(review.CleanlinessRate ?? 0)     * 10,
        FoodBeverageRate:    Number(current.FoodBeverageRate ?? 0)    + Number(review.FoodBeverageRate ?? 0)    * 10,
        SleepQualityRate:    Number(current.SleepQualityRate ?? 0)    + Number(review.SleepQualityRate ?? 0)    * 10,
        InternetQualityRate: Number(current.InternetQualityRate ?? 0) + Number(review.InternetQualityRate ?? 0) * 10,
      }));

      setReviewTitle("");
      setReviewText("");
      setReviewRating(0);
    } catch (error) {
      console.error(error);
      setReviewError(
        error instanceof Error
          ? error.message
          : "Failed to submit review."
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (deletingReviewId) return;

    try {
      setDeletingReviewId(reviewId);

      await deleteReview(reviewId);

      setHotel((current: any) => {
        if (!current) return current;

        const deletedReview = current.Reviews?.find(
          (review: any) => String(review.ReviewId) === String(reviewId)
        );

        if (!deletedReview) return current;

        return {
          ...current,
          Reviews: current.Reviews.filter(
            (review: any) =>
              String(review.ReviewId) !== String(reviewId)
          ),
          RatingCounts: Math.max(
            0,
            Number(current.RatingCounts ?? 0) - 1
          ),
          RatingSum:
            Number(current.RatingSum ?? 0) -
            Number(deletedReview.Rating ?? 0) * 10,
          AmenitiesRate:
            Number(current.AmenitiesRate ?? 0) -
            Number(deletedReview.AmenitiesRate ?? 0) * 10,
          CleanlinessRate:
            Number(current.CleanlinessRate ?? 0) -
            Number(deletedReview.CleanlinessRate ?? 0) * 10,
          FoodBeverageRate:
            Number(current.FoodBeverageRate ?? 0) -
            Number(deletedReview.FoodBeverageRate ?? 0) * 10,
          SleepQualityRate:
            Number(current.SleepQualityRate ?? 0) -
            Number(deletedReview.SleepQualityRate ?? 0) * 10,
          InternetQualityRate:
            Number(current.InternetQualityRate ?? 0) -
            Number(deletedReview.InternetQualityRate ?? 0) * 10,
        };
      });
    } catch (error) {
      console.error(error);
      setReviewError(
        error instanceof Error
          ? error.message
          : "Failed to delete review."
      );
    } finally {
      setDeletingReviewId(null);
    }
  };

  useEffect(() => {
    if (!id) return;

    async function fetchHotel() {
      try {
        const data = await getHotel(id!);
        setHotel(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchHotel();
  }, [id]);

  useEffect(() => {
    async function fetchCurrentUser() {
      try {
        const me = await whoami();
        setCurrentUser(me);
      } catch (error) {
        console.error(error);
      }
    }

    fetchCurrentUser();
  }, []);

  const hasRatings = hotel?.RatingCounts > 0;
  const avgRatingStr = hasRatings ? AverageRating(hotel.RatingSum, hotel.RatingCounts) : null;
  const avgRatingNum = avgRatingStr ? Number(avgRatingStr) : undefined;

 
  const filteredReviews = useMemo(() => {
    if (!hotel?.Reviews) return [];
    if (ratingFilter === "all") return hotel.Reviews;
    return hotel.Reviews.filter((r: any) => Math.round(r.Rating) === ratingFilter);
  }, [hotel, ratingFilter]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className={styles.state}>Loading...</div>
      </>
    );
  }

  if (!hotel) {
    return (
      <>
        <Navbar />
        <div className={styles.state}>Hotel not found</div>
      </>
    );
  }

  const locationLine = [
    hotel.City?.CityName,
    hotel.City?.Province?.ProvinceName,
    hotel.City?.Province?.Country?.CountryName,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <Navbar />
      <main className={styles.page}>
        <section className={styles.hero}>
          {locationLine && <p className={styles.breadcrumb}>{locationLine}</p>}

          <div className={styles.titleRow}>
            <div>
              <h1 className={styles.hotelName}>{hotel.HotelName}</h1>
              <p className={styles.address}>{hotel.Address}</p>
            </div>

            <div className={styles.headerBadges}>
              {hasRatings ? (
                <div className={styles.ratingBadge}>
                  <span className={styles.stars}>
                    {ratingToStars(avgRatingNum)}
                  </span>

                  <div className={styles.ratingNumbers}>
                    <span className={styles.ratingValue}>
                      {avgRatingStr}
                    </span>

                    <span className={styles.ratingCount}>
                      {hotel.RatingCounts} rating{hotel.RatingCounts === 1 ? "" : "s"}
                    </span>
                  </div>
                </div>
              ) : (
                <span className={styles.ratingCount}>No ratings yet</span>
              )}

              <div
                className={styles.aquaBadge}
                style={{
                  background: `linear-gradient(
                    90deg,
                    hsl(${hotel.AquaRating * 1.2}, 80%, 42%),
                    hsl(${Math.min(120, hotel.AquaRating * 1.2 + 18)}, 82%, 56%)
                  )`
                }}
              >
                <span className={styles.aquaLabel}>AquaScore</span>

                <span className={styles.aquaValue}>
                  {hotel.AquaRating}
                  <span className={styles.aquaMax}>/100</span>
                </span>
              </div>
            </div>
          </div>

          <div className={styles.metaStrip}>
            {hotel.HotelGroup && <span>{hotel.HotelGroup.GroupName}</span>}
            <span>ID {hotel.HotelID}</span>
            <span>
              {hotel.Latitude}, {hotel.Longitude}
            </span>
          </div>

          <div className={styles.categoryRatings}>
            {[
              ["Amenities", hotel.AmenitiesRate],
              ["Cleanliness", hotel.CleanlinessRate],
              ["Food & Beverage", hotel.FoodBeverageRate],
              ["Sleep Quality", hotel.SleepQualityRate],
              ["Internet", hotel.InternetQualityRate],
            ].map(([label, value]) => {
              const rating =
                value != null && hotel.RatingCounts > 0
                  ? Number((Number(value) / 10 / Number(hotel.RatingCounts)).toFixed(1))
                  : null;

              return (
                <div key={label} className={styles.categoryCard}>
                  <div className={styles.categoryHeader}>
                    <span className={styles.categoryLabel}>{label}</span>

                    <span className={styles.categoryValue}>
                      {rating != null ? `${rating.toFixed(1)}/5` : "—"}
                    </span>
                  </div>

                  <div className={styles.categoryBar}>
                    <div
                      className={styles.categoryBarFill}
                      style={{
                        width: `${((rating ?? 0) / 5) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className={styles.factsGrid}>
            {hotel.PriceOffers?.length > 0 && (
              <div className={styles.factsColumn}>
                <h2 className={styles.sectionLabel}>Price Offers</h2>
                <table className={styles.rateTable}>
                  <tbody>
                    {hotel.PriceOffers.map((offer: any) => (
                      <tr key={offer.PriceOfferID}>
                        <td>{offer.Category}</td>
                        <td className={styles.priceAmount}>
                          {offer.Price} {currToSymbol(offer.Currency) ?? offer.Currency}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className={styles.factsColumn}>
              {hotel.NearestAirports?.length > 0 && (
                <>
                  <h2 className={styles.sectionLabel}>Nearest Airports</h2>
                  <ul className={styles.compactList}>
                    {hotel.NearestAirports.map((airport: any) => (
                      <li key={airport.AirportID}>
                        <span>
                          <strong>{airport.IataCode}</strong> {airport.AirportName}
                        </span>
                        <span className={styles.muted}>{airport.DistanceKm} km</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {hotel.Users?.length > 0 && (
                <>
                  <h2 className={styles.sectionLabel}>Managers</h2>
                  <ul className={styles.compactList}>
                    {hotel.Users.map((user: any) => (
                      <li key={user.UserID}>
                        <span>{user.UserName}</span>
                        <span className={styles.muted}>{user.Email}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        </section>
          <section className={styles.reviews}>
            <div className={styles.reviewForm}>
              <h2 className={styles.reviewFormTitle}>Write a review</h2>

              <div className={styles.reviewStars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={star <= reviewRating ? styles.reviewStarActive : styles.reviewStar}
                    onClick={() => setReviewRating(star)}
                    disabled={submittingReview}
                  >
                    {star <= reviewRating ? "★" : "☆"}
                  </button>
                ))}
              </div>

              <input
                type="text"
                placeholder="Title (optional)"
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                maxLength={255}
                disabled={submittingReview}
              />

              <textarea
                placeholder="Description (optional)"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                disabled={submittingReview}
              />

              <button
                type="button"
                onClick={handleSubmitReview}
                disabled={reviewRating === 0 || submittingReview}
              >
                {submittingReview ? "Submitting..." : "Submit review"}
              </button>

              {reviewError && (
                <p className={styles.reviewError}>{reviewError}</p>
              )}
            </div>
            <div className={styles.reviewsHead}>
              <h2 className={styles.reviewsTitle}>
                Reviews <span className={styles.reviewsCount}>({filteredReviews.length})</span>
              </h2>

              <div className={styles.filterBar} role="group" aria-label="Filter by rating">
                <button
                  type="button"
                  className={`${styles.filterBtn} ${
                    ratingFilter === "all" ? styles.filterBtnActive : ""
                  }`}
                  onClick={() => setRatingFilter("all")}
                >
                  All
                </button>
                {[5, 4, 3, 2, 1].map((r) => (
                  <button
                    type="button"
                    key={r}
                    className={`${styles.filterBtn} ${
                      ratingFilter === r ? styles.filterBtnActive : ""
                    }`}
                    onClick={() => setRatingFilter(r)}
                  >
                    {r}★
                  </button>
                ))}
              </div>
            </div>

            {filteredReviews.length > 0 ? (
              <Virtuoso
                style={{ padding: "0 1rem" }}
                useWindowScroll
                data={filteredReviews}
                itemContent={(_index, review) => {
                  const canDeleteReview =
                    currentUser?.rolename === "Admin" ||
                    currentUser?.rolename === "DataOperator" ||
                    String(review.UserID) === String(currentUser?.id);

                  return (
                    <ReviewCard
                      review={review}
                      canDelete={canDeleteReview}
                      onDelete={() => handleDeleteReview(String(review.ReviewId))}
                      deleting={deletingReviewId === String(review.ReviewId)}
                    />
                  );
                }}
              />
            ) : (
              <p className={styles.emptyReviews}>No reviews match this rating.</p>
            )}
          </section>
      </main>
    </>
  );
}