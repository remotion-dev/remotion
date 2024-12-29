import React, {useEffect, useLayoutEffect, useMemo} from 'react';
import {getPageTitle, RouteAction} from '~/seo';

export type TitleContextT = {
	filename: string | null;
	setFilename: React.Dispatch<React.SetStateAction<string | null>>;
	progress: number | null;
	setProgress: React.Dispatch<React.SetStateAction<number | null>>;
};

const TitleContext = React.createContext<TitleContextT | null>(null);

export const TitleProvider: React.FC<{
	readonly children: React.ReactNode;
	readonly routeAction: RouteAction;
}> = ({children, routeAction}) => {
	const [filename, setFilename] = React.useState<string | null>(null);
	const [progress, setProgress] = React.useState<number | null>(null);

	const value: TitleContextT = useMemo(() => {
		return {filename, setFilename, progress, setProgress};
	}, [filename, progress]);

	useLayoutEffect(() => {
		document.title = [
			progress
				? progress === 1
					? '✅ '
					: `${Math.floor(progress * 100)}% - `
				: null,
			filename ? filename + ' - ' : null,
			getPageTitle(routeAction),
		]
			.filter(Boolean)
			.join('');
	}, [filename, routeAction, progress]);

	return (
		<TitleContext.Provider value={value}>{children}</TitleContext.Provider>
	);
};

export const useTitle = () => {
	const context = React.useContext(TitleContext);
	if (!context) {
		throw new Error('useTitle must be used within a TitleProvider');
	}

	return context;
};

export const useAddFilenameToTitle = (name: string | null) => {
	const {setFilename} = useTitle();
	useEffect(() => {
		if (name) {
			setFilename(name);
		} else {
			setFilename(null);
		}

		return () => {
			setFilename(null);
		};
	}, [name, setFilename]);
};

export const useAddProgressToTitle = (progress: number | null) => {
	const {setProgress} = useTitle();
	useEffect(() => {
		if (progress !== null) {
			setProgress(progress);
		} else {
			setProgress(null);
		}

		return () => {
			setProgress(null);
		};
	}, [progress, setProgress]);
};
