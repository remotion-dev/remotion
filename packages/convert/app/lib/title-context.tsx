import React, {useEffect, useLayoutEffect, useMemo} from 'react';
import {VideoThumbnailRef} from '~/components/VideoThumbnail';
import {getPageTitle, RouteAction} from '~/seo';
import {DEFAULT_FAVICON} from './default-favicon';
import {useThumbnailAsFavicon} from './use-thumbnail-as-favicon';

export type TitleContextT = {
	filename: string | null;
	setFilename: React.Dispatch<React.SetStateAction<string | null>>;
	progress: number | null;
	setProgress: React.Dispatch<React.SetStateAction<number | null>>;
	favicon: OffscreenCanvas | null;
};

const TitleContext = React.createContext<TitleContextT | null>(null);

export const TitleProvider: React.FC<{
	readonly children: React.ReactNode;
	readonly routeAction: RouteAction;
}> = ({children, routeAction}) => {
	const [filename, setFilename] = React.useState<string | null>(null);
	const [progress, setProgress] = React.useState<number | null>(null);
	const [favicon] = React.useState<OffscreenCanvas | null>(() => {
		if (typeof OffscreenCanvas === 'undefined') {
			return null;
		}

		const canvas = new OffscreenCanvas(32, 32);
		canvas.width = 32;
		canvas.height = 32;
		return canvas;
	});

	const value: TitleContextT = useMemo(() => {
		return {filename, setFilename, progress, setProgress, favicon};
	}, [filename, progress, favicon]);

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

export const useCopyThumbnailToFavicon = (
	sourceRef: React.RefObject<VideoThumbnailRef | null>,
) => {
	const {favicon} = useTitle();

	const thumbnail = useThumbnailAsFavicon({
		sourceRef,
		targetRef: favicon,
	});

	useEffect(() => {
		const favicon = document.querySelector('link[rel="icon"]');
		if (!favicon) {
			throw new Error('No favicon found');
		}

		if (thumbnail) {
			favicon.setAttribute('href', thumbnail);
		} else {
			favicon.setAttribute('href', DEFAULT_FAVICON);
		}
		return () => {
			favicon.setAttribute('href', DEFAULT_FAVICON);
		};
	}, [thumbnail]);
};
