import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { activateHotelGroupMembership } from "../../../api/hotel-group-api";
import { Paths, authPaths } from "../../../routes";
import styles from "./GroupInvitePage.module.css";

export default function GroupInvitePage() {
	const [searchParams] = useSearchParams();
	const [message, setMessage] = useState("Activating...");
	const [user, setUser] = useState("");

	useEffect(() => {
		const token = searchParams.get("token");

		if (!token) {
			setMessage("Activation failed.");
			return;
		}

		activateHotelGroupMembership(token)
			.then((membership: any) => {
				setUser(membership.User?.UserName || membership.User?.Email || "");
				setMessage("Your membership has been activated.");
			})
			.catch(() => {
				setMessage("Activation failed.");
			});
	}, [searchParams]);

	return (
		<main className={styles.page}>
			<section className={styles.card}>
				<p className={styles.kicker}>Hotel group membership</p>

				<h1>{user ? `Hi ${user}` : "Activated"}</h1>

				<p className={styles.message}>{message}</p>

				<div className={styles.actions}>
					<Link to={authPaths.login} className={styles.primaryAction}>
						Log in
					</Link>

					<Link to={Paths.homepage}>Go to Homepage</Link>
				</div>
			</section>
		</main>
	);
}