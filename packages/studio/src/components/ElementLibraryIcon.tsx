import React, {useCallback, useState} from 'react';
import {BrowseElementsIcon} from '../icons/browse-elements';

export const ElementLibraryIcon: React.FC<{
	readonly url: string;
	readonly color: string;
	readonly size: number;
}> = ({url, color, size}) => {
	const parsedUrl = new URL(url);
	const {hostname} = parsedUrl;
	const useDirectFavicon =
		!hostname.includes('.') ||
		['.localhost', '.local', '.internal', '.test'].some((suffix) =>
			hostname.endsWith(suffix),
		) ||
		/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname) ||
		hostname.startsWith('[');
	const faviconUrl = useDirectFavicon
		? new URL('/favicon.ico', parsedUrl).href
		: `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=64`;
	const [loadedUrl, setLoadedUrl] = useState<string | null>(null);
	const loaded = loadedUrl === faviconUrl;
	const onLoad = useCallback(() => {
		setLoadedUrl(faviconUrl);
	}, [faviconUrl]);
	const onError = useCallback(() => {
		setLoadedUrl(null);
	}, []);

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
			{loaded ? null : (
				<BrowseElementsIcon
					color={color}
					style={{position: 'absolute', inset: 0, height: size, width: size}}
				/>
			)}
		</span>
	);
};
