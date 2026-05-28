import React, {useCallback, useMemo, useState} from 'react';
import {Internals} from 'remotion';
import {LIGHT_TEXT, VERY_LIGHT_TEXT} from '../../helpers/colors';
import {pushUrl} from '../../helpers/url-state';
import {SELECTION_ENABLED} from './TimelineSelection';

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

export type TimelineAssetLinkInfo = Exclude<LinkInfo, null>;

export const getTimelineAssetLinkInfo = (src: string): LinkInfo => {
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

export const openTimelineAssetLink = (
	linkInfo: TimelineAssetLinkInfo,
	setCanvasContent: React.ContextType<
		typeof Internals.CompositionSetters
	>['setCanvasContent'],
) => {
	if (linkInfo.kind === 'local') {
		setCanvasContent({type: 'asset', asset: linkInfo.assetPath});
		pushUrl(`/assets/${linkInfo.assetPath}`);
		return;
	}

	window.open(linkInfo.href, '_blank', 'noopener,noreferrer');
};

const useAssetLink = (src: string) => {
	const {setCanvasContent} = React.useContext(Internals.CompositionSetters);
	const [hovered, setHovered] = useState(false);

	const linkInfo = useMemo(() => getTimelineAssetLinkInfo(src), [src]);
	const interactive = !SELECTION_ENABLED && linkInfo !== null;

	const onClick = useCallback(
		(e: React.MouseEvent) => {
			if (!linkInfo) {
				return;
			}

			e.preventDefault();
			e.stopPropagation();

			openTimelineAssetLink(linkInfo, setCanvasContent);
		},
		[linkInfo, setCanvasContent],
	);

	const onPointerEnter = useCallback(() => setHovered(true), []);
	const onPointerLeave = useCallback(() => setHovered(false), []);

	const fileNameStyle: React.CSSProperties = useMemo(
		() => ({
			...lineStyle,
			color: interactive && hovered ? LIGHT_TEXT : VERY_LIGHT_TEXT,
			cursor: interactive ? 'pointer' : undefined,
			textDecoration: 'none',
			display: 'inline-block',
			overflow: 'hidden',
			whiteSpace: 'pre',
			textOverflow: 'ellipsis',
			userSelect: 'none',
			WebkitUserSelect: 'none',
		}),
		[interactive, hovered],
	);

	return {
		linkInfo,
		interactive,
		onClick,
		onPointerEnter,
		onPointerLeave,
		fileNameStyle,
	};
};

export const TimelineMediaInfo: React.FC<{
	readonly src: string;
}> = ({src}) => {
	const fileName = useMemo(() => Internals.getAssetDisplayName(src), [src]);

	const {
		linkInfo,
		interactive,
		onClick,
		onPointerEnter,
		onPointerLeave,
		fileNameStyle,
	} = useAssetLink(src);

	return (
		<div
			style={fileNameStyle}
			title={linkInfo ? linkInfo.title : fileName}
			onClick={interactive ? onClick : undefined}
			onPointerEnter={interactive ? onPointerEnter : undefined}
			onPointerLeave={interactive ? onPointerLeave : undefined}
		>
			{fileName}
		</div>
	);
};
