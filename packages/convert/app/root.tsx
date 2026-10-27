import {Links, Outlet, Scripts, ScrollRestoration} from '@remix-run/react';
import {ForceSpecificCursor} from './components/crop-ui/force-specific-cursor';
import {Navbar} from './components/Navbar';
import './tailwind.css';
import {DEFAULT_FAVICON} from './lib/default-favicon';
import {getDescription} from './seo';

const defaultDescription = getDescription({type: 'generic-convert'});

export const Layout = ({children}: {readonly children: React.ReactNode}) => {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<title>Remotion Convert</title>
				<meta name="description" content={defaultDescription} />
				<link rel="icon" href={DEFAULT_FAVICON} />
				<link
					rel="manifest"
					href={`${import.meta.env.BASE_URL}manifest.json`}
				/>
				<script
					// The fixed script applies the saved theme before the first paint.
					// eslint-disable-next-line react/no-danger
					dangerouslySetInnerHTML={{
						__html:
							"(function(){var theme;try{theme=localStorage.getItem('theme')}catch(e){}var choice=theme===null||theme===undefined||theme==='system'?'system':theme==='dark'?'dark':'light';document.documentElement.dataset.themeChoice=choice;document.documentElement.dataset.theme=choice==='dark'||(choice==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches)?'dark':'light'})();",
					}}
				/>
				<Links />
			</head>
			<body className="bg-page">
				{children}
				<ForceSpecificCursor />
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
};

const App = () => {
	return (
		<>
			<Navbar />
			<Outlet />
		</>
	);
};

export default App;
