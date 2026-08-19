import { ratingToStars } from "../../../shared/utils/Renderer";
import styles from "./ReviewCard.module.css";

function initials(name?: string) {
  if (!name) return "?";
  return name.trim().charAt(0).toUpperCase();
}

type ReviewCardProps = {
  review: any;
  canDelete: boolean;
  onDelete: () => Promise<void>;
  deleting: boolean;
};

export default function ReviewCard({
  review,
  canDelete,
  onDelete,
  deleting,
}: ReviewCardProps) {
  const subRatings = [
    { label: "Amenities", value: review.AmenitiesRate },
    { label: "Cleanliness", value: review.CleanlinessRate },
    { label: "Food & Beverage", value: review.FoodBeverageRate },
    { label: "Sleep Quality", value: review.SleepQualityRate },
    { label: "Internet", value: review.InternetQualityRate },
  ].filter((s) => s.value !== undefined && s.value !== null);

  return (
    <article className={styles.comment}>
      <div className={styles.avatar}>
        {initials(review.User?.UserName)}
      </div>

      <div className={styles.body}>
        <div className={styles.commentHeader}>
          <span className={styles.author}>
            {review.User?.UserName ?? "Anonymous"}
          </span>

          <span className={styles.stars}>
            {ratingToStars(review.Rating)}
          </span>

          {canDelete && (
          <button
            type="button"
            className={styles.deleteButton}
            onClick={onDelete}
            disabled={deleting}
            aria-label="Delete review"
            title="Delete review"
          >
            {deleting ? (
              "…"
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18" aria-hidden="true">
                <path d="M3 6h18" />
                <path d="M8 6V4h8v2" />
                <path d="M19 6l-1 14H6L5 6" />
                <path d="M10 11v5" />
                <path d="M14 11v5" />
              </svg>
            )}
          </button>
          )}
        </div>

        {review.Title && (
          <h3 className={styles.title}>{review.Title}</h3>
        )}

        {review.Text && (
          <p className={styles.text}>{review.Text}</p>
        )}

        {subRatings.length > 0 && (
          <div className={styles.subRatings}>
            {subRatings.map((s) => (
              <span key={s.label} className={styles.subRatingChip}>
                {s.label}: {s.value}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}