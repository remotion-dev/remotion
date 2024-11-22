import {Links, Outlet, Scripts, ScrollRestoration} from '@remix-run/react';
import './tailwind.css';

export function Layout({children}: {readonly children: React.ReactNode}) {
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<title>Remotion Convert</title>
				<meta name="description" content="Remotion Convert" />
				<link rel="icon" href="https://www.remotion.dev/img/favicon.png" />
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
