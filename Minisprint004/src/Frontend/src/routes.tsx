import { createBrowserRouter } from "react-router-dom";

import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import HomePage from "./features/home/page/HomePage";
import HotelPage from "./features/hotels/page/HotelPage";
import UserPage from "./features/users/pages/UserPage";
import Dashboard from "./features/dashboard/Dashboard";
import GroupInvitePage from "./features/magic-links/page/GroupInvitePage";
import NotFound from "./features/notfound/page/NotFound";

export const authPaths = {
	login: "/login",
	register: "/register",
} as const;

export const Paths = {
	homepage: "/",
	hotel: "/hotel/:id",
	user: "/me",
	dashboard: "/dashboard",
	groupInvite: "/group-invite",
} as const;

export const router = createBrowserRouter(
	[
		{
			path: Paths.homepage,
			element: <HomePage />,
		},
		{
			path: Paths.hotel,
			element: <HotelPage />,
		},
		{
			path: Paths.user,
			element: <UserPage />,
		},
		{
			path: Paths.dashboard,
			element: <Dashboard />,
		},
		{
			path: Paths.groupInvite,
			element: <GroupInvitePage />,
		},
		{
			path: authPaths.login,
			element: <Login />,
		},
		{
			path: authPaths.register,
			element: <Register />,
		},
		{
			path: "*",
			element: <NotFound />,
		},
	],
	{
		future: {
			v7_relativeSplatPath: true,
		},
	},
);