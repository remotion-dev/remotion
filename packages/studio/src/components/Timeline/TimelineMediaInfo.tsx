import React, {useCallback, useMemo, useState} from 'react';
import {Internals} from 'remotion';
import {LIGHT_TEXT, VERY_LIGHT_TEXT} from '../../helpers/colors';
import {useSelectAsset} from '../use-select-asset';
import {
	getTimelineAssetLinkInfo,
	openTimelineAssetLink,
} from './timeline-asset-link';
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

const useAssetLink = (src: string) => {
	const selectAsset = useSelectAsset();
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

			openTimelineAssetLink(linkInfo, selectAsset);
		},
		[linkInfo, selectAsset],
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
