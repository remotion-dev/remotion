import React, {useCallback, useMemo, useState} from 'react';
import {Internals} from 'remotion';
import {LIGHT_TEXT, VERY_LIGHT_TEXT} from '../../helpers/colors';
import {pushUrl} from '../../helpers/url-state';

const lineStyle: React.CSSProperties = {
	whiteSpace: 'nowrap',
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	minWidth: 0,
	fontSize: 12,
	color: VERY_LIGHT_TEXT,
	display: 'inline-block',
};

type LinkInfo =
	| {
			kind: 'local';
			assetPath: string;
			title: string;
	  }
	| {
			kind: 'remote';
			href: string;
			title: string;
	  }
	| null;

const getLinkInfo = (src: string): LinkInfo => {
	const staticBase =
		typeof window === 'undefined' ? null : window.remotion_staticBase;

	if (staticBase && src.startsWith(staticBase + '/')) {
		const assetPath = src.slice(staticBase.length + 1);
		return {
			kind: 'local',
			assetPath: decodeURIComponent(assetPath),
			title: decodeURIComponent(assetPath),
		};
	}

	if (
		src.startsWith('http://') ||
		src.startsWith('https://') ||
		src.startsWith('//')
	) {
		try {
			const url = new URL(src.startsWith('//') ? 'https:' + src : src);
			return {kind: 'remote', href: src, title: url.hostname};
		} catch {
			return {kind: 'remote', href: src, title: src};
		}
	}

	return null;
};

const useAssetLink = (src: string) => {
	const {setCanvasContent} = React.useContext(Internals.CompositionSetters);
	const [hovered, setHovered] = useState(false);

	const linkInfo = useMemo(() => getLinkInfo(src), [src]);

	const onClick = useCallback(
		(e: React.MouseEvent) => {
			if (!linkInfo) {
				return;
			}

			e.preventDefault();
			e.stopPropagation();

			if (linkInfo.kind === 'local') {
				setCanvasContent({type: 'asset', asset: linkInfo.assetPath});
				pushUrl(`/assets/${linkInfo.assetPath}`);
				return;
			}

			window.open(linkInfo.href, '_blank', 'noopener,noreferrer');
		},
		[linkInfo, setCanvasContent],
	);

	const onPointerEnter = useCallback(() => setHovered(true), []);
	const onPointerLeave = useCallback(() => setHovered(false), []);

	const fileNameStyle: React.CSSProperties = useMemo(
		() => ({
			...lineStyle,
			color: linkInfo && hovered ? LIGHT_TEXT : VERY_LIGHT_TEXT,
			cursor: linkInfo ? 'pointer' : undefined,
			textDecoration: 'none',
			display: 'inline-block',
			overflow: 'hidden',
			whiteSpace: 'pre',
			textOverflow: 'ellipsis',
		}),
		[linkInfo, hovered],
	);

	return {linkInfo, onClick, onPointerEnter, onPointerLeave, fileNameStyle};
};

export const TimelineMediaInfo: React.FC<{
	readonly src: string;
}> = ({src}) => {
	// Images aren't supported by mediabunny, so don't even try.
	const fileName = useMemo(() => Internals.getAssetDisplayName(src), [src]);

	const {linkInfo, onClick, onPointerEnter, onPointerLeave, fileNameStyle} =
		useAssetLink(src);

	return (
		<div
			style={fileNameStyle}
			title={linkInfo ? linkInfo.title : fileName}
			onClick={linkInfo ? onClick : undefined}
			onPointerEnter={linkInfo ? onPointerEnter : undefined}
			onPointerLeave={linkInfo ? onPointerLeave : undefined}
		>
			{fileName}
		</div>
	);
};
