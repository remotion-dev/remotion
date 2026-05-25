import {getImageDimensions} from '@remotion/media-utils';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Internals} from 'remotion';
import {LIGHT_TEXT, VERY_LIGHT_TEXT} from '../../helpers/colors';
import {formatMediaDuration} from '../../helpers/format-media-duration';
import {pushUrl} from '../../helpers/url-state';
import {useMediaMetadata} from '../../helpers/use-media-metadata';

const containerStyle: React.CSSProperties = {
	fontFamily: 'Arial, Helvetica, sans-serif',
	fontSize: 12,
	lineHeight: 1,
	overflow: 'hidden',
	whiteSpace: 'nowrap',
	textOverflow: 'ellipsis',
	minWidth: 0,
	marginTop: 2,
};

const lineStyle: React.CSSProperties = {
	whiteSpace: 'nowrap',
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	minWidth: 0,
	fontSize: 12,
	color: VERY_LIGHT_TEXT,
	lineHeight: 1.3,
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
		}),
		[linkInfo, hovered],
	);

	return {linkInfo, onClick, onPointerEnter, onPointerLeave, fileNameStyle};
};

export const TimelineMediaInfo: React.FC<{
	readonly src: string;
	readonly type: 'audio' | 'video' | 'image';
}> = ({src, type}) => {
	// Images aren't supported by mediabunny, so don't even try.
	const metadata = useMediaMetadata(type === 'image' ? null : src);
	const fileName = useMemo(() => Internals.getAssetDisplayName(src), [src]);

	const {linkInfo, onClick, onPointerEnter, onPointerLeave, fileNameStyle} =
		useAssetLink(src);

	const [imageDimensions, setImageDimensions] = useState<{
		width: number;
		height: number;
	} | null>(null);

	useEffect(() => {
		if (type !== 'image') {
			return;
		}

		let cancelled = false;
		setImageDimensions(null);

		getImageDimensions(src)
			.then((dims) => {
				if (cancelled) {
					return;
				}

				setImageDimensions({width: dims.width, height: dims.height});
			})
			.catch(() => {
				// Non-image or load failure — ignore silently.
			});

		return () => {
			cancelled = true;
		};
	}, [src, type]);

	const detailsLine = useMemo(() => {
		if (type === 'image') {
			if (!imageDimensions) {
				return null;
			}

			return `${imageDimensions.width}x${imageDimensions.height}`;
		}

		if (!metadata) {
			return null;
		}

		const parts: string[] = [];
		parts.push(metadata.format);

		if (type === 'video' && metadata.videoCodec) {
			parts.push(metadata.videoCodec);
		}

		if (metadata.audioCodec) {
			parts.push(metadata.audioCodec);
		}

		if (metadata.width !== null && metadata.height !== null) {
			parts.push(`${metadata.width}x${metadata.height}`);
		}

		parts.push(formatMediaDuration(metadata.duration));

		return parts.join(' · ');
	}, [imageDimensions, metadata, type]);

	return (
		<div style={containerStyle}>
			<div
				style={fileNameStyle}
				title={linkInfo ? linkInfo.title : fileName}
				onClick={linkInfo ? onClick : undefined}
				onPointerEnter={linkInfo ? onPointerEnter : undefined}
				onPointerLeave={linkInfo ? onPointerLeave : undefined}
			>
				{fileName}
			</div>
			{detailsLine ? (
				<div style={lineStyle} title={detailsLine}>
					{detailsLine}
				</div>
			) : null}
		</div>
	);
};
