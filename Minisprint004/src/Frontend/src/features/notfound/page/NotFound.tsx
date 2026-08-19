import { Link } from "react-router-dom";
import styles from "../NotFound.module.css";

export default function NotFound() {
	return (
		<main className={styles.notFound}>
			<section className={styles.notFoundCard}>
				<p className={styles.errorCode}>404</p>

				<h1>Page Not Found</h1>

				<p className={styles.message}>
					The page you were looking for doesn't exist,
					<br />
					or it may have been moved.
				</p>

				<Link to="/" className={styles.homeButton}>
					Return Home
				</Link>
			</section>
		</main>
	);
}