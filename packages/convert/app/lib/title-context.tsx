import type {WebCodecsController} from '@remotion/webcodecs';
import React, {useEffect, useLayoutEffect, useMemo} from 'react';
import type {VideoThumbnailRef} from '~/components/VideoThumbnail';
import type {RouteAction} from '~/seo';
import {getPageTitle} from '~/seo';
import {DEFAULT_FAVICON} from './default-favicon';
import {useThumbnailAsFavicon} from './use-thumbnail-as-favicon';

export type TitleContextT = {
	filename: string | null;
	setFilename: React.Dispatch<React.SetStateAction<string | null>>;
	outputFilename: string | null;
	setOutputFilename: React.Dispatch<React.SetStateAction<string | null>>;
	progress: number | null;
	setProgress: React.Dispatch<React.SetStateAction<number | null>>;
	setPaused: React.Dispatch<React.SetStateAction<boolean>>;
	paused: boolean;
	favicon: OffscreenCanvas | null;
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
		return {
			filename,
			setFilename,
			progress,
			setProgress,
			favicon,
			outputFilename,
			setOutputFilename,
			paused,
			setPaused,
		};
	}, [filename, progress, favicon, outputFilename, paused]);

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

export const useAddPausedToTitle = (controller: WebCodecsController) => {
	const {setPaused} = useTitle();

	useEffect(() => {
		const onPause = () => {
			setPaused(true);
		};

		const onResume = () => {
			setPaused(false);
		};

		controller.addEventListener('pause', onPause);
		controller.addEventListener('resume', onResume);

		return () => {
			controller.removeEventListener('pause', onPause);
			controller.removeEventListener('resume', onResume);
		};
	}, [controller, setPaused]);
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
		const newFavicon = document.querySelector('link[rel="icon"]');
		if (!newFavicon) {
			throw new Error('No favicon found');
		}

		if (thumbnail) {
			newFavicon.setAttribute('href', thumbnail);
		} else {
			newFavicon.setAttribute('href', DEFAULT_FAVICON);
		}

		return () => {
			newFavicon.setAttribute('href', DEFAULT_FAVICON);
		};
	}, [thumbnail]);
};
