import './tailwind.css';

import {Links, Outlet, Scripts, ScrollRestoration} from '@remix-run/react';

export function Layout({children}: {readonly children: React.ReactNode}) {
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<title>Remotion Convert</title>
				<meta name="description" content="Remotion Convert" />
				<link rel="icon" href="https://www.remotion.dev/img/favicon.png" />
				<link rel="manifest" href="/convert/manifest.json" />
				<Links />
			</head>
			<body>
				{children}
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export default function App() {
	return <Outlet />;
}
