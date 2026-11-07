import React, {useEffect, useLayoutEffect, useMemo} from 'react';
import type {RouteAction} from '~/seo';
import {getPageTitle} from '~/seo';

export type TitleContextT = {
	filename: string | null;
	setFilename: React.Dispatch<React.SetStateAction<string | null>>;
	outputFilename: string | null;
	setOutputFilename: React.Dispatch<React.SetStateAction<string | null>>;
	progress: number | null;
	setProgress: React.Dispatch<React.SetStateAction<number | null>>;
	setPaused: React.Dispatch<React.SetStateAction<boolean>>;
	paused: boolean;
};

const TitleContext = React.createContext<TitleContextT | null>(null);

export const TitleProvider: React.FC<{
	readonly children: React.ReactNode;
	readonly routeAction: RouteAction;
}> = ({children, routeAction}) => {
	const [filename, setFilename] = React.useState<string | null>(null);
	const [outputFilename, setOutputFilename] = React.useState<string | null>(
		null,
	);
	const [progress, setProgress] = React.useState<number | null>(null);
	const [paused, setPaused] = React.useState(false);

	const value: TitleContextT = useMemo(() => {
		return {
			filename,
			setFilename,
			progress,
			setProgress,
			outputFilename,
			setOutputFilename,
			paused,
			setPaused,
		};
	}, [filename, progress, outputFilename, paused]);

	useLayoutEffect(() => {
		const file = outputFilename ?? filename;
		document.title = [
			progress
				? progress === 1
					? '✅ '
					: paused
						? '⏸️ '
						: `${Math.floor(progress * 100)}% - `
				: null,
			file ? file + ' - ' : null,
			getPageTitle(routeAction),
		]
			.filter(Boolean)
			.join('');
	}, [routeAction, progress, outputFilename, filename, paused]);

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

export const useAddOutputFilenameToTitle = (name: string | null) => {
	const {setOutputFilename} = useTitle();
	useEffect(() => {
		if (name) {
			setOutputFilename(name);
		} else {
			setOutputFilename(null);
		}

		return () => {
			setOutputFilename(null);
		};
	}, [name, setOutputFilename]);
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
