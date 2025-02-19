import {DEFAULT_FAVICON} from './lib/default-favicon';
import './tailwind.css';

import {Links, Outlet, Scripts, ScrollRestoration} from '@remix-run/react';

export const Layout = ({children}: {readonly children: React.ReactNode}) => {
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<title>Remotion Convert</title>
				<meta name="description" content="Remotion Convert" />
				<link rel="icon" href={DEFAULT_FAVICON} />
				<link
					rel="manifest"
					href={`${import.meta.env.BASE_URL}manifest.json`}
				/>
				<Links />
			</head>
			<body>
				{children}
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
};

const App = () => {
	return <Outlet />;
};

export default App;
