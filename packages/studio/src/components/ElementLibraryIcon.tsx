import React, {useCallback, useContext, useEffect, useState} from 'react';
import {getBrowserStudioOperations} from '../helpers/browser-studio-operations';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {getElementLibraryFavicons} from '../helpers/element-library-favicons';
import {BrowseElementsIcon} from '../icons/browse-elements';

export const ElementLibraryIcon: React.FC<{
	readonly url: string;
	readonly color: string;
	readonly size: number;
}> = ({url, color, size}) => {
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const canFetchHead =
		previewServerState.type === 'connected' &&
		getBrowserStudioOperations() === null;
	const [favicons, setFavicons] = useState<{
		url: string;
		candidates: string[];
	} | null>(null);
	const [failedUrls, setFailedUrls] = useState<string[]>([]);
	useEffect(() => {
		let cancelled = false;
		getElementLibraryFavicons({url, canFetchHead}).then((candidates) => {
			if (cancelled) return;
			setFailedUrls([]);
			setFavicons({url, candidates});
		});
		return () => {
			cancelled = true;
		};
	}, [canFetchHead, url]);
	const faviconUrl =
		favicons?.url === url
			? (favicons.candidates.find(
					(candidate) => !failedUrls.includes(candidate),
				) ?? null)
			: null;
	const [loadedUrl, setLoadedUrl] = useState<string | null>(null);
	const loaded = faviconUrl !== null && loadedUrl === faviconUrl;
	const onLoad = useCallback(() => {
		setLoadedUrl(faviconUrl);
	}, [faviconUrl]);
	const onError = useCallback(() => {
		if (faviconUrl !== null)
			setFailedUrls((current) => [...current, faviconUrl]);
	}, [faviconUrl]);

	return (
		<span
			aria-hidden
			style={{
				display: 'inline-flex',
				flexShrink: 0,
				height: size,
				position: 'relative',
				width: size,
			}}
		>
			{faviconUrl === null ? null : (
				<img
					key={faviconUrl}
					alt=""
					draggable={false}
					referrerPolicy="no-referrer"
					src={faviconUrl}
					onLoad={onLoad}
					onError={onError}
					style={{
						height: '100%',
						objectFit: 'contain',
						visibility: loaded ? 'visible' : 'hidden',
						width: '100%',
					}}
				/>
			)}
			{loaded ? null : (
				<BrowseElementsIcon
					color={color}
					style={{position: 'absolute', inset: 0, height: size, width: size}}
				/>
			)}
		</span>
	);
};
